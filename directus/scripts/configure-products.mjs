// Make the products collection safe for non-technical CRUD.
//
//   cd directus
//   DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/configure-products.mjs
//   node scripts/configure-products.mjs --dry-run
//
// Idempotent. What this sets up and why each one matters:
//
//   Archive        status already has an "archived" value, but unarchive_value
//                  was null, so the Archive button was one-way — an archived
//                  product could not be brought back from the UI.
//
//   Unique slug    Directus's "Save as Copy" duplicates every field, slug
//                  included. Two products sharing a slug means two pages
//                  competing for one URL, which is the worst outcome an SEO
//                  build can produce. A database constraint makes it impossible
//                  rather than merely discouraged, so the editor is told at save
//                  time instead of the damage appearing in a sitemap later.
//
//   Unique SKU     Same reasoning for order lines and fulfilment.
//
//   Image alt      Alt text belongs on the USE of an image, not the file: the
//                  same photo on a canopy page and a banner page needs
//                  different alt text. It lives on the junction row, next to
//                  the sort order, so it travels with the ordering.
//
//   Gallery sort   Drag-and-drop ordering needs the junction's sort field
//                  declared on the relation, or the interface reorders visually
//                  and forgets on reload.

const URL_BASE = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const DRY = process.argv.includes('--dry-run');

if (!ADMIN) {
  console.error('✗ DIRECTUS_ADMIN_TOKEN is required.');
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${ADMIN}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { ok: res.ok, status: res.status, body };
}

const say = (m) => console.log(`  ${DRY ? '~' : '✓'} ${m}`);
const fail = (m, r) => console.error(`  ! ${m}: ${JSON.stringify(r.body?.errors || r.body).slice(0, 200)}`);

// ---- archive round trip -----------------------------------------------------
{
  const c = await api('/collections/products');
  const meta = c.body?.data?.meta || {};
  if (meta.unarchive_value === 'draft') {
    console.log('  · archive round trip already configured');
  } else if (DRY) {
    say(`archive: unarchive_value ${JSON.stringify(meta.unarchive_value)} -> "draft"`);
  } else {
    const r = await api('/collections/products', {
      method: 'PATCH',
      body: JSON.stringify({ meta: { archive_field: 'status', archive_value: 'archived', unarchive_value: 'draft' } })
    });
    if (r.ok) say('archive: unarchiving now returns a product to draft, not straight to live');
    else fail('archive config', r);
  }
}

// ---- uniqueness where a collision is destructive ---------------------------
for (const field of ['slug', 'sku']) {
  const f = await api(`/fields/products/${field}`);
  if (f.body?.data?.schema?.is_unique) {
    console.log(`  · ${field} already unique`);
    continue;
  }
  if (DRY) { say(`${field}: add a unique constraint`); continue; }
  const r = await api(`/fields/products/${field}`, {
    method: 'PATCH',
    body: JSON.stringify({ schema: { is_unique: true } })
  });
  if (r.ok) say(`${field}: unique — a duplicated product must be given its own ${field} before it can be saved`);
  else fail(`${field} unique`, r);
}

// ---- per-image alt text on the gallery junction -----------------------------
{
  const existing = await api('/fields/products_files/alt');
  if (existing.ok) {
    console.log('  · gallery alt text field already present');
  } else if (DRY) {
    say('products_files.alt: add per-image alt text');
  } else {
    const r = await api('/fields/products_files', {
      method: 'POST',
      body: JSON.stringify({
        field: 'alt',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Describes this image for screen readers and search. Say what is shown, not "product photo". The image audit fails a build on a missing alt.',
          options: { placeholder: 'e.g. 10x20 printed canopy tent at an outdoor trade show' }
        },
        schema: { is_nullable: true }
      })
    });
    if (r.ok) say('products_files.alt: per-image alt text, so one photo can be described differently where it is reused');
    else fail('alt field', r);
  }
}

// ---- drag-and-drop ordering -------------------------------------------------
{
  const rels = await api('/relations/products_files');
  const back = (rels.body?.data || []).find((r) => r.field === 'products_id');
  if (!back) {
    console.error('  ! no products_files -> products relation; run apply-schema.mjs first');
  } else if (back.meta?.sort_field === 'sort') {
    console.log('  · gallery drag-and-drop ordering already configured');
  } else if (DRY) {
    say('gallery: declare sort_field so drag-and-drop ordering persists');
  } else {
    const r = await api('/relations/products_files/products_id', {
      method: 'PATCH',
      body: JSON.stringify({ meta: { one_field: 'gallery', sort_field: 'sort', junction_field: 'directus_files_id' } })
    });
    if (r.ok) say('gallery: drag-and-drop order is saved rather than reset on reload');
    else fail('gallery sort', r);
  }
}

console.log(DRY ? '\n--dry-run: nothing changed.' : '\nProducts collection configured.');

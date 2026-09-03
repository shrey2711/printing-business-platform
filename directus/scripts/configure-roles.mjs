// The three roles, in the CMS.
//
//   cd directus
//   DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/configure-roles.mjs
//   node scripts/configure-roles.mjs --dry-run
//
// Super Admin      the built-in Administrator role. Everything, including
//                  settings, users and the data model.
//
// Content Manager  products, categories, pages, blogs, SEO, homepage blocks,
//                  navigation, banners and the file library. Can sign into the
//                  CMS. Cannot reach settings, users, roles, permissions, flows
//                  or extensions, and cannot touch product_pricing.
//
// Staff            orders only — and orders are NOT in Directus. They live in
//                  the storefront's own admin, backed by Supabase, because that
//                  is where payment, fulfilment and customer records already
//                  are. So the Staff role here is created WITHOUT CMS access:
//                  giving order staff a CMS login that shows them nothing would
//                  be an account to phish for no benefit.
//
// Two things are deliberately withheld from Content Manager:
//
//   product_pricing — what a customer is charged. Price changes go through the
//   validated path in backend/lib/pricingFromCms.js, which re-prices every
//   selection and records an audit entry. A CMS field editing prices directly
//   would bypass all of that.
//
//   Settings and the data model — a person who can edit collections can delete
//   a field and take its data with it. That is a developer action, not a
//   content one.

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

// Everything a content manager edits. product_pricing is absent on purpose.
const CONTENT_COLLECTIONS = [
  'products', 'products_files', 'categories', 'pages', 'blogs',
  'home_hero', 'home_featured_categories', 'home_why_choose_us', 'home_cta_banner',
  'testimonials', 'navigation', 'promo_banners', 'seo_overrides', 'redirects', 'coupons',
  'directus_files', 'directus_folders'
];

// Never grantable to anything but Super Admin. Checked after the fact rather
// than merely omitted, so a permission added by hand later is still caught.
const FORBIDDEN = [
  'directus_settings', 'directus_users', 'directus_roles', 'directus_policies',
  'directus_permissions', 'directus_flows', 'directus_operations', 'directus_extensions',
  'directus_collections', 'directus_fields', 'directus_relations', 'product_pricing'
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

async function findByName(collection, name) {
  const res = await api(`/${collection}?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`);
  return res.body?.data?.[0] || null;
}

async function ensurePolicy(name, config) {
  const found = await findByName('policies', name);
  if (found) { console.log(`· policy "${name}" exists`); return found; }
  if (DRY) { console.log(`~ would create policy "${name}"`); return null; }
  const res = await api('/policies', { method: 'POST', body: JSON.stringify({ name, ...config }) });
  if (!res.ok) { console.error(`✗ policy "${name}": ${JSON.stringify(res.body?.errors || res.body).slice(0, 200)}`); return null; }
  console.log(`✓ created policy "${name}"`);
  return res.body.data;
}

async function ensureRole(name, policy, description) {
  const found = await findByName('roles', name);
  if (found) { console.log(`· role "${name}" exists`); return found; }
  if (DRY) { console.log(`~ would create role "${name}"`); return null; }
  const body = { name, description };
  if (policy?.id) body.policies = [{ policy: policy.id }];
  const res = await api('/roles', { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) { console.error(`✗ role "${name}": ${JSON.stringify(res.body?.errors || res.body).slice(0, 200)}`); return null; }
  console.log(`✓ created role "${name}"`);
  return res.body.data;
}

// ---------------------------------------------------------- Content Manager --
const cm = await ensurePolicy('Content Manager', {
  icon: 'edit_note',
  description: 'Products, pages, blogs and SEO. No settings, no users, no pricing.',
  app_access: true,
  admin_access: false,
  enforce_tfa: false
});

if (cm) {
  const existing = await api(`/permissions?filter[policy][_eq]=${cm.id}&limit=-1`);
  const have = new Set((existing.body?.data || []).map((p) => `${p.collection}:${p.action}`));
  let added = 0;

  for (const collection of CONTENT_COLLECTIONS) {
    for (const action of ACTIONS) {
      if (have.has(`${collection}:${action}`)) continue;
      if (DRY) { added++; continue; }
      const res = await api('/permissions', {
        method: 'POST',
        body: JSON.stringify({ policy: cm.id, collection, action, fields: ['*'], permissions: {}, validation: {} })
      });
      if (res.ok) added++;
      else console.error(`  ! ${collection}:${action}: ${JSON.stringify(res.body?.errors || res.body).slice(0, 140)}`);
    }
  }
  console.log(`${DRY ? '~' : '✓'} Content Manager: ${added} permission(s) ${DRY ? 'would be ' : ''}added across ${CONTENT_COLLECTIONS.length} collections`);
}

// ------------------------------------------------------------------- Staff --
// No CMS access at all: orders are in the storefront admin. The role exists so
// the separation is visible here rather than implied by absence.
const staff = await ensurePolicy('Staff (orders)', {
  icon: 'receipt_long',
  description: 'Orders only, in the storefront admin. Deliberately has NO access to the CMS.',
  app_access: false,
  admin_access: false,
  enforce_tfa: false
});

await ensureRole('Content Manager', cm, 'Edits site content. Cannot change settings, users or prices.');
await ensureRole('Staff', staff, 'Handles orders in the storefront admin. No CMS access.');

// ------------------------------------------------------------- verification --
// Assert the restriction rather than trusting that it was never granted.
let clean = true;
for (const [label, policy] of [['Content Manager', cm], ['Staff (orders)', staff]]) {
  if (!policy) continue;

  const fresh = await api(`/policies/${policy.id}?fields=admin_access,app_access`);
  if (fresh.body?.data?.admin_access) {
    console.error(`✗ "${label}" has admin access — that is Super Admin's alone.`);
    clean = false;
  }

  const perms = await api(`/permissions?filter[policy][_eq]=${policy.id}&limit=-1&fields=collection,action`);
  const rows = perms.body?.data || [];
  const bad = rows.filter((p) => FORBIDDEN.includes(p.collection));
  if (bad.length) {
    console.error(`✗ "${label}" can reach restricted collections: ${bad.map((b) => `${b.collection}:${b.action}`).join(', ')}`);
    clean = false;
  }
  if (label === 'Staff (orders)' && rows.length) {
    console.error(`✗ "Staff (orders)" has ${rows.length} CMS permission(s); it should have none.`);
    clean = false;
  }
}

if (clean) {
  console.log('\n✓ verified: neither role can WRITE settings, users, roles, permissions, the data model or product_pricing.');
  // What a Content Manager can still READ, confirmed against a real account:
  //   /users    -> their own record only, which the account menu needs
  //   /settings -> read-only project branding; PATCH is refused, and no
  //                credential appears there (storage keys are environment vars)
  // Both are how the admin app renders itself; neither is worth closing.
  console.log('  They can read their own user record and project branding — the CMS needs that to render.');
  console.log('  Assign people in Directus under User Directory. Order staff belong in the storefront admin instead.');
}
process.exit(clean ? 0 : 1);

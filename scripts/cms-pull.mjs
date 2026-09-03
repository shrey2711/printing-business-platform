// Pull published homepage/footer content out of Directus and into the
// `content_overrides` table the site already reads.
//
// Why through content_overrides rather than a runtime fetch from Directus:
// the homepage is prerendered, and a crawler must see the edited copy. The
// prerenderer (scripts/prerender.mjs) and the React app (ContentContext, via
// /api/content) both already resolve that table against the defaults in
// src/data/content.js, so writing here makes one edit reach both.
//
//   node scripts/cms-pull.mjs            # sync
//   node scripts/cms-pull.mjs --dry-run  # show what would change, write nothing
//
// Safety rules, in order of importance:
//   1. A CMS outage never blanks the site. If Directus is unreachable, nothing
//      is written and the previous values stand.
//   2. Only keys declared in src/data/content.js are written. An unexpected
//      Directus field cannot invent a new content key.
//   3. An empty Directus field DELETES the override rather than storing "",
//      so the shipped default comes back instead of a blank page.
//   4. Testimonials sync only when they carry a real name and review text —
//      the no-invented-social-proof rule in src/data/socialProof.js.

import { createClient } from '@supabase/supabase-js';
import { CONTENT_FIELDS } from '../src/data/content.js';

const DRY = process.argv.includes('--dry-run');
const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

const KNOWN_KEYS = new Set(CONTENT_FIELDS.map((f) => f.key));

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

const asset = (id) => (id ? `${DIRECTUS_URL}/assets/${id}` : '');
const trim = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : v);

async function get(path) {
  const res = await fetch(`${DIRECTUS_URL}/items/${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()).data;
}

const PUBLISHED = 'filter[status][_eq]=published&limit=-1&sort=sort';

/** Map Directus records onto content keys. Returns { key: value }. */
export function mapToContentKeys(d) {
  const out = {};
  const set = (key, value) => { out[key] = value; };

  const hero = d.hero || {};
  set('home.hero.title', trim(hero.headline));
  set('home.hero.subtitle', trim(hero.subheadline));
  set('home.hero.cta.label', trim(hero.button_text));
  set('home.hero.cta.href', trim(hero.button_link));
  set('home.hero.image', hero.background_image ? asset(hero.background_image) : '');

  // Promo strip: the first live banner placed site-wide or on the home hero.
  // A banner outside its date window is treated as absent.
  const now = Date.now();
  const live = (d.promos || []).find((b) => {
    if (!['site_wide', 'home_hero'].includes(b.placement)) return false;
    if (b.starts_at && new Date(b.starts_at).getTime() > now) return false;
    if (b.ends_at && new Date(b.ends_at).getTime() < now) return false;
    return Boolean(trim(b.message));
  });
  set('home.promo.message', live ? trim(live.message) : '');
  set('home.promo.href', live ? trim(live.link) : '');
  set('home.promo.cta', live ? trim(live.cta_label) : '');

  const cats = (d.featured || [])
    .filter((c) => trim(c.title) && trim(c.link))
    .map((c) => ({ title: trim(c.title), to: trim(c.link), img: c.image ? asset(c.image) : '' }));
  if (cats.length) set('home.featured.items', cats);

  const why = (d.why || [])
    .filter((w) => trim(w.title) && trim(w.description))
    .map((w) => ({ icon: trim(w.icon), title: trim(w.title), description: trim(w.description) }));
  if (why.length) set('home.why.items', why);

  // Real reviews only: a row without both a name and review text is dropped
  // rather than rendered as an anonymous quote.
  const reviews = (d.testimonials || [])
    .filter((t) => trim(t.name) && trim(t.review))
    .map((t) => ({ name: trim(t.name), company: trim(t.company), review: trim(t.review) }));
  set('home.reviews.items', reviews);

  const cta = d.cta || {};
  set('home.cta.main', trim(cta.headline));
  set('home.cta.sub', trim(cta.description));

  const s = d.settings || {};
  set('footer.blurb', trim(s.footer_blurb));
  set('footer.phone', trim(s.brand_phone));
  set('footer.email', trim(s.brand_email));

  return out;
}

/** Split mapped values into upserts and deletes, dropping unknown keys. */
export function planWrites(mapped) {
  const writes = [];
  const deletes = [];
  for (const [key, value] of Object.entries(mapped)) {
    if (!KNOWN_KEYS.has(key)) continue;                       // rule 2
    const empty = value === '' || (Array.isArray(value) && !value.length);
    if (empty) deletes.push(key);                             // rule 3
    else writes.push({ key, value });
  }
  return { writes, deletes };
}

const main = async () => {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    console.log('DIRECTUS_URL / DIRECTUS_TOKEN not set — skipping CMS pull, existing content stands.');
    return;
  }

  let d;
  try {
    const [hero, featured, why, testimonials, cta, promos, settings] = await Promise.all([
      get('home_hero'),
      get(`home_featured_categories?${PUBLISHED}`),
      get(`home_why_choose_us?${PUBLISHED}`),
      get(`testimonials?${PUBLISHED}`),
      get('home_cta_banner'),
      get(`promo_banners?${PUBLISHED}`),
      get('site_settings')
    ]);
    d = { hero, featured, why, testimonials, cta, promos, settings };
  } catch (e) {
    // Rule 1: an outage must not blank the site.
    console.warn(`[cms-pull] Directus unreachable (${e.message}) — keeping existing content unchanged.`);
    return;
  }

  const { writes, deletes } = planWrites(mapToContentKeys(d));

  console.log(`${writes.length} value(s) to set, ${deletes.length} to clear back to the shipped default.`);
  writes.forEach((w) => console.log(`  set    ${w.key}`));
  deletes.forEach((k) => console.log(`  clear  ${k}`));

  if (DRY) { console.log('--dry-run: nothing written.'); return; }
  if (!supabase) { console.warn('[cms-pull] Supabase service credentials missing — nothing written.'); return; }

  if (writes.length) {
    const { error } = await supabase.from('content_overrides').upsert(
      writes.map((w) => ({ key: w.key, value: w.value, updated_at: new Date().toISOString() })),
      { onConflict: 'key' }
    );
    if (error) { console.error(`✗ cms-pull write failed: ${error.message}`); process.exit(1); }
  }
  if (deletes.length) {
    const { error } = await supabase.from('content_overrides').delete().in('key', deletes);
    if (error) { console.error(`✗ cms-pull clear failed: ${error.message}`); process.exit(1); }
  }
  console.log('✓ homepage and footer content synced from Directus.');
};

// Only run when invoked directly. Matched on the full filename so that
// importing this module from test-cms-pull.mjs does not trigger a sync.
if (process.argv[1] && /[\\/]cms-pull\.mjs$/.test(process.argv[1])) main();

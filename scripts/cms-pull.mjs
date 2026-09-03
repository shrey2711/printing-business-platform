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

// Resolve the same way scripts/buildData.mjs does. It accepts VITE_SUPABASE_URL
// as a fallback, and a deployment that only sets the VITE_-prefixed name (which
// the frontend requires) left this client null — so the sync read Directus,
// planned the writes, and silently wrote nothing.
//
// The SERVICE ROLE key has no fallback on purpose: content_overrides is written
// here, and the anon key cannot do it. Missing it is a configuration error, not
// a reason to degrade.
const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  SUPA_URL && SUPA_KEY
    ? createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } })
    : null;

const asset = (id) => (id ? `${DIRECTUS_URL}/assets/${id}` : '');
const trim = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : v);

// An authentication failure is NOT an outage. A wrong or expired token will
// never recover on its own, so treating it like a temporary blip means every
// future build silently ships stale content. Marked so the caller can fail the
// deploy instead of degrading.
class AuthError extends Error {}

async function get(path) {
  const res = await fetch(`${DIRECTUS_URL}/items/${path}`, {
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
  });
  if (res.status === 401 || res.status === 403) {
    throw new AuthError(`Directus rejected the token (HTTP ${res.status} on ${path.split('?')[0]})`);
  }
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()).data;
}

const PUBLISHED = 'filter[status][_eq]=published&limit=-1&sort=sort';
// seo_overrides has no sort field, and Directus answers 403 — not 400 — when
// asked to sort by a field that is not there, which reads exactly like a
// permissions problem.
const PUBLISHED_UNSORTED = 'filter[status][_eq]=published&limit=-1';

/** Map Directus records onto content keys. Returns { key: value }. */
export function mapToContentKeys(d) {
  // Directus records width and height when a file is uploaded. Carrying them
  // through means the hero renders with real dimensions instead of reflowing
  // the page when the image arrives.
  const heroFile = d.heroFile || null;
  const out = {};
  const set = (key, value) => { out[key] = value; };

  const hero = d.hero || {};
  set('home.hero.title', trim(hero.headline));
  set('home.hero.subtitle', trim(hero.subheadline));
  set('home.hero.cta.label', trim(hero.button_text));
  set('home.hero.cta.href', trim(hero.button_link));
  set('home.hero.image', hero.background_image ? asset(hero.background_image) : '');
  // Alt text is its own field on home_hero rather than the file's Title, so an
  // image reused elsewhere can still be described for its use in the hero.
  set('home.hero.imageAlt', trim(hero.background_image_alt) || trim(heroFile?.title));
  set('home.hero.imageWidth', heroFile?.width ? String(heroFile.width) : '');
  set('home.hero.imageHeight', heroFile?.height ? String(heroFile.height) : '');

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
  set('home.cta.label', trim(cta.button_text));
  set('home.cta.href', trim(cta.button_link));

  const s = d.settings || {};
  set('footer.blurb', trim(s.footer_blurb));
  set('footer.phone', trim(s.brand_phone));
  set('footer.email', trim(s.brand_email));

  // Social links: both a label and a URL, or the row is dropped rather than
  // rendering a link that goes nowhere.
  const social = (Array.isArray(s.social_links) ? s.social_links : [])
    .filter((l) => trim(l.label) && trim(l.url))
    .map((l) => ({ label: trim(l.label), url: trim(l.url) }));
  set('footer.social', social);

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

// A build running on a deployment host is a different situation from a build on
// a laptop: there, a missing or local Directus URL is a MISCONFIGURATION, not an
// absence. Skipping quietly would ship a deploy whose editors believe their
// changes are live. Rule 1 still holds for a genuine outage — that is handled
// further down, where an unreachable CMS leaves existing content alone.
const IS_CI = Boolean(process.env.VERCEL || process.env.CI);
const isLocal = (url) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);

// Has this site ever synced from a CMS? If content_overrides already holds keys
// this script manages, Directus IS in use, and losing its configuration is a
// regression that must stop the build. If it holds none, the CMS simply has not
// been adopted yet and the build should proceed on the shipped defaults.
async function cmsAlreadyInUse() {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('content_overrides')
    .select('key')
    .in('key', [...KNOWN_KEYS])
    .limit(1);
  if (error) return false;   // cannot tell -> do not block the deploy
  return Boolean(data?.length);
}

const main = async () => {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    const half = Boolean(DIRECTUS_URL) !== Boolean(DIRECTUS_TOKEN);
    if (IS_CI && half) {
      // One without the other is always a mistake, never a deliberate state.
      console.error(`✗ Only ${DIRECTUS_URL ? 'DIRECTUS_URL' : 'DIRECTUS_TOKEN'} is set. Both are required.`);
      process.exit(1);
    }
    if (IS_CI && (await cmsAlreadyInUse())) {
      console.error('✗ DIRECTUS_URL / DIRECTUS_TOKEN are missing, but this site has CMS-managed content.');
      console.error('  Building now would freeze that content at its last synced value and hide every later edit.');
      console.error('  Restore both variables in the deployment environment.');
      process.exit(1);
    }
    console.log('DIRECTUS_URL / DIRECTUS_TOKEN not set — skipping CMS pull, existing content stands.');
    return;
  }

  if (isLocal(DIRECTUS_URL) && IS_CI) {
    console.error(`✗ DIRECTUS_URL is ${DIRECTUS_URL} — a deployment host cannot reach a local address.`);
    console.error('  Point it at the public Directus instance. See directus/DEPLOY.md.');
    process.exit(1);
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

    // One extra read, only when a hero image is actually set.
    if (hero?.background_image) {
      try {
        const res = await fetch(`${DIRECTUS_URL}/files/${hero.background_image}?fields=width,height,title`, {
          headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` }
        });
        if (res.ok) d.heroFile = (await res.json()).data;
      } catch {
        // Dimensions are an optimisation; failing to read them must not stop a
        // content sync that is otherwise fine.
      }
    }
  } catch (e) {
    if (e instanceof AuthError) {
      console.error(`✗ ${e.message}`);
      console.error('  DIRECTUS_TOKEN is wrong, expired, or was pasted with the "DIRECTUS_TOKEN=" prefix or a stray');
      console.error('  newline. Copy only the value. Regenerate it with directus/scripts/create-sync-token.mjs.');
      if (IS_CI) process.exitCode = 1;
      return;
    }
    // Rule 1: a genuine outage must not blank the site or fail a deploy.
    console.warn(`[cms-pull] Directus unreachable (${e.message}) — keeping existing content unchanged.`);
    return;
  }

  const { writes, deletes } = planWrites(mapToContentKeys(d));

  console.log(`${writes.length} value(s) to set, ${deletes.length} to clear back to the shipped default.`);
  writes.forEach((w) => console.log(`  set    ${w.key}`));
  deletes.forEach((k) => console.log(`  clear  ${k}`));

  if (DRY) { console.log('--dry-run: nothing written.'); return; }

  if (!supabase) {
    const detail = !SUPA_URL ? 'SUPABASE_URL (or VITE_SUPABASE_URL) is missing' : 'SUPABASE_SERVICE_ROLE_KEY is missing';
    // Directus answered and there is content to publish, so writing nothing is
    // a failure, not a degradation: the edit would be lost without a trace.
    if (IS_CI && (writes.length || deletes.length)) {
      console.error(`✗ ${detail}, so ${writes.length + deletes.length} content change(s) from Directus cannot be written.`);
      console.error('  The build would publish stale content while the CMS shows the edit as live.');
      process.exit(1);
    }
    console.warn(`[cms-pull] ${detail} — nothing written.`);
    return;
  }

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
  // Per-URL SEO overrides are NOT synced here. Directus manages
  // public.seo_overrides directly — the same table the prerenderer reads — so an
  // edit is already where the build needs it. Copying Directus's columns onto
  // the dashboard's would blank a dashboard-set value whenever the matching
  // Directus field was empty, since both editors share one row.

  console.log('✓ homepage and footer content synced from Directus.');
};

// Only run when invoked directly. Matched on the full filename so that
// importing this module from test-cms-pull.mjs does not trigger a sync.
if (process.argv[1] && /[\\/]cms-pull\.mjs$/.test(process.argv[1])) main();

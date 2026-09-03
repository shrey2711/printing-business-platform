// Verify a deployed Directus instance before the storefront depends on it.
//
//   node scripts/check-directus-remote.mjs https://cms.example.com
//   DIRECTUS_TOKEN=xxx node scripts/check-directus-remote.mjs https://cms.example.com
//
// Falls back to DIRECTUS_URL when no argument is given. Read-only: it writes
// nothing, and the one write it attempts is expected to be REFUSED.
//
// What it is actually checking for is the set of things that look fine in a
// browser and still break the build or leak access:
//   - HTTPS, because the build sends a token on every request
//   - the content model actually applied to THIS instance, not just locally
//   - the build token being read-only, verified by trying to write with it
//   - CORS allowing the storefront origin
//   - files served from durable storage rather than container disk

const ORIGIN = 'https://www.apextradeshow.com';

const raw = process.argv[2] || process.env.DIRECTUS_URL || '';
const BASE = raw.replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_TOKEN || '';

if (!BASE) {
  console.error('✗ Usage: node scripts/check-directus-remote.mjs https://<directus host>');
  process.exit(1);
}

const EXPECTED = [
  'categories', 'products', 'product_pricing', 'pages',
  'home_hero', 'home_featured_categories', 'home_why_choose_us',
  'testimonials', 'home_cta_banner', 'navigation', 'blogs',
  'redirects', 'coupons', 'seo_overrides', 'promo_banners', 'site_settings'
];

const problems = [];
const warnings = [];
const ok = (m) => console.log(`✓ ${m}`);
const bad = (m) => { problems.push(m); console.log(`✗ ${m}`); };
const warn = (m) => { warnings.push(m); console.log(`! ${m}`); };

const get = (path, token = TOKEN) =>
  fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

// --- reachable and encrypted ------------------------------------------------
if (!/^https:/i.test(BASE)) {
  if (/^http:\/\/(localhost|127\.0\.0\.1)/i.test(BASE)) {
    warn(`${BASE} is a local address — fine for testing, but a deployment host cannot reach it.`);
  } else {
    bad(`${BASE} is plain HTTP. The build sends a token on every request; use HTTPS.`);
  }
}

try {
  const r = await fetch(`${BASE}/server/ping`, { signal: AbortSignal.timeout(15000) });
  const body = (await r.text()).trim();
  if (r.ok && body === 'pong') ok(`reachable at ${BASE}`);
  else bad(`/server/ping returned ${r.status} "${body.slice(0, 40)}" — expected 200 pong`);
} catch (e) {
  bad(`cannot reach ${BASE}: ${e.message}`);
  console.error('\nNothing else can be checked until it responds.');
  process.exit(1);
}

// --- the content model is on THIS instance ----------------------------------
if (!TOKEN) {
  warn('DIRECTUS_TOKEN not set — skipping the collection, permission and CORS checks.');
} else {
  // Probe the item endpoints the build actually calls, not /collections —
  // that is schema metadata and needs a permission the build has no use for.
  const missing = [];
  const forbidden = [];
  for (const c of EXPECTED) {
    const r = await get(`/items/${c}?limit=1`);
    if (r.status === 403) forbidden.push(c);
    else if (r.status === 404) missing.push(c);
    else if (!r.ok) forbidden.push(`${c} (HTTP ${r.status})`);
  }
  if (missing.length) bad(`${missing.length} collection(s) missing here: ${missing.join(', ')} — run directus/scripts/apply-schema.mjs against this instance`);
  if (forbidden.length) bad(`the token cannot read: ${forbidden.join(', ')} — re-run directus/scripts/create-sync-token.mjs`);
  if (!missing.length && !forbidden.length) ok(`all ${EXPECTED.length} collections present and readable by this token`);

  // --- the build token must be read-only ------------------------------------
  // Attempt a real write. A 403 is the pass condition; success is a serious
  // finding, because this token lives in a build environment.
  const w = await fetch(`${BASE}/items/home_hero`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ headline: '__readonly_probe__' })
  });
  if (w.status === 403) ok('the token is read-only (a write attempt was refused)');
  else if (w.ok) bad('THE TOKEN CAN WRITE. This is an admin or write-capable token — replace it with the read-only build token immediately, and rotate this one.');
  else warn(`write probe returned ${w.status} — expected 403; check what this token can do`);

  const u = await get('/users?limit=1');
  if (u.status === 403) ok('the token cannot read user accounts');
  else if (u.ok) warn('the token can read user accounts — wider than the build needs');
}

// --- CORS -------------------------------------------------------------------
try {
  const r = await fetch(`${BASE}/server/ping`, { headers: { Origin: ORIGIN } });
  const allow = r.headers.get('access-control-allow-origin');
  if (!allow) warn(`no Access-Control-Allow-Origin for ${ORIGIN}. The build works server-side regardless; only browser calls need this.`);
  else if (allow === '*') warn('CORS allows any origin (*). Narrow CORS_ORIGIN to the storefront domain.');
  else if (allow.includes('apextradeshow.com')) ok(`CORS allows ${allow}`);
  else warn(`CORS allows "${allow}", which does not include the storefront.`);
} catch { warn('could not check CORS'); }

// --- storage durability -----------------------------------------------------
if (TOKEN) {
  const r = await get('/files?limit=1&fields=storage');
  if (r.ok) {
    const rows = (await r.json()).data || [];
    if (!rows.length) {
      warn('no files uploaded yet — set S3 storage BEFORE editors upload, or their images vanish on the next redeploy (see directus/DEPLOY.md).');
    } else if (rows[0].storage === 'local') {
      bad('files are on "local" storage. On a container host every redeploy deletes them while the pages referencing them remain. Switch to S3/Supabase Storage.');
    } else {
      ok(`files are on "${rows[0].storage}" storage`);
    }
  }
}

// --- verdict ----------------------------------------------------------------
console.log('');
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) must be fixed before the storefront depends on this instance.`);
  if (warnings.length) console.error(`  (plus ${warnings.length} warning(s) above)`);
  process.exit(1);
}
if (warnings.length) {
  console.log(`✓ usable, with ${warnings.length} warning(s) above.`);
} else {
  console.log('✓ ready. Set DIRECTUS_URL and DIRECTUS_TOKEN in Vercel, then redeploy.');
}

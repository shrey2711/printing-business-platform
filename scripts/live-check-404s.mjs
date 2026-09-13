// Live check: unknown URLs must 404, real files must not.
//
// scripts/test-middleware.mjs proves the middleware's decision. It cannot prove
// that Vercel actually routes a request to the middleware, because that is the
// `config.matcher` — and the matcher was the bug: it excluded every path ending
// in a file extension, so an unknown /page.html skipped the middleware entirely
// and the SPA rewrite answered 200 with the homepage.
//
// So this half has to be checked against a deploy.
//
//   node scripts/live-check-404s.mjs [origin]
import { STATIC_FILES } from '../src/generated/routes.js';

const BASE = (process.argv[2] || 'https://www.apextradeshow.com').replace(/\/$/, '');

// Paths that must NOT exist. The .html and .php shapes matter most: this domain
// was an affiliate site before Apex, and those URLs are still in search indexes.
const MUST_404 = [
  '/spam-page.html',
  '/nonexistent.php',
  '/brian-flatt-3-week-diet-system-pdf.html',
  '/not-a-real-sitemap.xml',
  '/google1234567890abcdef.html',
  '/logo.png',
  '/no-such-route',
  '/products/no-such-product'
];

// Everything the build actually emits at the root, plus a page and an asset.
const MUST_200 = [...STATIC_FILES, '/', '/custom-canopy-tents-los-angeles', '/products'];

const fails = [];
const get = async (path) => {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const body = res.status === 200 ? await res.text() : '';
  // Vercel's firewall denies some probe extensions (.php) at the edge, before
  // the middleware runs. That is a 403 rather than a 404, and it is fine for
  // this purpose: it is not a soft 404, and Google drops a 403 from the index.
  // Accepted only when Vercel says it did it — a 403 from our own code would
  // still be a failure.
  return {
    status: res.status,
    bytes: body.length,
    body,
    mitigated: (res.headers.get('x-vercel-mitigated') || '') !== ''
  };
};

console.log(`Checking ${BASE}\n`);

console.log('Must 404:');
for (const path of MUST_404) {
  const r = await get(path);
  const soft = r.status === 200 && /Trade Show Displays, Canopies/.test(r.body);
  const ok = r.status === 404 || (r.status === 403 && r.mitigated);
  const note = soft ? '   <-- SOFT 404: served the homepage'
    : (r.status === 403 && r.mitigated) ? '   (blocked by the Vercel firewall, never reaches the app)'
    : '';
  console.log(`  ${String(r.status).padEnd(4)} ${path}${note}`);
  if (!ok) {
    fails.push(`${path} returned ${r.status}${soft ? ' with the homepage body — a soft 404' : ''}`);
  }
}

console.log('\nMust be served:');
for (const path of MUST_200) {
  const r = await get(path);
  console.log(`  ${String(r.status).padEnd(4)} ${path}`);
  if (r.status !== 200) fails.push(`${path} returned ${r.status} — this is a real file or page`);
}

if (fails.length) {
  console.error(`\n✗ LIVE 404 CHECK FAILED — ${fails.length}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `\n✓ LIVE 404s OK — ${MUST_404.length} unknown URLs return a real 404 (extension or not), ` +
  `and all ${MUST_200.length} real files and pages still return 200.`
);

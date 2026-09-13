// Tests for the edge middleware's routing decisions.
//
// Written after finding that every URL carrying a file extension answered HTTP
// 200 with the full homepage. The matcher excluded `.*\.[a-zA-Z0-9]+$` so real
// assets would skip the middleware, but that also meant an unknown /page.html
// never reached the 404 branch and fell through to the SPA rewrite.
//
// That is a soft 404, and it mattered on this domain specifically: it had a
// previous life as an affiliate site whose URLs ended in .html, so every one of
// those old spam URLs was answering 200 with Apex's homepage instead of telling
// Google they were gone.
//
// WHAT THIS CAN AND CANNOT PROVE. The bug was in `config.matcher`, not in the
// function — the function's 404 branch was always correct, it just never ran for
// these paths. Vercel applies the matcher, so only a live request can prove that
// half; `npm run check:404s` does it against the deploy.
//
// What this file guards is the dangerous side of the fix. Widening the matcher
// means real files now reach the middleware, and a gap in STATIC_FILES would
// 404 a sitemap or robots.txt — far worse than the soft 404 being fixed. It
// caught exactly that during development: the manifest was generated before the
// sitemaps were written, so all six of them plus feed.xml were missing from it.
//
// The middleware is a pure function of the Request, so this calls it directly —
// no network, and it runs in `npm test`.
//
// Run: node scripts/test-middleware.mjs

import middleware from '../middleware.js';
import { STATIC_FILES, KNOWN_ROUTES } from '../src/generated/routes.js';

const ORIGIN = 'https://www.apextradeshow.com';
const fails = [];
let ran = 0;

const call = (path, origin = ORIGIN) => middleware(new Request(origin + path));

const check = (name, fn) => {
  ran++;
  try {
    const problem = fn();
    if (problem) fails.push(`${name}: ${problem}`);
  } catch (e) {
    fails.push(`${name}: threw ${e.message}`);
  }
};

const expect404 = (path) => {
  const res = call(path);
  if (res === undefined) return `${path} passed through — the SPA rewrite would answer 200 with the homepage`;
  if (res.status !== 404) return `${path} returned ${res.status}, expected 404`;
  if (!/noindex/i.test(res.headers.get('x-robots-tag') || '')) return `${path} 404s without x-robots-tag: noindex`;
  return null;
};
const expectServed = (path) => {
  const res = call(path);
  if (res !== undefined) return `${path} was intercepted with ${res.status} — it is a real file and must be served`;
  return null;
};

// --- the defect this file exists for ----------------------------------------
check('an unknown .html path 404s', () => expect404('/spam-page.html'));
check('an unknown .php path 404s', () => expect404('/nonexistent.php'));
check('an old affiliate URL 404s', () => expect404('/ejaculation-trainer-alpha-package.html'));
check('an unknown .xml path 404s', () => expect404('/not-a-real-sitemap.xml'));
check('a fake verification file 404s', () => expect404('/google1234567890abcdef.html'));
check('a made-up asset path 404s', () => expect404('/logo.png'));

// --- and the things that must keep working ----------------------------------
check('every real root file is served', () => {
  const broken = [...STATIC_FILES].map(expectServed).filter(Boolean);
  return broken.length ? broken.join('; ') : null;
});
check('robots.txt is served', () => expectServed('/robots.txt'));
check('the sitemap index is served', () => expectServed('/sitemap.xml'));
check('the locations sitemap is served', () => expectServed('/sitemap-locations.xml'));
check('the merchant feed is served', () => expectServed('/feed.xml'));

check('the manifest is not empty', () => {
  if (STATIC_FILES.size === 0) return 'STATIC_FILES is empty — every root file would 404';
  for (const f of ['/robots.txt', '/sitemap.xml', '/favicon.png']) {
    if (!STATIC_FILES.has(f)) return `${f} is missing from STATIC_FILES`;
  }
  return null;
});

// --- unchanged behaviour ----------------------------------------------------
check('a known page is passed through', () => expectServed('/custom-canopy-tents-los-angeles'));
check('the homepage is passed through', () => expectServed('/'));
check('an unknown extensionless route still 404s', () => expect404('/no-such-route'));

check('a sample of real routes all pass through', () => {
  const sample = [...KNOWN_ROUTES].filter((r) => r !== '/').slice(0, 40);
  const broken = sample.map(expectServed).filter(Boolean);
  return broken.length ? `${broken.length} known route(s) intercepted, e.g. ${broken[0]}` : null;
});

check('redirects still win over the 404', () => {
  const res = call('/design');
  if (res === undefined) return '/design was not redirected';
  if (res.status !== 301) return `/design returned ${res.status}, expected 301`;
  const to = res.headers.get('location') || '';
  if (!to.endsWith('/artwork-guidelines')) return `/design redirected to ${to}`;
  return null;
});

check('non-www still redirects to www', () => {
  const res = call('/products', 'https://apextradeshow.com');
  if (res === undefined) return 'the apex domain was not redirected';
  if (res.status !== 301) return `returned ${res.status}, expected 301`;
  if (!(res.headers.get('location') || '').startsWith('https://www.apextradeshow.com/products')) {
    return `redirected to ${res.headers.get('location')}`;
  }
  return null;
});

check('a trailing slash resolves to the same decision', () => {
  const a = call('/custom-canopy-tents-los-angeles');
  const b = call('/custom-canopy-tents-los-angeles/');
  if ((a === undefined) !== (b === undefined)) return 'the trailing-slash form is treated differently';
  return null;
});

if (fails.length) {
  console.error(`\n✗ MIDDLEWARE FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ MIDDLEWARE OK — ${ran} assertions: unknown paths 404 whether or not they carry a file extension, ` +
  `all ${STATIC_FILES.size} real root files are still served, and redirects still take precedence.`
);

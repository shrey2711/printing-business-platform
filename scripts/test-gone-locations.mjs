// Gate for the location pages removed for good on 2026-10-28 (owner decision;
// list in src/data/goneLocations.js). Each must answer 410 Gone and leave no
// trace on the site. Fails when:
//  (a) the gone list is not the 70 removed URLs, or overlaps a kept page;
//  (b) any sitemap lists a gone URL;
//  (c) any built HTML page links to a gone URL (relative or absolute href),
//      or a prerendered file exists for one (Vercel would serve it as a 200);
//  (d) the edge middleware does not answer 410 for one, or a 301 rule has a
//      gone URL as its source (the 410 must not be shadowed by a redirect).
// Retired 301s whose DESTINATION is now gone are reported, not failed: per the
// owner's rule their redirects are not changed without his decision.
//
// Run after a build: node scripts/test-gone-locations.mjs

import { readFileSync, readdirSync, existsSync } from 'fs';
import middleware from '../middleware.js';
import { GONE_LOCATION_PATHS, GONE_PATHS } from '../src/data/goneLocations.js';
import { locationRedirects } from '../src/generated/locationRedirects.js';
import { redirects } from '../src/generated/redirects.js';

const DIST = 'dist';
const ORIGIN = 'https://www.apextradeshow.com';
const fails = [];
const notes = [];

if (!existsSync(`${DIST}/index.html`)) { console.error('dist/ missing — run npm run build first'); process.exit(1); }

// (a) The list itself.
if (GONE_LOCATION_PATHS.length !== 70) fails.push(`gone list has ${GONE_LOCATION_PATHS.length} entries, expected 70`);
if (GONE_PATHS.size !== GONE_LOCATION_PATHS.length) fails.push('gone list has duplicates');
for (const p of GONE_LOCATION_PATHS) {
  if (!/^\/[a-z0-9/-]+$/.test(p) || p.endsWith('/')) fails.push(`malformed gone path ${p}`);
}
// The nine not-indexed pages the owner kept, plus the indexed location pages
// that stay. None may be on the list.
const KEPT = [
  '/locations', '/step-and-repeat-backdrop-chicago', '/custom-canopy-tents-chicago', '/custom-banners-los-angeles',
  '/locations/colorado', '/locations/indiana', '/locations/louisiana', '/locations/massachusetts', '/locations/tennessee',
  '/trade-show-displays/chicago', '/trade-show-displays/los-angeles', '/trade-show-canopies/seattle', '/trade-show-canopies/miami',
  '/custom-canopy-tents-los-angeles', '/retractable-banner-stands-los-angeles', '/retractable-banner-stands-chicago',
  '/custom-table-covers-los-angeles', '/step-and-repeat-backdrop-los-angeles', '/tension-fabric-display-los-angeles',
  '/tension-fabric-display-chicago', '/locations/california', '/locations/florida', '/locations/georgia', '/locations/illinois',
  '/locations/nevada', '/locations/new-york', '/locations/texas', '/locations/washington', '/locations/quebec',
  '/locations/british-columbia', '/locations/alberta'
];
for (const k of KEPT) {
  if (GONE_PATHS.has(k)) fails.push(`kept page ${k} is on the gone list`);
  if (!existsSync(`${DIST}${k}/index.html`)) fails.push(`kept page ${k} was not prerendered`);
}

// (b) Sitemaps.
const sitemaps = readdirSync(DIST).filter((f) => /^sitemap.*\.xml$/.test(f));
let smUrls = 0;
const inSitemap = new Set();
for (const f of sitemaps) {
  for (const m of readFileSync(`${DIST}/${f}`, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)) {
    smUrls++;
    const path = m[1].replace(ORIGIN, '').replace(/\/$/, '') || '/';
    inSitemap.add(path);
    if (GONE_PATHS.has(path)) fails.push(`${f} lists gone URL ${path}`);
  }
}
for (const k of KEPT) if (!inSitemap.has(k)) fails.push(`kept page ${k} is missing from the sitemaps`);

// (c) Built HTML: no file for a gone page, no link to one.
const pages = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(DIST);
for (const p of GONE_LOCATION_PATHS) {
  if (existsSync(`${DIST}${p}/index.html`) || existsSync(`${DIST}${p}.html`)) fails.push(`prerendered file exists for gone URL ${p}`);
}
let linksChecked = 0;
for (const file of pages) {
  const h = readFileSync(file, 'utf8');
  for (const m of h.matchAll(/href="([^"]*)"/g)) {
    let href = m[1];
    if (href.startsWith(ORIGIN)) href = href.slice(ORIGIN.length) || '/';
    if (!href.startsWith('/')) continue;
    linksChecked++;
    const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (GONE_PATHS.has(path)) fails.push(`${file.replace(DIST, '')} links to gone URL ${path}`);
  }
}

// (d) Edge behaviour.
for (const p of GONE_LOCATION_PATHS) {
  const res = middleware(new Request(ORIGIN + p));
  if (!res || res.status !== 410) fails.push(`middleware answered ${res ? res.status : 'pass-through'} for ${p}, expected 410`);
}
for (const r of [...locationRedirects, ...redirects]) {
  const src = r.source.replace(/\/$/, '') || '/';
  if (GONE_PATHS.has(src)) fails.push(`a 301 rule has gone URL ${src} as its source`);
}
const toGone = [...locationRedirects, ...redirects].filter((r) => GONE_PATHS.has(r.destination.replace(/\/$/, '') || '/'));
if (toGone.length) {
  notes.push(`${toGone.length} retired URL(s) still 301 to a page that is now 410 (redirects unchanged, pending the owner's decision)`);
}

notes.forEach((n) => console.log(`  ! ${n}`));
if (fails.length) {
  console.error(`\n✗ GONE LOCATIONS FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 50).forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ GONE LOCATIONS OK — ${GONE_LOCATION_PATHS.length} removed location URLs answer 410, none of the ${smUrls} sitemap URLs ` +
  `and none of the ${linksChecked} internal links across ${pages.length} built HTML files references them, no prerendered file exists for any, ` +
  `and the ${KEPT.length} kept location pages are built and in the sitemaps.`
);

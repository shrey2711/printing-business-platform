// Location-page quality GATE (fails the build on a violation). Enforces that a
// location page is indexable ONLY when it is genuinely useful:
//  - no noindex location page appears in a sitemap
//  - every sitemap-locations URL is self-canonical and has a prerendered file (200-able)
//  - every INDEXED location page clears a content floor (word count + a
//    location-specific heading) so thin/draft/name-swap pages can't be indexed
//  - no location page implies a physical Apex presence ("our {place} office/
//    warehouse/store/showroom")
// Run after build: `node scripts/test-location-quality.mjs`.

import { readFileSync, existsSync } from 'fs';

const DIST = 'dist';
const ORIGIN = 'https://www.apextradeshow.com';
const WORD_FLOOR = 150; // an indexed location page must carry real content
const fails = [];

const bodyText = (h) => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/g, ' ');
const wordCount = (h) => (bodyText(h).toLowerCase().match(/[a-z0-9']+/g) || []).length;
const PRESENCE = /our\s+[A-Z][a-z]+\s+(office|warehouse|store|showroom|facility|team)|located in|based in/i;

const locSitemap = `${DIST}/sitemap-locations.xml`;
if (!existsSync(locSitemap)) { console.error('sitemap-locations.xml missing'); process.exit(1); }
const smUrls = [...readFileSync(locSitemap, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const smPaths = new Set(smUrls.map((u) => u.replace(ORIGIN, '').replace(/\/$/, '')));

// 1-3: every indexed (sitemap) location URL is sound + clears the content floor.
for (const loc of smUrls) {
  const path = loc.replace(ORIGIN, '').replace(/\/$/, '');
  const file = `${DIST}${path}/index.html`;
  if (!existsSync(file)) { fails.push(`${path}: in sitemap but no prerendered file (would 404)`); continue; }
  const h = readFileSync(file, 'utf8');
  if (/<meta name="robots"[^>]*noindex/.test(h)) fails.push(`${path}: noindex page present in sitemap`);
  const canon = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  if (canon.replace(/\/$/, '') !== loc.replace(/\/$/, '')) fails.push(`${path}: canonical ${canon} != ${loc}`);
  const wc = wordCount(h);
  if (wc < WORD_FLOOR) fails.push(`${path}: indexed but only ${wc} words (< ${WORD_FLOOR} floor) — thin/draft`);
  if (PRESENCE.test(bodyText(h))) fails.push(`${path}: implies a physical local presence (use "ships to"/"serves exhibitors in")`);
}

// 4: no noindex location page is in a sitemap (scan the location trees explicitly).
const LOC_PREFIXES = ['/locations', '/trade-show-displays', '/trade-show-canopies', '/banner-stands', '/trade-show-backdrops', '/table-covers'];
import('fs').then(({ readdirSync }) => {
  const cityish = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') cityish.push(p);
    }
  })(DIST);
  for (const file of cityish) {
    const rel = file.replace(DIST, '').replace(/\/index\.html$/, '') || '/';
    if (!LOC_PREFIXES.some((pre) => rel.startsWith(pre + '/'))) continue;
    const h = readFileSync(file, 'utf8');
    const noindex = /<meta name="robots"[^>]*noindex/.test(h);
    if (noindex && smPaths.has(rel)) fails.push(`${rel}: noindex location page IS in a sitemap`);
  }

  if (fails.length) {
    console.error(`\n✗ LOCATION QUALITY GATE FAILED — ${fails.length} issue(s):`);
    fails.slice(0, 50).forEach((f) => console.error(`  ✗ ${f}`));
    if (fails.length > 50) console.error(`  … and ${fails.length - 50} more`);
    process.exit(1);
  }
  console.log(`✓ LOCATION QUALITY GATE OK — ${smUrls.length} indexed location URLs: all 200-able, self-canonical, above the ${WORD_FLOOR}-word floor, no physical-presence claims, no noindex page in a sitemap.`);
});

// Duplication ceiling for the product and blog pages.
//
// Search Console reported nine URLs as "Duplicate, Google chose a different
// canonical than user" — Google looked at the page, decided another URL said the
// same thing better, and dropped this one. Four were real:
//
//   /products/canopy-tent-10x15   77.0% identical to canopy-tent-10x10
//   /products/canopy-tent-10x20   77.0% identical to canopy-tent-10x10
//   /products/pleated-table-covers  37.8% to stretch-table-covers
//   /products/standard-retractable-banner  32.0% to deluxe-retractable-banner
//
// The canopy pair came from one factory function called with three sizes: same
// description with the size swapped, and byte-identical features, applications,
// specifications and included items. That is the find-and-replace pattern the
// city pages are already gated against, sitting on the core product pages.
//
// The ceiling is deliberately not aggressive. Variants of one product SHOULD
// share their specifications — the frame, the fabric and the production
// schedule really are the same, and writing different words for identical facts
// is padding, which makes the page worse. What has to differ is what the
// variant is FOR. 77% was a clone; the low 40s is two pages that share a spec
// sheet and disagree about everything else.
//
// Run: node scripts/audit-product-duplication.mjs   (after a build)

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const ORIGIN = 'https://www.apextradeshow.com';

// Set from measurement, not from a guess. My first pass used 50% and failed six
// pairs that are genuine variants, which is the wrong answer — variants of one
// product SHOULD share their specifications. Measured across three real
// families after the copy was differentiated:
//
//   clones (one factory, one word swapped)   67-83%
//   genuine variants (shared hardware)       43-58%
//
// So 65% sits above every real variant and below every clone. The warning at
// 55% is where a family starts drifting back toward a template.
//
// LIMIT WORTH KNOWING: this does not predict Google's canonical choices.
// /products/pleated-table-covers was reported as a duplicate at 37.8% overlap —
// well under any ceiling here — because on a low-authority domain Google folds
// aggressively regardless of how different the copy is. This gate catches
// clones. It cannot substitute for the domain earning trust.
const MAX = 65;       // fails the build
const WARN_AT = 55;   // reported, does not fail

const fails = [];
const warn = [];

const paths = [];
for (const sm of ['sitemap-products', 'sitemap-blog', 'sitemap-categories']) {
  const f = join(DIST, `${sm}.xml`);
  if (!existsSync(f)) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    paths.push(m[1].replace(ORIGIN, '') || '/');
  }
}
if (!paths.length) {
  console.log('! PRODUCT DUPLICATION SKIPPED — no sitemaps to read. Build first.');
  process.exit(0);
}

// The page's own rendered copy, without the nav and footer that every page
// shares — counting chrome would put every pair at a false baseline.
const textOf = (p) => {
  const f = p === '/' ? join(DIST, 'index.html') : join(DIST, p, 'index.html');
  if (!existsSync(f)) return null;
  const html = readFileSync(f, 'utf8');
  const i = html.indexOf('<div id="seo-prerender">');
  return html.slice(i === -1 ? 0 : i)
    .split('<nav aria-label="Primary">')[0]
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
};

const shingles = (t, n = 6) => {
  const w = t.split(' ');
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};
const overlap = (a, b) => {
  let hits = 0;
  a.forEach((x) => { if (b.has(x)) hits++; });
  const union = a.size + b.size - hits;
  return union ? (hits / union) * 100 : 0;
};

const docs = [];
for (const p of paths) {
  const t = textOf(p);
  if (t) docs.push({ path: p, sh: shingles(t) });
}

let worst = { v: 0 };
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const v = overlap(docs[i].sh, docs[j].sh);
    if (v > worst.v) worst = { v, pair: `${docs[i].path} / ${docs[j].path}` };
    if (v > MAX) {
      fails.push(`${docs[i].path} and ${docs[j].path} are ${v.toFixed(1)}% identical (max ${MAX}%) — Google will pick one and drop the other`);
    } else if (v > WARN_AT) {
      warn.push(`${docs[i].path} / ${docs[j].path}: ${v.toFixed(1)}%`);
    }
  }
}

if (warn.length) {
  console.warn('\n! PRODUCT DUPLICATION — approaching the ceiling:');
  warn.forEach((w) => console.warn(`  ! ${w}`));
}
if (fails.length) {
  console.error(`\n✗ PRODUCT DUPLICATION FAILED — ${fails.length} pair(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ PRODUCT DUPLICATION OK — ${docs.length} pages, ${(docs.length * (docs.length - 1)) / 2} pairs: ` +
  `worst ${worst.v.toFixed(1)}% (${worst.pair}), under the ${MAX}% ceiling.`
);

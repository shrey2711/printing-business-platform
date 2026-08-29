// §14 internal-linking audit for the city pages, run against the BUILD so a
// link is only "valid" if the target page actually exists.
//
// Per city page:
//   1. Required destinations are all linked: the Trade Show Displays hub,
//      Custom Canopies, Backdrops, Banner Stands, Table Covers, a retractable
//      banner product, booth packages, and Learning Center articles.
//   2. City-to-city-category links exist (Trade Show Canopies in {City},
//      Banner Stands in {City}, Trade Show Backdrops in {City}, Table Covers
//      in {City}).
//   3. Every internal href resolves to a prerendered page — no broken or
//      placeholder links.
//   4. Anchor-text diversity: the same anchor string must not be reused for
//      different destinations, and a single destination linked many times must
//      not always carry the identical anchor.
//
// Usage: node scripts/audit-city-links.mjs [--list]

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const list = process.argv.includes('--list');
const fails = [];
const warns = [];

const REQUIRED = [
  ['Trade Show Displays hub', (l) => l === '/trade-show-displays'],
  ['Custom Canopies', (l) => l === '/custom-canopies'],
  ['Backdrops', (l) => l === '/backdrops'],
  ['Banner Stands', (l) => l === '/banner-stands'],
  ['Table Covers', (l) => l === '/table-covers'],
  ['a retractable banner product', (l) => /^\/products\/(standard|deluxe)-retractable-banner$/.test(l)],
  ['booth packages', (l) => l === '/trade-show-booth-packages'],
  ['Learning Center articles', (l) => l.startsWith('/blog/')]
];

const exists = (href) => {
  const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '');
  if (clean === '') return existsSync(`${DIST}/index.html`);
  return existsSync(`${DIST}${clean}/index.html`) || existsSync(`${DIST}${clean}`);
};

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const file = `${DIST}/${CAT}/${city.slug}/index.html`;
  if (!existsSync(file)) { fails.push(`${city.slug}: not built`); continue; }
  const html = readFileSync(file, 'utf8');
  const main = html.split('<main')[1] || html;
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // href + anchor text pairs
  const pairs = [...main.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()])
    .filter(([h]) => h.startsWith('/'));

  // 1. required destinations
  const hrefs = pairs.map(([h]) => h);
  for (const [name, test] of REQUIRED) {
    if (!hrefs.some(test)) F(`no link to ${name}`);
  }

  // 2. sibling city-category pages
  for (const sib of ['trade-show-canopies', 'banner-stands', 'trade-show-backdrops', 'table-covers']) {
    const target = `/${sib}/${city.slug}`;
    if (!hrefs.includes(target)) F(`no city-to-category link ${target}`);
  }

  // 3. no broken links
  for (const h of [...new Set(hrefs)]) {
    if (!exists(h)) F(`broken link: ${h}`);
  }

  // 4. anchor-text diversity
  const byAnchor = new Map();
  const byHref = new Map();
  for (const [h, t] of pairs) {
    if (!t) { F(`empty anchor text on ${h}`); continue; }
    if (!byAnchor.has(t)) byAnchor.set(t, new Set());
    byAnchor.get(t).add(h);
    if (!byHref.has(h)) byHref.set(h, []);
    byHref.get(h).push(t);
  }
  for (const [text, targets] of byAnchor) {
    if (targets.size > 1) F(`anchor "${text}" points at ${targets.size} different pages: ${[...targets].join(', ')}`);
  }
  for (const [h, texts] of byHref) {
    if (texts.length >= 3 && new Set(texts).size === 1) {
      warns.push(`${city.slug}: ${h} linked ${texts.length}x with the identical anchor "${texts[0]}"`);
    }
  }
  const ratio = byAnchor.size / pairs.length;
  if (ratio < 0.5) F(`only ${byAnchor.size} distinct anchors across ${pairs.length} links (${Math.round(ratio * 100)}%)`);

  if (list) {
    console.log(`${city.city.padEnd(16)} ${pairs.length} links · ${byAnchor.size} distinct anchors · ${new Set(hrefs).size} distinct targets`);
  }
}

warns.forEach((w) => console.log(`  ! ${w}`));
if (fails.length) {
  console.error(`\n✗ LINK AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ INTERNAL LINKS OK — ${rolled.length} city pages link every required category, product, booth-package and Learning Center destination plus their four sibling city pages, with no broken links and diverse anchor text.`);

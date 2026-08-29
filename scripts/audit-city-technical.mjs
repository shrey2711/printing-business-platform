// §20-§22 technical audit for the city pages.
//
// §20 meta description — unique site-wide, ~140-160 chars, and naturally
//     carrying: the head term, the city, the product range, the free artwork
//     proof, and the ordering/shipping process.
// §21 canonical — self-referencing and absolute; never pointing at the
//     homepage, a state page, Seattle or another city.
// §22 indexability — no noindex, no nofollow on internal links, present in the
//     XML sitemap exactly once, no duplicate URL variant in the build, and not
//     orphaned (something else links to it).
//
// Usage: node scripts/audit-city-technical.mjs [--list]

import { readFileSync, existsSync, readdirSync, realpathSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const ORIGIN = 'https://www.apextradeshow.com';
const list = process.argv.includes('--list');
const DESC_MIN = 140;
const DESC_MAX = 165;
const fails = [];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');

// every sitemap URL in the build
const sitemapUrls = [];
for (const f of readdirSync(DIST).filter((n) => /^sitemap.*\.xml$/.test(n))) {
  sitemapUrls.push(...[...readFileSync(`${DIST}/${f}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

// every internal link in the build, for the orphan check
const inboundTo = new Map();
const allDescriptions = new Map();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { walk(p); continue; }
    if (e.name !== 'index.html') continue;
    const html = readFileSync(p, 'utf8');
    const from = p.replace(DIST, '').replace('/index.html', '') || '/';
    for (const m of html.matchAll(/<a [^>]*href="(\/[^"#?]*)"/g)) {
      const to = m[1].replace(/\/$/, '') || '/';
      if (to === from) continue;
      if (!inboundTo.has(to)) inboundTo.set(to, new Set());
      inboundTo.get(to).add(from);
    }
    const d = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    if (d) {
      if (!allDescriptions.has(d)) allDescriptions.set(d, []);
      allDescriptions.get(d).push(from);
    }
  }
})(DIST);

// what a city meta description must carry (§20)
const DESC_PARTS = [
  ['the head term', /trade show displays?/i],
  ['the product range', /canop|banner|backdrop|table cover/i],
  ['the free artwork proof', /free (?:artwork )?proof/i],
  ['the ordering or shipping process', /printed to order|made to order|ship|shipping|instant (?:online )?pricing/i]
];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const path = `/${CAT}/${city.slug}`;
  const file = `${DIST}${path}/index.html`;
  if (!existsSync(file)) { fails.push(`${city.slug}: not built`); continue; }
  const html = readFileSync(file, 'utf8');
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // ---- §20 meta description ----
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!desc) F('no meta description');
  else {
    if (desc.length < DESC_MIN || desc.length > DESC_MAX) F(`meta description is ${desc.length} chars (want ${DESC_MIN}-${DESC_MAX}): "${desc}"`);
    const names = [city.h1City, city.city, city.city.replace(', D.C.', '')].filter(Boolean);
    if (!names.some((n) => desc.includes(n))) F(`meta description does not name the city: "${desc}"`);
    for (const [what, re] of DESC_PARTS) {
      if (!re.test(desc)) F(`meta description is missing ${what}: "${desc}"`);
    }
    const owners = (allDescriptions.get(desc) || []).filter((o) => o !== path);
    if (owners.length) F(`meta description is not unique — also on ${owners.join(', ')}`);
  }

  // ---- §21 canonical ----
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const want = `${ORIGIN}${path}`;
  if (!canon) F('no canonical');
  else if (canon.replace(/\/$/, '') !== want) F(`canonical points elsewhere: ${canon} (want ${want})`);
  if ((html.match(/rel="canonical"/g) || []).length > 1) F('more than one canonical tag');

  // ---- §22 indexability ----
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  if (/noindex/i.test(robots)) F(`page is noindex ("${robots}")`);
  if (/nofollow/i.test(robots)) F(`page-level nofollow ("${robots}")`);
  const nofollowLinks = [...html.matchAll(/<a [^>]*href="(\/[^"]*)"[^>]*rel="[^"]*nofollow/g)].map((m) => m[1]);
  if (nofollowLinks.length) F(`internal links marked nofollow: ${[...new Set(nofollowLinks)].join(', ')}`);

  const inSitemap = sitemapUrls.filter((u) => u.replace(/\/$/, '') === want);
  if (!inSitemap.length) F('missing from the XML sitemap');
  if (inSitemap.length > 1) F(`listed ${inSitemap.length}x in the sitemaps`);

  // Duplicate URL variants in the build. The case variant is resolved through
  // realpath, because a case-insensitive filesystem (macOS, Windows) reports
  // the uppercase path as existing when it is the very same file.
  for (const variant of [`${DIST}${path}.html`, `${DIST}${path}/index.htm`, `${DIST}${path.toUpperCase()}/index.html`]) {
    if (!existsSync(variant)) continue;
    let same = false;
    try { same = realpathSync.native(variant) === realpathSync.native(file); } catch { same = false; }
    if (!same) F(`duplicate URL variant exists: ${variant}`);
  }

  const inbound = inboundTo.get(path);
  if (!inbound || inbound.size === 0) F('orphan page — nothing links to it');

  if (list) console.log(`${city.city.padEnd(16)} desc ${String(desc.length).padStart(3)} · canonical self · index · sitemap 1 · inbound ${inbound ? inbound.size : 0}`);
}

if (fails.length) {
  console.error(`\n✗ TECHNICAL AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ TECHNICAL OK — ${rolled.length} city pages: unique ${DESC_MIN}-${DESC_MAX} char meta descriptions carrying the head term, city, range, free proof and process; self-referencing canonicals; indexable, followed, in the sitemap once, no duplicate URL variant, no orphans.`);

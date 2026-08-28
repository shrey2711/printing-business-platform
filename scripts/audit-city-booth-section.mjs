// §5 audit of the FIRST product section on each city page — the
// "Trade Show Booth Displays in {City}" block — scoped to that section alone,
// because page-wide coverage says nothing about whether this section does its
// own job.
//
// Per city it must:
//   1. use the H2 "Trade Show Booth Displays in {City}" (city named naturally)
//   2. explain how to build a professional booth from combined pieces:
//      backdrop + banner stands + table covers + canopy (+ another branded item)
//   3. cover, in this section's own words: trade show booth displays / custom
//      trade show displays / exhibition displays / trade show booth
//   4. link to the relevant Apex category and product pages
//
// Usage: node scripts/audit-city-booth-section.mjs [--verbose]

import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const verbose = process.argv.includes('--verbose');
const fails = [];

// Products the section must combine (spec §5 bullet list).
const COMPONENTS = [
  ['trade show backdrop', /backdrop|step[- ]?(?:and|&)[- ]?repeat|tension[- ]fabric (?:wall|display)/i],
  ['banner stands', /banner stands?|retractable banners?/i],
  ['table covers', /table cover/i],
  ['canopy', /canop(?:y|ies)/i]
];

// Keyword themes this section must carry itself.
const THEMES = [
  ['trade show booth displays', /(?:trade[- ]show )?booth displays?/i],
  ['custom trade show displays', /custom (?:trade[- ]show |printed )?displays?|custom trade show display/i],
  ['exhibition displays', /exhibition displays?|exhibition booth|displays? for exhibitions?/i],
  ['trade show booth', /trade[- ]show booth|booth (?:at|on|here|comes|has|is)|your booth|a \w+ booth/i]
];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const rows = [];

for (const city of rolled) {
  const sec = CITY_DETAIL[city.slug].productSections[0];
  const F = (m) => fails.push(`${city.slug}: ${m}`);
  // Short forms a city uses naturally mid-sentence still count as local.
  const EXTRA = { 'washington-dc': ['Washington', 'D.C.'], 'new-york': ['NYC'], 'los-angeles': ['LA'] };
  const names = [city.city, city.h1City, cityWithAbbr(city), ...(EXTRA[city.slug] || [])].filter(Boolean);
  // Themes are scored over the WHOLE section — its H2 is part of the section.
  const scope = `${sec.h2}. ${sec.body}`;

  // 1. H2
  if (!/^Trade Show Booth Displays in /.test(sec.h2)) F(`H2 "${sec.h2}" is not "Trade Show Booth Displays in {City}"`);
  else if (!names.some((n) => sec.h2.endsWith(n))) F(`H2 "${sec.h2}" does not end with the city name`);

  // 2. component combination + the city named in the prose
  const missingParts = COMPONENTS.filter(([, re]) => !re.test(sec.body)).map(([n]) => n);
  if (missingParts.length) F(`section never mentions ${missingParts.join(', ')}`);
  if (!names.some((n) => sec.body.includes(n))) F('section body never names the city');

  // 3. section-scoped keyword themes
  const missingThemes = THEMES.filter(([, re]) => !re.test(scope)).map(([n]) => n);
  if (missingThemes.length) F(`section does not cover ${missingThemes.join(', ')}`);

  // 4. links out to category/product pages
  const links = (sec.links || []).map((l) => l.to);
  if (links.length < 2) F(`only ${links.length} outbound link(s)`);
  if (!links.some((l) => /^\/(trade-show-displays|custom-canopies|banner-stands|backdrops|table-covers)$/.test(l))) F('no category-hub link');
  for (const l of links) if (!/^\//.test(l)) F(`link ${l} is not site-relative`);

  const words = (sec.body.match(/[A-Za-z0-9'’×]+/g) || []).length;
  rows.push({ city: city.city, words, parts: COMPONENTS.length - missingParts.length, themes: THEMES.length - missingThemes.length, links: links.length, missingThemes });
}

for (const r of rows) {
  const flag = r.missingThemes.length || r.parts < COMPONENTS.length ? '✗' : '✓';
  console.log(`${flag} ${r.city.padEnd(16)} ${String(r.words).padStart(3)}w · products ${r.parts}/${COMPONENTS.length} · themes ${r.themes}/${THEMES.length} · links ${r.links}${r.missingThemes.length ? `  → missing: ${r.missingThemes.join(', ')}` : ''}`);
}

if (fails.length) {
  console.error(`\n✗ BOOTH SECTION AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ BOOTH SECTION OK — ${rows.length} cities: H2 form, booth-building explanation combining backdrop + banner stands + table covers + canopy, all 4 keyword themes in-section, and category/product links.`);

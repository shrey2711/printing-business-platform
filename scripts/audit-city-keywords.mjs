// §4 commercial keyword-theme coverage for the city pages.
//
// These are SEMANTIC targets, not exact strings: each theme passes when the
// page uses the concept in natural language (any listed variation). A theme
// also scores "+city" when a variation appears in the same sentence as the city
// name — a signal of genuine local relevance, NOT a requirement, because
// forcing "{theme} {city}" into every sentence is keyword stuffing.
//
// Usage: node scripts/audit-city-keywords.mjs [--verbose]   (after a build)

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const verbose = process.argv.includes('--verbose');

// theme → accepted natural-language variations (case-insensitive regex).
const THEMES = [
  ['trade show displays', /trade[- ]show displays?/i, 'primary'],
  ['trade show booth displays', /trade[- ]show booth displays?|booth displays?/i],
  ['exhibition displays', /exhibition displays?|exhibition (?:booth|wall|stand)|displays? for exhibitions?/i],
  ['custom trade show displays', /custom(?:-printed)? (?:trade[- ]show |exhibition )?displays?|custom[- ]printed (?:trade[- ]show )?display/i],
  ['trade show booth', /trade[- ]show booth|booth at |your booth|booth wall|booth back/i],
  ['custom canopy tent', /custom canopy tents?|printed (?:pop-up )?canopy tents?|canopy tents?/i],
  ['custom canopy', /custom canop(?:y|ies)|printed (?:pop-up )?canopy/i],
  ['backdrop printing', /backdrop printing|print(?:ed|s|ing)? (?:step[- ]and[- ]repeat |tension[- ]fabric )?backdrops?/i],
  ['trade show backdrops', /trade[- ]show backdrops?|backdrops? (?:for|at) |fabric backdrop/i],
  ['step and repeat backdrop', /step[- ]?(?:and|&)[- ]?repeat/i],
  ['banner stands', /banner stands?/i],
  ['retractable banner stands', /retractable banner stands?|retractable banners?/i],
  ['trade show table covers', /trade[- ]show table covers?|table covers? for|printed table covers?/i],
  ['custom table covers', /custom(?: printed)? table covers?|table covers? printed/i],
  ['event displays', /event displays?|displays? for (?:events|your event)|event branding|activations?/i]
];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const fails = [];
const weak = [];

const text = (h) => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ');

const rows = [];
for (const city of rolled) {
  const f = `${DIST}/${CAT}/${city.slug}/index.html`;
  if (!existsSync(f)) { fails.push(`${city.slug}: not built`); continue; }
  const body = text(readFileSync(f, 'utf8'));
  const sentences = body.split(/(?<=[.!?])\s+/);
  // Short forms a city legitimately uses mid-sentence ("Washington audiences",
  // "NYC logistics") — still a local signal, so they count for adjacency.
  const EXTRA_NAMES = { 'washington-dc': ['Washington', 'D.C.'], 'new-york': ['NYC'], 'los-angeles': ['LA'] };
  const names = [city.city, city.h1City, cityWithAbbr(city), ...(EXTRA_NAMES[city.slug] || [])].filter(Boolean);
  const localSentences = sentences.filter((s) => names.some((n) => s.includes(n)));

  const missing = [];
  const noLocal = [];
  for (const [name, re] of THEMES) {
    const hits = (body.match(new RegExp(re.source, 'gi')) || []).length;
    if (!hits) { missing.push(name); continue; }
    if (!localSentences.some((s) => re.test(s))) noLocal.push(name);
  }
  rows.push({ city: city.city, covered: THEMES.length - missing.length, missing, noLocal });
  if (missing.length) fails.push(`${city.slug}: no coverage of ${missing.join(', ')}`);
  if (noLocal.length) weak.push(`${city.slug}: covered but never alongside the city name — ${noLocal.join(', ')}`);
}

for (const r of rows) {
  const flag = r.missing.length ? '✗' : (r.noLocal.length ? '~' : '✓');
  console.log(`${flag} ${r.city.padEnd(16)} ${r.covered}/${THEMES.length} themes${r.noLocal.length && !r.missing.length ? `  (no city-adjacent use: ${r.noLocal.join(', ')})` : ''}`);
}
if (verbose) weak.forEach((w) => console.log(`  ~ ${w}`));

if (fails.length) {
  console.error(`\n✗ KEYWORD COVERAGE FAILED — ${fails.length} gap(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ KEYWORD COVERAGE OK — ${rows.length} city pages cover all ${THEMES.length} commercial themes in natural language.`);

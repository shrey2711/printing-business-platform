// Final cross-page check: accidental duplicate paragraphs or repeated local
// content between city pages.
//
// Compares every substantive sentence on every city page against every other
// city page. City, state and venue names are NOT normalised here — the point is
// to catch prose that was reused wholesale, including the case where only the
// proper nouns were swapped (that variant is caught by normalising and
// re-testing).
//
// Sentences that legitimately repeat — the central production policy and the
// venue-shipping disclaimer, both of which §10 and §12 require be stated
// consistently — are allow-listed by pattern, not by exception.
//
// Usage: node scripts/audit-city-duplicate-prose.mjs [--list]

import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const list = process.argv.includes('--list');
const fails = [];

// Repetition that is required by policy rather than accidental.
const ALLOWED = [
  /6[–-]8 business days/,                      // central production window (§10)
  /special delivery arrangement/,               // venue disclaimer (§12)
  /2[–-]3 business day rush/,
  /free artwork proof/,
  /transit (?:is )?added by destination/
];

const prose = (d) => [
  d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
  ...(d.conventionCenters || []).map((v) => v.desc),
  ...(d.industries || []).map((i) => i[1]),
  ...(d.productSections || []).map((s) => s.body),
  ...(d.faqs || []).map((f) => f.a)
].filter(Boolean).join(' ');

const sentences = (t) => t
  .split(/(?<=[.!?])\s+/)
  .map((s) => s.trim())
  .filter((s) => (s.match(/\S+/g) || []).length >= 12);

const norm = (s, city) => {
  let t = s;
  for (const n of [city.h1City, city.city, city.stateName, city.abbr].filter(Boolean)) t = t.split(n).join('CITY');
  for (const v of CITY_DETAIL[city.slug].conventionCenters || []) t = t.split(v.name).join('VENUE');
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
};

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

// index every sentence, verbatim and name-normalised
const verbatim = new Map();
const normalised = new Map();
for (const city of rolled) {
  for (const s of sentences(prose(CITY_DETAIL[city.slug]))) {
    if (ALLOWED.some((re) => re.test(s))) continue;
    if (!verbatim.has(s)) verbatim.set(s, []);
    verbatim.get(s).push(city.slug);
    const n = norm(s, city);
    if (!normalised.has(n)) normalised.set(n, []);
    normalised.get(n).push(city.slug);
  }
}

let exact = 0;
for (const [s, cities] of verbatim) {
  const uniq = [...new Set(cities)];
  if (uniq.length > 1) {
    exact++;
    fails.push(`verbatim duplicate across ${uniq.join(', ')}: "${s.slice(0, 90)}…"`);
  }
}
let swapped = 0;
for (const [s, cities] of normalised) {
  const uniq = [...new Set(cities)];
  if (uniq.length > 1 && !verbatim.has(s)) {
    swapped++;
    fails.push(`name-swapped duplicate across ${uniq.join(', ')}: "${s.slice(0, 90)}…"`);
  }
}

if (list) {
  const total = [...verbatim.values()].length;
  console.log(`${total} substantive sentences compared across ${rolled.length} city pages`);
  console.log(`  verbatim duplicates: ${exact}`);
  console.log(`  name-swapped duplicates: ${swapped}`);
}

if (fails.length) {
  console.error(`\n✗ DUPLICATE PROSE FOUND — ${fails.length} case(s):`);
  fails.slice(0, 25).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 25) console.error(`  … and ${fails.length - 25} more`);
  process.exit(1);
}
console.log(`✓ NO DUPLICATE PROSE — every substantive sentence across the ${rolled.length} city pages is unique to its city, both verbatim and after normalising city, state and venue names.`);

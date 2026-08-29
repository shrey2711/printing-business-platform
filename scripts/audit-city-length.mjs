// §23 page length. The target is comprehensiveness comparable to the approved
// Seattle page, not a word count — so this measures USEFUL editorial words
// (the prose blocks a reader actually reads) rather than the whole rendered
// page, which is inflated by navigation, link lists and the city grid.
//
// It fails a page for being thin, for drifting far from the master's depth in
// either direction, and for padding: sentences repeated inside one page, and
// filler phrasing that adds length without information.
//
// Usage: node scripts/audit-city-length.mjs [--list]

import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const MASTER = 'seattle';
const list = process.argv.includes('--list');
const fails = [];
const warns = [];

// A page may sit anywhere in this band. Seattle is the reference point; the
// band is wide because the spec explicitly allows shorter or longer when it
// serves the reader.
const FLOOR = 1200;
const CEILING = 2600;
const DRIFT = 0.4; // +/- 40% of the master's editorial length

const FILLER = [
  /\bin today's (?:fast[- ]paced |competitive )?world\b/i,
  /\bwhen it comes to\b/i,
  /\bit(?:'s| is) important to note that\b/i,
  /\bat the end of the day\b/i,
  /\bwhether you(?:'re| are) looking for\b/i,
  /\bone of the most (?:important|popular) (?:things|ways)\b/i,
  /\bthere are many (?:different )?(?:options|ways|choices)\b/i,
  /\bplays? a (?:key|vital|crucial) role\b/i
];

const editorial = (d) => [
  d.answer,
  ...(d.overview || []),
  d.whyExhibit,
  ...(d.conventionCenters || []).map((v) => `${v.name} ${v.desc}`),
  ...(d.industries || []).map((i) => `${i[0]} ${i[1]}`),
  d.climate,
  d.bestDisplays,
  ...(d.productSections || []).map((s) => `${s.h2}. ${s.body}`),
  d.planning,
  ...(d.faqs || []).map((f) => `${f.q} ${f.a}`)
].filter(Boolean).join(' ');

const words = (t) => (t.match(/[A-Za-z0-9'’×]+/g) || []).length;
const sentences = (t) => t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 30);

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const masterWords = words(editorial(CITY_DETAIL[MASTER]));
const lo = Math.round(masterWords * (1 - DRIFT));
const hi = Math.round(masterWords * (1 + DRIFT));

const rows = [];
for (const city of rolled) {
  const d = CITY_DETAIL[city.slug];
  const t = editorial(d);
  const n = words(t);
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  if (n < FLOOR) F(`only ${n} useful words — too thin to be comprehensive`);
  if (n > CEILING) F(`${n} useful words — longer than any city page needs`);
  if (n < lo || n > hi) warns.push(`${city.slug}: ${n} useful words vs the master's ${masterWords} (band ${lo}-${hi})`);

  // padding: the same sentence used twice inside one page
  const ss = sentences(t);
  const dupes = ss.filter((s, i) => ss.indexOf(s) !== i);
  if (dupes.length) F(`repeats a sentence within the page: "${dupes[0].slice(0, 60)}…"`);

  // padding: filler phrasing
  for (const re of FILLER) {
    const m = t.match(re);
    if (m) F(`filler phrasing adds length without information: "${m[0]}"`);
  }

  // a section that is mostly one long sentence is usually padded
  const longest = Math.max(...ss.map((s) => words(s)));
  if (longest > 70) warns.push(`${city.slug}: longest sentence is ${longest} words — consider splitting`);

  rows.push({ city: city.city, n, sections: (d.productSections || []).length, faqs: (d.faqs || []).length });
}

if (list) {
  console.log(`master (${MASTER}): ${masterWords} useful words — band ${lo}-${hi}\n`);
  rows.sort((a, b) => a.n - b.n).forEach((r) => console.log(`${String(r.n).padStart(5)}  ${r.city.padEnd(16)} ${r.sections} product sections · ${r.faqs} FAQs`));
}
warns.slice(0, 12).forEach((w) => console.log(`  ! ${w}`));

if (fails.length) {
  console.error(`\n✗ LENGTH AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
const avg = Math.round(rows.reduce((s, r) => s + r.n, 0) / rows.length);
console.log(`✓ LENGTH OK — ${rows.length} city pages average ${avg} useful editorial words (master ${masterWords}), none thin, none padded, no repeated sentences or filler phrasing.`);

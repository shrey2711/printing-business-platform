// §16 city-uniqueness audit — the one that catches a name-swap.
//
// Every comparison is done AFTER normalising away the things that trivially
// differ between two cities: city name, state, abbreviation, venue names and
// event names all collapse to placeholder tokens. Two pages built by swapping
// "Seattle" for "Las Vegas" therefore score as identical, not as unique.
//
// Similarity is 5-gram Jaccard. Uniqueness = 100% - similarity, measured for
// each city against its most similar sibling (worst case, not average).
//
// Thresholds: the spec asks for 60-70% unique meaningful content. Editorial
// prose is held to 70%; FAQ answers to 55%, because they must repeat the
// central production policy verbatim (see §10) and that repetition is required.
//
// Usage: node scripts/audit-city-uniqueness.mjs [--matrix]

import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const matrix = process.argv.includes('--matrix');
const fails = [];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

// Everything that legitimately differs city to city, collapsed to a token so it
// cannot inflate a uniqueness score.
const normalise = (text, city) => {
  let t = text;
  const d = CITY_DETAIL[city.slug];
  for (const v of d.conventionCenters || []) {
    t = t.split(v.name).join(' VENUE ');
    // also the short forms used in prose
    const short = v.name.replace(/\s*\(.*?\)\s*/g, '').replace(/^The /, '');
    if (short.length > 6) t = t.split(short).join(' VENUE ');
  }
  for (const n of [city.city, city.h1City, city.stateName, city.abbr, 'D.C.', 'NYC', 'LA'].filter(Boolean)) {
    t = t.split(n).join(' CITY ');
  }
  return t.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ');
};

const shingles = (s, n = 5) => {
  const w = s.split(' ').filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
};
const similarity = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

// The "meaningful content" blocks the spec enumerates.
const SECTIONS = [
  ['introduction', (d) => (d.overview || []).join(' '), 70],
  ['business environment', (d) => d.whyExhibit || '', 70],
  ['convention venues', (d) => (d.conventionCenters || []).map((v) => v.desc).join(' '), 70],
  ['industries', (d) => (d.industries || []).map((i) => i[1]).join(' '), 70],
  ['climate / outdoor', (d) => d.climate || '', 70],
  ['product recommendations', (d) => `${d.bestDisplays || ''} ${d.productSections.map((s) => s.body).join(' ')}`, 70],
  ['planning', (d) => d.planning || '', 65],
  ['FAQs', (d) => (d.faqs || []).map((f) => `${f.q} ${f.a}`).join(' '), 55],
  ['whole page', (d) => [d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
    ...(d.conventionCenters || []).map((v) => v.desc), ...(d.industries || []).map((i) => i[1]),
    ...d.productSections.map((s) => `${s.h2} ${s.body}`), ...(d.faqs || []).map((f) => `${f.q} ${f.a}`)].join(' '), 70]
];

const rows = [];
for (const [name, pick, floor] of SECTIONS) {
  const blobs = rolled.map((c) => [c, shingles(normalise(pick(CITY_DETAIL[c.slug]), c))]);
  let worstPair = null; let worstUnique = 100;
  const perCity = [];
  for (const [city, a] of blobs) {
    let maxSim = 0; let against = null;
    for (const [other, b] of blobs) {
      if (other.slug === city.slug) continue;
      const sim = similarity(a, b);
      if (sim > maxSim) { maxSim = sim; against = other.slug; }
    }
    const unique = Math.round((1 - maxSim) * 100);
    perCity.push([city.slug, unique, against]);
    if (unique < worstUnique) { worstUnique = unique; worstPair = `${city.slug} vs ${against}`; }
    if (unique < floor) fails.push(`${name}: ${city.slug} is only ${unique}% unique vs ${against} (floor ${floor}%)`);
  }
  const avg = Math.round(perCity.reduce((s, [, u]) => s + u, 0) / perCity.length);
  rows.push({ name, floor, avg, worstUnique, worstPair });
  if (matrix) {
    console.log(`\n${name} (floor ${floor}%)`);
    perCity.sort((a, b) => a[1] - b[1]).forEach(([s, u, v]) => console.log(`  ${String(u).padStart(3)}%  ${s.padEnd(16)} closest: ${v}`));
  }
}

if (!matrix) {
  console.log('section                     floor   average   worst   closest pair');
  for (const r of rows) {
    console.log(`${r.name.padEnd(26)} ${String(r.floor + '%').padEnd(7)} ${String(r.avg + '%').padEnd(9)} ${String(r.worstUnique + '%').padEnd(7)} ${r.worstPair}`);
  }
}

if (fails.length) {
  console.error(`\n✗ UNIQUENESS FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 25).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 25) console.error(`  … and ${fails.length - 25} more`);
  process.exit(1);
}
console.log(`\n✓ UNIQUENESS OK — ${rolled.length} cities clear every section floor with city, state and venue names normalised away, so no page could pass by name-swapping.`);

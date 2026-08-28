// City-rollout content gate. Checks the Seattle master pattern is met by every
// city that has opted into it, WITHOUT needing a full build — so a per-city
// content edit can be verified in a second instead of a two-minute prerender.
//
// Checks per city with productSections (i.e. rolled out):
//   - metaDescription present, 140–165 chars, unique across cities
//   - specTable present (shared rows helper)
//   - 5 productSections, each 95–140 words, each with >=1 real internal link
//   - >=6 FAQs, answers 18–110 words (AEO target 25+), answer-first (no "It depends"…)
//   - no physical-presence language, no invented delivery day-counts,
//     no guarantees / reviews / ratings
//   - inter-city uniqueness of the editorial body >= 80% (5-gram Jaccard)
//
// Usage: node scripts/check-city-rollout.mjs [citySlug ...]

import { CITY_DETAIL } from '../src/data/cityDetail.js';

const fails = [];
const warns = [];
const words = (s) => (String(s).toLowerCase().match(/[a-z0-9'’×]+/g) || []);
const wc = (s) => words(s).length;

// Hard prohibitions (see the STRICT RULES block in cityDetail.js).
const BANNED = [
  [/our\s+[A-Z][a-z]+\s+(office|warehouse|store|showroom|facility|team)|\blocated in\b|\bbased in\b/, 'implies a physical local presence'],
  [/\b(next[- ]day|same[- ]day|overnight)\s+(delivery|shipping)\b/i, 'invented per-city delivery speed'],
  [/\bdeliver(?:s|ed|y)?\s+(?:to\s+\w+\s+)?in\s+\d+\s*(?:-|–|to)?\s*\d*\s*(?:business\s+)?days?\b/i, 'invented per-city delivery day-count'],
  [/\b(guarantee|guaranteed)\b/i, 'guarantee claim'],
  [/\b\d+(\.\d+)?[- ]star\b|\bcustomers? (say|rated|reviewed)\b|\btestimonial/i, 'invented review/rating'],
  [/\bour clients? (in|at)\b|\bwe worked with\b|\bcase study\b/i, 'invented customer/case study']
];

const shingles = (s) => {
  const w = words(s);
  const out = new Set();
  for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' '));
  return out;
};
const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

const only = process.argv.slice(2);
const entries = Object.entries(CITY_DETAIL).filter(([slug]) => !only.length || only.includes(slug));
const rolledOut = entries.filter(([, d]) => Array.isArray(d.productSections));
const bodies = new Map();
const metas = new Map();

for (const [slug, d] of rolledOut) {
  const F = (m) => fails.push(`${slug}: ${m}`);

  if (!d.metaDescription) F('missing metaDescription');
  else {
    const n = d.metaDescription.length;
    if (n < 140 || n > 165) F(`metaDescription ${n} chars (want 140–165)`);
    metas.set(slug, d.metaDescription);
  }

  if (!d.specTable?.rows?.length) F('missing specTable');
  else if (!d.specTable.caption.startsWith(cityName(d, slug))) warns.push(`${slug}: specTable caption does not lead with the city name`);

  if (d.productSections.length !== 5) F(`${d.productSections.length} productSections (want 5)`);
  for (const s of d.productSections) {
    const n = wc(s.body);
    if (n < 95 || n > 140) F(`productSection "${s.h2}" is ${n} words (want 95–140)`);
    if (!Array.isArray(s.links) || !s.links.length) F(`productSection "${s.h2}" has no internal links`);
    for (const l of s.links || []) if (!/^\//.test(l.to)) F(`productSection "${s.h2}" link ${l.to} is not site-relative`);
  }

  const faqs = d.faqs || [];
  if (faqs.length < 6) F(`${faqs.length} FAQs (want >= 6)`);
  for (const f of faqs) {
    const n = wc(f.a);
    if (n < 18 || n > 110) F(`FAQ "${f.q.slice(0, 40)}…" answer is ${n} words (want 18–110, target 25+)`);
    else if (n < 25) warns.push(`${slug}: FAQ "${f.q.slice(0, 40)}…" answer is only ${n} words (AEO target 25+)`);
    if (!/^(Yes|No|[A-Z][^.]{0,60}(are|is|works|start|run|ship|pack|anchors|comes))/.test(f.a) && !/^(Yes|No)\b/.test(f.a)) {
      warns.push(`${slug}: FAQ "${f.q.slice(0, 40)}…" may not be answer-first`);
    }
    if (!/\?$/.test(f.q)) F(`FAQ not phrased as a question: "${f.q}"`);
  }

  const blob = [
    d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
    ...(d.conventionCenters || []).map((v) => `${v.name} ${v.desc}`),
    ...(d.industries || []).map((i) => i.join(' ')),
    ...d.productSections.map((s) => `${s.h2} ${s.body}`),
    ...faqs.map((f) => `${f.q} ${f.a}`)
  ].join(' ');
  for (const [re, why] of BANNED) {
    const m = blob.match(re);
    if (m) F(`${why}: "${m[0]}"`);
  }
  bodies.set(slug, blob);
}

function cityName(d, slug) {
  return (d.specTable?.caption || '').split(' trade show')[0] || slug;
}

// Uniqueness: every rolled-out city vs every other city that has content.
const all = [...bodies.entries()];
for (let i = 0; i < all.length; i++) {
  const a = shingles(all[i][1]);
  for (let j = 0; j < all.length; j++) {
    if (i === j) continue;
    const overlap = jaccard(a, shingles(all[j][1]));
    if (overlap > 0.20) fails.push(`${all[i][0]} vs ${all[j][0]}: only ${Math.round((1 - overlap) * 100)}% unique (want >= 80%)`);
  }
}

// metaDescription uniqueness
const seen = new Map();
for (const [slug, m] of metas) {
  if (seen.has(m)) fails.push(`${slug}: metaDescription duplicates ${seen.get(m)}`);
  seen.set(m, slug);
}

warns.forEach((w) => console.warn(`  ! ${w}`));
if (fails.length) {
  console.error(`\n✗ CITY ROLLOUT GATE FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CITY ROLLOUT GATE OK — ${rolledOut.length} rolled-out cities: meta/specTable/5 product sections/FAQ depth, no banned claims, >= 80% inter-city unique.`);

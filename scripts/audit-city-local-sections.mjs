// §10 audit of the five LOCAL editorial sections on each city page:
// Why exhibit · Top convention centers · Popular industries · Shipping ·
// Outdoor & climate.
//
// Checks what can be checked mechanically:
//   whyExhibit  — talks about sectors/industries/convention activity, and is
//                 not a tourism article (tourism words must not outweigh
//                 business words)
//   venues      — 3+ named venues; flags numeric capacity/size claims for
//                 human verification; forbids partnership/vendor/delivery
//                 arrangement language ("our partner venue", "we deliver
//                 directly to", "official supplier")
//   industries  — 4-8 entries, each with a description, unique across cities
//   shipping    — production claims identical to the CENTRAL policy everywhere
//                 (6-8 business days, 2-3 rush); no local presence, same-day,
//                 or guaranteed delivery; no "our schedule fills up for event X"
//                 demand claims
//   climate     — city-specific (not boilerplate), no weather-proof guarantees
//
// Usage: node scripts/audit-city-local-sections.mjs [--venues]

import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const showVenues = process.argv.includes('--venues');
const fails = [];
const review = [];

const BUSINESS = /industr|sector|buyer|exhibitor|convention|trade show|expo|conference|manufactur|technolog|healthcare|medical|biotech|life scien|energy|finance|fintech|corporate|association|wholesale|B2B|decision-makers?|retail|media|fashion|apparel|gaming|logistics|supply chain|hospitality|education|defen[cs]e|maritime|aerospace|semiconductor|market|attendees?/gi;
const TOURISM = /beach|nightlife|sightsee|tourist attraction|theme park ride|vacation|resort pool|cuisine|landmark|skyline view|must-see|things to do/gi;

// Central production policy — every city must state these and nothing else.
const CENTRAL = /6[–-]8 business days/;
const RUSH = /2[–-]3( business day)?( with)? rush|2[–-]3 business day rush|2[–-]3 with rush/;
const OTHER_DAYCOUNT = /\b(?!6[–-]8|2[–-]3)\d{1,2}[–-]\d{1,2} business days\b/g;

const BANNED_SHIPPING = [
  [/local (?:warehouse|manufactur|office|facility)|our [A-Z][a-z]+ (?:warehouse|office|facility|team)/i, 'implies local presence'],
  [/same[- ]day (?:delivery|shipping|turnaround|production)|overnight delivery/i, 'same-day/overnight delivery claim'],
  [/guarantee[sd]? (?:delivery|arrival)|delivery is guaranteed/i, 'guaranteed delivery claim'],
  [/we deliver directly to|official (?:supplier|vendor|partner)|our partner venue|partnership with/i, 'invented venue partnership or vendor relationship']
];
// Demand/scarcity claims about Apex's own schedule.
const DEMAND = [
  /busiest (?:weeks?|of the year|time)/i,
  /(?:book|fill)s? up (?:quickly|fast)/i,
  /(?:extremely|especially|very) busy/i,
  /peak weeks?/i,
  /order (?:well |early )?ahead\b/i
];
const WEATHER_GUARANTEE = /waterproof|storm[- ]proof|weatherproof|will keep you dry|guaranteed dry|withstands? any/i;

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const industryKeys = new Map();
const climateBlobs = new Map();

for (const city of rolled) {
  const d = CITY_DETAIL[city.slug];
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // --- Why exhibit ---
  const why = `${d.whyExhibit} ${(d.overview || []).join(' ')}`;
  const biz = (why.match(BUSINESS) || []).length;
  const tour = (why.match(TOURISM) || []).length;
  if (biz < 6) F(`whyExhibit names only ${biz} business/convention signals (want >= 6)`);
  if (tour >= biz / 2) F(`whyExhibit reads as tourism copy (${tour} tourism vs ${biz} business terms)`);

  // --- Venues ---
  const venues = d.conventionCenters || [];
  if (venues.length < 3) F(`only ${venues.length} venues listed (want >= 3)`);
  for (const v of venues) {
    if (!v.name || !v.desc) { F(`venue entry missing name/desc`); continue; }
    for (const [re, why2] of BANNED_SHIPPING) if (re.test(v.desc)) F(`venue "${v.name}" ${why2}`);
    const cap = v.desc.match(/[\d.,]+\s*(?:million\s*)?square feet|[\d,]+\s*(?:sq\.?\s*ft|seats)/i);
    if (cap) review.push(`${city.slug}: venue "${v.name}" states a capacity — "${cap[0]}" — verify against the venue's published figure`);
  }

  // --- Industries ---
  const inds = d.industries || [];
  if (inds.length < 4 || inds.length > 8) F(`${inds.length} industries (want 4-8)`);
  for (const [n, desc] of inds) {
    if (!desc || desc.length < 30) F(`industry "${n}" has no real description`);
    const key = n.toLowerCase();
    if (!industryKeys.has(key)) industryKeys.set(key, []);
    industryKeys.get(key).push(city.slug);
  }

  // --- Shipping / production policy, wherever it is stated ---
  const shipText = [d.planning, ...(d.faqs || []).map((f) => f.a), ...d.productSections.map((s) => s.body)].join(' ');
  if (!CENTRAL.test(shipText)) F('never states the central 6–8 business day production window');
  if (!RUSH.test(shipText)) F('never states the 2–3 business day rush option');
  const strays = shipText.match(OTHER_DAYCOUNT);
  if (strays) F(`states a non-central production window: ${[...new Set(strays)].join(', ')}`);
  for (const [re, why2] of BANNED_SHIPPING) {
    const m = shipText.match(re);
    if (m) F(`${why2}: "${m[0]}"`);
  }
  for (const re of DEMAND) {
    const m = shipText.match(re);
    if (m) F(`demand/scarcity claim about scheduling: "${m[0]}"`);
  }

  // --- Climate ---
  const clim = d.climate || '';
  if (clim.length < 200) F('climate section is too thin to be city-specific');
  if (WEATHER_GUARANTEE.test(clim)) F(`weather-proof guarantee in climate copy: "${clim.match(WEATHER_GUARANTEE)[0]}"`);
  climateBlobs.set(city.slug, clim);

  if (showVenues) console.log(`${city.city}: ${venues.map((v) => v.name).join(' | ')}`);
}

// Climate copy must not be boilerplate shared between cities.
const shingles = (s) => { const w = s.toLowerCase().match(/[a-z0-9']+/g) || []; const out = new Set(); for (let i = 0; i + 6 <= w.length; i++) out.add(w.slice(i, i + 6).join(' ')); return out; };
const cl = [...climateBlobs.entries()];
for (let i = 0; i < cl.length; i++) {
  for (let j = i + 1; j < cl.length; j++) {
    const a = shingles(cl[i][1]); const b = shingles(cl[j][1]);
    let inter = 0; for (const x of a) if (b.has(x)) inter++;
    const overlap = inter / (a.size + b.size - inter || 1);
    if (overlap > 0.15) fails.push(`${cl[i][0]} / ${cl[j][0]}: climate copy is ${Math.round(overlap * 100)}% shared — too generic`);
  }
}

if (!showVenues) {
  const shared = [...industryKeys.entries()].filter(([, v]) => v.length > 6);
  for (const [k, v] of shared) console.log(`  i industry "${k}" appears on ${v.length} cities — check the descriptions differ`);
}
review.forEach((r) => console.log(`  ? ${r}`));

if (fails.length) {
  console.error(`\n✗ LOCAL SECTION AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ LOCAL SECTIONS OK — ${rolled.length} cities: business-led why-exhibit, 3+ named venues with no invented partnerships, 4-8 local industries, the central production policy everywhere with no scarcity claims, and city-specific climate copy.`);

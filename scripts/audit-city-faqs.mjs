// §12 audit of the city-page FAQ block (visible FAQs + FAQPage schema source).
//
// Per city:
//   1. 6-8 FAQs, each phrased as a question.
//   2. All seven required themes are covered: shipping to the city · ordering
//      timeline · rush production · local convention-center delivery · best
//      displays for local venues · outdoor event suitability · backdrops,
//      banners or canopies.
//   3. Answer-first (AEO): every answer opens with a direct answer, not a
//      throat-clearing preamble or a hedge.
//   4. The venue-delivery FAQ must NOT imply a special delivery arrangement,
//      and must tell the customer to supply the exact receiving address and
//      follow the venue's current freight/labeling/delivery-window rules.
//
// Usage: node scripts/audit-city-faqs.mjs [--list]

import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const list = process.argv.includes('--list');
const fails = [];
const warns = [];

const THEMES = [
  ['shipping to the city', (q, a) => /\bship(s|ping|ped)?\b/i.test(q) && !/venue|convention center|receiving/i.test(q)],
  ['ordering timeline', (q, a) => /how (early|far ahead|soon)|when should i order|order for|in time for|lead time|timeline/i.test(q)],
  ['rush production', (q, a) => /rush/i.test(q)],
  ['convention-center delivery', (q, a) => /(convention center|convention centre|venue|deliver to|shipped to|delivery to)/i.test(q) && /receiving address|advance warehouse|freight/i.test(a)],
  ['best displays for local venues', (q, a) => /which displays|what displays|best (inside|for)|work best/i.test(q)],
  ['outdoor event suitability', (q, a) => /canop(y|ies)|outdoor/i.test(q)],
  ['backdrops / banners / canopies', (q, a) => /backdrop|banner|canop/i.test(q)]
];

// Answer-first: the first sentence must answer, not preface.
const PREAMBLE = /^(it depends|that depends|there are many|generally speaking|as with any|when it comes to|in order to|we understand|thanks for|great question|before we|first,)/i;
const DIRECT = /^(yes\b|no\b|very\b|[^.]{0,90}\b(are|is|works?|start|starts|runs?|ship|ships|packs?|anchors?|comes?|gives?|suit|suits|use|take|allow|production|standard|apex|a 2|expect|plan|count|match|pick|choose|ones)\b)/i;

const VENUE_DISCLAIMER = [
  [/(?:don|do not)[’']?t? have a special delivery arrangement|no special delivery arrangement/i, 'states there is no special delivery arrangement'],
  [/exact receiving address|receiving address you provide|give us the exact/i, 'asks for the exact receiving address'],
  [/freight, labeling and delivery-window|labeling and delivery-window|freight, labeling|delivery-window (?:rules|requirements)/i, "points at the venue's freight/labeling/delivery-window rules"]
];
const SPECIAL_ARRANGEMENT = /we (?:have|hold) an? (?:arrangement|account|agreement) with|direct (?:line|access) to the (?:venue|dock)|preferred (?:vendor|supplier) at|we deliver straight to the (?:floor|booth)/i;

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const faqs = CITY_DETAIL[city.slug].faqs || [];
  const F = (m) => fails.push(`${city.slug}: ${m}`);
  const names = [city.city, city.h1City, cityWithAbbr(city), ...( { 'washington-dc': ['Washington', 'D.C.'], 'new-york': ['NYC'], 'los-angeles': ['LA'] }[city.slug] || [])].filter(Boolean);

  if (faqs.length < 6 || faqs.length > 8) F(`${faqs.length} FAQs (want 6-8)`);

  const missing = THEMES.filter(([, test]) => !faqs.some(({ q, a }) => test(q, a))).map(([n]) => n);
  if (missing.length) F(`FAQ set does not cover: ${missing.join(', ')}`);

  // at least half the questions should name the city — these are local FAQs
  const localQs = faqs.filter(({ q }) => names.some((n) => q.includes(n))).length;
  if (localQs < Math.ceil(faqs.length / 2)) F(`only ${localQs}/${faqs.length} questions name the city`);

  for (const { q, a } of faqs) {
    if (!/\?$/.test(q)) F(`not a question: "${q}"`);
    if (PREAMBLE.test(a)) F(`answer is not answer-first: "${a.slice(0, 60)}…"`);
    else if (!DIRECT.test(a)) warns.push(`${city.slug}: answer may not open directly: "${a.slice(0, 60)}…"`);
    if (SPECIAL_ARRANGEMENT.test(a)) F(`implies a special venue delivery arrangement: "${a.match(SPECIAL_ARRANGEMENT)[0]}"`);
  }

  // the venue-delivery FAQ carries the full disclaimer
  // prefer the FAQ carrying the shipping disclaimer over a general freight question
  const venueCandidates = faqs.filter(({ q, a }) => /convention center|convention centre|venue|shipped to|deliver to/i.test(q) && /receiving address|advance warehouse|freight/i.test(a));
  const venueFaq = venueCandidates.find(({ a }) => /special delivery arrangement/i.test(a)) || venueCandidates[0];
  if (!venueFaq) F('no convention-center delivery FAQ');
  else {
    for (const [re, what] of VENUE_DISCLAIMER) {
      if (!re.test(venueFaq.a)) F(`venue-delivery FAQ never ${what}`);
    }
  }

  if (list) console.log(`${city.city.padEnd(16)} ${faqs.length} FAQs · ${localQs} name the city`);
}

// §13: answer-first must not become boilerplate. Across cities, the same FAQ
// slot should not open with one identical clause everywhere — EXCEPT where the
// answer states the central production policy, which §10 requires be worded
// identically on every page.
const POLICY = /6[–-]8 business days|2[–-]3 (?:business day )?(?:with )?rush/;
const MIN_DISTINCT = 5;
const slots = Math.max(...rolled.map((c) => (CITY_DETAIL[c.slug].faqs || []).length));
for (let i = 0; i < slots; i++) {
  const answers = rolled.map((c) => (CITY_DETAIL[c.slug].faqs || [])[i]).filter(Boolean).map((f) => f.a);
  if (answers.length < 10) continue;
  const policyAnswers = answers.filter((a) => POLICY.test(a.slice(0, 120))).length;
  if (policyAnswers > answers.length / 2) continue; // central policy — repetition is required
  const distinct = new Set(answers.map((a) => a.split(/\s+/).slice(0, 6).join(' '))).size;
  if (distinct < MIN_DISTINCT) {
    fails.push(`FAQ slot ${i + 1}: only ${distinct} distinct openings across ${answers.length} cities — reads as boilerplate`);
  }
}

warns.forEach((w) => console.log(`  ! ${w}`));
if (fails.length) {
  console.error(`\n✗ FAQ AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ FAQs OK — ${rolled.length} cities: 6-8 answer-first FAQs covering shipping, timeline, rush, venue delivery, best displays, outdoor use and product questions, with the venue-delivery disclaimer intact.`);

// Uniqueness gate for the product + city pages.
//
// The requirement is 60%+ genuinely unique local content per page. The failure
// mode it exists to prevent is specific and named: writing one city's page and
// producing the other by find-replacing the city name. That produces text which
// looks different to a diff and identical to a reader.
//
// So this measures twice.
//
//   1. Raw overlap between every pair of pages.
//   2. Overlap again with every city, venue and state name normalised away. Two
//      pages that only differed by their city name score ~0% on the first test
//      and ~100% on this one, which is exactly the clone this gate is for.
//
// The purchasing interface and product specifications are deliberately NOT
// measured. They are the same physical products and the brief says that overlap
// is acceptable — only the editorial content around them has to differ.
//
// Run after the data changes: node scripts/audit-city-product-uniqueness.mjs

import { CITY_PRODUCT_PAGES } from '../src/data/cityProductPages.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const MAX_OVERLAP = 40;          // 60%+ unique, as specified
const MAX_NORMALISED_OVERLAP = 55; // same product, city names removed — still must read differently
const WORD_FLOOR = 250;

const fails = [];
const warn = [];

// Editorial content only: the copy a reader would recognise as "the page".
const editorial = (p) =>
  [p.productIntro, p.intro, ...p.local.map((l) => `${l.h2} ${l.p}`), ...p.faqs.map((f) => `${f.q} ${f.a}`)]
    .join(' ');

const words = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Strip every place name, so a find-replaced clone cannot hide behind it.
const PLACES = [
  ...SEO_CITIES.flatMap((c) => [c.city, c.abbr, c.venue].filter(Boolean)),
  'Los Angeles', 'LA', 'Chicago', 'California', 'Illinois', 'Southern California',
  'Anaheim', 'McCormick Place', 'Donald E. Stephens', 'Rosemont', 'Lake Michigan',
  'Michigan Avenue', 'Santa Monica', 'Century City', 'Westside', 'Coachella'
];
const deplace = (t) => {
  let out = t;
  for (const place of PLACES.sort((a, b) => b.length - a.length)) {
    out = out.replaceAll(place.toLowerCase(), ' ');
  }
  return out.replace(/\s+/g, ' ').trim();
};

const shingles = (t, n = 5) => {
  const w = t.split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};
const overlap = (a, b) => {
  let hits = 0;
  a.forEach((x) => { if (b.has(x)) hits++; });
  const union = a.size + b.size - hits;
  return union ? (hits / union) * 100 : 0;
};

const pages = CITY_PRODUCT_PAGES.map((p) => {
  const raw = words(editorial(p));
  return { slug: p.slug, group: p.group, citySlug: p.citySlug, raw, plain: deplace(raw), wordCount: raw.split(' ').length };
});

// 1. Every page carries real content and names its own city.
for (const p of pages) {
  if (p.wordCount < WORD_FLOOR) fails.push(`${p.slug}: ${p.wordCount} words of local content (floor ${WORD_FLOOR})`);
  const city = SEO_CITIES.find((c) => c.slug === p.citySlug);
  if (city && !p.raw.includes(city.city.toLowerCase())) {
    fails.push(`${p.slug}: never names ${city.city} in its own copy`);
  }
}

// 1b. One product + one city = one indexable URL, and every keyword variation
// lives on that URL rather than on a page of its own. Two pages targeting the
// same product in the same city would split the signal between them, which is
// the cannibalisation this pilot is supposed to avoid.
const seenPair = new Map();
for (const p of pages) {
  const key = `${p.group}|${p.citySlug}`;
  if (seenPair.has(key)) {
    fails.push(`${p.slug} and ${seenPair.get(key)} both target ${p.group} in ${p.citySlug} — one product and one city must be one URL`);
  } else {
    seenPair.set(key, p.slug);
  }
}

// 1c. Each page must actually carry its own keyword variations. A variation
// with no home on the page is a page waiting to be created for it, which is how
// a clean set of URLs turns into a cannibalising one.
const STOP = new Set(['los', 'angeles', 'chicago', 'the', 'a', 'in', 'for', 'and', 'of']);
for (const p of CITY_PRODUCT_PAGES) {
  const text = words(
    [p.title, p.description, p.h1, p.productIntro, p.intro,
     ...p.local.map((l) => `${l.h2} ${l.p}`), ...p.faqs.map((f) => `${f.q} ${f.a}`)].join(' ')
  ).replace(/[^a-z0-9 -]/g, ' ');
  const uncovered = (p.secondary || []).filter((kw) => !kw.toLowerCase().split(' ')
    .filter((w) => !STOP.has(w))
    .every((t) => text.includes(t) || text.includes(t.replace('up', '-up')) || text.includes(`${t}s`)));
  if (uncovered.length) {
    fails.push(`${p.slug}: ${uncovered.length} keyword variation(s) have no home on the page — ${uncovered.join('; ')}`);
  }
}

// 2. Pairwise, both raw and with place names removed.
let worstRaw = { v: 0 };
let worstPlain = { v: 0 };
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i];
    const b = pages[j];
    const raw = overlap(shingles(a.raw), shingles(b.raw));
    const plain = overlap(shingles(a.plain), shingles(b.plain));
    if (raw > worstRaw.v) worstRaw = { v: raw, pair: `${a.slug} / ${b.slug}` };
    if (plain > worstPlain.v) worstPlain = { v: plain, pair: `${a.slug} / ${b.slug}` };

    if (raw > MAX_OVERLAP) {
      fails.push(`${a.slug} and ${b.slug} share ${raw.toFixed(1)}% of their copy (max ${MAX_OVERLAP}%)`);
    }
    // The clone test. Same product in two cities is the pair most at risk.
    if (plain > MAX_NORMALISED_OVERLAP) {
      const sameProduct = a.group === b.group;
      fails.push(
        `${a.slug} and ${b.slug} are ${plain.toFixed(1)}% identical once city names are removed ` +
        `(max ${MAX_NORMALISED_OVERLAP}%)` +
        (sameProduct ? ' — this is the find-and-replace pattern the brief prohibits' : '')
      );
    } else if (a.group === b.group && plain > MAX_NORMALISED_OVERLAP - 15) {
      warn.push(`${a.slug} / ${b.slug}: ${plain.toFixed(1)}% alike with city names removed — drifting toward a clone`);
    }
  }
}

if (warn.length) {
  console.warn('\n! CITY PRODUCT UNIQUENESS — approaching the limit:');
  warn.forEach((w) => console.warn(`  ! ${w}`));
}
if (fails.length) {
  console.error(`\n✗ CITY PRODUCT UNIQUENESS FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ CITY PRODUCT UNIQUENESS OK — ${pages.length} pages, ${pages.length * (pages.length - 1) / 2} pairs: ` +
  `worst overlap ${worstRaw.v.toFixed(1)}% (${(100 - worstRaw.v).toFixed(1)}% unique), and ` +
  `${worstPlain.v.toFixed(1)}% with city names stripped — no page is another with the city swapped.`
);

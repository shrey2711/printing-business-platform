// One decision, in one place: which editorial block appears on which of a
// city's five pages (/trade-show-displays|canopies|banner-stands|backdrops|
// table-covers/{city}). Both the prerenderer and CityCategoryPage render from
// this plan, so Googlebot's HTML and the hydrated page cannot drift apart.
//
// THE RULE: every block of a city's prose appears on exactly ONE of its five
// pages. Before this, all five pages repeated the whole city profile (answer,
// overview, venues, industries, shipping, planning, FAQs) and differed only by
// one ~100-word paragraph — five near-identical URLs per city, which is how
// Google ends up choosing its own canonical among them.
//
//   hub  /trade-show-displays   city profile: answer, why exhibit, venues,
//                               industries, best displays, booth-display
//                               section, venue note, general FAQs
//   /trade-show-canopies        local paragraph + canopy section + climate
//   /banner-stands              local paragraph + banner section + freight plan
//   /trade-show-backdrops       local paragraph + backdrop section
//   /table-covers               local paragraph + table-cover section
//   + each page carries only the FAQs whose topic is that page's product.
//
// A category page is only indexable when the city actually has its own local
// paragraph and product section; otherwise it would be a stub, so it is
// noindex (see `indexable`).

import { cityVenueName, SEO_CITIES, LOCAL_CATEGORIES } from './citySeo.js';
import { CITY_DETAIL } from './cityDetail.js';
import { states, provinces, territories } from './states.js';

const HUB = 'trade-show-displays';

// productSections[] index → the category page that owns it.
const SECTION_OWNER = {
  0: 'trade-show-displays',
  1: 'trade-show-canopies',
  2: 'trade-show-backdrops',
  3: 'banner-stands',
  4: 'table-covers'
};
const SECTION_FOR = Object.fromEntries(Object.entries(SECTION_OWNER).map(([i, slug]) => [slug, Number(i)]));

export const CATEGORY_LOCAL_H2 = {
  'trade-show-canopies': (c) => `Outdoor branding in ${c}`,
  'banner-stands': (c) => `Getting banner stands into ${c} venues`,
  'trade-show-backdrops': (c) => `Where ${c} exhibitors use backdrops`,
  'table-covers': (c) => `Table covers at ${c} shows`
};

// FAQ ownership by topic, first match wins. Anything that matches no product
// topic (shipping, ordering time, rush, receiving) is a general question and
// lives on the hub.
const FAQ_OWNER = [
  ['trade-show-canopies', /canop|outdoor|weight|wind|sun\b|rain|shade/i],
  ['banner-stands', /banner|retractable|x-stand|tabletop|aisle/i],
  ['trade-show-backdrops', /backdrop|step & repeat|step and repeat|tension|media wall|photo/i],
  ['table-covers', /table cover|tablecloth|fitted|stretch|pleated/i]
];
const faqOwner = (q) => (FAQ_OWNER.find(([, re]) => re.test(q)) || [HUB])[0];

// Boilerplate guard. Several detail fields (the "best displays" paragraph,
// the "do you ship / how early / rush" FAQ answers) are the same sentence in
// every city with the place name swapped. Rendered, they are exactly the
// duplicated text this plan exists to remove, so a block is only shown when
// most of it is NOT found in another city's copy. Place names are normalised
// first, so swapping "Chicago" for "Dallas" does not count as different.
const PLACES = [
  ...SEO_CITIES.flatMap((c) => [c.city, c.h1City, c.stateName, c.venueTag]),
  ...[...states, ...provinces, ...territories].flatMap((r) => [r.name, ...r.cities])
].filter(Boolean)
  .sort((a, b) => b.length - a.length)
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const PLACE_RE = new RegExp(`\\b(?:${PLACES.join('|')})\\b`, 'gi');
const shingles = (t) => {
  const w = t.replace(PLACE_RE, ' place ').toLowerCase().match(/[a-z0-9]+/g) || [];
  const out = new Set();
  for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' '));
  return out;
};
const leaves = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => leaves(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => leaves(x, out));
  return out;
};
let shingleOwners = null; // shingle -> Set(citySlug) over every city's copy
const owners = () => {
  if (shingleOwners) return shingleOwners;
  shingleOwners = new Map();
  for (const [slug, d] of Object.entries(CITY_DETAIL)) {
    for (const t of leaves(d)) for (const sh of shingles(t)) {
      if (!shingleOwners.has(sh)) shingleOwners.set(sh, new Set());
      shingleOwners.get(sh).add(slug);
    }
  }
  return shingleOwners;
};
// Share of `text` (place-normalised) that also appears in some OTHER city.
const sharedShare = (text, citySlug) => {
  const sh = [...shingles(text)];
  if (!sh.length) return 0;
  const o = owners();
  return sh.filter((x) => [...(o.get(x) || [])].some((c) => c !== citySlug)).length / sh.length;
};
const MAX_SHARED = 0.3;
const distinctive = (text, citySlug) => !!text && sharedShare(text, citySlug) <= MAX_SHARED;
// Drop only the sentences that are mostly template; keep the city's own
// sentences. Whole-paragraph filtering threw away too much real local copy.
const SENTENCE_RE = /(?<=[.!?])\s+(?=[A-Z0-9“"'])/;
const distinctSentences = (text, citySlug) => (text || '').split(SENTENCE_RE)
  .filter((sn) => (sn.match(/[A-Za-z0-9]+/g) || []).length < 7 || sharedShare(sn, citySlug) <= MAX_SHARED)
  .join(' ');

// A page is indexable only when this share of its own prose is not found on
// another page of the family (all 125 city x category pages). Mirrors
// scripts/audit-location-uniqueness.mjs, which verifies the rendered result at
// the same 80% bar; the margin absorbs the few generic words the renderers add.
// Same 80% bar as the rendered-page audit, plus a hair of margin for the few
// words the renderers add that the plan cannot see.
export const MIN_UNIQUE = 0.815;
export const MIN_UNIQUE_CATEGORY = 0.815;
const RENDER_OVERHEAD = 0; // the plan text already includes the renderer's fixed strings
const wordCount = (t) => (t.match(/[A-Za-z0-9]+/g) || []).length;

function buildPlan(city, cat, detail) {
  const slug = cat.slug;
  const isHub = slug === HUB;
  const sections = [];
  if (!detail) return { lead: '', answer: null, sections, faqs: [], distinctWords: 0, text: '', hasDetail: false };

  const keep = (t) => distinctSentences(t, city.slug) || null;
  // `core` blocks are the city's own writing and always render; the rest are
  // filtered when they turn out to be mostly the shared template.
  const add = (sec, core = false) => {
    const paras = (sec.paras || []).map((t) => keep(t)).filter(Boolean);
    if (!paras.length && !sec.bullets) return;
    sections.push({ ...sec, paras });
  };
  const section = detail.productSections?.[SECTION_FOR[slug]];
  const local = detail.categoryLocal?.[slug];
  // The lead is the per-city, per-category meta line — unique text, where the
  // generic cat.lead(city) template was identical across all 25 cities.
  // The hub's metaDescription is the same sentence frame in every city, so the
  // hub opens on its answer block instead and has no separate lead line.
  const lead = isHub ? '' : (keep(detail.categoryMeta?.[slug] || '') || '');

  if (isHub) {
    add({ id: 'why', h2: `Why exhibit in ${city.city}?`, paras: [...detail.overview, detail.whyExhibit] }, true);
    add({ id: 'venues', h2: `${cityVenueName(city)} and other ${city.city} venues`, bullets: detail.conventionCenters.map((v) => [v.name, v.desc]) }, true);
    add({ id: 'industries', h2: `Popular trade show industries in ${city.city}`, bullets: detail.industries }, true);
    if (detail.bestDisplays) add({ id: 'best', h2: `Best displays for ${city.city} trade shows`, paras: [detail.bestDisplays] });
    if (section) add({ id: 'section', h2: section.h2, paras: [section.body], links: section.links }, true);
    // Policy line the GEO audit requires on the hub: said once per city, on the
    // canonical page only, not on the four category pages.
    sections.push({ id: 'ordering', h2: `Ordering for ${city.city} shows`, paras: [`Indoor booths or outdoor activations, custom trade show displays and exhibition displays ship to ${city.city}, printed to order: 6–8 business days after you approve your free artwork proof (2–3 business day rush); transit time varies by destination. Apex has no special delivery arrangement with any venue.`] });
  } else {
    if (local && CATEGORY_LOCAL_H2[slug]) add({ id: 'local', h2: CATEGORY_LOCAL_H2[slug](city.city), paras: [local] }, true);
    if (section) add({ id: 'section', h2: section.h2, paras: [section.body], links: section.links });
    if (slug === 'trade-show-canopies' && detail.climate) add({ id: 'climate', h2: `Outdoor & climate tips for ${city.city}`, paras: [detail.climate] });
    if (slug === 'banner-stands' && detail.planning) add({ id: 'planning', h2: `Planning your ${city.city} booth`, paras: [detail.planning] });
  }

  const faqs = (detail.faqs || []).filter((f) => faqOwner(f.q) === slug && distinctive(f.a, city.slug));
  const trimmedAnswer = isHub ? keep(detail.answer) : null;
  const answer = isHub ? (wordCount(trimmedAnswer || '') >= 20 ? trimmedAnswer : detail.answer) : null;
  // Fixed strings the renderers wrap around the plan (H1, grid and FAQ headings).
  // Counted so the estimate matches what the rendered-page audit measures.
  const chrome = [`${cat.label} in ${city.h1City || city.city}, ${city.abbr}`, `${cat.label} for ${city.city} events`, faqs.length ? `${city.city} ${cat.label.toLowerCase()} FAQ` : '', 'Ships to'];
  const text = [...chrome, lead, answer, ...sections.flatMap((sec) => [sec.h2, ...(sec.paras || []), ...(sec.bullets || []).flat()]), ...faqs.flatMap((f) => [f.q, f.a])]
    .filter(Boolean).join(' ');
  return { lead, answer, sections, faqs, text, hasDetail: true };
}

// Share of each (city, category) page's text found on no other page of the
// family, computed once over every city x category combination.
let uniqueMap = null;
function uniques() {
  if (uniqueMap) return uniqueMap;
  const rows = [];
  for (const c of SEO_CITIES) for (const lc of LOCAL_CATEGORIES) {
    const d = CITY_DETAIL[c.slug];
    rows.push({ key: `${c.slug}/${lc.slug}`, sh: shingles6(buildPlan(c, lc, d).text) });
  }
  const freq = new Map();
  for (const r of rows) for (const x of r.sh) freq.set(x, (freq.get(x) || 0) + 1);
  // RENDER_OVERHEAD: shingles the renderers add that every page shares (H1,
  // product-grid heading, cross-links). Counting them keeps short pages honest.
  uniqueMap = new Map(rows.map((r) => [r.key, [...r.sh].filter((x) => freq.get(x) === 1).length / (r.sh.size + RENDER_OVERHEAD)]));
  return uniqueMap;
}
function shingles6(t) {
  const w = t.replace(PLACE_RE, ' place ').toLowerCase().match(/[a-z0-9]+/g) || [];
  const out = new Set();
  for (let i = 0; i + 6 <= w.length; i++) out.add(w.slice(i, i + 6).join(' '));
  return out;
}

export function cityPagePlan(city, cat, detail) {
  const plan = buildPlan(city, cat, detail);
  const unique = uniques().get(`${city.slug}/${cat.slug}`) ?? 0;
  return { ...plan, unique, indexable: !!detail && unique >= (cat.slug === HUB ? MIN_UNIQUE : MIN_UNIQUE_CATEGORY) };
}

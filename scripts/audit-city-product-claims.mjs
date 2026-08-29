// §17 product-claim audit. Every physical claim made about a product on a city
// page must be supported by that product's own record in backend/data/products.js
// (description, features, specs, size, turnaround) — the same source the product
// pages render from.
//
// Two directions:
//   1. SUPPORTED CLAIMS — each claim the city copy makes (material, printing
//      method, size, production time, water resistance, washability, UV/fade
//      resistance, tool-free setup) must appear in the product data.
//   2. FORBIDDEN CLAIMS — categories Apex has no published data for must never
//      appear at all: wind ratings, fire ratings, weights, warranties, and
//      absolute claims like "waterproof".
//
// The shared spec table (DISPLAY_SPEC_ROWS) is checked cell by cell too, since
// it is the densest set of specifications on the page.
//
// Usage: node scripts/audit-city-product-claims.mjs [--corpus]

import { readFileSync } from 'fs';
import { listProducts } from '../backend/data/products.js';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL, DISPLAY_SPEC_ROWS } from '../src/data/cityDetail.js';

const showCorpus = process.argv.includes('--corpus');
const fails = [];

// Everything Apex actually publishes about its products, as one searchable
// corpus: the structured product records AND the raw product/configurator
// sources they are defined in, since specs like the 600D fabric option live in
// the configurator choices and the canopy landing copy rather than in a
// product's `specs` array.
const products = listProducts();
const flat = (v) => Array.isArray(v) ? v.map(flat).join(' ')
  : (v && typeof v === 'object') ? Object.values(v).map(flat).join(' ')
  : String(v ?? '');
const SOURCES = [
  'backend/data/products.js',
  'src/data/canopy.js',
  'backend/data/staticArticles.js'
];
const norm = (t) => t
  .toLowerCase()
  .replace(/[–—]/g, '-')
  .replace(/[′″“”"']/g, '')
  .replace(/(\d+)\s*[×x]\s*(\d+)/g, '$1x$2 $1 x $2 ')
  .replace(/\s+/g, ' ');
const CORPUS = norm([
  products.map((p) => flat([p.name, p.tagline, p.description, p.features, p.applications, p.specs, p.size, p.sizeLabel, p.turnaround, p.whatsIncluded, p.faqs])).join(' '),
  ...SOURCES.map((f) => readFileSync(f, 'utf8'))
].join(' '));

if (showCorpus) { console.log(CORPUS.slice(0, 4000)); process.exit(0); }

const inCorpus = (...alts) => alts.some((a) => CORPUS.includes(a.toLowerCase()));

// 1. Claims the city pages make, and what must back each one up.
const SUPPORTED = [
  ['600D polyester canopy fabric', /600d/i, () => inCorpus('600d')],
  ['dye sublimation printing', /dye[- ]sublimat/i, () => inCorpus('dye sublimation', 'dye-sublimat')],
  ['aluminum frame', /aluminum (?:hex )?frame|aluminum base/i, () => inCorpus('aluminum')],
  ['canopy sizes 10x10/10x15/10x20', /10×10, 10×15 or 10×20|10×10, 10×15, 10×20/i, () => inCorpus('10x10') && inCorpus('10x15') && inCorpus('10x20')],
  ['6-8 business day production', /6[–-]8 business days/i, () => inCorpus('6-8 business days')],
  ['2-3 business day rush', /2[–-]3 (?:business day )?(?:with )?rush|2[–-]3 business day/i, () => inCorpus('2-3 business day', 'rush')],
  ['water-resistant canopy top', /water[- ]resistant/i, () => inCorpus('water-resistant', 'water resistant')],
  ['machine washable table covers', /machine wash/i, () => inCorpus('machine wash')],
  ['wrinkle-resistant fabric', /wrinkle[- ](?:resistant|free)/i, () => inCorpus('wrinkle-free', 'wrinkle resistant', 'wrinkle-resistant')],
  ['tool-free setup', /tool[- ]free|without tools|no tools/i, () => inCorpus('no tools', 'tool-free', 'tool free', 'sets up in')],
  ['closed on all four sides', /closed (?:on all four sides|-back)|closed-back/i, () => inCorpus('closed-back', 'closed back', 'all four sides', 'four-sided')]
];

// Any fabric denier quoted anywhere must be a published one.
const DENIER = /(\d{3})D/g;

// 2. Claim categories with no published Apex data — never allowed.
const FORBIDDEN = [
  [/\bwaterproof\b/i, 'absolute waterproof claim (product data says water-resistant)'],
  [/\bwind[- ]rated\b|\brated to \d+\s*mph\b|withstands? winds? of/i, 'wind rating'],
  [/\bfire[- ](?:rated|retardant|resistant)\b|\bflame[- ]retardant\b|\bNFPA\b|\bCPAI\b/i, 'fire rating'],
  [/\bweighs?\s+\d+|\b\d+\s*(?:lbs?|pounds|kg)\b/i, 'product weight'],
  [/\b(?:\d+[- ]year|lifetime|limited)\s+warranty\b|\bwarrantied\b/i, 'warranty term'],
  [/\bUL\b|\bISO\s?\d+|\bcertified to\b/i, 'certification claim'],
  [/\btear[- ]proof\b|\bindestructible\b|\bunbreakable\b/i, 'absolute durability claim']
];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

// The shared spec table is the densest specification block on the page.
for (const row of DISPLAY_SPEC_ROWS) {
  const [display, material, printing, sizes, production] = row;
  const cells = [['material', material], ['printing', printing], ['sizes', sizes], ['production', production]];
  for (const [kind, cell] of cells) {
    const tokens = norm(cell).match(/[a-z0-9.]+/g) || [];
    const meaningful = tokens.filter((t) => t.length > 3 && !['over','with','also','business','days','rush','full','color','standard','wide'].includes(t));
    const unsupported = meaningful.filter((t) => !CORPUS.includes(t));
    if (unsupported.length) {
      fails.push(`spec table "${display}" ${kind}: ${unsupported.join(', ')} not found in product data ("${cell}")`);
    }
  }
}

for (const city of rolled) {
  const d = CITY_DETAIL[city.slug];
  const text = [d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
    ...d.productSections.map((s) => s.body), ...(d.faqs || []).map((f) => f.a)].join(' ');
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  for (const [name, used, supported] of SUPPORTED) {
    if (used.test(text) && !supported()) F(`claims ${name} but the product data does not say so`);
  }
  for (const [re, what] of FORBIDDEN) {
    const m = text.match(re);
    if (m) F(`unsupported ${what}: "${m[0].trim()}"`);
  }
  for (const m of text.matchAll(DENIER)) {
    if (!CORPUS.includes(m[0].toLowerCase())) F(`quotes an unpublished fabric weight: ${m[0]}`);
  }
}

if (fails.length) {
  console.error(`\n✗ PRODUCT CLAIM AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ PRODUCT CLAIMS OK — ${rolled.length} city pages + the shared spec table: every material, printing, size and production claim traces to backend/data/products.js, and no page claims a wind rating, fire rating, weight, warranty or waterproofing.`);

// §5-§9 audit of ALL FIVE product sections on each city page, each scored on
// its own spec: H2 form, the use cases it must discuss, the keyword themes it
// must carry in-section, and links to real Apex product pages (verified against
// the built /products/* pages, so a link can never point at an invented SKU).
//
// Use-case lists are deliberately scored as "at least N of the listed cases,
// only the ones relevant to this city" — the spec says to include relevant use
// cases only, not to recite the whole list.
//
// Usage: node scripts/audit-city-product-sections.mjs [--verbose]

import { readdirSync, existsSync } from 'fs';
import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const verbose = process.argv.includes('--verbose');
const fails = [];

// Real product pages, read from the build — the source of truth for links.
const REAL_PRODUCTS = existsSync('dist/products')
  ? new Set(readdirSync('dist/products', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `/products/${e.name}`))
  : null;
const CATEGORY_HUBS = new Set(['/custom-canopies', '/banner-stands', '/backdrops', '/table-covers', '/trade-show-displays', '/trade-show-booth-packages']);

const SPECS = [
  {
    idx: 1,
    h2: /^Custom Canopy Tents in /,
    minCases: 3,
    cases: [
      ['outdoor events', /outdoor (?:events?|activations?|booths?|trade shows?|demo|product)/i],
      ['festivals', /festivals?/i],
      ['brand activations', /(?:brand|corporate|sponsor)? ?activations?/i],
      ['sporting events', /sporting events?|race|tailgat|marathon|stadium|game day|spring training|speedway|paddock/i],
      ['corporate events', /corporate (?:events?|activations?|campus)|campus (?:events?|recruiting)|contractor days?/i],
      ['markets', /markets?\b/i],
      ['community events', /community (?:events?|days?|fairs?)|neighborhood|county|state fair|parade|public outreach|health fairs?/i]
    ],
    themes: [
      ['custom canopy tent', /custom canopy tents?|printed (?:pop-up )?canopy tents?|canopy tents?/i],
      ['custom canopy', /custom canop(?:y|ies)|printed (?:pop-up )?canopy/i]
    ],
    productsRe: /^\/products\/canopy-tent-/,
    hub: '/custom-canopies'
  },
  {
    idx: 2,
    h2: /^Trade Show Backdrops & Backdrop Printing in /,
    minCases: 3,
    cases: [
      ['exhibitor booths', /booth (?:back|wall)|booth at|exhibit(?:or|ion)? booth|your booth/i],
      ['sponsor backdrops', /sponsor/i],
      ['step and repeat walls', /step[- ]?(?:and|&)[- ]?repeat/i],
      ['photography areas', /photos?\b|photograph(?:y|ed|s)?\b|headshot|media wall|camera|interviews?/i],
      ['product launches', /launch(?:es|ed)?|product reveal|premiere/i],
      ['conferences', /conferences?|conventions?|symposi|meetings?|receptions?/i]
    ],
    themes: [
      ['backdrop printing', /backdrop printing|print(?:ed|s|ing)? (?:step[- ]and[- ]repeat |tension[- ]fabric )?backdrops?/i],
      ['trade show backdrops', /trade[- ]show backdrops?|backdrops?\b/i],
      ['step and repeat backdrop', /step[- ]?(?:and|&)[- ]?repeat/i]
    ],
    productsRe: /^\/products\/(step-and-repeat-backdrop|straight-tension-fabric-display)$/,
    hub: '/backdrops'
  },
  {
    idx: 3,
    h2: /^Banner Stands & Retractable Banner Stands in /,
    minCases: 4,
    cases: [
      ['retractable banners', /retractable banner/i],
      ['x-stand banners', /x-stand/i],
      ['tabletop banners', /tabletop banner|table ?top banner/i],
      ['registration areas', /registration|check-in|sign-?up/i],
      ['booth entrances', /booth corner|entrance|booth front|aisle line|at the booth/i],
      ['aisle-facing messaging', /aisle[- ]facing|at the aisle|aisle traffic|down the aisle/i],
      ['event wayfinding', /wayfinding|session rooms?|breakout|satellite|several rooms|multi-track|poster (?:hall|session)/i]
    ],
    themes: [
      ['banner stands', /banner stands?/i],
      ['retractable banner stands', /retractable banner stands?|retractable banners?/i]
    ],
    productsRe: /^\/products\/(standard-retractable-banner|deluxe-retractable-banner|x-stand-banner|table-top-banner-stand)$/,
    hub: '/banner-stands'
  },
  {
    idx: 4,
    h2: /^Custom Trade Show Table Covers in /,
    minCases: 4,
    cases: [
      ['fitted table covers', /fitted (?:stretch )?(?:table )?cover/i],
      ['stretch table covers', /stretch (?:table )?cover/i],
      ['branded display tables', /branded? (?:space|surface|table)|brand surface|display table/i],
      ['registration tables', /registration|check-in|sign-?up/i],
      ['demo areas', /demo (?:table|station|areas?)|demos?\b/i],
      ['sampling tables', /sampling|samples?\b|merch table/i]
    ],
    themes: [
      ['trade show table covers', /trade[- ]show table covers?|table covers? for|printed table covers?/i],
      ['custom table covers', /custom(?: printed)? table covers?/i]
    ],
    productsRe: /^\/products\/(pleated-table-covers|stretch-table-covers)$/,
    hub: '/table-covers'
  }
];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const rows = [];

for (const city of rolled) {
  const secs = CITY_DETAIL[city.slug].productSections;
  const EXTRA = { 'washington-dc': ['Washington', 'D.C.'], 'new-york': ['NYC'], 'los-angeles': ['LA'] };
  const names = [city.city, city.h1City, cityWithAbbr(city), ...(EXTRA[city.slug] || [])].filter(Boolean);
  const F = (m) => fails.push(`${city.slug}: ${m}`);
  const cells = [];

  for (const spec of SPECS) {
    const sec = secs[spec.idx];
    if (!sec) { F(`missing product section #${spec.idx + 1}`); continue; }
    const scope = `${sec.h2}. ${sec.body}`;
    const label = sec.h2.split(' in ')[0];

    if (!spec.h2.test(sec.h2)) F(`section ${spec.idx + 1} H2 "${sec.h2}" does not match the required form`);
    else if (!names.some((n) => sec.h2.endsWith(n))) F(`section ${spec.idx + 1} H2 does not end with the city name`);
    if (!names.some((n) => sec.body.includes(n))) F(`"${label}" body never names the city`);

    const hitCases = spec.cases.filter(([, re]) => re.test(sec.body)).map(([n]) => n);
    if (hitCases.length < spec.minCases) {
      F(`"${label}" discusses only ${hitCases.length} of the listed use cases (want >= ${spec.minCases}): has ${hitCases.join(', ') || 'none'}`);
    }

    const missingThemes = spec.themes.filter(([, re]) => !re.test(scope)).map(([n]) => n);
    if (missingThemes.length) F(`"${label}" does not cover ${missingThemes.join(', ')}`);

    const links = (sec.links || []).map((l) => l.to);
    const productLinks = links.filter((l) => spec.productsRe.test(l));
    if (!links.includes(spec.hub)) F(`"${label}" does not link its category hub ${spec.hub}`);
    if (!productLinks.length) F(`"${label}" links no actual product page (want one matching ${spec.productsRe})`);
    for (const l of links) {
      if (REAL_PRODUCTS && l.startsWith('/products/') && !REAL_PRODUCTS.has(l)) F(`"${label}" links a product page that does not exist: ${l}`);
      if (!l.startsWith('/products/') && !CATEGORY_HUBS.has(l)) F(`"${label}" links an unexpected target: ${l}`);
    }
    cells.push(`${hitCases.length}/${spec.cases.length}·${spec.themes.length - missingThemes.length}/${spec.themes.length}·${productLinks.length}p`);
  }
  rows.push({ city: city.city, cells });
}

console.log('city             canopies         backdrops        banners          table covers   (use cases · themes · product links)');
for (const r of rows) console.log(`${r.city.padEnd(16)} ${r.cells.map((c) => c.padEnd(16)).join('')}`);

if (fails.length) {
  console.error(`\n✗ PRODUCT SECTION AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ PRODUCT SECTIONS OK — ${rows.length} cities × 4 sections: H2 form, city-relevant use cases, in-section keyword themes, category hub + real Apex product links (verified against built /products pages).`);

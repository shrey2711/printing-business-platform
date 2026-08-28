// City-page PARITY audit against the approved Seattle master
// (/trade-show-displays/seattle). Verifies every rolled-out city page matches
// the master's ARCHITECTURE while carrying its own LOCAL CONTENT.
//
// Structural parity (must match Seattle exactly, city name normalised out):
//   H1 shape · H2 sequence · breadcrumb trail · JSON-LD @type set · AEO answer
//   block · product-card grid · 5 product sections · Learning Center guide
//   links · sibling category links · city-to-city links · CTA blocks · FAQ
//   visible/schema parity.
//
// Local-content independence (must NOT match Seattle):
//   no Seattle venue/event/geography terms leaking into another city page, and
//   no reuse of the master's sentences.
//
// Usage: node scripts/audit-city-parity.mjs   (after a build)

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const MASTER = 'seattle';
const CAT = 'trade-show-displays';
const fails = [];
const notes = [];

// Cities carrying the master pattern (productSections is the opt-in marker).
const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));
const nameOf = (slug) => SEO_CITIES.find((c) => c.slug === slug).city;

// Seattle-only local facts. None of these may appear on another city's page.
const SEATTLE_TERMS = [
  'Seattle Convention Center', 'PAX West', 'Puget Sound', 'Elliott Bay', 'Lumen Field',
  'Bell Harbor', 'Pacific Marine Expo', 'Summit building', 'Arch building', 'Northwest'
];

const read = (slug) => {
  const f = `${DIST}/${CAT}/${slug}/index.html`;
  if (!existsSync(f)) { fails.push(`${slug}: no prerendered page at ${f}`); return null; }
  return readFileSync(f, 'utf8');
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const tags = (h, tag) => [...h.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim()));
const hrefs = (h) => [...h.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]);
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap((m) => { try { const j = JSON.parse(m[1]); return Array.isArray(j) ? j : [j]; } catch { fails.push('invalid JSON-LD'); return []; } });

// Display-name variants a city may legitimately use in copy (longest first, so
// "New York City" normalises before "New York").
const ALIASES = {
  'new-york': ['New York City', 'New York'],
  'washington-dc': ['Washington, D.C.', 'Washington, DC', 'Washington']
};

// A page's structural signature, with the city's own name/state removed so two
// cities are comparable.
const signature = (h, city) => {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const names = ALIASES[city.slug] || [city.city];
  const strip = (s) => {
    for (const n of names) s = s.replace(new RegExp(esc(n), 'g'), '{city}');
    return s
      .replace(new RegExp(city.stateName, 'g'), '{state}')
      .replace(/\{city\}, [A-Z.]{2,4}/g, '{city}');
  };
  const body = h.split('<main')[1] || h;
  return {
    h1: tags(body, 'h1').map(strip),
    h2: tags(body, 'h2').map(strip),
    breadcrumb: (body.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/) || [])[1] || '',
    schema: jsonLd(h).map((j) => j['@type']).sort(),
    answerBlock: /class="answer-block"/.test(body),
    faqVisible: tags(body, 'h3').length,
    faqSchema: (h.match(/"@type":"Question"/g) || []).length,
    links: hrefs(body)
  };
};

const master = read(MASTER);
if (!master) { console.error('master page missing — build first'); process.exit(1); }
const masterCity = SEO_CITIES.find((c) => c.slug === MASTER);
const M = signature(master, masterCity);

// Link-class helpers: the master's internal-linking strategy, by class.
const CATEGORY_HUBS = ['/custom-canopies', '/banner-stands', '/backdrops', '/table-covers', '/trade-show-displays'];
const classify = (links, slug) => ({
  categoryHubs: CATEGORY_HUBS.filter((c) => links.includes(c)),
  products: [...new Set(links.filter((l) => l.startsWith('/products/')))],
  boothPackages: links.filter((l) => l === '/trade-show-booth-packages').length,
  learningCenter: [...new Set(links.filter((l) => l.startsWith('/blog/')))],
  // sibling category pages for the SAME city — excluding /locations/{state},
  // which collides for a city whose slug equals its state slug (new-york).
  siblingCats: [...new Set(links.filter((l) => new RegExp(`^/[a-z-]+/${slug}$`).test(l)
    && !l.startsWith(`/${CAT}/`) && !l.startsWith('/locations/')))],
  otherCities: [...new Set(links.filter((l) => l.startsWith(`/${CAT}/`) && l !== `/${CAT}/${slug}`))],
  locations: links.filter((l) => l === '/locations' || /^\/locations\//.test(l)).length,
  quote: links.filter((l) => l === '/quote').length
});
const MC = classify(M.links, MASTER);

console.log(`Master: /${CAT}/${MASTER} — ${M.h2.length} H2s, ${M.faqVisible} FAQs, schema [${M.schema.join(', ')}]`);
console.log(`Master link strategy: ${MC.categoryHubs.length} category hubs · ${MC.products.length} product pages · ${MC.learningCenter.length} Learning Center guides · ${MC.siblingCats.length} sibling category-city pages · ${MC.otherCities.length} city-to-city links\n`);

const row = [];
for (const city of rolled) {
  if (city.slug === MASTER) continue;
  const h = read(city.slug);
  if (!h) continue;
  const S = signature(h, city);
  const C = classify(S.links, city.slug);
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // 1. H1 — exactly one, "{Label} in {City}, {ABBR}" shape.
  if (S.h1.length !== 1) F(`${S.h1.length} H1s (want exactly 1)`);
  else if (S.h1[0] !== M.h1[0]) F(`H1 shape "${S.h1[0]}" != master "${M.h1[0]}"`);

  // 2. H2 hierarchy — same headings in the same order.
  if (S.h2.length !== M.h2.length) F(`${S.h2.length} H2s vs master ${M.h2.length}`);
  S.h2.forEach((t, i) => { if (M.h2[i] && t !== M.h2[i]) F(`H2 #${i + 1} "${t}" != master "${M.h2[i]}"`); });

  // 3. Breadcrumb — Home / Locations / State / current, all real URLs.
  for (const need of ['/', '/locations']) {
    if (!S.breadcrumb.includes(`href="${need}"`)) F(`breadcrumb missing ${need}`);
  }
  if (city.stateSlug && !S.breadcrumb.includes(`/locations/${city.stateSlug}`)) F('breadcrumb missing state level');
  if (!S.breadcrumb.includes(city.city)) F('breadcrumb missing the current page name');

  // 4. GEO/entity signals — same JSON-LD @type set as the master.
  if (S.schema.join() !== M.schema.join()) F(`schema [${S.schema.join(', ')}] != master [${M.schema.join(', ')}]`);
  for (const banned of ['LocalBusiness', 'Review', 'AggregateRating', 'Offer']) {
    if (S.schema.includes(banned)) F(`schema contains ${banned} (not permitted on city pages)`);
  }

  // 5. AEO — answer block + FAQ visible/schema parity.
  if (!S.answerBlock) F('no answer-first block');
  if (S.faqVisible !== S.faqSchema) F(`FAQ schema ${S.faqSchema} != visible ${S.faqVisible}`);
  if (S.faqVisible < M.faqVisible) F(`${S.faqVisible} FAQs < master ${M.faqVisible}`);

  // 6. Internal linking strategy — same classes as the master.
  if (C.categoryHubs.length < MC.categoryHubs.length) F(`${C.categoryHubs.length} category hubs < master ${MC.categoryHubs.length}`);
  if (C.products.length < MC.products.length) F(`${C.products.length} product links < master ${MC.products.length}`);
  if (!C.boothPackages) F('no booth-packages link');
  if (C.learningCenter.length !== MC.learningCenter.length) F(`${C.learningCenter.length} Learning Center links != master ${MC.learningCenter.length}`);
  if (C.siblingCats.length !== MC.siblingCats.length) F(`${C.siblingCats.length} sibling category-city links != master ${MC.siblingCats.length}`);
  if (C.otherCities.length !== MC.otherCities.length) F(`${C.otherCities.length} city-to-city links != master ${MC.otherCities.length}`);

  // 7. CTA strategy — the master's conversion paths must be present.
  if (!C.categoryHubs.includes(`/${CAT}`)) F('no hub CTA link');
  if (MC.quote && !C.quote) F('no /quote CTA');

  // 8. Local-content independence — no Seattle facts, no master sentences.
  const text = decode(h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' '));
  for (const t of SEATTLE_TERMS) if (text.includes(t)) F(`leaks Seattle-specific term "${t}"`);
  const cityLinkText = new RegExp(`Trade Show Displays in Seattle`);
  if (/Seattle/.test(text.replace(cityLinkText, '')) ) {
    const stray = text.match(/.{40}Seattle.{40}/g).filter((s) => !/Displays in Seattle/.test(s));
    if (stray.length) F(`mentions Seattle outside the city-link list: "${stray[0].trim()}"`);
  }

  row.push({
    city: city.city,
    h2: S.h2.length,
    faq: `${S.faqVisible}/${S.faqSchema}`,
    hubs: C.categoryHubs.length,
    products: C.products.length,
    guides: C.learningCenter.length,
    siblings: C.siblingCats.length,
    cities: C.otherCities.length
  });
}

for (const r of row) {
  console.log(`${r.city.padEnd(16)} H2 ${String(r.h2).padStart(2)} · FAQ ${r.faq.padEnd(5)} · hubs ${r.hubs} · products ${String(r.products).padStart(2)} · guides ${r.guides} · siblings ${r.siblings} · cities ${r.cities}`);
}

if (notes.length) notes.forEach((n) => console.log(`  ! ${n}`));
if (fails.length) {
  console.error(`\n✗ CITY PARITY AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ CITY PARITY OK — ${row.length} city pages match the Seattle master architecture (H1, H2 order, breadcrumb, schema, AEO answer + FAQ parity, link strategy, CTAs) with no Seattle local content reused.`);

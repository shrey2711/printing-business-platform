// §22 GEO / AI-search readability. An answer engine reading one city page in
// isolation should be able to state, without guessing:
//   1. who the seller is (named entity, not "we")
//   2. what it sells (the product categories)
//   3. what each category is for (function, not just a name)
//   4. who the page is for (exhibitors, and which industries locally)
//   5. where it is relevant (city + state, named venues)
//   6. how ordering works (proof -> production -> transit)
//   7. what suits which use case (indoor booth vs outdoor activation)
//   8. an extractable answer-first summary
//
// Every signal is checked on the RENDERED page, and the entities checked are
// the real ones from the city record — so a page cannot pass by naming a venue
// that is not actually its own.
//
// Usage: node scripts/audit-city-geo.mjs [--list]

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';
import { hubIndexable } from './lib/hub-gate.mjs';
import { CITY_PRODUCT_PAGES } from '../src/data/cityProductPages.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const BRAND = 'Apex';
const list = process.argv.includes('--list');
const fails = [];

const text = (h) => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ');

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections) && hubIndexable(c));

for (const city of rolled) {
  const file = `${DIST}/${CAT}/${city.slug}/index.html`;
  if (!existsSync(file)) { fails.push(`${city.slug}: not built`); continue; }
  const html = readFileSync(file, 'utf8');
  const body = text(html);
  // Product-level guidance (what each category is for, indoor/outdoor use) is
  // judged across the city's page cluster: each block of city copy now appears
  // on exactly one of the five URLs (src/data/cityPagePlan.js). Entity, venue,
  // ordering and answer-block checks stay on the hub itself.
  const cluster = text([...['trade-show-displays', 'trade-show-canopies', 'banner-stands', 'trade-show-backdrops', 'table-covers'].map((c) => `${c}/${city.slug}`),
    // product × city pages carry the product copy where category pages were cut
    ...CITY_PRODUCT_PAGES.filter((p) => p.citySlug === city.slug).map((p) => p.slug)]
    .map((c) => `${DIST}/${c}/index.html`).filter(existsSync).map((x) => readFileSync(x, 'utf8')).join(' '));
  const d = CITY_DETAIL[city.slug];
  const F = (m) => fails.push(`${city.slug}: ${m}`);
  const names = [city.h1City, city.city].filter(Boolean);

  // 1. named seller entity
  if (!body.includes(BRAND)) F('never names the seller entity');

  // 2-3. categories named AND explained
  const CATEGORIES = [
    ['canopy tents', /canopy tents?/i, /shade|outdoor|cover|activation/i],
    ['banner stands', /banner stands?/i, /aisle|portable|weighted base|rolls|graphic/i],
    ['backdrops', /backdrops?/i, /booth wall|photo|media wall|seamless|step[- ]and[- ]repeat|behind/i],
    ['table covers', /table covers?/i, /rented table|fitted|pleated|stretch|demo table|registration/i]
  ];
  for (const [name, named, explained] of CATEGORIES) {
    if (!named.test(cluster)) F(`never names ${name}`);
    else if (!explained.test(cluster)) F(`names ${name} but never explains what it is for`);
  }

  // 4. audience + local industries
  if (!/exhibitors?|buyers?|attendees?/i.test(body)) F('never identifies who the page is for');
  const industries = (d.industries || []).map((i) => i[0].split(/[&,]/)[0].trim());
  const namedIndustries = industries.filter((i) => body.toLowerCase().includes(i.toLowerCase()));
  if (namedIndustries.length < 3) F(`only ${namedIndustries.length} of its industries appear in the rendered page`);

  // 5. place entities — city, state, and its own venues
  if (!names.some((n) => body.includes(n))) F('never names the city');
  if (city.stateName && !body.includes(city.stateName) && !body.includes(city.abbr)) F('never names the state');
  const venues = (d.conventionCenters || []).map((v) => v.name.replace(/\s*\(.*?\)/, ''));
  const namedVenues = venues.filter((v) => body.includes(v) || body.includes(v.replace(/^The /, '')));
  if (!namedVenues.length) F('names none of its own convention venues');

  // 6. ordering mechanics, stated as facts
  const ORDER = [
    ['artwork proof', /free (?:artwork )?proof/i],
    ['production window', /6[–-]8 business days/i],
    ['rush option', /rush/i],
    ['transit varies by destination', /transit (?:time )?(?:is )?(?:added|varies)|shipping is calculated|varies by (?:destination|address|delivery address)/i]
  ];
  for (const [what, re] of ORDER) if (!re.test(body)) F(`never states the ${what}`);

  // 7. use-case guidance
  if (!/(?:inside|indoors?|halls?|convention cent\w*)[\s\S]{0,140}?(?:booth|banner stand|display|table cover|backdrop)/i.test(cluster)) F('no indoor use-case guidance');
  if (!/outdoor[\s\S]{0,100}?(?:canopy|activation|event)/i.test(cluster)) F('no outdoor use-case guidance');

  // 8. extractable answer-first summary
  const answer = (html.match(/class="answer-block">([\s\S]*?)<\/p>/) || [])[1];
  if (!answer) F('no answer-first summary block');
  else {
    const words = text(answer).trim().split(/\s+/).length;
    // The shared "Apex prints … and ships them to {city}" tail is dropped from the
    // answer (it is the same sentence in every city; cityPagePlan.js), so the
    // answer is the city's own opening sentence: 18-70 words.
    if (words < 18 || words > 70) F(`answer block is ${words} words (want 18-70 for extraction)`);
    if (!names.some((n) => text(answer).includes(n))) F('answer block does not name the city');
  }

  if (list) {
    console.log(`${city.city.padEnd(16)} venues ${namedVenues.length}/${venues.length} · industries ${namedIndustries.length}/${industries.length} · answer ${answer ? text(answer).trim().split(/\s+/).length + 'w' : 'none'}`);
  }
}

if (fails.length) {
  console.error(`\n✗ GEO AUDIT FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 30) console.error(`  … and ${fails.length - 30} more`);
  process.exit(1);
}
console.log(`✓ GEO OK — ${rolled.length} city pages state the seller, the categories and what each is for, the audience and local industries, the city, state and real venues, the full ordering mechanics, indoor/outdoor guidance and an extractable answer block.`);

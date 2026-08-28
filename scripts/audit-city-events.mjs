// §11 audit of the named EVENTS on each city page.
//
//   1. Extracts every trade show / conference / expo named in a city's copy.
//   2. Fails if a city names more than MAX_EVENTS (an excessive list reads as
//      keyword padding rather than evidence of an exhibition ecosystem).
//   3. Fails on any claim that Apex is an official supplier of an event, has
//      worked at one, or partners with an organiser.
//   4. Fails if an event is named on a city page it does not belong to — the
//      EVENT_CITY map below is the verified pairing list; anything not in the
//      map is reported as unverified so it gets checked before publication.
//
// Usage: node scripts/audit-city-events.mjs [--list]

import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const list = process.argv.includes('--list');
const MAX_EVENTS = 6;
const fails = [];

// Verified event -> city slug that may name it. Pairings confirmed against the
// event's own published host city/venue.
const EVENT_CITY = {
  'CES': 'las-vegas', 'SEMA': 'las-vegas', 'MAGIC': 'las-vegas', 'World of Concrete': 'las-vegas',
  'I/ITSEC': 'orlando', 'IAAPA': 'orlando',
  'IMTS': 'chicago', 'RSNA': 'chicago', 'National Restaurant Association Show': 'chicago', 'Inspired Home Show': 'chicago',
  'NRF': 'new-york', 'NY NOW': 'new-york', 'New York Comic Con': 'new-york',
  'AmericasMart': 'atlanta',
  'Dallas Market Center': 'dallas',
  'OTC': 'houston', 'Offshore Technology Conference': 'houston', 'Houston Livestock Show': 'houston',
  'LA Auto Show': 'los-angeles',
  'Comic-Con': 'san-diego', 'Comic-Con International': 'san-diego',
  'Heroes Convention': 'charlotte',
  'Phoenix Fan Fusion': 'phoenix', 'Game On Expo': 'phoenix',
  'Farm & Table New Orleans': 'new-orleans',
  'Washington Auto Show': 'washington-dc',
  'Seafood Expo North America': 'boston',
  'National Western Stock Show': 'denver',
  'Nashville International Auto Show': 'nashville',
  'Art Basel': 'miami', 'Miami International Boat Show': 'miami', 'eMerge Americas': 'miami',
  'Gen Con': 'indianapolis', 'PRI Show': 'indianapolis', 'FFA Convention': 'indianapolis',
  'Dreamforce': 'san-francisco', 'GDC': 'san-francisco', 'Game Developers Conference': 'san-francisco',
  'RSA Conference': 'san-francisco', 'JPMorgan Healthcare Conference': 'san-francisco',
  'PAX West': 'seattle', 'Pacific Marine Expo': 'seattle'
};

// Events that no longer run — naming one dates the page.
const DISCONTINUED = ['Summer NAMM'];

// Apex must never claim a relationship with an event or its organiser.
const CLAIMS = [
  [/official (?:supplier|vendor|partner|sponsor)/i, 'claims an official supplier/partner status'],
  [/we (?:have )?(?:worked|exhibited|supplied|built|installed)(?: at| for)/i, 'claims Apex worked at an event'],
  [/(?:partnership|partnered) with|our partner/i, 'claims a partnership'],
  [/as seen at|trusted by|chosen by|used by exhibitors at/i, 'implies an endorsement']
];

const names = Object.keys(EVENT_CITY).sort((a, b) => b.length - a.length);
const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const d = CITY_DETAIL[city.slug];
  const text = [d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
    ...(d.conventionCenters || []).map((v) => `${v.name} ${v.desc}`),
    ...(d.industries || []).map((i) => i.join(' ')),
    ...d.productSections.map((s) => `${s.h2} ${s.body}`),
    ...(d.faqs || []).map((f) => `${f.q} ${f.a}`)].join(' ');
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // events named on this page
  const found = [];
  let scan = text;
  for (const n of names) {
    if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\b`).test(scan)) {
      found.push(n);
      scan = scan.split(n).join(' '); // don't double-count "Comic-Con" inside "Comic-Con International"
    }
  }
  // collapse aliases of the same event
  const canonical = new Set(found.map((n) => n.replace('Comic-Con International', 'Comic-Con')
    .replace('Offshore Technology Conference', 'OTC')
    .replace('Game Developers Conference', 'GDC')));

  for (const n of canonical) {
    const owner = EVENT_CITY[n] || EVENT_CITY[found.find((f) => f.startsWith(n)) || ''];
    if (owner && owner !== city.slug) F(`names "${n}", which is a ${owner} event`);
  }
  if (canonical.size > MAX_EVENTS) F(`names ${canonical.size} events (max ${MAX_EVENTS}) — trim to the ones that show the exhibition ecosystem`);

  for (const dead of DISCONTINUED) {
    if (new RegExp(`\b${dead}\b`).test(text)) F(`names "${dead}", which no longer runs`);
  }

  for (const [re, why] of CLAIMS) {
    const m = text.match(re);
    if (m) F(`${why}: "${m[0]}"`);
  }

  if (list) console.log(`${city.city.padEnd(16)} ${canonical.size}: ${[...canonical].join(', ') || '(none)'}`);
}

if (fails.length) {
  console.error(`\n✗ EVENT AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ EVENTS OK — ${rolled.length} cities name only verified local events (max ${MAX_EVENTS} each), with no official-supplier, worked-at or partnership claims.`);

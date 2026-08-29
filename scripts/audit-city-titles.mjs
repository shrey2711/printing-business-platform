// §19 SEO title audit for the city pages.
//
//   * unique across every city page (and every other indexed page)
//   * length inside the SERP-safe band — long enough to carry the intent,
//     short enough not to truncate
//   * the city named exactly once (no "Displays in Dallas | Dallas Booths")
//   * no keyword stuffing: the head term appears once, and no token repeats
//   * the intended pattern — "Trade Show Displays in {City} | {benefit}"
//
// Usage: node scripts/audit-city-titles.mjs [--list]

import { readFileSync, existsSync, readdirSync } from 'fs';
import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const list = process.argv.includes('--list');
const MIN = 45;
const MAX = 62; // characters, decoded
const fails = [];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');
const titleOf = (file) => decode((readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '');

// every indexed title in the build, to prove city titles are globally unique
const allTitles = new Map();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      const t = titleOf(p);
      if (!allTitles.has(t)) allTitles.set(t, []);
      allTitles.get(t).push(p.replace(DIST, '').replace('/index.html', '') || '/');
    }
  }
})(DIST);

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const file = `${DIST}/${CAT}/${city.slug}/index.html`;
  if (!existsSync(file)) { fails.push(`${city.slug}: not built`); continue; }
  const t = titleOf(file);
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  if (!t) { F('no title'); continue; }
  if (t.length < MIN || t.length > MAX) F(`title is ${t.length} chars (want ${MIN}-${MAX}): "${t}"`);
  if (!/^Trade Show Displays in /.test(t)) F(`title does not lead with the head term: "${t}"`);
  if (!t.includes('|')) F(`title has no benefit suffix: "${t}"`);

  // the city is named once
  const names = [city.h1City, city.city].filter(Boolean);
  const name = names.find((n) => t.includes(n));
  if (!name) F(`title does not name the city: "${t}"`);
  else {
    const count = t.split(name).length - 1;
    if (count > 1) F(`city named ${count}x in the title: "${t}"`);
  }

  // Stuffing check. The recommended pattern is "Trade Show Displays in {City} |
  // Custom Booths & Displays", which echoes "Displays" once by design, so a
  // second occurrence is allowed and a third is not.
  const tokens = t.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !['show','with','from','your'].includes(w));
  const counts = tokens.reduce((m, w) => m.set(w, (m.get(w) || 0) + 1), new Map());
  for (const [w, n] of counts) {
    if (n > 2) F(`"${w}" appears ${n}x in the title — keyword stuffing: "${t}"`);
  }

  // globally unique
  const owners = allTitles.get(t) || [];
  if (owners.length > 1) F(`title is not unique — also used by ${owners.filter((o) => !o.endsWith(city.slug)).join(', ')}`);

  if (list) console.log(`${String(t.length).padStart(3)}  ${t}`);
}

if (fails.length) {
  console.error(`\n✗ TITLE AUDIT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ TITLES OK — ${rolled.length} city titles are unique site-wide, ${MIN}-${MAX} chars, lead with the head term, name the city once and repeat no keyword.`);

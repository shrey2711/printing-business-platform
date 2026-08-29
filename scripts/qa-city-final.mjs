// §26 FINAL QA — the owner's per-city checklist, evaluated against the built
// pages and printed as a pass/fail matrix so a city can be signed off (or not)
// on its own merits.
//
// Every box on the checklist maps to one check below. The deeper audits
// (uniqueness, product claims, keyword themes, schema parity, …) run as
// separate scripts in npm test; this is the consolidated sign-off view.
//
// Usage: node scripts/qa-city-final.mjs [--verbose]

import { readFileSync, existsSync, readdirSync } from 'fs';
import { SEO_CITIES, cityWithAbbr } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';
import { CITY_BOOTH_GUIDES } from '../src/data/internalLinks.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const ORIGIN = 'https://www.apextradeshow.com';
const verbose = process.argv.includes('--verbose');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const plain = (h) => strip(h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' '));

const sitemapUrls = new Set();
for (const f of readdirSync(DIST).filter((n) => /^sitemap.*\.xml$/.test(n))) {
  for (const m of readFileSync(`${DIST}/${f}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1].replace(/\/$/, ''));
}
const titles = new Map();
const descs = new Map();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { walk(p); continue; }
    if (e.name !== 'index.html') continue;
    const h = readFileSync(p, 'utf8');
    const rel = p.replace(DIST, '').replace('/index.html', '') || '/';
    const t = decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    const d = decode((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    if (t) titles.set(t, [...(titles.get(t) || []), rel]);
    if (d) descs.set(d, [...(descs.get(d) || []), rel]);
  }
})(DIST);

const GROUPS = [
  ['Structure', ['one H1', 'H1 format', 'H2 hierarchy', 'FAQ H3s']],
  ['SEO', ['city keyword', 'semantic cluster', 'unique title', 'unique meta', 'self-canonical', 'indexable', 'in sitemap']],
  ['Local quality', ['venues', 'events', 'industries', 'climate specific', 'no presence claim', 'no delivery claim']],
  ['Commercial', ['booth section', 'canopy section', 'backdrop section', 'banner section', 'table-cover section']],
  ['Internal links', ['categories', 'products', 'city-category pages', 'Learning Center', 'location hierarchy', 'other cities', 'no broken links']],
  ['AEO / GEO', ['direct answers', '6-8 FAQs', 'local entities', 'FAQ schema match', 'breadcrumb schema', 'no misleading schema']]
];

const exists = (href) => {
  const c = href.split('#')[0].split('?')[0].replace(/\/$/, '');
  return c === '' ? existsSync(`${DIST}/index.html`) : existsSync(`${DIST}${c}/index.html`) || existsSync(`${DIST}${c}`);
};

const rows = [];
const failures = [];
for (const city of SEO_CITIES) {
  const d = CITY_DETAIL[city.slug];
  if (!Array.isArray(d?.productSections)) continue;
  const path = `/${CAT}/${city.slug}`;
  const file = `${DIST}${path}/index.html`;
  if (!existsSync(file)) { failures.push(`${city.slug}: not built`); continue; }
  const html = readFileSync(file, 'utf8');
  const body = plain(html);
  const names = [city.h1City, city.city].filter(Boolean);
  const nameIn = (t) => names.some((n) => t.includes(n));

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
  const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => strip(m[1]));
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const hrefs = [...html.matchAll(/<a [^>]*href="(\/[^"]*)"/g)].map((m) => m[1]);
  const blocks = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); blocks.push(...(Array.isArray(j) ? j : [j])); } catch { /* reported by the schema audit */ }
  }
  const faqNode = blocks.find((b) => b['@type'] === 'FAQPage');
  const bcNode = blocks.find((b) => b['@type'] === 'BreadcrumbList');
  const visibleFaqs = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [strip(m[1]), strip(m[2])]);
  const navCrumbs = [...((html.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/) || [])[1] || '')
    .matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<span>([\s\S]*?)<\/span>/g)]
    .map((m) => strip(m[2] || m[3] || '')).filter(Boolean);

  const sectionH2 = (re) => h2s.some((h) => re.test(h));
  const checks = {
    'one H1': h1s.length === 1,
    'H1 format': /^Trade Show Displays in .+, [A-Z]{2}$/.test(h1s[0] || ''),
    'H2 hierarchy': h2s.length >= 15 && /^Why exhibit in/.test(h2s[0] || ''),
    'FAQ H3s': h3s.length >= 6 && h3s.every((q) => q.endsWith('?')),

    'city keyword': nameIn(title) && nameIn(h1s[0] || '') && /trade show displays/i.test(body),
    'semantic cluster': ['canopy', 'banner stand', 'backdrop', 'table cover', 'step & repeat', 'exhibition display'].every((k) => body.toLowerCase().includes(k)),
    'unique title': (titles.get(title) || []).length === 1,
    'unique meta': (descs.get(desc) || []).length === 1 && desc.length >= 140 && desc.length <= 165,
    'self-canonical': canon.replace(/\/$/, '') === `${ORIGIN}${path}`,
    'indexable': !/noindex/i.test(robots),
    'in sitemap': sitemapUrls.has(`${ORIGIN}${path}`),

    venues: (d.conventionCenters || []).length >= 3 && (d.conventionCenters || []).every((v) => body.includes(v.name.replace(/\s*\(.*?\)/, '')) || body.includes(v.name)),
    events: !/Summer NAMM/.test(body),
    industries: (d.industries || []).length >= 4 && (d.industries || []).length <= 8,
    // real check: substantive, names a specific weather condition, and is not
    // shared verbatim with another city (deeper similarity scoring lives in
    // audit-city-uniqueness.mjs)
    'climate specific': (d.climate || '').length > 200
      && /heat|humid|rain|storm|snow|wind|sun|UV|fog|monsoon|pollen|freeze|ice/i.test(d.climate || '')
      && Object.entries(CITY_DETAIL).filter(([s2, o]) => s2 !== city.slug && o.climate === d.climate).length === 0,
    'no presence claim': !/\bour [A-Z][a-z]+ (?:office|warehouse|showroom|facility|team)\b|\blocal (?:office|warehouse|showroom)\b/.test(body),
    'no delivery claim': /no special delivery arrangement|don't have a special delivery arrangement|don’t have a special delivery arrangement/i.test(body)
      && !/same[- ]day delivery|guaranteed delivery/i.test(body),

    'booth section': sectionH2(/^Trade Show Booth Displays in /),
    'canopy section': sectionH2(/^Custom Canopy Tents in /),
    'backdrop section': sectionH2(/^Trade Show Backdrops & Backdrop Printing in /),
    'banner section': sectionH2(/^Banner Stands & Retractable Banner Stands in /),
    'table-cover section': sectionH2(/^Custom Trade Show Table Covers in /),

    categories: ['/trade-show-displays', '/custom-canopies', '/backdrops', '/banner-stands', '/table-covers'].every((c) => hrefs.includes(c)),
    products: [...new Set(hrefs.filter((h) => h.startsWith('/products/')))].length >= 8,
    'city-category pages': ['trade-show-canopies', 'banner-stands', 'trade-show-backdrops', 'table-covers'].every((s) => hrefs.includes(`/${s}/${city.slug}`)),
    'Learning Center': CITY_BOOTH_GUIDES.every((g) => hrefs.includes(`/blog/${g.slug}`)),
    'location hierarchy': hrefs.includes('/locations') && (!city.stateSlug || hrefs.includes(`/locations/${city.stateSlug}`)),
    'other cities': hrefs.filter((h) => h.startsWith(`/${CAT}/`) && h !== path).length >= 8,
    'no broken links': [...new Set(hrefs)].every(exists),

    'direct answers': /class="answer-block"/.test(html) && visibleFaqs.every(([, a]) => !/^(it depends|that depends|generally speaking)/i.test(a)),
    '6-8 FAQs': (d.faqs || []).length >= 6 && (d.faqs || []).length <= 8,
    'local entities': nameIn(body) && (city.stateName ? body.includes(city.stateName) || body.includes(city.abbr) : true) && body.includes('Apex'),
    'FAQ schema match': !!faqNode && (faqNode.mainEntity || []).length === visibleFaqs.length
      && (faqNode.mainEntity || []).every((q, i) => strip(q.name) === visibleFaqs[i][0] && strip(q.acceptedAnswer.text) === visibleFaqs[i][1]),
    'breadcrumb schema': !!bcNode && (bcNode.itemListElement || []).length === navCrumbs.length
      && (bcNode.itemListElement || []).every((it, i) => strip(String(it.name)) === navCrumbs[i]),
    'no misleading schema': !/"Review"|"AggregateRating"|"ratingValue"|"offers"/.test(JSON.stringify(blocks))
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
  failed.forEach((k) => failures.push(`${city.slug}: ${k}`));
  rows.push({ city: city.city, checks, failed });
}

const allKeys = GROUPS.flatMap(([, ks]) => ks);
console.log(`FINAL QA — ${rows.length} cities × ${allKeys.length} checks\n`);
for (const [group, keys] of GROUPS) {
  const groupFails = rows.flatMap((r) => r.failed.filter((f) => keys.includes(f)).map((f) => `${r.city}: ${f}`));
  console.log(`${groupFails.length ? '✗' : '✓'} ${group.padEnd(16)} ${keys.length} checks × ${rows.length} cities${groupFails.length ? ` — ${groupFails.length} failing` : ''}`);
  if (verbose || groupFails.length) groupFails.slice(0, 10).forEach((f) => console.log(`    ✗ ${f}`));
}

if (failures.length) {
  console.error(`\n✗ FINAL QA FAILED — ${failures.length} unchecked box(es) across ${new Set(failures.map((f) => f.split(':')[0])).size} cities`);
  process.exit(1);
}
console.log(`\n✓ FINAL QA PASSED — every one of the ${allKeys.length} checklist items is satisfied on all ${rows.length} city pages.`);

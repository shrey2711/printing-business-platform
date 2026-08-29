// Final per-city scorecard. Each column is scored from the same checks the
// audits enforce, so the score cannot drift from what the gates actually test.
//
// Usage: node scripts/report-city-scorecard.mjs [--markdown]

import { execFileSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const md = process.argv.includes('--markdown');
const DIST = 'dist';
const CAT = 'trade-show-displays';
const ORIGIN = 'https://www.apextradeshow.com';

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');
const strip = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// uniqueness per city, from the same normalised 5-gram method the audit uses
const uniqueness = JSON.parse(execFileSync('node', ['-e', `
import('./src/data/cityDetail.js').then(async (m) => {
  const { SEO_CITIES } = await import('./src/data/citySeo.js');
  const rolled = SEO_CITIES.filter((c) => Array.isArray(m.CITY_DETAIL[c.slug]?.productSections));
  const norm = (t, c) => { let s = t; const d = m.CITY_DETAIL[c.slug];
    for (const v of d.conventionCenters || []) s = s.split(v.name).join(' VENUE ');
    for (const n of [c.h1City, c.city, c.stateName, c.abbr].filter(Boolean)) s = s.split(n).join(' CITY ');
    return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\\s+/g, ' '); };
  const blob = (d) => [d.answer, ...(d.overview||[]), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
    ...(d.conventionCenters||[]).map(v=>v.desc), ...(d.industries||[]).map(i=>i[1]),
    ...d.productSections.map(s=>s.body), ...(d.faqs||[]).map(f=>f.a)].join(' ');
  const sh = (s) => { const w = s.split(' ').filter(Boolean); const o = new Set();
    for (let i=0;i+5<=w.length;i++) o.add(w.slice(i,i+5).join(' ')); return o; };
  const sets = rolled.map((c) => [c.slug, sh(norm(blob(m.CITY_DETAIL[c.slug]), c))]);
  const out = {};
  for (const [slug, a] of sets) { let max = 0;
    for (const [o, b] of sets) { if (o === slug) continue; let i = 0;
      for (const x of a) if (b.has(x)) i++; max = Math.max(max, i / (a.size + b.size - i || 1)); }
    out[slug] = Math.round((1 - max) * 100); }
  console.log(JSON.stringify(out));
});
`], { encoding: 'utf8' }).trim());

const rows = [];
for (const city of SEO_CITIES) {
  const d = CITY_DETAIL[city.slug];
  if (!Array.isArray(d?.productSections)) continue;
  const path = `/${CAT}/${city.slug}`;
  const file = `${DIST}${path}/index.html`;
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const body = strip(html.replace(/<script[\s\S]*?<\/script>/g, ' '));
  const h1 = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '');
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const hrefs = [...html.matchAll(/<a [^>]*href="(\/[^"]*)"/g)].map((m) => m[1]);
  const blocks = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); blocks.push(...(Array.isArray(j) ? j : [j])); } catch { /* schema audit reports */ }
  }
  const t = blocks.map((b) => b['@type']);
  const visibleFaqs = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>/g)].length;
  const schemaFaqs = (blocks.find((b) => b['@type'] === 'FAQPage')?.mainEntity || []).length;

  const col = {
    H1: /^Trade Show Displays in .+, [A-Z]{2}$/.test(h1) && (html.match(/<h1/g) || []).length === 1,
    'Primary Keyword': new RegExp(`Trade Show Displays in`, 'i').test(title) && /trade show displays/i.test(body),
    'Product Sections': ['Trade Show Booth Displays in', 'Custom Canopy Tents in', 'Trade Show Backdrops & Backdrop Printing in', 'Banner Stands & Retractable Banner Stands in', 'Custom Trade Show Table Covers in']
      .every((p) => h2s.some((h) => h.startsWith(p))),
    'Local Content': (d.conventionCenters || []).length >= 3 && (d.industries || []).length >= 4 && (d.climate || '').length > 200 && uniqueness[city.slug] >= 70,
    FAQ: (d.faqs || []).length >= 6 && (d.faqs || []).length <= 8 && visibleFaqs === schemaFaqs,
    'Internal Links': ['/trade-show-displays', '/custom-canopies', '/backdrops', '/banner-stands', '/table-covers', '/trade-show-booth-packages', '/locations']
      .every((c) => hrefs.includes(c)) && hrefs.filter((h) => h.startsWith('/blog/')).length >= 4,
    Metadata: title.length >= 45 && title.length <= 62 && desc.length >= 140 && desc.length <= 165,
    Canonical: canon.replace(/\/$/, '') === `${ORIGIN}${path}`,
    Schema: ['WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage'].every((x) => t.includes(x)) && !/"Review"|"AggregateRating"|"offers"/.test(JSON.stringify(blocks))
  };
  const passed = Object.values(col).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(col).length) * 100);
  rows.push({ city: city.city, path, col, score, unique: uniqueness[city.slug], priority: city.priority });
}

const tick = (b) => (b ? '✅' : '❌');
const COLS = ['H1', 'Primary Keyword', 'Product Sections', 'Local Content', 'FAQ', 'Internal Links', 'Metadata', 'Canonical', 'Schema'];
if (md) {
  console.log(`| City | URL | ${COLS.join(' | ')} | Unique | Score |`);
  console.log(`|---|---|${COLS.map(() => '---').join('|')}|---|---|`);
  for (const r of rows) {
    console.log(`| ${r.city} | ${r.path} | ${COLS.map((c) => tick(r.col[c])).join(' | ')} | ${r.unique}% | ${r.score}/100 |`);
  }
} else {
  for (const r of rows) console.log(`${r.city.padEnd(16)} ${COLS.map((c) => (r.col[c] ? '✓' : '✗')).join(' ')}  unique ${String(r.unique).padStart(3)}%  score ${r.score}`);
}
const avg = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
const avgU = Math.round(rows.reduce((s, r) => s + r.unique, 0) / rows.length);
console.log(`\naverage score ${avg}/100 · average uniqueness ${avgU}% · ${rows.filter((r) => r.score === 100).length}/${rows.length} cities at 100`);

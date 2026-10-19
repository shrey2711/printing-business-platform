// Location-page uniqueness gate. For every INDEXABLE location page it measures
// how much of the page's own prose appears on no other page in the same
// family, and fails when that is under THRESHOLD (default 80%).
//
// Families compared against each other (a page is only compared with siblings
// it could be mistaken for):
//   state        /locations/{state}
//   state-city   /locations/{state}/{city}
//   cat-city     /{category}/{city}   (all five categories in ONE family: the
//                                      five pages for one city must differ too)
//   city-product /{product}-{city}
//
// Method: 6-word shingles over the visible prose. Link anchors, breadcrumbs
// and the footer link rows are dropped (navigation, not content). Place names
// (states, provinces, every city) are replaced with one token first, so a
// sentence that is identical apart from the city name counts as DUPLICATE —
// swapping "Chicago" for "Dallas" does not make text unique.
//
// noindex pages are reported but never fail the gate: they cannot compete in
// the index, so duplication there does not split canonicals.
//
// Usage: node scripts/audit-location-uniqueness.mjs [--list] [--threshold=80]
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { states, provinces, territories } from '../src/data/states.js';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_PRODUCT_PAGES } from '../src/data/cityProductPages.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const list = process.argv.includes('--list');
const THRESHOLD = Number((process.argv.find((a) => a.startsWith('--threshold=')) || '=80').split('=')[1]);

if (!existsSync(DIST)) { console.error('dist/ missing — run npm run build first.'); process.exit(2); }

const cityProductPaths = new Set(CITY_PRODUCT_PAGES.map((p) => `/${p.slug}`));
const familyOf = (p) => {
  if (cityProductPaths.has(p)) return 'city-product';
  if (p.startsWith('/locations/')) return p.split('/').length === 3 ? 'state' : 'state-city';
  if (/^\/(trade-show-canopies|trade-show-displays|banner-stands|trade-show-backdrops|table-covers)\/[^/]+$/.test(p)) return 'cat-city';
  return null;
};

const places = new Set();
for (const s of [...states, ...provinces, ...territories]) {
  places.add(s.name);
  for (const c of s.cities) places.add(c);
}
for (const c of SEO_CITIES) places.add(c.city);
const placeRe = new RegExp(`\\b(?:${[...places].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

const prose = (html) => {
  const b = (html.match(/<div id="seo-prerender">([\s\S]*?)<\/div>\s*<\/div>/) || [])[1] || '';
  return b
    .replace(/<nav[\s\S]*?<\/nav>/g, ' ')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#?\w+;/g, ' ')
    .replace(placeRe, ' PLACE ')
    .toLowerCase();
};
const shingles = (t) => {
  const w = t.match(/[a-z0-9]+/g) || [];
  const out = new Set();
  for (let i = 0; i + 6 <= w.length; i++) out.add(w.slice(i, i + 6).join(' '));
  return { n: w.length, set: out };
};

const pages = [];
const walk = (dir, base = '') => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, `${base}/${name}`);
    else if (name === 'index.html') pages.push({ path: base || '/', file: full });
  }
};
walk(DIST);

const recs = [];
for (const { path, file } of pages) {
  const family = familyOf(path);
  if (!family) continue;
  const html = readFileSync(file, 'utf8');
  const { n, set } = shingles(prose(html));
  recs.push({
    path, family, words: n, set,
    noindex: /<meta name="robots"[^>]*noindex/i.test(html),
    canonical: ((html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '').replace(/^https?:\/\/[^/]+/, '')
  });
}

const freq = new Map();
for (const r of recs) for (const s of r.set) { const k = `${r.family}|${s}`; freq.set(k, (freq.get(k) || 0) + 1); }
for (const r of recs) {
  let u = 0;
  for (const s of r.set) if (freq.get(`${r.family}|${s}`) === 1) u++;
  r.unique = r.set.size ? Math.round((100 * u) / r.set.size) : 0;
}

const explain = (process.argv.find((a) => a.startsWith('--explain=')) || '').split('=')[1];
if (explain) {
  const r = recs.find((x) => x.path === explain);
  const html = readFileSync(pages.find((x) => x.path === explain).file, 'utf8');
  const w = (prose(html).match(/[a-z0-9]+/g) || []);
  const dupAt = new Array(w.length).fill(false);
  for (let i = 0; i + 6 <= w.length; i++) if (freq.get(`${r.family}|${w.slice(i, i + 6).join(' ')}`) > 1) for (let k = i; k < i + 6; k++) dupAt[k] = true;
  let out = '', run = null;
  w.forEach((x, i) => { if (dupAt[i] !== run) { out += run === null ? '' : (run ? ' ]]' : ''); if (dupAt[i]) out += ' [['; run = dupAt[i]; } out += ' ' + x; });
  console.log(`${explain}: ${r.unique}% unique of ${r.words} words\n${out}\n`);
  process.exit(0);
}
const inventoryOut = (process.argv.find((a) => a.startsWith('--inventory=')) || '').split('=')[1];
if (inventoryOut) {
  const inSitemap = new Set();
  for (const f of readdirSync(DIST).filter((n) => /^sitemap-.*\.xml$/.test(n))) {
    for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) inSitemap.add(m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
  }
  const famLabel = { state: 'State / province', 'state-city': 'State › city', 'cat-city': 'Category × city', 'city-product': 'Product × city' };
  const famList = [...new Set(recs.map((r) => r.family))];
  const rows = [...recs].sort((a, b) => a.family.localeCompare(b.family) || a.path.localeCompare(b.path));
  const action = (r) => (r.noindex ? (r.family === 'state-city' ? 'noindex — no city-specific copy to index' : r.family === 'state' ? 'noindex — no verified local facts yet' : 'noindex — under 80% unique; needs city-specific copy') : 'index');
  const md = [
    '# Location page inventory', '',
    `_Generated by \`node scripts/audit-location-uniqueness.mjs --inventory=<file>\` from the built \`dist/\`. "Unique" = share of the page's prose found on no other page of its family (place names normalised, links/nav ignored); the indexable bar is ${THRESHOLD}%._`, '',
    '| Family | Pages | Indexable | noindex | Avg unique (indexable) |', '|---|---|---|---|---|',
    ...famList.map((f) => { const rs = recs.filter((r) => r.family === f); const ix = rs.filter((r) => !r.noindex); return `| ${famLabel[f]} | ${rs.length} | ${ix.length} | ${rs.length - ix.length} | ${ix.length ? Math.round(ix.reduce((s, r) => s + r.unique, 0) / ix.length) + '%' : '—'} |`; }),
    ''
  ];
  for (const f of famList) {
    md.push(`## ${famLabel[f]}`, '', '| Path | Robots | Canonical | In sitemap | Words | Unique | Action |', '|---|---|---|---|---|---|---|');
    for (const r of rows.filter((x) => x.family === f)) md.push(`| ${r.path} | ${r.noindex ? 'noindex,follow' : 'index'} | ${r.canonical === r.path ? 'self' : r.canonical || '—'} | ${inSitemap.has(r.path) ? 'yes' : 'no'} | ${r.words} | ${r.unique}% | ${action(r)} |`);
    md.push('');
  }
  writeFileSync(inventoryOut, md.join('\n'));
  console.log(`inventory → ${inventoryOut}`);
}
const fails = [];
const fams = [...new Set(recs.map((r) => r.family))];
for (const f of fams) {
  const rs = recs.filter((r) => r.family === f);
  const idx = rs.filter((r) => !r.noindex);
  const avg = idx.length ? Math.round(idx.reduce((s, r) => s + r.unique, 0) / idx.length) : 0;
  const bad = idx.filter((r) => r.unique < THRESHOLD);
  console.log(`${f.padEnd(13)} pages ${String(rs.length).padStart(3)} · indexable ${String(idx.length).padStart(3)} · avg unique ${String(avg).padStart(3)}% · under ${THRESHOLD}%: ${bad.length}`);
  for (const r of bad) fails.push(r);
}
// Canonical hygiene: an indexable page must be self-canonical; a noindex page
// must not point its canonical at a different URL (mixed signals).
const canonIssues = recs.filter((r) => r.canonical && r.canonical !== r.path && r.canonical !== `${r.path}/`);
for (const r of canonIssues) console.log(`✗ canonical mismatch: ${r.path} -> ${r.canonical} (${r.noindex ? 'noindex' : 'index'})`);

if (list || fails.length) {
  for (const r of fails.sort((a, b) => a.unique - b.unique)) console.log(`  ${String(r.unique).padStart(3)}%  ${r.words}w  ${r.path}`);
}
if (fails.length || canonIssues.length) {
  console.error(`\n✗ ${fails.length} indexable page(s) under ${THRESHOLD}% unique, ${canonIssues.length} canonical mismatch(es).`);
  process.exit(1);
}
console.log(`\n✓ every indexable location page is ≥${THRESHOLD}% unique within its family and self-canonical.`);

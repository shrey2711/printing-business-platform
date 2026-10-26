// Site-wide canonical-risk audit. For every URL in the sitemaps, compares the
// page's prose against EVERY other sitemap URL (any family) and lists pairs
// that are similar enough for Google to fold into one canonical.
// Similarity = share of the smaller page's 6-word shingles found on the other
// page (containment), place names normalised, links/nav ignored.
// Usage: node scripts/audit-sitewide-duplicates.mjs [--min=50]
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { states, provinces, territories } from '../src/data/states.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const MIN = Number((process.argv.find((a) => a.startsWith('--min=')) || '=50').split('=')[1]);
const places = new Set([...[...states, ...provinces, ...territories].flatMap((r) => [r.name, ...r.cities]), ...SEO_CITIES.map((c) => c.city)]);
const placeRe = new RegExp(`\\b(?:${[...places].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

const urls = new Set();
for (const f of readdirSync(DIST).filter((n) => /^sitemap-.*\.xml$/.test(n)))
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].replace(/^https?:\/\/[^/]+/, '') || '/');

const pages = [];
for (const u of urls) {
  const file = join(DIST, u, 'index.html');
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const body = (html.match(/<div id="seo-prerender">([\s\S]*?)<\/div>\s*<\/div>/) || [])[1] || '';
  const text = body.replace(/<nav[\s\S]*?<\/nav>/g, ' ').replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').replace(placeRe, ' place ').toLowerCase();
  const w = text.match(/[a-z0-9]+/g) || [];
  const sh = new Set();
  for (let i = 0; i + 6 <= w.length; i++) sh.add(w.slice(i, i + 6).join(' '));
  pages.push({ u, n: w.length, sh, canon: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '' });
}
const pairs = [];
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const a = pages[i], b = pages[j];
  const [s, l] = a.sh.size <= b.sh.size ? [a, b] : [b, a];
  if (s.sh.size < 20) continue;
  let c = 0;
  for (const x of s.sh) if (l.sh.has(x)) c++;
  const pct = Math.round((100 * c) / s.sh.size);
  if (pct >= MIN) pairs.push([pct, a.u, b.u, a.n, b.n]);
}
pairs.sort((x, y) => y[0] - x[0]);
console.log(`${pages.length} sitemap pages compared pairwise; ${pairs.length} pair(s) share >=${MIN}% of the smaller page's text`);
for (const p of pairs) console.log(`${String(p[0]).padStart(3)}%  ${p[1]} (${p[3]}w)  <->  ${p[2]} (${p[4]}w)`);
const bad = pages.filter((p) => p.canon.replace(/^https?:\/\/[^/]+/, '') !== p.u);
for (const p of bad) console.log(`canonical mismatch: ${p.u} -> ${p.canon}`);
process.exit(pairs.some((p) => p[0] >= 70) || bad.length ? 1 : 0);

// Internal-linking + orphan-page gate. Fails when:
//  - an indexed page has no inbound internal link from any OTHER page (orphan)
//  - a product page does not link up to its category, or its category does not
//    link down to it (category<->product loop broken)
// Complements the broken-link check in test-seo-invariants. Run after build.

import { readFileSync, existsSync, readdirSync } from 'fs';
import { CATEGORY_BY_PRODUCT } from '../src/data/categoryPages.js';
import { listProducts } from '../backend/data/products.js';

const DIST = 'dist';
const ORIGIN = 'https://www.apextradeshow.com';
const fails = [];

// All prerendered pages + their outbound internal links (from #seo-prerender HTML).
const pages = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p.replace(DIST, '').replace(/\/index\.html$/, '') || '/');
  }
})(DIST);
const pageSet = new Set(pages);

const outbound = new Map();
const inbound = new Map();
for (const path of pages) {
  const file = `${DIST}${path === '/' ? '' : path}/index.html`;
  const h = readFileSync(file, 'utf8');
  const links = new Set();
  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (/\.(png|jpe?g|webp|svg|pdf|xml|ico|txt|css|js|avif)$/i.test(href) || href.startsWith('/assets') || href.startsWith('/_')) continue;
    links.add(href);
    if (href !== path) inbound.set(href, (inbound.get(href) || 0) + 1);
  }
  outbound.set(path, links);
}

// Indexed URLs (from sitemaps).
const SM = ['sitemap-pages', 'sitemap-categories', 'sitemap-products', 'sitemap-blog', 'sitemap-locations'];
const indexed = [];
for (const f of SM) {
  if (!existsSync(`${DIST}/${f}.xml`)) continue;
  for (const m of readFileSync(`${DIST}/${f}.xml`, 'utf8').matchAll(/<loc>([^<]*)<\/loc>/g)) indexed.push(m[1].replace(ORIGIN, '').replace(/\/$/, '') || '/');
}

// 1) No orphan indexed page.
for (const path of indexed) {
  if ((inbound.get(path) || 0) < 1) fails.push(`orphan: ${path} has no inbound internal link`);
}

// 2) category <-> product loop for every active product.
for (const p of listProducts()) {
  const prodPath = `/products/${p.slug}`;
  const cat = CATEGORY_BY_PRODUCT[p.category];
  if (!cat) continue; // some products have no dedicated category page (flags/seg live under hubs)
  const catPath = `/${cat.slug}`;
  if (pageSet.has(prodPath) && !(outbound.get(prodPath) || new Set()).has(catPath)) fails.push(`${prodPath} does not link up to its category ${catPath}`);
  if (pageSet.has(catPath) && !(outbound.get(catPath) || new Set()).has(prodPath)) fails.push(`${catPath} does not link down to product ${prodPath}`);
}

if (fails.length) {
  console.error(`\n✗ INTERNAL LINKS / ORPHANS FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 40).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 40) console.error(`  … and ${fails.length - 40} more`);
  process.exit(1);
}
console.log(`✓ INTERNAL LINKS OK — ${indexed.length} indexed pages have inbound links (no orphans); every product<->category link loop is intact.`);

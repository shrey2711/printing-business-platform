// Read-only SEO + ecommerce baseline diagnostic. Scans dist/ (after a build) and
// prints a structured report: route inventory, sitemap counts, title/description/
// canonical/H1/robots stats, JSON-LD @types by page type, product/offer + blog
// schema coverage, private-route indexability, redirecting sitemap URLs, broken
// internal links, location duplication signal, and image alt/size coverage.
// Changes nothing. Run: `npm run build && node scripts/seo-baseline-report.mjs`.

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { redirects } from '../src/generated/redirects.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const DIST = 'dist';
const ORIGIN = 'https://www.apextradeshow.com';
const SM_FILES = ['sitemap-pages', 'sitemap-categories', 'sitemap-products', 'sitemap-blog', 'sitemap-locations'];
const PRIVATE = ['/cart', '/checkout', '/account', '/admin', '/login', '/register', '/order', '/reset-password', '/forgot-password'];

const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (h, re) => (h.match(re) || [])[1] || '';
const count = (h, re) => (h.match(re) || []).length;
const ldNodes = (h) => {
  const nodes = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { nodes.push(...[].concat(JSON.parse(m[1]))); } catch { nodes.push({ '@type': 'INVALID' }); }
  }
  return nodes;
};
const jsonTypes = (h) => ldNodes(h).map((n) => n && n['@type']).filter(Boolean);
// Offer is nested inside Product.offers (Offer/AggregateOffer), not a top-level @type.
const productHasOffer = (h) => {
  const p = ldNodes(h).find((n) => n && n['@type'] === 'Product');
  return !!(p && p.offers && (p.offers.price != null || p.offers.lowPrice != null || p.offers['@type']));
};
const classify = (p) => {
  if (p === '/' || p === '') return 'home';
  if (p.startsWith('/products/')) return 'product';
  if (p.startsWith('/blog/')) return 'blog-article';
  if (p === '/blog') return 'blog-index';
  if (/^\/locations\/[a-z-]+$/.test(p)) return 'state';
  if (/^\/(trade-show-displays|trade-show-canopies|banner-stands|trade-show-backdrops|table-covers)\/[a-z-]+$/.test(p)) return 'city';
  if (['/custom-canopies','/banner-stands','/banners','/backdrops','/table-covers','/trade-show-displays','/seg-displays','/tension-fabric-displays','/pop-up-displays','/flags','/trade-show-booth-packages','/locations','/products','/resources'].includes(p)) return 'category/hub';
  if (p.startsWith('/solutions/')) return 'solution';
  if (p.startsWith('/sizes/')) return 'size-guide';
  return 'policy/other';
};

// ---- collect sitemap URLs ----
const perSitemap = {};
const urls = [];
for (const f of SM_FILES) {
  const xml = readFileSync(`${DIST}/${f}.xml`, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  perSitemap[f] = locs.length;
  urls.push(...locs);
}

// ---- redirect-source set (sitemap URLs must not be redirect sources) ----
const redirectSources = new Set(redirects.map((r) => r.source.replace(/\/$/, '')));
for (const c of SEO_CITIES) if (c.stateSlug) redirectSources.add(`/locations/${c.stateSlug}/${c.slug}`);

// ---- per-page scan ----
const byType = {};
const titles = new Map(), descs = new Map();
const findings = { missTitle: [], dupTitle: [], missDesc: [], dupDesc: [], badCanon: [], h1: [], noindexInSitemap: [], redirectInSitemap: [], productNoSchema: [], blogNoSchema: [], missing404: [] };
const ldTypeByPageType = {};

for (const loc of urls) {
  const path = loc.replace(ORIGIN, '').replace(/\/$/, '');
  const key = path || '/';
  const type = classify(key);
  byType[type] = (byType[type] || 0) + 1;
  if (redirectSources.has(key)) findings.redirectInSitemap.push(key);
  const file = `${DIST}${path}/index.html`;
  if (!existsSync(file)) { findings.missing404.push(key); continue; }
  const h = readFileSync(file, 'utf8');
  const title = decode(attr(h, /<title>([^<]*)<\/title>/));
  const desc = decode(attr(h, /<meta name="description" content="([^"]*)"/));
  const canon = attr(h, /<link rel="canonical" href="([^"]*)"/);
  const h1n = count(h, /<h1[\s>]/g);
  const noindex = /<meta name="robots"[^>]*noindex/.test(h);
  const types = jsonTypes(h);
  (ldTypeByPageType[type] = ldTypeByPageType[type] || new Set()) && types.forEach((t) => ldTypeByPageType[type].add(t));
  if (!title) findings.missTitle.push(key); else { if (titles.has(title)) findings.dupTitle.push(`${key} == ${titles.get(title)}`); else titles.set(title, key); }
  if (!desc) findings.missDesc.push(key); else { if (descs.has(desc)) findings.dupDesc.push(`${key} == ${descs.get(desc)}`); else descs.set(desc, key); }
  if (canon.replace(/\/$/, '') !== loc.replace(/\/$/, '')) findings.badCanon.push(`${key} -> ${canon}`);
  if (h1n !== 1) findings.h1.push(`${key} (${h1n})`);
  if (noindex) findings.noindexInSitemap.push(key);
  if (type === 'product') {
    const isQuote = /Request a quote for pricing|Request a Quote/i.test(h);
    if (!types.includes('Product')) findings.productNoSchema.push(`${key} [no Product]`);
    else if (!productHasOffer(h) && !isQuote) findings.productNoSchema.push(`${key} [Product, no Offer, not quote-only]`);
  }
  if (type === 'blog-article' && !types.includes('BlogPosting')) findings.blogNoSchema.push(key);
}

// ---- private routes: not in sitemap + noindex in dist ----
const smSet = new Set(urls.map((u) => u.replace(ORIGIN, '').replace(/\/$/, '')));
const privateIssues = [];
for (const r of PRIVATE) {
  if (smSet.has(r)) privateIssues.push(`${r} IN SITEMAP`);
  const f = `${DIST}${r}/index.html`;
  if (existsSync(f) && !/<meta name="robots"[^>]*noindex/.test(readFileSync(f, 'utf8'))) privateIssues.push(`${r} not noindex`);
}

// ---- broken internal links (scan every dist page's hrefs) ----
const known = new Set();
(function walk(d) { for (const e of readdirSync(d, { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else if (e.name === 'index.html') known.add(p.replace(DIST, '').replace(/\/index\.html$/, '') || '/'); } })(DIST);
const broken = new Set();
for (const loc of urls) {
  const file = `${DIST}${loc.replace(ORIGIN, '').replace(/\/$/, '')}/index.html`;
  if (!existsSync(file)) continue;
  const h = readFileSync(file, 'utf8');
  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (/\.(png|jpe?g|webp|svg|pdf|xml|ico|txt|css|js|avif)$/i.test(href)) continue;
    if (href.startsWith('/_') || href.startsWith('/assets')) continue;
    if (!known.has(href)) broken.add(href);
  }
}

// ---- images: missing alt + oversized ----
let imgTotal = 0, imgNoAlt = 0, imgNoDim = 0;
for (const p of known) {
  const file = `${DIST}${p === '/' ? '' : p}/index.html`;
  if (!existsSync(file)) continue;
  for (const tag of readFileSync(file, 'utf8').match(/<img\b[^>]*>/g) || []) {
    imgTotal++;
    if (!/\balt\s*=/.test(tag)) imgNoAlt++;
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) imgNoDim++;
  }
}
const bigImgs = [];
(function walkImg(d) { for (const e of readdirSync(d, { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walkImg(p); else if (/\.(png|jpe?g|webp)$/i.test(e.name)) { const sz = statSync(p).size; if (sz > 500000) bigImgs.push([sz, p.replace('public/', '')]); } } })('public/images');
bigImgs.sort((a, b) => b[0] - a[0]);

// ---- location duplication signal ----
const cityPages = urls.filter((u) => classify(u.replace(ORIGIN, '').replace(/\/$/, '')) === 'city').length;
const statePages = byType['state'] || 0;

// ---- print ----
const L = (s) => console.log(s);
L('\n===== APEX SEO + ECOMMERCE BASELINE =====');
L(`\nSitemaps: ${Object.entries(perSitemap).map(([k, v]) => `${k}=${v}`).join(', ')} | total indexable = ${urls.length}`);
L(`\nURL counts by page type:`); Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => L(`  ${k.padEnd(16)} ${v}`));
L(`\nMeta health: missing titles=${findings.missTitle.length}, dup titles=${findings.dupTitle.length}, missing desc=${findings.missDesc.length}, dup desc=${findings.dupDesc.length}`);
L(`Canonical mismatches=${findings.badCanon.length}, H1!=1 pages=${findings.h1.length}, noindex-in-sitemap=${findings.noindexInSitemap.length}, sitemap 404s=${findings.missing404.length}`);
L(`Redirecting sitemap URLs=${findings.redirectInSitemap.length} ${findings.redirectInSitemap.slice(0, 5).join(', ')}`);
L(`\nJSON-LD @types by page type:`); Object.entries(ldTypeByPageType).forEach(([k, v]) => L(`  ${k.padEnd(16)} ${[...v].join(', ')}`));
L(`\nProduct pages missing Product+Offer schema: ${findings.productNoSchema.length}`); findings.productNoSchema.forEach((x) => L(`  ${x}`));
L(`Blog articles missing BlogPosting: ${findings.blogNoSchema.length}`); findings.blogNoSchema.forEach((x) => L(`  ${x}`));
L(`\nPrivate-route indexability issues: ${privateIssues.length} ${privateIssues.join(', ')}`);
L(`Broken internal links: ${broken.size} ${[...broken].slice(0, 10).join(', ')}`);
L(`\nLocation pages: state=${statePages}, city(×5 cat)=${cityPages}; audit-locations flags templated pages (see LOCATION_AUDIT.md).`);
L(`\nImages: prerendered <img>=${imgTotal}, missing alt=${imgNoAlt}, missing width/height=${imgNoDim}`);
L(`Oversized source images (>500KB): ${bigImgs.length} (largest ${(bigImgs[0]?.[0] / 1e6).toFixed(1)}MB). Top:`);
bigImgs.slice(0, 8).forEach(([s, p]) => L(`  ${(s / 1e6).toFixed(2)}MB  ${p}`));
L('\n===== END BASELINE =====\n');

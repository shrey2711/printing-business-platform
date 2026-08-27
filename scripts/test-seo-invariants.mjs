// Phase 15 — SEO invariant test suite (dependency-free, runs against dist/).
// Complements audit-seo.mjs with HARD assertions (exit 1 on any failure) that
// gate deploys. Run after `vite build && prerender` (see `npm test`).
//
// Covers: sitemap URL resolves (no 404), exactly one H1, self-canonical,
// no-noindex on indexed pages, unique + length-bounded title/description,
// valid JSON-LD, image alt coverage, BlogPosting dates/author/publisher,
// Product Offer currency + BreadcrumbList hierarchy, and no private route in
// any sitemap.

import { readFileSync, existsSync } from 'fs';

const DIST = 'dist';
const ORIGIN = 'https://www.apextradeshow.com';
const SM_FILES = ['sitemap-pages', 'sitemap-categories', 'sitemap-products', 'sitemap-blog', 'sitemap-locations'];
// Routes that must never appear in a sitemap (private / transactional).
const PRIVATE = ['/cart', '/checkout', '/account', '/admin', '/login', '/register', '/order', '/reset-password', '/forgot-password'];

const decode = (s) => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = (html, re) => (html.match(re) || [])[1] || '';
const count = (html, re) => (html.match(re) || []).length;

const failures = [];
const fail = (path, msg) => failures.push(`${path} — ${msg}`);

// ---- Collect indexed URLs from the sitemaps ----
const urls = [];
for (const f of SM_FILES) {
  const p = `${DIST}/${f}.xml`;
  if (!existsSync(p)) { failures.push(`${f}.xml missing`); continue; }
  const xml = readFileSync(p, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) urls.push(m[1]);
  // Private routes must not be listed.
  for (const priv of PRIVATE) {
    if (new RegExp(`<loc>${ORIGIN}${priv}(/|<)`).test(xml)) failures.push(`${f}.xml lists private route ${priv}`);
  }
}

const titles = new Map();
const descs = new Map();

for (const loc of urls) {
  const path = loc.replace(ORIGIN, '').replace(/\/$/, '');
  const file = `${DIST}${path}/index.html`;
  const key = path || '/';
  if (!existsSync(file)) { fail(key, 'sitemap URL has no prerendered file (would 404)'); continue; }
  const html = readFileSync(file, 'utf8');

  // Exactly one H1.
  const h1s = count(html, /<h1[\s>]/g);
  if (h1s !== 1) fail(key, `expected exactly 1 <h1>, found ${h1s}`);

  // Self-referencing canonical.
  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  if (canon.replace(/\/$/, '') !== loc.replace(/\/$/, '')) fail(key, `canonical ${canon} != ${loc}`);

  // Indexed pages must not be noindex.
  if (/<meta name="robots"[^>]*noindex/.test(html)) fail(key, 'noindex on a sitemap (indexed) URL');

  // Title / description present, unique, length-bounded (regression guard).
  const title = decode(attr(html, /<title>([^<]*)<\/title>/));
  const desc = decode(attr(html, /<meta name="description" content="([^"]*)"/));
  if (!title) fail(key, 'empty <title>');
  else {
    if (title.length > 62) fail(key, `title ${title.length} chars (>62)`);
    if (titles.has(title)) fail(key, `duplicate title (also ${titles.get(title)})`); else titles.set(title, key);
  }
  if (!desc) fail(key, 'empty meta description');
  else {
    if (desc.length > 165) fail(key, `description ${desc.length} chars (>165)`);
    if (descs.has(desc)) fail(key, `duplicate description (also ${descs.get(desc)})`); else descs.set(desc, key);
  }

  // Every <img> must carry an alt attribute.
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt\s*=/.test(tag)) fail(key, `<img> without alt: ${tag.slice(0, 80)}`);
  }

  // JSON-LD must parse; collect nodes.
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(m[1]); nodes.push(...(Array.isArray(o) ? o : [o])); }
    catch { fail(key, 'invalid JSON-LD block'); }
  }

  // Blog articles: BlogPosting with valid dates + author + publisher.
  if (/^\/blog\/.+/.test(key)) {
    const bp = nodes.find((n) => n && n['@type'] === 'BlogPosting');
    if (!bp) fail(key, 'blog article missing BlogPosting JSON-LD');
    else {
      for (const d of ['datePublished', 'dateModified']) {
        if (!bp[d]) fail(key, `BlogPosting missing ${d}`);
        else if (Number.isNaN(Date.parse(bp[d]))) fail(key, `BlogPosting ${d} not a valid date: ${bp[d]}`);
      }
      if (!bp.author) fail(key, 'BlogPosting missing author');
      if (!bp.publisher) fail(key, 'BlogPosting missing publisher');
      if (!bp.mainEntityOfPage) fail(key, 'BlogPosting missing mainEntityOfPage');
    }
  }

  // Product pages: Offer currency USD + ordered BreadcrumbList.
  if (/^\/products\/.+/.test(key)) {
    const prod = nodes.find((n) => n && n['@type'] === 'Product');
    if (prod && prod.offers && prod.offers.priceCurrency && prod.offers.priceCurrency !== 'USD') {
      fail(key, `Product priceCurrency ${prod.offers.priceCurrency} (expected USD)`);
    }
    const bc = nodes.find((n) => n && n['@type'] === 'BreadcrumbList');
    if (!bc) fail(key, 'product page missing BreadcrumbList');
    else {
      const pos = (bc.itemListElement || []).map((e) => e.position);
      const ok = pos.length > 0 && pos.every((p, i) => p === i + 1);
      if (!ok) fail(key, `BreadcrumbList positions not 1..n: [${pos.join(',')}]`);
    }
  }
}

// ---- Merchant feed (/feed.xml): well-formed + price parity with landing pages ----
const feedPath = `${DIST}/feed.xml`;
if (!existsSync(feedPath)) {
  failures.push('feed.xml missing');
} else {
  const feed = readFileSync(feedPath, 'utf8');
  const opens = (feed.match(/<item>/g) || []).length;
  const closes = (feed.match(/<\/item>/g) || []).length;
  if (opens !== closes) failures.push(`feed.xml unbalanced <item> tags (${opens}/${closes})`);
  for (const item of feed.match(/<item>[\s\S]*?<\/item>/g) || []) {
    const id = (item.match(/<g:id>([^<]*)<\/g:id>/) || [])[1] || '(no id)';
    const price = (item.match(/<g:price>([^<]*)<\/g:price>/) || [])[1] || '';
    const link = (item.match(/<link>([^<]*)<\/link>/) || [])[1] || '';
    if (!/^\d+\.\d{2} USD$/.test(price)) failures.push(`feed ${id} — bad price format "${price}"`);
    const path = link.replace(ORIGIN, '').replace(/\/$/, '');
    const file = `${DIST}${path}/index.html`;
    if (!existsSync(file)) { failures.push(`feed ${id} — link has no page: ${link}`); continue; }
    // Price parity: the feed's integer price must appear as "$X" on the landing page.
    const intPrice = price.split('.')[0];
    const html = readFileSync(file, 'utf8');
    if (!html.includes(`$${Number(intPrice).toLocaleString('en-US')}`) && !html.includes(`$${intPrice}`)) {
      failures.push(`feed ${id} — price ${price} not shown on landing page ${link}`);
    }
  }
}

// ---- robots.txt: private routes blocked, sitemap referenced, assets not blocked ----
const robotsPath = `${DIST}/robots.txt`;
if (!existsSync(robotsPath)) {
  failures.push('robots.txt missing from build');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  for (const r of ['/account', '/admin', '/cart', '/checkout', '/order', '/login', '/api/']) {
    if (!robots.includes(`Disallow: ${r}`)) failures.push(`robots.txt does not Disallow ${r}`);
  }
  if (!/Sitemap:\s*https:\/\/www\.apextradeshow\.com\/sitemap\.xml/.test(robots)) failures.push('robots.txt missing Sitemap reference');
  if (/Disallow:\s*\/\s*$/m.test(robots)) failures.push('robots.txt blocks the whole site (Disallow: /)');
}

// ---- Report ----
if (failures.length) {
  console.error(`\n✗ SEO INVARIANTS FAILED — ${failures.length} issue(s):`);
  for (const f of failures.slice(0, 60)) console.error(`  ✗ ${f}`);
  if (failures.length > 60) console.error(`  … and ${failures.length - 60} more`);
  process.exit(1);
}
console.log(`✓ SEO INVARIANTS OK — ${urls.length} indexed URLs checked (H1, canonical, index, unique+bounded title/desc, JSON-LD, img alt, blog dates, product currency/breadcrumb, no private in sitemap) + Merchant feed price parity.`);

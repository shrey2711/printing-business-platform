// Post-build prerender: writes a static HTML file per public route so crawlers
// get real content (H1, description, price, internal links) + unique meta +
// JSON-LD in the initial HTML — without a full SSR framework. React still
// hydrates on top for the interactive app.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { listProducts, getProduct, startingPriceFor, priceDisplayFor } from '../backend/data/products.js';
import { getProductFaqs } from '../backend/data/faqs.js';
import { STATIC_ARTICLES } from '../backend/data/staticArticles.js';
import { territories, slugify } from '../src/data/states.js';
import { brand } from '../src/config/brand.js';
// Size / use-case landing pages target the winnable long tail (size x use case
// x location) — head terms belong to 15-20 year old domains.
import { SIZES, SOLUTIONS } from '../src/data/canopy.js';
import { applyMeta } from './lib/seo-meta.mjs';
import { PAGES } from '../src/data/pages.js';
import { CATEGORY_PAGES, SUBCATEGORIES } from '../src/data/categoryPages.js';
import {
  BOOTH_PACKAGES_META, BOOTH_PACKAGES, SHOP_INDIVIDUALLY,
  BOOTH_USE_CASES, BOOTH_FAQS, BOOTH_COMPONENT_SLUGS
} from '../src/data/boothPackages.js';
import { LOCAL_CATEGORIES, SEO_CITIES, cityDisplaysTitle, cityCatDescription, cityBreadcrumb, cityWithAbbr } from '../src/data/citySeo.js';
import { LANDING_PAGES } from '../src/data/landingPages.js';
import {
  PRIORITY_STATES, INDEXED_STATES, stateContent, ORDERING_STEPS,
  SIZE_COMPARISON, OUTDOOR_CONSIDERATIONS, ARTWORK_NOTES, STATE_FAQS
} from '../src/data/stateContent.js';
import { PRIORITY_CITIES, cityContent } from '../src/data/cityContent.js';
import { cityDetailFor } from '../src/data/cityDetail.js';
import { RESOURCES_META, RESOURCE_CATEGORIES } from '../src/data/resources.js';
import { guidesForCategory, productsForGuide, CITY_BOOTH_GUIDES } from '../src/data/internalLinks.js';
import { loadPublishedPosts, loadContentMap, loadSeoMap, loadRedirects, loadPricingOverrides } from './buildData.mjs';
import { resolveContent } from '../src/data/content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = brand.origin;
const BRAND = brand.name;

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Keep SEO titles within ~60 chars. Source strings hold raw "&", so .length
// equals the rendered length. Drop the optional tail first, then the brand
// suffix, so a long name (e.g. a long province) never overflows the title.
const fitTitle = (main, tail = '') => {
  const withAll = `${main}${tail} | ${BRAND}`;
  if (withAll.length <= 62) return withAll;
  const withBrand = `${main} | ${BRAND}`;
  return withBrand.length <= 62 ? withBrand : main;
};

// Shared crawlable navigation, on every prerendered page.
const NAV = `<nav aria-label="Primary">
  <a href="/">Home</a>
  <a href="/products">All Products</a>
  <a href="/trade-show-displays">Trade Show Displays</a>
  <a href="/custom-canopies">Custom Canopies</a>
  <a href="/banner-stands">Banner Stands</a>
  <a href="/backdrops">Backdrops</a>
  <a href="/table-covers">Table Covers</a>
  <a href="/trade-show-booth-packages">Booth Packages</a>
  <a href="/locations">Locations</a>
  <a href="/resources">Learning Center</a>
  <a href="/blog">Blog</a>
  <a href="/quote">Get a Quote</a>
  <a href="/contact">Contact</a>
</nav>`;

// Crawlable trust/company links on every prerendered page — mirrors the site
// footer so search engines see identifiable business information everywhere.
const FOOTER = `<nav aria-label="Company">
  <a href="/about">About Apex Trade Show</a>
  <a href="/artwork-guidelines">Artwork Guidelines</a>
  <a href="/shipping">Shipping</a>
  <a href="/returns">Returns</a>
  <a href="/warranty">Warranty</a>
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
  <a href="/contact">Contact</a>
</nav>`;

// Populated by top-level await before the render loop runs.
let seoMap = {};
let contentMap = {};

function render({ path, title, description, body, jsonLd, robots, canonical: canonicalArg, image, imageAlt, preloadImage }) {
  // Per-route SEO overrides from the dashboard win over the page's own values.
  const o = seoMap[path];
  if (o) {
    if (o.title) title = o.title;
    if (o.description) description = o.description;
    if (o.robots) robots = o.robots;
    if (o.jsonld) jsonLd = o.jsonld;
    if (o.og_image_path) image = o.og_image_path;
  }
  // Priority: dashboard override > per-route canonicalArg (e.g. a blog post that
  // canonicalises to another article) > the page itself.
  const canonical = o?.canonical || canonicalArg || ORIGIN + path;
  const url = ORIGIN + path;
  // Function-replacer based tag rewriting (see scripts/lib/seo-meta.mjs) — never
  // `$1…$2` strings, so a "$140" in a value can't be read as a capture-group ref.
  let html = applyMeta(template, { title, description, canonical, url });
  // Route-specific raster OG image (reuse real product/gallery photos). The
  // template ships a generic 1200×630 SVG as the fallback; when a page supplies
  // its own raster we swap og:image + twitter:image and drop the hardcoded
  // 1200×630 dimensions (the real photo may be a different size).
  if (image) {
    const absImg = /^https?:/.test(image) ? image : ORIGIN + image;
    html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, (_m, a, b) => a + esc(absImg) + b);
    html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, (_m, a, b) => a + esc(absImg) + b);
    if (imageAlt) html = html.replace(/(<meta property="og:image:alt" content=")[^"]*(")/, (_m, a, b) => a + esc(imageAlt) + b);
    html = html.replace(/\s*<meta property="og:image:width"[^>]*>/, '').replace(/\s*<meta property="og:image:height"[^>]*>/, '');
  }
  // LCP preload: start fetching the above-the-fold hero image before the JS
  // bundle parses, so it isn't discovered late (only where a page sets it).
  if (preloadImage) {
    html = html.replace('</head>', `<link rel="preload" as="image" href="${esc(preloadImage)}" fetchpriority="high">\n</head>`);
  }
  if (robots) {
    html = html.replace('</head>', `<meta name="robots" content="${robots}">\n</head>`);
  }
  if (jsonLd) {
    const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace('</head>', `${script}\n</head>`);
  }
  // Prerendered content lives inside #root; React replaces it on hydration.
  html = html.replace('<div id="root"></div>', `<div id="root"><div id="seo-prerender">${body}${NAV}${FOOTER}</div></div>`);
  // Prepend an explicit write-path marker so a custom canonical override can't
  // confuse where the file is written. Stripped before writing.
  return `<!--PP:${path}-->${html}`;
}

function write(path, html) {
  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const productList = listProducts();
// "from $X" for priced products, "Request a quote" for quote/competitive ones.
const priceFrom = (p) => (p.startingPrice != null ? `from $${p.startingPrice}` : 'Request a quote');
// Absolute URL of a product's representative RASTER photo, for og:image (and
// reused by Product schema). Prefers the real gallery hero (guaranteed to exist
// by verify-media), then the size/category fallbacks that the schema also uses.
function productPhoto(product) {
  const gallery = (Array.isArray(product.gallery) ? product.gallery : [])
    .map((g) => (typeof g === 'string' ? g : g && g.src))
    .filter(Boolean)
    .filter((s) => !/\.svg$/i.test(s));
  const first = (s) => (/^https?:/.test(s) ? s : ORIGIN + s);
  if (gallery.length) return first(gallery[0]);
  const sizeM = product.slug.match(/(\d+x\d+)/);
  if (sizeM) return `${ORIGIN}/images/tents/${sizeM[1]}-1wall.webp`;
  if (product.category === 'table-covers') return `${ORIGIN}/images/table-covers/${product.slug.includes('stretch') ? 'stretch' : 'pleated'}.webp`;
  if (['standard-', 'deluxe-'].some((x) => product.slug.startsWith(x)) || ['x-stand-banner', 'step-and-repeat-backdrop', 'table-top-banner-stand'].includes(product.slug)) {
    return `${ORIGIN}/images/displays/${product.slug}.webp`;
  }
  return null;
}
// Canopy photo reused as the OG image for canopy-topic pages (locations, solutions).
const CANOPY_OG = `${ORIGIN}/images/tents/10x10-1wall.webp`;
// Canopy-focused pages (home, locations) list only the core retail products.
const coreProducts = productList.filter((p) => p.category === 'tents' || p.category === 'table-covers');
const displayProducts = productList.filter((p) => p.category === 'banner-stands' || p.category === 'backdrops');
const bannerProducts = productList.filter((p) => p.category === 'banners');
const flagProductsList = productList.filter((p) => p.category === 'flags');
const segProductsList = productList.filter((p) => p.category === 'seg-kits');
// Render a heading + crawlable product link list (used across hub pages).
const productSection = (heading, list) =>
  list.length
    ? `<h2>${esc(heading)}</h2><ul>${list
        .map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`)
        .join('')}</ul>`
    : '';
// Product category id -> its category landing page (for breadcrumb up-links).
const CAT_BY_PRODUCT = Object.fromEntries(CATEGORY_PAGES.filter((c) => c.category).map((c) => [c.category, c]));
let count = 0;
const routes = [];

// Homepage buying guides, popular cities and FAQ — mirrored in HomePage.jsx so
// the crawlable SSR content matches the hydrated page (and the FAQPage schema).
const HOME_GUIDES = [
  { title: 'What a custom trade show display costs', to: '/blog/trade-show-display-cost' },
  { title: '10x10 vs 10x15 vs 10x20 canopy tents', to: '/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents' },
  { title: 'Feather angled vs convex vs teardrop flags', to: '/blog/feather-angled-vs-convex-vs-teardrop-flags' },
  { title: 'SEG modular kit A vs B vs C', to: '/blog/seg-modular-kit-a-vs-b-vs-c' },
  { title: 'Standard vs deluxe retractable banner', to: '/blog/standard-vs-deluxe-retractable-banner' },
  { title: 'Pleated vs stretch table covers', to: '/blog/pleated-vs-stretch-table-cover' }
];
const HOME_CITIES = [
  ['Las Vegas', 'las-vegas'], ['Orlando', 'orlando'], ['Chicago', 'chicago'],
  ['Atlanta', 'atlanta'], ['Dallas', 'dallas'], ['New York', 'new-york'],
  ['Houston', 'houston'], ['Los Angeles', 'los-angeles'], ['Miami', 'miami'],
  ['San Diego', 'san-diego'], ['Phoenix', 'phoenix'], ['Washington, D.C.', 'washington-dc']
];
const HOME_FAQS = [
  { q: 'What does Apex Trade Show print?', a: 'Custom trade show displays and event branding — canopy tents, retractable and X-stand banner stands, step & repeat backdrops, table covers, vinyl/mesh/fabric banners and feather flags — all printed to order in your brand.' },
  { q: 'How does pricing work?', a: 'Canopy tents, banner stands, backdrops, table covers, banners and flags configure for instant online pricing. Larger custom displays — SEG modular kits, tension-fabric and pop-up displays — are quoted per order.' },
  { q: 'How fast can I get my order?', a: 'Standard production is 6–8 business days after you approve your free artwork proof, with an optional 2–3 business day rush. Shipping and transit time are added and vary by destination.' },
  { q: 'Do you ship nationwide?', a: 'Yes. Apex is an online supplier and ships custom displays across the United States and Canada.' },
  { q: 'Do I see my artwork before it prints?', a: 'Yes — every order includes a free digital artwork proof, and nothing goes to production until you approve it in writing.' },
  { q: 'Can I order a whole booth from one place?', a: 'Yes. You can order every branded piece of your booth from Apex so it all matches — request a quote and we coordinate the set.' }
];

// ---- Home ----
routes.push(() => {
  const body = `
    <h1>Custom Trade Show Displays, Banner Stands &amp; Canopy Tents Across the USA</h1>
    <p>${esc(BRAND)} is your one supplier for a professional trade show booth — custom canopy tents,
    retractable banner stands, step &amp; repeat backdrops, table covers and event branding
    accessories, all in your brand. Instant online pricing on canopies, a free artwork proof on every
    order. ${esc(brand.shippingBlurb)}.</p>
    <h2>Shop by category</h2>
    <ul>
      <li><a href="/custom-canopies">Custom Canopy Tents</a> — printed pop-up tents &amp; walls</li>
      <li><a href="/banner-stands">Banner Stands</a> — retractable &amp; X-stand banners</li>
      <li><a href="/banners">Banners</a> — vinyl, mesh &amp; fabric banners</li>
      <li><a href="/backdrops">Backdrops</a> — step &amp; repeat media walls</li>
      <li><a href="/table-covers">Table Covers</a> — pleated &amp; stretch throws</li>
      <li><a href="/flags">Flags</a> — feather &amp; teardrop flags</li>
      <li><a href="/seg-displays">SEG Modular Kits</a> — illuminated modular booths</li>
      <li><a href="/products">All products</a> — the complete range</li>
    </ul>
    <h2>Custom canopy tents</h2>
    <ul>${coreProducts.map(productLi).join('')}</ul>
    ${displayProducts.length ? `<h2>Banner stands &amp; backdrops</h2>
    <ul>${displayProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`).join('')}</ul>` : ''}
    <h2>Canopy tent size guides</h2>
    <ul>${SIZES.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.slug)} canopy tent size guide</a> — ${esc(s.blurb)}</li>`).join('')}</ul>
    <h2>What people use them for</h2>
    <ul>${SOLUTIONS.map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a> — ${esc(s.blurb)}</li>`).join('')}</ul>
    <h2>Order in four steps</h2>
    <ol><li>Configure size, frame, print coverage and walls — the price updates as you go.</li>
    <li>Upload your artwork or logo — we send a free proof for your approval before production.</li>
    <li>Approve the artwork proof we send you.</li>
    <li>We print and ship it.</li></ol>
    <h2>Trade show buying guides</h2>
    <ul>${HOME_GUIDES.map((g) => `<li><a href="${g.to}">${esc(g.title)}</a></li>`).join('')}</ul>
    <h2>Trade show displays by city</h2>
    <ul>${HOME_CITIES.map(([l, s]) => `<li><a href="/trade-show-displays/${s}">Trade show displays in ${esc(l)}</a></li>`).join('')}</ul>
    <h2>Frequently asked questions</h2>
    ${HOME_FAQS.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  return render({
    path: '/',
    title: `Trade Show Displays, Canopies & Banners | ${BRAND}`,
    // Concise <meta> description (the long brand.description still feeds schema).
    description:
      'Custom trade show displays from one supplier: canopy tents, banner stands, backdrops, table covers, flags. Instant pricing, free artwork proof, US & Canada.',
    body,
    // Preload the home hero LCP image (matches the eager/fetchpriority tile in HomePage.jsx).
    preloadImage: '/images/showcase/tablecover-corner-cafe.webp',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    }
  });
});

// ---- Learning Center hub (/resources) ----
routes.push(() => {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const cats = RESOURCE_CATEGORIES.map((cat) => `
    <h2>${esc(cat.title)}</h2>
    <p>${esc(cat.blurb)}</p>
    <ul>${cat.slugs
      .map((slug) => {
        const p = bySlug.get(slug);
        const title = p ? p.title : slug.replace(/-/g, ' ');
        const ex = p && p.excerpt ? ` — ${esc(p.excerpt)}` : '';
        return `<li><a href="/blog/${slug}">${esc(title)}</a>${ex}</li>`;
      })
      .join('')}</ul>`).join('');
  return render({
    path: '/resources',
    title: `${RESOURCES_META.title} | ${BRAND}`,
    description: RESOURCES_META.description,
    image: CANOPY_OG,
    imageAlt: `${RESOURCES_META.h1} — ${BRAND}`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Learning Center</span></nav>
      <h1>${esc(RESOURCES_META.h1)}</h1>
      <p>${esc(RESOURCES_META.intro)}</p>
      ${cats}
      <p><a href="/products">Shop all trade show displays</a> · <a href="/quote">Request a quote</a></p>`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Learning Center', item: `${ORIGIN}/resources` }
      ]
    }
  });
});

// ---- Products listing (flat "all products" catalog) ----
// The keyword-primary "trade show displays" landing is /trade-show-displays;
// this page is the browse-everything catalog, so it does not compete for the
// same head term.
routes.push(() => {
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>All products</span></nav>
    <h1>Shop All Apex Products</h1>
    <p>Browse every Apex trade show display and event-branding product — or jump straight to a
    category.</p>
    <h2>Shop by category</h2>
    <ul>${CATEGORY_PAGES.map((cp) => `<li><a href="/${cp.slug}">${esc(cp.h1)}</a></li>`).join('')}</ul>
    <h2>Custom canopy tents</h2>
    <ul>${coreProducts.map(productLi).join('')}</ul>
    <p>Not sure which size? Read the <a href="/sizes/10x10">10x10</a>, <a href="/sizes/10x15">10x15</a>
    and <a href="/sizes/10x20">10x20</a> size guides.</p>
    ${productSection('Banner stands & backdrops', displayProducts)}
    ${productSection('Banners', bannerProducts)}
    ${productSection('Flags', flagProductsList)}
    ${productSection('SEG modular kits', segProductsList)}`;
  return render({
    path: '/products',
    title: `Shop All Products | ${BRAND}`,
    description: 'Browse all Apex trade show displays and event branding — canopy tents, banner stands, backdrops and table covers. Free artwork proof, ships US & Canada.',
    body,
    // ItemList of the catalog — every entry links a real, crawlable product page.
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Apex Trade Show products',
      itemListElement: productList.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${ORIGIN}/products/${p.slug}`,
        name: p.name
      }))
    }
  });
});

// ---- Category / collection landing pages (indexable) ----
for (const cp of CATEGORY_PAGES) {
  routes.push(() => {
    const catProducts = cp.category ? productList.filter((p) => p.category === cp.category) : productList;
    const subTiles = cp.hub
      ? `<h2>Shop by category</h2><ul>${SUBCATEGORIES.map((sc) => `<li><a href="/${sc.slug}">${esc(sc.h1)}</a></li>`).join('')}<li><a href="/trade-show-booth-packages">Trade Show Booth Packages</a> — build a complete booth</li>${LANDING_PAGES.map((lp) => `<li><a href="/${lp.slug}">${esc(lp.nav)}</a></li>`).join('')}</ul>`
      : '';
    const guides = cp.guideLinks
      ? `<h2>Canopy size guides</h2><ul>${cp.guideLinks.map((g) => `<li><a href="${g.to}">${esc(g.label)}</a></li>`).join('')}</ul>`
      : '';
    const included = `<h2>What's included</h2><ul>${cp.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>`;
    const answer = cp.answer ? `<p class="answer-block">${esc(cp.answer)}</p>` : '';
    // Comparison table — live "from" price by product slug (never hardcoded, so it
    // can't drift from the pricing engine). Static cells hold only stable attributes.
    const bySlug = Object.fromEntries(productList.map((p) => [p.slug, p]));
    const priceCol = Array.isArray(cp.compareCols) && cp.compareCols.includes('From');
    const compareTable = Array.isArray(cp.compare) && cp.compare.length
      ? `<h2>Compare ${esc(cp.nav.toLowerCase())}</h2><table><thead><tr><th>${cp.hub ? 'Category' : 'Product'}</th>${cp.compareCols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${cp.compare.map((row) => {
          const sp = row.slug && bySlug[row.slug] ? bySlug[row.slug].startingPrice : undefined;
          const priceTd = priceCol ? `<td>${sp != null ? `from $${sp}` : 'Quote'}</td>` : '';
          return `<tr><td><a href="${row.to}">${esc(row.name)}</a></td>${row.cells.map((c) => `<td>${esc(c)}</td>`).join('')}${priceTd}</tr>`;
        }).join('')}</tbody></table>`
      : '';
    const faqHtml = Array.isArray(cp.faqs) && cp.faqs.length
      ? `<h2>Frequently asked questions</h2>${cp.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
      : '';
    // Link the hub to its Tier-1 city landing pages so they sit in the crawl graph.
    const localForHub = { 'custom-canopies': 'canopies', 'trade-show-displays': 'displays', 'banner-stands': 'banner-stands', 'backdrops': 'backdrops', 'table-covers': 'table-covers' }[cp.slug];
    const lc = localForHub && LOCAL_CATEGORIES.find((l) => l.key === localForHub);
    const cities = lc
      ? `<h2>${esc(lc.label)} by city</h2><ul>${SEO_CITIES.filter((c) => c.tier <= 2).map((c) => `<li><a href="/${lc.slug}/${c.slug}">${esc(lc.label)} in ${esc(c.city)}, ${esc(c.abbr)}</a></li>`).join('')}</ul>`
      : '';
    // Buying-decision sections: how to choose within the category, sized and
    // specified from the product records rather than restating the intro.
    const guideHtml = Array.isArray(cp.guide)
      ? cp.guide.map((g) => `<h2>${esc(g.h2)}</h2><p>${esc(g.p)}</p>`).join('')
      : '';
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>${esc(cp.nav)}</span></nav>
      <h1>${esc(cp.h1)}</h1>
      <p>${esc(cp.intro)}</p>
      ${answer}
      ${subTiles}
      <h2>${cp.hub ? 'Featured products' : cp.h1}</h2>
      <ul>${catProducts.map(productLi).join('')}</ul>
      ${compareTable}
      ${guideHtml}
      ${included}
      ${cities}
      ${guides}
      ${faqHtml}`;
    // Representative raster OG: a real photo of a product in this category (the
    // hub falls back to a canopy). Never a misleading render.
    const catPhoto = (catProducts.map(productPhoto).find(Boolean)) || productPhoto(coreProducts[0]);
    return render({
      path: `/${cp.slug}`,
      title: `${cp.title} | ${BRAND}`,
      description: cp.description,
      image: catPhoto,
      imageAlt: `${cp.h1} — ${BRAND}`,
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: cp.h1, item: `${ORIGIN}/${cp.slug}` }
          ]
        },
        ...(catProducts.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: catProducts.map((p, i) => ({
                '@type': 'ListItem', position: i + 1, url: `${ORIGIN}/products/${p.slug}`, name: p.name
              }))
            }]
          : []),
        ...(Array.isArray(cp.faqs) && cp.faqs.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: cp.faqs.map((f) => ({
                '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            }]
          : [])
      ]
    });
  });
}

// ---- Trade Show Booth Packages (recommended combinations of existing products) ----
// Additional sales path. No package price/SKU — every component links to its own
// product page. Targets "complete booth / display kit" intent; must NOT
// cannibalize the individual tent/product pages.
routes.push(() => {
  const m = BOOTH_PACKAGES_META;
  const bySlug = Object.fromEntries(productList.map((p) => [p.slug, p]));
  const shopLinks = SHOP_INDIVIDUALLY.map((s) => `<a href="${s.to}">${esc(s.label)}</a>`).join(' · ');
  const pkgs = BOOTH_PACKAGES.map((pkg) => `
    <div class="booth-pkg">
      <h3>${esc(pkg.name)}</h3>
      <p>${esc(pkg.tagline)}</p>
      <ul>${pkg.components.map((slug) => {
        const p = bySlug[slug];
        if (!p) return `<li><a href="/products/${slug}">${esc(slug)}</a> — request a quote</li>`;
        // photo per component: a booth package is bought on how the pieces look together
        const photo = productPhoto(p);
        const img = photo ? `<img src="${photo.replace(ORIGIN, '')}" alt="${esc(`${p.name} — custom printed by ${BRAND}`)}" width="220" height="220" loading="lazy" decoding="async"> ` : '';
        return `<li>${img}<a href="/products/${slug}">${esc(p.name)}</a> — ${priceFrom(p)}</li>`;
      }).join('')}</ul>
      <p><strong>Best for:</strong> ${esc(pkg.bestFor)}</p>
    </div>`).join('');
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/trade-show-displays">Trade Show Displays</a> / <span>Booth Packages</span></nav>
    <h1>${esc(m.h1)}</h1>
    <p>Need a whole booth, not just one piece? These packages combine Apex products that work well
    together — canopy tents, banner stands, table covers and backdrops, all printed to match. Every
    item is also sold individually, with its own price and checkout — you never have to buy a bundle.</p>
    <h2>Buy the whole booth, or any single product</h2>
    <p>${shopLinks}</p>
    <h2>Recommended booth packages</h2>
    ${pkgs}
    <h2>Where these booths work</h2><ul>${BOOTH_USE_CASES.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
    <h2>Booth package FAQs</h2>${BOOTH_FAQS.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  return render({
    path: `/${m.slug}`,
    title: `${m.title} | ${BRAND}`,
    description: m.description,
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Trade Show Displays', item: `${ORIGIN}/trade-show-displays` },
          { '@type': 'ListItem', position: 3, name: m.h1, item: `${ORIGIN}/${m.slug}` }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Products in Apex booth packages',
        itemListElement: BOOTH_COMPONENT_SLUGS.map((slug, i) => ({
          '@type': 'ListItem', position: i + 1, url: `${ORIGIN}/products/${slug}`,
          name: (getProduct(slug) || {}).name || slug
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: BOOTH_FAQS.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    ]
  });
});

// ---- City × category local landing pages ----
// /trade-show-canopies|trade-show-displays|banner-stands/[city]. Tier 1 cities
// are indexed with unique local content; Tier 2/3 are noindex,follow until they
// earn depth (anti-thin-page gate). These are the canonical local pages — old
// /locations/[state]/[city] canopy pages 301 into /trade-show-canopies/[city].
//
// cityWithAbbr ("City, ABBR", honouring per-city h1City overrides) is imported
// from citySeo.js so SSR and the client component share one definition.
const endSentence = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
// Collapse a run of periods to one — a city like "Washington, D.C." dropped into
// a "…in {city}." template would otherwise read "…in Washington, D.C..".
const dedupePeriods = (s) => s.replace(/\.{2,}/g, '.');
for (const lc of LOCAL_CATEGORIES) {
  for (const city of SEO_CITIES) {
    routes.push(() => {
      const items = productList.filter((p) => lc.productCats.includes(p.category));
      const siblings = LOCAL_CATEGORIES.filter((l) => l.key !== lc.key);
      const others = SEO_CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);
      // §21 image SEO: the prerendered grid carries the real product photo, so
      // the crawled page is not text-only. Alt text describes the PRODUCT (it
      // is what the photo shows) rather than repeating "{label} in {city}" on
      // every image, which would be keyword stuffing and useless to a reader.
      const productLis = items
        .map((p) => {
          const photo = productPhoto(p);
          const img = photo
            ? `<img src="${photo.replace(ORIGIN, '')}" alt="${esc(`${p.name} — custom printed by ${BRAND}`)}" width="320" height="320" loading="lazy" decoding="async"> `
            : '';
          return `<li>${img}<a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`;
        })
        .join('');
      const siblingLinks = siblings
        .map((s) => `<a href="/${s.slug}/${city.slug}">${esc(s.label)} in ${esc(city.city)}</a>`)
        .join(' · ');
      const otherLis = others
        .map((c) => `<li><a href="/${lc.slug}/${c.slug}">${esc(lc.label)} in ${esc(c.city)}</a></li>`)
        .join('');
      // Rich, per-city editorial (real facts only) when the city has a detail
      // entry; otherwise the standard template. Keeps rollout incremental with no
      // thin/empty sections.
      const detail = cityDetailFor(city.slug);
      const st = (lc.slug === 'trade-show-displays') ? detail?.specTable : null;
      const specTableHtml = st
        ? `<div class="table-wrap"><table class="compare-table"><caption>${esc(st.caption)}</caption><thead><tr>${st.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${st.rows.map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        : '';
      const richHtml = detail
        ? `
        <p class="answer-block">${esc(detail.answer)}</p>
        <h2>Why exhibit in ${esc(city.city)}?</h2>
        ${detail.overview.map((t) => `<p>${esc(t)}</p>`).join('')}
        <p>${esc(detail.whyExhibit)}</p>
        <h2>Top convention centers in ${esc(city.city)}</h2>
        <ul>${detail.conventionCenters.map((v) => `<li><strong>${esc(v.name)}</strong> — ${esc(v.desc)}</li>`).join('')}</ul>
        <h2>Popular trade show industries in ${esc(city.city)}</h2>
        <ul>${detail.industries.map(([n, d]) => `<li><strong>${esc(n)}</strong> — ${esc(d)}</li>`).join('')}</ul>
        <h2>Shipping to ${esc(city.city)}</h2>
        <p>${esc(BRAND)} prints to order and ships to ${esc(city.city)}, ${esc(city.stateName)}. Standard production is 6–8 business days after you approve your free artwork proof, with an optional 2–3 business day rush; transit time is added on top and depends on the delivery address. Ship to your venue's receiving dock, an advance warehouse, or your business address.</p>
        <h2>Outdoor &amp; climate tips for ${esc(city.city)}</h2>
        <p>${esc(detail.climate)}</p>
        ${detail.bestDisplays ? `<h2>Best displays for ${esc(city.city)} trade shows</h2><p>${esc(detail.bestDisplays)}</p>${specTableHtml}` : ''}`
        : '';
      const cityFaqHtml = detail
        ? `<h2>${esc(city.city)} FAQ</h2>${detail.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
        : '';
      const boothLinks = `<p>Complete your ${esc(city.city)} booth: <a href="/custom-canopies">canopy tents</a> · <a href="/banner-stands">banner stands</a> · <a href="/backdrops">backdrops</a> · <a href="/table-covers">table covers</a> · <a href="/trade-show-displays">all trade show displays</a>.</p>`;
      // Dedicated contextual product H2 sections — displays (hub) page only, when
      // the city supplies them (see cityDetail.productSections).
      const productSectionsHtml = (lc.slug === 'trade-show-displays' && Array.isArray(detail?.productSections))
        ? detail.productSections.map((s) => `<h2>${esc(s.h2)}</h2><p>${esc(s.body)}</p>${Array.isArray(s.links) && s.links.length ? `<p>${s.links.map((l) => `<a href="${l.to}">${esc(l.label)}</a>`).join(' · ')}</p>` : ''}`).join('')
        : '';
      // Planning renders AFTER the product sections (logical §24 order: plan the
      // booth once you've chosen displays).
      const planningHtml = detail?.planning ? `<h2>Planning your ${esc(city.city)} booth</h2><p>${esc(detail.planning)}</p>` : '';
      const crumbs = cityBreadcrumb(lc.label, lc.slug, city);
      const crumbNav = crumbs.map((c, i) => i === crumbs.length - 1
        ? `<span>${esc(c.name)}</span>`
        : `<a href="${c.url}">${esc(c.name)}</a>`).join(' / ');
      const body = `
        <nav aria-label="Breadcrumb">${crumbNav}</nav>
        <h1>${esc(lc.label)} in ${esc(cityWithAbbr(city))}</h1>
        <p>${esc(dedupePeriods(lc.lead(city)))}</p>
        ${richHtml}
        <h2>${esc(lc.label)} for ${esc(city.city)} events</h2>
        <ul>${productLis}</ul>
        ${boothLinks}
        ${productSectionsHtml}
        ${planningHtml}
        <h2>Trade shows in ${esc(city.city)}</h2>
        <p>${esc(city.city)} hosts ${esc(city.scene)}. Whether you're exhibiting at ${esc(city.venue)} or
        running an outdoor activation nearby, ${esc(BRAND)} prints your ${esc(lc.label.toLowerCase())} in your
        brand and ships them to ${esc(city.city)}, ${esc(city.stateName)}.</p>
        <p>Building a full booth in ${esc(city.city)}? ${siblingLinks}</p>
        <h2>Guides for your ${esc(city.city)} booth</h2>
        <ul>${CITY_BOOTH_GUIDES.map((g) => `<li><a href="/blog/${g.slug}">${esc(g.label)}</a></li>`).join('')}</ul>
        ${cityFaqHtml}
        <h2>${esc(lc.label)} in other cities</h2>
        <ul>${otherLis}</ul>`;
      return render({
        path: `/${lc.slug}/${city.slug}`,
        title: lc.slug === 'trade-show-displays'
          ? cityDisplaysTitle(city)
          : `${lc.label} in ${cityWithAbbr(city)} | ${BRAND}`,
        description: (lc.slug === 'trade-show-displays' && detail?.metaDescription) ? detail.metaDescription : cityCatDescription(lc.label, city),
        image: items.map(productPhoto).find(Boolean) || productPhoto(coreProducts[0]),
        imageAlt: `${lc.label} shipped to ${city.city} — ${BRAND}`,
        robots: city.tier > 2 ? 'noindex, follow' : undefined,
        body,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((c, i) => ({
              '@type': 'ListItem', position: i + 1, name: c.name, item: `${ORIGIN}${c.url === '/' ? '/' : c.url}`
            }))
          },
          {
            // Types the page + wires it to the central WebSite/Organization entity.
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${ORIGIN}/${lc.slug}/${city.slug}#webpage`,
            url: `${ORIGIN}/${lc.slug}/${city.slug}`,
            name: `${lc.label} in ${cityWithAbbr(city)}`,
            description: cityCatDescription(lc.label, city),
            isPartOf: { '@id': `${ORIGIN}/#website` },
            about: { '@id': `${ORIGIN}/#organization` }
          },
          {
            // Accurate location-service node: Apex serves (ships to) this city.
            // areaServed = City, provider = the central org. NOT LocalBusiness —
            // no address/physical presence is claimed.
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${ORIGIN}/${lc.slug}/${city.slug}#service`,
            name: `${lc.label} in ${city.city}`,
            serviceType: `Custom ${lc.label.toLowerCase()} printing`,
            provider: { '@id': `${ORIGIN}/#organization` },
            areaServed: { '@type': 'City', name: city.city },
            description: cityCatDescription(lc.label, city)
          },
          ...(detail
            ? [{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: detail.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
              }]
            : [])
        ]
      });
    });
  }
}

// ---- Display-type SEO landing pages (SEG, tension fabric, pop-up, flags) ----
// Content-first, quote-based (no invented specs/prices). Breadcrumb + FAQ schema.
for (const lp of LANDING_PAGES) {
  routes.push(() => {
    const sections = lp.sections
      .map((s) => `<h2>${esc(s.h2)}</h2>${s.p ? `<p>${esc(s.p)}</p>` : ''}${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}`)
      .join('');
    const faqsHtml = lp.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('');
    const relatedHtml = lp.related.map((r) => `<a href="${r.to}">${esc(r.label)}</a>`).join(' · ');
    // Direct product links in the prerendered HTML (crawlable, not client-only).
    const lpProducts = lp.products
      ? productList.filter((p) => lp.products.some((x) => x.slug === p.slug))
      : [];
    const productsHtml = lpProducts.length
      ? `<h2>Shop ${esc(lp.nav.toLowerCase())}</h2><ul>${lpProducts.map(productLi).join('')}</ul>`
      : '';
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/trade-show-displays">Trade Show Displays</a> / <span>${esc(lp.nav)}</span></nav>
      <h1>${esc(lp.h1)}</h1>
      <p>${esc(lp.intro)}</p>
      ${sections}
      ${productsHtml}
      <h2>Frequently asked questions</h2>${faqsHtml}
      <h2>Related displays</h2><p>${relatedHtml}</p>
      ${lpProducts.some((p) => p.startingPrice != null)
        ? `<p><a href="/products/${lpProducts[0].slug}">Configure ${esc(lp.nav.toLowerCase())} for an instant price →</a></p>`
        : `<p><a href="/quote">Request a quote for ${esc(lp.nav.toLowerCase())} →</a></p>`}`;
    // OG: the landing's own image if set, else a real photo of a linked product.
    const lpPhoto = lp.image ? ORIGIN + lp.image : (lpProducts.map(productPhoto).find(Boolean) || null);
    return render({
      path: `/${lp.slug}`,
      title: `${lp.title} | ${BRAND}`,
      description: lp.description,
      ...(lpPhoto ? { image: lpPhoto, imageAlt: `${lp.h1} — ${BRAND}` } : {}),
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Trade Show Displays', item: `${ORIGIN}/trade-show-displays` },
            { '@type': 'ListItem', position: 3, name: lp.h1, item: `${ORIGIN}/${lp.slug}` }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: lp.faqs.map((f) => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: lp.h1,
          serviceType: lp.nav,
          description: lp.description,
          provider: { '@type': 'Organization', name: BRAND, url: `${ORIGIN}/` },
          areaServed: [
            { '@type': 'Country', name: 'United States' },
            { '@type': 'Country', name: 'Canada' }
          ]
        }
      ]
    });
  });
}

// ---- Size guide pages (INFORMATIONAL — research intent, not commercial) ----
// These deliberately do NOT compete with /products/canopy-tent-<size>. They
// explain dimensions, capacity, layout and uses, then hand off to the product
// page with a single clear "Shop the …" call to action.
for (const size of SIZES) {
  routes.push(() => {
    const g = size.guide;
    const others = SIZES.filter((s) => s.slug !== size.slug);
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/custom-canopies">Custom Canopies</a> / <span>${esc(size.slug)} Size Guide</span></nav>
      <h1>${esc(g.title)}</h1>
      <p>${esc(size.blurb)} This guide covers the ${esc(size.slug)} canopy tent's dimensions, how many
      tables and people it fits, booth layout ideas and what it is best used for — so you can pick the
      right size before you configure and buy.</p>
      <h2>Dimensions &amp; footprint</h2>
      <p>${esc(g.footprint)}</p>
      <h2>How many tables and people fit</h2>
      <ul>${g.capacity.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <h2>Booth layout ideas</h2>
      <ul>${g.layouts.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <h2>Wall options for a ${esc(size.label)}</h2>
      <p>Add up to 3 printed walls, in any mix of full-height and half-height (both cost the same per
      wall). Walls give you shade, a printed backdrop, weather protection and privacy while keeping
      the front open. You can also print the canopy top and valance, and choose standard 6–8 day or
      rush 2–3 day production.</p>
      <h2>Common uses for a ${esc(size.label)}</h2>
      <ul>${g.uses.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      <h2>${esc(size.slug)} vs other sizes</h2>
      <p>${esc(g.comparison)}</p>
      <ul>${others.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.slug)} canopy tent size guide</a></li>`).join('')}</ul>
      <h2>Shop the ${esc(size.label)} Custom Canopy Tent</h2>
      <p>Ready to order? <a href="/products/${size.product}">Configure the ${esc(size.label)} custom
      canopy tent and get an instant price →</a></p>`;
    return render({
      path: `/sizes/${size.slug}`,
      title: `${g.title} | ${BRAND}`,
      description: g.metaDescription,
      image: `${ORIGIN}/images/tents/${size.slug}-1wall.webp`,
      imageAlt: `${size.label} custom printed canopy tent — ${BRAND}`,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Custom Canopies', item: `${ORIGIN}/custom-canopies` },
          { '@type': 'ListItem', position: 3, name: `${size.slug} Size Guide`, item: `${ORIGIN}/sizes/${size.slug}` }
        ]
      }
    });
  });
}

// ---- Use-case (solution) landing pages ----
for (const sol of SOLUTIONS) {
  routes.push(() => {
    const g = sol.guide;
    const others = SOLUTIONS.filter((s) => s.slug !== sol.slug);
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/custom-canopies">Custom Canopies</a> / <span>${esc(sol.title)}</span></nav>
      <h1>${esc(sol.title)}</h1>
      <p>${esc(g.intro)}</p>
      <h2>What matters for ${esc(sol.title.toLowerCase())}</h2>
      <ul>${g.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <h2>Choosing a size</h2>
      <p>${esc(g.sizing)}</p>
      <ul>${SIZES.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.slug)} canopy tent size guide</a></li>`).join('')}</ul>
      <h2>Wall &amp; print setup</h2>
      <p>${esc(g.walls)}</p>
      ${g.care ? `<h2>Setup, care &amp; durability</h2>\n      <p>${esc(g.care)}</p>` : ''}
      <h2>Order your ${esc(sol.title.toLowerCase().replace(/ tents$/, ' tent'))}</h2>
      <p>Pick a size and configure walls, print and delivery for an instant price:</p>
      <ul>${coreProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}</li>`).join('')}</ul>
      <h2>Other uses</h2>
      <ul>${others.map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/solutions/${sol.slug}`,
      title: fitTitle(sol.title, ' — Custom Printed'),
      description: g.metaDescription,
      image: CANOPY_OG,
      imageAlt: `${sol.title} — custom printed canopy tents by ${BRAND}`,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Custom Canopies', item: `${ORIGIN}/custom-canopies` },
          { '@type': 'ListItem', position: 3, name: sol.title, item: `${ORIGIN}/solutions/${sol.slug}` }
        ]
      }
    });
  });
}

// Commercial-intent title/H1/description per product. Canopy sizes target
// "<size> custom canopy tent with logo"; others keep a sensible default.
function productSeoTitle(product) {
  // Products can carry their own SEO title/description (e.g. trade-show displays).
  if (product.seoTitle) {
    return {
      title: product.seoTitle,
      h1: product.name,
      description: () => product.seoDescription || product.tagline
    };
  }
  const m = product.slug.match(/canopy-tent-(\d+x\d+)/);
  if (m) {
    const size = m[1];
    return {
      title: `${size} Custom Canopy Tent With Logo`,
      h1: `${product.name} — Custom Printed With Your Logo`,
      description: (price) =>
        `Custom printed ${size} canopy tent with your logo — full-color dye sublimation, full or half walls, from $${price}. Free artwork proof, ships across the US & Canada.`
    };
  }
  return {
    title: `${product.name} | Instant Pricing`,
    h1: `${product.name} — Custom Printing & Instant Pricing`,
    description: (price, prod) => `${prod.tagline} Order online with instant pricing from $${price}. ${prod.turnaround}`
  };
}

// ---- Each product ----
for (const summary of productList) {
  const product = getProduct(summary.slug);
  const startingPrice = summary.startingPrice;
  // For canopy kit products the "from" floor is graphic-only while the default
  // build is the full set — carry both so the badge + schema are unambiguous.
  const priceDisp = priceDisplayFor(product.pricing);
  routes.push(() => {
    const p = product.pricing;
    // Build a specifications list — never emit empty labels. Products may carry
    // their own spec table (trade-show displays); otherwise derive per model.
    const specs = [];
    if (Array.isArray(product.specs) && product.specs.length) {
      for (const [k, v] of product.specs) specs.push([k, v]);
    } else if (p.model === 'area') {
      const materials = (p.materials || []).map((m) => m.name).join(', ');
      if (materials) specs.push(['Materials', materials]);
      specs.push(['Sizes', `Custom sizes from ${p.minWidthIn}"×${p.minHeightIn}" up to ${p.maxWidthIn}"×${p.maxHeightIn}"`]);
      const finishing = (p.finishing || []).map((f) => f.name).join(', ');
      if (finishing) specs.push(['Finishing', finishing]);
    } else if (p.model === 'configured') {
      // Canopy fabric/frame only for real canopy products (size in the slug) —
      // never leak canopy hardware onto other configured products.
      const sizeMatch = product.slug.match(/(\d+x\d+)/);
      if (sizeMatch) {
        specs.push(['Size', sizeMatch[1].replace('x', "' × ") + "'"]);
        specs.push(['Fabric', '600D polyester, dye-sublimated full-color print']);
        specs.push(['Frame', 'Heavy-duty aluminum hex, telescopic legs']);
      }
      // Each configurable option group and its choices.
      for (const g of p.optionGroups || []) {
        const choices = (g.choices || []).map((c) => c.label).join(', ');
        if (choices) specs.push([g.label, choices]);
      }
    } else {
      const variants = (p.variants || []).map((v) => v.name).join(', ');
      if (variants) specs.push(['Options', variants]);
      const materials = (p.materials || []).map((m) => m.name).join(', ');
      if (materials) specs.push(['Materials', materials]);
    }

    // Related: explicit list from the product when set, else other products.
    const relatedSlugs = Array.isArray(product.related) && product.related.length
      ? product.related
      : productList.filter((x) => x.slug !== product.slug).slice(0, 5).map((x) => x.slug);
    const related = relatedSlugs
      .map((s) => productList.find((x) => x.slug === s))
      .filter(Boolean);
    const faqs = getProductFaqs(product);
    const seoTitle = productSeoTitle(product);
    // Real product images (dye-sub photos we actually ship), absolute URLs for
    // Product schema. Derived from the size in the slug.
    const sizeM = product.slug.match(/(\d+x\d+)/);
    let productImages = [];
    // Prefer the product's real photo gallery so schema image[] matches the
    // gallery shown on the page (raster only — SVG diagrams are excluded here).
    const galleryImgs = Array.isArray(product.gallery)
      ? product.gallery.map((g) => (typeof g === 'string' ? g : g && g.src)).filter(Boolean)
      : [];
    const rasterGallery = galleryImgs.filter((s) => !/\.svg$/i.test(s));
    if (rasterGallery.length) {
      productImages = rasterGallery.map((s) => (/^https?:/.test(s) ? s : ORIGIN + s));
    } else if (sizeM) {
      productImages = [1, 2, 3].map((n) => `${ORIGIN}/images/tents/${sizeM[1]}-${n}wall.webp`);
    } else if (product.category === 'table-covers') {
      const k = product.slug.includes('stretch') ? 'stretch' : 'pleated';
      productImages = [`${ORIGIN}/images/table-covers/${k}.webp`];
    } else if (product.slug.startsWith('standard-') || product.slug.startsWith('deluxe-') || product.slug === 'x-stand-banner' || product.slug === 'step-and-repeat-backdrop' || product.slug === 'table-top-banner-stand') {
      productImages = [`${ORIGIN}/images/displays/${product.slug}.webp`];
    }
    const cat = CAT_BY_PRODUCT[product.category];
    const crumbParent = cat
      ? `<a href="/${cat.slug}">${esc(cat.nav)}</a>`
      : `<a href="/products">Products</a>`;
    // Product photography in the CRAWLED html. The gallery is authored with real
    // alt text, so prefer it; otherwise fall back to the same images already
    // used for og:image (for canopies that is the 1/2/3-wall set, which doubles
    // as a configuration comparison). Client-side galleries stay as they are.
    const galleryShots = (Array.isArray(product.gallery) ? product.gallery : [])
      .map((g) => (typeof g === 'string' ? { src: g, alt: '' } : g))
      .filter((g) => g && g.src && !/\.svg$/i.test(g.src))
      .slice(0, 4);
    const shots = galleryShots.length
      ? galleryShots.map((g) => ({ src: g.src.replace(ORIGIN, ''), alt: g.alt || `${product.name} — custom printed by ${BRAND}` }))
      : productImages.slice(0, 3).map((src, i) => ({
        src: src.replace(ORIGIN, ''),
        alt: `${product.name}${sizeM ? ` with ${i + 1} printed wall${i ? 's' : ''}` : ''} — custom printed by ${BRAND}`
      }));
    const shotsHtml = shots.length
      ? `<div class="product-shots">${shots.map((g) => `<img src="${g.src}" alt="${esc(g.alt)}" width="640" height="640" loading="lazy" decoding="async">`).join('')}</div>`
      : '';

    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / ${crumbParent} / <span>${esc(product.name)}</span></nav>
      <h1>${esc(seoTitle.h1)}</h1>
      ${shotsHtml}
      <p>${esc(product.description)}</p>
      <p>${startingPrice != null
        ? `<strong>Starting at $${startingPrice}${priceDisp.startingNote ? ` — ${esc(priceDisp.startingNote.toLowerCase())}` : ''}.</strong>${priceDisp.full ? ` ${esc(priceDisp.full.label)}: $${priceDisp.full.price}.` : ''}`
        : `<strong>Request a quote for pricing.</strong>`} ${esc(product.turnaround)}</p>
      <h2>Features</h2><ul>${product.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${Array.isArray(product.whatsIncluded) && product.whatsIncluded.length ? `<h2>What's in the box</h2><ul>${product.whatsIncluded.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
      ${Array.isArray(product.applications) && product.applications.length ? `<h2>Applications</h2><ul>${product.applications.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      <h2>Specifications</h2>
      ${specs.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join('')}
      <p><a href="/products/${product.slug}">${startingPrice != null ? `Configure your ${esc(product.name)} and get an instant price →` : `Configure your ${esc(product.name)} and request a quote →`}</a></p>
      <h2>Frequently asked questions</h2>
      ${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
      <h2>Related products</h2>
      <ul>${related.map((r) => `<li><a href="/products/${r.slug}">${esc(r.name)}</a></li>`).join('')}</ul>
      <h2>Guides for your booth</h2>
      <ul>${guidesForCategory(product.category)
        .map((slug) => {
          const g = posts.find((pp) => pp.slug === slug);
          return g ? `<li><a href="/blog/${slug}">${esc(g.title)}</a></li>` : '';
        })
        .join('')}</ul>`;
    return render({
      path: `/products/${product.slug}`,
      title: `${seoTitle.title} | ${BRAND}`,
      description: seoTitle.description(startingPrice, product),
      image: productImages[0] || productPhoto(product),
      imageAlt: `${product.name} — custom printed by ${BRAND}`,
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          // Stable @id so the node is addressable and de-duplicated.
          '@id': `${ORIGIN}/products/${product.slug}#product`,
          url: `${ORIGIN}/products/${product.slug}`,
          name: product.name,
          description: product.description,
          ...(productImages.length ? { image: productImages } : {}),
          // sku = the real internal product code (the slug); no fabricated GTIN/MPN.
          sku: product.slug,
          category: cat ? cat.nav : product.category,
          brand: { '@type': 'Brand', name: BRAND },
          // Offer only when there is a real price — no fake price on quote
          // products. When the "from" floor is a cheaper configuration than the
          // default build (canopy: graphic-only vs full set), emit an
          // AggregateOffer with lowPrice/highPrice so Google is never told the
          // floor price represents the complete product.
          ...(startingPrice != null
            ? {
                offers: priceDisp.full
                  ? {
                      '@type': 'AggregateOffer',
                      priceCurrency: 'USD',
                      lowPrice: String(startingPrice),
                      highPrice: String(priceDisp.full.price),
                      offerCount: 2,
                      // Every item is custom printed to order — not held in stock.
                      availability: 'https://schema.org/MadeToOrder',
                      itemCondition: 'https://schema.org/NewCondition',
                      url: `${ORIGIN}/products/${product.slug}`,
                      // Connect the offer to the central OnlineStore/Organization.
                      seller: { '@id': `${ORIGIN}/#organization` }
                    }
                  : {
                      '@type': 'Offer',
                      priceCurrency: 'USD',
                      price: String(startingPrice),
                      availability: 'https://schema.org/MadeToOrder',
                      itemCondition: 'https://schema.org/NewCondition',
                      url: `${ORIGIN}/products/${product.slug}`,
                      seller: { '@id': `${ORIGIN}/#organization` }
                    }
              }
            : {})
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            cat
              ? { '@type': 'ListItem', position: 2, name: cat.nav, item: `${ORIGIN}/${cat.slug}` }
              : { '@type': 'ListItem', position: 2, name: 'Products', item: `${ORIGIN}/products` },
            { '@type': 'ListItem', position: 3, name: product.name, item: `${ORIGIN}/products/${product.slug}` }
          ]
        },
        ...(faqs.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            }]
          : [])
      ]
    });
  });
}

// ---- Locations hub ----
routes.push(() => {
  const us = territories.filter((t) => t.country === 'US');
  const ca = territories.filter((t) => t.country === 'CA');
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Locations</span></nav>
    <h1>Custom Canopy Tents Across the US and Canada</h1>
    <p>${esc(BRAND)} ships custom printed pop-up canopy tents, with up to 3 printed walls, to every
    US state and Canadian province, priced in USD or CAD.</p>
    <h2>Popular cities</h2>
    <p>Trade show displays printed and shipped to major convention cities, with local venue, industry and shipping details.</p>
    <ul>${SEO_CITIES.map((c) => `<li><a href="/trade-show-displays/${c.slug}">Trade show displays in ${esc(cityWithAbbr(c))}</a></li>`).join('')}</ul>
    <h2>United States</h2>
    <ul>${us.map((s) => `<li><a href="/locations/${s.slug}">Canopy tents in ${esc(s.name)}</a></li>`).join('')}</ul>
    <h2>Canada</h2>
    <ul>${ca.map((s) => `<li><a href="/locations/${s.slug}">Canopy tents in ${esc(s.name)}</a></li>`).join('')}</ul>
    <h2>Order for your city</h2>
    <p>Apex prints to order and ships across the US and Canada — there's no local storefront to visit. Configure a
    <a href="/custom-canopies">canopy</a>, <a href="/banner-stands">banner stand</a>, <a href="/backdrops">backdrop</a>
    or <a href="/table-covers">table cover</a> for an instant online price and ship it to your venue, hotel or business
    address, or <a href="/quote">request a quote</a> for a full booth. Every order includes a free artwork proof before printing.</p>`;
  return render({
    path: '/locations',
    title: `Custom Canopy Tents Across the US & Canada | ${BRAND}`,
    description: 'Custom printed canopy tents shipped to every US state and Canadian province, with instant online pricing in USD or CAD.',
    image: CANOPY_OG,
    imageAlt: `Custom printed canopy tents shipped across the US & Canada — ${BRAND}`,
    body
  });
});

// State/province meta descriptions. The old version was a single template with
// the name and three cities swapped in, which made 64 pages look identical to
// anything scoring description diversity. This builds each one from the state's
// OWN content — the event types it actually lists — and rotates the sentence
// shape by slug so neighbouring states do not read alike. Falls back to the
// city list only where a state has no content entry.
const stateDescription = (s, content, areaWord) => {
  const cities = s.cities.slice(0, 3).join(', ');
  // Event labels are authored like "Rodeos & fairs" or "Las Vegas trade shows".
  // Lower-case the first word only when it is a common noun, so proper nouns
  // (Las Vegas, Mardi Gras, Cheyenne Frontier Days) keep their capitals.
  const ev = (content && Array.isArray(content.events) ? content.events : [])
    .map((e) => (/[A-Z]/.test(e.slice(1)) ? e : e.charAt(0).toLowerCase() + e.slice(1)));
  // Comma-joined, never "and ... and": several labels already contain "&".
  const one = ev[0] || '';
  const two = ev.slice(0, 2).join(', ');
  const shapes = [
    () => `Custom printed canopy tents for ${two} in ${s.name}. Instant online pricing, a free artwork proof and shipping ${areaWord}.`,
    () => `Branded pop-up canopy tents shipped ${areaWord} across ${s.name} — built for ${two}, with instant pricing online.`,
    () => `Custom canopy tents in ${s.name} for ${two}. Configure size and printed walls online for an instant price.`,
    () => `Printed canopy tents for ${s.name} events — ${two} — with instant online pricing and a free artwork proof.`,
    () => `Custom printed canopy tents for ${one} in ${s.name}, with instant online pricing, a free artwork proof and shipping ${areaWord}.`,
    () => `Canopy tents printed to order for ${s.name} — ${two} — shipped to ${cities} and ${areaWord}.`
  ];
  const fallback = `Custom printed canopy tents in ${s.name}. Instant online pricing and shipping to ${cities} and ${areaWord}.`;
  if (!ev.length) return fallback;
  // deterministic per state, so a rebuild never reshuffles descriptions
  const seed = [...s.slug].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const ordered = shapes.map((_, i) => shapes[(seed + i) % shapes.length]);
  const candidates = ordered.map((b) => b()).filter((d) => d.length >= 140 && d.length <= 165);
  return candidates[0] || ordered.map((b) => b()).sort((a, b) => Math.abs(152 - a.length) - Math.abs(152 - b.length))[0] || fallback;
};

// A product list item carrying the product's real photo. Category and landing
// pages previously rendered link-only lists, so a crawler saw no imagery at all
// on the pages that target the head terms. Alt text describes the product.
const productLi = (p) => {
  const photo = productPhoto(p);
  const img = photo
    ? `<img src="${photo.replace(ORIGIN, '')}" alt="${esc(`${p.name} — custom printed by ${BRAND}`)}" width="320" height="320" loading="lazy" decoding="async"> `
    : '';
  return `<li>${img}<a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`;
};

// ---- Each state/province + city ----
for (const s of territories) {
  const areaWord = s.country === 'CA' ? 'province-wide' : 'statewide';
  const isPriority = PRIORITY_STATES.has(s.slug);   // full editorial body
  const isIndexed = INDEXED_STATES.has(s.slug);     // competes in the index
  const content = stateContent[s.slug];
  routes.push(() => {
    // SEO cities link to their canonical /trade-show-displays/{city} page (not the
    // redirecting /locations/{state}/{city}); other cities keep the canopy page.
    const cityLinks = s.cities
      .map((c) => {
        const cs = slugify(c);
        const seo = SEO_CITIES.find((x) => x.slug === cs && x.stateSlug === s.slug);
        return seo
          ? `<li><a href="/trade-show-displays/${cs}">Trade show displays in ${esc(c)}, ${s.abbr}</a></li>`
          : `<li><a href="/locations/${s.slug}/${cs}">Canopy tents in ${esc(c)}, ${s.abbr}</a></li>`;
      })
      .join('');
    // State → City (§27): every SEO city in this state, linked to its canonical page.
    const seoInState = SEO_CITIES.filter((c) => c.stateSlug === s.slug);
    const seoCitiesHtml = seoInState.length
      ? `<h2>Trade show display cities in ${esc(s.name)}</h2><p>Full booth coverage — canopies, banner stands, backdrops and table covers — for exhibitors in these ${esc(s.name)} convention cities:</p><ul>${seoInState.map((c) => `<li><a href="/trade-show-displays/${c.slug}">Trade show displays in ${esc(cityWithAbbr(c))}</a></li>`).join('')}</ul>`
      : '';
    const products6 = `<ul>${coreProducts.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}</li>`).join('')}</ul>`;
    const sizesList = `<ul>${SIZES.map((z) => `<li><a href="/sizes/${z.slug}">${esc(z.label)} canopy tent</a></li>`).join('')}</ul>`;
    const sizePhotos = SIZES
      .map((z) => `<img src="/images/tents/${z.slug}-1wall.webp" alt="${esc(z.label)} custom printed canopy tent" width="1200" height="900" loading="lazy" decoding="async">`)
      .join('');
    const sizeComparison = `<ul>${SIZE_COMPARISON.map(([sz, txt]) => `<li><a href="/sizes/${sz}">${sz} canopy tent</a> — ${esc(txt)}</li>`).join('')}</ul>`;

    // Priority markets get genuinely unique, useful content; the long tail gets
    // a minimal page and is noindex'd (see robots below).
    const richBody = isPriority && content
      ? `<h2>Custom canopy tents in ${esc(s.name)}</h2><p>${esc(content.intro)}</p>
         <p>${sizePhotos}</p>
         <h2>Popular event uses in ${esc(s.name)}</h2>
         <ul>${content.events.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
         <h2>Choosing a canopy size for ${esc(s.name)} events</h2>
         ${sizeComparison}
         <h2>Outdoor event considerations</h2>
         <ul>${OUTDOOR_CONSIDERATIONS.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
         <h2>Printed wall options</h2>
         <p>Add full or half printed walls (up to 3, any mix — both cost the same per wall), print the
         canopy top and valance, and pick standard 6-8 day or rush 2-3 day production. Order 3+ tents
         for volume pricing.</p>
         <h2>Artwork &amp; branding</h2>
         <ul>${ARTWORK_NOTES.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
         <h2>How ordering works</h2><ol>${ORDERING_STEPS.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
         <h2>Shop canopy tents</h2>${products6}
         <h2>Custom canopy tent FAQs</h2>
         ${STATE_FAQS.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}`
      : `<p>Order custom printed pop-up canopy tents in ${esc(s.name)} with instant online pricing and
         shipping to ${esc(s.cities.join(', '))} and ${areaWord}.</p>
         <h2>Canopy sizes</h2>${sizesList}
         <h2>Popular products</h2>${products6}`;

    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/locations">Locations</a> / <span>${esc(s.name)}</span></nav>
      <h1>Custom Printed Canopy Tents in ${esc(s.name)}</h1>
      ${richBody}
      ${seoCitiesHtml}
      <h2>Cities we serve in ${esc(s.name)}</h2><ul>${cityLinks}</ul>`;
    return render({
      path: `/locations/${s.slug}`,
      title: fitTitle(`Custom Canopy Tents in ${s.name}`),
      description: stateDescription(s, content, areaWord),
      image: CANOPY_OG,
      imageAlt: `Custom printed canopy tents in ${s.name} — ${BRAND}`,
      // Every state page carries unique content, but only the markets with a
      // canonical city page compete in the index — 64 pages chasing one head
      // term plus a geo modifier split authority on a young domain. The rest
      // stay noindex,follow: readable, linked, still passing equity onward.
      robots: isIndexed ? undefined : 'noindex, follow',
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Locations', item: `${ORIGIN}/locations` },
            { '@type': 'ListItem', position: 3, name: s.name, item: `${ORIGIN}/locations/${s.slug}` }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Custom Printed Canopy Tents in ${s.name}`,
          url: `${ORIGIN}/locations/${s.slug}`,
          description: stateDescription(s, content, areaWord),
          isPartOf: { '@type': 'WebSite', url: `${ORIGIN}/` },
          about: { '@type': 'Place', name: s.name }
        },
        // Matches the four FAQs rendered on the page, verbatim.
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: STATE_FAQS.map(([q, a]) => ({
            '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
          }))
        }
      ]
    });
  });

  for (const c of s.cities) {
    const citySlug = slugify(c);
    const cityIsPriority = PRIORITY_CITIES.has(citySlug);
    const cc = cityContent[citySlug];
    routes.push(() => {
      const products6 = `<ul>${coreProducts.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}</li>`).join('')}</ul>`;
      const cityPhotos = SIZES
        .map((z) => `<img src="/images/tents/${z.slug}-1wall.webp" alt="${esc(z.label)} custom printed canopy tent" width="1200" height="900" loading="lazy" decoding="async">`)
        .join('');
      const cityComparison = `<ul>${SIZE_COMPARISON.map(([sz, txt]) => `<li><a href="/sizes/${sz}">${sz} canopy tent</a> — ${esc(txt)}</li>`).join('')}</ul>`;
      const richBody = cityIsPriority && cc
        ? `<h2>Custom canopy tents in ${esc(c)}</h2><p>${esc(cc.intro)}</p>
           <p>${cityPhotos}</p>
           <h2>Where canopy tents get used in ${esc(c)}</h2>
           <ul>${cc.events.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
           <h2>Choosing a size for ${esc(c)} events</h2>${cityComparison}
           <h2>Ordering &amp; artwork</h2>
           <ol>${ORDERING_STEPS.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
           <h2>Shop canopy tents</h2>${products6}
           <h2>Custom canopy tent FAQs</h2>
           ${STATE_FAQS.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
           <p><a href="/locations/${s.slug}">More about custom canopy tents in ${esc(s.name)} →</a></p>`
        : `<p>${esc(BRAND)} ships custom printed canopy tents to ${esc(c)},
           ${esc(s.name)} with instant online pricing and a free artwork proof on every order.</p>
           <h2>Popular products in ${esc(c)}</h2>${products6}`;
      const body = `
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/locations">Locations</a> / <a href="/locations/${s.slug}">${esc(s.name)}</a> / <span>${esc(c)}</span></nav>
        <h1>Custom Printed Canopy Tents in ${esc(c)}, ${esc(s.name)}</h1>
        ${richBody}`;
      return render({
        path: `/locations/${s.slug}/${citySlug}`,
        title: `Custom Canopy Tents in ${c}, ${s.abbr} | ${BRAND}`,
        description: `Order custom printed canopy tents in ${c}, ${s.name} with instant online pricing and fast shipping.`,
        // Priority cities have unique content and are indexed; the rest stay
        // noindex to avoid doorway-page risk.
        robots: cityIsPriority ? undefined : 'noindex, follow',
        body,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Locations', item: `${ORIGIN}/locations` },
            { '@type': 'ListItem', position: 3, name: s.name, item: `${ORIGIN}/locations/${s.slug}` },
            { '@type': 'ListItem', position: 4, name: c, item: `${ORIGIN}/locations/${s.slug}/${citySlug}` }
          ]
        }
      });
    });
  }
}

// ---- Contact + Quote ----
routes.push(() =>
  render({
    path: '/contact',
    title: `Contact Us | ${BRAND}`,
    description: `Contact ${BRAND} — custom printed trade show displays shipped across the US and Canada. Email, phone and business hours.`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Contact</span></nav>
      <h1>Contact ${esc(BRAND)}</h1>
      <p>We help businesses, teams and event vendors across the US and Canada get branded trade show
      displays — canopy tents, banner stands, backdrops and table covers — produced and delivered.
      Email ${esc(brand.email)} or call ${esc(brand.phone)}, ${esc(brand.hours)}.</p>`
  })
);
routes.push(() =>
  render({
    path: '/quote',
    title: `Request a Quote | ${BRAND}`,
    description: `Request a custom trade show display quote from ${BRAND} — canopy tents, banner stands, backdrops and table covers. Send your size and artwork.`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Quote</span></nav>
      <h1>Request a Custom Quote</h1>
      <p>Most configurations — canopy tents, banner stands, backdrops and table covers — are priced
      instantly on the product pages. For large fleet orders, non-standard sizes or anything unusual,
      tell us the size, quantity and print coverage and upload your artwork — we'll come back with
      pricing and a proof.</p>`
  })
);

// ---- Static info / trust pages (About, Artwork, Shipping, Returns, etc.) ----
for (const page of PAGES) {
  routes.push(() => {
    const blocks = page.blocks
      .map((b) => {
        const h = b.h ? `<h2>${esc(b.h)}</h2>` : '';
        const p = b.p ? `<p>${esc(b.p)}</p>` : '';
        const list = b.list ? `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : '';
        const links = b.links ? `<p>${b.links.map((l) => `<a href="${l.to}">${esc(l.label)}</a>`).join(' · ')}</p>` : '';
        return h + p + list + links;
      })
      .join('');
    return render({
      path: `/${page.slug}`,
      title: `${page.title} | ${BRAND}`,
      description: page.description,
      // Stub policy pages (shipping/returns/warranty) are noindex until they
      // carry real terms — linked and reachable, but not indexed thin.
      robots: page.stub ? 'noindex, follow' : undefined,
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>${esc(page.nav)}</span></nav>
        <h1>${esc(page.title)}</h1>${blocks}`
    });
  });
}

// ---- Private / app routes: noindex stubs ----
// These React routes are not prerendered, so without a stub the SPA rewrite
// serves the HOME index.html for them — which would index /login etc. as a
// duplicate of the homepage. Each stub is noindex,follow with a self canonical
// and non-home content; React replaces it with the real page on mount.
const PRIVATE_ROUTES = [
  { path: '/login', title: 'Sign In', h1: 'Sign in to your account' },
  { path: '/register', title: 'Create Account', h1: 'Create an account' },
  { path: '/account', title: 'My Account', h1: 'My account' },
  { path: '/admin', title: 'Admin', h1: 'Admin' },
  { path: '/order', title: 'Place Your Order', h1: 'Place your order' },
  // Defensive noindex stubs for private/transactional paths that are not React
  // routes today — without a stub the SPA rewrite would serve HOME content at
  // these URLs (an indexable home duplicate) if they were ever hit or linked.
  { path: '/cart', title: 'Cart', h1: 'Your cart' },
  { path: '/checkout', title: 'Checkout', h1: 'Checkout' },
  { path: '/reset-password', title: 'Reset Password', h1: 'Reset your password' },
  { path: '/forgot-password', title: 'Forgot Password', h1: 'Forgot your password' }
];
for (const r of PRIVATE_ROUTES) {
  routes.push(() =>
    render({
      path: r.path,
      title: `${r.title} | ${BRAND}`,
      description: `${r.title} — a private ${BRAND} account page.`,
      robots: 'noindex, follow',
      body: `<h1>${esc(r.h1)}</h1><p>This is a private page. <a href="/">Return to the home page</a>.</p>`
    })
  );
}

// ---- Load dashboard-authored content from Supabase at build time ----
const supabasePosts = await loadPublishedPosts();
// Merge in-repo static articles (static wins on slug clash), newest first.
const postBySlug = new Map();
for (const p of supabasePosts) postBySlug.set(p.slug, p);
for (const a of STATIC_ARTICLES) postBySlug.set(a.slug, a);
const posts = [...postBySlug.values()].sort(
  (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
);
seoMap = await loadSeoMap();
contentMap = await loadContentMap();
const redirectRules = await loadRedirects();

// Consolidate duplicate-topic articles: any post that canonicalises to another
// article becomes a REAL 301 to that target (not a separate HTTP-200 duplicate).
// These posts are skipped in the blog render loop below, so the only response for
// their URL is the edge 301. (e.g. what-size-canopy-tent-should-i-buy and
// how-much-does-a-custom-printed-canopy-tent-cost.)
for (const p of posts) {
  if (!p.canonical) continue;
  const dest = /^https?:/.test(p.canonical) ? new URL(p.canonical).pathname : p.canonical;
  if (dest === `/blog/${p.slug}`) continue; // self — nothing to redirect
  if (!redirectRules.some((r) => r.source === `/blog/${p.slug}`)) {
    redirectRules.push({ source: `/blog/${p.slug}`, destination: dest, code: 301 });
  }
}

// Reflect pricing overrides in the prerendered "from $X" listing badges.
const pricingOverrides = await loadPricingOverrides();
for (const p of productList) {
  if (pricingOverrides[p.slug]) p.startingPrice = startingPriceFor(pricingOverrides[p.slug]);
}

// Blog index
routes.push(() => {
  const items = posts
    .filter((p) => !p.canonical) // don't link to canonicalised-away (301'd) posts
    .map(
      (p) =>
        `<li><a href="/blog/${p.slug}">${esc(p.title)}</a>${p.excerpt ? ` — ${esc(p.excerpt)}` : ''}</li>`
    )
    .join('');
  const topics = [
    ['/trade-show-displays', 'All trade show displays'],
    ['/custom-canopies', 'Custom canopy tents'],
    ['/banner-stands', 'Retractable & X-stand banners'],
    ['/table-covers', 'Table covers'],
    ['/backdrops', 'Backdrops'],
    ['/artwork-guidelines', 'Artwork preparation']
  ].map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('');
  return render({
    path: '/blog',
    title: `Trade Show Display Guides & Buying Resources | ${BRAND}`,
    description:
      'Buying guides, size charts and setup tips for trade show displays — canopy tents, banner stands, table covers, backdrops, booth planning and artwork prep.',
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Resources</span></nav>
      <h1>Trade Show Resources &amp; Buying Guides</h1>
      <p>Practical guides to help you choose, print and set up a professional trade show booth — from
      custom canopy tents and banner stands to table covers, backdrops, artwork prep and booth planning.</p>
      <h2>Browse by topic</h2>
      <ul>${topics}</ul>
      <h2>Latest articles</h2>
      <ul>${items || '<li>Articles coming soon.</li>'}</ul>`
  });
});

// Each published post — full rendered HTML + BlogPosting JSON-LD.
for (const p of posts) {
  // Canonicalised-away duplicates are 301'd at the edge (see redirectRules above)
  // — do not also emit a 200 page for them.
  if (p.canonical) continue;
  routes.push(() => {
    const img = p.coverUrl ? (/^https?:\/\//.test(p.coverUrl) ? p.coverUrl : ORIGIN + p.coverUrl) : undefined;
    // Data-driven FAQ (optional): render the questions visibly AND emit FAQPage
    // from the SAME source, so the schema always matches what's on the page.
    const faqHtml = Array.isArray(p.faqs) && p.faqs.length
      ? `<h2>Frequently asked questions</h2>${p.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
      : '';
    // Phase 4 internal linking: 4 related products + up to 3 related articles
    // (by shared tag), with descriptive anchor text.
    const relProducts = productsForGuide(p.slug)
      .map((slug) => productList.find((x) => x.slug === slug))
      .filter(Boolean);
    const relProductsHtml = relProducts.length
      ? `<h2>Related products</h2><ul>${relProducts.map((x) => `<li><a href="/products/${x.slug}">${esc(x.name)}</a></li>`).join('')}</ul>`
      : '';
    const relArticles = posts
      .filter((o) => o.slug !== p.slug && !o.canonical && Array.isArray(o.tags) && Array.isArray(p.tags) && o.tags.some((t) => p.tags.includes(t)))
      .slice(0, 3);
    const relArticlesHtml = relArticles.length
      ? `<h2>Related articles</h2><ul>${relArticles.map((o) => `<li><a href="/blog/${o.slug}">${esc(o.title)}</a></li>`).join('')}</ul>`
      : '';
    // EEAT byline: author + last-updated + reading time (all real/computed).
    const articleWords = String(p.html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readMin = Math.max(1, Math.round(articleWords / 200));
    const updatedStr = (p.updatedAt || p.publishedAt || '').slice(0, 10);
    const byline = `<p class="article-meta">By Apex Trade Show Production Team${updatedStr ? ` · Updated ${updatedStr}` : ''} · ${readMin} min read</p>`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.seo?.description || p.excerpt,
        ...(img ? { image: img } : {}),
        datePublished: p.publishedAt || undefined,
        dateModified: p.updatedAt || p.publishedAt || undefined,
        author: { '@type': 'Organization', name: 'Apex Trade Show Production Team' },
        publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${ORIGIN}/images/logo.png` } },
        mainEntityOfPage: `${ORIGIN}/blog/${p.slug}`
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${ORIGIN}/blog` },
          { '@type': 'ListItem', position: 3, name: p.title, item: `${ORIGIN}/blog/${p.slug}` }
        ]
      },
      ...(p.faqs && p.faqs.length
        ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
          }]
        : [])
    ];
    return render({
      path: `/blog/${p.slug}`,
      title: `${p.seo?.title || p.title} | ${BRAND}`,
      description: p.seo?.description || p.excerpt,
      ...(img ? { image: img, imageAlt: p.title } : {}),
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a> / <span>${esc(p.title)}</span></nav>
        <article><h1>${esc(p.title)}</h1>${byline}${p.coverUrl ? `<img src="${esc(p.coverUrl)}" alt="${esc(p.title)}" width="1200" height="800" loading="lazy" decoding="async" style="max-width:100%;height:auto;border-radius:10px;margin:1rem 0">` : ''}${p.html}${faqHtml}${relProductsHtml}${relArticlesHtml}</article>`,
      jsonLd
    });
  });
}

// Collect every real page path so the edge middleware can return a genuine 404
// for anything not in this set (fixes the SPA soft-404 where unknown URLs 200'd).
const knownRoutes = new Set();
for (const build of routes) {
  try {
    const raw = build();
    // Read and strip the explicit write-path marker (independent of canonical).
    const m = raw.match(/^<!--PP:([^>]*)-->/);
    const path = m ? m[1] : '/';
    const html = raw.replace(/^<!--PP:[^>]*-->/, '');
    write(path, html);
    knownRoutes.add(path.replace(/\/$/, '') || '/');
    count++;
  } catch (e) {
    console.error('prerender error:', e.message);
  }
}

console.log(`Prerendered ${count} pages (${posts.length} blog posts).`);

// Write the known-routes manifest the edge middleware imports for real 404s.
const routesModule =
  `// AUTO-GENERATED by scripts/prerender.mjs — every real page path. Do not edit.\n` +
  `export const KNOWN_ROUTES = new Set(${JSON.stringify([...knownRoutes].sort())});\n`;
mkdirSync(join(__dirname, '..', 'src', 'generated'), { recursive: true });
writeFileSync(join(__dirname, '..', 'src', 'generated', 'routes.js'), routesModule);
console.log(`Known routes manifest: ${knownRoutes.size} paths.`);

// ---- Sitemap: INDEXABLE pages only (city pages are noindex, so excluded) ----
// A dashboard SEO override can force a route out (robots: noindex) or reset its
// priority; both are honoured here.
// Real content-modification date per source file (git committer date, YYYY-MM-DD)
// — NOT the build time. Cached per file; null (omit lastmod) if git is unavailable.
const _lmodCache = new Map();
const gitLastMod = (file) => {
  if (_lmodCache.has(file)) return _lmodCache.get(file);
  let d = null;
  try {
    // execFileSync (no shell) — file names are constants, args passed directly.
    d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) d = null;
  } catch { d = null; }
  _lmodCache.set(file, d);
  return d;
};
// Content-group lastmods (the file that governs each page group).
const LMOD = {
  products: gitLastMod('backend/data/products.js'),
  categories: gitLastMod('src/data/categoryPages.js'),
  landing: gitLastMod('src/data/landingPages.js'),
  pages: gitLastMod('src/data/pages.js'),
  canopy: gitLastMod('src/data/canopy.js'),
  booth: gitLastMod('src/data/boothPackages.js'),
  city: gitLastMod('src/data/citySeo.js'),
  home: gitLastMod('scripts/prerender.mjs')
};
const smUrl = (loc, priority, changefreq, lastmod) => {
  const o = seoMap[loc];
  if (o?.robots && /noindex/i.test(o.robots)) return null; // dropped from sitemap
  const p = o?.sitemap_priority != null ? String(o.sitemap_priority) : priority;
  const lm = lastmod && /^\d{4}-\d{2}-\d{2}/.test(String(lastmod)) ? String(lastmod).slice(0, 10) : null;
  return `  <url><loc>${ORIGIN}${loc}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ''}${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}<priority>${p}</priority></url>`;
};
// Split sitemaps by type (products / categories / pages / blog / locations),
// tied together by a sitemap index at /sitemap.xml. Each publish/rebuild
// regenerates them, so new products, pages, blog posts and landing pages appear
// automatically. Redirected/noindex URLs are excluded (smUrl returns null).
const buildUrlset = (rows) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.filter(Boolean).join('\n')}\n</urlset>\n`;

const smPages = [
  smUrl('/', '1.0', 'weekly', LMOD.home),
  smUrl('/resources', '0.7', 'weekly', gitLastMod('src/data/resources.js')),
  smUrl('/quote', '0.4', undefined, LMOD.pages),
  smUrl('/contact', '0.4', undefined, LMOD.pages),
  ...SIZES.map((s) => smUrl(`/sizes/${s.slug}`, '0.7', undefined, LMOD.canopy)),
  ...SOLUTIONS.map((s) => smUrl(`/solutions/${s.slug}`, '0.6', undefined, LMOD.canopy)),
  // Indexable trust pages (stub policy pages are noindex and excluded).
  ...PAGES.filter((p) => !p.stub).map((p) => smUrl(`/${p.slug}`, '0.4', undefined, LMOD.pages))
];
const smCategories = [
  smUrl('/products', '0.9', 'weekly', LMOD.products),
  ...CATEGORY_PAGES.map((cp) => smUrl(`/${cp.slug}`, cp.hub ? '0.9' : '0.8', 'weekly', LMOD.categories)),
  smUrl('/trade-show-booth-packages', '0.8', 'weekly', LMOD.booth),
  ...LANDING_PAGES.map((lp) => smUrl(`/${lp.slug}`, '0.7', 'weekly', LMOD.landing))
];
const smProducts = productList.map((p) => smUrl(`/products/${p.slug}`, '0.8', undefined, LMOD.products));
// Exclude posts canonicalised to another article — a canonicalised-away URL
// should not appear in the sitemap. Blog lastmod uses each post's real
// updated/published date (per-post), the most accurate signal available.
const postLmod = (p) => (p.updatedAt || p.publishedAt || '').slice(0, 10) || null;
const newestPost = posts.map(postLmod).filter(Boolean).sort().pop() || null;
const smBlog = [
  smUrl('/blog', '0.6', 'weekly', newestPost),
  ...posts.filter((p) => !p.canonical).map((p) => smUrl(`/blog/${p.slug}`, '0.6', undefined, postLmod(p)))
];

// Locations. City pages that 301 to /trade-show-canopies/[city] must NOT appear
// (a sitemap URL must be 200, not a redirect).
const redirectedLoc = new Set(SEO_CITIES.filter((c) => c.stateSlug).map((c) => `/locations/${c.stateSlug}/${c.slug}`));
const smLocations = [
  smUrl('/locations', '0.6', 'monthly', LMOD.city),
  ...territories.filter((s) => INDEXED_STATES.has(s.slug)).map((s) => smUrl(`/locations/${s.slug}`, '0.5', undefined, LMOD.city))
];
territories.forEach((s) =>
  s.cities.forEach((c) => {
    const path = `/locations/${s.slug}/${slugify(c)}`;
    if (PRIORITY_CITIES.has(slugify(c)) && !redirectedLoc.has(path)) smLocations.push(smUrl(path, '0.4', undefined, LMOD.city));
  })
);
for (const lc of LOCAL_CATEGORIES) {
  for (const city of SEO_CITIES) {
    if (city.tier <= 2) smLocations.push(smUrl(`/${lc.slug}/${city.slug}`, city.tier === 1 ? '0.6' : '0.5', 'weekly', LMOD.city));
  }
}

const sitemapFiles = {
  'sitemap-pages.xml': smPages,
  'sitemap-categories.xml': smCategories,
  'sitemap-products.xml': smProducts,
  'sitemap-blog.xml': smBlog,
  'sitemap-locations.xml': smLocations
};
let smTotal = 0;
for (const [name, rows] of Object.entries(sitemapFiles)) {
  const clean = rows.filter(Boolean);
  smTotal += clean.length;
  writeFileSync(join(DIST, name), buildUrlset(clean));
}
// Sitemap index at /sitemap.xml (referenced by robots.txt).
const sitemapIndex =
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  Object.keys(sitemapFiles).map((n) => `  <sitemap><loc>${ORIGIN}/${n}</loc></sitemap>`).join('\n') +
  `\n</sitemapindex>\n`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemapIndex);
console.log(`Sitemap: ${smTotal} indexable URLs across ${Object.keys(sitemapFiles).length} sitemaps (index at /sitemap.xml).`);

// ---- Google Merchant Center product feed (/feed.xml) ----
// RSS 2.0 + g: namespace. Only ACTIVE, instant-priced products are listed —
// quote-only SKUs have no advertisable price and are excluded (GMC requires a
// price). Prices are the real "starting at" (lowest purchasable config) in USD,
// matching the landing page. No GTIN/MPN exists, so identifier_exists=no. Images
// are the same absolute rasters the pages/schema use. USD feed for the US target;
// a CAD feed can be added later (see docs/MERCHANT_CENTER_SETUP.md).
{
  const feedRasters = (p) => (Array.isArray(p.gallery) ? p.gallery : [])
    .map((g) => (typeof g === 'string' ? g : g && g.src)).filter(Boolean)
    .filter((s) => !/\.svg$/i.test(s)).map((s) => (/^https?:/.test(s) ? s : ORIGIN + s));
  const plain = (s) => esc(String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  const feedItems = [];
  let feedSkipped = 0;
  for (const p of productList) {
    const img = productPhoto(p);
    if (p.startingPrice == null || !img) { feedSkipped++; continue; } // quote-only or no image
    const rasters = feedRasters(p);
    const extra = rasters.filter((s) => s !== img).slice(0, 10);
    const desc = plain(p.seoDescription || p.description || p.tagline);
    const priceUsd = `${Number(p.startingPrice).toFixed(2)} USD`;
    feedItems.push(
      `  <item>\n` +
      `    <g:id>${esc(p.slug)}</g:id>\n` +
      `    <title>${plain(p.name)}</title>\n` +
      `    <description>${desc}</description>\n` +
      `    <link>${ORIGIN}/products/${esc(p.slug)}</link>\n` +
      `    <g:image_link>${esc(img)}</g:image_link>\n` +
      extra.map((s) => `    <g:additional_image_link>${esc(s)}</g:additional_image_link>\n`).join('') +
      `    <g:availability>in_stock</g:availability>\n` +
      `    <g:price>${priceUsd}</g:price>\n` +
      `    <g:condition>new</g:condition>\n` +
      `    <g:brand>${esc(BRAND)}</g:brand>\n` +
      `    <g:identifier_exists>no</g:identifier_exists>\n` +
      `    <g:google_product_category>Business &amp; Industrial &gt; Advertising &amp; Marketing &gt; Trade Show Displays</g:google_product_category>\n` +
      `    <g:product_type>${esc(p.category)}</g:product_type>\n` +
      `    <g:custom_label_0>${esc(p.category)}</g:custom_label_0>\n` +
      `    <g:custom_label_1>starting-price</g:custom_label_1>\n` +
      `  </item>`
    );
  }
  const feed =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n<channel>\n` +
    `  <title>${esc(BRAND)} — Product Feed</title>\n` +
    `  <link>${ORIGIN}/</link>\n` +
    `  <description>Custom trade show displays and event branding from ${esc(BRAND)}.</description>\n` +
    feedItems.join('\n') + `\n</channel>\n</rss>\n`;
  writeFileSync(join(DIST, 'feed.xml'), feed);
  console.log(`Merchant feed: ${feedItems.length} products in /feed.xml (${feedSkipped} quote-only/no-image excluded).`);
}

// ---- Redirects: bake into a module the edge middleware imports ----
const redirectsModule =
  `// AUTO-GENERATED by scripts/prerender.mjs from the redirects table. Do not edit.\n` +
  `export const redirects = ${JSON.stringify(redirectRules, null, 2)};\n`;
mkdirSync(join(__dirname, '..', 'src', 'generated'), { recursive: true });
writeFileSync(join(__dirname, '..', 'src', 'generated', 'redirects.js'), redirectsModule);
console.log(`Redirects: ${redirectRules.length} rule(s) baked into middleware.`);

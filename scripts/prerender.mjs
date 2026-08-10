// Post-build prerender: writes a static HTML file per public route so crawlers
// get real content (H1, description, price, internal links) + unique meta +
// JSON-LD in the initial HTML — without a full SSR framework. React still
// hydrates on top for the interactive app.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { listProducts, getProduct, startingPriceFor, priceDisplayFor } from '../backend/data/products.js';
import { getProductFaqs } from '../backend/data/faqs.js';
import { territories, slugify } from '../src/data/states.js';
import { brand } from '../src/config/brand.js';
// Size / use-case landing pages target the winnable long tail (size x use case
// x location) — head terms belong to 15-20 year old domains.
import { SIZES, SOLUTIONS } from '../src/data/canopy.js';
import { PAGES } from '../src/data/pages.js';
import { CATEGORY_PAGES, SUBCATEGORIES } from '../src/data/categoryPages.js';
import {
  PRIORITY_STATES, stateContent, ORDERING_STEPS,
  SIZE_COMPARISON, OUTDOOR_CONSIDERATIONS, ARTWORK_NOTES, STATE_FAQS
} from '../src/data/stateContent.js';
import { PRIORITY_CITIES, cityContent } from '../src/data/cityContent.js';
import { loadPublishedPosts, loadContentMap, loadSeoMap, loadRedirects, loadPricingOverrides } from './buildData.mjs';
import { resolveContent } from '../src/data/content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = brand.origin;
const BRAND = brand.name;

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Shared crawlable navigation, on every prerendered page.
const NAV = `<nav aria-label="Primary">
  <a href="/">Home</a>
  <a href="/products">All Products</a>
  <a href="/trade-show-displays">Trade Show Displays</a>
  <a href="/custom-canopies">Custom Canopies</a>
  <a href="/banner-stands">Banner Stands</a>
  <a href="/backdrops">Backdrops</a>
  <a href="/table-covers">Table Covers</a>
  <a href="/locations">Locations</a>
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

function render({ path, title, description, body, jsonLd, robots }) {
  // Per-route SEO overrides from the dashboard win over the page's own values.
  const o = seoMap[path];
  if (o) {
    if (o.title) title = o.title;
    if (o.description) description = o.description;
    if (o.robots) robots = o.robots;
    if (o.jsonld) jsonLd = o.jsonld;
  }
  const canonical = o?.canonical || ORIGIN + path;
  const url = ORIGIN + path;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${esc(description)}$2`);
  html = html.replace(/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${canonical}$2`);
  html = html.replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${esc(title)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[\s\S]*?(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${esc(description)}$2`);
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
// Canopy-focused pages (home, locations) list only the core retail products.
const coreProducts = productList.filter((p) => p.category === 'tents' || p.category === 'table-covers');
const displayProducts = productList.filter((p) => p.category === 'banner-stands' || p.category === 'backdrops');
let count = 0;
const routes = [];

// ---- Home ----
routes.push(() => {
  const body = `
    <h1>Complete Trade Show Displays &amp; Event Branding</h1>
    <p>${esc(BRAND)} is your one supplier for a professional trade show booth — custom canopy tents,
    retractable banner stands, step &amp; repeat backdrops, table covers and event branding
    accessories, all in your brand. Instant online pricing on canopies, a free artwork proof on every
    order. ${esc(brand.shippingBlurb)}.</p>
    <h2>Shop by category</h2>
    <ul>
      <li><a href="/products?category=tents">Custom Canopy Tents</a> — printed pop-up tents &amp; walls</li>
      <li><a href="/products?category=banner-stands">Banner Stands</a> — retractable &amp; X-stand banners</li>
      <li><a href="/products?category=backdrops">Backdrops</a> — step &amp; repeat media walls</li>
      <li><a href="/products?category=table-covers">Table Covers</a> — pleated &amp; stretch throws</li>
      <li><a href="/products">All products</a> — the complete range</li>
    </ul>
    <h2>Custom canopy tents</h2>
    <ul>${coreProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`).join('')}</ul>
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
    <li>We print and ship it.</li></ol>`;
  return render({
    path: '/',
    title: `Trade Show Displays, Canopies, Banners & Backdrops | ${BRAND}`,
    description: brand.description,
    body
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
    <ul>${coreProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`).join('')}</ul>
    <p>Not sure which size? Read the <a href="/sizes/10x10">10x10</a>, <a href="/sizes/10x15">10x15</a>
    and <a href="/sizes/10x20">10x20</a> size guides.</p>
    ${displayProducts.length ? `<h2>Banner stands &amp; backdrops</h2>
    <ul>${displayProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`).join('')}</ul>` : ''}`;
  return render({
    path: '/products',
    title: `Shop All Products | ${BRAND}`,
    description: 'Browse all Apex trade show display and event-branding products — custom canopy tents, banner stands, step & repeat backdrops and table covers. Free artwork proof, US & Canada.',
    body
  });
});

// ---- Category / collection landing pages (indexable) ----
for (const cp of CATEGORY_PAGES) {
  routes.push(() => {
    const catProducts = cp.category ? productList.filter((p) => p.category === cp.category) : productList;
    const subTiles = cp.hub
      ? `<h2>Shop by category</h2><ul>${SUBCATEGORIES.map((sc) => `<li><a href="/${sc.slug}">${esc(sc.h1)}</a></li>`).join('')}</ul>`
      : '';
    const guides = cp.guideLinks
      ? `<h2>Canopy size guides</h2><ul>${cp.guideLinks.map((g) => `<li><a href="${g.to}">${esc(g.label)}</a></li>`).join('')}</ul>`
      : '';
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>${esc(cp.nav)}</span></nav>
      <h1>${esc(cp.h1)}</h1>
      <p>${esc(cp.intro)}</p>
      <h2>What's included</h2><ul>${cp.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
      ${subTiles}
      <h2>${cp.hub ? 'Featured products' : cp.h1}</h2>
      <ul>${catProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}. ${esc(p.tagline)}</li>`).join('')}</ul>
      ${guides}`;
    return render({
      path: `/${cp.slug}`,
      title: `${cp.title} | ${BRAND}`,
      description: cp.description,
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
          : [])
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
      <h2>Order your ${esc(sol.title.toLowerCase().replace(/ tents$/, ' tent'))}</h2>
      <p>Pick a size and configure walls, print and delivery for an instant price:</p>
      <ul>${coreProducts.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${priceFrom(p)}</li>`).join('')}</ul>
      <h2>Other uses</h2>
      <ul>${others.map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/solutions/${sol.slug}`,
      title: `${sol.title} — Custom Printed | ${BRAND}`,
      description: g.metaDescription,
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
        `Custom printed ${size} canopy tent with your logo — full-colour dye sublimation, full or half walls, from $${price}. Free artwork proof, ships across the US & Canada.`
    };
  }
  return {
    title: `${product.name} | Instant Pricing`,
    h1: `${product.name} — Custom Printing & Instant Pricing`,
    description: (price, prod) => `${prod.tagline} Order online with instant pricing from $${price}. ${prod.turnaround}.`
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
        specs.push(['Fabric', '600D polyester, dye-sublimated full-colour print']);
        specs.push(['Frame', 'Heavy-duty aluminium hex, telescopic legs']);
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
    if (sizeM) {
      productImages = [1, 2, 3].map((n) => `${ORIGIN}/images/tents/${sizeM[1]}-${n}wall.webp`);
    } else if (product.category === 'table-covers') {
      const k = product.slug.includes('stretch') ? 'stretch' : 'pleated';
      productImages = [`${ORIGIN}/images/table-covers/${k}.webp`];
    } else if (product.slug.startsWith('standard-') || product.slug.startsWith('deluxe-') || product.slug === 'x-stand-banner' || product.slug === 'step-and-repeat-backdrop' || product.slug === 'table-top-banner-stand') {
      productImages = [`${ORIGIN}/images/displays/${product.slug}.webp`];
    }
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/products">Products</a> / <span>${esc(product.name)}</span></nav>
      <h1>${esc(seoTitle.h1)}</h1>
      <p>${esc(product.description)}</p>
      <p>${startingPrice != null
        ? `<strong>Starting at $${startingPrice}${priceDisp.startingNote ? ` — ${esc(priceDisp.startingNote.toLowerCase())}` : ''}.</strong>${priceDisp.full ? ` ${esc(priceDisp.full.label)}: $${priceDisp.full.price}.` : ''}`
        : `<strong>Request a quote for pricing.</strong>`} ${esc(product.turnaround)}.</p>
      <h2>Features</h2><ul>${product.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${Array.isArray(product.applications) && product.applications.length ? `<h2>Applications</h2><ul>${product.applications.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
      <h2>Specifications</h2>
      ${specs.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join('')}
      <p><a href="/products/${product.slug}">${startingPrice != null ? `Configure your ${esc(product.name)} and get an instant price →` : `Configure your ${esc(product.name)} and request a quote →`}</a></p>
      <h2>Frequently asked questions</h2>
      ${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
      <h2>Related products</h2>
      <ul>${related.map((r) => `<li><a href="/products/${r.slug}">${esc(r.name)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/products/${product.slug}`,
      title: `${seoTitle.title} | ${BRAND}`,
      description: seoTitle.description(startingPrice, product),
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          ...(productImages.length ? { image: productImages } : {}),
          sku: product.slug,
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
                      availability: 'https://schema.org/InStock',
                      itemCondition: 'https://schema.org/NewCondition',
                      url: `${ORIGIN}/products/${product.slug}`
                    }
                  : {
                      '@type': 'Offer',
                      priceCurrency: 'USD',
                      price: String(startingPrice),
                      availability: 'https://schema.org/InStock',
                      itemCondition: 'https://schema.org/NewCondition',
                      url: `${ORIGIN}/products/${product.slug}`
                    }
              }
            : {})
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Products', item: `${ORIGIN}/products` },
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
    <h2>United States</h2>
    <ul>${us.map((s) => `<li><a href="/locations/${s.slug}">Canopy tents in ${esc(s.name)}</a></li>`).join('')}</ul>
    <h2>Canada</h2>
    <ul>${ca.map((s) => `<li><a href="/locations/${s.slug}">Canopy tents in ${esc(s.name)}</a></li>`).join('')}</ul>`;
  return render({
    path: '/locations',
    title: `Custom Canopy Tents Across the US & Canada | ${BRAND}`,
    description: 'Custom printed canopy tents shipped to every US state and Canadian province, with instant online pricing in USD or CAD.',
    body
  });
});

// ---- Each state/province + city ----
for (const s of territories) {
  const areaWord = s.country === 'CA' ? 'province-wide' : 'statewide';
  const isPriority = PRIORITY_STATES.has(s.slug);
  const content = stateContent[s.slug];
  routes.push(() => {
    const cityLinks = s.cities
      .map((c) => `<li><a href="/locations/${s.slug}/${slugify(c)}">Canopy tents in ${esc(c)}, ${s.abbr}</a></li>`)
      .join('');
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
      <h2>Cities we serve in ${esc(s.name)}</h2><ul>${cityLinks}</ul>`;
    return render({
      path: `/locations/${s.slug}`,
      title: `Custom Canopy Tents in ${s.name} | ${BRAND}`,
      description: `Custom printed canopy tents in ${s.name}. Instant online pricing and shipping to ${s.cities.slice(0, 3).join(', ')} and ${areaWord}.`,
      // Long-tail state/province pages are templated — noindex until they earn
      // unique content, so they don't dilute the priority markets.
      robots: isPriority ? undefined : 'noindex, follow',
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Locations', item: `${ORIGIN}/locations` },
          { '@type': 'ListItem', position: 3, name: s.name, item: `${ORIGIN}/locations/${s.slug}` }
        ]
      }
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
    description: `Request a bulk or custom trade show display quote from ${BRAND} — canopy tents, banner stands, backdrops and table covers. Tell us your size, quantity and artwork.`,
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
  { path: '/order', title: 'Place Your Order', h1: 'Place your order' }
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
const posts = await loadPublishedPosts();
seoMap = await loadSeoMap();
contentMap = await loadContentMap();
const redirectRules = await loadRedirects();

// Reflect pricing overrides in the prerendered "from $X" listing badges.
const pricingOverrides = await loadPricingOverrides();
for (const p of productList) {
  if (pricingOverrides[p.slug]) p.startingPrice = startingPriceFor(pricingOverrides[p.slug]);
}

// Blog index
routes.push(() => {
  const items = posts
    .map(
      (p) =>
        `<li><a href="/blog/${p.slug}">${esc(p.title)}</a>${p.excerpt ? ` — ${esc(p.excerpt)}` : ''}</li>`
    )
    .join('');
  return render({
    path: '/blog',
    title: `Blog — Canopy Guides & Ideas | ${BRAND}`,
    description: 'Guides, tips and ideas for custom printed canopy tents — sizing, print coverage, event setup and more.',
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Blog</span></nav>
      <h1>Canopy guides &amp; ideas</h1>
      <ul>${items || '<li>Posts coming soon.</li>'}</ul>`
  });
});

// Each published post — full rendered HTML + BlogPosting JSON-LD.
for (const p of posts) {
  routes.push(() =>
    render({
      path: `/blog/${p.slug}`,
      title: `${p.seo?.title || p.title} | ${BRAND}`,
      description: p.seo?.description || p.excerpt,
      body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a> / <span>${esc(p.title)}</span></nav>
        <article><h1>${esc(p.title)}</h1>${p.html}</article>`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.seo?.description || p.excerpt,
        image: p.coverUrl || undefined,
        datePublished: p.publishedAt || undefined,
        dateModified: p.updatedAt || undefined,
        author: { '@type': 'Organization', name: BRAND },
        publisher: { '@type': 'Organization', name: BRAND },
        mainEntityOfPage: `${ORIGIN}/blog/${p.slug}`
      }
    })
  );
}

for (const build of routes) {
  try {
    const raw = build();
    // Read and strip the explicit write-path marker (independent of canonical).
    const m = raw.match(/^<!--PP:([^>]*)-->/);
    const path = m ? m[1] : '/';
    const html = raw.replace(/^<!--PP:[^>]*-->/, '');
    write(path, html);
    count++;
  } catch (e) {
    console.error('prerender error:', e.message);
  }
}

console.log(`Prerendered ${count} pages (${posts.length} blog posts).`);

// ---- Sitemap: INDEXABLE pages only (city pages are noindex, so excluded) ----
// A dashboard SEO override can force a route out (robots: noindex) or reset its
// priority; both are honoured here.
const smUrl = (loc, priority, changefreq) => {
  const o = seoMap[loc];
  if (o?.robots && /noindex/i.test(o.robots)) return null; // dropped from sitemap
  const p = o?.sitemap_priority != null ? String(o.sitemap_priority) : priority;
  return `  <url><loc>${ORIGIN}${loc}</loc>${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}<priority>${p}</priority></url>`;
};
const sm = [];
sm.push(smUrl('/', '1.0', 'weekly'));
sm.push(smUrl('/products', '0.9', 'weekly'));
// Indexable category / collection pages.
CATEGORY_PAGES.forEach((cp) => sm.push(smUrl(`/${cp.slug}`, cp.hub ? '0.9' : '0.8', 'weekly')));
productList.forEach((p) => sm.push(smUrl(`/products/${p.slug}`, '0.8')));
SIZES.forEach((s) => sm.push(smUrl(`/sizes/${s.slug}`, '0.7')));
SOLUTIONS.forEach((s) => sm.push(smUrl(`/solutions/${s.slug}`, '0.6')));
sm.push(smUrl('/locations', '0.6', 'monthly'));
// Only priority state pages are indexable; the templated long tail is noindex.
territories.filter((s) => PRIORITY_STATES.has(s.slug)).forEach((s) => sm.push(smUrl(`/locations/${s.slug}`, '0.5')));
// Priority cities (with unique content) are indexable too.
territories.forEach((s) =>
  s.cities.forEach((c) => {
    if (PRIORITY_CITIES.has(slugify(c))) sm.push(smUrl(`/locations/${s.slug}/${slugify(c)}`, '0.4'));
  })
);
sm.push(smUrl('/blog', '0.6', 'weekly'));
posts.forEach((p) => sm.push(smUrl(`/blog/${p.slug}`, '0.6')));
sm.push(smUrl('/quote', '0.4'));
sm.push(smUrl('/contact', '0.4'));
// Indexable trust pages (stub policy pages are noindex and excluded).
PAGES.filter((p) => !p.stub).forEach((p) => sm.push(smUrl(`/${p.slug}`, '0.4')));
const smRows = sm.filter(Boolean); // drop routes forced to noindex via overrides
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${smRows.join('\n')}\n</urlset>\n`
);
console.log(`Sitemap: ${smRows.length} indexable URLs (city pages excluded).`);

// ---- Redirects: bake into a module the edge middleware imports ----
const redirectsModule =
  `// AUTO-GENERATED by scripts/prerender.mjs from the redirects table. Do not edit.\n` +
  `export const redirects = ${JSON.stringify(redirectRules, null, 2)};\n`;
mkdirSync(join(__dirname, '..', 'src', 'generated'), { recursive: true });
writeFileSync(join(__dirname, '..', 'src', 'generated', 'redirects.js'), redirectsModule);
console.log(`Redirects: ${redirectRules.length} rule(s) baked into middleware.`);

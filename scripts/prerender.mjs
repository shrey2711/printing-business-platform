// Post-build prerender: writes a static HTML file per public route so crawlers
// get real content (H1, description, price, internal links) + unique meta +
// JSON-LD in the initial HTML — without a full SSR framework. React still
// hydrates on top for the interactive app.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { listProducts, getProduct } from '../backend/data/products.js';
import { getProductFaqs } from '../backend/data/faqs.js';
import { states, slugify } from '../src/data/states.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://printing-business-platform-frontend.vercel.app';

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Shared crawlable navigation, on every prerendered page.
const NAV = `<nav aria-label="Primary">
  <a href="/">Home</a>
  <a href="/products">All Products</a>
  <a href="/products/vinyl-banners">Vinyl Banners</a>
  <a href="/products/mesh-banners">Mesh Banners</a>
  <a href="/products/yard-signs">Yard Signs</a>
  <a href="/products/rigid-signs">Rigid Signs</a>
  <a href="/products/feather-flags">Feather Flags</a>
  <a href="/products/retractable-banner-stands">Banner Stands</a>
  <a href="/products/table-covers">Table Covers</a>
  <a href="/products/canopy-tents">Canopy Tents</a>
  <a href="/design">Design Studio</a>
  <a href="/locations">Locations</a>
  <a href="/quote">Get a Quote</a>
  <a href="/contact">Contact</a>
</nav>`;

function render({ path, title, description, body, jsonLd }) {
  const url = ORIGIN + path;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[\s\S]*?(")/, `$1${esc(description)}$2`);
  html = html.replace(/(<link rel="canonical" href=")[\s\S]*?(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:title" content=")[\s\S]*?(")/, `$1${esc(title)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[\s\S]*?(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:description" content=")[\s\S]*?(")/, `$1${esc(description)}$2`);
  if (jsonLd) {
    const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace('</head>', `${script}\n</head>`);
  }
  // Prerendered content lives inside #root; React replaces it on hydration.
  html = html.replace('<div id="root"></div>', `<div id="root"><div id="seo-prerender">${body}${NAV}</div></div>`);
  return html;
}

function write(path, html) {
  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const productList = listProducts();
let count = 0;
const routes = [];

// ---- Home ----
routes.push(() => {
  const body = `
    <h1>Wholesale Custom Banners, Signs &amp; Displays with Instant Pricing</h1>
    <p>PrintUSA is an online wholesale print shop for vinyl banners, yard signs, feather flags,
    retractable banner stands, table covers, canopy tents and more — with instant online pricing,
    fast production and shipping to all 50 US states.</p>
    <h2>Shop products</h2>
    <ul>${productList.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}. ${esc(p.tagline)}</li>`).join('')}</ul>
    <h2>Order in three steps</h2>
    <ol><li>Configure your product and see the price instantly.</li>
    <li>Upload artwork or design it in our Design Studio.</li>
    <li>We print and ship it fast, nationwide.</li></ol>`;
  return render({
    path: '/',
    title: 'Wholesale Banners, Signs & Displays | PrintUSA',
    description:
      'Get instant pricing on wholesale banners, custom signs, feather flags and trade-show displays. Choose your size, quantity and finishing online, with fast nationwide shipping.',
    body
  });
});

// ---- Products listing ----
routes.push(() => {
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Products</span></nav>
    <h1>Shop All Products &amp; Get Instant Pricing</h1>
    <p>Browse banners, signs, flags, displays and decals. Configure size and quantity for live wholesale pricing.</p>
    <ul>${productList.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}. ${esc(p.tagline)}</li>`).join('')}</ul>`;
  return render({
    path: '/products',
    title: 'Shop All Products & Instant Pricing | PrintUSA',
    description: 'Browse wholesale banners, signs, flags, displays and decals. Configure size and quantity for instant online pricing.',
    body
  });
});

// ---- Each product ----
for (const summary of productList) {
  const product = getProduct(summary.slug);
  const startingPrice = summary.startingPrice;
  routes.push(() => {
    const p = product.pricing;
    let materials = '';
    let sizes = '';
    if (p.model === 'area') {
      materials = (p.materials || []).map((m) => m.name).join(', ');
      sizes = `Custom sizes from ${p.minWidthIn}"×${p.minHeightIn}" up to ${p.maxWidthIn}"×${p.maxHeightIn}".`;
    } else {
      sizes = (p.variants || []).map((v) => v.name).join(', ');
      materials = (p.materials || []).map((m) => m.name).join(', ');
    }
    const finishing = (p.finishing || []).map((f) => f.name).join(', ');
    const related = productList.filter((x) => x.slug !== product.slug).slice(0, 5);
    const faqs = getProductFaqs(product);
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/products">Products</a> / <span>${esc(product.name)}</span></nav>
      <h1>${esc(product.name)} — Custom Printing &amp; Instant Pricing</h1>
      <p>${esc(product.description)}</p>
      <p><strong>Starting at $${startingPrice}.</strong> ${esc(product.turnaround)}.</p>
      <h2>Features</h2><ul>${product.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <h2>Materials &amp; options</h2>
      <p>Materials: ${esc(materials)}.</p>
      <p>Sizes: ${esc(sizes)}</p>
      ${finishing ? `<p>Finishing: ${esc(finishing)}.</p>` : ''}
      <p><a href="/products/${product.slug}">Configure your ${esc(product.name)} and get an instant price →</a></p>
      <h2>Frequently asked questions</h2>
      ${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
      <h2>More products</h2>
      <ul>${related.map((r) => `<li><a href="/products/${r.slug}">${esc(r.name)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/products/${product.slug}`,
      title: `${product.name} | Wholesale Pricing | PrintUSA`,
      description: `${product.tagline} Order ${product.name.toLowerCase()} online with instant pricing from $${startingPrice}. ${product.turnaround}.`,
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          brand: { '@type': 'Brand', name: 'PrintUSA' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: String(startingPrice),
            availability: 'https://schema.org/InStock',
            url: `${ORIGIN}/products/${product.slug}`
          }
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
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        }
      ]
    });
  });
}

// ---- Locations hub ----
routes.push(() => {
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Locations</span></nav>
    <h1>Custom Printing Across the USA — All 50 States</h1>
    <p>PrintUSA ships custom banners, signs, flags and displays to every US state.</p>
    <ul>${states.map((s) => `<li><a href="/locations/${s.slug}">Custom printing in ${esc(s.name)}</a></li>`).join('')}</ul>`;
  return render({
    path: '/locations',
    title: 'Custom Printing Across the USA — All 50 States | PrintUSA',
    description: 'PrintUSA ships custom banners, signs, flags and displays to all 50 states with instant online pricing and fast delivery.',
    body
  });
});

// ---- Each state + city ----
for (const s of states) {
  routes.push(() => {
    const cityLinks = s.cities
      .map((c) => `<li><a href="/locations/${s.slug}/${slugify(c)}">Printing in ${esc(c)}, ${s.abbr}</a></li>`)
      .join('');
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/locations">Locations</a> / <span>${esc(s.name)}</span></nav>
      <h1>Custom Banners, Signs &amp; Displays in ${esc(s.name)}</h1>
      <p>Order custom vinyl banners, yard signs, feather flags and displays in ${esc(s.name)} with instant pricing and fast shipping to ${esc(s.cities.join(', '))} and statewide.</p>
      <h2>Popular products</h2>
      <ul>${productList.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}</li>`).join('')}</ul>
      <h2>Cities we serve in ${esc(s.name)}</h2><ul>${cityLinks}</ul>`;
    return render({
      path: `/locations/${s.slug}`,
      title: `Custom Banners & Signs in ${s.name} | PrintUSA`,
      description: `Custom banners, signs, flags and displays in ${s.name}. Instant online pricing and fast shipping to ${s.cities.slice(0, 3).join(', ')} and statewide.`,
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
    routes.push(() => {
      const body = `
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/locations">Locations</a> / <a href="/locations/${s.slug}">${esc(s.name)}</a> / <span>${esc(c)}</span></nav>
        <h1>Custom Banners &amp; Signs in ${esc(c)}, ${esc(s.name)}</h1>
        <p>PrintUSA delivers vinyl banners, yard signs, feather flags and displays to ${esc(c)}, ${esc(s.name)} with instant online pricing and fast shipping.</p>
        <h2>Popular products in ${esc(c)}</h2>
        <ul>${productList.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}</li>`).join('')}</ul>`;
      return render({
        path: `/locations/${s.slug}/${citySlug}`,
        title: `Custom Banners & Signs in ${c}, ${s.abbr} | PrintUSA`,
        description: `Order custom banners, signs, flags and displays in ${c}, ${s.name} with instant online pricing and fast local shipping.`,
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
    title: 'Contact Us | PrintUSA',
    description: 'Contact PrintUSA — online wholesale printing with nationwide shipping. Email, phone and business hours.',
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Contact</span></nav>
      <h1>Contact PrintUSA</h1>
      <p>We support businesses across the United States with fast quotes, blind shipping and dependable delivery. Email sales@printusa.com or call 1 (800) 555-0148, Mon–Fri 8am–6pm ET.</p>`
  })
);
routes.push(() =>
  render({
    path: '/quote',
    title: 'Request a Quote | PrintUSA',
    description: 'Request a custom or bulk print quote from PrintUSA. Tell us your product, size and quantity and upload artwork.',
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Quote</span></nav>
      <h1>Request a Custom Quote</h1>
      <p>Tell us about your print job — product, size, quantity and finishing — and upload your artwork. We'll send a proof and final pricing.</p>`
  })
);

for (const build of routes) {
  try {
    const html = build();
    // Recover path from the rendered canonical for writing.
    const m = html.match(/<link rel="canonical" href="([^"]+)"/);
    const path = m ? m[1].replace(ORIGIN, '') || '/' : '/';
    write(path, html);
    count++;
  } catch (e) {
    console.error('prerender error:', e.message);
  }
}

console.log(`Prerendered ${count} pages.`);

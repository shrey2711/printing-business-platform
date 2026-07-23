// Post-build prerender: writes a static HTML file per public route so crawlers
// get real content (H1, description, price, internal links) + unique meta +
// JSON-LD in the initial HTML — without a full SSR framework. React still
// hydrates on top for the interactive app.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { listProducts, getProduct, startingPriceFor } from '../backend/data/products.js';
import { getProductFaqs } from '../backend/data/faqs.js';
import { territories, slugify } from '../src/data/states.js';
import { brand } from '../src/config/brand.js';
// Size / use-case landing pages target the winnable long tail (size x use case
// x location) — head terms belong to 15-20 year old domains.
import { SIZES, SOLUTIONS } from '../src/data/canopy.js';
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
  <a href="/products/canopy-tents">Custom Canopy Tents</a>
  <a href="/products/canopy-packages">Canopy Packages</a>
  <a href="/products/canopy-sidewalls">Sidewalls</a>
  <a href="/products/canopy-replacement-tops">Replacement Tops</a>
  <a href="/products/canopy-accessories">Accessories</a>
  ${SIZES.map((s) => `<a href="/sizes/${s.slug}">${s.slug} canopy tent</a>`).join('\n  ')}
  <a href="/design">Design Studio</a>
  <a href="/locations">Locations</a>
  <a href="/quote">Get a Quote</a>
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
  html = html.replace('<div id="root"></div>', `<div id="root"><div id="seo-prerender">${body}${NAV}</div></div>`);
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
let count = 0;
const routes = [];

// ---- Home ----
routes.push(() => {
  const body = `
    <h1>Custom Printed Canopy Tents with Instant Pricing</h1>
    <p>${esc(BRAND)} prints custom pop-up canopy tents in ${SIZES.map((s) => s.slug).join(', ')}.
    Choose your frame grade, print coverage, walls and accessories and see the price update live —
    no quote form. Every order includes a free artwork proof, and nothing goes to production until
    you approve it. ${esc(brand.shippingBlurb)}.</p>
    <h2>Shop canopy tents</h2>
    <ul>${productList.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}. ${esc(p.tagline)}</li>`).join('')}</ul>
    <h2>Canopy tent sizes</h2>
    <ul>${SIZES.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.label)} canopy tent</a> — ${esc(s.blurb)}</li>`).join('')}</ul>
    <h2>What people use them for</h2>
    <ul>${SOLUTIONS.map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a> — ${esc(s.blurb)}</li>`).join('')}</ul>
    <h2>Order in four steps</h2>
    <ol><li>Configure size, frame, print coverage and walls — the price updates as you go.</li>
    <li>Upload artwork or design it in our Design Studio.</li>
    <li>Approve the artwork proof we send you.</li>
    <li>We print and ship it.</li></ol>`;
  return render({
    path: '/',
    title: `Custom Printed Canopy Tents — Instant Pricing | ${BRAND}`,
    description: brand.description,
    body
  });
});

// ---- Products listing ----
routes.push(() => {
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Products</span></nav>
    <h1>Shop Canopy Tents, Walls &amp; Accessories</h1>
    <p>Custom printed canopy tents, complete booth packages, sidewalls, replacement tops and the
    hardware that goes with them. Configure any product for live pricing.</p>
    <ul>${productList.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}. ${esc(p.tagline)}</li>`).join('')}</ul>`;
  return render({
    path: '/products',
    title: `Shop Canopy Tents & Accessories | ${BRAND}`,
    description: 'Browse custom printed canopy tents, booth packages, sidewalls, replacement tops and accessories with instant online pricing.',
    body
  });
});

// ---- Size landing pages ----
for (const size of SIZES) {
  routes.push(() => {
    const others = SIZES.filter((s) => s.slug !== size.slug);
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/products">Products</a> / <span>${esc(size.slug)}</span></nav>
      <h1>${esc(size.label)} Custom Printed Canopy Tent</h1>
      <p>${esc(size.blurb)} Printed to order in full colour with your choice of frame grade and print
      coverage, and priced instantly — pick your options and the total updates as you go.</p>
      <h2>What you can configure</h2>
      <ul>
        <li>Frame grade — steel economy, commercial aluminium or heavy-duty hex</li>
        <li>Print coverage — canopy top, top plus valance, or top, valance and inside</li>
        <li>Walls — full, half, mesh, zippered door and rail skirts, up to four per tent</li>
        <li>Accessories — weight bags, stake kits, wheeled carry bags and LED lighting</li>
      </ul>
      <p><a href="/products/canopy-tents">Configure a ${esc(size.label)} canopy tent</a> or
      <a href="/products/canopy-packages">see complete packages</a>.</p>
      <h2>Other sizes</h2>
      <ul>${others.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.label)} canopy tent</a></li>`).join('')}</ul>
      <h2>Common uses</h2>
      <ul>${SOLUTIONS.slice(0, 4).map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/sizes/${size.slug}`,
      title: `${size.slug} Custom Canopy Tent — Instant Pricing | ${BRAND}`,
      description: `Custom printed ${size.label} pop-up canopy tent. Choose frame grade, print coverage, walls and accessories with instant online pricing.`,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Sizes', item: `${ORIGIN}/products` },
          { '@type': 'ListItem', position: 3, name: `${size.slug} canopy tent`, item: `${ORIGIN}/sizes/${size.slug}` }
        ]
      }
    });
  });
}

// ---- Use-case (solution) landing pages ----
for (const sol of SOLUTIONS) {
  routes.push(() => {
    const others = SOLUTIONS.filter((s) => s.slug !== sol.slug);
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/products">Products</a> / <span>${esc(sol.title)}</span></nav>
      <h1>${esc(sol.title)}</h1>
      <p>${esc(sol.blurb)} Every tent is printed to order, so the size, frame and print coverage are
      chosen to match how often it goes up and how much branding you need.</p>
      <h2>Choose a size</h2>
      <ul>${SIZES.map((s) => `<li><a href="/sizes/${s.slug}">${esc(s.label)} canopy tent</a> — ${esc(s.blurb)}</li>`).join('')}</ul>
      <h2>What to order</h2>
      <ul>
        <li><a href="/products/canopy-tents">Custom printed canopy tent</a> — configure from scratch</li>
        <li><a href="/products/canopy-packages">Canopy packages</a> — tent, walls and weights bundled</li>
        <li><a href="/products/canopy-sidewalls">Sidewalls</a> — add weather protection and branding</li>
        <li><a href="/products/canopy-accessories">Accessories</a> — weights, stakes, bags and lighting</li>
      </ul>
      <h2>Other uses</h2>
      <ul>${others.map((s) => `<li><a href="/solutions/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul>`;
    return render({
      path: `/solutions/${sol.slug}`,
      title: `${sol.title} — Custom Printed | ${BRAND}`,
      description: `${sol.blurb} Custom printed canopy tents with instant online pricing and a free artwork proof.`,
      body,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Solutions', item: `${ORIGIN}/products` },
          { '@type': 'ListItem', position: 3, name: sol.title, item: `${ORIGIN}/solutions/${sol.slug}` }
        ]
      }
    });
  });
}

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
      title: `${product.name} | Instant Pricing | ${BRAND}`,
      description: `${product.tagline} Order ${product.name.toLowerCase()} online with instant pricing from $${startingPrice}. ${product.turnaround}.`,
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          brand: { '@type': 'Brand', name: BRAND },
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
  const us = territories.filter((t) => t.country === 'US');
  const ca = territories.filter((t) => t.country === 'CA');
  const body = `
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Locations</span></nav>
    <h1>Custom Canopy Tents Across the US and Canada</h1>
    <p>${esc(BRAND)} ships custom printed canopy tents, walls and accessories to every US state and
    Canadian province, priced in USD or CAD.</p>
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
  routes.push(() => {
    const cityLinks = s.cities
      .map((c) => `<li><a href="/locations/${s.slug}/${slugify(c)}">Canopy tents in ${esc(c)}, ${s.abbr}</a></li>`)
      .join('');
    const body = `
      <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/locations">Locations</a> / <span>${esc(s.name)}</span></nav>
      <h1>Custom Printed Canopy Tents in ${esc(s.name)}</h1>
      <p>Order custom printed pop-up canopy tents, sidewalls and accessories in ${esc(s.name)} with
      instant online pricing and shipping to ${esc(s.cities.join(', '))} and ${areaWord}.</p>
      <h2>Popular products</h2>
      <ul>${productList.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}</li>`).join('')}</ul>
      <h2>Canopy sizes</h2>
      <ul>${SIZES.map((z) => `<li><a href="/sizes/${z.slug}">${esc(z.label)} canopy tent</a></li>`).join('')}</ul>
      <h2>Cities we serve in ${esc(s.name)}</h2><ul>${cityLinks}</ul>`;
    return render({
      path: `/locations/${s.slug}`,
      title: `Custom Canopy Tents in ${s.name} | ${BRAND}`,
      description: `Custom printed canopy tents in ${s.name}. Instant online pricing and shipping to ${s.cities.slice(0, 3).join(', ')} and ${areaWord}.`,
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
        <h1>Custom Printed Canopy Tents in ${esc(c)}, ${esc(s.name)}</h1>
        <p>${esc(BRAND)} ships custom printed canopy tents, sidewalls and accessories to ${esc(c)},
        ${esc(s.name)} with instant online pricing and a free artwork proof on every order.</p>
        <h2>Popular products in ${esc(c)}</h2>
        <ul>${productList.slice(0, 6).map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — from $${p.startingPrice}</li>`).join('')}</ul>`;
      return render({
        path: `/locations/${s.slug}/${citySlug}`,
        title: `Custom Canopy Tents in ${c}, ${s.abbr} | ${BRAND}`,
        description: `Order custom printed canopy tents in ${c}, ${s.name} with instant online pricing and fast shipping.`,
        // City pages are templated — keep them accessible but noindex until each
        // has genuinely unique content (avoids doorway-page risk).
        robots: 'noindex, follow',
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
    description: `Contact ${BRAND} — custom printed canopy tents shipped across the US and Canada. Email, phone and business hours.`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Contact</span></nav>
      <h1>Contact ${esc(BRAND)}</h1>
      <p>We help businesses, teams and event vendors across the US and Canada get branded canopy
      tents produced and delivered. Email ${esc(brand.email)} or call ${esc(brand.phone)},
      ${esc(brand.hours)}.</p>`
  })
);
routes.push(() =>
  render({
    path: '/quote',
    title: `Request a Quote | ${BRAND}`,
    description: `Request a bulk or custom canopy tent quote from ${BRAND}. Tell us your size, quantity and print coverage and upload artwork.`,
    body: `<nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Quote</span></nav>
      <h1>Request a Custom Quote</h1>
      <p>Most canopy configurations are priced instantly on the product pages. For large fleet
      orders, non-standard sizes or anything unusual, tell us the size, quantity and print coverage
      and upload your artwork — we'll come back with pricing and a proof.</p>`
  })
);

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
productList.forEach((p) => sm.push(smUrl(`/products/${p.slug}`, '0.8')));
SIZES.forEach((s) => sm.push(smUrl(`/sizes/${s.slug}`, '0.7')));
SOLUTIONS.forEach((s) => sm.push(smUrl(`/solutions/${s.slug}`, '0.6')));
sm.push(smUrl('/locations', '0.6', 'monthly'));
territories.forEach((s) => sm.push(smUrl(`/locations/${s.slug}`, '0.5')));
sm.push(smUrl('/blog', '0.6', 'weekly'));
posts.forEach((p) => sm.push(smUrl(`/blog/${p.slug}`, '0.6')));
sm.push(smUrl('/quote', '0.4'));
sm.push(smUrl('/contact', '0.4'));
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

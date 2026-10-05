// Fails the build when a live page is missing from the sitemaps or the header:
// every active product must be in sitemap-products.xml and in the Shop menu
// (src/App.jsx `shopMenu`, which the mobile menu reuses), and every category
// landing page in sitemap-categories.xml. A product added to the catalog but absent from the
// sitemap is invisible to crawlers until someone notices. Runs after the build
// (needs dist/). Pages a CMS override marks noindex are dropped on purpose, so
// none are expected here.
import { readFileSync, existsSync } from 'node:fs';
import { listProducts } from '../backend/data/products.js';
import { CATEGORY_PAGES } from '../src/data/categoryPages.js';

const locs = (file) => {
  if (!existsSync(`dist/${file}`)) {
    console.error(`✗ SITEMAP COVERAGE FAILED — dist/${file} not found. Run the build first.`);
    process.exit(1);
  }
  return new Set([...readFileSync(`dist/${file}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
};

const products = locs('sitemap-products.xml');
const categories = locs('sitemap-categories.xml');
const fails = [];

for (const p of listProducts()) {
  if (!products.has(`/products/${p.slug}`)) fails.push(`product /products/${p.slug} is not in sitemap-products.xml`);
}
const app = readFileSync('src/App.jsx', 'utf8');
const menu = app.slice(app.indexOf('const shopMenu = ['), app.indexOf('function CurrencySwitch'));
for (const p of listProducts()) {
  if (!menu.includes(`'/products/${p.slug}'`)) fails.push(`product /products/${p.slug} is not in the header Shop menu (shopMenu in src/App.jsx)`);
}
for (const c of CATEGORY_PAGES) {
  if (!categories.has(`/${c.slug}`)) fails.push(`category /${c.slug} is not in sitemap-categories.xml`);
}

if (fails.length) {
  console.error(`\n✗ SITEMAP/MENU COVERAGE FAILED — ${fails.length} page(s) missing:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ SITEMAP COVERAGE OK — all ${listProducts().length} active products are in the sitemap and the header menu; all ${CATEGORY_PAGES.length} category pages are in the sitemap.`);

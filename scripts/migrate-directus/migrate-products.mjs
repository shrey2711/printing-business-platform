// Products: all 61 records from backend/data/products.js.
//
// Prices are deliberately NOT migrated. The pricing engine computes what a
// customer is charged from tiers, matrices, per-square-foot rates and option
// multipliers; flattening that into a single regular_price field would produce a
// number in the CMS that disagrees with checkout. Editors change prices through
// the validated path (backend/lib/pricingFromCms.js), which re-prices every
// selection before anything is saved.
//
// Category is linked by looking up the category record, so run
// migrate-categories.mjs first — index.mjs does that for you.

import { listProducts, getProduct, categories as CATEGORY_LIST } from '../../backend/data/products.js';
import { requireConfig, indexBy, upsert, newCounters, report, clamp, DRY } from './lib.mjs';

/** Category ids in the product data map to the landing-page slugs. */
const CATEGORY_SLUG = {
  tents: 'custom-canopies',
  'banner-stands': 'banner-stands',
  banners: 'banners',
  backdrops: 'backdrops',
  'table-covers': 'table-covers',
  flags: 'flags',
  'seg-displays': 'seg-displays'
};

/** First integer in a string, or null. */
function firstNumber(text) {
  const m = String(text || '').match(/\d+/);
  return m ? Number(m[0]) : null;
}

export async function migrateProducts() {
  const cats = await indexBy('categories', 'slug');
  const existing = await indexBy('products', 'slug');
  const c = newCounters();
  const unmapped = new Set();

  for (const listed of listProducts({ includeInactive: true })) {
    const p = getProduct(listed.slug);
    // Prefer the landing-page record; fall back to the plain category record
    // that migrate-categories creates for categories without a page.
    const catSlug = CATEGORY_SLUG[p.category] || p.category;
    const cat = catSlug ? cats.get(catSlug) || cats.get(p.category) : null;
    if (p.category && !cat) unmapped.add(p.category);

    const desired = {
      status: p.active === false ? 'draft' : 'published',
      slug: p.slug,
      title: p.name,
      sku: p.slug.toUpperCase(),
      short_description: clamp(p.tagline || '', 300),
      description: p.description || '',
      // Structured fields the product pages already render.
      specifications: p.specs || null,
      artwork_options: p.applications || null,
      variants: p.whatsIncluded || null,
      faqs: Array.isArray(p.faqs) ? p.faqs.map((f) => ({ q: f.q ?? f.question, a: f.a ?? f.answer })) : null,
      // production_days is an integer column while turnaround is prose
      // ("6-8 business days"). Take the low end of the range — the number a
      // customer plans around — and leave it unset when there is no number.
      production_days: firstNumber(p.turnaround),
      featured: Boolean(p.badge),
      active: p.active !== false,
      seo_title: clamp(`${p.name} | Apex Trade Show`, 62),
      seo_description: clamp(p.tagline || p.description || '', 165),
      h1: p.name,
      robots_index: true
    };
    if (cat) desired.category = cat.id;

    await upsert('products', 'slug', desired, existing, c);
  }

  if (unmapped.size) {
    console.warn(`  ! no category record for: ${[...unmapped].join(', ')} — run migrate-categories.mjs first`);
  }
  return report('products', c);
}

if (process.argv[1] && /migrate-products\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'Products (dry run)' : 'Products');
  process.exit((await migrateProducts()) ? 0 : 1);
}

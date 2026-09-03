// Categories: the six category landing pages plus the five subcategory pages.
//
// These come from src/data/categoryPages.js, which is what the prerenderer and
// the React app already render, so the CMS starts out agreeing with the site.

import { CATEGORY_PAGES, SUBCATEGORIES } from '../../src/data/categoryPages.js';
import { categories as PRODUCT_CATEGORIES, listProducts } from '../../backend/data/products.js';
import { requireConfig, indexBy, upsert, newCounters, report, clamp, DRY } from './lib.mjs';

export async function migrateCategories() {
  const existing = await indexBy('categories', 'slug');
  const c = newCounters();

  for (const page of [...CATEGORY_PAGES, ...SUBCATEGORIES]) {
    await upsert('categories', 'slug', {
      status: 'published',
      slug: page.slug,
      name: page.nav || page.h1,
      h1: page.h1,
      description: page.intro || '',
      // The audits expect 45-62 and 140-165; clamp so an import cannot create a
      // record that immediately fails a gate.
      seo_title: clamp(page.title || page.h1, 62),
      seo_description: clamp(page.metaDescription || page.intro || '', 165),
      robots_index: true
    }, existing, c);
  }
  // Products carry categories that have no landing page of their own (flags,
  // accessories, packages...). Without a record here those products would import
  // with no category at all, so create the missing ones from the catalogue's own
  // list. They are drafts: a category with no page should not look publishable.
  // Take the categories products actually use, not just the navigable list:
  // several values (accessories, packages, walls...) appear on products without
  // being in it, and a product importing with no category is a product an editor
  // cannot find.
  const named = new Map(PRODUCT_CATEGORIES.map((c) => [c.id, c.name]));
  const used = new Set(listProducts({ includeInactive: true }).map((p) => p.category).filter(Boolean));
  const all = [...new Set([...named.keys(), ...used])].map((id) => ({
    id,
    // Turn a slug into a readable label when the catalogue has no name for it.
    name: named.get(id) || id.replace(/[-_]/g, ' ').replace(/\w/g, (m) => m.toUpperCase())
  }));

  for (const cat of all) {
    if (existing.has(cat.id)) continue;
    await upsert('categories', 'slug', {
      status: 'draft', slug: cat.id, name: cat.name, description: ''
    }, existing, c);
  }

  return report(`categories (${CATEGORY_PAGES.length + SUBCATEGORIES.length} pages + product categories)`, c);
}

if (process.argv[1] && /migrate-categories\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'Categories (dry run)' : 'Categories');
  process.exit((await migrateCategories()) ? 0 : 1);
}

// SEO metadata for pages generated from code — the 20 city pages and the
// category pages.
//
// IMPORTANT: this writes the seo_overrides collection, and an override PINS a
// page to a fixed value. Copying every generated title in here would freeze the
// whole site: improve a title in code afterwards and nothing changes, because an
// override now wins. That is the opposite of useful.
//
// So this creates override records that are EMPTY apart from the path, giving an
// editor a row to edit per URL while every field continues to fall back to what
// the page generates. Use --with-values to copy the current generated values in,
// for the case where you deliberately want them frozen.

import { SEO_CITIES } from '../../src/data/citySeo.js';
import { CATEGORY_PAGES, SUBCATEGORIES } from '../../src/data/categoryPages.js';
import { requireConfig, indexBy, upsert, newCounters, report, clamp, DRY } from './lib.mjs';

const WITH_VALUES = process.argv.includes('--with-values');

export async function migrateSeo() {
  const existing = await indexBy('seo_overrides', 'path');
  const c = newCounters();

  const targets = [
    ...SEO_CITIES.map((city) => ({
      path: `/trade-show-displays/${city.slug}`,
      title: `Trade Show Displays in ${city.city}, ${city.abbr}`,
      description: city.metaDescription || ''
    })),
    ...[...CATEGORY_PAGES, ...SUBCATEGORIES].map((p) => ({
      path: `/${p.slug}`,
      title: p.title || p.h1,
      description: p.metaDescription || p.intro || ''
    }))
  ];

  for (const t of targets) {
    const desired = { status: 'published', path: t.path, robots_index: true };
    if (WITH_VALUES) {
      desired.seo_title = clamp(t.title, 62);
      desired.seo_description = clamp(t.description, 165);
    }
    // seo_overrides is the storefront's own table: its primary key is the path.
    await upsert('seo_overrides', 'path', desired, existing, c, { idField: 'path' });
  }

  console.log(WITH_VALUES
    ? '  note: --with-values copied the generated titles in, so these pages are now PINNED to them.'
    : '  rows created empty on purpose: each page still falls back to its generated SEO until someone edits it.');
  return report(`SEO override rows (${targets.length} URLs)`, c);
}

if (process.argv[1] && /migrate-seo\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'SEO (dry run)' : 'SEO');
  process.exit((await migrateSeo()) ? 0 : 1);
}

// /products?category=<id> duplicates a real landing page for these catalog
// categories. The edge middleware 301s the exact query URL, and the shop UI
// links straight to the page.
//
// A category id is listed here only when it has its own indexable landing
// page (src/data/categoryPages.js, or a display landing in
// src/data/landingPages.js). Flags and SEG kits use those landings: the
// product category id is not the URL slug.
//
// Catalog ids with no landing page are absent on purpose (accessories, walls,
// packages, displays, signs, decals, events, large-format). /products?category=
// for those still renders the catalog and canonicalises to /products.

export const CATEGORY_QUERY_REDIRECTS = {
  tents: '/custom-canopies',
  'banner-stands': '/banner-stands',
  banners: '/banners',
  backdrops: '/backdrops',
  'table-covers': '/table-covers',
  'rigid-signs': '/rigid-signs',
  'marketing-essentials': '/marketing-essentials',
  'channel-letters': '/channel-letters',
  flags: '/flags',
  'seg-kits': '/seg-displays'
};

export const categoryQueryTarget = (categoryId) => CATEGORY_QUERY_REDIRECTS[categoryId] || null;

// Exact path /products, and `category` is the only query parameter. Extra
// parameters, a repeated category, or an unmapped value return null so the
// request keeps today's behaviour.
export function categoryQueryRedirectPath(url) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/products') return null;
  const entries = [...url.searchParams.entries()];
  if (entries.length !== 1 || entries[0][0] !== 'category') return null;
  return categoryQueryTarget(entries[0][1]);
}

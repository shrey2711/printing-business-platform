// Location pages removed for good: they answer HTTP 410 Gone.
//
// Owner decision 2026-10-28. These 70 location URLs were not indexed by Google
// and were classed "no search value" in the Search Console audit of that day
// (location-pages-2026-10-28.md: 0 clicks and 0 impressions in 28 days). They
// are removed outright rather than redirected, so Google drops them quickly
// instead of folding them into another page.
//
// This is a different list from src/data/removedLocations.js. Those URLs were
// retired earlier and 301 to the nearest live page. These have no replacement:
//  - the edge middleware answers 410 for every path here (middleware.js);
//  - the prerenderer writes no HTML for them and leaves them out of the
//    sitemaps and of KNOWN_ROUTES (scripts/prerender.mjs);
//  - every link list in the SPA and in the prerendered HTML omits them,
//    through isStateLive / isCategoryCityLive (removedLocations.js),
//    INDEXED_STATES (stateContent.js) and CITY_PRODUCT_PAGES
//    (cityProductPages.js, whose entries for these pages were deleted).
//
// Keep this file free of imports: the edge middleware bundles it.
// To bring a page back, delete its path here and restore its content.
export const GONE_LOCATION_PATHS = [
  '/custom-table-covers-chicago',
  '/custom-banners-chicago',
  '/custom-canopy-tents-las-vegas',
  '/retractable-banner-stands-las-vegas',
  '/custom-table-covers-las-vegas',
  '/step-and-repeat-backdrop-las-vegas',
  '/tension-fabric-display-las-vegas',
  '/custom-banners-las-vegas',
  '/custom-canopy-tents-orlando',
  '/retractable-banner-stands-orlando',
  '/custom-table-covers-orlando',
  '/step-and-repeat-backdrop-orlando',
  '/tension-fabric-display-orlando',
  '/custom-banners-orlando',
  '/custom-canopy-tents-dallas',
  '/retractable-banner-stands-dallas',
  '/custom-table-covers-dallas',
  '/step-and-repeat-backdrop-dallas',
  '/tension-fabric-display-dallas',
  '/custom-banners-dallas',
  '/custom-canopy-tents-atlanta',
  '/retractable-banner-stands-atlanta',
  '/custom-table-covers-atlanta',
  '/step-and-repeat-backdrop-atlanta',
  '/tension-fabric-display-atlanta',
  '/custom-banners-atlanta',
  '/locations/arizona',
  '/locations/ontario',
  '/trade-show-canopies/new-york',
  '/trade-show-canopies/houston',
  '/trade-show-canopies/san-francisco',
  '/trade-show-canopies/vancouver',
  '/trade-show-canopies/nashville',
  '/trade-show-canopies/indianapolis',
  '/trade-show-canopies/charlotte',
  '/trade-show-canopies/denver',
  '/trade-show-canopies/phoenix',
  '/trade-show-canopies/new-orleans',
  '/trade-show-canopies/washington-dc',
  '/trade-show-canopies/san-diego',
  '/trade-show-canopies/boston',
  '/trade-show-displays/las-vegas',
  '/trade-show-displays/orlando',
  '/trade-show-displays/atlanta',
  '/trade-show-displays/new-york',
  '/trade-show-displays/dallas',
  '/trade-show-displays/houston',
  '/trade-show-displays/san-francisco',
  '/trade-show-displays/vancouver',
  '/trade-show-displays/seattle',
  '/trade-show-displays/indianapolis',
  '/trade-show-displays/charlotte',
  '/trade-show-displays/phoenix',
  '/trade-show-displays/miami',
  '/trade-show-displays/washington-dc',
  '/trade-show-displays/boston',
  '/banner-stands/new-york',
  '/banner-stands/houston',
  '/banner-stands/vancouver',
  '/banner-stands/seattle',
  '/banner-stands/nashville',
  '/banner-stands/indianapolis',
  '/banner-stands/charlotte',
  '/banner-stands/denver',
  '/banner-stands/phoenix',
  '/banner-stands/new-orleans',
  '/banner-stands/miami',
  '/banner-stands/washington-dc',
  '/banner-stands/san-diego',
  '/banner-stands/boston',
];

export const GONE_PATHS = new Set(GONE_LOCATION_PATHS);

export const isGonePath = (path) => GONE_PATHS.has((path || '').replace(/\/+$/, '') || '/');

// Contextual in-body links from indexed parent pages to related pages that
// Search Console reports as crawled/discovered but not indexed. One short
// paragraph per parent, written from facts already in the product and page
// data (no new claims). Rendered by both the React pages (ContextLinks) and
// scripts/prerender.mjs, so the crawled HTML and the hydrated page match.
//
// Each paragraph is a list of segments: plain strings, or { to, label } links.
// Only link to live, non-redirecting URLs that are in the sitemap (never to a
// 410 page in src/data/goneLocations.js; test:gone and audit:seo fail on one).
export const CONTEXT_LINKS = {
  '/products': [
    [
      'Comparing two similar products? ',
      { to: '/products/seg-modular-trade-show-kit-a', label: 'SEG Modular Kit A' },
      ' pairs an illuminated backdrop with a single archway/return and a counter, while ',
      { to: '/products/seg-modular-trade-show-kit-b', label: 'SEG Modular Kit B' },
      ' adds a side panel and an illuminated overhead arch section. For banners, the ',
      { to: '/products/18oz-blockout-banner', label: '18oz blockout banner' },
      ' has a blockout layer between its two PVC faces for true double-sided printing.'
    ]
  ],
  '/banners': [
    [
      'Not sure which material to choose? ',
      { to: '/blog/banner-materials-explained', label: 'Banner materials explained' },
      ' compares 13oz vinyl, 18oz blockout, perforated mesh and 9oz fabric. For a banner that is seen from both sides, the ',
      { to: '/products/18oz-blockout-banner', label: '18oz blockout banner' },
      ' stops one side\u2019s image showing through the other.'
    ]
  ],
  '/banner-stands': [
    [
      'Need a press wall or photo backdrop rather than a single stand? ',
      { to: '/step-and-repeat-backdrop-chicago', label: 'Step and repeat backdrops in Chicago' },
      ' covers repeating logo artwork on an adjustable frame for galas, receptions and press calls.'
    ]
  ],
  '/tension-fabric-displays': [
    [
      'Want the graphic lit from behind? The illuminated SEG modular kits use backlit SEG fabric graphics in a lightbox frame: ',
      { to: '/products/seg-modular-trade-show-kit-a', label: 'SEG Modular Kit A' },
      ' is a backdrop with a single illuminated archway and a counter, and ',
      { to: '/products/seg-modular-trade-show-kit-b', label: 'SEG Modular Kit B' },
      ' adds a side panel and an illuminated overhead arch.'
    ]
  ]
};

export const contextLinksFor = (path) => CONTEXT_LINKS[path] || [];

// Contextual in-body links from indexed parent pages to related pages.
// One short paragraph per parent, written from facts already in the product
// and page data (no new claims). Rendered by both the React pages (ContextLinks)
// and scripts/prerender.mjs, so the crawled HTML and the hydrated page match.
//
// Each paragraph is a list of segments: plain strings, or { to, label } links.
// Anchor text is the exact phrase the on-page spec asked for. Only link to
// live, non-redirecting URLs that are in the sitemap (never to a 410 page in
// src/data/goneLocations.js; test:gone and audit:seo fail on one).
export const CONTEXT_LINKS = {
  '/': [
    [
      'Printed ',
      { to: '/products/business-cards-16pt-matte', label: 'business cards' },
      ' on 16pt matte stock are cut to 3.5 by 2 inches and boxed. ',
      { to: '/products/custom-lanyards', label: 'custom lanyards' },
      ' carry a badge or an ID. A ',
      { to: '/products/custom-table-runner', label: 'table runner' },
      ' is a printed strip along the table top, and ',
      { to: '/table-covers', label: 'custom table covers' },
      ' cover a 4, 6 or 8 ft table on all four sides.'
    ],
    [
      'A ',
      { to: '/custom-canopies', label: 'custom canopy tent' },
      ' prints your logo on a 600D top. The ',
      { to: '/products/canopy-tent-10x10', label: '10x10 canopy tent' },
      ' is the 100 square foot single booth. Pair it with ',
      { to: '/products/feather-angled-flag', label: 'feather flags' },
      ' for height at the entrance, ',
      { to: '/products/coroplast-signs', label: 'yard signs' },
      ' on a steel H-stake for parking or check-in, and an ',
      { to: '/products/a-frame-sign', label: 'a frame sign' },
      ' that folds flat when you bring it in.'
    ],
    [
      'Hang ',
      { to: '/banners', label: 'custom banners' },
      ' or ',
      { to: '/products/13oz-vinyl-banner', label: 'vinyl banners' },
      ' at the size you enter. A ',
      { to: '/banner-stands', label: 'retractable banner' },
      ' rolls its graphic into a base, the standard ',
      { to: '/products/standard-retractable-banner', label: 'roll up banner' },
      ' is the 33 or 47 by 81 inch stand, and a ',
      { to: '/products/step-and-repeat-backdrop', label: 'step and repeat banner' },
      ' repeats logos across a photo wall.'
    ]
  ],
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
  '/trade-show-displays': [
    [
      'Around the back wall, a ',
      { to: '/banner-stands', label: 'retractable banner' },
      ' stands at the aisle and a ',
      { to: '/products/standard-retractable-banner', label: 'pull up banner' },
      ' is the 33 or 47 inch version of that stand. A ',
      { to: '/products/13oz-vinyl-banner', label: 'vinyl banner' },
      ' hangs at a custom size, and ',
      { to: '/banners', label: 'custom banners' },
      ' cover 13oz vinyl, 18oz blockout, mesh and 9oz fabric.'
    ],
    [
      'Outdoors, a ',
      { to: '/products/canopy-tent-10x10', label: '10x10 canopy tent' },
      ' is the single-booth roof and an ',
      { to: '/custom-canopies', label: 'event tent' },
      ' is the printed canopy when any of the show is outside. A ',
      { to: '/products/step-and-repeat-backdrop', label: 'step and repeat backdrop' },
      ' is the photo wall, a ',
      { to: '/pop-up-displays', label: 'pop up display' },
      ' is the portable backwall, and ',
      { to: '/table-covers', label: 'trade show table covers' },
      ' finish the rented table.'
    ],
    [
      'What leaves with the visitor: ',
      { to: '/products/business-cards-16pt-matte', label: 'business cards' },
      ' for a pocket, ',
      { to: '/products/custom-lanyards', label: 'custom lanyards' },
      ' for badges, and a ',
      { to: '/products/custom-table-runner', label: 'custom table runner' },
      ' along the table top.'
    ]
  ],
  '/trade-show-booth-packages': [
    [
      'What else you need once the booth is standing: ',
      { to: '/products/business-cards-16pt-matte', label: 'business cards' },
      ' to hand over at the table, and ',
      { to: '/products/custom-lanyards', label: 'custom lanyards' },
      ' for staff badges.'
    ]
  ],
  '/banners': [
    [
      'Not sure which material to choose? ',
      { to: '/blog/banner-materials-explained', label: 'Banner materials explained' },
      ' compares 13oz vinyl, 18oz blockout, perforated mesh and 9oz fabric. For a banner that is seen from both sides, the ',
      { to: '/products/18oz-blockout-banner', label: '18oz blockout banner' },
      ' stops one side\u2019s image showing through the other.'
    ],
    [
      'A ',
      { to: '/banner-stands', label: 'banner stand' },
      ' holds one graphic at the aisle when you do not want a hanging banner. For the ground outside, ',
      { to: '/products/coroplast-signs', label: 'yard signs' },
      ' are 4mm coroplast on an H-stake, and ',
      { to: '/products/a-frame-sign', label: 'a frame signs' },
      ' are the folding sidewalk sign. Among the materials here, ',
      { to: '/products/13oz-vinyl-banner', label: 'vinyl banners' },
      ' are the 13oz scrim option.'
    ]
  ],
  '/banner-stands': [
    [
      'Need a press wall or photo backdrop rather than a single stand? ',
      { to: '/step-and-repeat-backdrop-chicago', label: 'Step and repeat backdrops in Chicago' },
      ' covers repeating logo artwork on an adjustable frame for galas, receptions and press calls.'
    ],
    [
      'If the graphic should hang rather than stand, ',
      { to: '/banners', label: 'banner printing' },
      ' covers vinyl, blockout, mesh and fabric to the size you enter. The standard ',
      { to: '/products/standard-retractable-banner', label: 'roll up banner' },
      ' is the 33 or 47 inch retractable stand.'
    ]
  ],
  '/backdrops': [
    [
      'A ',
      { to: '/products/step-and-repeat-backdrop', label: 'step and repeat banner' },
      ' is the printed repeating-logo graphic on its frame. For a single aisle graphic instead of a wall, ',
      { to: '/banner-stands', label: 'banner stands' },
      ' roll into a base.'
    ]
  ],
  '/flags': [
    [
      'The same outdoor kit often adds ',
      { to: '/products/coroplast-signs', label: 'yard signs' },
      ' for parking and check-in, a ',
      { to: '/products/a-frame-sign', label: 'sidewalk sign' },
      ' at the entrance, and ',
      { to: '/products/feather-angled-flag', label: 'feather flags' },
      ' when you want the angled shape that stays readable in light wind.'
    ]
  ],
  '/table-covers': [
    [
      'A ',
      { to: '/products/custom-table-runner', label: 'table runner' },
      ' is the narrower option: a printed strip along the top instead of a cover over all four sides.'
    ]
  ],
  '/custom-canopies': [
    [
      'Pair the canopy with ',
      { to: '/banners', label: 'custom banners' },
      ' along a fence and ',
      { to: '/products/feather-angled-flag', label: 'feather flags' },
      ' at the front corner. The ',
      { to: '/products/canopy-tent-10x10', label: '10x10 canopy tent' },
      ' is the single-booth size.'
    ]
  ],
  '/tension-fabric-displays': [
    [
      'Want the graphic lit from behind? The illuminated SEG modular kits use backlit SEG fabric graphics in a lightbox frame: ',
      { to: '/products/seg-modular-trade-show-kit-a', label: 'SEG Modular Kit A' },
      ' is a backdrop with a single illuminated archway and a counter, and ',
      { to: '/products/seg-modular-trade-show-kit-b', label: 'SEG Modular Kit B' },
      ' adds a side panel and an illuminated overhead arch.'
    ],
    [
      'If you want the accordion frame instead, a ',
      { to: '/pop-up-displays', label: 'pop up display' },
      ' expands into a backwall and is quoted per order.'
    ]
  ],
  '/seg-displays': [
    [
      'A ',
      { to: '/pop-up-displays', label: 'pop up display' },
      ' is the other portable backwall, with an accordion frame rather than a silicone-edge graphic.'
    ]
  ],
  '/products/canopy-tent-10x10': [
    [
      'The other footprints are on the ',
      { to: '/custom-canopies', label: 'custom canopy tent' },
      ' page. 10x15 and 10x20 use the same aluminum hex frame and 600D top.'
    ]
  ],
  '/products/stretch-table-covers': [
    [
      'This fitted cover is one ',
      { to: '/table-covers', label: 'custom table cover' },
      ' style. The pleated throw on that page is the draped option.'
    ]
  ]
};

export const contextLinksFor = (path) => CONTEXT_LINKS[path] || [];

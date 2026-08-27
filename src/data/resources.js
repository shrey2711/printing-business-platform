// Learning Center (/resources) — a topical-authority hub that organises the
// existing guide articles into four categories. Articles live in the blog system
// (/blog/{slug}) and are surfaced here by slug, so there is no duplicate content.
// Shared by the React ResourcesPage and scripts/prerender.mjs.

export const RESOURCES_META = {
  title: 'Trade Show Learning Center',
  h1: 'Trade Show Learning Center',
  description:
    'The Apex Learning Center — buying guides, booth design, printing knowledge and setup & care for trade show displays, canopies, banners, backdrops and table covers.',
  intro:
    'Practical, no-jargon guides to help you choose, print, build and care for a professional trade show booth. Written for business owners and exhibitors — not students.'
};

export const RESOURCE_CATEGORIES = [
  {
    key: 'buying-guides',
    title: 'Buying Guides',
    blurb: 'Choose the right display, size and finish with confidence.',
    slugs: [
      'trade-show-display-cost',
      'custom-canopy-tent-buying-guide',
      '10x10-vs-10x15-vs-10x20-custom-canopy-tents',
      'standard-vs-deluxe-retractable-banner',
      'x-stand-vs-retractable-banner',
      'what-size-retractable-banner',
      'pleated-vs-stretch-table-cover',
      '6ft-vs-8ft-table-cover',
      'trade-show-backdrop-size-guide',
      'feather-angled-vs-convex-vs-teardrop-flags',
      'seg-modular-kit-a-vs-b-vs-c'
    ]
  },
  {
    key: 'booth-design',
    title: 'Booth Design',
    blurb: 'Plan a coordinated booth that gets noticed on the floor.',
    slugs: ['trade-show-booth-design-guide', 'trade-show-booth-checklist']
  },
  {
    key: 'printing-knowledge',
    title: 'Printing Knowledge',
    blurb: 'Prepare print-ready artwork and understand what prints where.',
    slugs: [
      'banner-materials-explained',
      'how-to-prepare-artwork-for-a-custom-canopy-tent',
      'print-coverage-explained',
      'custom-canopy-tent-wall-options-explained'
    ]
  },
  {
    key: 'setup-care',
    title: 'Setup & Care',
    blurb: 'Set up fast and keep displays looking new for years.',
    slugs: ['trade-show-display-setup-and-care-guide']
  }
];

// All slugs referenced by the hub (for validation / prefetch).
export const RESOURCE_SLUGS = RESOURCE_CATEGORIES.flatMap((c) => c.slugs);

// Internal-linking map (Phase 4). Powers crawlable, descriptive cross-links:
//   - each product page -> 3 relevant guides
//   - each guide -> 4 relevant products (+ related articles by shared tag)
// Anchor text is always the real product/article title (never "click here").
// Shared by scripts/prerender.mjs (SSR) and the client pages.

// Product category -> most relevant guide article slugs (first 3 are used).
export const CATEGORY_GUIDES = {
  tents: ['10x10-vs-10x15-vs-10x20-custom-canopy-tents', 'custom-canopy-tent-wall-options-explained', 'trade-show-display-cost'],
  'table-covers': ['pleated-vs-stretch-table-cover', '6ft-vs-8ft-table-cover', 'trade-show-display-setup-and-care-guide'],
  'banner-stands': ['standard-vs-deluxe-retractable-banner', 'x-stand-vs-retractable-banner', 'what-size-retractable-banner'],
  backdrops: ['trade-show-backdrop-size-guide', 'trade-show-booth-design-guide', 'print-coverage-explained'],
  banners: ['banner-materials-explained', 'trade-show-display-setup-and-care-guide', 'trade-show-display-cost'],
  flags: ['feather-angled-vs-convex-vs-teardrop-flags', 'trade-show-booth-design-guide', 'trade-show-display-setup-and-care-guide'],
  'seg-kits': ['seg-modular-kit-a-vs-b-vs-c', 'trade-show-booth-design-guide', 'trade-show-display-cost']
};
export const DEFAULT_GUIDES = ['trade-show-booth-checklist', 'trade-show-display-cost', 'trade-show-booth-design-guide'];

// Guide article slug -> most relevant product slugs (first 4 are used).
export const GUIDE_PRODUCTS = {
  'trade-show-display-cost': ['canopy-tent-10x10', 'standard-retractable-banner', 'pleated-table-covers', 'step-and-repeat-backdrop'],
  '10x10-vs-10x15-vs-10x20-custom-canopy-tents': ['canopy-tent-10x10', 'canopy-tent-10x15', 'canopy-tent-10x20', 'pleated-table-covers'],
  'custom-canopy-tent-buying-guide': ['canopy-tent-10x10', 'canopy-tent-10x15', 'canopy-tent-10x20', 'standard-retractable-banner'],
  'custom-canopy-tent-wall-options-explained': ['canopy-tent-10x10', 'canopy-tent-10x15', 'canopy-tent-10x20', 'step-and-repeat-backdrop'],
  'how-to-prepare-artwork-for-a-custom-canopy-tent': ['canopy-tent-10x10', 'step-and-repeat-backdrop', 'standard-retractable-banner', 'pleated-table-covers'],
  'print-coverage-explained': ['canopy-tent-10x10', 'step-and-repeat-backdrop', '13oz-vinyl-banner', 'pleated-table-covers'],
  'standard-vs-deluxe-retractable-banner': ['standard-retractable-banner', 'deluxe-retractable-banner', 'x-stand-banner', 'table-top-banner-stand'],
  'x-stand-vs-retractable-banner': ['x-stand-banner', 'standard-retractable-banner', 'deluxe-retractable-banner', 'table-top-banner-stand'],
  'what-size-retractable-banner': ['standard-retractable-banner', 'deluxe-retractable-banner', 'x-stand-banner', 'table-top-banner-stand'],
  'pleated-vs-stretch-table-cover': ['pleated-table-covers', 'stretch-table-covers', 'standard-retractable-banner', 'step-and-repeat-backdrop'],
  '6ft-vs-8ft-table-cover': ['pleated-table-covers', 'stretch-table-covers', 'standard-retractable-banner', 'canopy-tent-10x10'],
  'trade-show-backdrop-size-guide': ['step-and-repeat-backdrop', 'standard-retractable-banner', 'pleated-table-covers', 'deluxe-retractable-banner'],
  'trade-show-booth-checklist': ['canopy-tent-10x10', 'standard-retractable-banner', 'step-and-repeat-backdrop', 'pleated-table-covers'],
  'feather-angled-vs-convex-vs-teardrop-flags': ['feather-angled-flag', 'feather-convex-flag', 'teardrop-flag', 'canopy-tent-10x10'],
  'seg-modular-kit-a-vs-b-vs-c': ['seg-modular-trade-show-kit-a', 'seg-modular-trade-show-kit-b', 'seg-modular-trade-show-kit-c', 'step-and-repeat-backdrop'],
  'banner-materials-explained': ['13oz-vinyl-banner', '18oz-blockout-banner', 'mesh-banner', 'fabric-banner-9oz-wrinkle-free'],
  'trade-show-booth-design-guide': ['step-and-repeat-backdrop', 'standard-retractable-banner', 'canopy-tent-10x10', 'pleated-table-covers'],
  'trade-show-display-setup-and-care-guide': ['canopy-tent-10x10', 'standard-retractable-banner', 'step-and-repeat-backdrop', 'pleated-table-covers']
};
export const DEFAULT_PRODUCTS = ['canopy-tent-10x10', 'standard-retractable-banner', 'pleated-table-covers', 'step-and-repeat-backdrop'];

export const guidesForCategory = (cat) => (CATEGORY_GUIDES[cat] || DEFAULT_GUIDES).slice(0, 3);
export const productsForGuide = (slug) => (GUIDE_PRODUCTS[slug] || DEFAULT_PRODUCTS).slice(0, 4);

// Learning Center guides linked from every city page (§17 item 7) — descriptive,
// non-city-qualified anchors for anchor diversity. Slugs verified in staticArticles.
export const CITY_BOOTH_GUIDES = [
  { slug: 'trade-show-booth-checklist', label: 'Trade Show Booth Checklist' },
  { slug: 'custom-canopy-tent-buying-guide', label: 'Custom Canopy Tent Buying Guide' },
  { slug: 'trade-show-display-cost', label: 'Trade Show Display Cost Guide' },
  { slug: 'trade-show-backdrop-size-guide', label: 'Trade Show Backdrop Size Guide' }
];

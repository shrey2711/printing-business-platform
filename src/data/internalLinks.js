// Internal-linking map (Phase 4). Powers crawlable, descriptive cross-links:
//   - each product page -> 3 relevant guides
//   - each guide -> 4 relevant products (+ related articles by shared tag)
// Anchor text is always the real product/article title (never "click here").
// Shared by scripts/prerender.mjs (SSR) and the client pages.

// Product category -> most relevant guide article slugs (first 3 are used).
export const CATEGORY_GUIDES = {
  // All five canopy guides: the buying, artwork and print-coverage guides had no
  // product page linking to them, and Google had them clustered as duplicates.
  tents: ['10x10-vs-10x15-vs-10x20-custom-canopy-tents', 'custom-canopy-tent-buying-guide', 'custom-canopy-tent-wall-options-explained', 'how-to-prepare-artwork-for-a-custom-canopy-tent', 'print-coverage-explained'],
  'table-covers': ['pleated-vs-stretch-table-cover', '6ft-vs-8ft-table-cover', 'trade-show-display-setup-and-care-guide'],
  'banner-stands': ['standard-vs-deluxe-retractable-banner', 'x-stand-vs-retractable-banner', 'what-size-retractable-banner'],
  backdrops: ['trade-show-backdrop-size-guide', 'step-and-repeat-vs-tension-fabric-backdrop', 'trade-show-booth-design-guide'],
  banners: ['banner-materials-explained', 'trade-show-display-setup-and-care-guide', 'trade-show-display-cost'],
  flags: ['feather-angled-vs-convex-vs-teardrop-flags', 'trade-show-booth-design-guide', 'trade-show-display-setup-and-care-guide'],
  'seg-kits': ['seg-modular-kit-a-vs-b-vs-c', 'trade-show-booth-design-guide', 'trade-show-display-cost'],
  'rigid-signs': ['coroplast-vs-pvc-vs-aluminum-signs', 'print-coverage-explained', 'trade-show-booth-checklist']
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
  'trade-show-display-setup-and-care-guide': ['canopy-tent-10x10', 'standard-retractable-banner', 'step-and-repeat-backdrop', 'pleated-table-covers'],
  'coroplast-vs-pvc-vs-aluminum-signs': ['coroplast-signs', 'pvc-board-signs', 'acp-aluminum-signs', 'step-and-repeat-backdrop'],
  'step-and-repeat-vs-tension-fabric-backdrop': ['step-and-repeat-backdrop', 'straight-tension-fabric-display', 'standard-retractable-banner', 'pleated-table-covers']
};
export const DEFAULT_PRODUCTS = ['canopy-tent-10x10', 'standard-retractable-banner', 'pleated-table-covers', 'step-and-repeat-backdrop'];

// Titles for the guides above, so the client product page can render the same
// "Guides for your booth" links as the prerendered HTML without loading articles.
export const GUIDE_TITLES = {
  '10x10-vs-10x15-vs-10x20-custom-canopy-tents': '10x10 vs 10x15 vs 10x20 Custom Canopy Tents',
  'custom-canopy-tent-buying-guide': 'Custom Canopy Tent Buying Guide',
  'custom-canopy-tent-wall-options-explained': 'Custom Canopy Tent Wall Options Explained',
  'how-to-prepare-artwork-for-a-custom-canopy-tent': 'How to Prepare Canopy Tent Artwork',
  'print-coverage-explained': 'Canopy Print Coverage Explained: Top, Valance, Walls & Inside',
  'pleated-vs-stretch-table-cover': 'Pleated vs Stretch Table Covers: Which Look Is Right for Your Booth?',
  '6ft-vs-8ft-table-cover': '6 ft vs 8 ft Table Cover: Which Size Do You Need?',
  'trade-show-display-setup-and-care-guide': 'Trade Show Display Setup & Care Guide',
  'standard-vs-deluxe-retractable-banner': 'Standard Retractable Banner vs Deluxe Retractable Banner: Which Should You Choose?',
  'x-stand-vs-retractable-banner': 'X-Stand vs Retractable Banner: Which Banner Stand Is Right for You?',
  'what-size-retractable-banner': 'What Size Retractable Banner Should I Buy?',
  'trade-show-backdrop-size-guide': 'Trade Show Backdrop Size Guide: Choosing a Step & Repeat',
  'step-and-repeat-vs-tension-fabric-backdrop': 'Step & Repeat Backdrop vs Tension Fabric Display: Which Backdrop Fits Your Booth?',
  'trade-show-booth-design-guide': 'Trade Show Booth Design: Layout & Branding',
  'banner-materials-explained': 'Banner Materials: Vinyl, Blockout, Mesh & Fabric',
  'trade-show-display-cost': 'How Much Does a Trade Show Display Cost?',
  'feather-angled-vs-convex-vs-teardrop-flags': 'Feather Angled vs Convex vs Teardrop Flags',
  'seg-modular-kit-a-vs-b-vs-c': 'SEG Modular Kit A vs B vs C',
  'coroplast-vs-pvc-vs-aluminum-signs': 'Coroplast vs PVC vs Aluminum Signs: Which Rigid Sign Should You Choose?',
  'trade-show-booth-checklist': 'The Complete Trade Show Booth Checklist'
};

export const guidesForCategory = (cat) => (CATEGORY_GUIDES[cat] || DEFAULT_GUIDES).slice(0, 5);
export const productsForGuide = (slug) => (GUIDE_PRODUCTS[slug] || DEFAULT_PRODUCTS).slice(0, 4);

// Learning Center guides linked from every city page (§17 item 7) — descriptive,
// non-city-qualified anchors for anchor diversity. Slugs verified in staticArticles.
export const CITY_BOOTH_GUIDES = [
  { slug: 'trade-show-booth-checklist', label: 'Trade Show Booth Checklist' },
  { slug: 'custom-canopy-tent-buying-guide', label: 'Custom Canopy Tent Buying Guide' },
  { slug: 'trade-show-display-cost', label: 'Trade Show Display Cost Guide' },
  { slug: 'trade-show-backdrop-size-guide', label: 'Trade Show Backdrop Size Guide' }
];

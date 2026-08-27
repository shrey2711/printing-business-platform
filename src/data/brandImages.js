// Product CARD thumbnails (homepage, category, related). RULE: the card must
// depict the ACTUAL product for that SKU — never another hardware type. Canopy
// and table-cover cards use different-brand mockups of the CORRECT product type
// (intentional brand-mix). The banner-stand cards use each stand's own real
// photo so the card matches the hardware the customer configures (Standard is
// not Deluxe, Table Top is not an X-Stand, etc.).
export const PRODUCT_CARD_IMAGE = {
  'canopy-tent-10x10': '/images/showcase/canopy-nova-tech.webp',
  'canopy-tent-10x15': '/images/showcase/canopy-harbor-realty.webp',
  'pleated-table-covers': '/images/showcase/tablecover-brightpath-dental.webp',
  'stretch-table-covers': '/images/showcase/tablecover-corner-cafe.webp',
  'standard-retractable-banner': '/images/displays/standard-retractable-front-back.png',
  'deluxe-retractable-banner': '/images/displays/deluxe-retractable-banner.webp',
  'x-stand-banner': '/images/displays/x-stand-front-back.jpg',
  'table-top-banner-stand': '/images/displays/table-top-example.png',
  'step-and-repeat-backdrop': '/images/displays/step-repeat-angled.jpeg',
  'straight-tension-fabric-display': '/images/displays/straight-tension-fabric-display-main.png',
  '13oz-vinyl-banner': '/images/banners/13oz-vinyl-banner-burger-landscape.jpeg',
  '18oz-blockout-banner': '/images/banners/18oz-blockout-banner-urban-apparel-roll.jpeg',
  'mesh-banner': '/images/banners/mesh-banner-gift-pass-fence-lifestyle.jpeg',
  'fabric-banner-9oz-wrinkle-free': '/images/banners/fabric-banner-9oz-aroma-blend-folded.jpeg',
  'feather-angled-flag': '/images/flags/feather_angled_flag_taco_vista_large_cross_base.png',
  'feather-convex-flag': '/images/flags/feather_convex_flag_solis_spa_large_cross_base.png',
  'teardrop-flag': '/images/flags/teardrop_flag_summit_coffee_large_cross_base.png',
  'seg-modular-trade-show-kit-a': '/images/seg-kits/apex-seg-modular-kit-a-main.jpeg',
  'seg-modular-trade-show-kit-b': '/images/seg-kits/apex-seg-modular-kit-b-main.jpeg',
  'seg-modular-trade-show-kit-c': '/images/seg-kits/apex-seg-modular-kit-c-main.jpeg'
};

export const getProductBrandImage = (slug) => PRODUCT_CARD_IMAGE[slug] || null;

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
  'step-and-repeat-backdrop': '/images/showcase/backdrop-greenleaf.webp'
};

export const getProductBrandImage = (slug) => PRODUCT_CARD_IMAGE[slug] || null;

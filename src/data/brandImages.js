// Different-brand product mockups used on product CARDS (marketing thumbnails),
// so the catalog reads as "we print many brands", not all-Apex. The product
// DETAIL page keeps its own preview. Only slugs listed here are re-branded; the
// rest fall back to the default product photo.
export const PRODUCT_CARD_IMAGE = {
  'canopy-tent-10x10': '/images/showcase/canopy-nova-tech.webp',
  'canopy-tent-10x15': '/images/showcase/canopy-harbor-realty.webp',
  'pleated-table-covers': '/images/showcase/tablecover-brightpath-dental.webp',
  'stretch-table-covers': '/images/showcase/tablecover-corner-cafe.webp',
  'standard-retractable-banner': '/images/showcase/banner-summit-outdoors.webp',
  'x-stand-banner': '/images/showcase/xstand-volt.webp',
  'table-top-banner-stand': '/images/showcase/xstand-sunset-yoga.webp',
  'step-and-repeat-backdrop': '/images/showcase/backdrop-greenleaf.webp'
};

export const getProductBrandImage = (slug) => PRODUCT_CARD_IMAGE[slug] || null;

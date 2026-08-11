// Alternate-colour product mockups ("colorways") shown under "Also available in"
// on the product page. Files live in public/images/colorways/. A thumbnail only
// appears once its image actually loads, so listing a not-yet-uploaded file is
// harmless. Only files that currently exist are listed here.
//
// Brand colors: red #ED1C24, navy #000066. The existing product photos are the
// navy default, so colorways here are the ALTERNATE looks (red / charcoal /
// white). Table-cover colorways are stretch-style, so they attach only to the
// stretch product; pleated has no alternate mockup yet.

const CANOPY = [
  { file: 'canopy-red.webp', label: 'Red' },
  { file: 'canopy-charcoal.webp', label: 'Charcoal' }
];
const STRETCH = [
  { file: 'tablecover-charcoal.webp', label: 'Charcoal' }
];
const BANNER = [
  { file: 'banner-red.webp', label: 'Red' },
  { file: 'banner-white.webp', label: 'White' }
];
const BACKDROP = [
  { file: 'backdrop-red.webp', label: 'Red' }
];

export const COLORWAYS = {
  'canopy-tent-10x10': CANOPY,
  'canopy-tent-10x15': CANOPY,
  'canopy-tent-10x20': CANOPY,
  'stretch-table-covers': STRETCH,
  'standard-retractable-banner': BANNER,
  'deluxe-retractable-banner': BANNER,
  'x-stand-banner': BANNER,
  'table-top-banner-stand': BANNER,
  'step-and-repeat-backdrop': BACKDROP
};

export const getColorways = (slug) => COLORWAYS[slug] || [];

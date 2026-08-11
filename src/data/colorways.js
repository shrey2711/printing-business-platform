// Optional alternate-colour product mockups ("colorways").
//
// Drop a matching image into public/images/colorways/ and it appears
// automatically on the product page under "Also available in". A file that is
// NOT present is silently skipped (ColorwayStrip only shows an image once it
// actually loads) — so listing a filename here that hasn't been uploaded yet
// breaks nothing. No code change is needed to activate a colorway; just add the
// file. Preferred format .webp (or .png/.jpg — convert to .webp for size).
//
// Brand colors: red #ED1C24, navy #000066.

const CANOPY = [
  { file: 'canopy-red.webp', label: 'Red' },
  { file: 'canopy-charcoal.webp', label: 'Charcoal' },
  { file: 'canopy-white.webp', label: 'White' }
];
const TABLECOVER = [
  { file: 'tablecover-red.webp', label: 'Red' },
  { file: 'tablecover-charcoal.webp', label: 'Charcoal' }
];
const BANNER = [
  { file: 'banner-red.webp', label: 'Red' },
  { file: 'banner-white.webp', label: 'White' }
];
const BACKDROP = [
  { file: 'backdrop-red.webp', label: 'Red' },
  { file: 'backdrop-charcoal.webp', label: 'Charcoal' }
];

export const COLORWAYS = {
  'canopy-tent-10x10': CANOPY,
  'canopy-tent-10x15': CANOPY,
  'canopy-tent-10x20': CANOPY,
  'pleated-table-covers': TABLECOVER,
  'stretch-table-covers': TABLECOVER,
  'standard-retractable-banner': BANNER,
  'deluxe-retractable-banner': BANNER,
  'x-stand-banner': BANNER,
  'table-top-banner-stand': BANNER,
  'step-and-repeat-backdrop': BACKDROP
};

export const getColorways = (slug) => COLORWAYS[slug] || [];

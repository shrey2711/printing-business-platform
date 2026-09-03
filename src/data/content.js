// Editable site copy. Each entry is a stable key, its hardcoded DEFAULT, a label
// for the dashboard, and whether it's multiline. Components read these via
// useContent(key); the dashboard lists them for editing; an override in the DB
// wins over the default. Plain ESM (no React) so prerender can import it too.
//
// To make another string editable: add a key here and read it in the component
// with useContent('your.key'). Nothing else is required.

export const CONTENT_FIELDS = [
  // Home hero
  { key: 'home.hero.eyebrow', label: 'Home — hero eyebrow', default: 'Complete trade show solutions' },
  { key: 'home.hero.title', label: 'Home — hero title', default: 'Custom Trade Show Displays, Banner Stands & Canopy Tents Across the USA' },
  {
    key: 'home.hero.subtitle',
    label: 'Home — hero subtitle',
    multiline: true,
    default:
      'Design, print and order premium exhibition displays with instant online pricing, a free artwork ' +
      'proof and fast nationwide shipping — professional trade show solutions for businesses across the United States.'
  },
  // Home size section
  { key: 'home.sizes.title', label: 'Home — sizes heading', default: 'Custom canopy tents' },
  {
    key: 'home.sizes.subtitle',
    label: 'Home — sizes subheading',
    default: 'Our most popular category — printed to order with instant pricing. 10 × 10 is the standard vendor booth.'
  },
  // Closing band
  {
    key: 'home.cta.main',
    label: 'Home — closing headline',
    default: 'Most canopies are produced in 6–8 business days after proof approval'
  },
  {
    key: 'home.cta.sub',
    label: 'Home — closing subtext',
    default: 'Need it sooner? Ask us about rush production before you order.'
  }
];

// ---- Section 3: the rest of the homepage, plus header/footer ----------------
// Defaults below are EXACTLY what the site renders today, so adding these keys
// changes nothing visually. An editor overrides one and only that piece moves.
//
// `type: 'list'` fields hold an array. They resolve through resolveList(), which
// falls back to the default array whenever the override is absent or malformed —
// a broken CMS payload can never blank a homepage section.
CONTENT_FIELDS.push(
  // Hero
  { key: 'home.hero.cta.label', label: 'Home — hero button text', default: 'Build your booth' },
  { key: 'home.hero.cta.href', label: 'Home — hero button link', default: '/trade-show-displays' },
  { key: 'home.hero.cta2.label', label: 'Home — hero secondary button text', default: 'Request a quote' },
  { key: 'home.hero.cta2.href', label: 'Home — hero secondary button link', default: '/quote' },
  { key: 'home.hero.image', label: 'Home — hero image (leave blank to keep the product collage)', default: '' },

  // Promotional strip. Empty message = the strip does not render at all.
  { key: 'home.promo.message', label: 'Home — promotional strip message', default: '' },
  { key: 'home.promo.href', label: 'Home — promotional strip link', default: '' },
  { key: 'home.promo.cta', label: 'Home — promotional strip button text', default: '' },

  // Featured categories
  { key: 'home.featured.title', label: 'Home — featured categories heading', default: 'Shop by category' },
  {
    key: 'home.featured.items',
    label: 'Home — featured category cards',
    type: 'list',
    default: [
      { title: 'Custom Canopies', copy: 'Printed pop-up tents & walls', to: '/custom-canopies', img: '/images/showcase/canopy-nova-tech.webp' },
      { title: 'Banner Stands', copy: 'Retractable & X-stand banners', to: '/banner-stands', img: '/images/displays/standard-retractable-front-back.webp' },
      { title: 'Banners', copy: 'Vinyl, mesh & fabric banners', to: '/banners', img: '/images/banners/13oz-vinyl-banner-burger-landscape.jpeg' },
      { title: 'Table Covers', copy: 'Pleated & stretch throws', to: '/table-covers', img: '/images/showcase/tablecover-brightpath-dental.webp' },
      { title: 'Backdrops', copy: 'Step & repeat media walls', to: '/backdrops', img: '/images/showcase/backdrop-oakwood.webp' },
      { title: 'Flags', copy: 'Feather & teardrop flags', to: '/flags', img: '/images/flags/feather_angled_flag_taco_vista_large_cross_base.webp' },
      { title: 'SEG Modular Kits', copy: 'Illuminated modular booths', to: '/seg-displays', img: '/images/seg-kits/apex-seg-modular-kit-a-main.jpeg' },
      { title: 'Trade Show Displays', copy: 'Shop the complete range', to: '/trade-show-displays', img: '/images/showcase/canopy-harbor-realty.webp' },
      { title: 'Accessories', copy: 'Weights, sandbags & hardware', to: '/products', img: '/images/tents/sandbags.webp' }
    ]
  },

  // Best sellers — product slugs. An unknown slug is skipped rather than
  // rendering a broken card.
  { key: 'home.bestsellers.title', label: 'Home — best sellers heading', default: 'Featured across the range' },
  { key: 'home.bestsellers.subtitle', label: 'Home — best sellers sub-heading', default: 'A mix of what Apex prints for your booth.' },
  {
    key: 'home.bestsellers.items',
    label: 'Home — best seller product slugs',
    type: 'list',
    // Product slugs, in display order. An unknown slug is skipped rather than
    // rendering a broken card, so a typo costs a tile, not the section.
    default: [
      'canopy-tent-10x10', 'standard-retractable-banner', 'pleated-table-covers',
      'step-and-repeat-backdrop', 'x-stand-banner', 'table-top-banner-stand'
    ]
  },

  // Why choose us
  { key: 'home.why.title', label: 'Home — why choose us heading', default: 'Why choose Apex' },
  {
    key: 'home.why.items',
    label: 'Home — why choose us cards',
    type: 'list',
    // These are the trust badges already shown on the homepage. Editing them in
    // the CMS changes that row — it does not add a second section.
    default: [
      { icon: '🖨️', title: 'Dye-sublimated print', description: 'Ink bonded into the fabric — it will not crack, peel or fade.' },
      { icon: '📐', title: 'Free artwork proof', description: 'You approve a visual proof before anything goes to production.' },
      { icon: '🎯', title: 'One supplier, one brand', description: 'Canopy, banners, backdrop and table cover — printed to match.' },
      { icon: '💬', title: 'Real people on support', description: 'Talk to someone who knows trade show displays.' }
    ]
  },

  // Reviews. EMPTY BY DEFAULT AND MUST STAY THAT WAY until real, permissioned
  // reviews exist — see src/data/socialProof.js. The section renders only when
  // this list is non-empty, and no Review/AggregateRating schema is emitted.
  { key: 'home.reviews.title', label: 'Home — reviews heading', default: 'What customers say' },
  { key: 'home.reviews.items', label: 'Home — customer reviews (only publish genuine, permissioned reviews)', type: 'list', default: [] },

  // Footer
  { key: 'footer.blurb', label: 'Footer — blurb under the logo', default: '' },
  { key: 'footer.hours', label: 'Footer — customer service hours', default: '' },
  { key: 'footer.phone', label: 'Footer — phone', default: '' },
  { key: 'footer.email', label: 'Footer — email', default: '' }
);

// Fast lookup of a field's default by key.
const DEFAULTS = Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f.default]));

export function contentDefault(key) {
  return DEFAULTS[key] ?? '';
}

// Resolve a key against an override map, falling back to the default.
export function resolveContent(overrides, key) {
  const v = overrides?.[key];
  return v === undefined || v === null || v === '' ? contentDefault(key) : v;
}

// Resolve a LIST field. Falls back to the default array when the override is
// missing, unparseable or not an array — a malformed CMS value must never blank
// a homepage section.
export function resolveList(overrides, key) {
  const fallback = DEFAULTS[key];
  const raw = overrides?.[key];
  if (raw === undefined || raw === null || raw === '') return Array.isArray(fallback) ? fallback : [];
  let value = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); } catch { return Array.isArray(fallback) ? fallback : []; }
  }
  if (!Array.isArray(value)) return Array.isArray(fallback) ? fallback : [];
  return value;
}

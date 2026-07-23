// Editable site copy. Each entry is a stable key, its hardcoded DEFAULT, a label
// for the dashboard, and whether it's multiline. Components read these via
// useContent(key); the dashboard lists them for editing; an override in the DB
// wins over the default. Plain ESM (no React) so prerender can import it too.
//
// To make another string editable: add a key here and read it in the component
// with useContent('your.key'). Nothing else is required.

export const CONTENT_FIELDS = [
  // Home hero
  { key: 'home.hero.eyebrow', label: 'Home — hero eyebrow', default: 'Custom printed canopy tents' },
  { key: 'home.hero.title', label: 'Home — hero title', default: 'Your brand on a tent, priced before you ask.' },
  {
    key: 'home.hero.subtitle',
    label: 'Home — hero subtitle',
    multiline: true,
    default:
      'Choose the size, frame and how much of the canopy gets printed — the price updates as you go. ' +
      'No quote forms, no waiting on a sales rep. Free artwork proof on every order.'
  },
  // Home size section
  { key: 'home.sizes.title', label: 'Home — sizes heading', default: 'Start with a size' },
  {
    key: 'home.sizes.subtitle',
    label: 'Home — sizes subheading',
    default: 'Every size is printed to order. 10 × 10 is the standard vendor booth.'
  },
  // Closing band
  {
    key: 'home.cta.main',
    label: 'Home — closing headline',
    default: 'Most canopies ship in 6–8 business days after proof approval'
  },
  {
    key: 'home.cta.sub',
    label: 'Home — closing subtext',
    default: 'Need it sooner? Ask us about rush production before you order.'
  }
];

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

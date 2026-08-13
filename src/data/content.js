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
  { key: 'home.hero.title', label: 'Home — hero title', default: 'Build a trade show booth that gets noticed.' },
  {
    key: 'home.hero.subtitle',
    label: 'Home — hero subtitle',
    multiline: true,
    default:
      'Custom trade show displays, canopies, banners, backdrops, table covers and event branding — ' +
      'all from one supplier. Instant online pricing on canopies and a free artwork proof on every order.'
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

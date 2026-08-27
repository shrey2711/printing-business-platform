// Trade Show Booth Packages — an ADDITIONAL sales path.
//
// These are RECOMMENDED COMBINATIONS of existing individual products, not new
// SKUs and not discounted bundles. There is no package cart item and no package
// price: each component keeps its own product page, configurator, price and
// checkout. Customers can buy any single item on its own. This page must not
// replace individual purchasing or cannibalize the tent pages — it targets
// "complete booth / display kit" intent only.
//
// Shared by the React BoothPackagesPage and scripts/prerender.mjs so the
// crawlable HTML and the app match. Component names/prices are resolved from the
// real product catalog at render time (no duplicated product data here).

export const BOOTH_PACKAGES_META = {
  slug: 'trade-show-booth-packages',
  nav: 'Booth Packages',
  h1: 'Trade Show Booth Packages',
  title: 'Trade Show Booth Packages — Complete Kits',
  description:
    'Build a complete trade show booth from Apex — packages combining canopy tents, banner stands, table covers and backdrops, or buy any product individually.'
};

// Each package references EXISTING product slugs. No prices invented here.
export const BOOTH_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Booth',
    tagline: 'A branded canopy and a matching table cover — the essentials for a market or first show.',
    components: ['canopy-tent-10x10', 'pleated-table-covers'],
    bestFor: 'Weekend markets, fairs and vendors doing their first few shows.'
  },
  {
    id: 'popular',
    name: 'Popular Booth',
    tagline: 'Canopy, table cover and a retractable banner to pull people in from the aisle.',
    components: ['canopy-tent-10x10', 'pleated-table-covers', 'standard-retractable-banner'],
    bestFor: 'Outdoor expos and multi-day events that need aisle presence.'
  },
  {
    id: 'indoor',
    name: 'Indoor Expo Booth',
    tagline: 'A step & repeat backdrop, stretch table cover and a deluxe banner for indoor halls.',
    components: ['step-and-repeat-backdrop', 'stretch-table-covers', 'deluxe-retractable-banner'],
    bestFor: 'Convention-center booths and press / photo walls, where no tent is needed indoors.'
  },
  {
    id: 'complete',
    name: 'Complete Event Booth',
    tagline: 'The full setup — canopy, table cover, banner stand and backdrop, all printed to match.',
    components: ['canopy-tent-10x20', 'stretch-table-covers', 'deluxe-retractable-banner', 'step-and-repeat-backdrop'],
    bestFor: 'Brands that want a polished, fully branded booth at bigger shows.'
  }
];

// Prominent links back to individual purchasing — required so no one is forced
// into a combination.
export const SHOP_INDIVIDUALLY = [
  { label: 'Shop Canopies Individually', to: '/custom-canopies' },
  { label: 'Shop Banner Stands', to: '/banner-stands' },
  { label: 'Shop Table Covers', to: '/table-covers' },
  { label: 'Shop Backdrops', to: '/backdrops' }
];

export const BOOTH_USE_CASES = [
  'Weekend markets and street fairs',
  'Outdoor festivals and sporting events',
  'Indoor trade shows and convention halls',
  'Conferences, press events and brand activations'
];

export const BOOTH_FAQS = [
  {
    q: 'Do I have to buy a whole package?',
    a: 'No. Every product is sold individually — buy a single canopy tent, one banner stand, one table cover or one backdrop on its own. The packages are only recommended combinations to make planning a full booth easier.'
  },
  {
    q: 'Are packages cheaper than buying the items separately?',
    a: 'Packages are priced as their individual products — each item keeps its own price and configuration, and there is no separate bundle price. For a large or multi-item order, request a quote and we will price the whole booth for you.'
  },
  {
    q: 'Can I mix and match different sizes or products?',
    a: 'Yes. Use a package as a starting point, then swap any item — a larger canopy, a stretch cover instead of pleated, an extra banner — by configuring each product on its own page.'
  },
  {
    q: 'How do I order a complete booth?',
    a: 'Add each product to your cart from its own page, or request a quote listing everything you need and we will put together pricing and a free artwork proof for the whole booth.'
  }
];

// Distinct component slugs across all packages — used for the ItemList schema
// and the "products in these packages" links.
export const BOOTH_COMPONENT_SLUGS = [
  ...new Set(BOOTH_PACKAGES.flatMap((p) => p.components))
];

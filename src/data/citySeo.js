// City × category local SEO landing pages (from Apex_Trade_Show_US_City_SEO_Keywords.xlsx).
//
// URL structure: /trade-show-canopies/[city], /trade-show-displays/[city],
// /banner-stands/[city]. These are the CANONICAL local pages (option A): the old
// /locations/[state]/[city] canopy pages 301 into /trade-show-canopies/[city].
//
// Anti-thin-page discipline: Tier 1 cities are indexed and carry unique local
// content (real convention-center + local-scene facts, public information — no
// invented Apex specifics). Tier 2/3 are built but noindex,follow until they
// earn deeper content, the same gate used for the existing location pages.

export const LOCAL_CATEGORIES = [
  {
    key: 'canopies',
    slug: 'trade-show-canopies',
    label: 'Trade Show Canopies',
    hub: '/custom-canopies',
    hubLabel: 'Custom Canopies',
    productCats: ['tents'],
    // framing sentence, {city}/{venue}/{scene} filled per city
    lead: (c) =>
      `Custom printed pop-up canopy tents for trade shows and outdoor activations in ${c.city}. From sponsor villages and parking-lot booths outside ${c.venue} to street festivals across ${c.city}, a branded canopy gives your booth the same presence outdoors as the hall inside.`
  },
  {
    key: 'displays',
    slug: 'trade-show-displays',
    label: 'Trade Show Displays',
    hub: '/trade-show-displays',
    hubLabel: 'Trade Show Displays',
    productCats: ['banner-stands', 'backdrops', 'table-covers'],
    lead: (c) =>
      `Complete trade show displays in ${c.city} — retractable banner stands, step & repeat backdrops and printed table covers for your booth at ${c.venue}. One supplier prints the whole booth in your brand, shipped to ${c.city}.`
  },
  {
    key: 'banner-stands',
    slug: 'banner-stands',
    label: 'Banner Stands',
    hub: '/banner-stands',
    hubLabel: 'Banner Stands',
    productCats: ['banner-stands'],
    lead: (c) =>
      `Custom retractable and X-stand banner stands in ${c.city} — portable, printed displays for aisles, entrances and counters at ${c.venue} and events across ${c.city}.`
  },
  {
    key: 'backdrops',
    slug: 'trade-show-backdrops',
    label: 'Trade Show Backdrops',
    hub: '/backdrops',
    hubLabel: 'Backdrops',
    productCats: ['backdrops'],
    lead: (c) =>
      `Step & repeat backdrops and tension-fabric display walls for ${c.city} exhibitors — a clean branded wall behind your booth at ${c.venue}, or a media wall for press and photos. Printed to order and shipped to ${c.city}.`
  },
  {
    key: 'table-covers',
    slug: 'table-covers',
    label: 'Trade Show Table Covers',
    hub: '/table-covers',
    hubLabel: 'Table Covers',
    productCats: ['table-covers'],
    lead: (c) =>
      `Fitted and pleated table covers printed in your brand colors for ${c.city} booths and events. Turn a rented table at ${c.venue} into finished brand space — made to order and shipped to your ${c.city} address.`
  }
];

// Indexing gate (prerender): tier 1-2 = indexed with unique content; tier 3 =
// noindex,follow until it earns unique depth. venue/scene are public facts.
//
// `tier` and `priority` are DIFFERENT things and must not be conflated:
//   tier     — indexability. tier > 2 renders noindex and drops the page from
//              the sitemap. Never raise a tier to express scheduling.
//   priority — the owner's rollout order (1 = first wave, 3 = last, 0 = the
//              Seattle master). Editorial sequencing only; it changes nothing
//              about how a page is rendered or indexed.
export const SEO_CITIES = [
  { slug: 'las-vegas', city: 'Las Vegas', abbr: 'NV', stateName: 'Nevada', stateSlug: 'nevada', tier: 1, priority: 1, venue: 'the Las Vegas Convention Center, Mandalay Bay and Caesars Forum', scene: 'the busiest trade-show city in the country, home to CES and hundreds of expos a year' },
  { slug: 'orlando', city: 'Orlando', abbr: 'FL', stateName: 'Florida', stateSlug: 'florida', tier: 1, priority: 1, venue: 'the Orange County Convention Center', scene: 'one of the largest convention venues in the United States' },
  { slug: 'chicago', city: 'Chicago', abbr: 'IL', stateName: 'Illinois', stateSlug: 'illinois', tier: 1, priority: 1, venue: 'McCormick Place', scene: 'the largest convention center in North America' },
  { slug: 'atlanta', city: 'Atlanta', abbr: 'GA', stateName: 'Georgia', stateSlug: 'georgia', tier: 1, priority: 1, venue: 'the Georgia World Congress Center', scene: 'AmericasMart and major national trade shows' },
  { slug: 'new-york', city: 'New York', h1City: 'New York City', abbr: 'NY', stateName: 'New York', stateSlug: 'new-york', tier: 1, priority: 1, venue: 'the Javits Center', scene: "the East Coast's flagship expo venue" },
  { slug: 'dallas', city: 'Dallas', abbr: 'TX', stateName: 'Texas', stateSlug: 'texas', tier: 1, priority: 1, venue: 'the Kay Bailey Hutchison Convention Center', scene: 'the Dallas Market Center and year-round trade shows' },
  { slug: 'los-angeles', city: 'Los Angeles', abbr: 'CA', stateName: 'California', stateSlug: 'california', tier: 1, priority: 1, venue: 'the Los Angeles Convention Center', scene: 'entertainment, tech and lifestyle expos' },
  { slug: 'houston', city: 'Houston', abbr: 'TX', stateName: 'Texas', stateSlug: 'texas', tier: 1, priority: 2, venue: 'the George R. Brown Convention Center', scene: 'energy, medical and industrial trade shows' },
  { slug: 'san-francisco', city: 'San Francisco', abbr: 'CA', stateName: 'California', stateSlug: 'california', tier: 1, priority: 2, venue: 'the Moscone Center', scene: 'Dreamforce, GDC and RSA Conference in SoMa' },
  { slug: 'seattle', city: 'Seattle', abbr: 'WA', stateName: 'Washington', stateSlug: 'washington', tier: 1, priority: 0, venue: 'the Seattle Convention Center', scene: 'PAX West and Pacific Northwest technology shows' },
  { slug: 'nashville', city: 'Nashville', abbr: 'TN', stateName: 'Tennessee', stateSlug: 'tennessee', tier: 1, priority: 3, venue: 'the Music City Center', scene: 'healthcare, music and hospitality conventions' },
  { slug: 'indianapolis', city: 'Indianapolis', abbr: 'IN', stateName: 'Indiana', stateSlug: 'indiana', tier: 1, priority: 3, venue: 'the Indiana Convention Center', scene: 'Gen Con, the PRI Show and the FFA Convention' },
  { slug: 'charlotte', city: 'Charlotte', abbr: 'NC', stateName: 'North Carolina', stateSlug: 'north-carolina', tier: 1, priority: 3, venue: 'the Charlotte Convention Center', scene: 'NASCAR, banking and energy-sector events' },
  { slug: 'denver', city: 'Denver', abbr: 'CO', stateName: 'Colorado', stateSlug: 'colorado', tier: 1, priority: 2, venue: 'the Colorado Convention Center', scene: 'outdoor, aerospace and technology trade shows' },
  { slug: 'phoenix', city: 'Phoenix', abbr: 'AZ', stateName: 'Arizona', stateSlug: 'arizona', tier: 1, priority: 3, venue: 'the Phoenix Convention Center', scene: 'Southwest expos and events' },
  { slug: 'new-orleans', city: 'New Orleans', abbr: 'LA', stateName: 'Louisiana', stateSlug: 'louisiana', tier: 1, priority: 3, venue: 'the Ernest N. Morial Convention Center', scene: 'one of the largest convention centers in the country' },

  { slug: 'miami', city: 'Miami', abbr: 'FL', stateName: 'Florida', stateSlug: 'florida', tier: 2, priority: 2, venue: 'the Miami Beach Convention Center', scene: 'Art Basel and international expos' },
  { slug: 'baltimore', city: 'Baltimore', abbr: 'MD', stateName: 'Maryland', stateSlug: 'maryland', tier: 2, venue: 'the Baltimore Convention Center', scene: 'East Coast conventions' },
  { slug: 'anaheim', city: 'Anaheim', abbr: 'CA', stateName: 'California', stateSlug: 'california', tier: 2, venue: 'the Anaheim Convention Center', scene: 'the largest exhibit space on the West Coast' },
  { slug: 'washington-dc', city: 'Washington, D.C.', h1City: 'Washington, DC', abbr: 'DC', stateName: 'District of Columbia', stateSlug: null, tier: 2, priority: 3, venue: 'the Walter E. Washington Convention Center', scene: 'national association and government expos' },
  { slug: 'philadelphia', city: 'Philadelphia', abbr: 'PA', stateName: 'Pennsylvania', stateSlug: 'pennsylvania', tier: 2, venue: 'the Pennsylvania Convention Center', scene: 'Northeast trade shows' },
  { slug: 'san-diego', city: 'San Diego', abbr: 'CA', stateName: 'California', stateSlug: 'california', tier: 2, priority: 2, venue: 'the San Diego Convention Center', scene: 'Comic-Con and biotech expos' },
  { slug: 'boston', city: 'Boston', abbr: 'MA', stateName: 'Massachusetts', stateSlug: 'massachusetts', tier: 2, priority: 2, venue: 'the Boston Convention & Exhibition Center', scene: 'biotech, medical and technology conferences' },

  { slug: 'san-antonio', city: 'San Antonio', abbr: 'TX', stateName: 'Texas', stateSlug: 'texas', tier: 2, venue: 'the Henry B. González Convention Center', scene: 'Texas conventions and events' }
];

// §7 SEO title for the "Trade Show Displays" city page: a descriptive suffix
// instead of the brand, fit-descending so long city names stay within ~60 chars.
// Shared by the prerenderer and the client CityCategoryPage for exact parity.
export const cityDisplaysTitle = (city) => {
  // use the same display name as the H1 so the SERP title and the page agree
  const base = `Trade Show Displays in ${city.h1City || city.city}`;
  for (const suffix of [' | Custom Booths & Event Displays', ' | Custom Booths & Displays', ' | Booths & Event Displays', ' | Booths & Displays']) {
    if ((base + suffix).length <= 62) return base + suffix;
  }
  return base;
};

// §8 meta description for a city × category page: unique per city, ~140–160
// chars, communicating the product, instant pricing, free proof and US shipping.
// Falls back to a shorter form for long label+city combos so it stays <=165.
export const cityCatDescription = (label, city) => {
  const L = label.toLowerCase();
  const full = `Custom ${L} for ${city.city} trade shows and events — printed to order with instant online pricing, a free artwork proof, and US shipping.`;
  if (full.length <= 165) return full;
  return `Custom ${L} for ${city.city} trade shows — printed to order with instant online pricing, a free artwork proof, and US shipping.`;
};

// §23 breadcrumb: Home → Locations → State → {label} in {City} (location
// hierarchy). All URLs are real (/locations, /locations/{state} state pages).
// Returns [{ name, url }] with RELATIVE urls; callers make them absolute. DC has
// no stateSlug, so the state level is omitted for it.
export const cityBreadcrumb = (label, slug, city) => {
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/locations' }
  ];
  if (city.stateSlug) crumbs.push({ name: city.stateName, url: `/locations/${city.stateSlug}` });
  crumbs.push({ name: `${label} in ${city.city}`, url: `/${slug}/${city.slug}` });
  return crumbs;
};

// §3 H1 display name: "City, ABBR", never redundant or double-punctuated.
// `h1City` overrides the prose name where the H1 wants the fuller local form
// (New York City, NY) or a different punctuation (Washington, DC). Exported so
// the prerenderer and the client component cannot drift apart.
export const cityWithAbbr = (c) => {
  const name = c.h1City || c.city;
  return (/[.]$/.test(name) || name.includes(c.abbr)) ? name : `${name}, ${c.abbr}`;
};

export const getSeoCity = (slug) => SEO_CITIES.find((c) => c.slug === slug) || null;
export const getLocalCategory = (key) => LOCAL_CATEGORIES.find((c) => c.key === key) || null;
export const getLocalCategoryBySlug = (slug) => LOCAL_CATEGORIES.find((c) => c.slug === slug) || null;

// Unique, factual per-state content for priority markets (P5). Used by both the
// React location page and the prerenderer so the crawlable HTML and the app
// match. NO invented shipping times, warehouses, offices or statistics — just
// genuine, differentiated context about where custom canopy tents get used.
//
// Priority states are indexed with this richer content; every other state /
// province is noindex'd (thin, templated) until it earns unique content.

export const PRIORITY_STATES = new Set([
  'california', 'texas', 'florida', 'new-york',
  'arizona', 'nevada', 'washington', 'illinois', 'georgia', 'north-carolina'
]);

export const stateContent = {
  california: {
    intro:
      'California runs one of the busiest outdoor-event calendars in the country — year-round farmers markets, beach festivals, food-truck rallies and trade shows from San Diego to the Bay Area. A custom printed canopy tent turns a plain booth into a branded storefront that reads from across a crowded lot.',
    events: ['Farmers markets & street fairs', 'Beach and boardwalk pop-ups', 'Tech & startup expos', 'Food-truck and wine events']
  },
  texas: {
    intro:
      'From Austin festival grounds to Houston trade halls and Dallas market weekends, Texas events run big and outdoors. A full-colour canopy with printed walls gives vendors, teams and contractors shade plus a booth that stands out in wide open show fields.',
    events: ['Rodeos & county fairs', 'BBQ and food festivals', 'High-school & college sports', 'Home & trade expos']
  },
  florida: {
    intro:
      "Florida's outdoor season never really stops — beachfront markets, sports tournaments, boat shows and festivals run all year. Dye-sublimated canopies hold their colour in strong sun, so a Florida booth looks as sharp in month six as day one.",
    events: ['Beach & waterfront markets', 'Sports tournaments', 'Boat and outdoor shows', 'Community festivals']
  },
  'new-york': {
    intro:
      'New York packs a dense event calendar into tight footprints — street fairs across the boroughs, upstate festivals, farmers markets and campus expos. A 10x10 or 10x20 printed canopy claims a professional presence even in a crowded row of vendors.',
    events: ['Borough street fairs', 'Farmers greenmarkets', 'Campus & career expos', 'Upstate festivals']
  },
  arizona: {
    intro:
      'Arizona events live in the sun — Phoenix and Tucson markets, spring-training crowds and desert festivals. Shade is not optional, and a printed canopy delivers it while doing double duty as branding that reads across a bright open lot.',
    events: ['Spring training & sports', 'Desert festivals', 'Farmers & artisan markets', 'Outdoor expos']
  },
  nevada: {
    intro:
      'Nevada means trade shows and events at scale — Las Vegas convention overflow, outdoor expos and festival grounds. A custom canopy extends indoor booth branding to outdoor and entrance space, keeping a consistent look across the whole show.',
    events: ['Convention & trade-show overflow', 'Outdoor expos', 'Festivals & concerts', 'Sports & tailgates']
  },
  washington: {
    intro:
      'Washington vendors work rain or shine — Seattle markets, Cascade festivals and campus events. A printed canopy with side walls gives real weather cover while turning the booth into a branded, photo-ready backdrop.',
    events: ['Public markets (rain-ready)', 'Music & arts festivals', 'Campus & tech events', 'Farmers markets']
  },
  illinois: {
    intro:
      'From Chicago neighbourhood fests to Illinois county fairs and lakefront markets, the Midwest event season is short and busy. A custom canopy makes each weekend count with a booth that photographs well and packs down fast between shows.',
    events: ['Neighbourhood street fests', 'County & state fairs', 'Lakefront markets', 'Trade & home shows']
  },
  georgia: {
    intro:
      'Georgia hosts everything from Atlanta expos to small-town festivals and SEC tailgates. A printed canopy — team colours on top, logo on the back wall — anchors a booth or tailgate spot that people can find in a packed field.',
    events: ['College football tailgates', 'City festivals', 'Farmers & craft markets', 'Trade expos']
  },
  'north-carolina': {
    intro:
      'North Carolina runs a strong mix of craft fairs, ACC sports, mountain and coastal festivals. A dye-sublimated canopy handles humidity and sun without fading, so a booth looks consistent across a full season of events.',
    events: ['Craft & artisan fairs', 'ACC sports & tailgates', 'Mountain & coastal festivals', 'Farmers markets']
  }
};

// Shared, non-fabricated sections reused across priority state pages.
export const ORDERING_STEPS = [
  'Pick your size (10x10, 10x15 or 10x20) and configure walls, delivery speed and quantity — the price updates live.',
  'Upload print-ready artwork, or add our design service and we build it for you.',
  'Approve the free proof we send — nothing prints until you say yes.',
  'We print with dye sublimation and ship it to you.'
];

// Factual reference sections shared across state pages. These are genuine
// buying guidance (not invented local claims); the unique intro + events above
// carry each state's local signal.
export const SIZE_COMPARISON = [
  ['10x10', '100 sq ft — a single vendor booth. The most portable size and the easiest for one or two people to set up.'],
  ['10x15', '150 sq ft — about 50% more frontage than a 10×10, for two front tables or a bigger product display.'],
  ['10x20', '200 sq ft — a full double booth or walk-through layout, the widest single-canopy span most shows allow.']
];

export const OUTDOOR_CONSIDERATIONS = [
  'Always anchor the frame — weight bags on hard surfaces, stakes on grass. Open lots and waterfronts get gusty fast.',
  'Dye-sublimation printing bonds the ink into the fabric, so colours hold up under strong, repeated sun exposure.',
  'Add full or half walls on the windward side for shade and wind protection while keeping the front open.',
  'Choose standard 6–8 day production, or 2–3 day rush if your event date is close.'
];

export const ARTWORK_NOTES = [
  'Send a print-ready vector file (PDF, AI or EPS) or a high-resolution PNG/JPG — logos, full-colour backgrounds and photos all print.',
  'You can print the canopy top, the valance and the walls; each is a separate branding surface.',
  'No print-ready file? Add our design service and we build the artwork for you.',
  'Every order includes a free visual proof — nothing goes to production until you approve it.'
];

export const STATE_FAQS = [
  ['How long does a custom canopy tent take?', 'Standard production is 6–8 business days after you approve the proof, with an optional 2–3 day rush.'],
  ['Can I print my logo on the tent?', 'Yes — full-colour dye sublimation on the top, valance and walls. Send your logo or full artwork.'],
  ['How many walls can I add?', 'Up to 3 printed walls in any mix of full-height and half-height; both cost the same per wall.'],
  ['Do you offer bulk pricing?', 'Yes — order 3 or more tents and volume pricing applies automatically as you increase the quantity.']
];

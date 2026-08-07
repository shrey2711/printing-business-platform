// Unique, factual per-city content for priority cities (P6). Shared by the React
// city page and the prerenderer. NO invented stats, warehouses, offices or
// hard weather claims — just genuine local event context. Priority cities are
// indexed with this content; every other city stays noindex.

// Tight, defensible shortlist of indexed city pages (13). Every other city —
// including the ones with content below that aren't in this set — stays
// noindex, so we never expose hundreds of near-identical city URLs.
export const PRIORITY_CITIES = new Set([
  'los-angeles', 'san-diego', 'san-francisco', 'houston', 'dallas', 'austin',
  'miami', 'orlando', 'new-york-city', 'las-vegas', 'seattle',
  'vancouver', 'toronto', 'calgary', 'montreal'
]);

export const cityContent = {
  'los-angeles': {
    intro: 'Los Angeles vendors work markets, film-adjacent pop-ups, sports crowds and street festivals across a huge, spread-out city. A printed canopy has to read from a distance in bright sun — dye sublimation keeps colour sharp all season.',
    events: ['Weekend markets & swap meets', 'Sports & stadium lots', 'Street festivals', 'Brand activations']
  },
  'san-diego': {
    intro: 'San Diego runs beachfront markets, festivals and tournaments nearly year-round. A canopy with side walls gives shade and wind cover for coastal booths while doubling as branding.',
    events: ['Beach & bay markets', 'Sports tournaments', 'Craft beer & food events', 'Community festivals']
  },
  'san-francisco': {
    intro: 'From Ferry Building-area markets to tech showcases and neighbourhood fairs, San Francisco events pack into tight footprints. A clean 10x10 or 10x20 claims a professional booth even in a dense vendor row.',
    events: ['Farmers markets', 'Tech & startup showcases', 'Neighbourhood street fairs', 'Pride & cultural festivals']
  },
  houston: {
    intro: 'Houston hosts large outdoor markets, rodeo-season events and trade expos. Wide show fields reward a bold printed top and a back wall that anchors the booth.',
    events: ['Rodeo & fair season', 'Food & culture festivals', 'Trade & home expos', 'Sports tailgates']
  },
  dallas: {
    intro: 'Dallas-Fort Worth runs a busy calendar of markets, state-fair-season events and corporate expos. A matching set of canopies keeps a multi-booth presence consistent across a big show.',
    events: ['State fair season', 'Corporate & trade expos', 'Farmers & artisan markets', 'Sports events']
  },
  austin: {
    intro: 'Austin is festival country — music, food and tech events fill the calendar, much of it outdoors. A photo-ready printed canopy earns its place in a city where booths compete for attention.',
    events: ['Music & film festivals', 'Food-truck & market events', 'Tech showcases', 'Campus events']
  },
  miami: {
    intro: 'Miami events run outdoors and in strong sun — art fairs, beachfront markets and cultural festivals. Dye-sublimated canopies hold saturated colour without fading through a full season.',
    events: ['Art & design fairs', 'Beachfront markets', 'Cultural festivals', 'Sports & boat events']
  },
  orlando: {
    intro: 'Orlando pairs tourism traffic with markets, conventions and sports tournaments. A branded canopy extends booth presence to outdoor and entrance space around big venues.',
    events: ['Convention overflow', 'Sports tournaments', 'Farmers markets', 'Community festivals']
  },
  'new-york-city': {
    intro: 'New York City street fairs, greenmarkets and campus expos happen in tight, crowded rows. A crisp printed canopy makes a small footprint look established and easy to find.',
    events: ['Borough street fairs', 'Greenmarkets', 'Campus & career expos', 'Cultural festivals']
  },
  phoenix: {
    intro: 'Phoenix events live in the sun — markets, spring-training crowds and desert festivals. Shade is essential, and a printed canopy delivers it while branding the booth across a bright lot.',
    events: ['Spring training', 'Desert festivals', 'Farmers & artisan markets', 'Outdoor expos']
  },
  'las-vegas': {
    intro: 'Las Vegas is trade-show territory at scale. A custom canopy carries indoor booth branding out to outdoor and entrance areas, keeping one consistent look across the whole event.',
    events: ['Trade-show overflow', 'Outdoor expos', 'Festivals & concerts', 'Sports & tailgates']
  },
  seattle: {
    intro: 'Seattle vendors work rain or shine — public markets, festivals and campus events. A canopy with full side walls gives real weather cover and a branded backdrop in one.',
    events: ['Public markets (rain-ready)', 'Music & arts festivals', 'Tech & campus events', 'Farmers markets']
  },
  chicago: {
    intro: 'Chicago packs a short, intense outdoor season with neighbourhood fests, lakefront markets and trade shows. A canopy that photographs well and packs down fast makes every summer weekend count.',
    events: ['Neighbourhood street fests', 'Lakefront markets', 'Trade & home shows', 'Sports tailgates']
  },
  atlanta: {
    intro: 'Atlanta mixes big expos with city festivals and SEC-season tailgates. Team colours on the top and a logo on the back wall make a booth or tailgate easy to spot in a packed field.',
    events: ['College football tailgates', 'City festivals', 'Farmers & craft markets', 'Trade expos']
  },
  charlotte: {
    intro: 'Charlotte runs craft fairs, motorsports-adjacent events and regional festivals. A dye-sublimated canopy handles humidity and sun so a booth looks consistent across a full season.',
    events: ['Craft & artisan fairs', 'Motorsports & sports events', 'Regional festivals', 'Farmers markets']
  },
  vancouver: {
    intro: 'Vancouver vendors work rain or shine — public and farmers markets, waterfront festivals and neighbourhood events across the Lower Mainland. A canopy with printed side walls gives real weather cover and a branded backdrop through a damp, busy market season.',
    events: ['Public & farmers markets', 'Waterfront & park festivals', 'Night markets', 'Community & cultural events']
  },
  toronto: {
    intro: 'Toronto runs a dense event calendar — street festivals across the city, waterfront markets, cultural events and consumer shows. A crisp printed canopy claims a professional booth in a crowded vendor row and packs down fast between weekend events.',
    events: ['Street & neighbourhood festivals', 'Waterfront & park markets', 'Cultural & food events', 'Trade & consumer shows']
  },
  calgary: {
    intro: 'Calgary events run big and outdoors — Stampede-season crowds, city festivals, farmers markets and trade expos. A printed canopy with a back wall stands up to wind off the foothills while branding the booth across open grounds.',
    events: ['Stampede & rodeo events', 'City festivals', 'Farmers & artisan markets', 'Trade & home expos']
  },
  montreal: {
    intro: "Montreal's festival season fills the calendar — street festivals, public markets and cultural events across the city. A full-colour printed canopy claims a professional, photo-ready booth in a crowded, lively vendor row.",
    events: ['Street & music festivals', 'Public & farmers markets', 'Cultural & food events', 'Trade & consumer shows']
  }
};

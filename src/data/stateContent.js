// Unique, factual per-state content for priority markets (P5). Used by both the
// React location page and the prerenderer so the crawlable HTML and the app
// match. NO invented shipping times, warehouses, offices or statistics — just
// genuine, differentiated context about where custom canopy tents get used.
//
// Priority states are indexed with this richer content; every other state /
// province is noindex'd (thin, templated) until it earns unique content.

// PRIORITY_STATES (the indexed set) is derived from stateContent below — every
// state/province now has unique content, so all are indexed. Defined after
// stateContent so it can read its keys.

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
  },
  'british-columbia': {
    intro:
      'British Columbia vendors work rain or shine — Lower Mainland and Island public markets, waterfront festivals and outdoor events from Vancouver to Victoria and the Okanagan. A canopy with printed side walls gives real weather cover and a branded backdrop through a wet, busy market season.',
    events: ['Public & farmers markets', 'Waterfront & park festivals', 'Night markets', 'Okanagan wine & food events']
  },
  ontario: {
    intro:
      'Ontario runs a dense event calendar across Toronto, Ottawa and the surrounding cities — street festivals, waterfront markets, cultural events and consumer shows. A crisp printed canopy claims a professional booth in a crowded vendor row and packs down fast between weekends.',
    events: ['City street festivals', 'Farmers & waterfront markets', 'Cultural & food events', 'Trade & consumer shows']
  },
  alberta: {
    intro:
      'Alberta pairs big outdoor events with a strong fair and rodeo season — Calgary and Edmonton festivals, Stampede-season crowds, farmers markets and trade expos. A bold printed top and a back wall anchor a booth or hospitality tent on wide, open grounds.',
    events: ['Stampede & rodeo season', 'City festivals', 'Farmers & artisan markets', 'Trade & home expos']
  },
  quebec: {
    intro:
      "Quebec's calendar is packed with festivals and markets — Montreal and Quebec City street events, public markets and cultural celebrations through the warmer months. A full-colour printed canopy makes a booth stand out in a lively, crowded festival setting.",
    events: ['Montreal & Quebec City festivals', 'Public & farmers markets', 'Cultural celebrations', 'Trade & consumer shows']
  },

  // ── Northeast ──
  connecticut: {
    intro:
      'Connecticut packs a dense calendar of town-green fairs, coastal festivals and farmers markets from Hartford and New Haven to the Stamford and Bridgeport shoreline. A printed canopy gives a market vendor or exhibitor a branded storefront that reads across a crowded New England green.',
    events: ['Town-green fairs & festivals', 'Shoreline & coastal events', 'Farmers markets', 'Corporate & campus expos']
  },
  delaware: {
    intro:
      'From Wilmington and Dover to the Rehoboth-area beach towns, Delaware’s tax-free events, boardwalk pop-ups and community fairs draw steady summer crowds. A custom canopy turns a small-state booth into a clear, branded stop on a busy boardwalk or market row.',
    events: ['Beach & boardwalk pop-ups', 'Community & town fairs', 'Farmers markets', 'Festivals & craft shows']
  },
  maine: {
    intro:
      'Maine’s short, busy season fills Portland, Lewiston and Bangor with seafood festivals, coastal fairs and farmers markets, plus a strong fall craft and foliage circuit. A dye-sublimated canopy stands up to coastal wind and damp while keeping your booth sharply on-brand.',
    events: ['Seafood & coastal festivals', 'Farmers & craft markets', 'Fall foliage & harvest fairs', 'Community events']
  },
  maryland: {
    intro:
      'Maryland’s waterfront calendar runs from Baltimore’s Inner Harbor to Annapolis and Frederick — crab feasts, Chesapeake festivals and town street fairs all summer. A printed canopy anchors your booth on a busy waterfront and photographs well against the harbor.',
    events: ['Waterfront & harbor festivals', 'Crab feasts & food events', 'Street fairs', 'Farmers markets']
  },
  massachusetts: {
    intro:
      'Boston, Worcester, Springfield and Cambridge give Massachusetts a mix of university expos, biotech shows and classic New England town-common fairs. A branded canopy works as well at a campus activation as it does at a summer market on the common.',
    events: ['University & biotech expos', 'Town-common fairs', 'Farmers markets', 'Seasonal festivals']
  },
  'new-hampshire': {
    intro:
      'New Hampshire’s no-sales-tax shopping events, fall foliage fairs and outdoor craft markets keep Manchester, Nashua and Concord busy through the warmer months. A weather-ready printed canopy holds up on a breezy fairground while marking your booth clearly.',
    events: ['Craft & harvest fairs', 'Fall foliage events', 'Farmers markets', 'Community festivals']
  },
  'new-jersey': {
    intro:
      'From the Jersey Shore boardwalks to Newark, Jersey City and Atlantic City, New Jersey’s dense population fuels flea markets, shore festivals and street fairs all season. A custom canopy pulls traffic on a packed boardwalk and defines your space in a crowded lot.',
    events: ['Shore & boardwalk festivals', 'Flea & street markets', 'Community fairs', 'Consumer & trade shows']
  },
  pennsylvania: {
    intro:
      'Pennsylvania spans Philadelphia and Pittsburgh street fairs, Harrisburg farm shows and the market towns of Amish country and the Lehigh Valley. A printed canopy suits everything from an urban festival to a rural farm show or a stadium tailgate.',
    events: ['Street fairs & festivals', 'Farm & agricultural shows', 'Farmers markets', 'Sports tailgates']
  },
  'rhode-island': {
    intro:
      'Compact and coastal, Rhode Island concentrates its scene in Providence, Warwick and Cranston — WaterFire nights, seafood festivals and dense summer markets. A branded canopy makes a small booth stand out at a busy waterfront event.',
    events: ['Seafood & coastal festivals', 'WaterFire & downtown events', 'Farmers markets', 'Craft fairs']
  },
  vermont: {
    intro:
      'Vermont’s farmers markets, maple and craft fairs and foliage-season events keep Burlington, Montpelier and Rutland busy from spring through fall. A dye-sublimated canopy gives a local maker a clean, branded booth that fits Vermont’s market culture.',
    events: ['Farmers & maker markets', 'Maple & craft fairs', 'Foliage-season events', 'Community festivals']
  },
  'washington-dc': {
    intro:
      'Washington, D.C. hosts national festivals, activations and conventions year-round, from events near the Mall to association trade shows across the district. A branded canopy or booth display gives your organization a professional, on-brand presence at high-profile events.',
    events: ['National festivals & activations', 'Association trade shows', 'Farmers & street markets', 'Conferences & expos']
  },

  // ── South ──
  alabama: {
    intro:
      'Alabama runs a warm-weather calendar of Gulf Coast festivals in Mobile, football tailgates statewide and city markets in Birmingham, Montgomery and Huntsville. A dye-sublimated canopy handles the heat and humidity while keeping your booth branded from across the lot.',
    events: ['Gulf Coast & Mardi Gras festivals', 'Football tailgates', 'Farmers markets', 'Community fairs']
  },
  arkansas: {
    intro:
      'From Little Rock to Fayetteville’s Razorback crowds and Fort Smith, Arkansas fills its calendar with outdoor festivals, farmers markets and college events. A printed canopy turns a plain booth into a branded stop at a busy Ozark-region market or game day.',
    events: ['Outdoor festivals', 'College & game-day events', 'Farmers markets', 'Craft & county fairs']
  },
  kentucky: {
    intro:
      'Kentucky’s horse country and bourbon trail drive Derby-season events, festivals and county fairs around Louisville and Lexington. A custom canopy gives vendors and sponsors a polished, branded presence at high-traffic Kentucky events.',
    events: ['Derby & horse-country events', 'Bourbon & food festivals', 'County fairs', 'Farmers markets']
  },
  louisiana: {
    intro:
      'Louisiana’s festival culture is second to none — Mardi Gras and Jazz Fest in New Orleans, plus events across Baton Rouge, Lafayette and Shreveport. A dye-sublimated canopy stands up to Gulf heat and humidity while making your booth pop in a lively crowd.',
    events: ['Mardi Gras & festivals', 'Food & music events', 'Farmers markets', 'Fairs & crawfish boils']
  },
  mississippi: {
    intro:
      'Mississippi’s Gulf Coast festivals, blues-heritage events and county fairs keep Jackson, Gulfport and the DeSoto County area busy in the warm season. A printed canopy handles coastal sun and marks your booth clearly at a crowded festival.',
    events: ['Gulf Coast festivals', 'Blues & heritage events', 'County fairs', 'Farmers markets']
  },
  oklahoma: {
    intro:
      'Rodeos, the state fair and outdoor festivals fill Oklahoma City, Tulsa and Norman’s calendar — often on windy open fairgrounds where weights matter. A heavy-duty printed canopy stays anchored and on-brand in Oklahoma’s open-plains conditions.',
    events: ['Rodeos & state fair', 'Outdoor festivals', 'Farmers markets', 'College & game-day events']
  },
  'south-carolina': {
    intro:
      'South Carolina’s coast drives Charleston food festivals, Myrtle Beach events and Greenville and Columbia markets through a long warm season. A dye-sublimated canopy handles Lowcountry heat while giving tourists a clear, branded booth to find.',
    events: ['Coastal & beach festivals', 'Food & culture events', 'Farmers markets', 'Craft fairs']
  },
  tennessee: {
    intro:
      'Tennessee pairs Nashville’s music festivals and Memphis BBQ with Knoxville and Chattanooga fairs and markets. A printed canopy gives a vendor or sponsor a branded stage-side presence at some of the South’s busiest events.',
    events: ['Music & BBQ festivals', 'Farmers markets', 'Fairs & craft shows', 'Sports & campus events']
  },
  virginia: {
    intro:
      'From Virginia Beach oceanfront events to Richmond, Norfolk and Arlington, Virginia mixes coastal festivals, historic town fairs and military-community gatherings. A branded canopy suits a beachfront activation as well as a historic-district market.',
    events: ['Oceanfront & coastal festivals', 'Historic town fairs', 'Farmers markets', 'Community & military events']
  },
  'west-virginia': {
    intro:
      'West Virginia’s mountain festivals, county fairs and outdoor-adventure events keep Charleston, Huntington and Morgantown busy through the season. A dye-sublimated canopy holds up in mountain weather and marks your booth at a busy fairground.',
    events: ['Mountain & heritage festivals', 'County fairs', 'Outdoor & adventure events', 'Farmers markets']
  },

  // ── Midwest ──
  indiana: {
    intro:
      'Indiana’s motorsports culture — the Indy 500 and beyond — plus the state fair and county fairs fill Indianapolis, Fort Wayne and Evansville. A printed canopy gives a sponsor or vendor a branded presence at high-energy Indiana events.',
    events: ['Motorsports & Indy 500 events', 'State & county fairs', 'Farmers markets', 'Festivals']
  },
  iowa: {
    intro:
      'Iowa’s famous state fair, RAGBRAI and harvest festivals anchor a calendar that runs through Des Moines, Cedar Rapids and Davenport. A custom canopy turns a farm-country booth into a branded stop at one of the Midwest’s biggest fair scenes.',
    events: ['State fair & RAGBRAI', 'Harvest festivals', 'Farmers markets', 'County fairs']
  },
  kansas: {
    intro:
      'Kansas county fairs, rodeos and farmers markets play out on open, windy grounds across Wichita, Kansas City, Overland Park and Topeka. A heavy-duty printed canopy stays anchored with weights while keeping your booth clearly branded.',
    events: ['County fairs & rodeos', 'Farmers markets', 'Festivals', 'Sports & campus events']
  },
  michigan: {
    intro:
      'Michigan spans Detroit auto events, Ann Arbor’s famous art fairs and Great Lakes lakeside festivals in Grand Rapids and beyond. A branded canopy works at an urban expo or a breezy lakefront market alike.',
    events: ['Auto & industry events', 'Art fairs', 'Lakeside festivals', 'Farmers markets']
  },
  minnesota: {
    intro:
      'Minnesota’s enormous state fair, lake festivals and four-season events keep Minneapolis, Saint Paul, Rochester and Duluth busy year-round. A dye-sublimated canopy gives a vendor a branded booth at one of the country’s biggest fairs.',
    events: ['State fair & festivals', 'Lake & waterfront events', 'Farmers markets', 'Winter & summer markets']
  },
  missouri: {
    intro:
      'Missouri’s BBQ culture, river festivals and fairs run through Kansas City, St. Louis, Springfield and Columbia. A printed canopy gives a food vendor or sponsor a branded, easy-to-find booth at a busy Missouri event.',
    events: ['BBQ & food festivals', 'River & downtown events', 'Farmers markets', 'Fairs & sports events']
  },
  nebraska: {
    intro:
      'Nebraska’s College World Series, state fair and football tailgates fill Omaha, Lincoln and Bellevue’s calendar. A custom canopy turns a tailgate or market booth into a clearly branded spot in the crowd.',
    events: ['College World Series & sports', 'State fair', 'Farmers markets', 'Tailgates & festivals']
  },
  'north-dakota': {
    intro:
      'North Dakota’s county fairs, harvest events and farmers markets play out on open, windy plains around Fargo, Bismarck and Grand Forks. A heavy-duty printed canopy stays anchored with weights and marks your booth clearly.',
    events: ['County fairs & harvest events', 'Farmers markets', 'Festivals', 'Community events']
  },
  ohio: {
    intro:
      'Ohio’s big state fair, city festivals and sports tailgates keep Columbus, Cleveland, Cincinnati and Toledo busy all season. A branded canopy gives vendors and sponsors a professional presence at high-traffic Ohio events.',
    events: ['State fair & festivals', 'Sports tailgates', 'Farmers markets', 'Arts & culture events']
  },
  'south-dakota': {
    intro:
      'From the Sturgis rally and Black Hills events to Sioux Falls and Rapid City fairs, South Dakota draws big outdoor crowds. A heavy-duty printed canopy handles open-plains wind while keeping your booth on-brand.',
    events: ['Sturgis & Black Hills events', 'County fairs', 'Farmers markets', 'Festivals']
  },
  wisconsin: {
    intro:
      'Wisconsin’s festival scene — Summerfest, brewery events and Packers tailgates — runs through Milwaukee, Madison and Green Bay. A dye-sublimated canopy gives a vendor or sponsor a branded booth at some of the Midwest’s biggest gatherings.',
    events: ['Summerfest & music festivals', 'Brewery & food events', 'Packers tailgates', 'Farmers markets']
  },

  // ── West ──
  alaska: {
    intro:
      'Alaska packs its markets and festivals into a short, intense summer season across Anchorage, Fairbanks and Juneau. A weather-hardy dye-sublimated canopy makes the most of the daylight while keeping your booth branded and dry.',
    events: ['Summer festivals & markets', 'Fishing & outdoor events', 'Craft & maker fairs', 'Community events']
  },
  colorado: {
    intro:
      'Colorado’s outdoor culture drives ski and gear expos, brewery festivals and farmers markets from Denver and Boulder to Colorado Springs. A printed canopy shades a booth from strong high-altitude sun while marking your brand at an active-lifestyle event.',
    events: ['Outdoor & ski/gear expos', 'Brewery & food festivals', 'Farmers markets', 'Mountain-town events']
  },
  hawaii: {
    intro:
      'Hawaii’s year-round outdoor calendar fills Honolulu, Hilo and Kailua with craft markets, cultural celebrations and tourism events. A dye-sublimated canopy handles sun and sudden rain while giving visitors a clear, branded booth to find.',
    events: ['Outdoor & craft markets', 'Cultural celebrations', 'Tourism & resort events', 'Food festivals']
  },
  idaho: {
    intro:
      'Idaho’s outdoor-recreation scene, farmers markets and fairs keep Boise, Meridian and Nampa busy through the warm season. A printed canopy gives a maker or sponsor a branded booth at a busy Treasure Valley event.',
    events: ['Outdoor-recreation events', 'Farmers markets', 'County fairs', 'Festivals']
  },
  montana: {
    intro:
      'Montana’s rodeos, fly-fishing and outdoor events and county fairs run through Billings, Missoula and Bozeman on open, breezy ground. A heavy-duty printed canopy stays anchored and on-brand in Big Sky conditions.',
    events: ['Rodeos & fairs', 'Outdoor & fly-fishing events', 'Farmers markets', 'Festivals']
  },
  'new-mexico': {
    intro:
      'New Mexico’s Balloon Fiesta, Santa Fe art markets and cultural festivals draw big crowds to Albuquerque, Santa Fe and Las Cruces under strong high-desert sun. A dye-sublimated canopy shades your booth while making it stand out at a colorful event.',
    events: ['Balloon Fiesta & festivals', 'Art & craft markets', 'Cultural events', 'Farmers markets']
  },
  oregon: {
    intro:
      'Oregon’s farmers markets, food-cart and craft-beer festivals and outdoor events run through Portland, Eugene, Salem and Bend. A rain-ready dye-sublimated canopy keeps a booth branded and dry through a classic Pacific Northwest market day.',
    events: ['Farmers & maker markets', 'Food-cart & beer festivals', 'Outdoor events', 'Craft fairs']
  },
  utah: {
    intro:
      'Utah’s outdoor and ski culture, festivals and farmers markets keep Salt Lake City, Provo and West Valley City busy across the seasons. A printed canopy shades a booth from strong mountain sun while marking your brand at an active event.',
    events: ['Outdoor & ski events', 'Festivals', 'Farmers markets', 'Community & campus events']
  },
  wyoming: {
    intro:
      'Wyoming’s Cheyenne Frontier Days and rodeo culture, county fairs and outdoor events play out on open, windy plains around Cheyenne, Casper and Laramie. A heavy-duty printed canopy stays anchored with weights and keeps your booth clearly branded.',
    events: ['Cheyenne Frontier Days & rodeos', 'County fairs', 'Outdoor events', 'Farmers markets']
  },

  // ── Canada ──
  manitoba: {
    intro:
      'Manitoba’s Folklorama, summer festivals and farmers markets centre on Winnipeg, with events in Brandon and Steinbach too. A dye-sublimated canopy gives a vendor a branded, weather-ready booth through Manitoba’s busy warm season.',
    events: ['Folklorama & festivals', 'Farmers markets', 'Community & cultural events', 'Fairs']
  },
  saskatchewan: {
    intro:
      'Saskatchewan’s prairie festivals, farmers markets and fairs run through Saskatoon, Regina and Prince Albert on open, breezy ground. A heavy-duty printed canopy stays anchored with weights while marking your booth clearly.',
    events: ['Prairie festivals', 'Farmers markets', 'Fairs & rodeos', 'Community events']
  },
  'nova-scotia': {
    intro:
      'Nova Scotia’s coastal and seafood festivals, Halifax waterfront markets and maritime events draw crowds through the season. A dye-sublimated canopy stands up to coastal wind and damp while keeping your booth sharply branded.',
    events: ['Seafood & coastal festivals', 'Waterfront markets', 'Maritime events', 'Farmers markets']
  },
  'new-brunswick': {
    intro:
      'New Brunswick’s riverfront markets, festivals and maritime events keep Moncton, Saint John and Fredericton busy in the warm season. A weather-ready printed canopy gives a vendor a clean, branded booth on a breezy riverfront.',
    events: ['Festivals', 'Riverfront & farmers markets', 'Maritime events', 'Community fairs']
  },
  'newfoundland-and-labrador': {
    intro:
      'Newfoundland and Labrador’s coastal festivals, St. John’s downtown events and community gatherings pack a short, lively season. A dye-sublimated canopy handles Atlantic wind and weather while marking your booth clearly.',
    events: ['Coastal festivals', 'Downtown & George Street events', 'Farmers markets', 'Community events']
  },
  'prince-edward-island': {
    intro:
      'Prince Edward Island’s summer festivals, lobster and oyster events and tourism markets centre on Charlottetown and Summerside. A printed canopy gives a maker or food vendor a branded booth through PEI’s busy tourist season.',
    events: ['Seafood & summer festivals', 'Farmers & craft markets', 'Tourism events', 'Community fairs']
  },
  yukon: {
    intro:
      'The Yukon’s summer festivals and midnight-sun events centre on Whitehorse, packing a lot into a short, bright season. A weather-hardy dye-sublimated canopy makes the most of the daylight while keeping your booth branded.',
    events: ['Summer & midnight-sun festivals', 'Markets & maker fairs', 'Outdoor events', 'Community gatherings']
  },
  'northwest-territories': {
    intro:
      'In the Northwest Territories, Yellowknife’s summer festivals, outdoor markets and midnight-sun events draw the season’s crowds. A weather-hardy printed canopy gives a vendor a branded, sheltered booth in a short northern summer.',
    events: ['Summer festivals', 'Outdoor markets', 'Midnight-sun events', 'Community gatherings']
  },
  nunavut: {
    intro:
      'Nunavut’s community events and outdoor markets make the most of a short summer season in Iqaluit and beyond. A weather-hardy dye-sublimated canopy gives your booth shelter and clear branding in northern conditions.',
    events: ['Community events', 'Outdoor markets', 'Cultural gatherings', 'Seasonal festivals']
  }
};

// Every state/province above now has unique content, so all location pages are
// indexed (no thin, noindex long tail remaining). Each links back to the product
// money-pages (canopies, displays) — clusters feeding the commercial pages.
export const PRIORITY_STATES = new Set(Object.keys(stateContent));

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

// Unique, per-state/province content used by both the React location page and
// the prerenderer so the crawlable HTML and the app match. Each intro is written
// with a DIFFERENT structure (question / fact / product-led / venue-led / cities-
// led / season-led) so no two read the same, and each weaves in the target
// keywords (custom canopy tents + trade show displays / banner stands + size and
// city terms) naturally. NO invented shipping times, warehouses or statistics.
//
// PRIORITY_STATES (the indexed set) is derived from these keys below — every
// state/province has unique content, so all location pages are indexed.

export const stateContent = {
  // ── West ──
  california: {
    intro:
      'California runs one of the busiest outdoor-event calendars in the country, so custom canopy tents in California work overtime — year-round farmers markets, beach festivals and tech expos from San Diego to the Bay Area. Order a 10x10 or 10x20 pop-up canopy, add retractable banner stands, and your booth reads across a crowded Los Angeles lot.',
    events: ['Farmers markets & street fairs', 'Beach and boardwalk pop-ups', 'Tech & startup expos', 'Food-truck and wine events']
  },
  texas: {
    intro:
      'Everything is bigger in Texas, including the event schedule: rodeos, BBQ festivals and trade shows across Houston, Dallas, Austin and San Antonio. Beat the heat with dye-sublimated custom canopy tents, and pair 10x20 canopies with step & repeat backdrops and banner stands for a full Texas trade show display.',
    events: ['Rodeos & BBQ festivals', 'State fairs & markets', 'Trade shows & expos', 'Football tailgates']
  },
  florida: {
    intro:
      'Sun, humidity and afternoon storms define Florida events — so custom canopy tents in Florida have to shade a booth and shrug off the weather from Miami and Orlando to Tampa and Jacksonville. Dye-sublimated pop-up canopy tents, table covers and banner stands keep beach-market and theme-park-adjacent vendors on-brand.',
    events: ['Beach & waterfront festivals', 'Theme-park-area events', 'Farmers markets', 'Trade shows & expos']
  },
  'new-york': {
    intro:
      'From New York City sidewalk fairs to Buffalo, Rochester and Albany, New York packs more foot traffic per booth than almost anywhere. Custom printed canopy tents, retractable banner stands and table covers turn a tight NYC pitch into a branded storefront that stops a fast-moving crowd.',
    events: ['NYC street fairs', 'Upstate festivals & markets', 'Trade shows', 'Campus & corporate events']
  },
  arizona: {
    intro:
      'Shade is not optional in Arizona. Phoenix, Tucson, Mesa and Scottsdale run markets and festivals under intense desert sun, so custom canopy tents in Arizona earn their keep — and dye sublimation means the print will not fade. Add banner stands and table covers for a complete desert-ready trade show display.',
    events: ['Desert markets & festivals', 'Art & culture events', 'Farmers markets', 'Trade shows & expos']
  },
  nevada: {
    intro:
      'Nevada means Las Vegas — the busiest trade show city in the country — plus Reno and Henderson events. For indoor halls, step & repeat backdrops, retractable banner stands and table covers do the work; outside, custom canopy tents brand your activation or parking-lot booth near the Las Vegas Convention Center.',
    events: ['Las Vegas trade shows', 'Conventions & expos', 'Outdoor activations', 'Festivals & markets']
  },
  washington: {
    intro:
      'Rain-ready is the rule in Washington. Seattle, Spokane, Tacoma and Bellevue vendors want custom canopy tents that keep a booth dry through a classic Pacific Northwest market day, and dye-sublimated pop-up canopy tents plus banner stands keep the branding sharp whatever the sky does.',
    events: ['Farmers & maker markets', 'Food & coffee festivals', 'Tech & maker expos', 'Waterfront events']
  },
  illinois: {
    intro:
      'Chicago anchors the Midwest event scene — McCormick Place trade shows plus street fairs across Aurora, Naperville and Springfield. Indoors, step & repeat backdrops and retractable banner stands frame your booth; outdoors, custom canopy tents brand the lakefront festival circuit.',
    events: ['McCormick Place trade shows', 'Chicago street fairs', 'Lakefront festivals', 'Farmers markets']
  },
  colorado: {
    intro:
      'Active-lifestyle Colorado lives outdoors — ski and gear expos, brewery festivals and farmers markets from Denver and Boulder to Colorado Springs. High-altitude sun is brutal on cheap print, so dye-sublimated custom canopy tents and banner stands keep your brand crisp at every Rocky Mountain event.',
    events: ['Outdoor & ski/gear expos', 'Brewery & food festivals', 'Farmers markets', 'Mountain-town events']
  },
  oregon: {
    intro:
      'Portland, Eugene, Salem and Bend built their reputation on markets — food carts, craft beer and maker fairs, rain or shine. A rain-ready custom canopy tent keeps an Oregon booth dry and branded, and retractable banner stands pull traffic down a busy market row.',
    events: ['Farmers & maker markets', 'Food-cart & beer festivals', 'Outdoor events', 'Craft fairs']
  },
  utah: {
    intro:
      'Between the slopes and the desert, Utah events run year-round in Salt Lake City, Provo and West Valley City. Custom canopy tents shade a booth from strong mountain sun, while banner stands and table covers round out a tidy trade show display for outdoor and indoor shows alike.',
    events: ['Outdoor & ski events', 'Festivals', 'Farmers markets', 'Community & campus events']
  },
  idaho: {
    intro:
      'Idaho\'s Treasure Valley — Boise, Meridian, Nampa — fills warm months with recreation events, farmers markets and county fairs. A custom printed canopy tent gives a maker or sponsor a branded booth, and adding banner stands makes it read from across the grounds.',
    events: ['Outdoor-recreation events', 'Farmers markets', 'County fairs', 'Festivals']
  },
  montana: {
    intro:
      'Big Sky, big wind. Montana rodeos, fly-fishing events and county fairs in Billings, Missoula and Bozeman play out on open ground, so a heavy-duty custom canopy tent (properly weighted) stays put while keeping your booth branded.',
    events: ['Rodeos & fairs', 'Outdoor & fly-fishing events', 'Farmers markets', 'Festivals']
  },
  wyoming: {
    intro:
      'Cheyenne Frontier Days put Wyoming on the rodeo map, and the open plains around Cheyenne, Casper and Laramie stay windy year-round. Weight every leg and a heavy-duty custom canopy tent holds firm — pair it with banner stands to mark your booth in a big outdoor crowd.',
    events: ['Cheyenne Frontier Days & rodeos', 'County fairs', 'Outdoor events', 'Farmers markets']
  },
  'new-mexico': {
    intro:
      'The Albuquerque Balloon Fiesta and Santa Fe art markets draw huge crowds under strong high-desert sun. Custom canopy tents shade your booth while a bold dye-sublimated print — plus step & repeat backdrops and banner stands — makes it pop against New Mexico\'s big skies.',
    events: ['Balloon Fiesta & festivals', 'Art & craft markets', 'Cultural events', 'Farmers markets']
  },
  alaska: {
    intro:
      'Alaska\'s season is short and bright, so Anchorage, Fairbanks and Juneau vendors want custom canopy tents that set up fast and pack down small. Weather-hardy pop-up canopy tents and banner stands make the most of the long summer daylight.',
    events: ['Summer festivals & markets', 'Fishing & outdoor events', 'Craft & maker fairs', 'Community events']
  },
  hawaii: {
    intro:
      'Year-round outdoor markets, cultural celebrations and tourism events keep Honolulu, Hilo and Kailua busy. Between sun and sudden rain, a dye-sublimated custom canopy tent shelters your booth, and table covers plus banner stands give visitors a clear, branded stop.',
    events: ['Outdoor & craft markets', 'Cultural celebrations', 'Tourism & resort events', 'Food festivals']
  },

  // ── South ──
  georgia: {
    intro:
      'Atlanta is a convention powerhouse — the Georgia World Congress Center plus AmericasMart — while Savannah, Augusta and Columbus run festivals all season. Trade show displays, retractable banner stands and step & repeat backdrops fit the halls; custom canopy tents brand the outdoor Georgia festival circuit.',
    events: ['Atlanta trade shows', 'Savannah festivals', 'Farmers markets', 'Campus & sports events']
  },
  'north-carolina': {
    intro:
      'Charlotte, Raleigh, Greensboro and Durham drive North Carolina\'s mix of tech expos, college events and street festivals. Custom printed canopy tents and banner stands give Research Triangle vendors and sponsors a branded booth indoors or out.',
    events: ['Tech & startup expos', 'College & game-day events', 'Street festivals', 'Farmers markets']
  },
  tennessee: {
    intro:
      'Music City and beyond: Nashville festivals, Memphis BBQ and Knoxville and Chattanooga fairs. A custom canopy tent gives a food vendor or sponsor a branded, stage-side presence, and retractable banner stands make sure your name reads over the crowd.',
    events: ['Music & BBQ festivals', 'Farmers markets', 'Fairs & craft shows', 'Sports & campus events']
  },
  louisiana: {
    intro:
      'No state throws a party like Louisiana — Mardi Gras and Jazz Fest in New Orleans, festivals across Baton Rouge, Lafayette and Shreveport. Gulf heat and humidity are hard on print, so dye-sublimated custom canopy tents, table covers and banner stands keep your booth vivid in a lively crowd.',
    events: ['Mardi Gras & festivals', 'Food & music events', 'Farmers markets', 'Fairs & crawfish boils']
  },
  virginia: {
    intro:
      'Virginia Beach oceanfront events, Richmond and Norfolk festivals and Arlington activations span coast to capital. A custom canopy tent brands a beachfront pitch as easily as a historic-district market, and banner stands plus table covers finish the trade show display.',
    events: ['Oceanfront & coastal festivals', 'Historic town fairs', 'Farmers markets', 'Community & military events']
  },
  'south-carolina': {
    intro:
      'Charleston food festivals, Myrtle Beach events and Greenville and Columbia markets run through a long, warm South Carolina season. Custom canopy tents handle Lowcountry heat and give tourists a clear, branded booth; add banner stands to catch beach-town foot traffic.',
    events: ['Coastal & beach festivals', 'Food & culture events', 'Farmers markets', 'Craft fairs']
  },
  kentucky: {
    intro:
      'Derby season, the bourbon trail and county fairs make Louisville and Lexington event hubs. Custom printed canopy tents give vendors and sponsors a polished presence at high-traffic Kentucky events, with retractable banner stands to steer the crowd.',
    events: ['Derby & horse-country events', 'Bourbon & food festivals', 'County fairs', 'Farmers markets']
  },
  alabama: {
    intro:
      'Selling in the Alabama heat? Custom canopy tents keep a booth shaded and branded from Mobile\'s Mardi Gras to Birmingham, Montgomery and Huntsville markets. Dye sublimation means the print will not fade, and banner stands catch football-Saturday crowds.',
    events: ['Gulf Coast & Mardi Gras festivals', 'Football tailgates', 'Farmers markets', 'Community fairs']
  },
  arkansas: {
    intro:
      'Razorback game days in Fayetteville, plus Little Rock and Fort Smith festivals and markets, fill Arkansas\'s calendar. A custom canopy tent turns a plain booth into a branded stop, and banner stands make it visible across a busy Ozark-region lot.',
    events: ['Outdoor festivals', 'College & game-day events', 'Farmers markets', 'Craft & county fairs']
  },
  mississippi: {
    intro:
      'Gulf Coast festivals in Gulfport, blues-heritage events and county fairs around Jackson keep Mississippi busy in the warm months. Custom printed canopy tents handle coastal sun and, with table covers and banner stands, mark your booth clearly at a crowded festival.',
    events: ['Gulf Coast festivals', 'Blues & heritage events', 'County fairs', 'Farmers markets']
  },
  oklahoma: {
    intro:
      'Rodeos, the state fair and outdoor festivals fill Oklahoma City, Tulsa and Norman — often on windy fairgrounds where weights matter. Anchor a heavy-duty custom canopy tent, add banner stands, and your booth stays put and on-brand in Oklahoma\'s open-plains wind.',
    events: ['Rodeos & state fair', 'Outdoor festivals', 'Farmers markets', 'College & game-day events']
  },
  'west-virginia': {
    intro:
      'Mountain festivals, county fairs and outdoor-adventure events keep Charleston, Huntington and Morgantown busy. A dye-sublimated custom canopy tent holds up in West Virginia\'s mountain weather and, with banner stands, marks your booth on a busy fairground.',
    events: ['Mountain & heritage festivals', 'County fairs', 'Outdoor & adventure events', 'Farmers markets']
  },

  // ── Northeast ──
  'new-jersey': {
    intro:
      'The Jersey Shore boardwalks plus Newark, Jersey City and Atlantic City give New Jersey wall-to-wall summer crowds. A custom canopy tent pulls traffic on a packed boardwalk, and retractable banner stands define your space in a dense, competitive lot.',
    events: ['Shore & boardwalk festivals', 'Flea & street markets', 'Community fairs', 'Consumer & trade shows']
  },
  pennsylvania: {
    intro:
      'Philadelphia and Pittsburgh street fairs, Harrisburg farm shows and Lehigh Valley and Amish-country markets show Pennsylvania\'s range. Custom canopy tents suit an urban festival or a rural farm show, and banner stands work a stadium tailgate just as well.',
    events: ['Street fairs & festivals', 'Farm & agricultural shows', 'Farmers markets', 'Sports tailgates']
  },
  massachusetts: {
    intro:
      'Universities, biotech and classic town commons: Boston, Worcester, Springfield and Cambridge blend expos with New England fairs. A branded custom canopy tent works a campus activation as well as a market on the common, and trade show displays fit the halls.',
    events: ['University & biotech expos', 'Town-common fairs', 'Farmers markets', 'Seasonal festivals']
  },
  maryland: {
    intro:
      'Baltimore\'s Inner Harbor, Annapolis and Frederick host crab feasts, Chesapeake festivals and town street fairs all summer. A custom printed canopy tent anchors a busy waterfront booth and photographs well against the harbor; add banner stands to draw the crowd.',
    events: ['Waterfront & harbor festivals', 'Crab feasts & food events', 'Street fairs', 'Farmers markets']
  },
  connecticut: {
    intro:
      'Town-green fairs, shoreline festivals and farmers markets pack Connecticut from Hartford and New Haven to Stamford and Bridgeport. A custom canopy tent gives a vendor or exhibitor a branded storefront that reads across a crowded New England green.',
    events: ['Town-green fairs & festivals', 'Shoreline & coastal events', 'Farmers markets', 'Corporate & campus expos']
  },
  maine: {
    intro:
      'Short season, big turnout: Portland, Lewiston and Bangor fill with seafood festivals, coastal fairs and farmers markets, plus a strong fall craft circuit. A dye-sublimated custom canopy tent shrugs off coastal wind and damp while keeping your booth sharply branded.',
    events: ['Seafood & coastal festivals', 'Farmers & craft markets', 'Fall foliage & harvest fairs', 'Community events']
  },
  'new-hampshire': {
    intro:
      'No-sales-tax shopping events, fall foliage fairs and outdoor craft markets keep Manchester, Nashua and Concord busy. A weather-ready custom canopy tent holds up on a breezy New Hampshire fairground, and banner stands mark your booth from a distance.',
    events: ['Craft & harvest fairs', 'Fall foliage events', 'Farmers markets', 'Community festivals']
  },
  vermont: {
    intro:
      'Farmers markets, maple and craft fairs and foliage-season events run spring through fall in Burlington, Montpelier and Rutland. A custom canopy tent gives a Vermont maker a clean, branded booth that fits the state\'s market culture.',
    events: ['Farmers & maker markets', 'Maple & craft fairs', 'Foliage-season events', 'Community festivals']
  },
  'rhode-island': {
    intro:
      'Compact and coastal, Rhode Island concentrates its scene in Providence, Warwick and Cranston — WaterFire nights, seafood festivals and dense summer markets. A branded custom canopy tent makes a small booth stand out at a busy waterfront event.',
    events: ['Seafood & coastal festivals', 'WaterFire & downtown events', 'Farmers markets', 'Craft fairs']
  },
  delaware: {
    intro:
      'From Wilmington and Dover to the Rehoboth beach towns, Delaware\'s tax-free events and boardwalk pop-ups draw steady summer crowds. A custom canopy tent turns a small-state booth into a clear, branded stop on a busy boardwalk or market row.',
    events: ['Beach & boardwalk pop-ups', 'Community & town fairs', 'Farmers markets', 'Festivals & craft shows']
  },
  'washington-dc': {
    intro:
      'The nation\'s capital runs national festivals, activations and association trade shows year-round, from events near the Mall to conventions across the district. Trade show displays, step & repeat backdrops and custom canopy tents give your organization a professional, on-brand presence.',
    events: ['National festivals & activations', 'Association trade shows', 'Farmers & street markets', 'Conferences & expos']
  },

  // ── Midwest ──
  ohio: {
    intro:
      'The Ohio State Fair, city festivals and Saturday tailgates keep Columbus, Cleveland, Cincinnati and Toledo busy all season. Custom printed canopy tents and banner stands give vendors and sponsors a professional presence at high-traffic Ohio events, indoors or out.',
    events: ['State fair & festivals', 'Sports tailgates', 'Farmers markets', 'Arts & culture events']
  },
  michigan: {
    intro:
      'Detroit auto events, Ann Arbor\'s famous art fairs and Great Lakes lakeside festivals in Grand Rapids define Michigan. A branded custom canopy tent works an urban expo or a breezy lakefront market, and banner stands keep your name front and centre.',
    events: ['Auto & industry events', 'Art fairs', 'Lakeside festivals', 'Farmers markets']
  },
  minnesota: {
    intro:
      'Minnesota\'s enormous state fair, lake festivals and four-season events keep Minneapolis, Saint Paul, Rochester and Duluth going year-round. A dye-sublimated custom canopy tent gives a vendor a branded booth at one of the country\'s biggest fairs.',
    events: ['State fair & festivals', 'Lake & waterfront events', 'Farmers markets', 'Winter & summer markets']
  },
  wisconsin: {
    intro:
      'Summerfest, brewery events and Packers tailgates run through Milwaukee, Madison and Green Bay. A custom canopy tent gives a vendor or sponsor a branded booth at some of the Midwest\'s biggest gatherings, and banner stands work the crowd.',
    events: ['Summerfest & music festivals', 'Brewery & food events', 'Packers tailgates', 'Farmers markets']
  },
  indiana: {
    intro:
      'Motorsports run in Indiana\'s blood — the Indy 500 and beyond — alongside the state fair and county fairs in Indianapolis, Fort Wayne and Evansville. A custom printed canopy tent gives a sponsor or vendor a branded presence at high-energy Indiana events.',
    events: ['Motorsports & Indy 500 events', 'State & county fairs', 'Farmers markets', 'Festivals']
  },
  missouri: {
    intro:
      'BBQ, river festivals and fairs run through Kansas City, St. Louis, Springfield and Columbia. A custom canopy tent gives a Missouri food vendor or sponsor a branded, easy-to-find booth, and banner stands help you cut through a busy event.',
    events: ['BBQ & food festivals', 'River & downtown events', 'Farmers markets', 'Fairs & sports events']
  },
  iowa: {
    intro:
      'The Iowa State Fair, RAGBRAI and harvest festivals anchor a calendar that runs through Des Moines, Cedar Rapids and Davenport. A custom canopy tent turns a farm-country booth into a branded stop at one of the Midwest\'s biggest fair scenes.',
    events: ['State fair & RAGBRAI', 'Harvest festivals', 'Farmers markets', 'County fairs']
  },
  kansas: {
    intro:
      'County fairs, rodeos and farmers markets play out on open, windy ground across Wichita, Kansas City, Overland Park and Topeka. Weight every leg and a heavy-duty custom canopy tent stays put; add banner stands to keep your booth clearly branded.',
    events: ['County fairs & rodeos', 'Farmers markets', 'Festivals', 'Sports & campus events']
  },
  nebraska: {
    intro:
      'The College World Series, the state fair and Husker tailgates fill Omaha, Lincoln and Bellevue. A custom canopy tent turns a tailgate or market booth into a clearly branded spot, and retractable banner stands pull passers-by in.',
    events: ['College World Series & sports', 'State fair', 'Farmers markets', 'Tailgates & festivals']
  },
  'north-dakota': {
    intro:
      'County fairs, harvest events and farmers markets play out on open, windy plains around Fargo, Bismarck and Grand Forks. A heavy-duty custom canopy tent, properly weighted, stays anchored and marks your North Dakota booth clearly.',
    events: ['County fairs & harvest events', 'Farmers markets', 'Festivals', 'Community events']
  },
  'south-dakota': {
    intro:
      'The Sturgis rally and Black Hills events draw big outdoor crowds, alongside Sioux Falls and Rapid City fairs. A heavy-duty custom canopy tent handles open-plains wind while keeping your booth on-brand; banner stands do the rest.',
    events: ['Sturgis & Black Hills events', 'County fairs', 'Farmers markets', 'Festivals']
  },

  // ── Canada ──
  ontario: {
    intro:
      'Ontario is Canada\'s event engine — Toronto conventions plus Ottawa, Mississauga and Hamilton festivals and markets. Trade show displays, retractable banner stands and step & repeat backdrops fit the halls; custom canopy tents brand the outdoor Ontario festival circuit.',
    events: ['Toronto conventions & expos', 'City festivals', 'Farmers markets', 'Community events']
  },
  quebec: {
    intro:
      'Quebec\'s calendar overflows with festivals and public markets — Montreal and Quebec City street events, plus Laval and Gatineau. A full-colour custom canopy tent makes a booth stand out in a lively festival, and table covers and banner stands complete the display.',
    events: ['Montreal & Quebec City festivals', 'Public & farmers markets', 'Cultural celebrations', 'Trade & consumer shows']
  },
  'british-columbia': {
    intro:
      'Rain-ready, mountain-and-coast British Columbia runs markets and festivals from Vancouver and Victoria to Surrey and Burnaby. A dye-sublimated custom canopy tent keeps a BC booth dry and branded, and banner stands pull traffic down a busy market row.',
    events: ['Farmers & maker markets', 'Waterfront festivals', 'Outdoor events', 'Trade shows']
  },
  alberta: {
    intro:
      'The Calgary Stampede sets the tone for Alberta — rodeos, festivals and markets across Calgary, Edmonton, Red Deer and Lethbridge. A heavy-duty custom canopy tent handles prairie wind and sun, and banner stands mark your booth in a big Stampede-season crowd.',
    events: ['Calgary Stampede & rodeos', 'City festivals', 'Farmers markets', 'Trade shows']
  },
  manitoba: {
    intro:
      'Folklorama, summer festivals and farmers markets centre on Winnipeg, with events in Brandon and Steinbach. A weather-ready custom canopy tent gives a Manitoba vendor a branded booth through the busy warm season; add banner stands for reach.',
    events: ['Folklorama & festivals', 'Farmers markets', 'Community & cultural events', 'Fairs']
  },
  saskatchewan: {
    intro:
      'Prairie festivals, farmers markets and fairs run through Saskatoon, Regina and Prince Albert on open, breezy ground. Weight it down and a heavy-duty custom canopy tent stays anchored, marking your Saskatchewan booth clearly.',
    events: ['Prairie festivals', 'Farmers markets', 'Fairs & rodeos', 'Community events']
  },
  'nova-scotia': {
    intro:
      'Coastal and seafood festivals, Halifax waterfront markets and maritime events draw Nova Scotia crowds all season. A dye-sublimated custom canopy tent stands up to Atlantic wind and damp while keeping your booth sharply branded.',
    events: ['Seafood & coastal festivals', 'Waterfront markets', 'Maritime events', 'Farmers markets']
  },
  'new-brunswick': {
    intro:
      'Riverfront markets, festivals and maritime events keep Moncton, Saint John and Fredericton busy in the warm season. A weather-ready custom canopy tent gives a New Brunswick vendor a clean, branded booth on a breezy riverfront.',
    events: ['Festivals', 'Riverfront & farmers markets', 'Maritime events', 'Community fairs']
  },
  'newfoundland-and-labrador': {
    intro:
      'Coastal festivals, St. John\'s downtown events and community gatherings pack a short, lively Newfoundland and Labrador season. A dye-sublimated custom canopy tent handles Atlantic wind and weather while marking your booth clearly.',
    events: ['Coastal festivals', 'Downtown & George Street events', 'Farmers markets', 'Community events']
  },
  'prince-edward-island': {
    intro:
      'PEI summers mean lobster and oyster festivals and tourism markets in Charlottetown and Summerside. A custom canopy tent gives a maker or food vendor a branded booth through Prince Edward Island\'s busy tourist season.',
    events: ['Seafood & summer festivals', 'Farmers & craft markets', 'Tourism events', 'Community fairs']
  },
  yukon: {
    intro:
      'Whitehorse packs summer festivals and midnight-sun events into a short, bright Yukon season. A weather-hardy custom canopy tent makes the most of the daylight while keeping your booth branded and sheltered.',
    events: ['Summer & midnight-sun festivals', 'Markets & maker fairs', 'Outdoor events', 'Community gatherings']
  },
  'northwest-territories': {
    intro:
      'Yellowknife\'s summer festivals, outdoor markets and midnight-sun events draw the season\'s Northwest Territories crowds. A weather-hardy custom canopy tent gives a vendor a branded, sheltered booth in a short northern summer.',
    events: ['Summer festivals', 'Outdoor markets', 'Midnight-sun events', 'Community gatherings']
  },
  nunavut: {
    intro:
      'Nunavut\'s community events and outdoor markets make the most of a short Iqaluit summer. A weather-hardy custom canopy tent gives your booth shelter and clear branding in northern conditions.',
    events: ['Community events', 'Outdoor markets', 'Cultural gatherings', 'Seasonal festivals']
  }
};

// Every state/province above has unique content, so all location pages are
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

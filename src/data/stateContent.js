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
      'Detroit auto events, Ann Arbor\'s famous art fairs and Great Lakes lakeside festivals in Grand Rapids define Michigan. A branded custom canopy tent works an urban expo or a breezy lakefront market, and banner stands keep your name front and center.',
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
      'Quebec\'s calendar overflows with festivals and public markets — Montreal and Quebec City street events, plus Laval and Gatineau. A full-color custom canopy tent makes a booth stand out in a lively festival, and table covers and banner stands complete the display.',
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
      'Folklorama, summer festivals and farmers markets center on Winnipeg, with events in Brandon and Steinbach. A weather-ready custom canopy tent gives a Manitoba vendor a branded booth through the busy warm season; add banner stands for reach.',
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

// Every state/province above has unique content, so every location page renders
// its full editorial body. PRIORITY_STATES governs CONTENT DEPTH only.
export const PRIORITY_STATES = new Set(Object.keys(stateContent));

// INDEXED_STATES governs INDEXABILITY, which is a different question from
// content depth.
//
// Every state and province page is indexed. They carry roughly 600 words of
// genuine, state-specific content — comparable to the pages that were already
// indexed — so each has something of its own to rank with.
//
// This was previously restricted to the markets with a canonical city page, on
// the reasoning that 64 similar pages split link equity rather than compounding
// it. The owner's call is to index them all; the pages are substantial enough
// that the risk is reputational rather than structural, and it is reversible by
// narrowing this set again.
//
// City pages are deliberately NOT included in that decision. The 204 city stubs
// are identical to one another once the place name is removed, at about 110
// words each, which is the doorway pattern. They stay noindex,follow — readable,
// linked, still passing equity to the money pages — until they carry real local
// content. That gate lives on PRIORITY_CITIES in scripts/prerender.mjs.
import { states, territories, provinces } from './states.js';
import { isGonePath } from './goneLocations.js';

// (defined at the bottom of this file, after LOCAL_FACTS)

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
  'Dye-sublimation printing bonds the ink into the fabric, so colors hold up under strong, repeated sun exposure.',
  'Add full or half walls on the windward side for shade and wind protection while keeping the front open.',
  'Choose standard 6–8 day production, or 2–3 day rush if your event date is close.'
];

export const ARTWORK_NOTES = [
  'Send a print-ready vector file (PDF, AI or EPS) or a high-resolution PNG/JPG — logos, full-color backgrounds and photos all print.',
  'You can print the canopy top, the valance and the walls; each is a separate branding surface.',
  'No print-ready file? Add our design service and we build the artwork for you.',
  'Every order includes a free visual proof — nothing goes to production until you approve it.'
];

export const STATE_FAQS = [
  ['How long does a custom canopy tent take?', 'Standard production is 6–8 business days after you approve the proof, with an optional 2–3 day rush.'],
  ['Can I print my logo on the tent?', 'Yes — full-color dye sublimation on the top, valance and walls. Send your logo or full artwork.'],
  ['How many walls can I add?', 'Up to 3 printed walls in any mix of full-height and half-height; both cost the same per wall.'],
  ['Do you offer bulk pricing?', 'Yes — order 3 or more tents and volume pricing applies automatically as you increase the quantity.']
];

// Verified, well-known venues and recurring events per region. Only facts that
// are public and stable go here (venue names, the month/season an annual event
// runs). Regions without an entry keep the shared buying-guide sections.
// `venues` are convention/exhibition centres; `events` are [name, timing, place].
export const LOCAL_FACTS = {
  california: { venues: ['Los Angeles Convention Center', 'San Diego Convention Center', 'Moscone Center (San Francisco)', 'Anaheim Convention Center'], events: [['San Diego Comic-Con', 'July', 'San Diego'], ['The NAMM Show', 'January', 'Anaheim']] },
  texas: { venues: ['George R. Brown Convention Center (Houston)', 'Kay Bailey Hutchison Convention Center (Dallas)', 'Austin Convention Center'], events: [['SXSW', 'March', 'Austin'], ['Houston Livestock Show and Rodeo', 'February–March', 'Houston'], ['State Fair of Texas', 'late September–October', 'Dallas']] },
  florida: { venues: ['Orange County Convention Center (Orlando)', 'Miami Beach Convention Center', 'Tampa Convention Center'], events: [['Art Basel Miami Beach', 'December', 'Miami Beach'], ['Gasparilla Pirate Festival', 'January', 'Tampa'], ['Florida State Fair', 'February', 'Tampa']] },
  'new-york': { venues: ['Jacob K. Javits Convention Center (New York City)', 'Buffalo Niagara Convention Center'], events: [['New York State Fair', 'late August–Labor Day', 'Syracuse']] },
  nevada: { venues: ['Las Vegas Convention Center', 'Mandalay Bay Convention Center', 'Venetian Expo'], events: [['CES', 'January', 'Las Vegas'], ['SEMA Show', 'November', 'Las Vegas']] },
  illinois: { venues: ['McCormick Place (Chicago)', 'Navy Pier (Chicago)'], events: [['Taste of Chicago', 'summer', 'Chicago'], ['Lollapalooza', 'early August', 'Chicago'], ['Illinois State Fair', 'August', 'Springfield']] },
  washington: { venues: ['Seattle Convention Center', 'Spokane Convention Center'], events: [['Seafair', 'summer', 'Seattle'], ['Washington State Fair', 'September', 'Puyallup']] },
  colorado: { venues: ['Colorado Convention Center (Denver)'], events: [['Great American Beer Festival', 'fall', 'Denver'], ['Colorado State Fair', 'late August–Labor Day', 'Pueblo']] },
  georgia: { venues: ['Georgia World Congress Center (Atlanta)'], events: [['Dragon Con', 'Labor Day weekend', 'Atlanta']] },
  massachusetts: { venues: ['Boston Convention & Exhibition Center', 'Hynes Convention Center (Boston)'], events: [['Boston Marathon', 'April (Patriots\' Day)', 'Boston']] },
  pennsylvania: { venues: ['Pennsylvania Convention Center (Philadelphia)', 'David L. Lawrence Convention Center (Pittsburgh)'], events: [['Pennsylvania Farm Show', 'January', 'Harrisburg']] },
  tennessee: { venues: ['Music City Center (Nashville)'], events: [['CMA Fest', 'June', 'Nashville']] },
  louisiana: { venues: ['Ernest N. Morial Convention Center (New Orleans)'], events: [['Mardi Gras', 'February–March', 'New Orleans'], ['New Orleans Jazz & Heritage Festival', 'late April–early May', 'New Orleans']] },
  arizona: { venues: ['Phoenix Convention Center', 'Tucson Convention Center'], events: [['Arizona State Fair', 'October', 'Phoenix']] },
  indiana: { venues: ['Indiana Convention Center (Indianapolis)'], events: [['Indianapolis 500', 'May', 'Indianapolis'], ['Indiana State Fair', 'August', 'Indianapolis']] },
  kentucky: { venues: ['Kentucky International Convention Center (Louisville)'], events: [['Kentucky Derby', 'first Saturday in May', 'Louisville'], ['Kentucky State Fair', 'August', 'Louisville']] },
  ohio: { venues: ['Greater Columbus Convention Center'], events: [['Ohio State Fair', 'late July–August', 'Columbus']] },
  minnesota: { venues: ['Minneapolis Convention Center'], events: [['Minnesota State Fair', 'late August–Labor Day', 'St. Paul']] },
  wisconsin: { venues: ['Wisconsin Center (Milwaukee)'], events: [['Wisconsin State Fair', 'August', 'West Allis'], ['Summerfest', 'June–July', 'Milwaukee']] },
  iowa: { venues: ['Iowa Events Center (Des Moines)'], events: [['Iowa State Fair', 'August', 'Des Moines']] },
  oklahoma: { venues: ['Oklahoma City Convention Center'], events: [['State Fair of Oklahoma', 'September', 'Oklahoma City']] },
  utah: { venues: ['Salt Palace Convention Center (Salt Lake City)'], events: [['Utah State Fair', 'September', 'Salt Lake City']] },
  oregon: { venues: ['Oregon Convention Center (Portland)'], events: [['Oregon State Fair', 'late August–Labor Day', 'Salem']] },
  wyoming: { venues: [], events: [['Cheyenne Frontier Days', 'July', 'Cheyenne']] },
  ontario: { venues: ['Metro Toronto Convention Centre', 'Enercare Centre (Toronto)'], events: [['Canadian National Exhibition', 'late August–Labor Day', 'Toronto']] },
  quebec: { venues: ['Palais des congrès de Montréal'], events: [['Montreal International Jazz Festival', 'late June–July', 'Montréal']] },
  'british-columbia': { venues: ['Vancouver Convention Centre'], events: [['Pacific National Exhibition', 'late August–early September', 'Vancouver']] },
  alberta: { venues: ['BMO Centre (Calgary)', 'Edmonton Convention Centre'], events: [['Calgary Stampede', 'July', 'Calgary']] },
  manitoba: { venues: ['RBC Convention Centre Winnipeg'], events: [['Folklorama', 'August', 'Winnipeg'], ['Festival du Voyageur', 'February', 'Winnipeg']] }
};

// Compact replacement for the shared boilerplate on pages that have LOCAL_FACTS.
export const BUYING_GUIDE_NOTE =
  'Sizes:';

// Only regions with verified local facts compete in the index. The rest render
// the shared buying guide with a one-paragraph intro, which Google folds into a
// sibling page as a duplicate (the canonical problem seen in Search Console), so
// they stay noindex,follow and out of the sitemap until they gain LOCAL_FACTS.
//
// Crawl budget (2026-10): a new domain gets few crawls, so regions with no
// city hub page are cut too — they compete only with the national category
// pages. None had a click or an impression in Search Console over 90 days.
// They 301 to /locations (src/data/removedLocations.js).
export const CRAWL_BUDGET_CUT_STATES = new Set([
  'iowa', 'kentucky', 'manitoba', 'minnesota', 'ohio', 'oklahoma',
  'oregon', 'pennsylvania', 'utah', 'wisconsin', 'wyoming'
]);
// Regions that had a page before the 2026-10-28 removal. Only the retired-URL
// redirect generator reads this (src/data/removedLocations.js), so the 301s for
// /locations/{state}/{city} keep exactly the destinations they had.
export const STATES_WITH_PAGES_BEFORE_GONE = new Set(
  [...states, ...territories, ...provinces].map((s) => s.slug)
    .filter((slug) => LOCAL_FACTS[slug] && !CRAWL_BUDGET_CUT_STATES.has(slug))
);
// Regions with a live page. State pages listed in src/data/goneLocations.js
// (owner decision 2026-10-28) answer 410 and are not built, listed or linked.
export const INDEXED_STATES = new Set(
  [...STATES_WITH_PAGES_BEFORE_GONE].filter((slug) => !isGonePath(`/locations/${slug}`))
);

// What the weather and the event calendar actually ask of a printed canopy in
// each indexed region. General, stable observations only — no figures, no
// claims about any customer. One paragraph per region, written for that region:
// this is the copy that makes each state page its own page rather than the
// shared buying guide with a name swapped in.
export const STATE_OUTDOOR = {
  alberta: 'Alberta weather turns quickly. A chinook can push a mild winter afternoon into strong, gusty wind, and prairie thunderstorms in summer arrive with little warning, so every canopy leg needs a weight bag and the walls should be easy to drop. Stampede week in Calgary and the summer festival circuit in Edmonton fill the calendar with long days and low evening sun, which is when a printed back wall earns its place by cutting glare and keeping the branding readable.',
  arizona: 'Sun is the first design problem in Arizona and the monsoon is the second. Outdoor events run mostly from fall to spring, but summer markets still happen at dawn and dusk, and a canopy top is the only shade a vendor has. From roughly June to September the monsoon brings sudden dust and gusts, so weight every leg even on a calm morning. Dye-sublimated fabric holds its colour under that sun, which matters for a top that stays up all season.',
  'british-columbia': 'British Columbia is two climates. On the coast, markets and festivals run through rain for much of the year, so a printed valance and full walls turn a canopy into a dry counter and keep prints from soaking through. In the Okanagan and the interior, summers are hot and dry and the problem flips to shade and airflow. Vancouver waterfront events add steady wind off the water, which is why weights beat stakes on the hard surfaces most venues have.',
  california: 'California covers coastal fog, Central Valley heat and Sierra snow, and a canopy plan changes with each. On the coast, a damp marine layer burns off by midday, then sea wind picks up in the afternoon; inland, summer heat and strong UV make shade the main product. Autumn Santa Ana winds are the one to plan for statewide: anchor every leg and keep walls closed on the windward side. The long event season, from farmers markets to convention-centre lots, means a canopy gets used year round.',
  colorado: 'Altitude changes the job in Colorado. Ultraviolet exposure is intense at elevation, so a printed top that holds its colour matters, and temperatures can swing widely between a sunny morning and a cold evening. Summer afternoons bring fast-building thunderstorms and gusts along the Front Range, so weight every leg and be ready to drop the walls. Brewery festivals, mountain-town markets and Denver convention-centre lots all lean on canopies, often within the same week.',
  florida: 'Florida\'s two seasons for a canopy are afternoon storms and hurricane season. Summer thunderstorms arrive on a near-daily schedule, so a fully printed top and walls keep a booth working through a downpour, and drainage across the roof matters. Hurricane season runs from June to November, and outdoor events are routinely rescheduled, so build slack into order timing. Humidity and salt air near the coast argue for fabric that dries quickly and a frame you rinse after each event.',
  georgia: 'Georgia vendors work through hot, humid summers and a spring pollen season that coats everything in yellow dust, so a canopy that wipes clean and a top that can be hosed down earn their keep. Pop-up thunderstorms are common from late spring through summer. The best outdoor weather, spring and fall, is also festival season, which means Atlanta weekends are crowded and a booth needs a strong read from a distance to be noticed.',
  illinois: 'Illinois outdoor events cluster into a short, busy summer. In Chicago, wind off Lake Michigan is the constant: lakefront festivals and street fairs punish a canopy that is only lightly weighted. Downstate, spring storms can arrive quickly across open ground. The state fair and county fairs fill late summer, so most vendors want a canopy that goes up in minutes, packs flat and survives being moved between weekends without damage to the print.',
  indiana: 'Indiana\'s outdoor calendar is built around racing, fairs and fall tailgates. May around Indianapolis is the busiest stretch, with crowds at open-air events and the weather still unsettled, so weight every leg and keep walls handy for spring showers. Summer county and state fairs mean many consecutive days in one spot, which rewards a sturdy frame. In autumn, tailgate lots are open and gusty, and a bold printed top is how a vendor is spotted across a field of cars.',
  iowa: 'Iowa is open country, and open country means wind. Fairgrounds and town squares offer little shelter, so a canopy here needs a weight bag on each leg and walls that can be dropped quickly when a summer storm rolls across the plains. The Iowa State Fair and the county fair circuit make August the peak, with long hot days in fully exposed lots; a printed top that shades the counter and holds its colour is the most useful thing a vendor can bring.',
  kentucky: 'Kentucky vendors work through warm, humid weather and a spring that can be wet. Derby season brings large outdoor crowds around Louisville, often with showers, so a canopy with printed walls keeps product and paperwork dry. Summer fairs and festivals in Lexington and across the Bluegrass mean long days in heat, where shade and airflow matter as much as branding. Anchor against afternoon gusts ahead of storms, which can arrive fast on open lots.',
  louisiana: 'Louisiana events run in heat, humidity and sudden rain. Festival seasons in spring and fall are the best weather and the biggest crowds, from New Orleans to Lafayette, and booths often stand in the same spot for several days. Tropical storms and hurricane season, June to November, can cancel or move outdoor plans at short notice, so order early and confirm dates. A fast-drying printed top and walls that shed water keep a booth working through the daily shower.',
  manitoba: 'Manitoba pairs a short, bright summer with some of the coldest winters in the country. Winnipeg\'s summer festivals run in long daylight, where a printed back wall gives shade and glare control, while the winter Festival du Voyageur is an outdoor event in February, where walls act as a windbreak for a vendor standing for hours. The open prairie is windy in every season, so weights are not optional and a low-profile setup holds up best.',
  massachusetts: 'Massachusetts weather swings with the season and the coast. Spring road races and outdoor markets around Boston meet cold wind and sudden rain, and nor\'easters can shut an event entirely, so build flexibility into your order date. Summer waterfront festivals bring sea breezes that catch an unweighted canopy, and autumn foliage season fills small-town fairs across the state. A weighted frame and printed walls handle most of it, and the top reads clearly through the shifting light.',
  minnesota: 'Minnesota is built for both extremes. The Minnesota State Fair at the end of summer is one of the largest outdoor gatherings in the country, and lake-country markets keep vendors busy from May to September. In winter, events such as the St. Paul Winter Carnival put vendors outdoors in the cold, where printed walls act as a windbreak. Humid summer storms can roll in quickly, so keep weights on every leg regardless of the forecast.',
  nevada: 'Nevada is desert: strong sun, dry air and wind that picks up without warning. In Las Vegas, outdoor activations sit on asphalt that radiates heat, so a printed top and a closed back wall create real shade, and stakes are useless on the hard surfaces around most venues. Convention season is mostly indoors, but sponsor areas, parking-lot events and festivals use canopies heavily. Dust and wind argue for weight on every leg and a quick set-down plan.',
  'new-york': 'New York spans the dense street fairs of New York City, the lake-effect weather of the north and the fall festivals of the Hudson Valley and beyond. In the city, street closures and sidewalk setups reward a compact canopy that goes up quickly and sits within a permit footprint. Upstate, wind and sudden weather changes are common, and summer fairs run long. A weighted frame, printed walls and a top that reads from down the block cover most of what the state asks of one.',
  ohio: 'Ohio outdoor events follow the fairground calendar. The Ohio State Fair in Columbus and county fairs across the state run for days at a time, in humid summer heat with the occasional fast thunderstorm. Near Lake Erie, wind off the water can catch a canopy in an open lot. A frame that withstands being up for a full week, with weights on every leg and walls ready for a downpour, is the practical requirement here.',
  oklahoma: 'Oklahoma sits in the middle of the country\'s storm belt. Spring severe weather and steady plains wind mean a canopy must be anchored properly and taken down early when storms approach, so quick set-down matters as much as the print. The State Fair of Oklahoma in September and rodeo events draw large outdoor crowds in fading summer heat. A printed top that holds its colour in the sun and a heavy, weighted frame are the two things that matter.',
  ontario: 'Ontario vendors face lake-driven weather and hot, humid summers. In Toronto, wind off Lake Ontario makes weights essential on exposed waterfront sites, and the Canadian National Exhibition at the end of summer is a long outdoor run. Winter events such as Ottawa\'s Winterlude put stalls outside in the cold, where walls help block wind. Province-wide, festivals and farmers\' markets from May to October keep canopies in constant use.',
  oregon: 'Oregon is wet. West of the Cascades, rain can last for much of the year, so a canopy with a full printed top and walls is a working dry space, and markets in Portland and Eugene run through the drizzle. Dry summers bring a different problem, with strong sun and the occasional smoke-hazy day. East of the mountains, wind and sun dominate. Brand colours on a dye-sublimated top stay vivid even after a long wet season.',
  pennsylvania: 'Pennsylvania has four honest seasons and a canopy plan for each. Spring and fall bring the busiest festival and market calendar in Philadelphia and Pittsburgh, with changeable weather and gusts across paved plazas where stakes cannot go. Summer is hot and humid with passing storms. Winter indoor shows dominate, including the Pennsylvania Farm Show in Harrisburg. Weight bags, printed walls and a top that reads at a distance are the useful basics.',
  quebec: 'Québec runs a festival calendar in both summer and winter. Montréal\'s summer events fill the streets from June, and the Carnaval de Québec puts vendors outside in the cold in winter, where printed walls act as a windbreak. Signage in Québec is generally expected to be in French, so plan bilingual or French artwork when you submit your files. Humid summer storms and winter wind both argue for weighted legs and a frame you can set up with gloves on.',
  tennessee: 'Tennessee\'s outdoor events run in heat and humidity, then storms. CMA Fest in Nashville fills downtown in June, when shade and airflow are the real priorities and a printed top becomes the vendor\'s roof for the day. Fall brings crowds to the mountains for foliage season and to Nashville and Memphis for festivals. Afternoon thunderstorms are common through summer, so weight every leg and have the walls ready; dye-sublimated fabric dries quickly afterward.',
  texas: 'Texas is large enough that the weather depends on the city. Houston and the Gulf Coast mean humidity, heavy downpours and a hurricane season to plan around; Dallas and the north see spring storms and strong gusts; West Texas is open, dry and windy. Across the state, summer heat makes shade the first thing a vendor wants, and rodeo, state fair and stadium seasons put canopies in constant use. Weighted legs and a colourfast printed top handle the common ground.',
  utah: 'Utah is high desert with strong sun, thin air and canyon-funnelled wind. Summer markets in Salt Lake City and the valley run in bright, dry heat where shade is the main benefit of a printed top, and afternoon gusts catch an unweighted canopy easily. Winter events in the Wasatch resort towns put vendors outdoors in the cold. Weighted legs, a closed back wall and fabric that holds colour at altitude are the practical requirements.',
  washington: 'Washington splits at the Cascades. West of the mountains, rain is the dominant factor, and Seattle markets and festivals run through it, so a canopy with a printed top and full walls works as a dry stall. East of the mountains, summers are dry and sunny and wind picks up across open ground. Waterfront events add steady breeze off Puget Sound. Seafair and the state fair draw summer crowds, when long days make a bold, visible top worthwhile.',
  wisconsin: 'Wisconsin outdoor events are driven by lakefront festivals and game days. Summerfest in Milwaukee fills the shore in summer, when wind off Lake Michigan is the thing to anchor against, and the Wisconsin State Fair runs across August in heat and humidity. In autumn, tailgates around football games run in cool, gusty weather where walls act as a windbreak. A printed top, a weighted frame and quick set-up between days cover most of what a vendor here needs.',
  wyoming: 'Wyoming is one of the windiest places in the country, which makes weight the first rule of any canopy setup: every leg anchored, walls dropped when gusts build and nothing left unattended. Cheyenne Frontier Days in July is the largest outdoor event in the state, in bright high-altitude sun with fast-changing afternoon weather. The summer season is short, so a rugged frame with a colourfast printed top gets used hard in a few busy months.'
};

// The state intros each end on a near-identical product sentence ("Trade show
// displays, retractable banner stands and step & repeat backdrops fit the halls;
// custom canopy tents brand the outdoor … circuit"). Rendered on 29 indexed
// pages that is shared template, so each page shows only the sentences whose
// wording is not mostly found in another region's intro. The first sentence is
// always kept.
const INTRO_SENT = /(?<=[.!?])\s+(?=[A-Z0-9“"'])/;
const introWords = (t, slug) => {
  const reg = [...states, ...provinces, ...territories].find((r) => r.slug === slug);
  const names = reg ? [reg.name, ...reg.cities] : [];
  let s = t;
  for (const n of names) s = s.split(n).join(' P ');
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
};
const introShingles = (t, slug) => {
  const w = introWords(t, slug);
  const out = new Set();
  for (let i = 0; i + 4 <= w.length; i++) out.add(w.slice(i, i + 4).join(' '));
  return out;
};
let introFreq = null;
export function distinctIntro(slug) {
  const c = stateContent[slug];
  if (!c) return '';
  if (!introFreq) {
    introFreq = new Map();
    for (const [k, v] of Object.entries(stateContent)) {
      for (const sn of v.intro.split(INTRO_SENT)) for (const x of introShingles(sn, k)) introFreq.set(x, (introFreq.get(x) || 0) + 1);
    }
  }
  return c.intro.split(INTRO_SENT).filter((sn, i) => {
    if (i === 0) return true;
    const sh = [...introShingles(sn, slug)];
    return !sh.length || sh.filter((x) => introFreq.get(x) > 1).length / sh.length <= 0.4;
  }).join(' ');
}

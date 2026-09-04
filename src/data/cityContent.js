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
    intro: 'Los Angeles vendors work markets, film-adjacent pop-ups, sports crowds and street festivals across a huge, spread-out city. A printed canopy has to read from a distance in bright sun — dye sublimation keeps color sharp all season.',
    events: ['Weekend markets & swap meets', 'Sports & stadium lots', 'Street festivals', 'Brand activations']
  },
  'san-diego': {
    intro: 'San Diego runs beachfront markets, festivals and tournaments nearly year-round. A canopy with side walls gives shade and wind cover for coastal booths while doubling as branding.',
    events: ['Beach & bay markets', 'Sports tournaments', 'Craft beer & food events', 'Community festivals']
  },
  'san-francisco': {
    intro: 'From Ferry Building-area markets to tech showcases and neighborhood fairs, San Francisco events pack into tight footprints. A clean 10x10 or 10x20 claims a professional booth even in a dense vendor row.',
    events: ['Farmers markets', 'Tech & startup showcases', 'Neighborhood street fairs', 'Pride & cultural festivals']
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
    intro: 'Miami events run outdoors and in strong sun — art fairs, beachfront markets and cultural festivals. Dye-sublimated canopies hold saturated color without fading through a full season.',
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
    intro: 'Chicago packs a short, intense outdoor season with neighborhood fests, lakefront markets and trade shows. A canopy that photographs well and packs down fast makes every summer weekend count.',
    events: ['Neighborhood street fests', 'Lakefront markets', 'Trade & home shows', 'Sports tailgates']
  },
  atlanta: {
    intro: 'Atlanta mixes big expos with city festivals and SEC-season tailgates. Team colors on the top and a logo on the back wall make a booth or tailgate easy to spot in a packed field.',
    events: ['College football tailgates', 'City festivals', 'Farmers & craft markets', 'Trade expos']
  },
  charlotte: {
    intro: 'Charlotte runs craft fairs, motorsports-adjacent events and regional festivals. A dye-sublimated canopy handles humidity and sun so a booth looks consistent across a full season.',
    events: ['Craft & artisan fairs', 'Motorsports & sports events', 'Regional festivals', 'Farmers markets']
  },
  vancouver: {
    intro: 'Vancouver vendors work rain or shine — public and farmers markets, waterfront festivals and neighborhood events across the Lower Mainland. A canopy with printed side walls gives real weather cover and a branded backdrop through a damp, busy market season.',
    events: ['Public & farmers markets', 'Waterfront & park festivals', 'Night markets', 'Community & cultural events']
  },
  toronto: {
    intro: 'Toronto runs a dense event calendar — street festivals across the city, waterfront markets, cultural events and consumer shows. A crisp printed canopy claims a professional booth in a crowded vendor row and packs down fast between weekend events.',
    events: ['Street & neighborhood festivals', 'Waterfront & park markets', 'Cultural & food events', 'Trade & consumer shows']
  },
  calgary: {
    intro: 'Calgary events run big and outdoors — Stampede-season crowds, city festivals, farmers markets and trade expos. A printed canopy with a back wall stands up to wind off the foothills while branding the booth across open grounds.',
    events: ['Stampede & rodeo events', 'City festivals', 'Farmers & artisan markets', 'Trade & home expos']
  },
  montreal: {
    intro: "Montreal's festival season fills the calendar — street festivals, public markets and cultural events across the city. A full-color printed canopy claims a professional, photo-ready booth in a crowded, lively vendor row.",
    events: ['Street & music festivals', 'Public & farmers markets', 'Cultural & food events', 'Trade & consumer shows']
  },
  'birmingham': {
    intro:
      "Birmingham's vendor calendar runs on church fundraisers, university tailgates and a downtown market scene that has grown around the old industrial blocks. Summers are hot and humid enough that shade is the point, not a bonus, so most sellers here run a canopy with at least one wall against afternoon sun.",
    events: ["Church & school fundraisers", "University tailgates", "Downtown weekend markets", "Community festivals"]
  },
  'montgomery': {
    intro:
      "Montgomery events cluster around state government, the river district and a long civil rights heritage tourism season. Vendors work long spring and autumn days when the weather is workable, and a printed canopy has to survive humidity without the graphics going soft.",
    events: ["Riverfront events", "Heritage tourism weekends", "State fair & agricultural shows", "Farmers markets"]
  },
  'huntsville': {
    intro:
      "Huntsville trades on aerospace and defence engineering, so a lot of the local exhibiting is technical: recruiting stands, contractor open days, STEM outreach at schools. Booths here tend to be read up close by people who care what the specification says.",
    events: ["Aerospace & defence recruiting", "STEM outreach days", "Technology open houses", "Rocket City festivals"]
  },
  'mobile': {
    intro:
      "Mobile sits on the Gulf, which means salt air, sudden rain and a Mardi Gras season that dominates the early-year calendar. Anything printed for outdoor use here gets tested by wind off the bay before it gets tested by anything else.",
    events: ["Mardi Gras season events", "Gulf Coast seafood festivals", "Port & maritime trade days", "Beach-adjacent markets"]
  },
  'anchorage': {
    intro:
      "Anchorage packs its outdoor season into a short, bright summer, so vendors work long daylight hours across a few concentrated months. Wind coming off the inlet is the practical constraint — weight matters more here than almost anywhere else.",
    events: ["Summer solstice markets", "Outdoor recreation expos", "Community fairs", "Fishing & sporting events"]
  },
  'fairbanks': {
    intro:
      "Fairbanks runs to extremes: near-continuous daylight in summer, deep cold the rest of the year. Outdoor vendor work compresses into a narrow window, and most indoor exhibiting happens at winter trade events where a banner stand travels better than a tent.",
    events: ["Midnight sun festivals", "Winter indoor trade shows", "Agricultural fairs", "University events"]
  },
  'juneau': {
    intro:
      "Juneau's season is set by the cruise calendar, with vendors working the waterfront while ships are in. It rains a great deal, so covered display and materials that shrug off moisture matter more than they would inland.",
    events: ["Cruise season waterfront stalls", "Arts & crafts markets", "State government events", "Local food festivals"]
  },
  'tucson': {
    intro:
      "Tucson's biggest draw is the winter gem and mineral trade, which fills the city with temporary stands for weeks. The desert sun is punishing on print, so fade resistance and genuine shade are what buyers ask about first.",
    events: ["Gem & mineral show season", "Desert food festivals", "University sporting events", "Winter visitor markets"]
  },
  'mesa': {
    intro:
      "Mesa fills up with winter visitors, and the events calendar follows them — markets, outdoor concerts and community fairs concentrated in the cooler months. Shade is the product being bought as much as the branding.",
    events: ["Winter visitor markets", "Spring training crowds", "Outdoor concert series", "Community festivals"]
  },
  'scottsdale': {
    intro:
      "Scottsdale skews toward higher-end events: golf, art walks, car auctions and corporate hospitality. Presentation standards are visibly higher here, and a booth that looks improvised reads badly against the surroundings.",
    events: ["Golf tournament hospitality", "Art walk & gallery events", "Collector car auctions", "Corporate outdoor events"]
  },
  'chandler': {
    intro:
      "Chandler's economy leans on semiconductor and electronics manufacturing, so much of the local exhibiting is business to business — supplier days, recruiting, technology fairs — alongside a strong suburban festival calendar.",
    events: ["Technology & manufacturing expos", "Supplier open days", "Ostrich Festival & city events", "Neighbourhood markets"]
  },
  'little-rock': {
    intro:
      "Little Rock's event life runs through the river market district and the state capitol calendar. Humidity is the constant; vendors want a canopy that dries out rather than holding damp between weekends.",
    events: ["River market weekends", "State capitol events", "Agricultural shows", "Community fairs"]
  },
  'fayetteville': {
    intro:
      "Fayetteville is a university town with a farmers market that anchors the whole weekend economy, plus game-day crowds that swell the population. Vendors here rotate the same pitch week after week, so equipment durability shows up quickly.",
    events: ["Farmers market season", "University game days", "Music & arts festivals", "Craft fairs"]
  },
  'fort-smith': {
    intro:
      "Fort Smith mixes manufacturing, river trade and a heritage tourism thread along the old frontier sites. Outdoor events run spring and autumn, avoiding the worst of the summer heat.",
    events: ["Heritage & frontier events", "Manufacturing trade days", "Riverfront festivals", "Regional fairs"]
  },
  'colorado-springs': {
    intro:
      "Colorado Springs sits high enough that sun exposure is noticeably harsher than the altitude suggests, and afternoon storms arrive quickly in summer. Military and Olympic training connections give the city a steady run of sporting and recruiting events.",
    events: ["Military & veteran events", "Sporting & training events", "Mountain town festivals", "Farmers markets"]
  },
  'aurora': {
    intro:
      "Aurora's events skew community and multicultural, with a calendar spread across a large suburban footprint rather than one central district. Vendors often work several neighbourhoods in a season, so setup speed matters.",
    events: ["Multicultural community festivals", "Neighbourhood markets", "Sports tournaments", "School & youth events"]
  },
  'fort-collins': {
    intro:
      "Fort Collins pairs a university with a well-known craft brewing scene, and the two feed an outdoor event calendar that runs hard from late spring. Wind coming down off the foothills is the thing that catches people out.",
    events: ["Craft brewing festivals", "University events", "Old Town markets", "Cycling & outdoor events"]
  },
  'boulder': {
    intro:
      "Boulder's crowd is outdoors-minded and design-literate, and the events reflect it: trail races, sustainability fairs, farmers markets with a long waiting list for pitches. Intense sun at altitude is hard on cheap print.",
    events: ["Trail & endurance races", "Sustainability expos", "Pearl Street events", "University activities"]
  },
  'hartford': {
    intro:
      "Hartford runs on insurance and government, which shows in the exhibiting: corporate recruiting, conference stands and civic events rather than street trading. Autumn is the busiest outdoor stretch before the weather closes in.",
    events: ["Insurance & corporate events", "State government days", "Autumn festivals", "Convention exhibiting"]
  },
  'new-haven': {
    intro:
      "New Haven's calendar is shaped by the university year and a food scene that draws people downtown. Coastal damp and salt air are the practical concerns for anything left standing overnight.",
    events: ["University events", "Food & restaurant festivals", "Green markets", "Arts & ideas programming"]
  },
  'stamford': {
    intro:
      "Stamford is corporate and commuter-facing, with a lot of exhibiting aimed at business audiences and a summer programme along the waterfront. Booths here compete with polished corporate neighbours.",
    events: ["Corporate & finance events", "Waterfront summer series", "Business expos", "Community markets"]
  },
  'wilmington': {
    intro:
      "Wilmington's business calendar is heavy on corporate and legal services, with riverfront programming carrying the outdoor season. Humid summers and a short autumn set the practical window.",
    events: ["Riverfront summer events", "Corporate & legal conferences", "Community markets", "Cultural festivals"]
  },
  'dover': {
    intro:
      "Dover's year is punctuated by motorsport weekends and state government activity, which brings large temporary crowds to a small city. Vendors working race weekends need something that goes up fast and holds in open ground.",
    events: ["Motorsport race weekends", "State capital events", "Agricultural fairs", "Community festivals"]
  },
  'newark': {
    intro:
      "Newark is a university town where the student calendar drives footfall, with markets and campus events filling the term-time weekends.",
    events: ["University campus events", "Student-season markets", "Community fairs", "Local food events"]
  },
  'sacramento': {
    intro:
      "Sacramento's farm-to-fork identity gives the city an unusually strong market calendar, backed by state government events that run year-round. Summers are dry and genuinely hot, so vendors buy shade first and branding second.",
    events: ["Farm-to-fork markets", "State capitol events", "Agricultural shows", "Riverfront festivals"]
  },
  'san-jose': {
    intro:
      "San Jose exhibiting leans corporate and technical — supplier days, recruiting stands and product launches tied to the wider valley. Outdoor events run late into the year thanks to a long dry season.",
    events: ["Technology expos & launches", "Corporate recruiting", "Community & cultural festivals", "Sports tournaments"]
  },
  'denver': {
    intro:
      "Denver sits high enough that sun is harsh and afternoon storms build fast in summer. The city's outdoor season is intense and short-tempered, and vendors here talk about wind and weight before they talk about print.",
    events: ["Outdoor festivals & markets", "Brewery & food events", "Sports & stadium crowds", "Convention exhibiting"]
  },
  'bridgeport': {
    intro:
      "Bridgeport's events sit on the water and lean community — waterfront concerts, neighbourhood markets and school fundraisers. Coastal damp is the constant, so anything stored between weekends needs to dry properly.",
    events: ["Waterfront concerts", "Neighbourhood markets", "School fundraisers", "Cultural festivals"]
  },
  'tampa': {
    intro:
      "Tampa runs a long outdoor season broken by afternoon storms that arrive with very little warning. Vendors want something that goes down fast and comes back up dry, and print that survives constant UV.",
    events: ["Waterfront festivals", "Sports & tailgate crowds", "Convention exhibiting", "Farmers markets"]
  },
  'jacksonville': {
    intro:
      "Jacksonville spreads over a huge area, so vendors often work several districts rather than one central pitch. Heat, humidity and river breezes shape what holds up through a full weekend.",
    events: ["Riverfront events", "Football tailgates", "Beach-adjacent markets", "Community festivals"]
  },
  'fort-lauderdale': {
    intro:
      "Fort Lauderdale's calendar runs on boating, tourism and a dense winter season when visitor numbers climb. Salt air and strong sun are hard on cheap hardware and cheaper print.",
    events: ["Boat & marine shows", "Beachfront events", "Winter visitor markets", "Art & food festivals"]
  },
  'savannah': {
    intro:
      "Savannah's historic squares and tourism trade give vendors a steady, walkable market scene, with St Patrick's celebrations dominating the spring. Humidity is relentless through the summer months.",
    events: ["St Patrick's season events", "Historic district markets", "Food & tourism festivals", "Waterfront craft fairs"]
  },
  'augusta': {
    intro:
      "Augusta's year is shaped by a golf week that transforms the city, plus a steady run of river-district events either side of it. Spring is the busy window before the heat sets in.",
    events: ["Golf week hospitality", "Riverwalk events", "Community festivals", "Regional trade shows"]
  },
  'columbus': {
    intro:
      "Columbus pairs a military base with a river-sports tourism thread, so events range from recruiting days to whitewater weekends. Long humid summers keep shade at the front of every vendor's list.",
    events: ["Military & family events", "Whitewater & outdoor sports", "Riverfront festivals", "Community markets"]
  },
  'honolulu': {
    intro:
      "Honolulu vendors work salt air, trade winds and year-round sun — a combination that finds any weakness in hardware quickly. The event calendar is steady rather than seasonal, which means equipment gets used hard.",
    events: ["Beachside markets", "Cultural & hula festivals", "Tourism & visitor events", "Sporting events"]
  },
  'hilo': {
    intro:
      "Hilo is one of the wetter towns in the country, and its market scene is built around that: covered stalls, quick setup, and materials that do not mind being packed away damp.",
    events: ["Farmers markets", "Cultural festivals", "Craft & maker fairs", "Community events"]
  },
  'kailua': {
    intro:
      "Kailua's events are beach-facing and wind-exposed, with a steady visitor trade through the year. Anchoring matters more here than in most places a canopy gets used.",
    events: ["Beach & shoreline events", "Weekend craft markets", "Outdoor fitness events", "Community fairs"]
  },
  'boise': {
    intro:
      "Boise's outdoor season is dry and bright, with a downtown market that anchors the weekend and a growing tech and outdoor-industry event calendar alongside it.",
    events: ["Downtown farmers market", "Outdoor recreation expos", "Technology & startup events", "River & park festivals"]
  },
  'meridian': {
    intro:
      "Meridian has grown quickly, and its events are suburban and family-centred — school fundraisers, sports tournaments and neighbourhood markets spread across a wide footprint.",
    events: ["Youth sports tournaments", "School & community fundraisers", "Suburban markets", "Seasonal fairs"]
  },
  'nampa': {
    intro:
      "Nampa's calendar is agricultural at its core, with rodeo and county fair weekends drawing the biggest crowds of the year. Dust and sun are the practical concerns.",
    events: ["County fair & rodeo", "Agricultural trade days", "Community festivals", "Farmers markets"]
  },
  'naperville': {
    intro:
      "Naperville's riverwalk and suburban affluence give it a polished event calendar — art fairs, food festivals and school events where presentation standards are high.",
    events: ["Riverwalk art fairs", "Food & wine festivals", "School & youth events", "Community markets"]
  },
  'springfield': {
    intro:
      "Springfield's events revolve around state government and a strong agricultural fair tradition, with summer humidity setting the practical limits on outdoor work.",
    events: ["State fair", "Government & civic events", "Historic tourism weekends", "Farmers markets"]
  },
  'indianapolis': {
    intro:
      "Indianapolis is a convention and motorsport city, so vendors here move between indoor exhibiting and large open-ground race weekends. The two need quite different kit.",
    events: ["Motorsport race weekends", "Convention exhibiting", "Sports tournaments", "Downtown markets"]
  },
  'fort-wayne': {
    intro:
      "Fort Wayne's events lean community and manufacturing — supplier days, county fairs and a summer festival run that fills the riverfront.",
    events: ["Riverfront summer festivals", "Manufacturing trade days", "County fairs", "Community markets"]
  },
  'evansville': {
    intro:
      "Evansville sits on the Ohio River, and its biggest weekends are river festivals and fairs where vendors work long, humid days in open ground.",
    events: ["River festivals", "Fall fairs", "Community events", "Farmers markets"]
  },
  'des-moines': {
    intro:
      "Des Moines runs on insurance, agriculture and a state fair that dominates late summer. Vendors here work a compressed outdoor season with real weather at both ends of it.",
    events: ["State fair", "Downtown farmers market", "Insurance & corporate events", "Agricultural shows"]
  },
  'cedar-rapids': {
    intro:
      "Cedar Rapids pairs food processing and manufacturing with a community event calendar that leans heavily on summer. Wind across open ground is the usual complaint.",
    events: ["Summer street festivals", "Manufacturing open days", "Farmers markets", "Community fairs"]
  },
  'davenport': {
    intro:
      "Davenport's Mississippi riverfront carries most of the outdoor calendar, with flooding a genuine seasonal consideration for anyone booking a pitch near the water.",
    events: ["Riverfront festivals", "Baseball & sports crowds", "Community markets", "Regional fairs"]
  },
  'wichita': {
    intro:
      "Wichita's aviation manufacturing gives it a technical exhibiting scene alongside a strong river festival tradition. Open plains wind is the defining outdoor condition.",
    events: ["Aviation & manufacturing expos", "River festival season", "Agricultural shows", "Community markets"]
  },
  'kansas-city': {
    intro:
      "Kansas City's barbecue and sports culture fills the calendar with tailgates, competitions and street events. Summers are humid and winters bite, so the outdoor window is well defined.",
    events: ["Barbecue competitions", "Sports tailgates", "Street & arts festivals", "Farmers markets"]
  },
  'overland-park': {
    intro:
      "Overland Park's events are suburban and corporate — business parks, youth sports and a well-established farmers market, spread across a wide, car-dependent area.",
    events: ["Corporate & business park events", "Youth sports tournaments", "Farmers markets", "Community festivals"]
  },
  'topeka': {
    intro:
      "Topeka's calendar is built around state government and county fairs, with a compact downtown that hosts most of the city-run outdoor events.",
    events: ["State government events", "County fairs", "Downtown markets", "Community festivals"]
  },
  'louisville': {
    intro:
      "Louisville's spring is dominated by racing and the festival weeks around it, which bring large hospitality builds and a crowded vendor scene. Humidity runs high through the summer.",
    events: ["Racing season hospitality", "Bourbon & food festivals", "Street festivals", "Farmers markets"]
  },
  'lexington': {
    intro:
      "Lexington's horse industry shapes its event calendar — sales, shows and equestrian weekends where presentation is taken seriously and stands sit on open grass.",
    events: ["Equestrian events & sales", "Bourbon trail tourism", "University events", "Farmers markets"]
  },
  'bowling-green': {
    intro:
      "Bowling Green mixes automotive manufacturing with a university calendar, giving it a mix of technical exhibiting and student-season community events.",
    events: ["Automotive & manufacturing events", "University activities", "Community festivals", "Regional fairs"]
  },
  'new-orleans': {
    intro:
      "New Orleans has one of the densest event calendars anywhere — carnival season, festival weekends and a constant convention trade. Heat, humidity and sudden rain are all givens.",
    events: ["Carnival season", "Music & food festivals", "Convention exhibiting", "French Quarter events"]
  },
  'baton-rouge': {
    intro:
      "Baton Rouge combines state government, petrochemical industry and university game days. Summer humidity is severe, and afternoon storms are routine rather than exceptional.",
    events: ["University game days", "State government events", "Industrial trade days", "Community festivals"]
  },
  'shreveport': {
    intro:
      "Shreveport's calendar runs on riverfront entertainment, regional fairs and a long humid summer that pushes most outdoor events to the shoulder seasons.",
    events: ["Riverfront events", "State fair", "Music festivals", "Community markets"]
  },
  'lafayette': {
    intro:
      "Lafayette's Cajun and Creole festival tradition gives it a busy, food-led event calendar. Vendors work crowded rows where a canopy has to be seen from the end of the street.",
    events: ["Festival season", "Food & music events", "Farmers markets", "Community fairs"]
  },
  'portland': {
    intro:
      "Portland's coastal weather makes rain planning routine rather than optional, and its working waterfront gives the calendar a strong seafood and maritime thread.",
    events: ["Seafood & maritime festivals", "Waterfront markets", "Craft & maker fairs", "Summer concert series"]
  },
  'lewiston': {
    intro:
      "Lewiston's events are community-scale and mill-town in character, with a short but well-used summer season and a strong autumn fair tradition.",
    events: ["Community festivals", "Autumn fairs", "Farmers markets", "School & youth events"]
  },
  'bangor': {
    intro:
      "Bangor draws from a wide rural catchment, so its fairs and waterfront concerts pull people in from a long way out. The outdoor season is short and taken seriously.",
    events: ["Waterfront concerts", "Regional fairs", "Farmers markets", "Community events"]
  },
  'baltimore': {
    intro:
      "Baltimore's harbour events and neighbourhood festivals run through a humid summer, with a strong crab-and-seafood thread through the calendar. Wind off the water is a real factor at the piers.",
    events: ["Harbour & waterfront festivals", "Neighbourhood street fairs", "Seafood events", "Convention exhibiting"]
  },
  'frederick': {
    intro:
      "Frederick's historic downtown carries a busy market and art-walk calendar, and the surrounding agricultural county adds fairs through late summer.",
    events: ["Downtown art walks", "Farmers markets", "County fairs", "Craft & maker events"]
  },
  'rockville': {
    intro:
      "Rockville's events are suburban and professional, shaped by biotech and federal-adjacent employers alongside a well-attended community festival calendar.",
    events: ["Biotech & corporate events", "Community festivals", "Farmers markets", "School events"]
  },
  'annapolis': {
    intro:
      "Annapolis is a sailing town, and the calendar shows it — boat shows, waterfront events and a naval academy presence. Wind off the bay is constant and unforgiving to light hardware.",
    events: ["Boat shows", "Waterfront events", "Naval academy weekends", "Historic district markets"]
  },
  'boston': {
    intro:
      "Boston's event season is compressed by winter, so spring and autumn are crowded. Marathon weekend, university calendars and a dense convention trade all compete for the same weeks.",
    events: ["Marathon & road races", "University events", "Convention exhibiting", "Harbour festivals"]
  },
  'worcester': {
    intro:
      "Worcester's colleges and manufacturing base give it a mixed calendar, with community festivals filling a summer that arrives late and leaves early.",
    events: ["College events", "Manufacturing trade days", "Summer street festivals", "Farmers markets"]
  },
  'cambridge': {
    intro:
      "Cambridge exhibiting is academic and technical — research symposia, startup demo days, recruiting stands. Audiences read the detail on a stand rather than glancing at it.",
    events: ["Research & academic events", "Startup demo days", "Recruiting fairs", "Square street festivals"]
  },
  'detroit': {
    intro:
      "Detroit's automotive heritage anchors a serious exhibiting calendar, and the city's festival scene fills the riverfront through summer. Lake-driven weather turns quickly.",
    events: ["Automotive shows", "Riverfront festivals", "Music events", "Community markets"]
  },
  'grand-rapids': {
    intro:
      "Grand Rapids built an art-driven event identity, and the furniture and brewing industries add trade exhibiting on top. Autumn is the busiest and most competitive season.",
    events: ["Art competition season", "Brewery festivals", "Furniture & design trade shows", "Farmers markets"]
  },
  'ann-arbor': {
    intro:
      "Ann Arbor's art fair week and football Saturdays are the two poles of the calendar, both bringing very large crowds into a compact area where pitch space is tight.",
    events: ["Art fair week", "Football game days", "University events", "Farmers markets"]
  },
  'lansing': {
    intro:
      "Lansing pairs state government with automotive manufacturing, giving it civic events and supplier days in roughly equal measure. Winters cut the outdoor season short.",
    events: ["State government events", "Automotive supplier days", "Community festivals", "Farmers markets"]
  },
  'minneapolis': {
    intro:
      "Minneapolis compresses its outdoor trading into a short, bright summer, and the calendar is packed accordingly. Lakes and open plazas mean wind is a live concern even on a still-looking day.",
    events: ["Lakeside summer festivals", "Street & arts fairs", "Sports crowds", "Farmers markets"]
  },
  'saint-paul': {
    intro:
      "Saint Paul's state capitol and a winter carnival tradition give it a calendar that does not fully shut down in the cold, though outdoor vendor work still clusters in summer.",
    events: ["Winter carnival events", "State capitol days", "Neighbourhood festivals", "Farmers markets"]
  },
  'rochester': {
    intro:
      "Rochester's medical sector shapes its exhibiting — conferences, recruiting and health fairs — with a compact downtown market scene alongside it.",
    events: ["Medical conferences", "Health & wellness fairs", "Downtown markets", "Community festivals"]
  },
  'duluth': {
    intro:
      "Duluth sits on Lake Superior, where wind and sudden temperature swings are routine. The season is short, the events are outdoor and hardy, and equipment gets judged on how it copes.",
    events: ["Lakefront festivals", "Endurance races", "Harbour & maritime events", "Craft markets"]
  },
  'jackson': {
    intro:
      "Jackson's calendar runs on state government, agricultural shows and a long humid summer that pushes most outdoor trading toward spring and autumn.",
    events: ["State fair & agricultural shows", "Government & civic events", "Music festivals", "Community markets"]
  },
  'gulfport': {
    intro:
      "Gulfport works the coast, which means salt air, hurricane-season awareness and a beach event calendar that fills the warmer months.",
    events: ["Beachfront festivals", "Seafood events", "Casino & entertainment weekends", "Community fairs"]
  },
  'southaven': {
    intro:
      "Southaven's events lean suburban and sporting, drawing from the wider metro area rather than a historic centre. Summer humidity sets the practical limits.",
    events: ["Youth sports tournaments", "Community festivals", "Suburban markets", "Regional trade events"]
  },
  'st-louis': {
    intro:
      "St Louis has a strong neighbourhood festival tradition and a serious sporting calendar. Humidity is heavy in high summer, and river-adjacent pitches deal with their own weather.",
    events: ["Neighbourhood festivals", "Baseball & sports crowds", "Riverfront events", "Farmers markets"]
  },
  'columbia': {
    intro:
      "Columbia is a university town where the academic year drives footfall, with a downtown market and game-day crowds carrying most of the vendor calendar.",
    events: ["University game days", "Downtown markets", "Arts & music festivals", "Community fairs"]
  },
  'billings': {
    intro:
      "Billings serves a wide rural catchment, so fairs and rodeo weekends draw from a long way out. Wind across open ground is the defining condition here.",
    events: ["Rodeo & fair weekends", "Agricultural trade shows", "Community festivals", "Farmers markets"]
  },
  'missoula': {
    intro:
      "Missoula's outdoor culture and university calendar shape a season that runs hard from late spring, with a downtown market that anchors the weekends.",
    events: ["Downtown farmers market", "University events", "Outdoor recreation festivals", "Music events"]
  },
  'bozeman': {
    intro:
      "Bozeman has grown fast around outdoor recreation and a university, and its events reflect both. High-altitude sun is harder on print than visitors expect.",
    events: ["Outdoor recreation expos", "University events", "Summer street festivals", "Farmers markets"]
  },
  'omaha': {
    intro:
      "Omaha's calendar is anchored by a college baseball series that fills the city each summer, alongside a steady agricultural and corporate exhibiting trade.",
    events: ["College baseball series", "Agricultural shows", "Corporate events", "Farmers markets"]
  },
  'lincoln': {
    intro:
      "Lincoln pairs state government with university football Saturdays that transform the city. Open-plains wind is a constant for anyone pitching outdoors.",
    events: ["Football game days", "State government events", "Agricultural fairs", "Downtown markets"]
  },
  'bellevue': {
    intro:
      "Bellevue's events are shaped by a large military presence and a suburban family calendar, with community fairs and youth sport filling most weekends.",
    events: ["Military & family events", "Youth sports tournaments", "Community fairs", "Farmers markets"]
  },
  'reno': {
    intro:
      "Reno's event scene mixes casino-driven entertainment with car culture and a striking high-desert climate — hot days, cold nights and sun that punishes cheap print.",
    events: ["Classic car events", "Casino & entertainment weekends", "Outdoor festivals", "Trade shows"]
  },
  'henderson': {
    intro:
      "Henderson's calendar is suburban and steady, running events through the cooler months when the desert heat allows people to stand outside comfortably.",
    events: ["Winter & spring festivals", "Community markets", "Youth sports events", "Corporate outdoor events"]
  },
  'manchester': {
    intro:
      "Manchester's mill-town core hosts a compact downtown event calendar, with a short summer season and a strong autumn fair tradition either side of it.",
    events: ["Downtown festivals", "Autumn fairs", "Farmers markets", "Community events"]
  },
  'nashua': {
    intro:
      "Nashua's events lean community and family, spread across a suburban footprint, with the summer window shorter than sellers from further south expect.",
    events: ["Summer street festivals", "Farmers markets", "School & youth events", "Craft fairs"]
  },
  'concord': {
    intro:
      "Concord's state capitol calendar and a compact main street give the city civic events and markets in roughly equal measure through a brief warm season.",
    events: ["State capitol events", "Main street markets", "Community festivals", "Craft fairs"]
  },
  'jersey-city': {
    intro:
      "Jersey City's waterfront events look across at Manhattan, and the wind off the Hudson is a genuine planning factor. The calendar is dense, diverse and tightly packed into public space.",
    events: ["Waterfront festivals", "Multicultural street fairs", "Farmers markets", "Corporate outdoor events"]
  },
  'trenton': {
    intro:
      "Trenton's events centre on state government and a riverfront programme, with community festivals filling the summer weekends.",
    events: ["State capitol events", "Riverfront festivals", "Community markets", "Cultural events"]
  },
  'atlantic-city': {
    intro:
      "Atlantic City works the boardwalk and convention trade together, and the ocean wind is a constant that catches out anyone who has only pitched inland.",
    events: ["Boardwalk events", "Convention exhibiting", "Beach festivals", "Entertainment weekends"]
  },
  'albuquerque': {
    intro:
      "Albuquerque's balloon season is the anchor of the year, and the high desert brings intense sun, cold mornings and dust. Print fades fast here if the material is wrong.",
    events: ["Balloon fiesta season", "Southwest arts & craft markets", "Cultural festivals", "Outdoor sporting events"]
  },
  'santa-fe': {
    intro:
      "Santa Fe's arts market tradition sets a high bar for how a stand looks, and the altitude means strong sun and cool evenings in the same day.",
    events: ["Arts & craft markets", "Cultural festivals", "Gallery & studio events", "Food festivals"]
  },
  'las-cruces': {
    intro:
      "Las Cruces trades on agriculture and a border-region festival calendar, with heat and dust the practical limits on outdoor work through high summer.",
    events: ["Agricultural fairs", "Chile & harvest festivals", "University events", "Farmers markets"]
  },
  'buffalo': {
    intro:
      "Buffalo's season is defined by winter, so the outdoor calendar is crowded into the months that remain. Lake wind is a serious consideration on the waterfront.",
    events: ["Waterfront summer festivals", "Sports tailgates", "Food & wing festivals", "Farmers markets"]
  },
  'albany': {
    intro:
      "Albany's state government calendar runs year-round, with outdoor markets and festivals concentrated into a summer that arrives late.",
    events: ["State government events", "Summer festivals", "Farmers markets", "Community fairs"]
  },
  'syracuse': {
    intro:
      "Syracuse gets serious snow, so the outdoor season is short and heavily used. The state fair is the single biggest fixture in the local vendor year.",
    events: ["State fair", "University events", "Summer street festivals", "Farmers markets"]
  },
  'raleigh': {
    intro:
      "Raleigh's research and university employers give it a technical exhibiting calendar, alongside a downtown market scene that runs most of the year in a mild climate.",
    events: ["Research & technology events", "University activities", "Downtown markets", "Food festivals"]
  },
  'greensboro': {
    intro:
      "Greensboro's furniture and textile heritage still shapes its trade calendar, and a central location makes it a regular stop for regional shows.",
    events: ["Regional trade shows", "Furniture & textile events", "Community festivals", "Farmers markets"]
  },
  'durham': {
    intro:
      "Durham's tobacco warehouses turned into an event district, and the university and research park add a steady professional exhibiting trade on top.",
    events: ["Research & university events", "Food & music festivals", "Farmers markets", "Startup showcases"]
  },
  'fargo': {
    intro:
      "Fargo's winters are severe and its summers short, so the outdoor calendar is compressed and busy. Wind across flat open ground is the constant.",
    events: ["Summer street fairs", "Agricultural shows", "Community festivals", "Farmers markets"]
  },
  'bismarck': {
    intro:
      "Bismarck's state government and agricultural calendars carry the year, with outdoor events concentrated in a brief, bright summer.",
    events: ["State capitol events", "Agricultural fairs", "Riverfront festivals", "Community markets"]
  },
  'grand-forks': {
    intro:
      "Grand Forks pairs a university with a farming catchment, and the season is short enough that vendors make the most of every workable weekend.",
    events: ["University events", "Agricultural shows", "Summer festivals", "Farmers markets"]
  },
  'cleveland': {
    intro:
      "Cleveland's lakefront events run through a summer that has to carry the whole year. Wind off Lake Erie is a real planning factor, not a footnote.",
    events: ["Lakefront festivals", "Sports crowds", "Neighbourhood street fairs", "Convention exhibiting"]
  },
  'cincinnati': {
    intro:
      "Cincinnati's riverfront and a strong German festival heritage fill the late-summer calendar, with humidity heavy through the peak weeks.",
    events: ["Oktoberfest & heritage events", "Riverfront festivals", "Sports crowds", "Farmers markets"]
  },
  'toledo': {
    intro:
      "Toledo's glass-industry heritage and a lakefront location give it a mixed calendar of trade events and summer festivals, with lake weather turning quickly.",
    events: ["Lakefront festivals", "Manufacturing trade days", "Community events", "Farmers markets"]
  },
  'oklahoma-city': {
    intro:
      "Oklahoma City's calendar runs on rodeo, state fair weeks and a downtown district that has grown into the main event space. Wind here is genuinely severe.",
    events: ["State fair & rodeo", "Downtown district events", "Sports crowds", "Farmers markets"]
  },
  'tulsa': {
    intro:
      "Tulsa's art deco downtown hosts a busy festival calendar, and the surrounding energy industry adds trade exhibiting through the year.",
    events: ["Downtown arts festivals", "Energy industry trade shows", "Music events", "Farmers markets"]
  },
  'norman': {
    intro:
      "Norman's university football Saturdays dominate the autumn, filling the town with tailgates and temporary stands across open ground.",
    events: ["Football tailgates", "University events", "Arts festivals", "Farmers markets"]
  },
  'salem': {
    intro:
      "Salem's state capitol calendar and surrounding agriculture give it civic events and harvest fairs, in a climate where rain planning is simply routine.",
    events: ["State capitol events", "Harvest & agricultural fairs", "Farmers markets", "Community festivals"]
  },
  'eugene': {
    intro:
      "Eugene's track and field heritage and a long-running Saturday market give the city a distinctive calendar. Rain is expected for much of the year.",
    events: ["Track & field events", "Saturday market", "University activities", "Music festivals"]
  },
  'bend': {
    intro:
      "Bend's outdoor recreation economy fills the calendar with races, brewery events and markets, at an altitude where sun is stronger than the temperature suggests.",
    events: ["Outdoor recreation races", "Brewery festivals", "Farmers markets", "Community events"]
  },
  'philadelphia': {
    intro:
      "Philadelphia's neighbourhood festival culture is dense and long-established, and the convention trade runs alongside it. Summers are humid, and pitch space in the older districts is tight.",
    events: ["Neighbourhood street festivals", "Convention exhibiting", "Sports crowds", "Farmers markets"]
  },
  'pittsburgh': {
    intro:
      "Pittsburgh's rivers and bridges shape where events happen, and the city's arts and food festival scene fills the warmer months. Hills make load-in harder than the map suggests.",
    events: ["Riverfront festivals", "Arts & food events", "Sports crowds", "Farmers markets"]
  },
  'allentown': {
    intro:
      "Allentown's fair tradition and a manufacturing base give it a mix of agricultural weekends and trade days through a moderate season.",
    events: ["County fair", "Manufacturing trade days", "Community festivals", "Farmers markets"]
  },
  'harrisburg': {
    intro:
      "Harrisburg's state government calendar and a large farm show complex make it a regular stop for regional exhibiting, indoors and out.",
    events: ["Farm show & agricultural events", "State government days", "Riverfront festivals", "Community markets"]
  },
  'providence': {
    intro:
      "Providence's arts scene and a well-known river event give the city a distinctive summer calendar, with coastal damp affecting anything stored between weekends.",
    events: ["Riverfront arts events", "Food & restaurant festivals", "University events", "Farmers markets"]
  },
  'warwick': {
    intro:
      "Warwick's coastal position and airport proximity give it a mix of community events and regional trade shows, with salt air a factor near the water.",
    events: ["Coastal community events", "Regional trade shows", "Farmers markets", "Seasonal fairs"]
  },
  'cranston': {
    intro:
      "Cranston's events are neighbourhood-scale and family-centred, filling a summer season that is short by southern standards.",
    events: ["Neighbourhood festivals", "School & youth events", "Farmers markets", "Craft fairs"]
  },
  'charleston': {
    intro:
      "Charleston's tourism trade and food festival culture keep vendors busy most of the year, though summer humidity and hurricane-season awareness shape planning.",
    events: ["Food & wine festivals", "Historic district markets", "Wedding & hospitality events", "Waterfront festivals"]
  },
  'greenville': {
    intro:
      "Greenville's downtown revival made it a regional event destination, with a mild climate that stretches the outdoor season at both ends.",
    events: ["Downtown festivals", "Farmers markets", "Cycling & outdoor events", "Community fairs"]
  },
  'myrtle-beach': {
    intro:
      "Myrtle Beach works a tourist season where the crowd turns over weekly, and the ocean wind is a constant. Anchoring is the first conversation, not the last.",
    events: ["Beachfront events", "Golf tournament hospitality", "Craft & vendor markets", "Summer festivals"]
  },
  'sioux-falls': {
    intro:
      "Sioux Falls draws from a wide rural region, and its summer calendar is busy in proportion to how short it is. Wind is a permanent consideration.",
    events: ["Summer festivals", "Agricultural shows", "Farmers markets", "Community events"]
  },
  'rapid-city': {
    intro:
      "Rapid City sits beside the Black Hills, and its calendar is shaped by tourism and a motorcycle rally season that transforms the region each summer.",
    events: ["Motorcycle rally season", "Tourism & heritage events", "Farmers markets", "Community fairs"]
  },
  'pierre': {
    intro:
      "Pierre's state government calendar carries the year in a small city, with river and agricultural events filling the brief warm season.",
    events: ["State capitol events", "Agricultural fairs", "River events", "Community markets"]
  },
  'nashville': {
    intro:
      "Nashville's music calendar keeps the city busy year-round, and its festival weekends are crowded, hot and highly visual. A stand has to hold its own against a lot of competing branding.",
    events: ["Music festivals", "Convention exhibiting", "Food & drink events", "Farmers markets"]
  },
  'memphis': {
    intro:
      "Memphis runs on music and barbecue events, with a river festival season that draws large crowds into humid, open riverside ground.",
    events: ["Barbecue competitions", "Music festivals", "Riverfront events", "Farmers markets"]
  },
  'knoxville': {
    intro:
      "Knoxville's university football and a walkable market square shape the calendar, with the surrounding mountains adding an outdoor recreation thread.",
    events: ["Football game days", "Market square events", "Outdoor recreation festivals", "Farmers markets"]
  },
  'chattanooga': {
    intro:
      "Chattanooga's riverfront and outdoor economy fill the calendar with races, markets and festivals, in a valley climate that holds humidity through summer.",
    events: ["Riverfront festivals", "Outdoor & climbing events", "Farmers markets", "Community fairs"]
  },
  'san-antonio': {
    intro:
      "San Antonio's fiesta season and river tourism keep vendors working through a long, hot year. Shade is a functional requirement here, not a nice-to-have.",
    events: ["Fiesta season", "River walk events", "Rodeo & livestock shows", "Farmers markets"]
  },
  'fort-worth': {
    intro:
      "Fort Worth's stockyards and rodeo culture anchor the calendar, and the region's heat and wind together decide what equipment survives a season.",
    events: ["Rodeo & stock shows", "Stockyards events", "Music festivals", "Farmers markets"]
  },
  'salt-lake-city': {
    intro:
      "Salt Lake City's altitude brings sharp sun and quick weather changes, and the calendar mixes outdoor recreation, conventions and a strong community festival scene.",
    events: ["Outdoor recreation expos", "Convention exhibiting", "Community festivals", "Farmers markets"]
  },
  'provo': {
    intro:
      "Provo's university calendar shapes the year, with community events and a well-attended freedom festival filling the summer weeks.",
    events: ["University events", "Summer freedom festival", "Community markets", "Youth sports"]
  },
  'west-valley-city': {
    intro:
      "West Valley City's events are community and multicultural in character, spread across a suburban area where vendors work several neighbourhoods a season.",
    events: ["Multicultural festivals", "Community markets", "Youth sports tournaments", "Seasonal fairs"]
  },
  'burlington': {
    intro:
      "Burlington's lakefront and a pedestrian marketplace give it a compact, busy summer calendar, with the season shorter than most vendors would like.",
    events: ["Lakefront festivals", "Marketplace events", "Farmers markets", "University activities"]
  },
  'montpelier': {
    intro:
      "Montpelier is small and state-government-centred, with a farmers market and seasonal festivals carrying most of the local vendor trade.",
    events: ["State capitol events", "Farmers markets", "Seasonal festivals", "Craft fairs"]
  },
  'rutland': {
    intro:
      "Rutland's agricultural fair tradition and a surrounding recreation economy shape a calendar that peaks sharply in late summer and autumn.",
    events: ["Agricultural fairs", "Autumn festivals", "Farmers markets", "Community events"]
  },
  'virginia-beach': {
    intro:
      "Virginia Beach works an oceanfront season where wind and salt are constant. The event calendar is dense through summer and drops away quickly after it.",
    events: ["Oceanfront festivals", "Surf & sporting events", "Military & family events", "Craft markets"]
  },
  'richmond': {
    intro:
      "Richmond's state government calendar and a strong food and arts scene fill the year, with humid summers pushing outdoor work toward the shoulder seasons.",
    events: ["State capitol events", "Food & arts festivals", "Riverfront events", "Farmers markets"]
  },
  'norfolk': {
    intro:
      "Norfolk's naval presence and waterfront shape the calendar, and wind off the harbour is a routine consideration for anyone pitching near the water.",
    events: ["Naval & military events", "Waterfront festivals", "Maritime trade shows", "Community markets"]
  },
  'arlington': {
    intro:
      "Arlington's events are professional and federal-adjacent, with community festivals and farmers markets filling a calendar shaped by the wider capital region.",
    events: ["Government & corporate events", "Community festivals", "Farmers markets", "Cultural events"]
  },
  'spokane': {
    intro:
      "Spokane's river park hosts most of the city's outdoor calendar, and a dry summer makes the season more reliable than the western side of the state.",
    events: ["Riverfront park festivals", "Endurance races", "Farmers markets", "Regional trade shows"]
  },
  'tacoma': {
    intro:
      "Tacoma's port and waterfront give it a working-city calendar, with rain planning routine and a summer festival run that fills the warmer months.",
    events: ["Waterfront festivals", "Maritime & port events", "Farmers markets", "Community fairs"]
  },
  'huntington': {
    intro:
      "Huntington's river position and university calendar shape a modest but steady event year, with the Ohio valley holding humidity through summer.",
    events: ["Riverfront events", "University activities", "Community festivals", "Farmers markets"]
  },
  'morgantown': {
    intro:
      "Morgantown's university dominates the calendar, with football weekends bringing the largest crowds and steep terrain complicating load-in.",
    events: ["Football game days", "University events", "Community festivals", "Farmers markets"]
  },
  'milwaukee': {
    intro:
      "Milwaukee's summer festival season is famously dense, and the lakefront grounds bring wind that decides what equipment lasts. The season is short and worked hard.",
    events: ["Lakefront music festivals", "Ethnic heritage festivals", "Sports crowds", "Farmers markets"]
  },
  'madison': {
    intro:
      "Madison's capitol square market is one of the largest of its kind, and the university adds game-day crowds through autumn. Winter closes the outdoor season firmly.",
    events: ["Capitol square market", "University game days", "Summer festivals", "Craft fairs"]
  },
  'green-bay': {
    intro:
      "Green Bay's football culture defines the calendar, with tailgates in genuinely cold conditions and a short summer festival run either side of the season.",
    events: ["Football tailgates", "Summer festivals", "Farmers markets", "Community events"]
  },
  'cheyenne': {
    intro:
      "Cheyenne's rodeo week is the fixture the whole year turns around, drawing crowds far beyond the city's size. High plains wind is severe and constant.",
    events: ["Rodeo week", "Agricultural shows", "Community festivals", "Farmers markets"]
  },
  'casper': {
    intro:
      "Casper serves a wide energy-industry region, and its events mix trade days with outdoor festivals across a season shortened at both ends by weather.",
    events: ["Energy industry trade days", "Outdoor festivals", "Agricultural fairs", "Community markets"]
  },
  'laramie': {
    intro:
      "Laramie's university and high-plains altitude shape a calendar of game days and summer festivals, with sun and wind both stronger than newcomers expect.",
    events: ["University game days", "Summer festivals", "Farmers markets", "Rodeo events"]
  },
  'washington': {
    intro:
      "Washington's calendar mixes federal and association events with a dense neighbourhood festival scene. Permitting on public ground is stricter here than in most cities, and stands are read closely.",
    events: ["Association & policy events", "Neighbourhood festivals", "Farmers markets", "Convention exhibiting"]
  },
  'ottawa': {
    intro:
      "Ottawa's calendar runs on government, festivals along the canal and a winter that shuts outdoor trading down hard. Vendors work a concentrated summer and plan around it.",
    events: ["Canal & waterfront festivals", "Government & association events", "Farmers markets", "Winter indoor shows"]
  },
  'mississauga': {
    intro:
      "Mississauga's events are suburban and multicultural, spread across a large area next to the airport. Vendors often work several community festivals in a single season.",
    events: ["Multicultural festivals", "Community markets", "Corporate & trade events", "Youth sports tournaments"]
  },
  'hamilton': {
    intro:
      "Hamilton's steel-town heritage sits alongside a growing arts and food scene, giving the calendar a mix of industrial trade days and street festivals.",
    events: ["Arts & street festivals", "Industrial trade days", "Farmers markets", "Waterfront events"]
  },
  'london': {
    intro:
      "London, Ontario pairs a university with a strong agricultural catchment, so the calendar swings between student-season events and fall fairs.",
    events: ["University events", "Fall fairs", "Summer festivals", "Farmers markets"]
  },
  'quebec-city': {
    intro:
      "Quebec City's winter carnival and a walled old town give it a distinctive year-round calendar, though outdoor vendor work still concentrates in the warmer months.",
    events: ["Winter carnival", "Old town summer festivals", "Public markets", "Cultural events"]
  },
  'laval': {
    intro:
      "Laval's events are suburban and family-centred, drawing from the wider Montreal region, with a short but busy warm season.",
    events: ["Community festivals", "Public markets", "Youth sports events", "Seasonal fairs"]
  },
  'gatineau': {
    intro:
      "Gatineau works alongside the Ottawa calendar across the river, adding its own festival programme and a hard winter that defines the season.",
    events: ["Summer festivals", "Cross-river events", "Public markets", "Community fairs"]
  },
  'surrey': {
    intro:
      "Surrey's rapid growth and diverse communities fill the calendar with cultural festivals, and the coastal climate means rain planning through much of the year.",
    events: ["Multicultural festivals", "Community markets", "Youth sports tournaments", "Agricultural fairs"]
  },
  'victoria': {
    intro:
      "Victoria's mild coastal climate stretches the outdoor season further than most Canadian cities, and the harbour and tourism trade keep vendors busy through it.",
    events: ["Harbour & waterfront events", "Tourism festivals", "Public markets", "Garden & flower shows"]
  },
  'burnaby': {
    intro:
      "Burnaby's events are community-scale and park-centred, drawing from the wider Vancouver region, with rain a routine part of planning.",
    events: ["Park & community festivals", "Farmers markets", "Cultural events", "Sports tournaments"]
  },
  'kelowna': {
    intro:
      "Kelowna's wine country and lake tourism give it a strong summer calendar, with dry heat and sun stronger than the latitude suggests.",
    events: ["Wine & food festivals", "Lakefront events", "Farmers markets", "Outdoor sporting events"]
  },
  'edmonton': {
    intro:
      "Edmonton's festival city identity packs an enormous amount into a short summer, and the winter is severe enough that outdoor trading effectively stops.",
    events: ["Summer festival season", "Exhibition & fair events", "Farmers markets", "Indoor winter trade shows"]
  },
  'red-deer': {
    intro:
      "Red Deer serves a wide agricultural and energy region, with fairs and trade days drawing from well beyond the city itself.",
    events: ["Agricultural fairs", "Energy industry trade days", "Community festivals", "Farmers markets"]
  },
  'lethbridge': {
    intro:
      "Lethbridge sits in one of the windiest parts of the prairies, which shapes every outdoor setup decision. Agriculture drives most of the event calendar.",
    events: ["Agricultural shows", "Community festivals", "Farmers markets", "University events"]
  },
  'winnipeg': {
    intro:
      "Winnipeg's folk and cultural festivals fill a short, intense summer, and the winter is cold enough that the outdoor season is genuinely brief.",
    events: ["Folk & cultural festivals", "Exhibition events", "Farmers markets", "Indoor winter shows"]
  },
  'brandon': {
    intro:
      "Brandon's agricultural fair tradition anchors the year, drawing from a wide rural catchment across a season shortened by prairie weather.",
    events: ["Agricultural fairs", "Livestock shows", "Community festivals", "Farmers markets"]
  },
  'steinbach': {
    intro:
      "Steinbach's community and heritage events carry the local calendar, with a compact summer season and a strong agricultural thread.",
    events: ["Heritage & community festivals", "Agricultural events", "Farmers markets", "Seasonal fairs"]
  },
  'saskatoon': {
    intro:
      "Saskatoon's riverbank festivals fill a short summer, and prairie wind across open ground is the practical constraint on every outdoor pitch.",
    events: ["Riverbank festivals", "Exhibition events", "Farmers markets", "Agricultural shows"]
  },
  'regina': {
    intro:
      "Regina's provincial government and agricultural calendars carry the year, with the outdoor season compressed into a few reliable months.",
    events: ["Provincial government events", "Agricultural fairs", "Summer festivals", "Farmers markets"]
  },
  'prince-albert': {
    intro:
      "Prince Albert serves a northern catchment where the outdoor season is brief and the events are community-scale and well attended.",
    events: ["Community festivals", "Agricultural fairs", "Farmers markets", "Winter indoor events"]
  },
  'halifax': {
    intro:
      "Halifax works a harbour calendar with genuine maritime weather — wind, fog and rain all in the same weekend. The summer festival run is dense and well established.",
    events: ["Harbour & maritime festivals", "Seafood events", "Public markets", "Music festivals"]
  },
  'sydney': {
    intro:
      "Sydney, Nova Scotia builds its season around the cruise calendar and Celtic music traditions, with coastal weather shaping what stands up outdoors.",
    events: ["Cruise season events", "Celtic music festivals", "Community markets", "Waterfront fairs"]
  },
  'truro': {
    intro:
      "Truro's agricultural fair tradition and a central position in the province make it a regular stop for regional events through the warm months.",
    events: ["Agricultural fairs", "Regional trade events", "Farmers markets", "Community festivals"]
  },
  'moncton': {
    intro:
      "Moncton's bilingual event calendar and central position in the Maritimes make it a regional hub, with a short summer worked hard.",
    events: ["Regional festivals", "Trade & consumer shows", "Farmers markets", "Community events"]
  },
  'saint-john': {
    intro:
      "Saint John's harbour and tourism trade shape the calendar, and coastal fog and wind are constants for anything pitched near the water.",
    events: ["Harbour festivals", "Cruise season events", "City market events", "Community fairs"]
  },
  'fredericton': {
    intro:
      "Fredericton's provincial government and university calendars carry the year, with a well-regarded market anchoring the weekends.",
    events: ["Provincial government events", "Boyce farmers market", "University activities", "Summer festivals"]
  },
  'st-johns': {
    intro:
      "St John's has some of the wettest, windiest weather of any city on the continent, which decides equipment choices before anything else does.",
    events: ["Harbour festivals", "Music & folk events", "Farmers markets", "Community fairs"]
  },
  'mount-pearl': {
    intro:
      "Mount Pearl's community festival calendar fills a short summer, with the same coastal wind that shapes trading across the whole Avalon region.",
    events: ["Community festivals", "Youth sports events", "Farmers markets", "Seasonal fairs"]
  },
  'corner-brook': {
    intro:
      "Corner Brook's events are shaped by the surrounding mountains and a winter sports season, with a brief but busy summer festival run.",
    events: ["Winter sports events", "Summer festivals", "Community markets", "Cultural events"]
  },
  'charlottetown': {
    intro:
      "Charlottetown's tourism and festival season is concentrated into the summer months, when the island's population effectively multiplies.",
    events: ["Summer festival season", "Waterfront events", "Farmers markets", "Cultural festivals"]
  },
  'summerside': {
    intro:
      "Summerside's waterfront and community events carry a short season, with maritime weather the practical limit on outdoor trading.",
    events: ["Waterfront festivals", "Community markets", "Seasonal fairs", "Cultural events"]
  },
  'whitehorse': {
    intro:
      "Whitehorse packs its outdoor calendar into a summer of very long days, with wilderness tourism and community events filling the weeks.",
    events: ["Summer solstice events", "Wilderness tourism festivals", "Community markets", "Winter indoor events"]
  },
  'yellowknife': {
    intro:
      "Yellowknife's extreme seasonal swing gives it a brief, bright summer for outdoor events and a long winter where trading moves indoors entirely.",
    events: ["Midnight sun festivals", "Community events", "Craft & artisan markets", "Winter indoor shows"]
  },
  'iqaluit': {
    intro:
      "Iqaluit's events are community-centred and shaped by an Arctic climate, with a short outdoor window and most trading happening indoors.",
    events: ["Community festivals", "Artisan & craft markets", "Cultural events", "Indoor trade events"]
  },
};

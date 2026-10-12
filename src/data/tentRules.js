// Canopy tent rules for vendors — a vendor-neutral reference built from rules
// that event organizers publish for their own vendors. Every rule row links to
// the organizer's source page so readers (and organizers) can check it.
// Shared by the React TentRulesPage and scripts/prerender.mjs.
//
// Rules change every season. Each row records the season it was read for;
// update the row (not the summary prose) when an organizer changes a rule.

export const TENT_RULES_PATH = '/resources/tent-weight-rules';

export const TENT_RULES_META = {
  title: 'Canopy Tent Weight Rules for Vendors',
  h1: 'Canopy Tent Weight Rules for Vendors: 2026 Guide',
  description:
    'How much weight per tent leg do markets, craft shows and art fairs require? Real 2025–2026 vendor rules from 30+ events, plus a weight planner and checklist.',
  updated: '2026-10-12',
  intro:
    'Most outdoor events now check tent weights at setup, and a tent without the right weight can be sent home. We read the vendor rules that 30+ farmers markets, craft shows, street festivals and art fairs published for their 2025–2026 seasons and summarized what they actually ask for. Every rule below links to the organizer’s own page.'
};

// Key findings, written from the rule rows below.
export const TENT_RULES_FINDINGS = [
  'Weights are mandatory almost everywhere. Every event we reviewed requires tents to be weighted, and several say tents without proper weights will be asked to come down or will not be allowed to set up.',
  'The common minimum is about 24–25 lb per leg. Farmers markets and smaller community events cluster here.',
  '40 lb per leg is the most common rule at craft shows and festivals, and many organizers recommend it even where the minimum is lower.',
  'Juried art fairs ask for the most: 45–60 lb per leg is typical, and one coastal show also requires tents wind-rated to 60 mph.',
  'Stakes are often banned. Pavement, parks with buried cables and downtown streets usually mean weights only.',
  'Not every weight counts. Several events ban water jugs or barrels, cinder blocks, disc weights or plastic sand bags.',
  'Food vendors often need flame-retardant tent fabric (commonly NFPA 701) and a fire extinguisher.'
];

// Requirement bands by event type, derived from the rule rows.
export const TENT_RULES_BANDS = [
  { type: 'Farmers markets', perLeg: '24–40 lb', note: '25 lb per leg is the most common minimum; some markets ask for 40 lb.' },
  { type: 'Community festivals & night markets', perLeg: '24–40 lb', note: 'City-run events often follow their fire or safety office (for example 24 lb per corner); 40 lb per leg is common at festivals.' },
  { type: 'Craft shows & holiday markets', perLeg: '25–40 lb', note: '40 lb per leg is the most common rule; disc weights are often banned.' },
  { type: 'Juried art fairs', perLeg: '45–60 lb', note: 'Some require white tops, commercial-grade frames, and inspect weights during the show.' },
  { type: 'Food vendors (any event)', perLeg: '24–40 lb + FR fabric', note: 'Flame-retardant canopy and an extinguisher are commonly required.' }
];

// One row per organizer. `season` is the season the rule was published for.
export const TENT_RULES = [
  { event: 'Craft Lake City DIY Festival', place: 'Salt Lake City, UT', type: 'Craft festival', season: '2026', rule: 'Outdoor exhibitors must bring a tent with at least 40 lb on each leg; back walls must be secured with 20 lb on each side.', url: 'https://craftlakecity.com/diy-festival-exhibitor-prospectus/' },
  { event: 'South Perry Street Fair', place: 'Spokane, WA', type: 'Street fair', season: '2026', rule: 'At least 24 lb per leg; 40+ lb per corner recommended for 10x10 tents; 50 lb for umbrellas. Tents must stay anchored during setup and teardown.', url: 'https://southperry.org/south-perry-street-fair/vendor2026/' },
  { event: 'Ellwood City Festival', place: 'Ellwood City, PA', type: 'Community festival', season: '2025', rule: 'Minimum of 40 lb per tent leg; vendors provide their own weights.', url: 'https://ellwood-city-festival.net/craft-vendor-rules/' },
  { event: 'Old Settlers Music Festival', place: 'Texas', type: 'Music festival', season: '2026', rule: 'Commercial-grade tents only, with at least 100 lb per 10x10 (or 40 lb per leg). Weights attach to the lower leg and must not create trip hazards.', url: 'https://oldsettlersmusicfest.org/vendors-artisan/' },
  { event: 'Neptune Festival Art & Craft Show', place: 'Virginia Beach, VA', type: 'Art fair', season: '2026', rule: 'Tents must be wind-rated to at least 60 mph, with at least 50 lb fastened to each leg.', url: 'https://www.neptunefestival.com/wp-content/uploads/2026/07/3-Tent-Requirements-Safety-Neptune-Festival-Art-Craft-Show-2026.pdf' },
  { event: 'Roswell Spring Arts Festival', place: 'Roswell, GA', type: 'Art fair', season: '2027', rule: 'White-top tents of EZ-UP quality or better; professional weights of 45–50 lb per leg. Concrete blocks, water containers, plastic sand bags and unweighted stabilizer bars are not accepted. No staking to trees or posts.', url: 'https://www.eventeny.com/events/roswell-spring-arts-festival-2027-sun-33974/' },
  { event: 'Amdur Productions art fairs', place: 'Chicago area, IL', type: 'Art fair', season: '2026', rule: 'At least 60 lb per tent leg (50 lb at some shows), strapped to the tent. No cinder blocks or water jugs. Weights are inspected before and during the festival.', url: 'https://amdurproductions.com/northbrook-art-in-the-park-exhibitor-information/' },
  { event: 'Mount Dora Craft Fair', place: 'Mount Dora, FL', type: 'Craft show', season: '2026', rule: '10x10 white tents only, weighted to withstand 40 mph gusts. Stakes are not allowed.', url: 'https://mtdoracraftfair.com/exhibit/' },
  { event: 'First Saturday Arts Market', place: 'Houston, TX', type: 'Art market', season: '2026', rule: 'Booths are on pavement; tents must have 40 lb per leg. No water barrels. Tents without proper weights can be denied participation.', url: 'https://firstsaturdayartsmarket.com/topics/setup/setup-details/' },
  { event: 'Abington Art Center Holiday Art & Fine Craft Fair', place: 'Jenkintown, PA', type: 'Craft show', season: '2026', rule: 'Minimum 40 lb tent weights on each leg.', url: 'https://form.jotform.com/261815212778158' },
  { event: 'Old Waxhaw Christmas (vendor rules)', place: 'Waxhaw, NC', type: 'Holiday market', season: '2026', rule: 'Each tent leg needs at least 25 lb. Disc weights are not allowed; vendors without proper weights must take their tents down.', url: 'https://www.eventeny.com/events/old-waxhaw-christmas-dec-12th-30490/' },
  { event: 'Medical Lake Christmas Market', place: 'Medical Lake, WA', type: 'Holiday market', season: '2026', rule: 'Vendors bring a white 10x10 pop-up tent and tent weights that meet the requirements.', url: 'https://medicallake.org/?p=4757' },
  { event: 'Warner Fall Foliage Festival', place: 'Warner, NH', type: 'Craft festival', season: '2026', rule: 'Weights must be clearly anchored or attached to the tent by sturdy means; described as non-negotiable.', url: 'https://wfff.org/festival-crafter-application-faq' },
  { event: 'Occoquan Festivals', place: 'Occoquan, VA', type: 'Street festival', season: '2026', rule: 'Booths are on pavement; tents must be weighted because they cannot be spiked.', url: 'https://www.occoquanfestivals.com/vendor' },
  { event: 'Cape May Craft Shows', place: 'Cape May, NJ', type: 'Craft show', season: '2026', rule: 'Weights and/or ties on tents and umbrellas to eliminate wind disruption and danger.', url: 'https://www.capemaycity.com/media/Convention%20Hall/Craft%20Show%20App%20-%20July%202026.pdf' },
  { event: 'Harvest Melody Arts & Music Fall Festival', place: 'Centerville, GA', type: 'Community festival', season: '2026', rule: 'Vendors must be under a 10x10 or larger canopy anchored with weights; tents without weights are not allowed to set up.', url: 'https://www.centervillega.org/wp-content/uploads/2026/08/HMAMFF-Arts-and-Crafts-Vendor-Application.pdf' },
  { event: 'Veterans Day Festival (City of Kissimmee)', place: 'Kissimmee, FL', type: 'City festival', season: '2026', rule: 'Flame-retardant canopies required, with at least 24 lb tent weights on each corner.', url: 'https://www.eventeny.com/events/vendor/?id=54386' },
  { event: 'SoCal Mega Night Market', place: 'Southern California', type: 'Night market', season: '2026', rule: 'Food vendors need fire-retardant tents. Weights of 40 lb per leg; no stakes in the ground.', url: 'https://form.jotform.com/262258785261162' },
  { event: 'Sarasota Indie Market & Plant Swap', place: 'Sarasota, FL', type: 'Indie market', season: '2026', rule: 'Proper tent weights required, at least 40 lb per leg.', url: 'https://form.jotform.com/262115951127049' },
  { event: 'The Lucky Flea', place: 'Rochester, NY', type: 'Vintage market', season: '2026', rule: 'All vendors must bring a canopy tent with weights to combat wind.', url: 'https://www.eventeny.com/events/vendor/?id=47650' },
  { event: 'Hudson Valley Open Market', place: 'New Paltz, NY', type: 'Farmers market', season: '2026', rule: 'Four weights of at least 25 lb each, suspended just above the ground.', url: 'https://www.hudsonvalleyopenmarket.com/2026-vedor-info-regulations' },
  { event: 'Bridgeland Riverside Farmers Market', place: 'Calgary, AB', type: 'Farmers market', season: '2026', rule: 'Vendors supply their own tent (up to 10x10) and weights of at least 25 lb per leg.', url: 'https://docs.google.com/forms/d/e/1FAIpQLSf0EGDeww4ISPQLkG4ct0FUz4VsRHpbbs7R48iAP5SlCFsMSw/viewform' },
  { event: 'Rowley Farmers Market', place: 'Rowley, MA', type: 'Farmers market', season: '2026', rule: 'Vendors supply their own pop-up tent and tent weights; weights required and no staking.', url: 'https://www.townofrowley.net/agricultural-commission/files/farmers-market-vendor-policies-application' },
  { event: 'North Pocono Public Library Farmers Market', place: 'Moscow, PA', type: 'Farmers market', season: '2026', rule: 'At least 40 lb per leg (160 lb per tent) for public safety and fire and safety standards.', url: 'https://lclshome.org/libraries/north-pocono-public-library/north-pocono-public-library-farmers-market-vendor-application-package-guidelines-2026' },
  { event: 'Manitowoc Farmers Market', place: 'Manitowoc, WI', type: 'Farmers market', season: '2026', rule: '25 lb per tent leg recommended; vendors without enough weight must take their tent down.', url: 'https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/manitowocwi/Vendor_Application_2026_56647b0b-0acc-4a7d-bbae-be3e68588c75.pdf' },
  { event: 'Buffalo City Farmers Market', place: 'Buffalo City, WI', type: 'Farmers market', season: '2026', rule: 'Weights must be on hand at every market (milk jugs of water, sand bags, etc.); the board can require them at any event.', url: 'https://www.buffalocitywi.gov/wp-content/uploads/Buffalo-City-Farmers-Market-Vendor-Application-2026.pdf' },
  { event: 'Vandalia Gathering', place: 'Charleston, WV', type: 'Folk festival', season: '2026', rule: 'All vendors must use weights, not stakes, because of underground electric cables; bring tent sides and tarps for overnight cover.', url: 'https://wvculture.org/wp-content/uploads/2026/03/2026.03.13_Vandalia-Gathering-Forms_Artisan-Vendor_Fillable.pdf' },
  { event: 'Northern Lights Festival Boréal', place: 'Sudbury, ON', type: 'Music festival', season: '2026', rule: 'Tents must be properly weighted with approved weights; staking or tying to park structures, fences or trees is prohibited. Open-flame food vendors need flame-retardant tents and an extinguisher.', url: 'https://www.nlfbsudbury.ca/home/vendors/' },
  { event: 'Ontario’s Best Butter Tart Festival', place: 'Midland, ON', type: 'Street festival', season: '2026', rule: 'Vendors bringing pop-up shelters must bring weights (sandbags, water jugs, etc.) to secure the legs.', url: 'https://www.midland.ca/en/community-tourism-culture/vendors.aspx' },
  { event: 'Canada Day (Town of Newmarket)', place: 'Newmarket, ON', type: 'City festival', season: '2026', rule: 'Staking is not permitted; all canopies must be weighted down with vendor-supplied weights.', url: 'https://sire.newmarket.ca/ThingsToDo/Documents/Events/Canada%20Day/CanadaDay2026-VendorApplication.pdf' },
  { event: 'Canada Day (Town of St. Marys)', place: 'St. Marys, ON', type: 'City festival', season: '2026', rule: 'Tents cannot be pegged; bring sandbags, water pails or patio stones to secure them.', url: 'https://discoverstmarys-icreate6.esolutionsgroup.ca/en/see-and-do/resources/Canada-Day-Artisan-Vendor-Package.pdf' }
];

// Printable vendor checklist.
export const TENT_CHECKLIST = [
  'Read your event’s vendor rules: weight per leg, stakes allowed or not, tent color, fire rules.',
  'Confirm your space size (most are 10x10) and keep the tent, walls and signs inside it.',
  'Bring at least the required weight for every leg, plus extra if you will use walls.',
  'Use accepted weights: sandbags, cast-iron leg weights or concrete-filled pipe. Check whether water jugs, cinder blocks or disc weights are banned.',
  'Attach weights to the legs with straps so they cannot slide, and keep them low to avoid trip hazards.',
  'Weight the tent before anything else goes inside it, and keep it weighted during teardown.',
  'If you cook or use heat, bring a flame-retardant canopy (NFPA 701 is the common standard) and a fire extinguisher.',
  'Lower or open side walls when gusts pick up; take the tent down if wind exceeds what it is rated for.',
  'Never leave a raised tent unattended.',
  'Keep a copy of your tent’s fabric certificate and the event rules with you on the day.'
];

// Weight planner: requirement bands the planner uses (lb per leg).
export const PLANNER_EVENT_TYPES = [
  { key: 'farmers', label: 'Farmers market', perLeg: 25 },
  { key: 'community', label: 'Community festival / night market', perLeg: 40 },
  { key: 'craft', label: 'Craft show / holiday market', perLeg: 40 },
  { key: 'artfair', label: 'Juried art fair', perLeg: 50 }
];

export const PLANNER_TENT_SIZES = [
  { key: '10x10', label: '10x10 ft', legs: 4 },
  { key: '10x15', label: '10x15 ft', legs: 6 },
  { key: '10x20', label: '10x20 ft', legs: 6 }
];

export const TENT_RULES_FAQ = [
  { q: 'How much weight do I need per tent leg?', a: 'Check your event’s rule first. In the vendor rules we reviewed, about 24–25 lb per leg is the common minimum at farmers markets, 40 lb per leg is the most common rule at craft shows and festivals, and juried art fairs often ask for 45–60 lb per leg.' },
  { q: 'Can I use water jugs or cinder blocks as tent weights?', a: 'Sometimes, but many events ban them. Several art fairs reject water containers, cinder blocks, disc weights and plastic sand bags. Sandbags, cast-iron leg weights and concrete-filled pipe are the most widely accepted.' },
  { q: 'Can I stake my tent instead of using weights?', a: 'Often not. Events on pavement, downtown streets and parks with buried cables usually require weights only. Some allow staking on grass, but plan to bring weights either way.' },
  { q: 'Do I need a flame-retardant tent?', a: 'If you cook or use heat, many events require a flame-retardant canopy, commonly certified to NFPA 701, plus a fire extinguisher. Some city-run events require flame-retardant canopies for all vendors.' },
  { q: 'Do side walls change how much weight I need?', a: 'Walls catch wind and increase the load on the frame, so bring extra weight when walls are up and lower or open them in gusts. Some events also require back walls to be weighted separately.' }
];

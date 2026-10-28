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
    'How much weight per tent leg do markets, craft shows and art fairs require? Real 2025–2026 vendor rules from 110+ events, plus a weight planner and checklist.',
  updated: '2026-10-22',
  intro:
    'Most outdoor events now check tent weights at setup, and a tent without the right weight can be sent home. We read the vendor rules that 110+ farmers markets, craft shows, street festivals and art fairs published for their 2025–2026 seasons and summarized what they actually ask for. Every rule below links to the organizer’s own page.'
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
  { event: 'North Pocono Public Library Farmers Market', place: 'Moscow, PA', type: 'Farmers market', season: '2026', rule: 'At least 40 lb per leg (160 lb per tent) for public safety and fire and safety standards.', url: 'https://lclshome.org/wp-content/uploads/2026/07/North-Pocono-Public-Library-Farmers-Market-Vendor-Application-Package-Guidelines-2026.pdf' },
  { event: 'Manitowoc Farmers Market', place: 'Manitowoc, WI', type: 'Farmers market', season: '2026', rule: '25 lb per tent leg recommended; vendors without enough weight must take their tent down.', url: 'https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/manitowocwi/Vendor_Application_2026_56647b0b-0acc-4a7d-bbae-be3e68588c75.pdf' },
  { event: 'Buffalo City Farmers Market', place: 'Buffalo City, WI', type: 'Farmers market', season: '2026', rule: 'Weights must be on hand at every market (milk jugs of water, sand bags, etc.); the board can require them at any event.', url: 'https://www.buffalocitywi.gov/wp-content/uploads/Buffalo-City-Farmers-Market-Vendor-Application-2026.pdf' },
  { event: 'Vandalia Gathering', place: 'Charleston, WV', type: 'Folk festival', season: '2026', rule: 'All vendors must use weights, not stakes, because of underground electric cables; bring tent sides and tarps for overnight cover.', url: 'https://wvculture.org/wp-content/uploads/2026/03/2026.03.13_Vandalia-Gathering-Forms_Artisan-Vendor_Fillable.pdf' },
  { event: 'Northern Lights Festival Boréal', place: 'Sudbury, ON', type: 'Music festival', season: '2026', rule: 'Tents must be properly weighted with approved weights; staking or tying to park structures, fences or trees is prohibited. Open-flame food vendors need flame-retardant tents and an extinguisher.', url: 'https://www.nlfbsudbury.ca/home/vendors/' },
  { event: 'Ontario’s Best Butter Tart Festival', place: 'Midland, ON', type: 'Street festival', season: '2026', rule: 'Vendors bringing pop-up shelters must bring weights (sandbags, water jugs, etc.) to secure the legs.', url: 'https://www.midland.ca/en/community-tourism-culture/vendors.aspx' },
  { event: 'Canada Day (Town of Newmarket)', place: 'Newmarket, ON', type: 'City festival', season: '2026', rule: 'Staking is not permitted; all canopies must be weighted down with vendor-supplied weights.', url: 'https://sire.newmarket.ca/ThingsToDo/Documents/Events/Canada%20Day/CanadaDay2026-VendorApplication.pdf' },
  { event: 'Canada Day (Town of St. Marys)', place: 'St. Marys, ON', type: 'City festival', season: '2026', rule: 'Tents cannot be pegged; bring sandbags, water pails or patio stones to secure them.', url: 'https://discoverstmarys-icreate6.esolutionsgroup.ca/en/see-and-do/resources/Canada-Day-Artisan-Vendor-Package.pdf' },
  { event: 'Covington Makers Markets', place: 'Covington, WA', type: 'Craft fair', season: '2026', rule: 'Each canopy leg needs a weight of at least 20 lb, kept on from setup until takedown.', url: 'https://www.covingtonchamber.org/uploads/1/5/3/6/153691593/covington_makers_market_vendor_agreement_2026_final.pdf' },
  { event: 'Art in the Park', place: 'Parry Sound, ON', type: 'Art festival', season: '2026', rule: 'Tents no larger than 10x10; 40+ lb per leg is suggested in mild conditions, with weights roped to all four corners.', url: 'https://psaca.ca/product/aitp-vendor-app/' },
  { event: 'Las Vegas Craft Shows', place: 'Las Vegas, NV', type: 'Craft fair', season: '2026', rule: 'Tents must have straight legs and at least 50 lb of weight on each leg.', url: 'https://www.lvcraftshows.com/lvcsrr' },
  { event: 'Olney Farmers & Artists Market', place: 'Olney, MD', type: 'Farmers market', season: '2026', rule: 'Each 10x10 canopy must have at least 25 lb of weight per leg, regardless of weather.', url: 'https://www.olneyfarmersmarket.com/uploads/1/2/0/1/120121725/artist_spring_summer_market_application.pdf' },
  { event: 'Evening Gourmet Market', place: 'Highwood, IL', type: 'Night market', season: '2026', rule: 'All tents and canopies must have at least 25 lb of weight per leg, regardless of forecasted weather.', url: 'https://www.celebratehighwood.org/wp-content/uploads/2026/02/Evening-Gourmet-Market-Vendor-Handbook-2026.pdf' },
  { event: 'Little Italy Mercato', place: 'San Diego, CA', type: 'Farmers market', season: '2026', rule: 'Canopies and umbrellas must be secured with at least 25 lb per leg every market day, rain or shine.', url: 'https://sandiegomarkets.com/mercato-mission-statement-rules' },
  { event: 'Hillsboro Farmers’ Markets', place: 'Hillsboro, OR', type: 'Farmers market', season: '2026', rule: 'Provide your own canopy and 25 lb of weights per canopy leg.', url: 'https://hillsboromarkets.org/become-a-vendor' },
  { event: 'Golden Valley Arts & Music Festival', place: 'Golden Valley, MN', type: 'Art fair', season: '2026', rule: 'Vendor tents must have weights of at least 30 lb per leg.', url: 'https://www.mnartistsguild.com/gvfestival' },
  { event: 'The Craftery Market', place: 'Bucks County, PA', type: 'Craft show', season: '2026', rule: 'Each tent needs four 40 lb weights, one on each leg (160 lb total).', url: 'https://crafterymarket.com/vendor-policies-faqs' },
  { event: 'Haven Holiday Market', place: 'Winter Haven, FL', type: 'Holiday market', season: '2026', rule: 'Each canopy leg needs 20 lb of weights; no ground anchoring, and tents without weights cannot set up.', url: 'http://www.centralfloridaeventvendors.com/wp-content/uploads/Haven-Holiday-vendor-application-2026.pdf' },
  { event: 'College of the Desert Street Fair', place: 'Palm Desert, CA', type: 'Street fair', season: '2026', rule: 'Each canopy or umbrella leg must have at least 25 lb attached during business hours, setup and breakdown.', url: 'https://codaastreetfair.com/wp-content/uploads/2026/04/2026-2027-RR-.pdf' },
  { event: 'Vero Beach Oktoberfest', place: 'Vero Beach, FL', type: 'Community festival', season: '2026', rule: 'At least 35 lb tightly secured to each tent leg or suspended from each corner; staking alone is not enough.', url: 'https://www.verobeachoktoberfest.com/vendors' },
  { event: 'Riverwalk Market Fair', place: 'Northfield, MN', type: 'Farmers market', season: '2026', rule: '30 lb per tent leg; staking is prohibited, and unweighted corners incur a $10 weekly fine.', url: 'https://www.riverwalkmarketfair.org/be-a-vendor/vendor-rules-and-guidelines' },
  { event: 'Tennyson Fall Fest', place: 'Denver, CO', type: 'Community festival', season: '2026', rule: 'No stakes; the city recommends 40 lb per corner for a 10x10 tent and double that for a 10x20.', url: 'https://my.boothcentral.com/v/events/2026-tennyson-fall-fest' },
  { event: 'Gatesville City Events', place: 'Gatesville, TX', type: 'Community festival', season: '2026', rule: 'Tent weights of at least 40 lb per leg.', url: 'https://gatesvilletx.com/services_how_do_i/vendor_information.php' },
  { event: 'Inglewood Night Market', place: 'Calgary, AB', type: 'Night market', season: '2026', rule: '25 lb weights on each tent leg, securely fastened to the tent frame.', url: 'https://inglewoodnightmarket.myshopify.com/pages/vendor-frequently-asked-questions' },
  { event: 'Ogden Arts After Dark', place: 'Ogden, UT', type: 'Art fair', season: '2026', rule: 'At least 25 lb of weight on each tent leg (a plaza rule that is enforced).', url: 'https://www.ogdencity.gov/DocumentCenter/View/27859/Vendor-Agreement' },
  { event: 'Orlando Fire & Flavor Festival', place: 'Orlando, FL', type: 'Community festival', season: '2026', rule: 'Weights on all four legs, typically at least 40 lb per leg.', url: 'https://www.eventeny.com/events/vendor/?id=48449' },
  { event: 'Waukesha County Fair', place: 'Waukesha, WI', type: 'County fair', season: '2026', rule: 'Each tent leg weighted with 30 lb cinder blocks, sand pails or water weights; tent top tied down with guide wire.', url: 'https://www.waukeshacountyfair.com/wp-content/uploads/2025/12/2026-WCF-Rules-Regulations_WCF-Official.pdf' },
  { event: 'Fall FunFest Arts & Crafts', place: 'Cookeville, TN', type: 'Craft show', season: '2026', rule: 'At least 40 lb per leg, attached securely before 3 p.m. Friday.', url: 'https://fallfunfest.com/wp-content/uploads/2026/02/Arts-Crafts-Fall-FunFest-2026-Vendor-Application.pdf' },
  { event: 'Art in the Park', place: 'Sierra Vista, AZ', type: 'Art fair', season: '2026', rule: '40–60 lb per tent pole, placed before raising the canopy; no cement blocks where patrons walk.', url: 'https://artintheparksierravista.com/aitp/vendors/' },
  { event: 'St. Pete Holiday Festival', place: 'St. Petersburg, FL', type: 'Holiday market', season: '2026', rule: 'Tent weights are required by the city for every vendor, no exceptions.', url: 'https://theindieflea.com/2026-holiday-festival-waitlist-vendor-application' },
  { event: 'Westville Pumpkin Festival', place: 'Westville, IN', type: 'Community festival', season: '2026', rule: 'Vendors bringing their own tent or canopy must bring ample weights to tie it down.', url: 'https://westvillepumpkinfestival.com/wp-content/uploads/sites/5/2026/03/2026-Rules-Westville-Pumpkin-Festival.pdf' },
  { event: 'Laconia Pumpkin Festival', place: 'Laconia, NH', type: 'Community festival', season: '2026', rule: 'Tents or canopies must have 40 lb of weight on each frame leg.', url: 'https://www.laconianh.gov/FormCenter/Laconia-Pumpkin-Festival-21/Laconia-Pumpkin-Festival-Vendor-Agreemen-138' },
  { event: 'Spring Creek Craft Market', place: 'Spring Creek, TN', type: 'Craft show', season: '2026', rule: 'Adequate weights on every canopy leg; stakes alone are not sufficient.', url: 'https://scledge.org/wp-content/uploads/2026/07/Spring_Creek_Craft_Market_Rules_2026.pdf' },
  { event: 'Westchester Craft Crawl', place: 'Westchester, NY', type: 'Craft show', season: '2026', rule: 'Tents need a canopy and four sides, plus 35–40 lb of weight on each tent leg.', url: 'https://www.westchestercraftcrawl.com/artist-application' },
  { event: 'Western Welcome Week Arts & Crafts Fair', place: 'Littleton, CO', type: 'Craft show', season: '2026', rule: 'Canopies must be weighted; stakes, wires and ropes may not be used.', url: 'https://www.westernwelcomeweek.org/arts-crafts/fair-policies/' },
  { event: 'Seal Beach Lions Arts & Crafts Faire', place: 'Seal Beach, CA', type: 'Craft show', season: '2026', rule: 'Canopies and umbrellas must be secured with weights because winds are unpredictable.', url: 'https://www.sealbeachlions.org/uploads/2/3/7/5/23754982/2026_sb_arts___crafts_rules_and_conditions.pdf' },
  { event: '9th and 9th Street Festival', place: 'Salt Lake City, UT', type: 'Street fair', season: '2026', rule: 'Weights for wind and gusts, no stakes; a 5-gallon bucket of water or sand gives about 40 lb per corner.', url: 'https://9thand9thstreetfestival.com/vendors/vendor-faq/' },
  { event: 'Anderson Gaslight Festival', place: 'Anderson, IN', type: 'Community festival', season: '2026', rule: 'Each tent leg secured with at least 20 lb of weight.', url: 'https://www.andersongaslightfestival.org/vendor-faq' },
  { event: 'Downtown Farmers’ Market', place: 'Des Moines, IA', type: 'Farmers market', season: '2026', rule: 'Vendors must keep weights on their tents and canopies at all times.', url: 'https://www.dsmpartnership.com/desmoinesfarmersmarket/filesimages/2026%20Farmers%20Market/Downtown%20Farmers%20Market%20Handbook%202026.pdf' },
  { event: 'Uptown Marion Market', place: 'Marion, IA', type: 'Farmers market', season: '2026', rule: 'All tents must be weighted.', url: 'https://marioncc.org/uploads/1/4/1/3/141368992/vendor_handbook_2026.pdf' },
  { event: 'Pop Up Market on Main', place: 'Canton, OH', type: 'Street fair', season: '2026', rule: 'Canopies weighted down with a minimum of 40 lb per leg.', url: 'https://www.cantondayoff.com/pop-up-market-on-main/' },
  { event: 'Lilburn Daze Arts & Crafts Festival', place: 'Lilburn, GA', type: 'Craft show', season: '2026', rule: 'No stakes; the City of Lilburn requires 40 lb weights on each tent leg.', url: 'https://www.lilburndaze.org/vendor-application' },
  { event: 'Heart of Brevard Events', place: 'Brevard, NC', type: 'Community festival', season: '2026', rule: 'Each tent leg securely weighted with at least 40 lb.', url: 'https://brevardnc.org/vendor-information/' },
  { event: 'Garden Ridge Market Days', place: 'Garden Ridge, TX', type: 'Craft show', season: '2026', rule: 'At least 40 lb of weight on each canopy leg (160+ lb per canopy).', url: 'https://gardenridgemarketdays.com/vendors' },
  { event: '2nd Saturday Market Days', place: 'Georgetown, TX', type: 'Street fair', season: '2026', rule: '10x10 tent with straight legs and 50 lb of weight on each leg.', url: 'https://www.dgagtx.org/Market-Days' },
  { event: 'Cedarburg Festivals', place: 'Cedarburg, WI', type: 'Community festival', season: '2026', rule: 'Professional-grade tents weighted with at least 40 lb per leg; street tents cannot be staked.', url: 'https://www.cedarburgfestivals.org/vendors-sponsors' },
  { event: 'Lattimore Fall Craft Fair', place: 'Lattimore, NC', type: 'Craft show', season: '2026', rule: 'In windy weather, tents and canopies must be secured to the ground with weights or sandbags.', url: 'https://lattimorenc.gov/news/2026-lattimore-fall-craft-fair-information-now-available' },
  { event: 'NB Farmers Market', place: 'New Braunfels, TX', type: 'Farmers market', season: '2026', rule: 'A 10′ × 10′ canopy must have weights of at least 25 pounds per leg; 40 to 50 pounds per leg is highly recommended.', url: 'https://www.nbfarmersmarket.com/vendor-application' },
  { event: 'Brooklin Farmers’ Market', place: 'Whitby, ON', type: 'Farmers market', season: '2026', rule: 'Each tent leg must be weighted with 40 pounds.', url: 'https://www.whitbyfarmersmarket.ca/_files/ugd/606805_6bf4637c516f49eaba50986331758136.pdf' },
  { event: '124 Grand Market', place: 'Edmonton, AB', type: 'Farmers market', season: '2026', rule: 'Vendors must have four weights of 40 pounds or more, one on each tent leg.', url: 'https://124grandmarket.com/before-you-apply' },
  { event: 'Festival in the Park', place: 'Charlotte, NC', type: 'Community festival', season: '2026', rule: 'The Fire Marshal requires each tent to be secured at each corner with weights of at least 40 pounds.', url: 'https://festivalinthepark.org/wp-content/uploads/2025/11/ExhibitorApp2026R.pdf' },
  { event: 'Des Moines Arts Festival', place: 'Des Moines, IA', type: 'Art festival', season: '2026', rule: 'All tents must have at least 40 pounds of weight on each leg.', url: 'https://www.desmoinesartsfestival.org/food-vendor-guidelines' },
  { event: 'Jingle Bell Bazaar', place: 'Tampa, FL', type: 'Holiday market', season: '2026', rule: 'A 10′ × 10′ canopy tent is required unless otherwise approved, with at least 40 pounds of weight on each tent leg.', url: 'https://www.jinglebellbazaar.com/vendor-requirements' },
  { event: 'Old City Market', place: 'Knoxville, TN', type: 'Farmers market', season: '2026', rule: 'Tents must be weighted with at least 40 pounds per leg.', url: 'https://oldcityknoxville.org/wp-content/uploads/2026/04/2026-oldcitymarket-handbook.pdf' },
  { event: 'Poolesville Day', place: 'Poolesville, MD', type: 'Community festival', season: '2026', rule: 'All pop-up tents must be secured with 40 pounds per leg.', url: 'https://www.eventeny.com/events/vendor/?id=46569' },
  { event: 'Danville Tri Kappa Fair on the Square', place: 'Danville, IN', type: 'Street fair', season: '2026', rule: 'All tents must be secured with weights of at least 40 pounds attached to each pole.', url: 'https://www.eventeny.com/events/vendor/?id=40981' },
  { event: 'Fairborn Halloween Festival', place: 'Fairborn, OH', type: 'Community festival', season: '2026', rule: 'Tents must be held down with weight equal to 40 pounds per leg.', url: 'https://fairbornchamber.com/wp-content/uploads/2026-Fairborn-Halloween-Festival-Vendor-Application.pdf' },
  { event: 'Prairie Arts Festival', place: 'Schaumburg, IL', type: 'Art festival', season: '2026', rule: 'A minimum weight of 40 pounds must be secured to each tent leg unless the tent manufacturer’s specifications state otherwise.', url: 'https://www.eventeny.com/events/vendor/?id=41956' },
  { event: 'Big Chili Cook-Off', place: 'Evergreen, CO', type: 'Food festival', season: '2026', rule: 'Each tent leg must have a 40-pound weight.', url: 'https://www.bigchili.org/food-retail-vendors' },
  { event: 'Breckenridge Summer Beer Festival', place: 'Breckenridge, CO', type: 'Food festival', season: '2026', rule: 'Tents must have one 40-pound weight per leg, for 160 pounds total; staking is not allowed, and weights must be suspended off the ground and secured from the top of the tent.', url: 'https://summer.breckenridgebeerfestival.com/vendor-registration/' },
  { event: 'Crossroads First Fridays', place: 'Kansas City, MO', type: 'Art festival', season: '2026', rule: 'Weights of 20–30 pounds per canopy leg are required.', url: 'https://www.eventeny.com/events/vendor/?id=51775' },
  { event: 'Portland Fine Craft Show', place: 'Portland, ME', type: 'Craft show', season: '2026', rule: 'Tent weights of 40 pounds are required at each corner.', url: 'https://shopmainecraft.com/programs/portland-fine-craft-show/portland-fine-craft-show-exhibitor-guide/' },
  { event: 'Penticton Night Market', place: 'Penticton, BC', type: 'Night market', season: '2026', rule: 'Each tent leg must have a 30-pound weight, and staking is not allowed.', url: 'https://www.pentictonnightmarket.com/vendors' },
  { event: 'Gold Fest', place: 'El Dorado, KS', type: 'Community festival', season: '2026', rule: 'Each pole must have at least 25 pounds of weight.', url: 'https://www.experienceeldo.com/gold-fest-vendor' },
  { event: 'Covington Fall Festival', place: 'Covington, GA', type: 'Community festival', season: '2026', rule: 'All four tent legs must be weighted, using store-bought tent weights, water-filled gallon jugs, cinder blocks, or other heavy-duty items attached directly to each leg.', url: 'https://cityofcovington.org/ckeditorfiles/files/2026_FallFestivalVendorPolicy.pdf' },
  { event: 'Fife History Museum Car Show', place: 'Fife, WA', type: 'Car show', season: '2026', rule: 'Vendors must provide 10-pound weights for each canopy leg.', url: 'https://www.fifehistorymuseum.org/wp-content/uploads/2026/03/Car-Show-Vendor-Form-2026.pdf' },
  { event: 'Overland Expo Mountain West', place: 'Loveland, CO', type: 'Community festival', season: '2026', rule: '10 × 10 tents must have a minimum of 50 pounds per leg.', url: 'https://www.overlandexpo.com/wp-content/uploads/2025/11/26MW-Exhibitor-Service-Manual.pdf' },
  { event: 'Watch City Steampunk Festival', place: 'Waltham, MA', type: 'Community festival', season: '2026', rule: 'Each tent leg must have 40 pounds of weight.', url: 'https://www.watchcityfestival.com/vendor-faq' },
  { event: 'Flowery Branch Farmers Market', place: 'Flowery Branch, GA', type: 'Farmers market', season: '2026', rule: 'Tents must have weights.', url: 'https://flowerybranchfarmersmarket.com/be-a-vendor' },
  { event: 'Artists’ Garage Sale', place: 'Everett, WA', type: 'Craft show', season: '2026', rule: 'Each corner must have at least 40 pounds of weight.', url: 'https://www.schack.org/artist-garage-sale-vendor-guidelines' },
  { event: 'Taste of Latino Festival', place: 'Tampa, FL', type: 'Food festival', season: '2026', rule: 'Tents and canopies must be weighted with 30 pounds per leg.', url: 'https://www.cubansandwichfestival.com/uploads/1/3/9/7/13978720/2026_tol_ybor_vendor_exhibitor_set_up_info_rev.pdf' },
  { event: 'HOLA Festival', place: 'Knoxville, TN', type: 'Community festival', season: '2026', rule: 'All tents must have 20-pound weights on each pole.', url: 'https://holahoralatina.org/craft/' },
  { event: 'Edmonds Museum Holiday Market', place: 'Edmonds, WA', type: 'Holiday market', season: '2026', rule: 'Anchoring weights of 40 pounds per leg are required.', url: 'https://arnoldlund.aidaform.com/holiday-market-application' },
  { event: 'Holiday Markets Weekend', place: 'Boerne, TX', type: 'Holiday market', season: '2026', rule: 'Vendors must secure each canopy with weights of at least 20 pounds per leg or screw-in pet stakes.', url: 'https://eventsoffmain.com/wp-content/uploads/2026/01/Holiday-Markets-Application-pg1.pdf' },
  { event: 'Pecan Street Collective', place: 'Pflugerville, TX', type: 'Street fair', season: '2026', rule: 'Tent weights are required for all canopies.', url: 'https://pecanstreetcollective.com/vendor-information' },
  { event: 'Sherman Oaks Street Fair', place: 'Sherman Oaks, CA', type: 'Street fair', season: '2026', rule: 'All non-food booth vendors are required to have a canopy with weights.', url: 'https://shermanoaksstreetfair.org/vendors' },
  { event: 'Bethany Village Events', place: 'Portland, OR', type: 'Community festival', season: '2026', rule: 'Vendors must have weights on all four canopy corners, with 40 pounds or more per leg.', url: 'https://www.bethanyvillage.com/wp-content/uploads/2024/12/2025-Bethany-Village-Events-Rules.pdf' },
  { event: 'Artisan Markets', place: 'Boulder, CO', type: 'Craft show', season: '2026', rule: 'Weights of 40 pounds per tent leg are required.', url: 'https://artisanmarkets.co/wp-content/uploads/2025/04/Artisan-Markets-Vendor-Agreement.pdf' },
  { event: '906 Lapeer Food Trucks', place: 'Saginaw, MI', type: 'Food festival', season: '2026', rule: 'Booths may be weighted with the equivalent of at least 40 pounds per pole.', url: 'https://906lapeer.com/906-lapeer-food-trucks-form/' },
  { event: 'Jax Night Market', place: 'Jacksonville, FL', type: 'Night market', season: '2026', rule: 'Tent weights are required, with 40–80 pounds per leg recommended.', url: 'https://jaxnightmarket.com/terms.html' },
  { event: 'Peace Peloton Night Market', place: 'Seattle, WA', type: 'Night market', season: '2026', rule: '10′ × 10′ tents with weights are required.', url: 'https://www.peacepeloton.com/vendors' },
  { event: 'Drift Nirvana Capital Mischief Car Show', place: 'Summit Point, WV', type: 'Car show', season: '2026', rule: 'All equipment must have weights of at least 25 pounds per leg.', url: 'https://www.motorsportreg.com/events/drift-nirvana-capital-mischief-car-show-summit-point-motorsports-park-057121' },
  { event: 'indiYEAH! Fest', place: 'Edmonton, AB', type: 'Community festival', season: '2026', rule: 'Canopies must be weighted with appropriate canopy weights.', url: 'https://indiyeahfest.ca/vendors/' },
  { event: 'Annapolis Chocolate Binge Festival', place: 'Annapolis, MD', type: 'Food festival', season: '2026', rule: 'Vendors must secure their tents and/or umbrellas with suitable weights of at least 40 pounds per leg.', url: 'https://www.iwsannapolis.com/vendor-application' },
  { event: 'Taste of Asia', place: 'Denver, CO', type: 'Food festival', season: '2026', rule: 'Each tent leg must have at least 50 pounds of weight; tents that are not properly weighted will incur additional fees.', url: 'https://www.cdbf.org/food-vendors' },
  { event: 'Saratoga County Fair', place: 'Ballston Spa, NY', type: 'County fair', season: '2026', rule: 'The tent must be weighted down with 100-pound weights and staked to the ground.', url: 'https://www.saratogacountyfair.org/wp-content/uploads/2026/02/2026-Vendor-Handbook.pdf' },
  { event: 'Celebrate Woodinville', place: 'Woodinville, WA', type: 'Community festival', season: '2026', rule: 'Only vertical-leg canopies are allowed, and each corner must be anchored with a 25-pound weight.', url: 'https://www.celebratewoodinville.com/summer-event-series/participate/artist-booth-application-and-terms/' }
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

// Rich, per-city editorial content for the canonical city landing pages
// (/trade-show-canopies|trade-show-displays|banner-stands/{slug}). Only cities
// present here render the expanded sections; others fall back to the standard
// template, so the rollout is incremental and no page is ever left thin/empty.
//
// STRICT RULES for every entry:
//  - Real, verifiable facts only (convention-center names, industries, climate).
//  - NEVER imply a physical Apex presence — Apex is online-only and SHIPS to the
//    city. Use "ships to {city}", never "our {city} office/warehouse/team".
//  - NEVER invent per-city delivery day-counts — production time is standard
//    (6–8 business days, 2–3 day rush); transit varies by destination.
//  - NEVER invent customers, projects, reviews or case studies.
//  - Headings and paragraphs are unique per city (no boilerplate reuse).

export const CITY_DETAIL = {
  'las-vegas': {
    // ~40-word answer-first summary (also used for the AEO answer block).
    answer:
      'Las Vegas is the busiest trade-show city in the United States, hosting CES, MAGIC, World of Concrete and SEMA across venues like the Las Vegas Convention Center and Caesars Forum. Apex prints custom displays and ships them to Las Vegas.',
    overview: [
      'No city runs more major trade shows than Las Vegas. Between the Las Vegas Convention Center, Caesars Forum, The Venetian Expo and the Mandalay Bay Convention Center, the city turns over enormous exhibitions almost every week of the year — CES alone draws well over 100,000 attendees. For an exhibitor that means fierce competition for attention on the floor, and a booth that has to read clearly from across a packed hall.',
      'Because so many shows here are national and international, your display is often the first impression a buyer gets of your brand. Sharp, full-colour graphics on a canopy, banner stand or backdrop do more work in Las Vegas than almost anywhere else. Apex prints every piece to order and ships it to your Las Vegas hotel, venue or business address, so you can arrive to a booth that matches the scale of the room.'
    ],
    whyExhibit:
      'Las Vegas concentrates more qualified buyers into a few days than months of outreach elsewhere. The convention corridor along Paradise Road and the Strip keeps attendees, hotels and show floors within a short ride of each other, so foot traffic stays high from open to close. Exhibiting here puts you in front of decision-makers who flew in specifically to source and compare — but only if your booth stands out. A cohesive set of branded displays (a printed backdrop behind the booth, retractable banners at the aisle, a table cover on the demo table, and a canopy for any outdoor or sponsor activation) gives a small footprint the presence of a much larger stand.',
    conventionCenters: [
      { name: 'Las Vegas Convention Center (LVCC)', desc: 'One of the largest convention facilities in North America at roughly 4.6 million square feet after the West Hall expansion. Home to CES, and connected by the underground Loop people-mover.' },
      { name: 'The Venetian Expo', desc: 'A large Strip-connected exhibition hall (formerly the Sands Expo) hosting MAGIC, apparel and consumer shows alongside the Venetian and Palazzo hotels.' },
      { name: 'Caesars Forum', desc: 'A modern conference centre with two of the largest pillarless ballrooms in the world, linked to Caesars-group hotels in the centre of the Strip.' },
      { name: 'Mandalay Bay Convention Center', desc: 'A premium south-Strip venue used for medical, technology and association meetings, attached directly to the Mandalay Bay resort.' }
    ],
    industries: [
      ['Technology & electronics', 'CES and dozens of spin-off tech events make Las Vegas the default US launch stage for consumer and B2B technology.'],
      ['Construction & industrial', 'World of Concrete and similar shows fill the outdoor lots and halls with heavy-equipment and building-product exhibitors.'],
      ['Automotive & aftermarket', 'SEMA turns the city into the centre of the vehicle-modification and parts industry each autumn.'],
      ['Fashion & apparel', 'MAGIC and related markets bring apparel, footwear and accessory brands to the Strip several times a year.'],
      ['Hospitality & gaming', 'As the industry’s home city, hospitality, food-service and gaming-supply shows are a year-round fixture.']
    ],
    climate:
      'Las Vegas sits in the Mojave Desert: expect very hot, dry summers (frequently above 100°F / 38°C), intense UV, and gusty wind across open lots and parking-area activations. For any outdoor or entrance canopy, always add weight — water or sand bags on every leg — because the ground is usually hard-surfaced and stakes are not an option. Dye-sublimated graphics resist fading under the strong sun, and a printed canopy top plus half-walls give attendees shade, which is a real draw in Nevada heat.',
    planning:
      'Large Las Vegas venues typically route booth freight through the show\'s official contractor, and many offer an advance warehouse that receives shipments in the weeks before the show and delivers them to your space on setup day — shipping there is usually smoother than sending to the show floor on move-in morning. Budget for material handling (drayage) and expect union labor for installation at the biggest halls. Because portable displays like retractable banners, fabric backdrops and table covers pack into a single case or tube, they sidestep much of that cost and can often travel as checked luggage or a small parcel. Whichever route you choose, approve your artwork proof early: production runs 6–8 business days (2–3 with rush) before transit, and the weeks around CES, SEMA and MAGIC are the busiest of the year.',
    bestDisplays:
      'Match the display to the show. For an indoor CES or MAGIC booth, a step & repeat or tension-fabric backdrop gives a clean branded wall, retractable banner stands hold key messaging at the aisle, and a fitted table cover turns a rented table into brand space. For SEMA and other shows with outdoor or parking-lot components, a printed canopy tent creates a shaded, branded footprint — just weight every leg. For sponsorships, registration areas and hotel-lobby activations, lightweight X-stand and tabletop banners set up in seconds and move easily between spaces.',
    // City-specific FAQ (rendered visibly + as FAQPage schema).
    faqs: [
      { q: 'Do you ship trade show displays to Las Vegas?', a: 'Yes. Apex is an online supplier and ships custom-printed displays to Las Vegas and anywhere in Nevada — to your hotel, the show’s receiving dock, or a business address.' },
      { q: 'Can I get a display in time for CES or a big Las Vegas show?', a: 'Standard production is 6–8 business days after proof approval, with an optional 2–3 business day rush; transit time is added on top and varies by destination. For CES, SEMA or MAGIC, order early — those weeks are the busiest of the year.' },
      { q: 'Do canopy tents need weights at Las Vegas venues?', a: 'Yes. Most Las Vegas activations are on concrete or asphalt where ground stakes can’t be used, and desert wind can gust, so water or sand weight bags on each leg are strongly recommended.' },
      { q: 'Will printed graphics fade in the Las Vegas sun?', a: 'Our graphics are dye-sublimated, which bonds the ink into the fabric for strong UV and fade resistance — a good match for the high desert sun.' },
      { q: 'Which displays work best inside the Las Vegas Convention Center?', a: 'For indoor booths, a step & repeat backdrop or tension-fabric wall anchors the space, retractable banner stands mark the aisle, and a printed table cover finishes a demo table. Canopies are best for outdoor and sponsor areas.' },
      { q: 'Where do you deliver in Las Vegas?', a: 'To any Las Vegas address you provide — resort convention receiving, an advance-warehouse, or your office. Confirm your venue’s labelling and delivery-window rules, as Strip venues often require advance-warehouse shipments.' }
    ]
  }
};

export const cityDetailFor = (slug) => CITY_DETAIL[slug] || null;

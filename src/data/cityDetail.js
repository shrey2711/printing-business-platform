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
  },

  'orlando': {
    answer:
      'Orlando is a top-three US convention city, anchored by the Orange County Convention Center — one of the largest halls in the country. Apex prints custom trade show displays and ships them to Orlando for shows at the OCCC and the I-Drive resort corridor.',
    overview: [
      'Orlando pairs a massive convention footprint with year-round tourism, so exhibitors reach both trade buyers and a steady flow of visitors. The Orange County Convention Center runs enormous national shows across its West and North/South buildings, while the International Drive corridor keeps hotels, restaurants and meeting space within a short shuttle of the halls.',
      'That mix rewards displays that look polished under bright expo lighting and hold up to Florida humidity. Apex prints canopies, banner stands, backdrops and table covers to order and ships them to your Orlando hotel, the OCCC receiving dock or your business address, so your booth is ready when you land.'
    ],
    whyExhibit:
      'Orlando draws attendees who are already in a travel-and-spend mindset, and its convention calendar spans technology, healthcare, education, hospitality and homebuilding. The compact I-Drive layout means high, sustained booth traffic, and the city’s tourism infrastructure makes it easy for teams and clients to attend. A coordinated display set — a backdrop for the booth wall, banner stands at the aisle, a branded table cover, and a canopy for any outdoor or pool-deck activation — helps a modest space compete with far larger stands.',
    conventionCenters: [
      { name: 'Orange County Convention Center (OCCC)', desc: 'One of the largest convention centres in the United States, split across the West and North/South buildings on International Drive, hosting major national technology, medical and consumer shows.' },
      { name: 'Gaylord Palms Resort & Convention Center', desc: 'A large resort-based meeting venue near the theme parks, popular for association conferences and corporate events under its signature glass atrium.' },
      { name: 'Rosen Centre & Rosen Shingle Creek', desc: 'Two sizeable hotel convention venues on and near I-Drive frequently used for mid-size trade shows and breakout programming.' }
    ],
    industries: [
      ['Hospitality & tourism', 'As a global tourism capital, Orlando hosts a deep calendar of hospitality, attractions and travel-industry events.'],
      ['Healthcare & medical', 'Large medical, dental and health-technology conventions are a regular fixture at the OCCC.'],
      ['Technology & simulation', 'Orlando is a hub for modeling, simulation and training (I/ITSEC) alongside broader tech shows.'],
      ['Education & training', 'National education and training associations meet here often, drawing school and university buyers.'],
      ['Homebuilding & construction', 'Building-product and home-improvement shows use the large exhibit halls for equipment-heavy displays.']
    ],
    climate:
      'Orlando’s humid subtropical climate brings hot, wet summers with near-daily afternoon thunderstorms, high humidity, and an Atlantic hurricane season from June to November. For outdoor or entrance activations, choose a canopy for genuine shade and quick rain cover, and always weight the legs — sudden downpours and gusts are common. Dye-sublimated graphics shrug off UV and humidity, and wrinkle-resistant fabric displays travel and re-hang well in the moist air.',
    planning:
      'Most large Orlando shows route freight through the official contractor, with an advance warehouse available before move-in — shipping there is usually easier than sending to the OCCC floor on setup morning. Budget for material handling, and remember that portable displays (retractable banners, fabric backdrops, table covers) pack into a case or tube and avoid much of that cost. Approve your proof early: production is 6–8 business days (2–3 with rush) before transit, and Orlando’s peak convention months book up quickly.',
    bestDisplays:
      'For an indoor OCCC booth, a step & repeat or tension-fabric backdrop anchors the wall, retractable banners carry your headline at the aisle, and a fitted table cover brands the demo table. For resort, pool-deck or entrance activations along I-Drive, a printed canopy delivers shade and a branded footprint — weight every leg for Florida gusts. Lightweight X-stand and tabletop banners suit registration desks and hotel meeting rooms.',
    faqs: [
      { q: 'Do you ship trade show displays to Orlando?', a: 'Yes. Apex ships custom-printed displays to Orlando and across Florida — to your hotel, the Orange County Convention Center receiving dock, or a business address.' },
      { q: 'How early should I order for an OCCC show?', a: 'Production is 6–8 business days after proof approval (2–3 with rush), plus transit that varies by address. Orlando’s big national shows are busy — ordering two to three weeks ahead is safest.' },
      { q: 'Do canopies hold up to Orlando rain and humidity?', a: 'Yes — the printed tops are water-resistant and the dye-sublimated graphics resist humidity and UV. Weight every leg, since afternoon storms and gusts are common.' },
      { q: 'Which displays are best inside the Orange County Convention Center?', a: 'A fabric backdrop or step & repeat for the booth wall, retractable banner stands at the aisle, and a printed table cover for demos. Save canopies for outdoor or resort activations.' },
      { q: 'Can you deliver to a resort convention venue like Gaylord Palms?', a: 'Yes. We deliver to any Orlando address you provide, including resort convention receiving — just confirm the venue’s labelling and delivery-window rules.' },
      { q: 'Is rush production available for Orlando shows?', a: 'Yes, a 2–3 business day rush is available on most instant-priced products; transit is added on top and depends on your delivery address.' }
    ]
  },

  'chicago': {
    answer:
      'Chicago hosts North America’s largest convention centre, McCormick Place, and marquee shows like IMTS, RSNA and the National Restaurant Association Show. Apex prints custom displays and ships them to Chicago for exhibitors across the city.',
    overview: [
      'Chicago is a heavyweight of the US trade-show calendar. McCormick Place is the largest convention centre on the continent, and the city’s central location and rail/air connections make it a natural meeting point for national manufacturing, medical and food-industry shows. Rosemont’s Donald E. Stephens Convention Center adds a busy secondary venue near O’Hare.',
      'Exhibitors here face big halls and sophisticated audiences, so crisp, well-lit branding matters. Apex prints banner stands, backdrops, table covers and canopies to order and ships them to your Chicago venue, an advance warehouse or your business address, ready for move-in.'
    ],
    whyExhibit:
      'Few cities concentrate industrial and professional buyers like Chicago. McCormick Place alone hosts shows that define their industries — manufacturing technology, radiology, restaurants and housewares — and the metro’s dense corporate base means strong local attendance on top of national travellers. A cohesive display kit lets a compact booth read clearly across a very large hall, where a bare table disappears.',
    conventionCenters: [
      { name: 'McCormick Place', desc: 'The largest convention centre in North America, with around 2.6 million square feet of exhibit space across four connected buildings on the lakefront south of downtown.' },
      { name: 'Donald E. Stephens Convention Center', desc: 'A large venue in Rosemont next to O’Hare, convenient for shows that draw fly-in attendees and exhibitors.' },
      { name: 'Navy Pier — Festival Hall', desc: 'A lakefront exhibition space downtown used for consumer expos, art fairs and mid-size events.' }
    ],
    industries: [
      ['Manufacturing & industrial', 'IMTS and similar shows make Chicago the US stage for machine tools, automation and industrial equipment.'],
      ['Healthcare & medical imaging', 'RSNA and other medical conventions fill McCormick Place with clinical and device exhibitors.'],
      ['Food service & restaurants', 'The National Restaurant Association Show draws foodservice buyers from around the world.'],
      ['Housewares & consumer goods', 'The Inspired Home Show (IHA) brings housewares and home brands to the lakefront.'],
      ['Transportation & logistics', 'As a national rail and freight hub, Chicago hosts major supply-chain and transportation events.']
    ],
    climate:
      'Chicago swings from cold, snowy winters to hot, humid summers, and lake-effect wind lives up to the “Windy City” name year-round. Most shows are indoors, but for any outdoor or plaza activation, heavily weight every canopy leg and plan for gusts off Lake Michigan. Winter move-ins mean protecting graphics from snow and salt in transit — dye-sublimated fabric packs and re-hangs without creasing once inside.',
    planning:
      'McCormick Place and other large Chicago venues route freight through the official show contractor, with an advance warehouse before move-in and union labor for installation at the biggest halls — factor material handling into the budget. Portable displays sidestep much of that: retractable banners, fabric backdrops and table covers travel as a case or tube. Approve artwork early, as production runs 6–8 business days (2–3 rush) before transit, and Chicago’s flagship shows cluster in busy seasons.',
    bestDisplays:
      'For a McCormick Place booth, a tension-fabric backdrop or step & repeat sets the brand wall, retractable banners hold messaging at the aisle, and a fitted table cover finishes a demo station. For lakefront or plaza activations, a weighted canopy gives shade and shelter. Lightweight X-stand and tabletop banners are ideal for Rosemont and hotel meeting spaces where setup speed matters.',
    faqs: [
      { q: 'Do you ship trade show displays to Chicago?', a: 'Yes. Apex ships custom-printed displays to Chicago and across Illinois — to McCormick Place, Rosemont, a downtown venue or your business address.' },
      { q: 'How should freight reach McCormick Place?', a: 'Large shows use an official contractor and often an advance warehouse; shipping there ahead of move-in is usually smoother than to the show floor. Portable displays can also ship directly to your hotel.' },
      { q: 'When should I order for a Chicago show?', a: 'Production is 6–8 business days after proof approval (2–3 with rush) plus transit. For IMTS, RSNA or the Restaurant Show, order a few weeks ahead — those are peak weeks.' },
      { q: 'Do outdoor canopies work in Chicago wind?', a: 'Yes, with proper weights on every leg. Lake Michigan gusts are strong, so water or sand bags are essential for any outdoor activation.' },
      { q: 'Which displays suit a large hall like McCormick Place?', a: 'A fabric backdrop or step & repeat reads from a distance, retractable banners mark the aisle, and a printed table cover brands your table — a strong, portable kit for big rooms.' },
      { q: 'Is rush production available for Chicago exhibitors?', a: 'Yes — a 2–3 business day rush is available on most instant-priced products, with transit added based on your delivery address.' }
    ]
  },

  'atlanta': {
    answer:
      'Atlanta is a major Southeast convention hub, home to the Georgia World Congress Center and AmericasMart. Apex prints custom trade show displays and ships them to Atlanta for exhibitors across logistics, film, foodservice and gift industries.',
    overview: [
      'Atlanta combines one of the country’s largest convention centres with the enormous AmericasMart wholesale marts and the world’s busiest airport, making it a magnet for national buyers. The Georgia World Congress Center runs large-scale shows downtown, steps from hotels and the arena/stadium district.',
      'For exhibitors, that means high-volume audiences and easy fly-in access — and displays that need to look sharp under bright hall lighting and through humid Georgia summers. Apex prints backdrops, banner stands, table covers and canopies to order and ships them to your Atlanta venue or business address.'
    ],
    whyExhibit:
      'Atlanta’s pull comes from logistics and reach: Hartsfield-Jackson connects buyers from everywhere, and the metro’s corporate base spans logistics, film and entertainment, fintech and foodservice. AmericasMart adds year-round wholesale traffic in gift, home and apparel. A branded display set helps you stand out in the GWCC’s large halls and turns a small booth into a professional, cohesive presence.',
    conventionCenters: [
      { name: 'Georgia World Congress Center (GWCC)', desc: 'One of the largest convention centres in the US at roughly 1.5 million square feet of exhibit space, in downtown Atlanta beside Centennial Olympic Park.' },
      { name: 'AmericasMart Atlanta', desc: 'A massive year-round wholesale marketplace for gift, home, rug and apparel buyers, running major markets several times a year.' },
      { name: 'Cobb Galleria Centre', desc: 'A mid-size convention venue in the Galleria area north of downtown, used for regional trade shows and consumer expos.' }
    ],
    industries: [
      ['Logistics & supply chain', 'With the world’s busiest airport and a major freight network, Atlanta hosts leading supply-chain and transportation events.'],
      ['Film, TV & entertainment', 'A booming production industry supports media, gaming and entertainment-technology gatherings.'],
      ['Foodservice & agriculture', 'Poultry, foodservice and agriculture shows are long-standing GWCC fixtures.'],
      ['Gift, home & apparel', 'AmericasMart drives national wholesale buying in gift, home décor and apparel.'],
      ['Fintech & technology', 'Atlanta’s strong fintech and technology sector fuels professional and B2B conferences.']
    ],
    climate:
      'Atlanta’s humid subtropical climate means hot, humid summers with frequent afternoon thunderstorms, heavy spring pollen, and mild winters. For outdoor or entrance activations, a canopy provides shade and quick rain cover — weight the legs for storm gusts. Dye-sublimated graphics handle the sun and humidity, and wrinkle-resistant fabric displays stay crisp despite the moisture.',
    planning:
      'Large GWCC shows route freight through the official contractor, typically with an advance warehouse before move-in; shipping there is smoother than to the floor on setup day, and material handling should be budgeted. Portable displays — retractable banners, fabric backdrops, table covers — pack small and avoid much of that cost. Approve your proof early: production is 6–8 business days (2–3 rush) before transit, and AmericasMart weeks are especially busy.',
    bestDisplays:
      'For a GWCC booth, a step & repeat or tension-fabric backdrop builds the brand wall, retractable banners carry messaging at the aisle, and a fitted table cover finishes the table. For outdoor or campus activations, a weighted canopy adds shade and shelter. For AmericasMart showrooms and hotel meetings, lightweight X-stand and tabletop banners set up fast.',
    faqs: [
      { q: 'Do you ship trade show displays to Atlanta?', a: 'Yes. Apex ships custom-printed displays to Atlanta and across Georgia — to the Georgia World Congress Center, AmericasMart, or your business address.' },
      { q: 'How early should I order for an Atlanta show?', a: 'Production is 6–8 business days after proof approval (2–3 with rush) plus transit that varies by address. For GWCC shows and AmericasMart markets, order a few weeks ahead.' },
      { q: 'Can you deliver to AmericasMart or the GWCC?', a: 'Yes — we deliver to any Atlanta address you provide, including convention and mart receiving. Confirm the venue’s labelling and delivery-window rules.' },
      { q: 'Do canopies handle Atlanta’s summer storms?', a: 'Yes. The printed tops are water-resistant and provide fast shade or rain cover; always weight every leg for thunderstorm gusts.' },
      { q: 'Which displays work best in the GWCC’s large halls?', a: 'A fabric backdrop or step & repeat that reads at a distance, retractable banners at the aisle, and a printed table cover — a portable, high-impact kit.' },
      { q: 'Is rush production available for Atlanta exhibitors?', a: 'Yes, a 2–3 business day rush is offered on most instant-priced products, with transit added based on your delivery address.' }
    ]
  },

  'dallas': {
    answer:
      'Dallas is a leading Texas convention city, anchored by the Kay Bailey Hutchison Convention Center and the huge Dallas Market Center. Apex prints custom trade show displays and ships them to Dallas for energy, technology, healthcare and wholesale exhibitors.',
    overview: [
      'Dallas offers a big-market convention scene with a strong business base and central US location. The Kay Bailey Hutchison Convention Center hosts large downtown shows, while the Dallas Market Center runs year-round wholesale markets in apparel, gifts and home. DFW’s airport connectivity makes it easy for national exhibitors and buyers to attend.',
      'Texas heat and bright halls call for durable, high-contrast branding. Apex prints canopies, banner stands, backdrops and table covers to order and ships them to your Dallas venue, an advance warehouse or your business address, ready for setup.'
    ],
    whyExhibit:
      'Dallas concentrates energy, technology, defense and healthcare buyers, plus a massive wholesale trade through the Market Center. The metro’s growth and corporate relocations keep local attendance strong, and central-US logistics make it efficient to ship in. A coordinated display set helps a compact booth hold its own in the convention center’s large exhibit halls.',
    conventionCenters: [
      { name: 'Kay Bailey Hutchison Convention Center (KBHCCD)', desc: 'Downtown Dallas’s primary convention venue with large contiguous exhibit halls, currently undergoing a major expansion and modernization.' },
      { name: 'Dallas Market Center', desc: 'One of the world’s largest wholesale marketplaces, hosting year-round apparel, gift, home and lighting markets for trade buyers.' },
      { name: 'Irving Convention Center at Las Colinas', desc: 'A modern mid-size venue between Dallas and DFW airport, popular for regional trade shows and conferences.' }
    ],
    industries: [
      ['Energy & oil and gas', 'Texas’s energy sector supports major upstream, midstream and services trade shows.'],
      ['Technology & telecom', 'The Telecom Corridor and growing tech base drive B2B technology conferences.'],
      ['Wholesale apparel, gift & home', 'The Dallas Market Center anchors national wholesale buying across several categories.'],
      ['Healthcare & medical', 'Large healthcare and medical-device conventions use the downtown halls.'],
      ['Defense & aerospace', 'A strong regional aerospace and defense industry underpins specialized expos.']
    ],
    climate:
      'Dallas summers are hot, often above 100°F (38°C), with strong sun and a spring severe-storm and tornado season. For outdoor activations, a canopy delivers essential shade — weight every leg, since the ground is usually hard-surfaced and winds can gust ahead of storms. Dye-sublimated graphics resist the intense UV, and fabric displays stay crisp in the dry heat.',
    planning:
      'Large downtown shows route freight through the official contractor, usually with an advance warehouse before move-in and material handling to budget. The Dallas Market Center has its own receiving and showroom logistics — confirm details with your space. Portable displays pack into a case or tube and avoid much drayage. Approve artwork early: production is 6–8 business days (2–3 rush) before transit, and market weeks are busy.',
    bestDisplays:
      'For a convention-center booth, a tension-fabric backdrop or step & repeat sets the wall, retractable banners hold the aisle, and a fitted table cover brands the table. For outdoor Texas activations, a weighted canopy provides shade. For Market Center showrooms and hotel events, lightweight X-stand and tabletop banners set up in seconds.',
    faqs: [
      { q: 'Do you ship trade show displays to Dallas?', a: 'Yes. Apex ships custom-printed displays to Dallas–Fort Worth and across Texas — to the Kay Bailey Hutchison Convention Center, the Dallas Market Center, or your business address.' },
      { q: 'How early should I order for a Dallas show or market week?', a: 'Production is 6–8 business days after proof approval (2–3 with rush) plus transit. For downtown shows and Market Center weeks, order a few weeks ahead.' },
      { q: 'Do canopies handle Dallas heat and wind?', a: 'Yes — canopies give real shade in Texas heat and use UV-stable dye-sublimated graphics; weight every leg, as winds can gust ahead of spring storms.' },
      { q: 'Can you deliver to the Dallas Market Center?', a: 'Yes, we deliver to any Dallas address you provide, including convention and market receiving. Confirm labelling and delivery-window rules with your space.' },
      { q: 'Which displays suit the convention center’s large halls?', a: 'A fabric backdrop or step & repeat, retractable banners at the aisle, and a printed table cover — a portable kit that reads well across a big room.' },
      { q: 'Is rush production available for Dallas exhibitors?', a: 'Yes — a 2–3 business day rush is available on most instant-priced products, with transit added by destination.' }
    ]
  },

  'new-york': {
    answer:
      'New York City’s Javits Center hosts flagship shows like NRF, NY NOW and New York Comic Con. Apex prints custom trade show displays and ships them to NYC — with portable options built for tight Manhattan logistics.',
    overview: [
      'Manhattan’s Jacob K. Javits Convention Center is the city’s primary exhibition hall and, after its expansion, one of the busiest on the East Coast. It hosts retail, fashion, media and consumer shows that draw international buyers to the West Side.',
      'New York’s dense, high-cost logistics make portability a real advantage: freight, parking and loading are tight, so displays that pack into a case or tube save time and money. Apex prints banner stands, fabric backdrops, table covers and canopies to order and ships them to your NYC venue, hotel or business address.'
    ],
    whyExhibit:
      'No US market puts more retail, media, finance and fashion decision-makers in one place. Shows at the Javits Center — from the NRF Big Show to NY NOW and NYCC — command national and global attention, and the surrounding hotels and offices mean strong local turnout. Because space and labor are expensive in New York, a smart, portable display kit delivers maximum brand impact for the footprint and budget.',
    conventionCenters: [
      { name: 'Jacob K. Javits Convention Center', desc: 'Manhattan’s main convention hall on the Hudson-side West Side, expanded to around 840,000 square feet of exhibit space, hosting retail, consumer and pop-culture flagship shows.' },
      { name: 'Metropolitan Pavilion', desc: 'A flexible midtown/Chelsea event venue used for fashion, art and specialty trade shows.' },
      { name: 'Pier 36 / Hotel ballrooms', desc: 'Downtown pier space and large Manhattan hotel ballrooms host fashion presentations and mid-size expos across the city.' }
    ],
    industries: [
      ['Retail & consumer', 'The NRF Big Show and NY NOW make New York a global stage for retail and consumer-product buyers.'],
      ['Fashion & apparel', 'New York’s fashion industry drives apparel, accessory and textile trade events.'],
      ['Media, advertising & tech', 'A dense media and ad-tech sector fuels conferences and B2B expos.'],
      ['Finance & professional services', 'The financial capital hosts fintech and professional-services gatherings year-round.'],
      ['Food & beverage', 'Specialty food and hospitality shows bring national F&B buyers to the city.']
    ],
    climate:
      'New York has cold, sometimes snowy winters and hot, humid summers, with wind funneling between buildings and off the Hudson. Most exhibiting is indoors, so the bigger practical factor is logistics rather than weather — but any outdoor or plaza activation needs weighted canopies for gusts. In winter, protect graphics from snow and salt in transit; dye-sublimated fabric re-hangs crisp once inside.',
    planning:
      'The Javits Center uses union labor and an official freight contractor, and Manhattan loading windows are tight and tightly scheduled — shipping to the advance warehouse when offered is strongly recommended, and material handling should be budgeted. This is where portable displays shine: retractable banners, fabric backdrops and table covers can travel as checked luggage or a small parcel and set up without a crew. Approve artwork early, as production is 6–8 business days (2–3 rush) before transit.',
    bestDisplays:
      'For a Javits booth, a tension-fabric backdrop or step & repeat gives a seamless brand wall that packs into a bag, retractable banners hold the aisle, and a fitted table cover finishes the table — all crew-free to set up. For lobby, showroom or pop-up activations around the city, lightweight X-stand and tabletop banners move easily between venues. Reserve canopies for outdoor or plaza activations, always weighted.',
    faqs: [
      { q: 'Do you ship trade show displays to New York City?', a: 'Yes. Apex ships custom-printed displays to NYC and the surrounding area — to the Javits Center, a Manhattan hotel or venue, or your business address.' },
      { q: 'What’s the best way to get a display into the Javits Center?', a: 'The Javits Center uses union labor and an official freight contractor with tight loading windows; ship to the advance warehouse when offered. Portable displays can also ship directly to your hotel and set up without a crew.' },
      { q: 'Which displays are best for expensive, space-tight NYC shows?', a: 'Portable, crew-free displays — fabric backdrops, retractable banners and table covers — deliver strong branding while minimizing labor, freight and setup costs.' },
      { q: 'How early should I order for an NYC show?', a: 'Production is 6–8 business days after proof approval (2–3 with rush) plus transit. For NRF, NY NOW or NYCC, order well ahead — those weeks are extremely busy.' },
      { q: 'Do you deliver to Manhattan venues and hotels?', a: 'Yes — to any NYC address you provide. Confirm the venue’s labelling and delivery-window rules, which are often strict in Manhattan.' },
      { q: 'Is rush production available for New York exhibitors?', a: 'Yes, a 2–3 business day rush is available on most instant-priced products, with transit added based on your delivery address.' }
    ]
  }
};

export const cityDetailFor = (slug) => CITY_DETAIL[slug] || null;

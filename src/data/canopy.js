// Size and use-case landing-page data. Shared by the React routes and
// scripts/prerender.mjs so the crawlable HTML and the hydrated app can never
// drift apart. Plain ESM, no React imports — the prerender script imports it
// directly (same pattern as src/data/states.js).

// Only the three sizes we sell. Each /sizes/:slug page is an INFORMATIONAL size
// guide (dimensions, layout, capacity, uses) that targets research intent and
// links out to its matching commercial product page. Keeping the two apart
// avoids the two URLs competing for the same "10x10 custom canopy tent" query.
export const SIZES = [
  {
    slug: '10x10',
    label: "10' × 10'",
    product: 'canopy-tent-10x10',
    blurb: 'The standard vendor booth, and the size most event organisers allocate by default.',
    guide: {
      title: '10x10 Canopy Tent Size Guide',
      metaDescription:
        '10x10 canopy tent size guide — 100 sq ft footprint, how many tables and people it fits, booth layout ideas, wall options, and how it compares to a 10x15 or 10x20.',
      footprint: '100 sq ft — 10 ft wide × 10 ft deep, roughly 6.5–7 ft of clearance under the valance.',
      capacity: [
        'Seats 2–3 staff comfortably behind a counter or table.',
        'Fits one 6-ft table across the front, or two 6-ft tables in an L along two sides.',
        'Matches the single 10×10 booth space most markets, fairs and expos assign by default.'
      ],
      layouts: [
        'Front-counter setup: one table across the opening, product behind, staff working from inside.',
        'Open-browse setup: tables down both sides, a clear aisle up the middle for foot traffic.',
        'Add a back wall plus one side wall for shade and a printed backdrop while keeping the front open.'
      ],
      uses: [
        'Weekend farmers markets and craft fairs',
        'Single-booth trade shows and expos',
        'Sampling and promo activations',
        'Registration and info desks'
      ],
      comparison:
        'A 10×10 is the most portable size and the easiest for one or two people to set up. Step up to a 10×15 when one table is not enough room, or a 10×20 when you need a full double booth or a walk-through display.'
    }
  },
  {
    slug: '10x15',
    label: "10' × 15'",
    product: 'canopy-tent-10x15',
    blurb: 'Half again the width, for when one table is not enough.',
    guide: {
      title: '10x15 Canopy Tent Size Guide',
      metaDescription:
        '10x15 canopy tent size guide — 150 sq ft footprint, tables and staff it fits, booth layout ideas, wall options, and how it compares to a 10x10 or 10x20.',
      footprint: '150 sq ft — 10 ft deep × 15 ft wide, about 50% more covered space than a 10×10.',
      capacity: [
        'Comfortable for 3–4 staff working at once.',
        'Fits two 6-ft tables across the front with room to move, or a table plus a product display.',
        'Bridges the gap between a single and a double booth where a 10×20 will not fit.'
      ],
      layouts: [
        'Two front tables with a gap in the middle for customers to step in.',
        'One long service counter down one side, browsing space on the other.',
        'Back and two half-height side walls to frame the booth without closing it in.'
      ],
      uses: [
        'Busier market and fair booths that outgrew a 10×10',
        'Food and concession service with a queue under cover',
        'Team and club tents needing bench and gear space',
        'Product displays that need more frontage'
      ],
      comparison:
        'A 10×15 gives you meaningfully more frontage than a 10×10 while still fitting many single-booth allocations. Choose a 10×20 instead when you have a true double-booth space or want a walk-through layout.'
    }
  },
  {
    slug: '10x20',
    label: "10' × 20'",
    product: 'canopy-tent-10x20',
    blurb: 'A double booth under one roof — the widest single-canopy span most shows allow.',
    guide: {
      title: '10x20 Canopy Tent Size Guide',
      metaDescription:
        '10x20 canopy tent size guide — 200 sq ft footprint, tables and staff it fits, double-booth layout ideas, wall options, and how it compares to a 10x10 or 10x15.',
      footprint: '200 sq ft — 10 ft deep × 20 ft wide, the footprint of two 10×10 booths side by side.',
      capacity: [
        'Room for 4–6 staff without crowding.',
        'Fits three to four 6-ft tables, or tables plus a seating or demo area.',
        'Covers a standard double (10×20) booth allocation.'
      ],
      layouts: [
        'Walk-through: tables along both long sides with a wide aisle so customers move through the tent.',
        'Split-use: service and sales on one half, seating, demos or storage on the other.',
        'Full back wall plus side walls for a branded, weather-protected double booth.'
      ],
      uses: [
        'Double-booth trade shows and expos',
        'Large vendor and festival setups',
        'Corporate and sponsor activations',
        'Sports, tailgate and team hospitality areas'
      ],
      comparison:
        'A 10×20 is the largest single-canopy size and the widest span most shows allow before you move to multiple tents. If a double booth is more than you need, a 10×15 covers most mid-size setups; a 10×10 stays the most portable.'
    }
  }
];

// Each use-case page carries its OWN substance (intro, what matters, size and
// wall guidance) so the pages don't read as one template with the noun swapped.
export const SOLUTIONS = [
  {
    slug: 'vendor-market-tents',
    title: 'Vendor & Market Tents',
    blurb: 'Weekend markets and craft fairs where the booth is the whole storefront.',
    guide: {
      metaDescription:
        'Custom printed vendor and market canopy tents — printed valance for your name, walls for weather and product display, quick setup for weekend markets.',
      intro:
        'At a farmers market or craft fair your tent is your storefront. It has to read as your brand from across the lot, set up fast on a Saturday morning, and give you a clean surface to display product. A printed valance carrying your business name does more for walk-up traffic than any table sign.',
      focus: [
        'Printed valance with your business name so shoppers spot you down the row.',
        'A back wall and one side wall to hang product, block wind and create a backdrop.',
        'Fast one- or two-person setup and teardown for weekly market days.',
        'A footprint that fits the 10×10 space most markets rent by the stall.'
      ],
      sizing:
        'Most single-stall market vendors do well with a 10×10. If you carry a lot of product or need two tables across the front, size up to a 10×15.',
      walls:
        'A back wall plus one half-height side wall is the popular market setup — product display and wind protection while the front and one side stay open to browsers.',
      care:
        'The pop-up frame is aluminium and opens accordion-style — two people set it up in a few minutes with no tools, and it packs back into a wheeled carry bag between market days. The graphics are dye-sublimated into 600D polyester, so the ink is bonded into the fabric rather than sitting on top: colours stay bright and will not crack, peel or fade over a season of Saturdays. Spot-clean the top and walls with mild soap and water and let it dry fully before packing so it stays fresh. On an open lot, always add weights on each leg to hold it against a gust.'
    }
  },
  {
    slug: 'trade-show-tents',
    title: 'Trade Show Tents',
    blurb: 'Outdoor expo space that has to match your indoor booth branding.',
    guide: {
      metaDescription:
        'Custom printed trade show canopy tents — full-colour branding to match your indoor booth, printed back walls, and 10×20 double-booth options.',
      intro:
        'Outdoor expo space has to look as considered as your indoor booth. A printed canopy top, valance and back wall turn open pavement into a branded booth that photographs well and holds its own next to other exhibitors. Colour consistency with your indoor graphics matters — dye-sublimation prints hold brand colours cleanly.',
      focus: [
        'Full-colour top, valance and back wall for a finished exhibitor backdrop.',
        'Brand colours that match your indoor booth and printed collateral.',
        'A 10×20 to fill a double-booth allocation, or a 10×10 for a single space.',
        'A professional, weather-ready setup for multi-day outdoor shows.'
      ],
      sizing:
        'A 10×10 covers a single expo booth; step up to a 10×20 for a double-booth space or a walk-through layout with displays down both sides.',
      walls:
        'A full printed back wall is the key trade-show piece — it becomes your backdrop in every photo. Add half side walls to frame the booth without closing it off.',
      care:
        'The frame is heavy-duty aluminium with a pop-up hex design, so it stands square for a multi-day show and travels between events in a wheeled bag. Because the top and walls are dye-sublimated into 600D polyester, the print holds the same brand colours as your indoor graphics and will not crack, peel or fade under sun across a show season. Between shows, spot-clean any marks with mild soap and water and let the fabric dry fully before it goes back in the bag. Outdoors on pavement, anchor every leg with weights — an exhibitor tent catches wind like a sail.'
    }
  },
  {
    slug: 'sports-team-tents',
    title: 'Sports & Tailgate Tents',
    blurb: 'Team colours, shade for the bench, and something findable in a crowded lot.',
    guide: {
      metaDescription:
        'Custom printed sports and tailgate canopy tents — team colours and logo, sideline shade, crowd visibility, and a portable frame for weekly games.',
      intro:
        'Team tents pull double duty: shade for the bench and gear on the sideline, and a landmark supporters can find in a packed tailgate lot. Printed in your team colours with the logo up top, it marks your spot from a distance and travels game to game without fuss.',
      focus: [
        'Team colours and logo on the top and valance for visibility across the field or lot.',
        'Shade over the bench, gear and water on hot game days.',
        'A portable frame that packs into a wheeled bag for weekly travel.',
        'Add weights so it stays put in an open, exposed lot.'
      ],
      sizing:
        'A 10×10 suits a single team bench or tailgate spot; a 10×15 or 10×20 covers a larger squad, spectators or a hospitality area.',
      walls:
        'Sports setups usually stay open for airflow and access. Add a single back wall in team colours as a backdrop, or half walls to block low sun and wind.',
      care:
        'The aluminium pop-up frame goes up and comes down fast so a couple of parents or players can handle it before and after a game, and it packs into a wheeled bag for the trip home. Team colours and the logo are dye-sublimated into 600D polyester, so they take repeated sun and travel without cracking, peeling or fading through the season. Wipe down mud or drink spills with mild soap and water and let it dry before packing so it does not sit damp. In an open field or tailgate lot, always weight or stake each leg — exposed ground is where tents blow over.'
    }
  },
  {
    slug: 'food-truck-tents',
    title: 'Food Truck & Concession Tents',
    blurb: 'Menu on the valance, shade over the queue.',
    guide: {
      metaDescription:
        'Custom printed food and concession canopy tents — menu and pricing on the printed valance, shade over the queue and seating, and an open layout for a service window.',
      intro:
        'For food and concession, the tent works your line for you. Print your menu and pricing on the valance so the queue reads it while they wait, keep customers and staff out of the sun, and leave the front open as a service window. It also sets up and breaks down fast between events.',
      focus: [
        'Menu and pricing printed on the valance, visible to the whole queue.',
        'Shade over the service window, prep space and any seating.',
        'An open front for service, with a back wall to hide prep and stock.',
        'Wipeable printed fabric and a quick setup between events.'
      ],
      sizing:
        'A 10×10 covers a single service point; a 10×15 or 10×20 adds room for prep, a second server or a covered queue and seating.',
      walls:
        'A back wall keeps prep and supplies out of sight; add one side wall for wind while the service front stays open.',
      care:
        'The pop-up aluminium frame sets up and breaks down quickly between events, which matters when you are working a run of markets and festivals, and it packs into a wheeled bag. The valance and walls are dye-sublimated into 600D polyester, so a printed menu stays sharp and colour-true and will not crack, peel or fade over a busy season. The fabric wipes down: clean grease or food splashes with mild soap and water and let it dry fully before packing so it does not develop odour or mildew. Anchor every leg with weights outdoors so the tent stays put over a hot service line.'
    }
  },
  {
    slug: 'church-school-tents',
    title: 'Church & School Tents',
    blurb: 'Registration desks, fundraisers and open days.',
    guide: {
      metaDescription:
        'Custom printed church and school canopy tents — a branded landmark for registration, fundraisers and open days, with shade and easy setup for volunteers.',
      intro:
        'Churches and schools need a friendly, findable landmark for the events that fill the calendar — registration and welcome desks, fundraisers, sports days and open days. A tent printed with the organisation name gives volunteers an obvious base and shade to work under, and it reappears at every event through the year.',
      focus: [
        'Organisation name and logo printed on the top and valance as a welcome point.',
        'Shade for volunteers, registration desks and hand-out tables.',
        'Simple setup a rotating group of volunteers can manage.',
        'One durable tent that reuses across many events per year.'
      ],
      sizing:
        'A 10×10 works for a welcome or registration desk; a 10×15 or 10×20 suits fundraisers, bake sales or multi-table setups.',
      walls:
        'Add a back wall for a backdrop and shade, and half side walls to block wind at outdoor open days — front open so people can walk up.',
      care:
        'The aluminium pop-up frame is designed for a rotating group of volunteers — it opens accordion-style in a few minutes with no tools and packs into a wheeled bag for storage between events. The organisation name and logo are dye-sublimated into 600D polyester, so one tent looks the same at every fundraiser and open day through the year without cracking, peeling or fading. Spot-clean with mild soap and water and let the fabric dry fully before it goes back in the bag so it stores clean. At outdoor events, weight or stake each leg so it stays safe around families and children.'
    }
  },
  {
    slug: 'job-site-tents',
    title: 'Job Site & Safety Tents',
    blurb: 'Shade and a visible company mark on active sites.',
    guide: {
      metaDescription:
        'Custom printed job site and safety canopy tents — shade for breaks and briefings, a visible company mark on active sites, and weights or stakes for exposed ground.',
      intro:
        'On an active site a printed tent marks your crew\'s area, shades breaks, briefings and a first-aid or sign-in point, and carries the company name where clients and the public can see it. It needs to stand up to sun and wind day after day and anchor securely on open ground.',
      focus: [
        'Company name and logo printed on the top and valance, visible across the site.',
        'Shade for breaks, toolbox talks, sign-in and first-aid points.',
        'A sturdy frame for repeated daily setup on rough ground.',
        'Weights or stakes to hold it in exposed, windy conditions.'
      ],
      sizing:
        'A 10×10 covers a sign-in or break point; a 10×15 or 10×20 shades a larger crew, a briefing area or equipment.',
      walls:
        'Add a back and side wall for wind and sun protection; keep the working front open for access. Always anchor with weights or stakes on site.',
      care:
        'The frame is heavy-duty aluminium built for daily setup and teardown on rough ground, and it folds into a wheeled bag to move between sites. The company name and logo are dye-sublimated into 600D polyester, so the branding survives sun, dust and repeated handling without cracking, peeling or fading. Hose off or wipe down site dirt with mild soap and water and let it dry fully before packing so it does not sit damp in the bag. On exposed or windy ground, always anchor every leg with weights or stakes — on an active site an unsecured tent is a hazard.'
    }
  }
];

export const getSize = (slug) => SIZES.find((s) => s.slug === slug) || null;
export const getSolution = (slug) => SOLUTIONS.find((s) => s.slug === slug) || null;

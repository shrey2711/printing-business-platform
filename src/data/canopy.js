// Size-guide data for /sizes/:slug. Shared by the React route and
// scripts/prerender.mjs so the crawlable HTML and the hydrated app can never
// drift apart. Use-case pages live in src/data/solutions.js. Plain ESM, no
// React imports — the prerender script imports this file directly.

// Only the three sizes we sell. Each /sizes/:slug page is an INFORMATIONAL size
// guide (dimensions, layout, capacity, uses) that targets research intent and
// links out to its matching commercial product page. Keeping the two apart
// avoids the two URLs competing for the same "10x10 custom canopy tent" query.
export const SIZES = [
  {
    slug: '10x10',
    label: "10' × 10'",
    product: 'canopy-tent-10x10',
    blurb: 'The standard vendor booth, and the size most event organizers allocate by default.',
    guide: {
      title: '10x10 Canopy Tent Size Guide',
      metaDescription:
        '10x10 canopy tent size guide — 100 sq ft footprint, how many tables and people it fits, booth layout ideas, and how it compares to a 10x15 or 10x20.',
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
    blurb: 'The middle footprint: a 15-foot front when one square is tight and a double pitch was not assigned.',
    guide: {
      title: '10x15 Canopy Tent Size Guide',
      metaDescription:
        '10x15 canopy tent size guide — 150 sq ft, which booth spaces fit, height, six-leg ballast, frame and walls, and when to pick it over a 10x10 or 10x20.',
      lead:
        'This page is only about the 15-foot canopy: which marked pitches it can occupy, how the rectangle sits on the ground, what the weight planner counts for legs, and which jobs actually need the middle size. The 10×10 and 10×20 guides cover their own footprints.',
      footprint:
        '150 square feet. The rectangle is 15 feet across the front and 10 feet from the aisle to the back wall — half again the covered ground of a single 10×10 square, with the added strip in the width.',
      headings: {
        capacity: 'Staff and tables under a 15-foot front',
        layouts: 'Three ways to use the extra frontage',
        walls: 'Panels on a 15-foot opening',
        uses: 'Jobs that outgrow one square',
        compare: 'When the other two footprints are the better buy',
        shop: 'Order the 150-square-foot canopy'
      },
      wallIntro:
        'A printed panel on this frame is $365, whether it runs full height or stops near counter height, and you can combine up to three. That per-panel price matches the 20-foot frame and is higher than the $275 panel on a 10×10. Put a full panel on the 10-foot back and half panels on the flanks if you want the long side to stay the entrance. Three full panels close the back and both sides. Hook-and-loop is the attachment, so the panels can share one proof with the roof or be added to a standard frame later. The roof and the valance are separate print surfaces from the panels. Production is 6–8 business days after written proof approval, or 2–3 business days on the rush option, which adds 50% and does not shorten courier transit.',
      capacity: [
        'Three or four people can work at once without the elbow room collapsing the way it does in a single square once a second task appears.',
        'Two 6 ft tables sit across the opening with a gap a visitor can step through, or one table plus a demo station beside it.',
        'It is the footprint for a booth-and-a-half assignment, not for a double space and not for a default single square.'
      ],
      layouts: [
        'Two tables on the 15-foot side, gap in the center, stock kept along the 10-foot back.',
        'A service counter down one flank and open floor on the other for a line that should stand under the roof.',
        'Full back panel plus two half side panels so the wide front stays the way in.'
      ],
      uses: [
        'A market stall that outgrew one table and was not given two stalls',
        'Concession service where the queue should be under cover',
        'A team or club shelter that needs a bench and a gear pile',
        'A demo that wants the sample station beside the product'
      ],
      comparison:
        'Stay with a 10×10 when the contract is one square. Move to a 10×20 only when two adjacent spaces sit in a single 20 ft run and you want people walking the length of the tent. The 15-foot frame is the case in between: more opening than a single square, without taking a double pitch you were not assigned.',
      extraSections: [
        {
          h2: 'Which booth spaces a 15-foot front fits',
          paragraphs: [
            'Buy this canopy after the floor plan shows a front wider than one standard square and shorter than two. The product record calls the coverage a booth and a half: 150 square feet, depth held at 10 feet, width at 15. A queue, a tasting bar or a second table needs that opening. It does not need a deeper back room, which this shape does not give you.',
            'Organizers who mark space in 10-foot steps sometimes allow a 15-foot front and sometimes refuse it. Ask before the graphic is approved. A frame that crosses the chalk line is a worse day than a 10×10 that sits inside the marks. The 200-square-foot frame is the one for two adjacent spaces in one continuous 20-foot run. A packet that only names a single square points at the smaller guide. A packet that names a double points at the wider one.'
          ]
        },
        {
          h2: 'Footprint and height',
          paragraphs: [
            'Draw the ground as 15 feet along the aisle and 10 feet back from it. People, tables and stock stay inside that rectangle, and so should the valance and any panels. The frame spec on the product is a heavy-duty aluminum hex frame with telescopic legs, the same wording used for the other two sizes. Telescopic means you set the leg length when the tent goes up. This page does not publish a clearance figure under the valance. The roughly 6.5–7 ft number is written on the [[/sizes/10x10|10×10 size guide]] for that footprint, and it should not be treated as a measurement taken on this wider frame. If a banner, a flag or an indoor ceiling has to clear the roof, measure the set after it is standing.',
            'Six-foot tables are the usual show rental. Two of them on a 15-foot opening leave a walk-through gap. That is a different plan from running tables down a 20-foot side. Visitors pass the front of this tent. They do not travel its length the way they can when the long side is 20 feet and the layout is an aisle.'
          ]
        },
        {
          h2: 'Weight and ballast for this footprint',
          paragraphs: [
            'The tent-weight planner counts six legs on a 10×15 and six on a 10×20, against four on a 10×10. A ballast plan copied from a single square therefore comes up short. The sandbag add-on on the canopy configurator is four pieces at $50. Its help text says one per leg, and it does not publish a weight in pounds. Four bags do not land on six legs. Count the legs on the frame you unpack, then put an accepted weight on each one at the event’s per-leg number.',
            'The 2025–2026 rules collected on the tent-weight guide cluster in bands: farmers markets often near 24–25 lb per leg, craft shows and festivals often at 40 lb, juried art fairs often at 45–60 lb. Those are organizer requirements, not a wind rating for this frame, and the site does not publish a miles-per-hour figure. Pavement, convention lots and closed streets usually ban stakes. The warranty excludes wind, storm and weather damage and says to weight the tent or take it down. One cited Denver festival recommends 40 lb per corner on a 10×10 and double that on a 10×20. It does not give a 10×15 number, so this page will not invent one by averaging. Read the packet for your event.',
            'Full-height panels add sail. Plan more hold-down than a roof alone, and be ready to drop the panels if gusts rise. Fasten weights to the leg and keep them low so they are not a trip hazard. The [[/resources/tent-weight-rules|tent-weight guide]] is the cited list of what organizers actually published, including which homemade weights some shows reject. Wind, storm and weather damage sit outside the [[/warranty|limited warranty]].'
          ]
        },
        {
          h2: 'Frame and wall options on the 15-foot size',
          paragraphs: [
            'The extra five feet of frontage do not change the hardware grade. The complete set is the aluminum hex frame, telescopic legs, a printed 600D top and a carry bag. The printed top alone is the path when a compatible frame is already yours; that option does not include the bag. Dye sublimation, full bleed, is the print method on this top, the same method named for the other sizes. The complete set is $1,375 for one or two units and $1,250 each at three or more. The top alone is $545, and $540 at three or more.',
            'See the [[/blog/custom-canopy-tent-buying-guide|canopy buying guide]] if you are still comparing frame, fabric, walls and the full budget across all three sizes. This page assumes you are checking whether 15 feet of front is the pitch you were given.'
          ]
        },
        {
          h2: 'Use cases that need the middle size',
          paragraphs: [
            'Pick this footprint when the work happens across the front. A market vendor who outgrew one table and was not assigned two stalls. A concession whose line should stand under the roof instead of in the aisle. A club or team shelter that needs a bench plus a gear pile without taking a double pitch. A product demo that wants the sample station beside the display rather than stacked behind it. Those situations match the applications on the product record.',
            'Leave it when the contract is a single 10×10 square, and leave it when you have paid for a 10×20 double and want people walking through. A Chicago street festival or the hardstanding outside McCormick Place is a frequent place the question comes up: summer layouts are tight, and wind off the lake punishes a light hold-down. [[/custom-canopy-tents-chicago|Custom canopy tents in Chicago]] is the local buying page for that city. It does not change the frame or the rate card, and there is no counter there to collect from.'
          ]
        }
      ],
      faqHeading: 'Questions about the 10×15',
      faqs: [
        {
          q: 'Will a show that sells 10×10 squares let me set up 15 feet wide?',
          a: 'Only if the packet or the organizer says the pitch is wider than one square. This frame covers 150 square feet, a booth and a half. Confirm the marks before you approve artwork.'
        },
        {
          q: 'How is the shape different from a 10×10?',
          a: 'Depth stays 10 feet. Width grows by five. The product page describes that extra strip as frontage for a queue or a second table, not as a deeper storage bay.'
        },
        {
          q: 'Do I need more ballast than on a 10×10?',
          a: 'The weight planner lists six legs on this size and four on a 10×10, so the same per-leg rule adds up to more total weight. The $50 sandbag add-on is four pieces and does not state a pound rating, so it does not by itself satisfy a six-leg rule or a “40 lb” line in a packet.'
        },
        {
          q: 'Is the frame a lighter grade than the 10×20?',
          a: 'No. The published spec is the same heavy-duty aluminum hex frame, telescopic legs and dye-sublimated 600D top. Footprint, set price and the $365 wall price are what change.'
        },
        {
          q: 'How long does a 10×15 take, and is delivery included?',
          a: 'Production is 6–8 business days after you approve the proof in writing, or 2–3 business days on rush, which adds 50% and does not speed the courier. Shipping is priced from destination, size and weight and is not in the product price. Orders ship to a business, venue or hotel in the US or Canada. There is no pickup counter.'
        }
      ],
      closing:
        'When the pitch is confirmed, open the [[/products/canopy-tent-10x15|10×15 canopy]] and the price updates as you add panels, the four-piece sandbag set and rush production. [[/shipping|Shipping]] is calculated at checkout from the destination, the size and the weight.'
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

// Use-case pages live in src/data/solutions.js so this module stays the size
// guides. SolutionPage and the prerender import SOLUTIONS from there.

export const getSize = (slug) => SIZES.find((s) => s.slug === slug) || null;

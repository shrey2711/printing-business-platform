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

// Use-case pages live in src/data/solutions.js so this module stays the size
// guides. SolutionPage and the prerender import SOLUTIONS from there.

export const getSize = (slug) => SIZES.find((s) => s.slug === slug) || null;

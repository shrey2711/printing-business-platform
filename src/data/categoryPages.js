// Indexable category / collection landing pages. Shared by the React CategoryPage
// route and scripts/prerender.mjs so the crawlable HTML and the app match.
//
// Intent split (avoids cannibalising existing URLs):
//   /trade-show-displays  — the topic HUB ("trade show displays"), links to the
//                           subcategories below + curated products.
//   /custom-canopies      — canopy CATEGORY (distinct from /products/canopy-tent-*
//                           products and /sizes/* informational guides).
//   /banner-stands, /backdrops, /table-covers — one per real category.
//   /products stays the flat "all products" catalog.
//
// `title` is brand-free — useDocumentMeta and the prerenderer both append
// " | Apex Trade Show". No fabricated prices/ratings/claims.

export const CATEGORY_PAGES = [
  {
    slug: 'trade-show-displays',
    hub: true,
    category: null,
    nav: 'Trade Show Displays',
    h1: 'Trade Show Displays & Event Branding',
    title: 'Trade Show Displays & Event Branding',
    description:
      'Shop the complete trade show booth — canopy tents, banner stands, backdrops, table covers and flags, printed in your brand. Instant pricing, free proof.',
    intro:
      'Apex supplies every branded piece of a professional trade show booth from one place — canopy tents, banner stands, backdrops, table covers, flags and accessories, all printed in your brand so the whole booth matches. Canopy tents, banner stands, backdrops, table covers and flags are priced instantly online; larger custom displays (SEG modular kits, tension fabric and pop-up) are quoted per order.',
    points: [
      'Custom canopy tents with instant online pricing and up to 3 printed walls.',
      'Retractable and X-stand banner stands for aisles, lobbies and counters.',
      'Step & repeat backdrops for event and press photography.',
      'Pleated and stretch table covers, closed back.',
      'Weights, sandbags, flags and hardware to finish the booth.'
    ],
    answer:
      'Apex prints every piece of a trade show booth from one supplier — canopy tents, banner stands, step & repeat backdrops, table covers and flags — in your brand, with instant online pricing on most items and a free artwork proof before anything prints.',
    compareCols: ['Best for', 'Pricing'],
    compare: [
      { name: 'Canopy Tents', to: '/custom-canopies', cells: ['Outdoor & expo booths', 'Instant online'] },
      { name: 'Banner Stands', to: '/banner-stands', cells: ['Aisles, lobbies, counters', 'Instant online'] },
      { name: 'Backdrops', to: '/backdrops', cells: ['Photo & booth walls', 'Instant online'] },
      { name: 'Table Covers', to: '/table-covers', cells: ['Branded tables', 'Instant online'] },
      { name: 'Banners', to: '/banners', cells: ['Any-size signage', 'Instant online'] },
      { name: 'SEG & Tension Displays', to: '/seg-displays', cells: ['Large modular booths', 'Quote'] }
    ],
    faqs: [
      { q: 'What displays make a complete trade show booth?', a: 'A typical booth combines a printed backdrop or canopy, a table cover, and one or two banner stands, plus flags or accessories. Ordering them together from one supplier keeps every piece on-brand and color-matched.' },
      { q: 'Which products have instant pricing?', a: 'Canopy tents, banner stands, banners, table covers, backdrops and flags are priced instantly online. Larger custom displays — SEG modular kits, tension fabric and pop-up displays — are quoted per order.' },
      { q: 'How long does production take?', a: 'Standard production is 6–8 business days after you approve your free proof, with a 2–3 day rush on most instant-priced products. Shipping and transit time is added on top and depends on your address.' }
    ]
  },
  {
    slug: 'custom-canopies',
    category: 'tents',
    nav: 'Custom Canopies',
    h1: 'Custom Canopy Tents',
    title: 'Custom Canopy Tents — 10x10, 10x15 & 10x20',
    description:
      'Custom printed pop-up canopy tents in 10x10, 10x15 and 10x20 with up to 3 printed walls. Instant online pricing, free artwork proof, US & Canada.',
    intro:
      'Custom printed pop-up canopy tents — the branded roof over your booth. Choose 10x10, 10x15 or 10x20, add full or half printed walls, and see the price update live. Dye sublimation bonds the ink into 600D polyester over a heavy-duty aluminum hex frame, so colors will not crack, peel or fade.',
    points: [
      'Three sizes: 10x10, 10x15 and 10x20.',
      'Up to 3 printed walls, full or half height.',
      'Instant online pricing — no quote form.',
      'Free artwork proof before production.'
    ],
    answer:
      'Custom canopy tents are the branded roof of an outdoor or expo booth. Apex prints 10×10, 10×15 and 10×20 pop-ups in full color over an aluminum hex frame, with up to three printed walls, instant online pricing and a free proof before anything prints.',
    compareCols: ['Footprint', 'Best for', 'From'],
    compare: [
      { slug: 'canopy-tent-10x10', name: "10' × 10' Canopy", to: '/products/canopy-tent-10x10', cells: ['100 sq ft — single booth', 'Markets, a single expo space'] },
      { slug: 'canopy-tent-10x15', name: "10' × 15' Canopy", to: '/products/canopy-tent-10x15', cells: ['150 sq ft — 1.5 booths', 'More product or a wider front'] },
      { slug: 'canopy-tent-10x20', name: "10' × 20' Canopy", to: '/products/canopy-tent-10x20', cells: ['200 sq ft — double booth', 'Double-booth or walk-through'] }
    ],
    faqs: [
      { q: 'Which canopy size should I choose?', a: 'A 10×10 covers a single booth or market stall; a 10×15 adds room for more product or a wider front; a 10×20 fills a double-booth space. All three use the same aluminum hex frame and dye-sublimated printing.' },
      { q: 'What does the starting price include?', a: 'The "from" price is the printed canopy top only. The complete set — printed top, aluminum frame and carry bag — is priced separately on each product page, and any printed walls you add update the price live.' },
      { q: 'How many walls can I add?', a: 'Up to three printed walls total, in any mix of full and half height, so you can enclose the back and sides while leaving the front open to visitors.' },
      { q: 'Will the print fade outdoors?', a: 'No — the graphics are dye-sublimated into 600D polyester, bonding the ink into the fabric so colors resist UV and will not crack, peel or fade with repeated outdoor use.' }
    ],
    guideLinks: [
      { label: '10x10 size guide', to: '/sizes/10x10' },
      { label: '10x15 size guide', to: '/sizes/10x15' },
      { label: '10x20 size guide', to: '/sizes/10x20' }
    ]
  },
  {
    slug: 'banner-stands',
    category: 'banner-stands',
    nav: 'Banner Stands',
    h1: 'Retractable & X-Stand Banner Stands',
    title: 'Retractable & X-Stand Banner Stands',
    description:
      'Custom printed banner stands — standard & deluxe retractable, X-stand and tabletop — for trade shows, lobbies and counters. Instant online pricing, free proof.',
    intro:
      'Portable printed banner stands for aisles, entrances, counters and events. Retractable stands roll the graphic into the base for travel; the X-stand uses a lightweight X-frame; the tabletop version sits on a counter. All use a replaceable printed graphic.',
    points: [
      'Standard and Deluxe retractable banner stands (33" × 81").',
      'X-Stand banner (24" × 63") — lightweight X-frame.',
      'Table Top banner (11.5" × 17.5") for counters and desks.',
      'Replaceable graphics; quick tool-free setup.'
    ],
    answer:
      'Banner stands are portable printed displays for aisles, entrances and counters. Apex offers standard and deluxe retractable stands, a lightweight X-stand, and a tabletop stand — each with a replaceable graphic, tool-free setup and instant online pricing.',
    compareCols: ['Graphic size', 'Best for', 'From'],
    compare: [
      { slug: 'standard-retractable-banner', name: 'Standard Retractable', to: '/products/standard-retractable-banner', cells: ['33" or 47" × 81"', 'Everyday trade-show aisle display'] },
      { slug: 'deluxe-retractable-banner', name: 'Deluxe Retractable', to: '/products/deluxe-retractable-banner', cells: ['33" × 81"', 'A premium look, chrome end caps'] },
      { slug: 'x-stand-banner', name: 'X-Stand Banner', to: '/products/x-stand-banner', cells: ['24" × 63"', 'Low-cost, lightweight signage'] },
      { slug: 'table-top-banner-stand', name: 'Table Top Banner', to: '/products/table-top-banner-stand', cells: ['11.5" × 17.5"', 'Counters, desks and reception'] }
    ],
    faqs: [
      { q: 'Standard or Deluxe retractable — what’s the difference?', a: 'Both are 33×81 in retractable stands with a replaceable graphic. The Deluxe adds chrome-style end caps and a more polished base for a premium look; the Standard is the value everyday choice and also comes in a wider 47 in size.' },
      { q: 'X-stand or retractable?', a: 'An X-stand uses a lightweight X-frame and is the most economical, packable option; a retractable rolls the graphic into a weighted base for a sturdier, more professional aisle display. Retractables suit repeat use; X-stands suit low cost and quick swaps.' },
      { q: 'Can I reprint just the graphic?', a: 'Yes — every stand uses a replaceable printed graphic, so you can reuse the hardware and order a new banner when your message or branding changes.' }
    ]
  },
  {
    slug: 'banners',
    category: 'banners',
    nav: 'Banners',
    h1: 'Custom Vinyl, Mesh & Fabric Banners',
    title: 'Custom Banners — Vinyl, Mesh & Fabric',
    description:
      'Made-to-size 13oz vinyl, 18oz blockout, mesh and 9oz fabric banners — enter width and height for instant per-square-foot pricing. Hem and grommets included.',
    intro:
      'Full-color banners printed to any size you enter, priced by the square foot. Choose economical 13oz scrim vinyl, opaque 18oz blockout for double-sided prints, wind-friendly perforated mesh, or premium wrinkle-free fabric — each finished ready to hang.',
    points: [
      '13oz vinyl — the economical indoor/outdoor workhorse.',
      '18oz blockout — opaque core for true double-sided banners.',
      'Mesh — perforated for reduced wind load on fences & wraps.',
      '9oz fabric — dye-sublimated, no-glare matte finish.'
    ],
    answer:
      'Custom banners print to any size by the square foot. Apex offers 13oz scrim vinyl for everyday indoor/outdoor use, 18oz blockout for true double-sided prints, perforated mesh for windy spots, and 9oz wrinkle-free fabric for a premium matte look — each finished ready to hang.',
    compareCols: ['Material', 'Indoor / outdoor', 'From'],
    compare: [
      { slug: '13oz-vinyl-banner', name: '13oz Vinyl', to: '/products/13oz-vinyl-banner', cells: ['13oz scrim vinyl', 'Both — the workhorse'] },
      { slug: '18oz-blockout-banner', name: '18oz Blockout', to: '/products/18oz-blockout-banner', cells: ['18oz opaque-core vinyl', 'Both — double-sided ready'] },
      { slug: 'mesh-banner', name: 'Mesh', to: '/products/mesh-banner', cells: ['Perforated mesh vinyl', 'Outdoor — fences & wind'] },
      { slug: 'fabric-banner-9oz-wrinkle-free', name: '9oz Fabric', to: '/products/fabric-banner-9oz-wrinkle-free', cells: ['9oz wrinkle-free polyester', 'Indoor — premium matte'] }
    ],
    faqs: [
      { q: 'How is banner pricing calculated?', a: 'Banners are priced by the square foot — enter your width and height and the price updates live, with a minimum charge per banner. A welded hem and grommets are included on the vinyl and mesh options.' },
      { q: 'Which banner is best for double-sided?', a: 'The 18oz blockout banner has an opaque gray core that stops light and the back image from bleeding through, so two different prints stay crisp — the right pick for any true double-sided banner.' },
      { q: 'Which banner handles wind best?', a: 'Mesh. Its perforations let roughly 30% of the wind pass through, cutting the load that makes solid banners flap and tear — ideal for fences, scaffolding and building wraps.' }
    ]
  },
  {
    slug: 'table-covers',
    category: 'table-covers',
    nav: 'Table Covers',
    h1: 'Custom Table Covers',
    title: 'Custom Table Covers — Pleated & Stretch',
    description:
      'Custom printed table covers — pleated throws and fitted stretch covers, closed back, for trade show tables and counters. Instant online pricing, free proof.',
    intro:
      'Custom printed table covers that turn a plain table into a branded surface. Choose a pleated throw that drapes with rounded corners, or a fitted stretch cover for a tight, modern look — both closed-back (4-sided) and printed in full color.',
    points: [
      'Pleated throws in 4, 6 and 8 ft.',
      'Fitted stretch covers in 6 and 8 ft.',
      'Closed back — covers all four sides.',
      'Wrinkle-resistant, machine washable.'
    ],
    answer:
      'Custom table covers turn a plain trade-show table into branded space. Apex prints pleated throws that drape with rounded corners and fitted stretch covers for a tight modern look — both closed-back on all four sides, full-color, wrinkle-resistant and machine washable.',
    compareCols: ['Fit', 'Sizes', 'From'],
    compare: [
      { slug: 'pleated-table-covers', name: 'Pleated Table Cover', to: '/products/pleated-table-covers', cells: ['Draped throw, rounded corners', '4, 6 and 8 ft'] },
      { slug: 'stretch-table-covers', name: 'Stretch Table Cover', to: '/products/stretch-table-covers', cells: ['Fitted, tight modern look', '6 and 8 ft'] }
    ],
    faqs: [
      { q: 'Pleated or stretch — which should I choose?', a: 'A pleated cover is a classic draped throw with rounded corners and a relaxed look; a stretch cover is a fitted, wrinkle-free skin for a sleek modern booth. Both are closed-back (all four sides) and printed full-color.' },
      { q: 'Do the covers fit standard tables?', a: 'Yes — pleated covers come in 4, 6 and 8 ft and stretch covers in 6 and 8 ft to fit standard folding trade-show tables. Each product page shows the exact fit.' },
      { q: 'Are they washable?', a: 'Yes — the dye-sublimated polyester is wrinkle-resistant and machine washable, so a cover reuses show after show.' }
    ]
  },
  {
    slug: 'backdrops',
    category: 'backdrops',
    nav: 'Backdrops',
    h1: 'Step & Repeat Backdrops',
    title: 'Step & Repeat Backdrops',
    description:
      'Custom step & repeat backdrops — large-format fabric media walls with repeating logo branding on a portable adjustable frame. Instant online pricing, free proof.',
    intro:
      'Step & repeat backdrops are the branded media wall behind press, red-carpet and event photos. Print repeating logos across a large-format fabric on an adjustable, portable frame so your branding reads in every shot.',
    points: [
      'Large-format fabric on an adjustable frame.',
      'Repeating logo / step & repeat layout.',
      'Portable — packs down for transport.',
      'Replaceable graphic.'
    ],
    answer:
      'Backdrops are the branded wall behind your booth or photos. Apex prints step & repeat media walls with repeating logos for press and event photography, and straight tension-fabric display walls with a smooth, frameless pillowcase graphic — both on portable frames, printed to order.',
    compareCols: ['Type', 'Best for', 'From'],
    compare: [
      { slug: 'step-and-repeat-backdrop', name: 'Step & Repeat Backdrop', to: '/products/step-and-repeat-backdrop', cells: ['Repeating-logo media wall', 'Press & red-carpet photos'] },
      { slug: 'straight-tension-fabric-display', name: 'Straight Tension Fabric Display', to: '/products/straight-tension-fabric-display', cells: ['Frameless pillowcase wall', 'A clean booth backwall'] }
    ],
    faqs: [
      { q: 'Step & repeat or tension fabric?', a: 'A step & repeat backdrop repeats your logo across the wall for branded photos and press; a straight tension-fabric display is a smooth, seamless single graphic that zips over an aluminum frame for a clean booth backwall. Both are portable and reprintable.' },
      { q: 'How big is the step & repeat backdrop?', a: 'The standard media wall is 10 ft × 8 ft (120" × 96"). Ask about other sizes when you request a quote for a non-standard wall.' },
      { q: 'Can I replace the graphic later?', a: 'Yes — both backdrops use a replaceable printed graphic, so you can reuse the frame and reprint when your branding or sponsors change.' }
    ]
  }
];

export const getCategoryPage = (slug) => CATEGORY_PAGES.find((c) => c.slug === slug) || null;
// Subcategory tiles for the hub (everything except the hub itself).
export const SUBCATEGORIES = CATEGORY_PAGES.filter((c) => !c.hub);

// Map a product's `category` id (tents, banner-stands, backdrops, table-covers)
// to its category landing page, so product pages breadcrumb + link UP to their
// category instead of the flat /products list (Home > Category > Product).
export const CATEGORY_BY_PRODUCT = Object.fromEntries(
  CATEGORY_PAGES.filter((c) => c.category).map((c) => [c.category, c])
);
export const getCategoryForProduct = (categoryId) => CATEGORY_BY_PRODUCT[categoryId] || null;

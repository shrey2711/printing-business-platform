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
    guide: [
      { h2: 'Building a booth from one supplier', p: 'A booth is rarely one product. The usual combination is a backdrop or fabric wall for the back of the space, one or two retractable banner stands at the aisle, a printed table cover on the demo or registration table, and a canopy if any part of the event happens outdoors. Ordering the set from one place is not just convenience: it is the only reliable way to get the same brand colour across fabric, vinyl and polyester, which are printed by different processes.' },
      { h2: 'What to buy first on a limited budget', p: 'If you can only buy one piece, buy the thing at eye level in the aisle — a retractable banner stand. It is the cheapest item that still stops someone walking past. Second is a table cover, because almost every booth has a rented table and a bare one undoes the rest. A full backdrop comes third: it makes the biggest visual difference but only once the first two are working. Canopies matter only if you exhibit outdoors.' },
      { h2: 'Reusing a booth across shows', p: 'Every display here uses a replaceable graphic on a reusable frame, which is what separates a booth kit from a per-show expense. Frames, bases and canopy hardware carry across years; graphics get reprinted when the message changes. Production runs 6-8 business days after proof approval with a 2-3 day rush available, and transit is added on top by destination — so plan a reprint as weeks, not days.' }
    ],
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
    ,
      { q: 'What do I actually need for a 10x10 booth?', a: 'A backdrop or fabric wall for the back, one or two retractable banner stands at the aisle, and a printed table cover. Add a canopy only if part of the event is outdoors. Bought together, the pieces match in colour across different print processes.' },
      { q: 'What should I buy first if the budget is tight?', a: 'A retractable banner stand — it is the cheapest item that still stops someone in the aisle. A table cover second, because nearly every booth has a rented table. A full backdrop third.' },
      { q: 'How long does a full booth kit take to produce?', a: 'Production runs 6-8 business days after you approve the proof, with a 2-3 business day rush available on most instant-priced products. Transit is added on top and depends on the delivery address.' }
    ]
  },
  {
    slug: 'custom-canopies',
    guide: [
      { h2: 'Which canopy size fits your space?', p: 'Canopies come in 10x10, 10x15 and 10x20. A 10x10 is the standard single booth or market pitch and the one most events sell by default. A 10x15 buys shade for a longer table or a queue. A 10x20 covers a double booth or lets you run product one end and seating the other. All three use the same heavy-duty aluminium hex frame and 600D polyester top, so the choice is footprint, not quality.' },
      { h2: 'Printed walls change what the canopy does', p: 'You can add up to three printed walls in any mix of full and half height. A canopy with no walls is shade; add a back wall and it becomes a booth with a branded backdrop; add half walls at the sides and you have a counter line that still lets people walk in from the front. Full walls on three sides close the space for storage or weather. Decide the layout before you print — the walls are ordered with the top.' },
      { h2: 'Weighting is not optional outdoors', p: 'Most outdoor sites are pavement or hardstanding, where a stake cannot be driven, and an unweighted canopy is the single most common failure at an outdoor event. Put a weight on every leg, every time. Dye sublimation bonds the ink into the fabric so the print itself resists sun and repeated packing, but no print survives the frame going over in a gust.' }
    ],
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
    ,
      { q: 'What canopy size should I order?', a: '10x10 for a standard single booth or market pitch, 10x15 for a longer table or queue, 10x20 for a double booth. All three share the same aluminium hex frame and 600D polyester top, so size is about footprint rather than build quality.' },
      { q: 'How many printed walls can I add?', a: 'Up to three, in any mix of full and half height. A back wall turns the canopy into a booth; half walls at the sides give you a counter line while keeping the front open.' },
      { q: 'Do I need weights if I am only outdoors for a few hours?', a: 'Yes. Most outdoor sites are paved so a stake cannot be used, and an unweighted canopy going over in a gust is the most common outdoor failure there is. Weight every leg, regardless of how long you are there.' }
    ],
    guideLinks: [
      { label: '10x10 size guide', to: '/sizes/10x10' },
      { label: '10x15 size guide', to: '/sizes/10x15' },
      { label: '10x20 size guide', to: '/sizes/10x20' }
    ]
  },
  {
    slug: 'banner-stands',
    guide: [
      { h2: 'Retractable, X-stand or tabletop?', p: 'Three formats, three jobs. A retractable banner stand rolls its graphic into a weighted aluminium base — 33" x 81" or 47" x 81" on the standard, 33" x 81" on the deluxe with a heavier base and chrome-style end caps — and it is the workhorse for aisle-facing messaging. An X-stand is a collapsible lightweight frame at 24" x 63" or 32" x 71", cheaper and lighter, ideal when you need several around a venue. A tabletop stand at 11.5" x 17.5" brands a counter or registration desk without using floor space.' },
      { h2: 'Standard or deluxe retractable?', p: 'The difference is the base and the pole, not the print. The standard has a compact aluminium base with two stabilising feet, which is fine on carpet and in low-traffic aisles. The deluxe has a heavier base with an adjustable support pole, so it stands more solidly in a busy hall and survives being knocked. If the stand lives in one booth a few times a year, standard is enough; if it travels weekly, the deluxe base pays for itself.' },
      { h2: 'Graphics are replaceable', p: 'Every stand here takes a replaceable printed graphic, so the hardware is the durable purchase and the message is the consumable. That is the practical case for buying a stand rather than a disposable print: a new campaign, a new product or a rebrand means ordering a graphic, not another base. All set up tool-free in seconds, and all pack into a slim case that checks as luggage.' }
    ],
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
    ,
      { q: 'What size is a retractable banner stand?', a: 'The standard retractable prints at 33" x 81" or 47" x 81"; the deluxe at 33" x 81" on a heavier base. X-stands are 24" x 63" or 32" x 71", and the tabletop stand is 11.5" x 17.5".' },
      { q: 'What is the difference between the standard and deluxe retractable?', a: 'The base and pole, not the print. The standard uses a compact aluminium base with two stabilising feet; the deluxe uses a heavier base with an adjustable support pole, which stands up better to a busy hall and frequent travel.' },
      { q: 'Can I change the graphic without buying a new stand?', a: 'Yes — every stand takes a replaceable printed graphic, so the hardware carries across campaigns and only the printed banner is reordered.' }
    ]
  },
  {
    slug: 'banners',
    guide: [
      { h2: 'Which banner material should you choose?', p: 'Four materials cover almost every job. 13oz matte scrim vinyl is the default — indoor and outdoor rated with UV-stable ink, and the right pick for most storefront and event banners. 18oz blockout adds an opaque grey centre layer so two different prints never show through each other, which is what makes a true double-sided banner possible. Mesh is perforated to let roughly 30% of wind pass through, cutting the load that makes solid banners flap and tear on a fence. 9oz polyester fabric is dye-sublimated for a no-glare matte finish that photographs cleanly under lights.' },
      { h2: 'Sizing, hems and grommets', p: 'Vinyl banners print to any size you enter, up to 50 ft on one side; the fabric banner runs up to 8 ft on one side. Vinyl comes with a welded hem and grommets every 2 ft as standard, so it is ready to tie off out of the box. The fabric banner has sewn hemmed edges instead, which suits indoor hanging and travel. Price is by the square foot, so the configurator quotes the exact size rather than rounding you up to a stock format.' },
      { h2: 'Indoor, outdoor and wind', p: 'Outdoors, the failure point is almost never the print — it is the wind. A solid banner on an exposed fence acts like a sail, which is why mesh exists. For long outdoor runs choose 18oz for its weight or mesh for airflow, and tie off every grommet rather than just the corners. Indoors, where wind is irrelevant and lighting is the enemy, the dye-sublimated fabric banner avoids the glare that vinyl throws under spotlights.' }
    ],
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
    ,
      { q: 'What is the difference between 13oz and 18oz banner vinyl?', a: '13oz matte scrim is the everyday choice — indoor and outdoor rated with UV-stable ink. 18oz blockout is heavier and carries an opaque grey centre layer that stops light passing through, which is what makes a genuine double-sided banner possible without the two prints ghosting into each other.' },
      { q: 'Which banner should I use on a fence outdoors?', a: 'Mesh. It is perforated so roughly 30% of the wind passes through, which cuts the load that makes a solid banner flap and tear on an exposed fence. Tie off every grommet rather than just the corners.' },
      { q: 'How large can a banner be printed?', a: 'Vinyl banners print up to 50 ft on one side, at any size you enter — pricing is by the square foot, so you are not limited to stock sizes. The 9oz fabric banner runs up to 8 ft on one side.' }
    ]
  },
  {
    slug: 'table-covers',
    guide: [
      { h2: 'Pleated or stretch — which fits your table?', p: 'The two styles behave differently. A pleated throw drapes over the table with rounded corners for a traditional, formal look, and comes in 4 ft, 6 ft and 8 ft. A fitted stretch cover pulls tight to the table for a sharp modern face, and comes in 6 ft and 8 ft. Both are closed-back on all four sides, so whatever you store underneath stays out of sight from the aisle — which matters more than people expect at a busy show.' },
      { h2: 'Fabric and care', p: 'Pleated covers are wrinkle-resistant polyester; stretch covers are stretch polyester. Both are dye-sublimated, meaning the ink is bonded into the fibre rather than sitting on top, so the colour will not crack or peel and the cover can be washed between shows. That is what makes a table cover a multi-season purchase: it packs flat, travels in the show case, and comes out looking the same as it did the first time.' },
      { h2: 'Measure before you order', p: 'Table sizes at shows are quoted by length — a 6 ft or 8 ft rectangular table is the standard rental. Order the cover to match the table length, not the booth width. If you are not sure what the venue supplies, ask the show\'s exhibitor services before you print: a stretch cover sized for the wrong table will not fit at all, where a pleated throw is more forgiving.' }
    ],
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
    ,
      { q: 'What size table cover do I need?', a: 'Order to the table length, not the booth. Pleated throws come in 4 ft, 6 ft and 8 ft; fitted stretch covers in 6 ft and 8 ft. Trade show rentals are usually 6 ft or 8 ft rectangular tables — confirm with the show\'s exhibitor services before printing, because a stretch cover sized wrong will not fit.' },
      { q: 'Are table covers machine washable?', a: 'Yes. Both styles are dye-sublimated polyester, so the ink is bonded into the fibre and will not crack or peel in the wash. That is what lets one cover work across a full season of shows.' },
      { q: 'Do the covers cover all four sides?', a: 'Yes — both the pleated throw and the fitted stretch cover are closed-back on all four sides, so cases and stock stored under the table stay hidden from the aisle.' }
    ]
  },
  {
    slug: 'backdrops',
    guide: [
      { h2: 'Step & repeat or tension fabric?', p: 'They solve different problems. A step & repeat backdrop tiles your logo across the surface so every photo taken in front of it carries the brand — it is a media wall, sized 8\' x 8\' or 10\' x 8\' on an adjustable portable frame. A straight tension fabric display is a single seamless graphic over a lightweight aluminium tube frame, 8, 10 or 20 ft wide at roughly 8 ft tall, and it is the better choice as a booth back wall where you want one image rather than a repeating pattern.' },
      { h2: 'Designing a step & repeat that photographs well', p: 'The logo grid is the whole design. Too large and only two logos land in a cropped shot; too small and the brand disappears at distance. Stagger the rows so a person standing centre never blocks a whole column, and keep the pattern away from the extreme edges where the frame wraps. Both backdrop types use a replaceable printed graphic, so the frame is a one-time purchase and each campaign is a reprint.' },
      { h2: 'Setting up in a venue', p: 'Both frames are portable and assemble without tools, and both pack into a case that fits a car boot or a hotel service elevator. For press and red-carpet use, allow enough clear floor in front for a photographer to step back — a 10 ft wall needs roughly 8 to 10 ft of space to shoot properly. Check ceiling height too: at about 8 ft tall these clear most rooms but not every low-ceilinged hotel suite.' }
    ],
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
    ,
      { q: 'What size is a step & repeat backdrop?', a: '8\' x 8\' or 10\' x 8\', up to 120" x 96", on an adjustable portable frame. Allow 8 to 10 ft of clear floor in front of a 10 ft wall so a photographer can step back far enough to shoot it properly.' },
      { q: 'Should I choose a step & repeat or a tension fabric wall?', a: 'Choose step & repeat when the wall exists to be photographed — the tiled logo is what makes the brand survive a cropped shot. Choose a straight tension fabric display when it is your booth back wall and you want one seamless image rather than a repeating pattern.' },
      { q: 'Can I reprint the graphic later?', a: 'Yes. Both backdrop types use a replaceable printed graphic on a reusable frame, so a new campaign is a reprint rather than a new display.' }
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

// SEO landing pages for display product TYPES we quote per order (SEG, tension
// fabric, pop-up, flags). These are content-first pages — accurate, generic
// descriptions of each display type (industry knowledge, NOT invented Apex specs
// or prices) plus a request-a-quote CTA and internal links. When real specs and
// pricing are supplied, each can graduate into a configurable product.
//
// Shared by the React LandingPage route and scripts/prerender.mjs so the
// crawlable HTML and the app match. Titles are brand-free (" | Apex Trade Show"
// is appended by the renderer).

export const LANDING_PAGES = [
  {
    slug: 'seg-displays',
    nav: 'SEG Displays',
    title: 'SEG Displays | Silicone Edge Graphics',
    h1: 'SEG Displays (Silicone Edge Graphics)',
    description:
      'Custom SEG displays — silicone-edge-graphic fabric on a rigid aluminum frame for a seamless, frameless finish. Backlit options, quoted per order.',
    intro:
      'SEG displays — short for Silicone Edge Graphics — are dye-sublimated fabric prints with a thin silicone strip sewn around the edge. The strip presses into a groove on a slim aluminum frame, so the graphic sits perfectly flat, edge to edge, with no visible frame. The result is the clean, seamless, premium look you see on modern trade show backwalls, light boxes and retail displays.',
    sections: [
      { h2: 'What is an SEG display?', p: 'A tensioned fabric graphic held in an aluminum extrusion frame by a silicone edge (the "SEG"). Because the fabric pulls tight into the frame channel, the surface is flat and frameless — a cleaner finish than snap frames or banner stands.' },
      { h2: 'Why choose SEG?', list: [
        'Seamless, edge-to-edge graphics with no visible hardware.',
        'Replaceable fabric — reuse the frame and reprint the graphic when your message changes.',
        'Backlit options for illuminated light-box walls.',
        'Modern, premium look for booths, lobbies and retail.',
        'Frames scale from tabletop to large modular walls.'
      ] },
      { h2: 'SEG vs tension fabric displays', p: 'Both use dye-sublimated stretch fabric. SEG uses a rigid frame with a push-fit silicone edge for a precise, flat, frameless finish (great for backlighting and modular walls). A tension fabric display slips a "pillowcase" graphic over a lightweight tubular frame — softer, often curved, and the most portable. See our guide for a full comparison.' },
      { h2: 'Common uses', list: ['Trade show and exhibition backwalls', 'Backlit light boxes', 'Retail and showroom displays', 'Reception and lobby branding'] }
    ,
      { h2: 'Choosing an SEG size and configuration', p: 'The modular kits come in 10 ft, 13 ft, 16.4 ft and 20 ft widths at 6.6, 7.4 or 8.2 ft tall, so the wall can match a 10x10, a 10x20 or an island footprint. Configuration matters as much as width: a backdrop alone reads as a clean brand wall, while adding the illuminated archway or return section gives the booth depth and a defined entrance. The display counter runs 2.8 ft wide on the 10 and 13 ft kits and 3.3 ft wide on the larger two.' },
      { h2: 'What you get and how it goes up', p: 'Each kit ships with the illuminated SEG backdrop, its archway or return section, an illuminated counter, custom backlit fabric graphics for every panel, the modular PVC lightbox frame and the integrated LED system with your choice of US, EU or AU plug. Assembly is modular snap-fit and needs no tools. A complete kit with graphics weighs roughly 72 to 80 lb, so it ships as freight rather than luggage.' },
      { h2: 'Why the silicone edge matters', p: 'SEG stands for Silicone Edge Graphic: a thin silicone strip is sewn around the fabric edge and pressed into a groove in the aluminum frame. The graphic sits flat and tension-held with no visible frame, no glare band and no seam, which is the difference between a booth that looks bought and one that looks built. The graphic pulls out and swaps in minutes, so the frame carries across campaigns.' }
    ],
    faqs: [
      { q: 'What does SEG stand for?', a: 'Silicone Edge Graphic — a fabric print with a silicone strip on the edge that pushes into a groove on an aluminum frame for a flat, frameless look.' },
      { q: 'Can the SEG graphic be replaced?', a: 'Yes. The fabric graphic is replaceable, so you keep the frame and simply reprint the graphic when your branding changes.' },
      { q: 'Can SEG displays be backlit?', a: 'Yes — SEG frames are available in backlit (light-box) versions for illuminated displays. Ask about backlit options when you request a quote.' },
      { q: 'How do I get pricing for an SEG display?', a: 'SEG displays are quoted per order by size and configuration. Request a quote with your size and artwork and we will send pricing and a free proof.' }
    ,
      { q: 'What sizes do the SEG kits come in?', a: '10 ft, 13 ft, 16.4 ft and 20 ft wide, at 6.6, 7.4 or 8.2 ft tall. That range covers a 10x10 back wall through to a 20 ft island frontage, and each kit includes an illuminated counter sized to the wall.' },
      { q: 'Do SEG displays need power?', a: 'The modular kits do — they carry integrated internal LED illumination, and you choose a US, EU or AU plug at order time. Budget for a power drop at your booth, which most venues bill separately.' },
      { q: 'Can the SEG graphic be washed or replaced?', a: 'The graphic is a sewn-edge fabric panel that pulls out of the frame groove, so it can be removed for cleaning and replaced entirely when the campaign changes. The frame and LED system stay.' }
    ],
    products: [
      { slug: 'seg-modular-trade-show-kit-a', name: 'SEG Modular Kit A' },
      { slug: 'seg-modular-trade-show-kit-b', name: 'SEG Modular Kit B' },
      { slug: 'seg-modular-trade-show-kit-c', name: 'SEG Modular Kit C' }
    ],
    related: [
      { label: 'Tension Fabric Displays', to: '/tension-fabric-displays' },
      { label: 'Step & Repeat Backdrops', to: '/backdrops' },
      { label: 'All Trade Show Displays', to: '/trade-show-displays' }
    ]
  },
  {
    slug: 'tension-fabric-displays',
    products: [{ slug: 'straight-tension-fabric-display' }, { slug: 'step-and-repeat-backdrop' }],
    nav: 'Tension Fabric Displays',
    title: 'Tension Fabric Displays | Portable Booths',
    h1: 'Tension Fabric Displays',
    image: '/images/displays/tension-fabric-stand.jpg',
    imageAlt: 'Tension fabric display stand — tubular frame with and without the stretch fabric graphic',
    description:
      'Custom tension fabric displays — stretch dye-sub graphics over a lightweight tubular frame. Straight or curved, packs small, quoted per order.',
    intro:
      'A tension fabric display stretches a dye-sublimated fabric graphic — like a pillowcase — over a lightweight tubular aluminum frame. It is the most portable way to put up a full-size branded backwall: the frame snaps together in minutes with no tools, the fabric zips or slides on, and the whole thing packs into a compact bag.',
    sections: [
      { h2: 'What is a tension fabric display?', p: 'A stretch fabric graphic pulled taut over a collapsible tubular frame. The fabric is dye-sublimated for full-color, wrinkle-resistant print and is machine washable, so the display stays crisp show after show.' },
      { h2: 'Why choose tension fabric?', list: [
        'Lightweight and packs into a compact carry bag.',
        'Fast, tool-free frame assembly.',
        'Machine-washable, wrinkle-resistant fabric.',
        'Straight or curved shapes for backwalls and booths.',
        'Replaceable graphic — reuse the frame.'
      ] },
      { h2: 'Tension fabric vs pop-up displays', p: 'Both are portable backwalls. A tension fabric display uses a single stretch graphic over a tube frame — very light and a fully seamless surface. A pop-up display uses an accordion frame with panel graphics — extremely fast to set up and a proven classic. Choose fabric for the lightest pack-down and a seamless look; pop-up for the quickest setup.' },
      { h2: 'Common uses', list: ['Portable trade show backwalls', '10x10 and 10x20 booth backdrops', 'Events and conferences', 'Retail and pop-up shops'] }
    ,
      { h2: 'Choosing a tension fabric size', p: 'Straight tension fabric displays come in 8 ft, 10 ft and 20 ft widths at roughly 8 ft tall. Match the width to the booth you have booked: 8 ft sits comfortably inside a 10x10 with room for a table beside it, 10 ft fills the back wall of a 10x10, and 20 ft spans a 10x20 as one continuous graphic. Height is the part people underestimate — at about 8 ft the graphic clears heads in a crowded aisle, which is the whole point of a backwall.' },
      { h2: 'What you get and how it goes up', p: 'The frame is lightweight aluminum tube that assembles tool-free, the graphic is dye-sublimated tension fabric that slides or zips over it, and stabilising feet keep it upright without weights. It packs into a carry bag, so one person moves it and one person can put it up. The graphic is replaceable and machine washable, which is what makes the frame a multi-year purchase rather than a per-show cost.' },
      { h2: 'Artwork for a seamless fabric wall', p: 'Dye sublimation bonds ink into the fabric, so colors stay saturated and the surface will not crack or peel with repeated packing. Design to the full panel and keep logos and headlines away from the outer few inches, where the fabric wraps the frame. Our print coverage and artwork guides walk through bleed, resolution and file formats before you commit to a proof.' }
    ],
    faqs: [
      { q: 'What is a tension fabric display?', a: 'A stretch, dye-sublimated fabric graphic pulled over a lightweight tubular aluminum frame — a portable, seamless branded backwall.' },
      { q: 'Is the fabric washable?', a: 'Yes — the dye-sublimated fabric is wrinkle-resistant and machine washable, so it stays presentable across many shows.' },
      { q: 'Straight or curved?', a: 'Both are available. Straight walls maximise flat graphic space; curved walls give a softer, more dimensional booth look.' },
      { q: 'How is a tension fabric display priced?', a: 'It is quoted per order by size and shape. Request a quote with your size and artwork for pricing and a free proof.' }
    ,
      { q: 'What size tension fabric display fits a 10x10 booth?', a: 'A 10 ft wide display fills the back wall of a standard 10x10 booth; an 8 ft leaves room for a table or literature stand beside it. All three widths stand roughly 8 ft tall, which clears heads in a busy aisle.' },
      { q: 'How long does a tension fabric display take to set up?', a: 'Minutes, with no tools. The aluminum tube frame snaps together, the dye-sublimated fabric slides or zips over it, and stabilising feet hold it upright — one person can do it, which is why it travels well to shows without an install crew.' },
      { q: 'Can I reprint the graphic and keep the frame?', a: 'Yes. The fabric graphic is replaceable, so a rebrand or a new campaign is a reprint rather than a new display. The frame is the durable part of the purchase and the graphic is the consumable.' }
    ],
    related: [
      { label: 'SEG Displays', to: '/seg-displays' },
      { label: 'Pop-Up Displays', to: '/pop-up-displays' },
      { label: 'All Trade Show Displays', to: '/trade-show-displays' }
    ]
  },
  {
    slug: 'pop-up-displays',
    products: [{ slug: 'seg-modular-trade-show-kit-a' }, { slug: 'seg-modular-trade-show-kit-b' }, { slug: 'seg-modular-trade-show-kit-c' }],
    nav: 'Pop-Up Displays',
    title: 'Pop-Up Displays | Trade Show Backwalls',
    h1: 'Pop-Up Displays',
    description:
      'Custom pop-up displays — accordion-frame portable trade show backwalls with fabric or graphic panels. Fast setup, quoted per order.',
    intro:
      'A pop-up display is the classic portable backwall: an accordion-style frame that expands in seconds into a straight or curved wall, with fabric or printed graphic panels that attach across the front. It is one of the fastest displays to set up and packs down into a wheeled case, which is why it remains a trade show staple.',
    sections: [
      { h2: 'What is a pop-up display?', p: 'A collapsible accordion frame that "pops up" into a full-size backwall. Magnetic or hook-and-loop graphic panels — printed fabric or rigid graphics — attach to the frame to form a seamless-looking wall.' },
      { h2: 'Why choose a pop-up display?', list: [
        'Tool-free setup in minutes — expand the frame, attach the graphics.',
        'Packs into a wheeled hard case for travel.',
        'Reusable frame with replaceable graphics.',
        'Straight or curved configurations.',
        'A proven, cost-effective portable backwall.'
      ] },
      { h2: 'Pop-up vs tension fabric', p: 'A pop-up uses an accordion frame with panel graphics and is the quickest to erect. A tension fabric display uses one stretch graphic over a tube frame — lighter and fully seamless. Pick pop-up for speed and durability; fabric for the lightest, most seamless wall.' },
      { h2: 'Common uses', list: ['10x10 booth backwalls', 'Portable presentations and roadshows', 'Conferences and career fairs', 'Retail promotions'] }
    ,
      { h2: 'Choosing a pop-up backwall size', p: 'Pop-up backwalls are sold by booth footprint rather than by panel: a 10 ft wall fills the back of a standard 10x10, and a 20 ft wall spans a 10x20. Decide first whether you want a straight wall, which maximises flat graphic area for text and product shots, or a curved one, which reads softer from an angle and hides the booth corners. The SEG modular kits we stock run from 10 ft to 20 ft wide at 6.6, 7.4 or 8.2 ft tall.' },
      { h2: 'What you get and how it goes up', p: 'The kits use modular, tool-free snap-fit construction with SEG fabric graphics — a sewn silicone edge that presses into the frame groove for a flat, near-frameless finish — and integrated LED illumination. Kit A adds an illuminated archway and a display counter. Everything travels in a carry bag of roughly 43 by 14 by 8 inches, and a full kit with graphics weighs about 72 to 80 lb, so plan for a cart rather than a shoulder carry.' },
      { h2: 'Artwork and reuse', p: 'Graphics are full-color dye sublimation on flame-retardant 200g backlit fabric, and they are replaceable — a new campaign means a reprint, not a new frame. Because the panels are backlit, artwork behaves differently than it does on a front-lit wall: solid dark areas stay dark, and fine reversed type can bloom. Send us the file and the free proof shows you exactly how it will read before anything prints.' }
    ],
    faqs: [
      { q: 'What is a pop-up display?', a: 'A collapsible accordion-frame backwall with attachable fabric or graphic panels — one of the fastest portable displays to set up.' },
      { q: 'How fast is setup?', a: 'The frame expands in minutes with no tools; the graphic panels attach magnetically or with hook-and-loop.' },
      { q: 'Can I reuse it?', a: 'Yes — the frame is reusable and the graphics are replaceable, so you can refresh your message without a new frame.' },
      { q: 'How do I get a price?', a: 'Pop-up displays are quoted per order by size and style. Request a quote with your artwork and we will send pricing and a free proof.' }
    ,
      { q: 'What size pop-up display do I need?', a: 'Match it to your booth: a 10 ft wall backs a standard 10x10, a 20 ft wall spans a 10x20. The kits are available at 10, 13, 16.4 and 20 ft wide and 6.6, 7.4 or 8.2 ft tall, so the wall can be sized to the space you have actually booked.' },
      { q: 'How heavy is a pop-up kit to transport?', a: 'A full kit with graphics runs about 72 to 80 lb and packs into a carry bag of roughly 43 by 14 by 8 inches. Plan on a cart and a checked freight shipment rather than carrying it through an airport.' },
      { q: 'Are the graphics replaceable?', a: 'Yes — the SEG fabric panels pull out of the frame groove and swap in minutes, so a new campaign is a reprint. The frame, LED system and counter carry over.' }
    ],
    related: [
      { label: 'Tension Fabric Displays', to: '/tension-fabric-displays' },
      { label: 'SEG Displays', to: '/seg-displays' },
      { label: 'All Trade Show Displays', to: '/trade-show-displays' }
    ]
  },
  {
    slug: 'flags',
    nav: 'Flags',
    title: 'Custom Flags | Feather & Teardrop',
    h1: 'Custom Flags',
    description:
      'Custom feather and teardrop advertising flags on a flexible pole with ground stake or cross base. Configure for instant pricing from $140.',
    intro:
      'Custom flags are the tall, eye-catching outdoor displays you see lining event entrances, storefronts and roadsides. A dye-sublimated graphic on a flexible pole sways and flutters to catch attention from a distance, and mounts on a ground stake for grass or a cross base for hard surfaces. Configure shape, size, sides and base for an instant price and order online — no quote form needed. They pair perfectly with a canopy tent to mark your booth.',
    sections: [
      { h2: 'Flag shapes', list: [
        'Feather flags — tall, curved-top "feather" shape; the most popular for events.',
        'Teardrop flags — a rounded teardrop profile that holds its shape in wind.',
        'Straight / rectangular flags — a classic banner profile on a pole.'
      ] },
      { h2: 'Why choose custom flags?', list: [
        'Height and motion grab attention from across a lot.',
        'Dye-sublimated full-color print that will not crack or fade.',
        'Ground stake for grass or a cross base with weight for hard surfaces.',
        'Lightweight and packs into a carry bag.',
        'A natural companion to a branded canopy tent.'
      ] },
      { h2: 'Common uses', list: ['Event and festival entrances', 'Storefronts and grand openings', 'Roadside and parking-lot promotion', 'Marking a booth alongside a canopy tent'] }
    ,
      { h2: 'Choosing a flag shape and size', p: 'Shape changes how the flag reads at distance. Angled feather flags hold their shape in low wind and keep the top edge taut; convex feather flags give a rounded top with more graphic area high up; teardrop flags hold the tightest silhouette and flap least, which suits windier sites. Feather flags come at 9 ft, 10.5 ft and 14 ft; teardrops at 7 ft, 9 ft and 11.2 ft. Outdoors along a roadside, go large — the 14 ft reads from a moving car in a way the 9 ft does not.' },
      { h2: 'Bases: match the base to the ground', p: 'A ground spike is included and pushes into grass or soft ground. On pavement you need weight instead: a cross base (+$31) or a metal plate base (+$35) holds the pole upright indoors and on hard standing, and a water bag (+$20) adds ballast outdoors where a spike will not go in — fill it on site and empty it before transport. Getting this wrong is the most common reason a flag ends up on the floor.' },
      { h2: 'Single-sided or double-sided printing', p: 'Single-sided prints the front in full color and the reverse shows a mirrored print-through, which is fine when traffic passes from one direction. Double-sided prints two separate faces with a blockout layer between them so each side reads correctly — worth it at an entrance where people approach from both ways, or when the flag carries text that must not read backwards. Both are dye-sublimated, so the print resists fading outdoors.' }
    ],
    faqs: [
      { q: 'What flag shapes are available?', a: 'Feather flags in an angled or convex top, and teardrop flags. Feather flags are the most popular for events; teardrops hold their shape well in wind.' },
      { q: 'Indoor or outdoor?', a: 'Flags are built for outdoor use with a ground stake for grass or a cross base for hard surfaces; they also work indoors with a base.' },
      { q: 'Will the print fade outdoors?', a: 'The graphic is dye-sublimated — the ink is bonded into the fabric, so it holds up to sun and repeated outdoor use.' },
      { q: 'How do I order custom flags?', a: 'Choose a shape, then configure size, single or double sided, and base for an instant price — flags start at $140. Upload your artwork and we send a free proof before printing.' }
    ,
      { q: 'Which flag shape is best in wind?', a: 'A teardrop holds the tightest silhouette and flaps least, so it copes best with a windy site. Angled feather flags keep the top edge taut and are the usual choice for general outdoor use. Whatever the shape, weight the base properly on hard ground.' },
      { q: 'What size flag should I order?', a: 'Feather flags come at 9 ft, 10.5 ft and 14 ft; teardrops at 7 ft, 9 ft and 11.2 ft. Indoors or at a market stall the smallest reads fine; along a roadside or across a car park, the largest is the one people actually see.' },
      { q: 'Do I need a special base for hard ground?', a: 'Yes. The included spike only works in grass or soft ground. On pavement choose a cross base (+$31) or metal plate base (+$35), or add a water bag (+$20) for outdoor ballast where nothing can be driven in.' }
    ],
    products: [
      { slug: 'feather-angled-flag', name: 'Feather Angled Flag' },
      { slug: 'feather-convex-flag', name: 'Feather Convex Flag' },
      { slug: 'teardrop-flag', name: 'Teardrop Flag' }
    ],
    related: [
      { label: 'Custom Canopy Tents', to: '/custom-canopies' },
      { label: 'Banner Stands', to: '/banner-stands' },
      { label: 'All Trade Show Displays', to: '/trade-show-displays' }
    ]
  }
];

export const getLandingPage = (slug) => LANDING_PAGES.find((p) => p.slug === slug) || null;

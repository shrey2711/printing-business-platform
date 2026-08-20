// Large-format / wholesale print catalog, modeled after trade printers like B2Sign.
// Two pricing models are supported:
//   - 'area': price scales with printed square footage (banners, signs, decals)
//   - 'unit': price is per finished piece, chosen from fixed size variants
//             (feather flags, retractable stands, table covers, tents)
//
// All prices are illustrative wholesale rates and are easy to tune in one place.

import { calculateCompetitivePrice, competitorCurrentPrice } from './competitive.js';

// Active categories for the canopy storefront.
export const categories = [
  { id: 'tents', name: 'Canopy Tents' },
  { id: 'banner-stands', name: 'Banner Stands' },
  { id: 'banners', name: 'Banners' },
  { id: 'backdrops', name: 'Backdrops' },
  { id: 'table-covers', name: 'Table Covers' },
  { id: 'flags', name: 'Flags' },
  { id: 'seg-kits', name: 'SEG Modular Kits' }
];

// Categories belonging to the dormant full-print catalog. Restore these into
// `categories` when expanding back beyond canopies — the products themselves
// are still below, carrying `active: false`.
export const dormantCategories = [
  { id: 'banners', name: 'Banners' },
  { id: 'signs', name: 'Signs & Boards' },
  { id: 'displays', name: 'Displays & Stands' },
  { id: 'flags', name: 'Flags' },
  { id: 'decals', name: 'Decals & Stickers' },
  { id: 'large-format', name: 'Large Format' }
];

// Left-hand catalog navigation. Every slug here must resolve to an ACTIVE entry
// in `products` below, or the configurator route (/products/:slug) will render a
// not-found page.
export const navGroups = [
  {
    name: 'Canopy Tents',
    items: [
      { name: "10' × 10' Canopy Tent", slug: 'canopy-tent-10x10' },
      { name: "10' × 15' Canopy Tent", slug: 'canopy-tent-10x15' },
      { name: "10' × 20' Canopy Tent", slug: 'canopy-tent-10x20' }
    ]
  },
  {
    name: 'Table Covers',
    items: [
      { name: 'Pleated Table Covers', slug: 'pleated-table-covers' },
      { name: 'Stretch Table Covers', slug: 'stretch-table-covers' }
    ]
  },
  {
    name: 'Banner Stands',
    items: [
      { name: 'Standard Retractable Banner Stand', slug: 'standard-retractable-banner' },
      { name: 'Deluxe Retractable Banner Stand', slug: 'deluxe-retractable-banner' },
      { name: 'X-Stand Banner', slug: 'x-stand-banner' },
      { name: 'Table Top Banner Stand', slug: 'table-top-banner-stand' }
    ]
  },
  {
    name: 'Banners',
    items: [
      { name: '13oz Vinyl Banner', slug: '13oz-vinyl-banner' },
      { name: '18oz Blockout Banner', slug: '18oz-blockout-banner' },
      { name: 'Mesh Banner', slug: 'mesh-banner' },
      { name: '9oz Wrinkle-Free Fabric Banner', slug: 'fabric-banner-9oz-wrinkle-free' }
    ]
  },
  {
    name: 'Backdrops',
    items: [{ name: 'Step and Repeat Backdrop', slug: 'step-and-repeat-backdrop' }]
  },
  {
    name: 'Flags',
    items: [
      { name: 'Feather Angled Flag', slug: 'feather-angled-flag' },
      { name: 'Feather Convex Flag', slug: 'feather-convex-flag' },
      { name: 'Teardrop Flag', slug: 'teardrop-flag' }
    ]
  },
  {
    name: 'SEG Modular Kits',
    items: [
      { name: 'SEG Modular Kit A', slug: 'seg-modular-trade-show-kit-a' },
      { name: 'SEG Modular Kit B', slug: 'seg-modular-trade-show-kit-b' },
      { name: 'SEG Modular Kit C', slug: 'seg-modular-trade-show-kit-c' }
    ]
  }
];

// Shared pricing pieces for the three sizes. Prices are USD, from the supplied
// rate card (which is the 6–8 day price). quantityTiers: 1-2 units vs 3+ units.
// Full walls and half walls are chosen INDEPENDENTLY (0-3 each) and cost the
// same per wall. Rush delivery (2-3 days) is +50% on the whole order.
const wallSelect = (id, label, per) => ({
  id,
  label,
  type: 'select',
  pricing: 'add',
  choices: [
    { id: 'none', label: 'No wall', price: 0, default: true },
    { id: '1', label: '1 wall', price: per },
    { id: '2', label: '2 walls', price: per * 2 },
    { id: '3', label: '3 walls', price: per * 3 }
  ]
});

const daysGroup = {
  id: 'days',
  label: 'Delivery',
  type: 'select',
  pricing: 'multiplyTotal',
  help: 'Production time after proof approval — standard 6–8 business days, rush 2–3 business days (+50%). Shipping/transit is additional.',
  choices: [
    { id: '6-8', label: '6-8 business days (standard production)', mult: 1, default: true },
    { id: '2-3', label: '2-3 business days (rush production +50%)', mult: 1.5 }
  ]
};

// Delivery for table covers: rush 2-3 days is +15% (NOT the canopy's +50%),
// reproducing the supplied two-column price card.
const daysGroup15 = {
  id: 'days',
  label: 'Delivery',
  type: 'select',
  pricing: 'multiplyTotal',
  help: 'Standard is 6-8 business days. Rush 2-3 days is +15%.',
  choices: [
    { id: '6-8', label: '6-8 days (standard)', mult: 1, default: true },
    { id: '2-3', label: '2-3 days (rush +15%)', mult: 1.15 }
  ]
};

// Complete Canopy Set (printed top + aluminium frame + carry bag) vs Printed
// Canopy Top Only (the printed fabric top on its own, for a frame the customer
// already owns). Each kit is a SEPARATE, explicitly-configured price column per
// size/tier (see quantityTiers.prices) — it is NOT a percentage discount off the
// other. pricing:'baseKit' is handled by computePrice's base step and ignored by
// the multiplier/add loops.
const kitGroup = {
  id: 'kit',
  label: 'What you get',
  type: 'select',
  pricing: 'baseKit',
  help: 'Complete Canopy Set = printed canopy top + aluminium frame + carry bag. Printed Canopy Top Only = the custom-printed fabric top on its own (no frame, no carry bag) — for customers who already have a compatible frame.',
  choices: [
    { id: 'full', label: 'Complete Canopy Set — top + frame + bag', default: true },
    { id: 'canopy', label: 'Printed Canopy Top Only — no frame' }
  ]
};

// Leg weights. Priced per tent (a set of 4 = one per leg) as an 'add', so it
// scales with quantity and is NOT reduced by the canopy-only multiplier (which
// applies to the base tent only). $50 for a set of 4.
const sandbagGroup = {
  id: 'sandbags',
  label: 'Sandbags',
  type: 'select',
  pricing: 'add',
  fullRow: true,
  help: 'Weight bags anchor the legs — most venues require weights. A set is 4 pieces, one per leg.',
  choices: [
    { id: 'none', label: 'No sandbags', price: 0, default: true },
    { id: 'set4', label: 'Sandbag set (4 pieces)', price: 50 }
  ]
};

// One-time design service (flat, not per tent).
const designGroup = {
  id: 'design',
  label: 'Artwork',
  type: 'select',
  pricing: 'addFlat',
  help: 'Upload your own print-ready file, or let our team design it for you.',
  choices: [
    { id: 'self', label: "I'll upload my artwork", price: 0, default: true },
    { id: 'service', label: 'Design service — we design it', price: 35 }
  ]
};

const canopyProduct = ({ slug, size, full1, full3, canopy1, canopy3, wallPer }) => ({
  slug,
  active: true,
  name: `${size} Canopy Tent`,
  category: 'tents',
  badge: 'Custom Printed',
  emoji: '⛺',
  tagline: `Custom printed ${size} pop-up canopy tent, full-colour dye sublimation.`,
  description:
    `A commercial-grade ${size} pop-up canopy printed edge to edge in full colour. Add printed full ` +
    `or half walls. Dye sublimation bonds the ink into the fabric, so graphics will not crack, peel ` +
    `or fade. Order 3 or more and the per-tent price drops.`,
  features: [
    'Dye-sublimated full-bleed printing',
    'Add up to 3 printed walls total — any mix of full and half height',
    'Heavy-duty aluminium hex frame',
    'Free artwork proof before production'
  ],
  // Production time (after proof approval) — shipping/transit is additional.
  turnaround: 'Production: 6–8 business days standard, 2–3 days rush (+50%). Shipping additional.',
  // Cross-sell the rest of the booth (complete-solution internal linking).
  related: ['pleated-table-covers', 'standard-retractable-banner', 'step-and-repeat-backdrop'],
  // AEO/GEO: concise factual answers, using this product's own explicit prices.
  faqs: [
    { q: `What does the $${canopy1.toLocaleString('en-US')} ${size} canopy price include?`, a: `The $${canopy1.toLocaleString('en-US')} starting price is for the custom-printed ${size} canopy top only. It does not include the aluminium frame or carry bag.` },
    { q: `How much is the complete ${size} custom canopy set?`, a: `The complete ${size} set is $${full1.toLocaleString('en-US')} and includes the custom-printed canopy top, the aluminium frame and a carry bag.` },
    { q: 'Can I purchase only the printed canopy top?', a: 'Yes. Customers who already have a compatible frame can order the printed canopy top on its own — choose "Printed Canopy Top Only" on the product page.' },
    { q: 'How long does production take?', a: 'Standard production is 6–8 business days after you approve your free proof; rush production is 2–3 business days. Shipping/transit time is additional and depends on your destination.' },
    { q: 'How many walls can I add?', a: 'Up to 3 printed walls total, in any combination of full-height and half-height walls.' },
    { q: 'What sizes are available?', a: 'Custom canopy tents come in three sizes: 10×10, 10×15 and 10×20.' }
  ],
  pricing: {
    model: 'configured',
    baseLabel: `${size} canopy tent`,
    // The kit selection picks the price column; each size/tier has its own
    // full-set and graphic-only price (from the supplied rate card).
    kitGroupId: 'kit',
    quantityTiers: [
      { min: 1, prices: { full: full1, canopy: canopy1 } },
      { min: 3, prices: { full: full3, canopy: canopy3 } }
    ],
    // Full + half walls together cannot exceed 3 (a tent has 3 open sides +
    // the back). Enforced in the configurator UI and clamped server-side.
    constraints: [{ groups: ['wallsFull', 'wallsHalf'], max: 3 }],
    optionGroups: [
      kitGroup,
      wallSelect('wallsFull', 'Full walls', wallPer),
      wallSelect('wallsHalf', 'Half walls', wallPer),
      // Delivery + Artwork share a row; Sandbags then sits on its own row.
      daysGroup,
      designGroup,
      sandbagGroup
    ]
  }
});

const canopyTents = [
  // From the supplied rate card. full = Frame + Graphic; canopy = Graphic Only.
  canopyProduct({ slug: 'canopy-tent-10x10', size: "10' × 10'", full1: 835, full3: 799, canopy1: 510, canopy3: 485, wallPer: 275 }),
  canopyProduct({ slug: 'canopy-tent-10x15', size: "10' × 15'", full1: 1375, full3: 1250, canopy1: 545, canopy3: 540, wallPer: 365 }),
  canopyProduct({ slug: 'canopy-tent-10x20', size: "10' × 20'", full1: 1635, full3: 1445, canopy1: 915, canopy3: 805, wallPer: 365 })
];

const pleatedCovers = {
  slug: 'pleated-table-covers',
  active: true,
  name: 'Pleated Table Covers',
  category: 'table-covers',
  badge: 'Custom Printed',
  emoji: '🎪',
  tagline: 'Full-colour pleated table throws — draped fit, closed back.',
  description:
    'Custom printed pleated table covers (throws) for trade shows, markets and events. Dye-sublimated ' +
    'full-colour print on wrinkle-resistant polyester with a draped, rounded-corner fit and a closed ' +
    'back (4-sided). Choose 4, 6 or 8 ft, standard 6-8 day or rush 2-3 day.',
  features: [
    'Draped pleated throw with rounded corners',
    'Closed back — covers all four sides',
    'Dye-sublimated full-colour print',
    'Wrinkle-resistant, machine washable'
  ],
  applications: ['Trade show and market tables', 'Registration and welcome desks', 'Retail and event counters', 'Fundraisers and open days'],
  specs: [
    ['Style', 'Pleated throw (draped, rounded corners)'],
    ['Sizes', '4 ft, 6 ft, 8 ft'],
    ['Back', 'Closed back (4-sided)'],
    ['Fabric', 'Wrinkle-resistant polyester, dye-sublimated'],
    ['Turnaround', '6–8 business days production (2–3 day rush); shipping additional']
  ],
  turnaround: 'Production: 6–8 business days standard, 2–3 days rush (+15%). Shipping additional.',
  seoTitle: 'Custom Pleated Table Covers | Printed 4, 6 & 8 ft Throws',
  seoDescription:
    'Custom printed pleated table covers (throws) in 4, 6 and 8 ft — draped closed-back fit, full-colour dye sublimation, free artwork proof. From $199.',
  related: ['stretch-table-covers', 'canopy-tent-10x10', 'standard-retractable-banner'],
  pricing: {
    model: 'configured',
    baseLabel: 'Pleated table cover',
    optionGroups: [
      {
        id: 'style',
        label: 'Size',
        type: 'select',
        pricing: 'base',
        help: 'Pleated throws drape with rounded corners. Closed-back (4-sided).',
        choices: [
          { id: '4ft', label: '4 ft — closed back', price: 199, default: true },
          { id: '6ft', label: '6 ft — closed back', price: 215 },
          { id: '8ft', label: '8 ft — closed back', price: 255 }
        ]
      },
      daysGroup15,
      designGroup
    ]
  }
};

const stretchCovers = {
  slug: 'stretch-table-covers',
  active: true,
  name: 'Stretch Table Covers',
  category: 'table-covers',
  badge: 'Custom Printed',
  emoji: '🎪',
  tagline: 'Full-colour fitted stretch covers — tight fit, closed back.',
  description:
    'Custom printed stretch table covers for trade shows and events. A fitted, spandex-style cover ' +
    'that pulls tight to the table for a clean, modern look, closed back (4-sided) and dye-sublimated ' +
    'in full colour. Choose 6 or 8 ft, standard 6-8 day or rush 2-3 day.',
  features: [
    'Fitted stretch cover — tight, modern fit',
    'Closed back — covers all four sides',
    'Dye-sublimated full-colour print',
    'Wrinkle-resistant, machine washable'
  ],
  applications: ['Trade show and expo tables', 'Modern booth and counter looks', 'Product demo tables', 'Corporate and event branding'],
  specs: [
    ['Style', 'Fitted stretch (tight to the table)'],
    ['Sizes', '6 ft, 8 ft'],
    ['Back', 'Closed back (4-sided)'],
    ['Fabric', 'Stretch polyester, dye-sublimated'],
    ['Turnaround', '6–8 business days production (2–3 day rush); shipping additional']
  ],
  turnaround: 'Production: 6–8 business days standard, 2–3 days rush (+15%). Shipping additional.',
  seoTitle: 'Custom Stretch Table Covers | Fitted 6 & 8 ft Tablecloths',
  seoDescription:
    'Custom printed fitted stretch table covers in 6 and 8 ft — tight closed-back fit, full-colour dye sublimation, free artwork proof. From $285.',
  related: ['pleated-table-covers', 'canopy-tent-10x10', 'standard-retractable-banner'],
  pricing: {
    model: 'configured',
    baseLabel: 'Stretch table cover',
    optionGroups: [
      {
        id: 'style',
        label: 'Size',
        type: 'select',
        pricing: 'base',
        help: 'Fitted stretch covers pull tight to the table. Closed-back (4-sided).',
        choices: [
          { id: '6ft', label: '6 ft — closed back', price: 285, default: true },
          { id: '8ft', label: '8 ft — closed back', price: 345 }
        ]
      },
      daysGroup15,
      designGroup
    ]
  }
};

// ─── Trade Show Displays (quote-only) ────────────────────────────────────────
// Banner stands, backdrops and tabletop displays. No pricing was provided, so
// these use the `quote` model: the card and product page show "Request a Quote"
// and route to the existing /quote + artwork-upload flow. Replace with a real
// pricing model once rates exist. `specs`/`applications`/`related`/`seo*` are
// read by ProductTabs, the configurator and the prerenderer.
const tradeShowDisplays = [
  {
    slug: 'standard-retractable-banner',
    active: true,
    name: 'Standard Retractable Banner Stand',
    category: 'banner-stands',
    badge: 'Retractable',
    emoji: '📐',
    gallery: [
      { src: '/images/displays/standard-retractable-front-back.png', alt: 'Apex standard retractable banner stand, front and back view, assembled with a printed graphic' },
      { src: '/images/displays/standard-retractable-detail.png', alt: 'Apex standard retractable banner stand aluminium base and support-pole hardware close-up' },
      { src: '/images/displays/standard-retractable-kit.png', alt: "What's included with the Apex standard retractable banner stand: aluminium base, support poles and padded carry bag" },
      { src: '/images/displays/apex-standard-retractable-dimensions.svg', alt: 'Dimension diagram for the Apex standard retractable banner: 33 by 81 inch and 47 by 81 inch printed graphic sizes' },
      { src: '/images/displays/standard-retractable-banner.webp', alt: 'Apex standard retractable banner stand with a full-colour printed graphic' }
    ],
    tagline: 'Compact retractable banner stand with a replaceable printed graphic.',
    description:
      'A portable retractable banner stand with a compact aluminium base and two stabilising feet. ' +
      'The printed graphic rolls into the base for travel and pops up in seconds — ideal for trade ' +
      'shows, lobbies and events. The graphic is replaceable, so you can reuse the hardware.',
    size: '33" × 81"',
    features: [
      'Compact aluminium retractable base',
      'Two stabilising feet',
      'Quick tool-free setup',
      'Portable trade-show display',
      'Replaceable printed graphic',
      'Travel-friendly design'
    ],
    applications: ['Trade shows and expos', 'Conferences and lobbies', 'Retail and showroom displays', 'Events and promotions'],
    specs: [
      ['Display size', '33" × 81" or 47" × 81"'],
      ['Type', 'Retractable banner stand'],
      ['Base', 'Compact aluminium with two stabilising feet'],
      ['Graphic', 'Replaceable printed banner'],
      ['Setup', 'Tool-free — pops up in seconds'],
      ['Included', 'Stand + printed graphic + carry bag']
    ],
    turnaround: 'Production: 6–8 business days (2–3 day rush). Shipping additional.',
    related: ['deluxe-retractable-banner', 'x-stand-banner'],
    seoTitle: 'Standard Retractable Banner Stand | Custom Printed Roll-Up',
    seoDescription:
      'Custom Apex retractable banner stand, 33×81 in. Compact aluminium base, quick tool-free setup and a replaceable printed graphic for trade shows and events.',
    pricing: {
      model: 'configured',
      baseLabel: 'Retractable banner',
      // Price looked up from size × production. Stand + printed graphic always
      // included (no graphic-only option for the Standard). USD rate card.
      matrixGroups: ['size', 'days'],
      priceMatrix: {
        '33x81|6to8': 145, '33x81|rush': 199,
        '47x81|6to8': 299, '47x81|rush': 445
      },
      optionGroups: [
        { id: 'size', label: 'Size', type: 'select', pricing: 'matrix', choices: [
          { id: '33x81', label: '33" × 81"', default: true },
          { id: '47x81', label: '47" × 81"' }
        ] },
        { id: 'days', label: 'Production', type: 'select', pricing: 'matrix', help: 'Rush is 2-3 business days.', choices: [
          { id: '6to8', label: '6-8 days', default: true },
          { id: 'rush', label: '2-3 days (rush)' }
        ] },
        designGroup
      ]
    },
    faqs: [
      { q: 'What size is the Standard Retractable Banner Stand?', a: 'The printed graphic is 33" wide × 81" tall. Ask us for other sizes when you request a quote.' },
      { q: 'Can I replace the graphic later?', a: 'Yes — the banner is replaceable, so you can reuse the stand and just reprint the graphic.' },
      { q: 'How much does it cost?', a: 'Pricing shows on this page — pick your size and production speed for an instant price. Upload artwork or add our design service, and every order includes a free proof before printing.' }
    ]
  },
  {
    slug: 'deluxe-retractable-banner',
    active: true,
    name: 'Deluxe Retractable Banner Stand',
    category: 'banner-stands',
    badge: 'Premium',
    emoji: '🏆',
    gallery: [
      { src: '/images/displays/deluxe-retractable-banner.webp', alt: 'Apex deluxe retractable banner stand with a full-colour printed graphic' },
      { src: '/images/displays/deluxe-retractable-led.jpg', alt: 'Apex deluxe retractable banner stand with a clip-on LED banner light illuminating the printed graphic' },
      { src: '/images/displays/deluxe-retractable-hardware.jpg', alt: 'Apex deluxe retractable banner stand aluminium base with chrome-style end caps, close-up' },
      { src: '/images/displays/deluxe-retractable-base.jpg', alt: 'Apex deluxe retractable banner stand base detail with chrome finish' },
      { src: '/images/displays/apex-deluxe-retractable-dimensions.svg', alt: 'Dimension diagram for the Apex deluxe retractable banner: 33 by 81 inch printed graphic size' }
    ],
    tagline: 'Premium retractable banner stand with chrome-style end caps and an adjustable pole.',
    description:
      'A premium retractable banner stand with heavier aluminium hardware, chrome-style end caps and an ' +
      'adjustable support pole for a polished, professional look. The printed graphic is replaceable and ' +
      'the stand packs into a padded bag for travel.',
    size: '33" × 81"',
    features: [
      'Premium aluminium hardware',
      'Chrome-style end caps',
      'Adjustable support pole',
      'Professional premium appearance',
      'Portable, easy tool-free setup',
      'Replaceable printed graphic'
    ],
    applications: ['Trade shows and conferences', 'Corporate and retail displays', 'Showrooms and events', 'Reception and lobby branding'],
    specs: [
      ['Display size', '33" × 81"'],
      ['Type', 'Premium retractable banner stand'],
      ['Base', 'Heavy aluminium with chrome-style end caps'],
      ['Pole', 'Adjustable support pole'],
      ['Graphic', 'Replaceable printed banner'],
      ['Included', 'Stand + printed graphic + padded bag']
    ],
    turnaround: 'Production: 6–8 business days (2–3 day rush). Shipping additional.',
    related: ['standard-retractable-banner', 'x-stand-banner'],
    seoTitle: 'Deluxe Retractable Banner Stand | Premium Printed Roll-Up',
    seoDescription:
      'Premium Apex retractable banner stand, 33×81 in, with chrome-style end caps and an adjustable pole. Replaceable graphic for a polished trade-show display.',
    pricing: {
      model: 'configured',
      baseLabel: 'Deluxe retractable banner',
      // Single size (33x81); stand + printed graphic included. Rush (2-3 day)
      // is the higher price (rate card's 225/281 was inverted — swapped per owner).
      matrixGroups: ['days'],
      priceMatrix: { '6to8': 225, 'rush': 281 },
      optionGroups: [
        { id: 'days', label: 'Production', type: 'select', pricing: 'matrix', help: '33" × 81". Rush is 2-3 business days.', choices: [
          { id: '6to8', label: '6-8 days', default: true },
          { id: 'rush', label: '2-3 days (rush)' }
        ] },
        designGroup
      ]
    },
    faqs: [
      { q: 'How is the Deluxe different from the Standard stand?', a: 'The Deluxe uses heavier aluminium hardware, chrome-style end caps and an adjustable pole for a more premium, professional look.' },
      { q: 'Is the graphic replaceable?', a: 'Yes — reuse the premium hardware and reprint the banner whenever your message changes.' },
      { q: 'How much does it cost?', a: 'Pricing shows on this page — pick your size and production speed for an instant price. Upload artwork or add our design service, and every order includes a free proof before printing.' }
    ]
  },
  {
    slug: 'x-stand-banner',
    active: true,
    name: 'X-Stand Banner',
    category: 'banner-stands',
    badge: 'Economical',
    emoji: '✖️',
    gallery: [
      { src: '/images/displays/x-stand-front-back.jpg', alt: 'Apex X-stand banner, front and back view, assembled on the X-frame with a printed graphic' },
      { src: '/images/displays/x-stand-hardware.jpg', alt: 'Apex X-stand banner X-frame hardware — folded poles, hub and hanging hooks' },
      { src: '/images/displays/x-stand-banner.webp', alt: 'Apex X-stand banner with a full-colour printed graphic' },
      { src: '/images/displays/apex-x-stand-graphic-vs-complete.svg', alt: 'Apex X-stand options: graphic only versus complete set with the X-frame stand' },
      { src: '/images/displays/apex-x-stand-dimensions.svg', alt: 'Dimension diagram for the Apex X-stand banner: 24 by 63 inch and 32 by 71 inch printed graphic sizes' }
    ],
    tagline: 'Lightweight X-frame banner stand — an economical, portable display.',
    description:
      'A lightweight X-frame banner stand — not a retractable. The banner mounts to a collapsible ' +
      'X-shaped frame with grommets at the corners, so graphics are quick to swap. It folds flat, sets ' +
      'up in seconds and is one of the most economical portable displays for events and promotions.',
    size: '24" × 63"',
    features: [
      'Lightweight X-frame hardware',
      'Grommet-mounted banner',
      'Easy graphic replacement',
      'Fast tool-free setup',
      'Lightweight and portable',
      'Economical option for events'
    ],
    applications: ['Events and promotions', 'Retail and point-of-sale', 'Registration and info points', 'Budget-friendly signage'],
    specs: [
      ['Display size', '24" × 63" or 32" × 71"'],
      ['Type', 'X-frame banner stand (not retractable)'],
      ['Frame', 'Collapsible lightweight X-frame'],
      ['Mounting', 'Grommets at the four corners'],
      ['Setup', 'Folds flat — sets up in seconds'],
      ['Included', 'X-frame + printed banner']
    ],
    turnaround: 'Production: 6–8 business days (2–3 day rush). Shipping additional.',
    related: ['standard-retractable-banner', 'deluxe-retractable-banner'],
    seoTitle: 'Custom X-Stand Banner | Portable Printed Display',
    seoDescription:
      'Apex X-Stand banner, 24×63 in — a lightweight X-frame display with a grommet-mounted, easy-to-swap graphic. Economical, portable signage for events.',
    pricing: {
      model: 'configured',
      baseLabel: 'X-stand banner',
      // Price looked up from size × kit × production. USD rate card.
      matrixGroups: ['size', 'kit', 'days'],
      priceMatrix: {
        '24x63|stand|6to8': 99, '24x63|stand|rush': 145,
        '24x63|graphic|6to8': 65, '24x63|graphic|rush': 99,
        '32x71|stand|6to8': 119, '32x71|stand|rush': 159,
        '32x71|graphic|6to8': 85, '32x71|graphic|rush': 105
      },
      optionGroups: [
        { id: 'size', label: 'Size', type: 'select', pricing: 'matrix', choices: [
          { id: '24x63', label: '24" × 63"', default: true },
          { id: '32x71', label: '32" × 71"' }
        ] },
        { id: 'kit', label: 'What you get', type: 'select', pricing: 'matrix', help: 'The X-frame stand plus the printed graphic, or the graphic on its own.', choices: [
          { id: 'stand', label: 'With stand', default: true },
          { id: 'graphic', label: 'Graphic only' }
        ] },
        { id: 'days', label: 'Production', type: 'select', pricing: 'matrix', help: 'Rush is 2-3 business days.', choices: [
          { id: '6to8', label: '6-8 days', default: true },
          { id: 'rush', label: '2-3 days (rush)' }
        ] },
        designGroup
      ]
    },
    faqs: [
      { q: 'Is the X-Stand a retractable banner?', a: 'No — the X-Stand uses a collapsible X-shaped frame and a grommet-mounted banner, not a roll-up cassette. It is lighter and more economical.' },
      { q: 'How does the banner attach?', a: 'The printed banner has grommets at the corners that hook onto the X-frame, so it is fast to mount and swap.' },
      { q: 'How much does it cost?', a: 'Pricing shows on this page — pick your size, choose the stand or graphic only, and your production speed for an instant price. Every order includes a free proof before printing.' }
    ]
  },
  {
    slug: 'step-and-repeat-backdrop',
    active: true,
    name: 'Step and Repeat Backdrop',
    category: 'backdrops',
    badge: 'Backdrop',
    emoji: '📸',
    // Real product photos (assembled walls, frame + hardware kit). Shown as a
    // gallery on the product page in place of the illustrated placeholder.
    gallery: [
      '/images/displays/step-repeat-angled.jpeg',
      '/images/displays/step-repeat-front-back.jpeg',
      '/images/displays/step-repeat-graphic-detail.jpeg',
      '/images/displays/step-repeat-frame.jpeg',
      '/images/displays/step-repeat-kit.jpeg',
      '/images/displays/step-repeat-detail.jpeg'
    ],
    tagline: 'Large-format step & repeat media wall for event photography and branding.',
    description:
      'A large-format fabric step & repeat backdrop on an adjustable frame — the media wall behind ' +
      'press, red-carpet and event photos. Print repeating logos or artwork across the full surface for ' +
      'consistent branding in every shot. The graphic is replaceable and the frame packs down for transport.',
    size: '120" × 96"',
    sizeLabel: "10' × 8' (120\" × 96\")",
    features: [
      'Large-format fabric backdrop',
      'Adjustable frame system',
      'Designed for event photography',
      'Excellent for repeating logo branding',
      'Professional photo backdrop',
      'Portable frame',
      'Replaceable graphic'
    ],
    applications: ['Event and press photography', 'Red-carpet / step-and-repeat walls', 'Conferences and galas', 'Brand activations'],
    specs: [
      ['Display size', "8' × 8' or 10' × 8' (up to 120\" × 96\")"],
      ['Type', 'Step & repeat event backdrop'],
      ['Frame', 'Adjustable, portable frame system'],
      ['Graphic', 'Large-format fabric — replaceable'],
      ['Best for', 'Repeating logos and photo backdrops'],
      ['Included', 'Frame + printed graphic + carry bag']
    ],
    turnaround: 'Production: 6–8 business days (2–3 day rush). Shipping additional.',
    related: ['pleated-table-covers', 'canopy-tent-10x10', 'standard-retractable-banner'],
    seoTitle: 'Step & Repeat Backdrop | Custom Printed Media Wall',
    seoDescription:
      'Apex 10×8 ft step and repeat backdrop for event photography. Large-format fabric media wall with repeating logo branding on an adjustable, portable frame.',
    pricing: {
      model: 'configured',
      baseLabel: 'Step & repeat backdrop',
      // Price looked up from size × kit × production. USD rate card.
      matrixGroups: ['size', 'kit', 'days'],
      priceMatrix: {
        '8x8|frame|6to8': 440, '8x8|frame|rush': 545,
        '8x8|graphic|6to8': 245, '8x8|graphic|rush': 299,
        '10x8|frame|6to8': 465, '10x8|frame|rush': 565,
        '10x8|graphic|6to8': 299, '10x8|graphic|rush': 350
      },
      optionGroups: [
        { id: 'size', label: 'Size', type: 'select', pricing: 'matrix', choices: [
          { id: '8x8', label: "8' × 8'", default: true },
          { id: '10x8', label: "10' × 8'" }
        ] },
        { id: 'kit', label: 'What you get', type: 'select', pricing: 'matrix', help: 'The frame plus the printed graphic, or the graphic on its own.', choices: [
          { id: 'frame', label: 'With frame', default: true },
          { id: 'graphic', label: 'Graphic only' }
        ] },
        { id: 'days', label: 'Production', type: 'select', pricing: 'matrix', help: 'Rush is 2-3 business days.', choices: [
          { id: '6to8', label: '6-8 days', default: true },
          { id: 'rush', label: '2-3 days (rush)' }
        ] },
        designGroup
      ]
    },
    faqs: [
      { q: 'What size is the step and repeat backdrop?', a: "The standard display is 10' × 8' (120\" × 96\"). Ask about other sizes when you request a quote." },
      { q: 'Can it show repeating logos?', a: 'Yes — that is what it is built for. We space your logos or artwork evenly across the full surface so they read in every photo.' },
      { q: 'How much does it cost?', a: 'Pricing shows on this page — pick your size, choose the frame or graphic only, and your production speed for an instant price. Every order includes a free proof before printing.' }
    ]
  },
  {
    slug: 'table-top-banner-stand',
    active: true,
    name: 'Table Top Banner Stand',
    category: 'banner-stands',
    badge: 'Tabletop',
    emoji: '🪧',
    gallery: [
      { src: '/images/displays/table-top-example.png', alt: 'Apex table top banner stand, front and back, with a full-colour printed sample graphic' },
      { src: '/images/displays/table-top-banner-stand.webp', alt: 'Apex table top retractable banner stand with a full-colour printed graphic' },
      { src: '/images/displays/apex-table-top-banner-dimensions.svg', alt: 'Dimension diagram for the Apex table top banner stand: 11.5 by 17.5 inch printed graphic' }
    ],
    tagline: 'Compact tabletop retractable banner for counters and registration desks.',
    description:
      'A compact retractable banner that sits on a table or counter — a mini version of a full-height ' +
      'retractable. The small aluminium base holds a replaceable printed graphic and sets up in seconds. ' +
      'Perfect for registration desks, retail counters, restaurants and trade-show tables.',
    size: '11.5" × 17.5"',
    features: [
      'Compact retractable tabletop banner',
      'Small aluminium base',
      'Quick tool-free setup',
      'Lightweight and portable',
      'Replaceable printed graphic',
      'Fits counters and tabletops'
    ],
    applications: ['Registration and welcome desks', 'Retail and restaurant counters', 'Exhibition and trade-show tables', 'Point-of-sale displays'],
    specs: [
      ['Display size', '11.5" × 17.5" (tabletop)'],
      ['Type', 'Tabletop retractable banner'],
      ['Base', 'Compact aluminium tabletop base'],
      ['Graphic', 'Replaceable printed banner'],
      ['Setup', 'Tool-free — pops up in seconds'],
      ['Included', 'Tabletop stand + printed graphic']
    ],
    turnaround: 'Ships in 2–4 business days',
    related: ['standard-retractable-banner', 'pleated-table-covers'],
    seoTitle: 'Tabletop Retractable Banner | Custom Printed Counter Display',
    seoDescription:
      'Compact Apex tabletop retractable banner, 11.5×17.5 in. Small aluminium base and replaceable graphic for counters, registration desks and trade-show tables.',
    pricing: {
      model: 'competitive',
      discountPercent: 5,
      variants: [
        { id: '11.5x17.5', name: '11.5" × 17.5"', competitorPrice: null, competitorRegularPrice: null, lastChecked: null }
      ]
    },
    faqs: [
      { q: 'How big is the Table Top Banner Stand?', a: 'The graphic is 11.5" wide × 17.5" tall — a compact tabletop size, not a full-height floor banner.' },
      { q: 'Where is it used?', a: 'On tables and counters — registration desks, retail and restaurant counters, and trade-show tables.' },
      { q: 'How do I get pricing?', a: 'Request a quote with your artwork and quantity and we will send pricing and a free proof before production.' }
    ]
  }
];

// ─── Advertising Flags (staged; active:false until real Apex product imagery
// is supplied — never ship a wrong/placeholder product photo). Explicit price
// LOOKUP MATRIX from the supplied rate card — NO formulas. Key order:
// package | size | sides | production. Same matrix for all four flag shapes;
// only the size LABELS differ (teardrop uses different heights).
const FLAG_MATRIX = {
  'hw|sm|single|rush': 215, 'hw|sm|single|std': 165, 'hw|sm|double|rush': 260, 'hw|sm|double|std': 210,
  'go|sm|single|rush': 190, 'go|sm|single|std': 140, 'go|sm|double|rush': 235, 'go|sm|double|std': 185,
  'hw|md|single|rush': 225, 'hw|md|single|std': 175, 'hw|md|double|rush': 278, 'hw|md|double|std': 228,
  'go|md|single|rush': 200, 'go|md|single|std': 150, 'go|md|double|rush': 245, 'go|md|double|std': 195,
  'hw|lg|single|rush': 245, 'hw|lg|single|std': 215, 'hw|lg|double|rush': 305, 'hw|lg|double|std': 275,
  'go|lg|single|rush': 210, 'go|lg|single|std': 180, 'go|lg|double|rush': 270, 'go|lg|double|std': 240
};

// Base is an add-on that applies with the hardware package. Spike included ($0),
// cross +$31, metal plate +$35 — added once. (Graphic-only orders ship without
// hardware or a base; a future configurator pass will hide this group for them.)
const flagBaseGroup = {
  id: 'base', label: 'Base', type: 'select', pricing: 'add',
  help: 'Choose a base for the hardware package. Spike base is included; cross base +$31; metal plate base +$35. Graphic-only orders do not include a pole or base.',
  choices: [
    { id: 'spike', label: 'Spike base — included', price: 0, default: true },
    { id: 'cross', label: 'Cross base (+$31)', price: 31 },
    { id: 'plate', label: 'Metal plate base (+$35)', price: 35 }
  ]
};

// Shared hardware/portability figures appended to every flag gallery.
const FLAG_SHARED_FIGURES = [
  { src: '/images/flags/flag-base-options.png', alt: 'Flag base options — ground stake, cross base, cross base with water bag, and square base' },
  { src: '/images/flags/flag-pole-set-carry-bag.png', alt: 'Flag pole set with carry bag' },
  { src: '/images/flags/flag-kit-in-bag-portable.png', alt: 'Flag kit packed in its carry bag — portable, easy to transport' }
];

const flagProduct = ({ slug, name, shape, sizes, seoTitle, seoDescription, intro, active = false, gallery }) => ({
  slug,
  active,
  name,
  category: 'flags',
  badge: 'Custom Printed',
  emoji: '🚩',
  ...(gallery ? { gallery: [...gallery, ...FLAG_SHARED_FIGURES] } : {}),
  tagline: `Custom printed ${shape} advertising flag — full-colour dye sublimation, pole + base or graphic only.`,
  description: intro,
  features: [
    'Full-colour dye-sublimated print',
    'Single- or double-sided printing',
    'Lightweight portable pole hardware, tool-free assembly',
    'Choice of spike, cross or metal-plate base',
    'Replaceable graphic — reuse the hardware',
    'Indoor or outdoor advertising'
  ],
  applications: ['Storefronts and grand openings', 'Trade shows and events', 'Roadside and parking-lot promotion', 'Marking a booth alongside a canopy'],
  specs: [
    ['Shape', `${shape} flag`],
    ['Sizes', sizes.map((s) => s.label).join(', ')],
    ['Print', 'Full-colour dye sublimation, single- or double-sided'],
    ['Hardware', 'Flexible pole kit + base (spike / cross / metal plate)'],
    ['Graphic', 'Replaceable'],
    ['Production', '6–8 business days standard, 2–3 day rush (production time, not delivery)']
  ],
  turnaround: 'Production: 6–8 business days standard, 2–3 days rush. Shipping additional.',
  related: ['custom-canopies', 'standard-retractable-banner', 'x-stand-banner'],
  seoTitle,
  seoDescription,
  faqs: [
    { q: 'What is the difference between "with hardware" and "graphic only"?', a: 'With hardware includes the flexible pole kit and a base so the flag is ready to fly. Graphic only is the printed flag on its own — for customers who already own compatible hardware.' },
    { q: 'Single-sided or double-sided?', a: 'Single-sided prints the front in full colour; the reverse shows a mirrored print-through. Double-sided prints two separate faces with a blockout layer between them so each side reads correctly.' },
    { q: 'Which base should I choose?', a: 'A spike base (included) pushes into grass for outdoor use. A cross base or metal plate base (small upcharge) weighs the flag down on hard floors indoors.' },
    { q: 'How long does production take?', a: 'Standard production is 6–8 business days after proof approval; rush is 2–3 business days. This is production time — shipping/transit is additional.' }
  ],
  pricing: {
    model: 'configured',
    baseLabel: name,
    matrixGroups: ['pkg', 'size', 'sides', 'days'],
    priceMatrix: FLAG_MATRIX,
    optionGroups: [
      { id: 'pkg', label: 'What you get', type: 'select', pricing: 'matrix',
        help: 'With hardware = printed flag + pole kit + base. Graphic only = the printed flag on its own.',
        choices: [
          { id: 'hw', label: 'With hardware (pole + base)', default: true },
          { id: 'go', label: 'Graphic only' }
        ] },
      { id: 'size', label: 'Size', type: 'select', pricing: 'matrix', choices: sizes },
      { id: 'sides', label: 'Printing', type: 'select', pricing: 'matrix',
        help: 'Single-sided: full-colour front, mirrored print-through on the reverse. Double-sided: two separate printed faces with a blockout layer.',
        choices: [
          { id: 'single', label: 'Single-sided', default: true },
          { id: 'double', label: 'Double-sided' }
        ] },
      { id: 'days', label: 'Production', type: 'select', pricing: 'matrix',
        help: 'Production time after proof approval — not delivery time. Rush is 2–3 business days.',
        choices: [
          { id: 'std', label: '6–8 business days', default: true },
          { id: 'rush', label: '2–3 business days (rush)' }
        ] },
      flagBaseGroup,
      designGroup
    ]
  }
});

const featherSizes = [
  { id: 'sm', label: 'Small — 9 ft', default: true },
  { id: 'md', label: 'Medium — 10.5 ft' },
  { id: 'lg', label: 'Large — 14 ft' }
];
const teardropSizes = [
  { id: 'sm', label: 'Small — 7 ft', default: true },
  { id: 'md', label: 'Medium — 9 ft' },
  { id: 'lg', label: 'Large — 11.2 ft' }
];

const flagProducts = [
  flagProduct({
    slug: 'feather-angled-flag', name: 'Feather Angled Flag', shape: 'angled feather', sizes: featherSizes,
    active: true,
    gallery: [
      { src: '/images/flags/feather_angled_flag_taco_vista_large_cross_base.png', alt: 'Apex angled feather flag with a custom printed graphic on a cross base' },
      { src: '/images/flags/feather_angled_flag_nova_dental_large_ground_stake.png', alt: 'Apex angled feather flag on a ground spike, custom printed' },
      { src: '/images/flags/feather_angled_size_measurements_all_sizes.jpg', alt: 'Apex angled feather flag size chart — small 9 ft, medium 10.5 ft, large 14 ft' },
      { src: '/images/flags/feather_angled_hardware_cross_base.jpg', alt: 'Apex feather flag cross-base hardware' },
      { src: '/images/flags/feather_angled_install_step_3_slide_flag_onto_pole.jpg', alt: 'Installing an Apex feather flag — sliding the printed flag onto the pole' }
    ],
    seoTitle: 'Custom Feather Angled Flags | Printed Advertising Flags',
    seoDescription: 'Custom printed angled feather flags in 9, 10.5 and 14 ft — full-colour dye sublimation, single or double sided, pole + base or graphic only. From $140.',
    intro: 'A custom printed angled feather flag — the tall, curved-top advertising flag whose canopy angles forward over the pole so your branding stays visible even in light wind. Full-colour dye sublimation on a flexible pole, with a choice of base for grass or hard floors.'
  }),
  flagProduct({
    slug: 'feather-straight-flag', name: 'Feather Straight Flag', shape: 'straight feather', sizes: featherSizes,
    seoTitle: 'Custom Feather Straight Flags | Printed Advertising Flags',
    seoDescription: 'Custom printed straight feather flags in 9, 10.5 and 14 ft — full-colour dye sublimation, single or double sided, pole + base or graphic only. From $140.',
    intro: 'A custom printed straight feather flag — a tall vertical advertising flag with a straight top edge for a clean, upright branded profile. Full-colour dye sublimation on a flexible pole, with a choice of base for grass or hard floors.'
  }),
  flagProduct({
    slug: 'feather-convex-flag', name: 'Feather Convex Flag', shape: 'convex feather', sizes: featherSizes,
    active: true,
    gallery: [
      { src: '/images/flags/feather_convex_flag_solis_spa_large_cross_base.png', alt: 'Apex convex feather flag with a rounded convex top edge, custom printed on a cross base' },
      { src: '/images/flags/feather_convex_size_measurements_all_sizes.jpg', alt: 'Apex convex feather flag size chart — small 9 ft, medium 10.5 ft, large 14 ft' },
      { src: '/images/flags/feather_convex_hardware_cross_base.jpg', alt: 'Apex feather flag cross-base hardware' },
      { src: '/images/flags/feather_convex_install_step_3_slide_flag_onto_pole.jpg', alt: 'Installing an Apex feather flag onto the pole' }
    ],
    seoTitle: 'Custom Convex Feather Flags | Printed Advertising Flags',
    seoDescription: 'Custom printed convex feather flags in 9, 10.5 and 14 ft — full-colour dye sublimation, single or double sided, pole + base or graphic only. From $140.',
    intro: 'A custom printed convex feather flag — a tall flag with a gently curved (convex) top edge for a soft, rounded branded silhouette. Full-colour dye sublimation on a flexible pole, with a choice of base for grass or hard floors.'
  }),
  flagProduct({
    slug: 'teardrop-flag', name: 'Teardrop Flag', shape: 'teardrop', sizes: teardropSizes,
    active: true,
    gallery: [
      { src: '/images/flags/teardrop_flag_summit_coffee_large_cross_base.png', alt: 'Apex teardrop flag with a custom printed graphic on a cross base' },
      { src: '/images/flags/teardrop_flag_bluesky_realty_large_ground_stake.png', alt: 'Apex teardrop flag on a ground spike, custom printed' },
      { src: '/images/flags/teardrop_flag_peakfit_gym_large_square_base.png', alt: 'Apex teardrop flag on a square steel base, custom printed' },
      { src: '/images/flags/teardrop_size_measurements_all_sizes.jpg', alt: 'Apex teardrop flag size chart — small 7 ft, medium 9 ft, large 11.2 ft' },
      { src: '/images/flags/teardrop_hardware_cross_base.jpg', alt: 'Apex teardrop flag cross-base hardware' },
      { src: '/images/flags/teardrop_install_step_3_slide_flag_onto_pole.jpg', alt: 'Installing an Apex teardrop flag onto the pole' }
    ],
    seoTitle: 'Custom Teardrop Flags | Printed Advertising Banners',
    seoDescription: 'Custom printed teardrop flags in 7, 9 and 11.2 ft — full-colour dye sublimation, single or double sided, pole + base or graphic only. From $140.',
    intro: 'A custom printed teardrop flag — a compact, rounded teardrop profile that holds its shape well in wind and reads clearly from a distance. Full-colour dye sublimation on a flexible pole, with a choice of base for grass or hard floors.'
  })
];

// ─── Straight Tension Fabric Display (staged; active:false until real imagery).
// Explicit price LOOKUP MATRIX from the supplied sheet — NO formulas. Key:
// package | size | sides | production. The three "graphic only / double-sided /
// rush" cells held a placeholder (-400) with no real price, so they are OMITTED
// from the matrix — the engine guard makes them a quote (never $0, never -400).
const TENSION_MATRIX = {
  'hw|8ft|single|rush': 774, 'hw|8ft|single|std': 645, 'hw|8ft|double|rush': 889, 'hw|8ft|double|std': 699,
  'go|8ft|single|rush': 374, 'go|8ft|single|std': 245, /* go|8ft|double|rush omitted */ 'go|8ft|double|std': 489,
  'hw|10ft|single|rush': 894, 'hw|10ft|single|std': 745, 'hw|10ft|double|rush': 1009, 'hw|10ft|double|std': 799,
  'go|10ft|single|rush': 494, 'go|10ft|single|std': 345, /* go|10ft|double|rush omitted */ 'go|10ft|double|std': 609,
  'hw|20ft|single|rush': 1734, 'hw|20ft|single|std': 1445, 'hw|20ft|double|rush': 1849, 'hw|20ft|double|std': 1499,
  'go|20ft|single|rush': 1334, 'go|20ft|single|std': 1045, /* go|20ft|double|rush omitted */ 'go|20ft|double|std': 1449
};

const tensionDisplay = {
  slug: 'straight-tension-fabric-display',
  active: false,
  name: 'Straight Tension Fabric Display',
  category: 'backdrops',
  badge: 'Custom Printed',
  emoji: '🖼️',
  tagline: 'Floor-standing straight tension fabric backdrop — pillowcase graphic over a lightweight aluminium frame.',
  description:
    'A straight tension fabric display — a floor-standing trade-show backdrop where a dye-sublimated "pillowcase" fabric graphic zips over a lightweight aluminium tube frame for a smooth, seamless, frameless wall. Packs into a carry bag and sets up tool-free with stabilising feet.',
  size: '8–20 ft wide × ~8 ft tall',
  features: [
    'Lightweight aluminium tube frame',
    'Pillowcase-style tension fabric graphic with zipper closure',
    'Smooth, seamless, frameless finish',
    'Stabilising feet; tool-free setup',
    'Single- or double-sided graphics',
    'Replaceable graphic; packs into a carry bag'
  ],
  applications: ['Trade show and expo backwalls', 'Conference and event backdrops', 'Retail and lobby branding', 'Press and photo walls'],
  specs: [
    ['Type', 'Straight tension fabric display (floor-standing)'],
    ['Sizes', '8 ft, 10 ft and 20 ft wide, approx. 8 ft tall'],
    ['Frame', 'Lightweight aluminium tube'],
    ['Graphic', 'Dye-sublimated tension fabric, single- or double-sided, replaceable'],
    ['Setup', 'Tool-free; stabilising feet; carry bag'],
    ['Production', '6–8 business days standard, 2–3 day rush (production time, not delivery)']
  ],
  turnaround: 'Production: 6–8 business days standard, 2–3 days rush. Shipping additional.',
  related: ['step-and-repeat-backdrop', 'standard-retractable-banner', 'pleated-table-covers', 'hard-case-podium'],
  seoTitle: 'Straight Tension Fabric Display | Custom Trade Show Backdrop',
  seoDescription:
    'Custom straight tension fabric display — 8, 10 and 20 ft wide pillowcase fabric backdrops on a lightweight aluminium frame. Single or double sided, graphic + frame or graphic only.',
  faqs: [
    { q: 'What is a tension fabric display?', a: 'A floor-standing backdrop where a stretch dye-sublimated fabric graphic zips over a lightweight aluminium tube frame — like a pillowcase — for a smooth, seamless, frameless wall.' },
    { q: 'What does "graphic + frame" vs "graphic only" mean?', a: '"Graphic + frame" includes the aluminium frame and the printed fabric, ready to set up. "Graphic only" is a replacement fabric graphic for a frame you already own.' },
    { q: 'Single- or double-sided?', a: 'Both are available. Single-sided prints one face; double-sided prints two separate faces. Some rush double-sided sizes are quoted per order — the configurator will say so and route you to a quote.' },
    { q: 'How long does production take?', a: 'Standard production is 6–8 business days after proof approval; rush is 2–3 business days. This is production time — shipping is additional.' }
  ],
  pricing: {
    model: 'configured',
    baseLabel: 'Tension fabric display',
    matrixGroups: ['pkg', 'size', 'sides', 'days'],
    priceMatrix: TENSION_MATRIX,
    optionGroups: [
      { id: 'pkg', label: 'What you get', type: 'select', pricing: 'matrix',
        help: 'Graphic + frame includes the aluminium frame and printed fabric. Graphic only is a replacement fabric for a frame you own.',
        choices: [
          { id: 'hw', label: 'Graphic + frame', default: true },
          { id: 'go', label: 'Graphic only' }
        ] },
      { id: 'size', label: 'Size', type: 'select', pricing: 'matrix',
        choices: [
          { id: '8ft', label: '8 ft wide × ~8 ft tall', default: true },
          { id: '10ft', label: '10 ft wide × ~8 ft tall' },
          { id: '20ft', label: '20 ft wide × ~8 ft tall' }
        ] },
      { id: 'sides', label: 'Printing', type: 'select', pricing: 'matrix',
        help: 'Some rush double-sided graphic-only configurations are quoted per order.',
        choices: [
          { id: 'single', label: 'Single-sided', default: true },
          { id: 'double', label: 'Double-sided' }
        ] },
      { id: 'days', label: 'Production', type: 'select', pricing: 'matrix',
        help: 'Production time after proof approval — not delivery. Rush is 2–3 business days.',
        choices: [
          { id: 'std', label: '6–8 business days', default: true },
          { id: 'rush', label: '2–3 business days (rush)' }
        ] },
      designGroup
    ]
  }
};

// ─── Hard Case Podium (staged; active:false). Two explicit prices: the hard
// case with a printed graphic, or the printed graphic only.
const hardCasePodium = {
  slug: 'hard-case-podium',
  active: false,
  name: 'Hard Case Podium',
  category: 'displays',
  badge: 'Custom Printed',
  emoji: '🎙️',
  tagline: 'Wheeled hard shipping case that converts into a branded presentation podium.',
  description:
    'A wheeled hard case that doubles as a branded podium — ship your display gear inside, then wrap the case with a printed graphic to create a professional lectern at your booth. Order the complete printed hard-case podium, or just the printed graphic if you already own the case.',
  size: 'Standard hard-case podium',
  features: [
    'Wheeled hard travel case that converts to a podium',
    'Custom printed wrap graphic',
    'Doubles as shipping/storage for booth gear',
    'Professional presentation surface'
  ],
  applications: ['Trade show presentations', 'Registration and welcome desks', 'Product demos', 'Events and conferences'],
  specs: [
    ['Type', 'Hard case podium (case + printed graphic)'],
    ['Options', 'Complete hard-case podium with print, or podium print only'],
    ['Graphic', 'Custom printed wrap'],
    ['Production', '6–8 business days standard (production time, not delivery)']
  ],
  turnaround: 'Production: 6–8 business days. Shipping additional.',
  related: ['straight-tension-fabric-display', 'step-and-repeat-backdrop', 'standard-retractable-banner'],
  seoTitle: 'Hard Case Podium | Printed Trade Show Podium & Case',
  seoDescription:
    'Custom hard case podium — a wheeled travel case that converts into a branded presentation podium with a printed wrap. Order the complete podium or the print only.',
  faqs: [
    { q: 'What is the difference between the two options?', a: 'The hard case podium with print includes the wheeled hard case and the printed graphic wrap. Podium print only is the printed graphic on its own — for customers who already own the case.' },
    { q: 'Does "print only" include the case?', a: 'No. Podium print only is the printed graphic wrap only; it does not include the hard case.' }
  ],
  pricing: {
    model: 'configured',
    baseLabel: 'Hard case podium',
    optionGroups: [
      { id: 'kit', label: 'What you get', type: 'select', pricing: 'base',
        help: 'The complete hard-case podium with print, or the printed graphic only (no case).',
        choices: [
          { id: 'case', label: 'Hard case podium with print', price: 650, default: true },
          { id: 'print', label: 'Podium print only (no case)', price: 135 }
        ] },
      designGroup
    ]
  }
};

// ─── SEG Modular Illuminated Trade Show Kits (CUSTOM QUOTE only). No price is
// computed or shown (pricing.quoteOnly) — the size/plug/mockup selectors render
// and feed the quote form. NO supplier price or lead time anywhere. Staged
// active:false until Apex-approved imagery is in place. Frame is PVC and fabric
// is FR 200g backlit per the source spec (do not silently change to aluminium).
const SEG_H3 = [
  { id: 'h66', label: "6.6' H", h: '6.6' },
  { id: 'h74', label: "7.4' H", h: '7.4' },
  { id: 'h82', label: "8.2' H", h: '8.2' }
];
const SEG_H2 = [
  { id: 'h74', label: "7.4' H", h: '7.4' },
  { id: 'h82', label: "8.2' H", h: '8.2' }
];
const SEG_WIDTHS = [
  { id: 'w10', label: "10' W", w: '10' },
  { id: 'w13', label: "13' W", w: '13' },
  { id: 'w164', label: "16.4' W", w: '16.4' },
  { id: 'w20', label: "20' W", w: '20' }
];
const segSizeChoices = (heights) => {
  const out = [];
  for (const w of SEG_WIDTHS) for (const h of heights) {
    out.push({ id: `${w.id}-${h.id}`, label: `${w.w}' W × ${h.h}' H`, default: out.length === 0 });
  }
  return out;
};
const segPlugGroup = {
  id: 'plug', label: 'Plug type', type: 'select',
  help: 'Choose the power plug for your region. US plug is standard for North American shows.',
  choices: [
    { id: 'us', label: 'US plug', default: true },
    { id: 'eu', label: 'EU plug' },
    { id: 'au', label: 'AU plug' },
    { id: 'none', label: 'No plug' }
  ]
};
const segMockupGroup = {
  id: 'mockup', label: 'Need a pre-production mockup?', type: 'select',
  help: 'A digital mockup shows your artwork on the booth before production.',
  choices: [
    { id: 'no', label: 'No', default: true },
    { id: 'yes', label: 'Yes, provide a digital mockup' }
  ]
};

const segKit = ({ slug, name, letter, heights, gallery, whatsIncluded, intro, config, counter, weight, bag, seoTitle, seoDescription }) => ({
  slug,
  active: true,
  name,
  category: 'seg-kits',
  badge: 'Custom Quote',
  emoji: '🏙️',
  quoteOnly: true,
  tagline: `Premium illuminated SEG modular trade show booth kit — backlit fabric graphics on a modular lightbox frame. ${config}`,
  description: intro,
  gallery,
  features: [
    'Illuminated SEG (silicone-edge) backlit graphics',
    'Modular, reconfigurable lightbox display system',
    'Custom dye-sublimated graphics on flame-retardant 200g backlit fabric',
    'Integrated LED illumination',
    'Reusable frame — update graphics for future events',
    'Display counter integration'
  ],
  applications: ['Trade shows and exhibitions', 'Conventions and conferences', 'Corporate events and product launches', 'Retail activations and branded environments'],
  specs: [
    ['Model', name],
    ['Available overall sizes', `${SEG_WIDTHS.map((w) => w.w + "' W").join(', ')} × ${heights.map((h) => h.h + "' H").join(' / ')}`],
    ['Graphic material', 'Flame-retardant 200g backlit fabric'],
    ['Printing', 'Full-colour dye sublimation'],
    ['Graphic install', 'Silicone Edge Graphics (SEG) — sewn silicone edge, near-frameless finish'],
    ['Frame material', 'Modular PVC lightbox frame'],
    ['Assembly', 'Modular, tool-free snap-fit construction'],
    ['Lighting', 'Integrated internal LED illumination'],
    ['Display counter', counter],
    ['Approx. weight (with graphics)', weight],
    ['Carry bag', bag],
    ['Plug options', 'US / EU / AU / none'],
    ['Configuration', config]
  ],
  turnaround: 'Production and delivery timing are confirmed with your custom quote.',
  related: ['step-and-repeat-backdrop', 'straight-tension-fabric-display', 'custom-canopies', 'standard-retractable-banner', 'hard-case-podium'],
  seoTitle,
  seoDescription,
  whatsIncluded,
  faqs: [
    { q: 'What is an SEG trade show display?', a: 'SEG stands for Silicone Edge Graphics — a sewn silicone strip on the edge of the fabric presses into a channel on the frame, so the graphic sits smooth, tensioned and nearly frameless. These kits add integrated LED backlighting for illuminated graphics.' },
    { q: 'Are the graphics illuminated?', a: 'Yes — the frame is a lightbox with integrated LED illumination, so the backlit fabric graphics glow evenly for strong trade-show visibility.' },
    { q: 'Can the graphics be replaced later?', a: 'Yes. The frame is reusable — you can print new SEG fabric graphics for future events and reuse the same modular hardware.' },
    { q: 'Can I submit my own artwork, or can Apex help design it?', a: 'Both. Upload your own print-ready artwork, or ask our team for design help. Because a modular booth has several panels, you can supply artwork for each panel or send your logo and brand direction.' },
    { q: 'Which size should I choose?', a: `${name} comes in ${SEG_WIDTHS.length} widths (10, 13, 16.4 and 20 ft) and ${heights.length} heights. Match the width to your booth space and the height to the venue; not sure? Request a quote and we'll advise.` },
    { q: 'Can I request modifications to the standard configuration?', a: 'Yes — tell us your requirements (extra counters, shelving, TV mounting, custom sizes) in the quote and our team will confirm what we can supply.' },
    { q: 'Which plug type should I choose?', a: 'US plug is standard for North American events. EU, AU or no-plug options are available if you need them.' },
    { q: 'How do I get pricing?', a: 'Pricing is customised based on the selected kit, size, quantity and project requirements. Submit a quote request and our team will prepare pricing for your configuration. Production and delivery timing are confirmed with your quote.' }
  ],
  pricing: {
    model: 'configured',
    quoteOnly: true,
    baseLabel: name,
    optionGroups: [
      { id: 'size', label: 'Size', type: 'select', choices: segSizeChoices(heights) },
      segPlugGroup,
      segMockupGroup
    ]
  }
});

const segKits = [
  segKit({
    slug: 'seg-modular-trade-show-kit-a', name: 'Trade Show SEG Modular Kit A', letter: 'A', heights: SEG_H3,
    gallery: [
      { src: '/images/seg-kits/apex-seg-modular-kit-a-main.jpeg', alt: 'Apex Trade Show SEG Modular Kit A — illuminated backlit booth with backdrop, archway return and counter' },
      { src: '/images/seg-kits/apex-seg-modular-kit-a-structure.png', alt: 'Kit A structure — backdrop, single archway/return and display counter' },
      { src: '/images/seg-kits/apex-seg-modular-kit-a-included.png', alt: "Kit A included components" },
      { src: '/images/seg-kits/apex-seg-modular-kit-a-sizes.png', alt: 'Kit A size matrix and component measurements' }
    ],
    config: 'Backdrop + single illuminated archway/return + illuminated counter',
    counter: '10/13 ft: 2.8 ft W × 3.3 ft H · 16.4/20 ft: 3.3 ft W × 3.3 ft H',
    weight: '72–80 lb with graphics',
    bag: '≈ 43" L × 14" W × 8" H (varies by size)',
    intro: 'Kit A is a premium illuminated SEG modular booth built around a large backlit backdrop wall, a single illuminated archway/return that frames the space, and a matching illuminated counter — an open, welcoming layout that draws attention across the show floor with glowing edge-to-edge graphics.',
    whatsIncluded: ['Main illuminated SEG backdrop wall', 'Single illuminated archway / return section', 'Illuminated display counter', 'Custom backlit SEG fabric graphics for each panel', 'Modular PVC lightbox frame components', 'Integrated LED system and power hardware', 'Soft canvas carry bag'],
    seoTitle: 'SEG Modular Trade Show Kit A | Custom Lightbox Booth',
    seoDescription: 'Trade Show SEG Modular Kit A — a custom illuminated SEG lightbox booth with backlit backdrop, overhead archway and reception counter. 10–20 ft widths. Request a custom quote from Apex.'
  }),
  segKit({
    slug: 'seg-modular-trade-show-kit-b', name: 'Trade Show SEG Modular Kit B', letter: 'B', heights: SEG_H3,
    gallery: [
      { src: '/images/seg-kits/apex-seg-modular-kit-b-main.jpeg', alt: 'Apex Trade Show SEG Modular Kit B — illuminated booth with backdrop, side panel, overhead arch and counter' },
      { src: '/images/seg-kits/apex-seg-modular-kit-b-structure.png', alt: 'Kit B structure — backdrop, side panel/arch front, overhead arch section and counter' },
      { src: '/images/seg-kits/apex-seg-modular-kit-b-sizes.png', alt: 'Kit B size matrix and component measurements' }
    ],
    config: 'Backdrop + side panel/arch front + illuminated overhead/arch section + illuminated counter',
    counter: '10/13 ft: 2.8 ft W × 3.3 ft H · 16.4/20 ft: 3.3 ft W × 3.3 ft H',
    weight: '68–110 lb with graphics',
    bag: '≈ 46" L × 16" W × 10" H (varies by size)',
    intro: 'Kit B is a more enclosed illuminated SEG modular booth: a backlit backdrop, a side panel/arch front and an illuminated overhead/arch section are joined by an illuminated counter — ideal when you want a semi-private, fully-branded environment with more surface area for meetings and demos.',
    whatsIncluded: ['Illuminated SEG backdrop wall', 'Side panel / arch front', 'Illuminated overhead / arch section', 'Illuminated display counter', 'Custom backlit SEG fabric graphics for each panel', 'Modular PVC lightbox frame components', 'Integrated LED system and power hardware', 'Soft canvas carry bag'],
    seoTitle: 'SEG Modular Trade Show Kit B | Illuminated Booth with Side Wall',
    seoDescription: 'Trade Show SEG Modular Kit B — a custom illuminated SEG lightbox booth with backdrop, overhead archway, side privacy wall and display counter. 10–20 ft widths. Request a custom quote from Apex.'
  }),
  segKit({
    slug: 'seg-modular-trade-show-kit-c', name: 'Trade Show SEG Modular Kit C', letter: 'C', heights: SEG_H2,
    gallery: [
      { src: '/images/seg-kits/apex-seg-modular-kit-c-main.jpeg', alt: 'Apex Trade Show SEG Modular Kit C — illuminated booth with backdrop, left and right side panels and counter' },
      { src: '/images/seg-kits/apex-seg-modular-kit-c-structure.png', alt: 'Kit C structure — backdrop with left and right illuminated side panels and a counter, no overhead arch' },
      { src: '/images/seg-kits/apex-seg-modular-kit-c-sizes.png', alt: 'Kit C size matrix and component measurements' }
    ],
    config: 'Backdrop + left & right illuminated side panels + illuminated counter (no overhead arch)',
    counter: '3.3 ft W × 3.3 ft H',
    weight: '60–165 lb with graphics',
    bag: '≈ 46" L × 17" W × 13" H (varies by size)',
    intro: 'Kit C is a distinct illuminated SEG modular layout: a backlit backdrop is flanked by a left and a right illuminated side panel to form a bold, three-sided branded environment, paired with an illuminated counter. With no overhead arch, it reads as a clean, wall-forward statement that stays strong from multiple aisle directions.',
    whatsIncluded: ['Illuminated SEG backdrop wall', 'Left illuminated side panel', 'Right illuminated side panel', 'Illuminated display counter', 'Custom backlit SEG fabric graphics for each panel', 'Modular PVC lightbox frame components', 'Integrated LED system and power hardware', 'Soft canvas carry bag'],
    seoTitle: 'SEG Modular Trade Show Kit C | Angled Illuminated Booth',
    seoDescription: 'Trade Show SEG Modular Kit C — a custom illuminated SEG lightbox booth with two angled backlit walls and a display counter. 10–20 ft widths. Request a custom quote from Apex.'
  })
];

const products = [
  ...canopyTents,
  pleatedCovers,
  stretchCovers,
  ...tradeShowDisplays,
  ...flagProducts,
  tensionDisplay,
  hardCasePodium,
  ...segKits,
  // ---- Made-to-size banners (area model, per square foot) --------------------
  // Priced per sq ft from the customer's width × height with a $45 minimum charge
  // PER banner (applied before quantity). Size validation uses sorted caps
  // (orientation-independent) enforced server-side in pricing.js and mirrored in
  // the configurator. Finishing is the free welded hem + grommets only — paid
  // add-ons (pole pockets, wind slits, double-sided) are intentionally omitted
  // pending owner-confirmed rates, so nothing is invented.
  // Imagery: all four banners carry owner-supplied galleries + card thumbnails
  // (public/images/banners/).
  {
    slug: '13oz-vinyl-banner',
    active: true,
    name: '13oz Vinyl Banner',
    category: 'banners',
    badge: 'Best Seller',
    emoji: '🎯',
    tagline: 'Full-colour 13oz scrim vinyl banners, made to any size for indoor or outdoor use.',
    description:
      'Our most popular banner: durable 13oz scrim vinyl printed edge to edge in vivid, UV-stable colour. Rated for indoor and outdoor use — storefronts, events, trade shows and promotions — and finished with a welded hem and grommets every 2 ft so it is ready to hang out of the box. Made to size to the inch.',
    features: [
      '13oz matte scrim vinyl',
      'Indoor & outdoor rated, UV-stable ink',
      'Welded hem + grommets every 2 ft included',
      'Single-sided full-colour print',
      'Made to any size — up to 50 ft on one side'
    ],
    turnaround: 'Ships in 2–4 business days',
    seoTitle: '13oz Vinyl Banner | Custom Full-Colour Vinyl Banners',
    seoDescription:
      'Custom 13oz scrim vinyl banners printed to any size for indoor or outdoor use — welded hem and grommets included, UV-stable full-colour print. From $45, shipped across the US & Canada.',
    gallery: [
      { src: '/images/banners/13oz-vinyl-banner-burger-landscape.jpeg', alt: 'Custom printed 13oz vinyl landscape banner with grommets' },
      { src: '/images/banners/13oz-vinyl-banner-cafe-portrait.jpeg', alt: 'Custom printed 13oz vinyl portrait banner with grommets' },
      { src: '/images/banners/13oz-vinyl-banner-edge-finishing-options.jpeg', alt: '13oz vinyl banner edge finishing options — velcro, paper edge, webbing & D-ring, screen mesh, grommet, ivory corner and hemmed edge' }
    ],
    pricing: {
      model: 'area',
      pricePerSqFt: 2.75,
      minChargeUsd: 45,
      minAreaSqFt: 0,
      sizeSmallCapIn: 600,
      sizeLargeCapIn: 1800,
      defaultWidthIn: 72,
      defaultHeightIn: 36,
      materials: [{ id: '13oz-scrim', name: '13oz Scrim Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'hem-grommets', name: 'Welded hem + grommets every 2 ft', type: 'flat', rate: 0, default: true }
      ]
    }
  },
  {
    slug: '18oz-blockout-banner',
    active: true,
    name: '18oz Blockout Banner',
    category: 'banners',
    badge: 'Double-Sided Ready',
    emoji: '🌓',
    tagline: 'Heavy 18oz blockout vinyl with an opaque core — the choice for double-sided banners.',
    description:
      'An 18oz heavy-duty scrim with an opaque grey centre layer that blocks light from passing through, so two different prints never bleed into each other — the right pick for true double-sided banners and bright, high-traffic locations. Heavier and more tear-resistant than 13oz for long outdoor runs, street banners and building drapes. Finished with a welded hem and grommets every 2 ft.',
    features: [
      '18oz blockout scrim vinyl',
      'Opaque centre blocks light — true double-sided ready',
      'Heavy-duty for wind & long outdoor use',
      'Welded hem + grommets every 2 ft included',
      'Made to any size — up to 50 ft on one side'
    ],
    turnaround: 'Ships in 2–4 business days',
    seoTitle: '18oz Blockout Banner | Double-Sided Vinyl Banners',
    seoDescription:
      'Custom 18oz blockout vinyl banners with an opaque core for true double-sided printing — heavy-duty, UV-stable, welded hem and grommets included. From $45, shipped across the US & Canada.',
    gallery: [
      { src: '/images/banners/18oz-blockout-banner-urban-apparel-roll.jpeg', alt: 'Custom printed 18oz blockout vinyl banner rolled, showing the opaque white core and grommets' },
      { src: '/images/banners/18oz-blockout-banner-edge-finishing-options.jpeg', alt: '18oz blockout banner finishing options — velcro, webbing & D-ring, reinforced corner, hem & grommet, windslit, rope sewn and pole pocket & rope' }
    ],
    pricing: {
      model: 'area',
      pricePerSqFt: 4.0,
      minChargeUsd: 45,
      minAreaSqFt: 0,
      sizeSmallCapIn: 600,
      sizeLargeCapIn: 1800,
      defaultWidthIn: 72,
      defaultHeightIn: 36,
      materials: [{ id: '18oz-blockout', name: '18oz Blockout Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'hem-grommets', name: 'Welded hem + grommets every 2 ft', type: 'flat', rate: 0, default: true }
      ]
    }
  },
  {
    slug: 'mesh-banner',
    active: true,
    name: 'Mesh Banner',
    category: 'banners',
    badge: 'Wind Friendly',
    emoji: '🌬️',
    tagline: 'Perforated mesh vinyl that lets wind pass through — ideal for fences and building wraps.',
    description:
      'Printed on perforated mesh vinyl that lets roughly 30% of the wind pass straight through, cutting the wind load that makes solid banners flap and tear. Built for fence lines, scaffolding, stadium rails and building wraps where airflow matters, while still holding bold outdoor colour. Finished with a welded hem and grommets every 2 ft.',
    features: [
      'Perforated mesh vinyl (~30% airflow)',
      'Reduced wind load for fences & wraps',
      'Outdoor rated, UV-stable ink',
      'Welded hem + grommets every 2 ft included',
      'Made to any size — up to 50 ft on one side'
    ],
    turnaround: 'Ships in 2–4 business days',
    seoTitle: 'Mesh Banner | Perforated Wind-Resistant Vinyl Banners',
    seoDescription:
      'Custom perforated mesh banners that let wind pass through — ideal for fences, scaffolding and building wraps. UV-stable colour, welded hem and grommets included. From $45, US & Canada.',
    gallery: [
      { src: '/images/banners/mesh-banner-gift-pass-fence-lifestyle.jpeg', alt: 'Custom printed perforated mesh banner mounted on a fence, showing the mesh weave' },
      { src: '/images/banners/mesh-banner-edge-finishing-options.jpeg', alt: 'Mesh banner finishing options — premium edging, corner reinforcement, hardware attachment, velcro fastening, rope finish and pole sleeve' }
    ],
    pricing: {
      model: 'area',
      pricePerSqFt: 3.1,
      minChargeUsd: 45,
      minAreaSqFt: 0,
      sizeSmallCapIn: 600,
      sizeLargeCapIn: 1800,
      defaultWidthIn: 96,
      defaultHeightIn: 48,
      materials: [{ id: 'mesh-vinyl', name: 'Perforated Mesh Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'hem-grommets', name: 'Welded hem + grommets every 2 ft', type: 'flat', rate: 0, default: true }
      ]
    }
  },
  {
    slug: 'fabric-banner-9oz-wrinkle-free',
    active: true,
    name: '9oz Wrinkle-Free Fabric Banner',
    category: 'banners',
    badge: 'Premium',
    emoji: '🧵',
    tagline: 'Dye-sublimated 9oz wrinkle-free polyester with a premium, no-glare matte finish.',
    description:
      'A premium 9oz polyester fabric banner, dye-sublimated so the colour is bonded into the fibre for a rich, no-glare matte finish that photographs cleanly under lights. The wrinkle-free weave packs down and travels without creasing, making it ideal for indoor branding, backdrops and photo walls. Finished with sewn hem edges.',
    features: [
      '9oz wrinkle-free polyester fabric',
      'Dye-sublimated — vivid, no-glare matte',
      'Packs & travels without creasing',
      'Sewn hem finished edges',
      'Made to any size — up to 8 ft on one side'
    ],
    turnaround: 'Ships in 3–5 business days',
    seoTitle: '9oz Wrinkle-Free Fabric Banner | Dye-Sublimated Fabric Banners',
    seoDescription:
      'Custom 9oz wrinkle-free fabric banners, dye-sublimated for a rich no-glare matte finish — packs without creasing, sewn hem edges. From $45, shipped across the US & Canada.',
    gallery: [
      { src: '/images/banners/fabric-banner-9oz-aroma-blend-folded.jpeg', alt: 'Custom dye-sublimated 9oz fabric banner folded, showing the matte fabric drape and sewn hem' },
      { src: '/images/banners/fabric-banner-9oz-edge-finishing-options.jpeg', alt: '9oz fabric banner finishing options — velcro, pole pocket and hem & grommet' }
    ],
    pricing: {
      model: 'area',
      pricePerSqFt: 5.0,
      minChargeUsd: 45,
      minAreaSqFt: 0,
      sizeSmallCapIn: 96,
      sizeLargeCapIn: 1200,
      defaultWidthIn: 96,
      defaultHeightIn: 48,
      materials: [{ id: '9oz-poly', name: '9oz Wrinkle-Free Polyester', multiplier: 1 }],
      finishing: [
        { id: 'sewn-hem', name: 'Sewn hem edges', type: 'flat', rate: 0, default: true }
      ]
    }
  },
  {
    slug: 'vinyl-banners',
    active: false,
    name: 'Vinyl Banners',
    category: 'banners',
    badge: 'Best Seller',
    emoji: '🎯',
    tagline: 'Full-color 13oz vinyl banners for indoor & outdoor use.',
    description:
      'Durable 13oz scrim vinyl printed edge-to-edge in vibrant, weather-resistant ink. Perfect for storefronts, events, and promotions. Custom size to the inch.',
    features: ['Next-day production available', 'Free hem & grommets', 'Indoor / outdoor rated', 'Custom size to the inch'],
    turnaround: 'Ships in 1–2 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 3.25,
      minAreaSqFt: 6,
      defaultWidthIn: 72,
      defaultHeightIn: 36,
      minWidthIn: 12,
      maxWidthIn: 240,
      minHeightIn: 12,
      maxHeightIn: 240,
      materials: [
        { id: '13oz', name: '13oz Scrim Vinyl', multiplier: 1 },
        { id: '15oz', name: '15oz Heavy Duty Vinyl', multiplier: 1.25 },
        { id: 'blockout', name: '18oz Blockout (double-sided ready)', multiplier: 1.7 }
      ],
      finishing: [
        { id: 'grommets', name: 'Grommets every 2 ft', type: 'flat', rate: 0, default: true },
        { id: 'pole-pockets', name: 'Pole pockets (top & bottom)', type: 'perLinearFt', rate: 0.75 },
        { id: 'wind-slits', name: 'Wind slits', type: 'flat', rate: 6 },
        { id: 'reinforced', name: 'Reinforced webbing edge', type: 'perLinearFt', rate: 0.5 }
      ]
    }
  },
  {
    slug: 'mesh-banners',
    active: false,
    name: 'Mesh Banners',
    category: 'banners',
    badge: 'Wind Friendly',
    emoji: '🌬️',
    tagline: 'Perforated mesh that lets wind pass through — ideal for fences.',
    description:
      'Printed on 8oz mesh vinyl that allows ~30% airflow, reducing wind load for building wraps and fence banners while keeping bold color.',
    features: ['Great for fence lines', 'Reduced wind load', 'Free hem & grommets', 'Outdoor rated'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 3.75,
      minAreaSqFt: 6,
      defaultWidthIn: 96,
      defaultHeightIn: 48,
      minWidthIn: 12,
      maxWidthIn: 240,
      minHeightIn: 12,
      maxHeightIn: 240,
      materials: [{ id: '8oz-mesh', name: '8oz Mesh Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'grommets', name: 'Grommets every 2 ft', type: 'flat', rate: 0, default: true },
        { id: 'pole-pockets', name: 'Pole pockets (top & bottom)', type: 'perLinearFt', rate: 0.75 }
      ]
    }
  },
  {
    slug: 'fabric-banners',
    active: false,
    name: 'Fabric Banners',
    category: 'banners',
    badge: 'Premium',
    emoji: '🧵',
    tagline: 'Wrinkle-resistant polyester fabric with a premium matte finish.',
    description:
      'Dye-sublimated polyester fabric banners with rich color and no glare — a premium look for indoor branding, backdrops, and photo walls.',
    features: ['No-glare matte finish', 'Machine washable', 'Vivid dye-sublimation', 'Hem finished edges'],
    turnaround: 'Ships in 3–4 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 5.5,
      minAreaSqFt: 6,
      defaultWidthIn: 96,
      defaultHeightIn: 96,
      minWidthIn: 12,
      maxWidthIn: 200,
      minHeightIn: 12,
      maxHeightIn: 200,
      materials: [
        { id: 'poly-knit', name: '9oz Polyester Knit', multiplier: 1 },
        { id: 'poly-premium', name: '11oz Premium Poplin', multiplier: 1.2 }
      ],
      finishing: [
        { id: 'sewn-hem', name: 'Sewn hem edges', type: 'flat', rate: 0, default: true },
        { id: 'pole-pockets', name: 'Pole pockets', type: 'perLinearFt', rate: 1.0 }
      ]
    }
  },
  {
    slug: 'yard-signs',
    active: false,
    name: 'Yard Signs (Coroplast)',
    category: 'signs',
    badge: 'Fast Ship',
    emoji: '🪧',
    tagline: '4mm corrugated plastic signs — perfect for campaigns & real estate.',
    description:
      'Lightweight, waterproof 4mm coroplast yard signs printed single or double sided. Add H-stakes to plant them anywhere.',
    features: ['Single or double sided', 'Waterproof & rustproof', 'H-stakes available', 'Bulk pricing'],
    turnaround: 'Ships in 1–2 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 4.0,
      minAreaSqFt: 1.5,
      defaultWidthIn: 24,
      defaultHeightIn: 18,
      minWidthIn: 6,
      maxWidthIn: 96,
      minHeightIn: 6,
      maxHeightIn: 48,
      materials: [{ id: '4mm-coro', name: '4mm Coroplast', multiplier: 1 }],
      finishing: [
        { id: 'single-sided', name: 'Single sided print', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.6 },
        { id: 'h-stake', name: 'H-stake (per sign)', type: 'perUnit', rate: 1.5 }
      ]
    }
  },
  {
    slug: 'rigid-signs',
    active: false,
    name: 'Rigid Signs',
    category: 'signs',
    badge: 'Durable',
    emoji: '🛑',
    tagline: 'Aluminum, PVC & foam board signs for lasting indoor/outdoor use.',
    description:
      'Rigid substrate signs printed direct-to-board. Choose aluminum for long outdoor life, PVC for versatility, or foam board for lightweight indoor display.',
    features: ['Aluminum / PVC / foam', 'Scratch & fade resistant', 'Rounded corners available', 'Drill holes on request'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.5,
      minAreaSqFt: 1,
      defaultWidthIn: 24,
      defaultHeightIn: 24,
      minWidthIn: 6,
      maxWidthIn: 120,
      minHeightIn: 6,
      maxHeightIn: 96,
      materials: [
        { id: 'foam', name: '3/16" Foam Board', multiplier: 0.8 },
        { id: 'pvc', name: '3mm PVC (Sintra)', multiplier: 1 },
        { id: 'aluminum', name: '.040 Aluminum', multiplier: 1.6 }
      ],
      finishing: [
        { id: 'single-sided', name: 'Single sided print', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.7 },
        { id: 'radius-corners', name: 'Radius (rounded) corners', type: 'perUnit', rate: 1.0 },
        { id: 'drill-holes', name: 'Drill mounting holes', type: 'perUnit', rate: 0.75 }
      ]
    }
  },
  {
    slug: 'decals-stickers',
    active: false,
    name: 'Decals & Stickers',
    category: 'decals',
    badge: 'Custom Cut',
    emoji: '✨',
    tagline: 'Adhesive vinyl decals, window graphics & die-cut stickers.',
    description:
      'Contour-cut adhesive vinyl for windows, walls, floors, and vehicles. Choose a laminate for extra durability and scuff resistance.',
    features: ['Contour / die cut', 'Removable or permanent', 'Laminate options', 'Indoor & outdoor vinyl'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 7.0,
      minAreaSqFt: 0.5,
      defaultWidthIn: 12,
      defaultHeightIn: 12,
      minWidthIn: 2,
      maxWidthIn: 108,
      minHeightIn: 2,
      maxHeightIn: 300,
      materials: [
        { id: 'calendered', name: 'Calendered Vinyl (short term)', multiplier: 1 },
        { id: 'cast', name: 'Cast Vinyl (long term / vehicle)', multiplier: 1.5 },
        { id: 'perf', name: 'Perforated Window Vinyl', multiplier: 1.3 }
      ],
      finishing: [
        { id: 'gloss-lam', name: 'Gloss laminate', type: 'perSqFt', rate: 0.9 },
        { id: 'matte-lam', name: 'Matte laminate', type: 'perSqFt', rate: 0.9 },
        { id: 'contour-cut', name: 'Contour / die cut', type: 'perSqFt', rate: 0.6, default: true }
      ]
    }
  },
  {
    slug: 'feather-flags',
    active: false,
    name: 'Feather Flags',
    category: 'events',
    badge: 'Eye Catching',
    emoji: '🚩',
    tagline: 'Tall feather / teardrop flags that grab attention roadside.',
    description:
      'Dye-sublimated feather flags on knitted polyester. Sold as a complete kit with pole hardware. Add a ground stake or cross base.',
    features: ['Complete pole kit', 'Single or double sided', 'Ground spike or base', 'Swivels in the wind'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: 'small', name: 'Small — 8 ft', unitPrice: 55 },
        { id: 'medium', name: 'Medium — 11 ft', unitPrice: 72 },
        { id: 'large', name: 'Large — 14 ft', unitPrice: 89 },
        { id: 'xlarge', name: 'X-Large — 17 ft', unitPrice: 115 }
      ],
      materials: [
        { id: 'single', name: 'Single sided', multiplier: 1 },
        { id: 'double', name: 'Double sided (blockout)', multiplier: 1.4 }
      ],
      finishing: [
        { id: 'ground-stake', name: 'Ground spike base', type: 'perUnit', rate: 0, default: true },
        { id: 'cross-base', name: 'Cross base + water bag', type: 'perUnit', rate: 18 }
      ]
    }
  },
  {
    slug: 'retractable-banner-stands',
    active: false,
    name: 'Retractable Banner Stands',
    category: 'events',
    badge: 'Reusable',
    emoji: '📐',
    tagline: 'Roll-up retractable stands with printed banner + carry bag.',
    description:
      'Premium aluminum retractable stand with a printed banner that rolls into the base. Sets up in seconds — includes a padded carry bag.',
    features: ['Sets up in seconds', 'Printed banner included', 'Padded carry bag', 'Replaceable banner'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '33x80', name: '33" x 80"', unitPrice: 79 },
        { id: '36x92', name: '36" x 92"', unitPrice: 99 },
        { id: '47x80', name: '47" x 80" (wide)', unitPrice: 139 }
      ],
      materials: [
        { id: 'economy', name: 'Economy base', multiplier: 1 },
        { id: 'premium', name: 'Premium base', multiplier: 1.35 }
      ],
      finishing: [
        { id: 'stand-banner', name: 'Stand + printed banner', type: 'perUnit', rate: 0, default: true },
        { id: 'extra-banner', name: 'Extra replacement banner', type: 'perUnit', rate: 35 }
      ]
    }
  },
  {
    slug: 'table-covers',
    active: false,
    name: 'Table Covers',
    category: 'events',
    badge: 'Trade Show',
    emoji: '🎪',
    tagline: 'Custom-printed fitted & throw table covers for events.',
    description:
      'Dye-sublimated polyester table covers that fit standard folding tables. Wrinkle-resistant, machine washable, and printed full-color.',
    features: ['Fits 6 ft / 8 ft tables', 'Wrinkle resistant', 'Machine washable', 'Open or closed back'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '6ft-throw', name: '6 ft — 3-sided throw', unitPrice: 89 },
        { id: '6ft-fitted', name: '6 ft — 4-sided fitted', unitPrice: 105 },
        { id: '8ft-throw', name: '8 ft — 3-sided throw', unitPrice: 109 },
        { id: '8ft-fitted', name: '8 ft — 4-sided fitted', unitPrice: 129 }
      ],
      materials: [
        { id: 'standard', name: 'Standard poly', multiplier: 1 },
        { id: 'stretch', name: 'Stretch spandex', multiplier: 1.2 }
      ],
      finishing: [
        { id: 'full-print', name: 'Full color all-over print', type: 'perUnit', rate: 0, default: true },
        { id: 'runner', name: 'Add matching table runner', type: 'perUnit', rate: 25 }
      ]
    }
  },
  // ───────────────────────────────────────────────────────────────────────────
  // CANOPY RANGE — the active catalog.
  // Prices are USD (the base currency, see src/config/brand.js) and are
  // benchmarked against the market: a 10x20 with a printed top on a commercial
  // aluminium frame lands at $1,269 ≈ CA$1,751, and printing the inside adds
  // 40%. These are still estimates — replace with real cost/margin data.
  // ───────────────────────────────────────────────────────────────────────────
  {
    // Slug deliberately unchanged from the old product so the already-indexed
    // /products/canopy-tents URL and its inbound links keep working.
    slug: 'canopy-tents',
    active: false,
    name: 'Custom Printed Canopy Tent',
    category: 'tents',
    badge: 'Best Seller',
    emoji: '⛺',
    tagline: 'Full-colour dye-sublimated pop-up canopy — your size, frame and print coverage.',
    description:
      'A commercial-grade pop-up canopy printed edge to edge in full colour. Choose the footprint, ' +
      'frame grade and exactly how much of the tent is printed — peak, valance, inside and walls. ' +
      'Dye sublimation bonds ink into the fabric, so graphics will not crack, peel or fade.',
    features: [
      'Dye-sublimated full-bleed printing',
      'Steel, commercial or heavy-duty hex frame',
      'Sets up in minutes with no tools',
      'Free artwork proof before production'
    ],
    turnaround: 'Ships in 6–8 business days',
    pricing: {
      model: 'configured',
      optionGroups: [
        {
          id: 'size',
          label: 'Tent size',
          type: 'select',
          pricing: 'base',
          help: 'Footprint of the canopy. 10x10 is the standard vendor booth.',
          choices: [
            { id: '8x8', label: "8' × 8'", price: 749 },
            { id: '10x10', label: "10' × 10'", price: 899, default: true },
            { id: '10x15', label: "10' × 15'", price: 1149 },
            { id: '10x20', label: "10' × 20'", price: 1269 },
            { id: '13x13', label: "13' × 13'", price: 1449 },
            { id: '13x20', label: "13' × 20'", price: 1849 }
          ]
        },
        {
          id: 'frame',
          label: 'Frame grade',
          type: 'select',
          pricing: 'multiplier',
          help: 'Heavier frames survive more setups and higher wind.',
          choices: [
            { id: 'steel', label: 'Steel — economy', mult: 0.85 },
            { id: 'aluminium', label: 'Commercial aluminium', mult: 1, default: true },
            { id: 'hex', label: 'Heavy-duty hex aluminium', mult: 1.22 }
          ]
        },
        {
          id: 'print',
          label: 'Print coverage',
          type: 'select',
          pricing: 'multiplier',
          help: 'How much of the canopy carries your artwork.',
          choices: [
            { id: 'blank', label: 'Blank — no printing', mult: 0.62 },
            { id: 'top', label: 'Canopy top', mult: 1, default: true },
            { id: 'top-valance', label: 'Top + valance', mult: 1.1 },
            { id: 'top-inside', label: 'Top + valance + inside', mult: 1.4 }
          ]
        },
        {
          id: 'walls',
          label: 'Walls',
          type: 'multi',
          pricing: 'add',
          help: 'Up to four per tent. Walls attach with hook-and-loop to the frame.',
          choices: [
            { id: 'full-wall', label: 'Full wall — printed', price: 249, max: 4 },
            { id: 'half-wall', label: 'Half wall — printed', price: 179, max: 4 },
            { id: 'mesh-wall', label: 'Mesh wall', price: 159, max: 4 },
            { id: 'door-wall', label: 'Zippered door wall', price: 229, max: 2 },
            { id: 'rail-skirt', label: 'Rail skirt', price: 129, max: 4 },
            { id: 'blank-wall', label: 'Full wall — blank', price: 119, max: 4 }
          ]
        },
        {
          id: 'extras',
          label: 'Accessories',
          type: 'multi',
          pricing: 'add',
          help: 'Weights are strongly recommended — most event organisers require them.',
          choices: [
            { id: 'weight-bags', label: 'Weight bags (set of 4)', price: 89 },
            { id: 'sandbags', label: 'Sandbag set (set of 4)', price: 69 },
            { id: 'stake-kit', label: 'Stake & rope kit', price: 29 },
            { id: 'roller-bag', label: 'Wheeled carry bag', price: 79 },
            { id: 'led-kit', label: 'LED light kit', price: 119 },
            { id: 'clamps', label: 'Sidewall clamps (set of 8)', price: 24 }
          ]
        }
      ]
    }
  },
  {
    slug: 'canopy-packages',
    active: false,
    name: 'Canopy Tent Packages',
    category: 'packages',
    badge: 'Best Value',
    emoji: '📦',
    tagline: 'Tent, walls, weights and bag bundled — cheaper than buying separately.',
    description:
      'Complete booth kits built around the same printed canopy, bundled with the walls and ' +
      'accessories most vendors end up buying anyway. Every package costs less than the same ' +
      'items configured individually.',
    features: [
      'Cheaper than à-la-carte',
      'Everything needed for one booth',
      'Same dye-sublimated printing',
      'Free artwork proof before production'
    ],
    turnaround: 'Ships in 6–8 business days',
    pricing: {
      model: 'configured',
      optionGroups: [
        {
          id: 'package',
          label: 'Package',
          type: 'select',
          pricing: 'base',
          help: 'All packages include a printed canopy top.',
          choices: [
            { id: 'starter', label: 'Starter — tent + carry bag', price: 949, default: true },
            { id: 'vendor', label: 'Vendor — tent + 3 walls + weights + bag', price: 1549 },
            { id: 'pro', label: 'Pro — tent + 4 walls + weights + LED + roller bag', price: 1949 }
          ]
        },
        {
          id: 'size',
          label: 'Tent size',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: '8x8', label: "8' × 8'", mult: 0.86 },
            { id: '10x10', label: "10' × 10'", mult: 1, default: true },
            { id: '10x15', label: "10' × 15'", mult: 1.26 },
            { id: '10x20', label: "10' × 20'", mult: 1.42 }
          ]
        },
        {
          id: 'frame',
          label: 'Frame grade',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: 'steel', label: 'Steel — economy', mult: 0.9 },
            { id: 'aluminium', label: 'Commercial aluminium', mult: 1, default: true },
            { id: 'hex', label: 'Heavy-duty hex aluminium', mult: 1.18 }
          ]
        },
        {
          id: 'print',
          label: 'Print coverage',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: 'top', label: 'Canopy top', mult: 1, default: true },
            { id: 'top-valance', label: 'Top + valance', mult: 1.08 },
            { id: 'top-inside', label: 'Top + valance + inside', mult: 1.32 }
          ]
        }
      ]
    }
  },
  {
    slug: 'canopy-replacement-tops',
    active: false,
    name: 'Replacement Canopy Tops',
    category: 'tents',
    badge: 'Fits Most Frames',
    emoji: '🔁',
    tagline: 'A new printed top for the frame you already own.',
    description:
      'Replacement canopy tops printed to order and cut to fit standard pop-up frames. The most ' +
      'economical way to rebrand — keep the frame, change the graphics. Confirm your frame ' +
      'measurements before ordering; we check fit against your specs at proof stage.',
    features: [
      'Fits standard pop-up frames',
      'No frame included',
      'Dye-sublimated full colour',
      'Fit checked at proof stage'
    ],
    turnaround: 'Ships in 5–7 business days',
    pricing: {
      model: 'configured',
      optionGroups: [
        {
          id: 'size',
          label: 'Top size',
          type: 'select',
          pricing: 'base',
          help: 'Measure your existing frame corner to corner.',
          choices: [
            { id: '8x8', label: "8' × 8'", price: 329 },
            { id: '10x10', label: "10' × 10'", price: 399, default: true },
            { id: '10x15', label: "10' × 15'", price: 519 },
            { id: '10x20', label: "10' × 20'", price: 589 },
            { id: '13x13', label: "13' × 13'", price: 679 }
          ]
        },
        {
          id: 'fabric',
          label: 'Fabric',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: '600d', label: '600D polyester — standard', mult: 1, default: true },
            { id: '600d-fr', label: '600D fire-retardant certified', mult: 1.25 }
          ]
        },
        {
          id: 'print',
          label: 'Print coverage',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: 'blank', label: 'Blank — no printing', mult: 0.6 },
            { id: 'top', label: 'Canopy top', mult: 1, default: true },
            { id: 'top-valance', label: 'Top + valance', mult: 1.12 },
            { id: 'top-inside', label: 'Top + valance + inside', mult: 1.4 }
          ]
        }
      ]
    }
  },
  {
    slug: 'canopy-sidewalls',
    active: false,
    name: 'Canopy Sidewalls',
    category: 'walls',
    badge: 'Sold Separately',
    emoji: '🧱',
    tagline: 'Add walls to an existing tent — printed or blank.',
    description:
      'Individual sidewalls that attach to a standard pop-up frame with hook-and-loop. Add ' +
      'weather protection, privacy and a lot more branding surface. Sold per wall.',
    features: [
      'Sold per wall',
      'Hook-and-loop attachment',
      'Printed or blank',
      'Fits standard pop-up frames'
    ],
    turnaround: 'Ships in 4–6 business days',
    pricing: {
      model: 'configured',
      optionGroups: [
        {
          id: 'style',
          label: 'Wall style',
          type: 'select',
          pricing: 'base',
          choices: [
            { id: 'full', label: 'Full wall', price: 249, default: true },
            { id: 'half', label: 'Half wall', price: 179 },
            { id: 'mesh', label: 'Mesh wall', price: 159 },
            { id: 'door', label: 'Zippered door wall', price: 229 },
            { id: 'window', label: 'Window wall', price: 239 },
            { id: 'skirt', label: 'Rail skirt', price: 129 }
          ]
        },
        {
          id: 'length',
          label: 'Wall length',
          type: 'select',
          pricing: 'multiplier',
          help: 'Match this to the side of the tent the wall covers.',
          choices: [
            { id: '8ft', label: "8' side", mult: 0.88 },
            { id: '10ft', label: "10' side", mult: 1, default: true },
            { id: '15ft', label: "15' side", mult: 1.4 },
            { id: '20ft', label: "20' side", mult: 1.78 }
          ]
        },
        {
          id: 'print',
          label: 'Printing',
          type: 'select',
          pricing: 'multiplier',
          choices: [
            { id: 'blank', label: 'Blank — no printing', mult: 0.55 },
            { id: 'outside', label: 'Printed outside', mult: 1, default: true },
            { id: 'both', label: 'Printed both sides', mult: 1.45 }
          ]
        }
      ]
    }
  },
  {
    slug: 'canopy-accessories',
    active: false,
    name: 'Canopy Accessories',
    category: 'accessories',
    badge: 'Add-ons',
    emoji: '🧰',
    tagline: 'Weights, stakes, bags and lighting for your canopy.',
    description:
      'The hardware that keeps a canopy anchored, lit and easy to transport. Most event and ' +
      'market organisers require weights on every leg — check your venue rules before the day.',
    features: [
      'Weights required by most venues',
      'Fits standard pop-up frames',
      'Ships fast — no printing needed',
      'Sold individually or as sets'
    ],
    turnaround: 'Ships in 1–3 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: 'weight-bags', name: 'Weight bags (set of 4)', unitPrice: 89 },
        { id: 'sandbags', name: 'Sandbag set (set of 4)', unitPrice: 69 },
        { id: 'stake-kit', name: 'Stake & rope kit', unitPrice: 29 },
        { id: 'roller-bag', name: 'Wheeled carry bag', unitPrice: 79 },
        { id: 'led-kit', name: 'LED light kit', unitPrice: 119 },
        { id: 'clamps', name: 'Sidewall clamps (set of 8)', unitPrice: 24 },
        { id: 'leg-skirt', name: 'Leg skirts (set of 4)', unitPrice: 59 }
      ],
      materials: [{ id: 'standard', name: 'Standard', multiplier: 1 }],
      finishing: [
        { id: 'as-listed', name: 'As listed', type: 'perUnit', rate: 0, default: true },
        { id: 'spare-parts', name: 'Add spare parts kit', type: 'perUnit', rate: 34 }
      ]
    }
  },
  {
    slug: 'blockout-banners',
    active: false,
    name: '18oz Blockout Banner',
    category: 'banners',
    badge: 'Double Sided',
    emoji: '🌓',
    tagline: 'Opaque 18oz vinyl with a blockout core — true double-sided printing.',
    description:
      'Heavy 18oz vinyl with an opaque grey core that stops light and prevents show-through, so each side prints independently. The standard choice for hanging banners viewed from both directions.',
    features: ['Opaque blockout core', 'No show-through', 'Free hem & grommets', 'Indoor / outdoor rated'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 4.75,
      minAreaSqFt: 6,
      defaultWidthIn: 72,
      defaultHeightIn: 36,
      minWidthIn: 12,
      maxWidthIn: 240,
      minHeightIn: 12,
      maxHeightIn: 240,
      materials: [{ id: '18oz-blockout', name: '18oz Blockout Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'single-sided', name: 'Single sided print', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.75 },
        { id: 'grommets', name: 'Grommets every 2 ft', type: 'flat', rate: 0 },
        { id: 'pole-pockets', name: 'Pole pockets (top & bottom)', type: 'perLinearFt', rate: 0.75 },
        { id: 'reinforced', name: 'Reinforced webbing edge', type: 'perLinearFt', rate: 0.5 }
      ]
    }
  },
  {
    slug: 'backlit-banners',
    active: false,
    name: 'Backlit Banner',
    category: 'banners',
    badge: 'Illuminated',
    emoji: '💡',
    tagline: 'Translucent vinyl built to glow evenly in a lightbox.',
    description:
      'Printed on translucent backlit vinyl with heavier ink density so colors stay saturated when lit from behind. Sized to the inch for standard and custom lightbox frames.',
    features: ['Even light diffusion', 'Heavy ink lay-down', 'Custom size to the inch', 'Pole pockets available'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.25,
      minAreaSqFt: 4,
      defaultWidthIn: 48,
      defaultHeightIn: 72,
      minWidthIn: 12,
      maxWidthIn: 192,
      minHeightIn: 12,
      maxHeightIn: 192,
      materials: [
        { id: 'backlit-13oz', name: '13oz Translucent Backlit Vinyl', multiplier: 1 },
        { id: 'backlit-heavy', name: '15oz Heavy Backlit Vinyl', multiplier: 1.2 }
      ],
      finishing: [
        { id: 'hem', name: 'Hemmed edges', type: 'flat', rate: 0, default: true },
        { id: 'grommets', name: 'Grommets every 2 ft', type: 'flat', rate: 6 },
        { id: 'pole-pockets', name: 'Pole pockets (top & bottom)', type: 'perLinearFt', rate: 0.75 },
        { id: 'silicone-edge', name: 'Silicone edge strip (SEG frames)', type: 'perLinearFt', rate: 1.6 }
      ]
    }
  },
  {
    slug: 'indoor-banners',
    active: false,
    name: 'Indoor Banner',
    category: 'banners',
    badge: 'Value',
    emoji: '🏛️',
    tagline: 'Smooth 10oz vinyl for indoor use — the economical option.',
    description:
      'Lightweight 10oz smooth vinyl with a low-glare finish, made for indoor hanging where weather resistance is not needed. The most economical banner per square foot.',
    features: ['Smooth low-glare finish', 'Lightweight & easy to hang', 'Free hem & grommets', 'Indoor use'],
    turnaround: 'Ships in 1–2 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 2.95,
      minAreaSqFt: 6,
      defaultWidthIn: 72,
      defaultHeightIn: 36,
      minWidthIn: 12,
      maxWidthIn: 240,
      minHeightIn: 12,
      maxHeightIn: 240,
      materials: [{ id: '10oz-smooth', name: '10oz Smooth Indoor Vinyl', multiplier: 1 }],
      finishing: [
        { id: 'grommets', name: 'Grommets every 2 ft', type: 'flat', rate: 0, default: true },
        { id: 'pole-pockets', name: 'Pole pockets (top & bottom)', type: 'perLinearFt', rate: 0.75 }
      ]
    }
  },
  {
    slug: 'pole-banners',
    active: false,
    name: 'Pole Banner',
    category: 'banners',
    badge: 'Street Ready',
    emoji: '🏙️',
    tagline: 'Double-sided street pole banners with sewn pockets.',
    description:
      'Blockout vinyl banners with sewn pole pockets top and bottom, built for light-pole bracket systems on streets and campuses. Add a bracket kit to mount them.',
    features: ['Sewn pole pockets included', 'Blockout — no show-through', 'Wind slits available', 'Bracket kits available'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 5.25,
      minAreaSqFt: 4,
      defaultWidthIn: 30,
      defaultHeightIn: 84,
      minWidthIn: 12,
      maxWidthIn: 60,
      minHeightIn: 24,
      maxHeightIn: 144,
      materials: [
        { id: '18oz-blockout', name: '18oz Blockout Vinyl', multiplier: 1 },
        { id: 'poly-knit', name: '9oz Polyester Knit', multiplier: 1.15 }
      ],
      finishing: [
        { id: 'pole-pockets', name: 'Sewn pole pockets (top & bottom)', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.75 },
        { id: 'wind-slits', name: 'Wind slits', type: 'flat', rate: 6 },
        { id: 'bracket-kit', name: 'Pole bracket kit (per banner)', type: 'perUnit', rate: 42 }
      ]
    }
  },
  {
    slug: 'blockout-fabric-banners',
    active: false,
    name: 'Blockout Fabric Banner',
    category: 'banners',
    badge: 'Premium',
    emoji: '🎞️',
    tagline: 'Opaque-backed fabric — premium matte look, double-sided ready.',
    description:
      'Dye-sublimated polyester with a bonded blockout backing. Combines the no-glare premium finish of fabric with true double-sided capability for hanging displays.',
    features: ['No-glare matte finish', 'Opaque blockout backing', 'Wrinkle resistant', 'Machine washable'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.75,
      minAreaSqFt: 6,
      defaultWidthIn: 96,
      defaultHeightIn: 96,
      minWidthIn: 12,
      maxWidthIn: 200,
      minHeightIn: 12,
      maxHeightIn: 200,
      materials: [{ id: 'blockout-poly', name: '12oz Blockout Polyester', multiplier: 1 }],
      finishing: [
        { id: 'sewn-hem', name: 'Sewn hem edges', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.7 },
        { id: 'pole-pockets', name: 'Pole pockets', type: 'perLinearFt', rate: 1.0 }
      ]
    }
  },
  {
    slug: 'tension-fabric',
    active: false,
    name: 'Tension Fabric Graphic',
    category: 'banners',
    badge: 'SEG Ready',
    emoji: '🖼️',
    tagline: 'Stretch fabric graphics with a silicone edge for SEG frames.',
    description:
      'Dye-sublimated stretch polyester finished with a silicone edge gasket that seats into an SEG frame channel for a seamless, frameless look. Frame sold separately.',
    features: ['Silicone edge included', 'Seamless frameless look', 'Ships folded — no tube', 'Replaceable graphic'],
    turnaround: 'Ships in 4–6 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 7.5,
      minAreaSqFt: 6,
      defaultWidthIn: 96,
      defaultHeightIn: 90,
      minWidthIn: 12,
      maxWidthIn: 200,
      minHeightIn: 12,
      maxHeightIn: 130,
      materials: [
        { id: 'stretch-poly', name: '9oz Stretch Polyester', multiplier: 1 },
        { id: 'backlit-poly', name: 'Backlit Stretch Polyester', multiplier: 1.35 }
      ],
      finishing: [
        { id: 'silicone-edge', name: 'Silicone edge (SEG)', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.8 },
        { id: 'graphic-only', name: 'Graphic only — no frame', type: 'flat', rate: 0 }
      ]
    }
  },
  {
    slug: 'hand-banners',
    active: false,
    name: 'Hand Banner',
    category: 'banners',
    badge: 'Events',
    emoji: '🙌',
    tagline: 'Small handheld banners with wooden dowels for crowds.',
    description:
      'Compact banners finished with sewn dowel pockets and wooden handles, made for rallies, parades, race finish lines, and fan sections.',
    features: ['Wooden dowels included', 'Lightweight to hold', 'Single or double sided', 'Bulk pricing'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 4.25,
      minAreaSqFt: 3,
      defaultWidthIn: 36,
      defaultHeightIn: 24,
      minWidthIn: 12,
      maxWidthIn: 72,
      minHeightIn: 12,
      maxHeightIn: 48,
      materials: [
        { id: '13oz', name: '13oz Scrim Vinyl', multiplier: 1 },
        { id: 'poly-knit', name: '9oz Polyester Knit', multiplier: 1.2 }
      ],
      finishing: [
        { id: 'dowels', name: 'Wooden dowel handles (both sides)', type: 'perUnit', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.7 }
      ]
    }
  },
  {
    slug: 'channel-letters',
    active: false,
    name: 'Channel Letters',
    category: 'signs',
    badge: 'Storefront',
    emoji: '🔠',
    tagline: 'Dimensional lit letters for storefront signage — priced per letter.',
    description:
      'Fabricated aluminum channel letters with acrylic faces and LED illumination, priced per letter by cap height. Front-lit, reverse-lit halo, or non-illuminated.',
    features: ['Priced per letter', 'LED illuminated', 'UL listed components', 'Raceway or direct mount'],
    turnaround: 'Ships in 10–15 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '6in', name: '6" cap height (per letter)', unitPrice: 95 },
        { id: '12in', name: '12" cap height (per letter)', unitPrice: 145 },
        { id: '18in', name: '18" cap height (per letter)', unitPrice: 195 },
        { id: '24in', name: '24" cap height (per letter)', unitPrice: 265 },
        { id: '36in', name: '36" cap height (per letter)', unitPrice: 385 }
      ],
      materials: [
        { id: 'front-lit', name: 'Front-lit acrylic face', multiplier: 1 },
        { id: 'halo-lit', name: 'Reverse-lit halo', multiplier: 1.3 },
        { id: 'non-lit', name: 'Non-illuminated', multiplier: 0.65 }
      ],
      finishing: [
        { id: 'direct-mount', name: 'Direct mount pattern', type: 'perUnit', rate: 0, default: true },
        { id: 'raceway', name: 'Raceway mount (per letter)', type: 'perUnit', rate: 35 },
        { id: 'transformer', name: 'Power supply + wiring kit', type: 'perUnit', rate: 48 }
      ]
    }
  },
  {
    slug: 'real-estate-signs',
    active: false,
    name: 'Real Estate Signs',
    category: 'signs',
    badge: 'Agent Favorite',
    emoji: '🏡',
    tagline: 'Listing signs, riders & post panels for agents.',
    description:
      'Double-sided listing signs printed on coroplast, PVC, or aluminum, sized for standard real estate frames and posts. Add riders and H-stakes to complete the set.',
    features: ['Fits standard frames', 'Double sided standard', 'Riders available', 'Weatherproof'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 4.25,
      minAreaSqFt: 1.5,
      defaultWidthIn: 24,
      defaultHeightIn: 18,
      minWidthIn: 6,
      maxWidthIn: 48,
      minHeightIn: 6,
      maxHeightIn: 36,
      materials: [
        { id: '4mm-coro', name: '4mm Coroplast', multiplier: 1 },
        { id: 'pvc', name: '3mm PVC (Sintra)', multiplier: 1.4 },
        { id: 'aluminum', name: '.040 Aluminum', multiplier: 1.9 }
      ],
      finishing: [
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.6, default: true },
        { id: 'drill-holes', name: 'Drill hanging holes', type: 'perUnit', rate: 0.75 },
        { id: 'h-stake', name: 'H-stake (per sign)', type: 'perUnit', rate: 1.5 },
        { id: 'rider', name: 'Add 6" x 24" rider', type: 'perUnit', rate: 9 }
      ]
    }
  },
  {
    slug: 'a-frame-signs',
    active: false,
    name: 'A-Frames & Sign Holders',
    category: 'signs',
    badge: 'Sidewalk',
    emoji: '🅰️',
    tagline: 'Folding sidewalk A-frames with printed inserts.',
    description:
      'Weighted folding A-frame sidewalk signs with printed double-sided inserts. Fold flat for storage and swap the panels whenever the message changes.',
    features: ['Folds flat', 'Printed inserts included', 'Water-fillable base option', 'Replaceable panels'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '18x24', name: '18" x 24" A-frame', unitPrice: 89 },
        { id: '24x36', name: '24" x 36" A-frame', unitPrice: 129 },
        { id: '24x36-deluxe', name: '24" x 36" deluxe (water base)', unitPrice: 165 }
      ],
      materials: [
        { id: 'plastic', name: 'Molded plastic frame', multiplier: 1 },
        { id: 'steel', name: 'Powder-coated steel frame', multiplier: 1.4 }
      ],
      finishing: [
        { id: 'frame-inserts', name: 'Frame + 2 printed inserts', type: 'perUnit', rate: 0, default: true },
        { id: 'extra-inserts', name: 'Extra insert pair', type: 'perUnit', rate: 28 }
      ]
    }
  },
  {
    slug: 'step-repeat-backdrops',
    active: false,
    name: 'Step & Repeat Backdrops',
    category: 'displays',
    badge: 'Media Wall',
    emoji: '📸',
    tagline: 'Logo-repeat media walls with an adjustable frame.',
    description:
      'Press-wall backdrops printed on wrinkle-resistant fabric or blockout vinyl, with a telescoping frame that adjusts to the opening. Ships in a wheeled case.',
    features: ['Telescoping frame included', 'Wrinkle-resistant fabric', 'Wheeled carry case', 'Replaceable graphic'],
    turnaround: 'Ships in 4–6 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '8x8', name: '8 ft x 8 ft', unitPrice: 299 },
        { id: '10x8', name: '10 ft x 8 ft', unitPrice: 369 },
        { id: '20x8', name: '20 ft x 8 ft', unitPrice: 629 }
      ],
      materials: [
        { id: 'poly-knit', name: '9oz Polyester Knit', multiplier: 1 },
        { id: 'blockout-vinyl', name: '18oz Blockout Vinyl', multiplier: 1.15 }
      ],
      finishing: [
        { id: 'frame-graphic', name: 'Frame + printed graphic', type: 'perUnit', rate: 0, default: true },
        { id: 'graphic-only', name: 'Graphic only (no frame)', type: 'perUnit', rate: -120 },
        { id: 'carpet', name: 'Add branded floor runner', type: 'perUnit', rate: 149 }
      ]
    }
  },
  {
    slug: 'seg-displays',
    active: false,
    name: 'SEG Light Boxes',
    category: 'displays',
    badge: 'Seamless',
    emoji: '🔆',
    tagline: 'Edge-lit LED frames with silicone-edge fabric graphics.',
    description:
      'Aluminum SEG frames with edge-lit LEDs and a backlit stretch-fabric graphic that seats flush into the channel — no visible frame edge, no hot spots.',
    features: ['Edge-lit LED — even glow', 'Tool-free graphic swap', 'Freestanding or wall mount', 'Frameless finish'],
    turnaround: 'Ships in 5–8 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '2x8', name: '2 ft x 8 ft tower', unitPrice: 749 },
        { id: '4x8', name: '4 ft x 8 ft wall', unitPrice: 1149 },
        { id: '8x8', name: '8 ft x 8 ft wall', unitPrice: 1749 },
        { id: '10x8', name: '10 ft x 8 ft wall', unitPrice: 2149 }
      ],
      materials: [
        { id: 'single-sided', name: 'Single sided lightbox', multiplier: 1 },
        { id: 'double-sided', name: 'Double sided lightbox', multiplier: 1.55 }
      ],
      finishing: [
        { id: 'frame-graphic', name: 'Frame + backlit graphic', type: 'perUnit', rate: 0, default: true },
        { id: 'extra-graphic', name: 'Extra backlit graphic', type: 'perUnit', rate: 189 },
        { id: 'road-case', name: 'Add wheeled road case', type: 'perUnit', rate: 249 }
      ]
    }
  },
  {
    slug: 'trade-show-displays',
    active: false,
    name: 'Trade Show Displays',
    category: 'displays',
    badge: 'Booth Kit',
    emoji: '🎟️',
    tagline: 'Pop-up booth walls, counters & complete booth kits.',
    description:
      'Curved or straight pop-up display walls with printed fabric graphics, plus podiums and counters. Everything packs into a wheeled case that doubles as a counter base.',
    features: ['Sets up in minutes', 'Wheeled case included', 'Case converts to counter', 'Reusable graphics'],
    turnaround: 'Ships in 5–8 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '8ft-straight', name: '8 ft straight pop-up wall', unitPrice: 549 },
        { id: '10ft-curved', name: '10 ft curved pop-up wall', unitPrice: 699 },
        { id: '20ft-wall', name: '20 ft backwall', unitPrice: 1249 },
        { id: 'counter', name: 'Podium / counter only', unitPrice: 279 }
      ],
      materials: [
        { id: 'fabric', name: 'Tension fabric graphic', multiplier: 1 },
        { id: 'laminate', name: 'Laminated panel graphic', multiplier: 1.25 }
      ],
      finishing: [
        { id: 'display-graphic', name: 'Display + printed graphic', type: 'perUnit', rate: 0, default: true },
        { id: 'lights', name: 'Add LED light kit', type: 'perUnit', rate: 129 },
        { id: 'counter-add', name: 'Add matching counter', type: 'perUnit', rate: 279 }
      ]
    }
  },
  {
    slug: 'display-hardware',
    active: false,
    name: 'Hardware Only',
    category: 'displays',
    badge: 'No Print',
    emoji: '🔧',
    tagline: 'Replacement frames, bases & stands — no graphic.',
    description:
      'Bare display hardware with no printed graphic: retractable stand bases, SEG frames, X-banner stands, pole brackets, and telescoping frames. For reordering or reprinting existing graphics.',
    features: ['No graphic included', 'Fits standard graphics', 'Replacement parts', 'Ships in 1–2 days'],
    turnaround: 'Ships in 1–3 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: 'retractable-base', name: 'Retractable stand base (33")', unitPrice: 45 },
        { id: 'x-stand', name: 'X-banner stand', unitPrice: 29 },
        { id: 'seg-frame', name: 'SEG frame (per linear ft)', unitPrice: 22 },
        { id: 'telescopic-frame', name: 'Telescoping backdrop frame', unitPrice: 139 },
        { id: 'pole-bracket', name: 'Pole banner bracket kit', unitPrice: 42 }
      ],
      materials: [{ id: 'standard', name: 'Standard finish', multiplier: 1 }],
      finishing: [
        { id: 'hardware-only', name: 'Hardware only', type: 'perUnit', rate: 0, default: true },
        { id: 'carry-bag', name: 'Add padded carry bag', type: 'perUnit', rate: 22 }
      ]
    }
  },
  {
    slug: 'posters',
    active: false,
    name: 'Posters',
    category: 'large-format',
    badge: 'Fast Ship',
    emoji: '📰',
    tagline: 'Photo-quality posters on paper — gloss, matte or satin.',
    description:
      'High-resolution posters printed on heavyweight poster paper. Great for retail promos, events, and interior display. Ships rolled in a protective tube.',
    features: ['Photo-quality resolution', 'Gloss / matte / satin', 'Ships rolled in a tube', 'Bulk pricing'],
    turnaround: 'Ships in 1–2 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 3.5,
      minAreaSqFt: 1,
      defaultWidthIn: 24,
      defaultHeightIn: 36,
      minWidthIn: 8,
      maxWidthIn: 60,
      minHeightIn: 8,
      maxHeightIn: 120,
      materials: [
        { id: 'poster-paper', name: '8mil Poster Paper', multiplier: 1 },
        { id: 'photo-satin', name: '10mil Photo Satin', multiplier: 1.3 },
        { id: 'photo-gloss', name: '10mil Photo Gloss', multiplier: 1.3 }
      ],
      finishing: [
        { id: 'trim', name: 'Trimmed to size', type: 'flat', rate: 0, default: true },
        { id: 'gloss-lam', name: 'Gloss laminate', type: 'perSqFt', rate: 0.9 },
        { id: 'mount-foam', name: 'Mount to foam board', type: 'perSqFt', rate: 2.5 }
      ]
    }
  },
  {
    slug: 'wall-art',
    active: false,
    name: 'Wall Art',
    category: 'large-format',
    badge: 'Gallery',
    emoji: '🎨',
    tagline: 'Framed & mounted gallery prints for office interiors.',
    description:
      'Gallery-grade prints mounted on rigid substrate or stretched, ready to hang out of the box. Choose a float frame or a clean frameless edge.',
    features: ['Ready to hang', 'Float frame option', 'Fade-resistant inks', 'Hanging hardware included'],
    turnaround: 'Ships in 4–6 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 8.5,
      minAreaSqFt: 1,
      defaultWidthIn: 36,
      defaultHeightIn: 24,
      minWidthIn: 8,
      maxWidthIn: 96,
      minHeightIn: 8,
      maxHeightIn: 60,
      materials: [
        { id: 'dibond', name: 'Dibond Aluminum Composite', multiplier: 1 },
        { id: 'acrylic', name: 'Clear Acrylic Face Mount', multiplier: 1.5 },
        { id: 'gatorboard', name: 'Gatorboard', multiplier: 0.75 }
      ],
      finishing: [
        { id: 'frameless', name: 'Frameless clean edge', type: 'flat', rate: 0, default: true },
        { id: 'float-frame', name: 'Float frame', type: 'perLinearFt', rate: 6.5 },
        { id: 'french-cleat', name: 'French cleat hanger', type: 'perUnit', rate: 12 }
      ]
    }
  },
  {
    slug: 'wall-murals',
    active: false,
    name: 'Wall Murals',
    category: 'large-format',
    badge: 'Peel & Stick',
    emoji: '🧱',
    tagline: 'Removable wall murals printed in matching panels.',
    description:
      'Large-scale murals printed on removable adhesive fabric or textured vinyl, tiled into overlapping panels for easy hanging. Repositionable and leaves no residue.',
    features: ['Removable — no residue', 'Panelled for easy install', 'Matte or textured finish', 'Repositionable'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.25,
      minAreaSqFt: 12,
      defaultWidthIn: 120,
      defaultHeightIn: 96,
      minWidthIn: 24,
      maxWidthIn: 600,
      minHeightIn: 24,
      maxHeightIn: 144,
      materials: [
        { id: 'adhesive-fabric', name: 'Removable Adhesive Fabric', multiplier: 1 },
        { id: 'textured-vinyl', name: 'Textured Wall Vinyl', multiplier: 1.15 },
        { id: 'smooth-vinyl', name: 'Smooth Removable Vinyl', multiplier: 1.05 }
      ],
      finishing: [
        { id: 'panelled', name: 'Split into overlapping panels', type: 'flat', rate: 0, default: true },
        { id: 'matte-lam', name: 'Matte protective laminate', type: 'perSqFt', rate: 0.9 },
        { id: 'install-kit', name: 'Install kit (squeegee + guide)', type: 'perUnit', rate: 15 }
      ]
    }
  },
  {
    slug: 'canvas-prints',
    active: false,
    name: 'Canvas Prints',
    category: 'large-format',
    badge: 'Textured',
    emoji: '🖌️',
    tagline: 'Gallery-wrapped canvas on a solid wood frame.',
    description:
      'Printed on poly-cotton canvas and stretched over a kiln-dried wood frame with a gallery wrap. Also available as an unstretched roll for framing yourself.',
    features: ['Gallery wrapped', 'Kiln-dried wood frame', 'Roll option available', 'Hanging hardware included'],
    turnaround: 'Ships in 4–6 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 8.95,
      minAreaSqFt: 1,
      defaultWidthIn: 30,
      defaultHeightIn: 20,
      minWidthIn: 8,
      maxWidthIn: 96,
      minHeightIn: 8,
      maxHeightIn: 60,
      materials: [
        { id: 'poly-cotton', name: 'Poly-Cotton Matte Canvas', multiplier: 1 },
        { id: 'premium-canvas', name: 'Premium Artist Canvas', multiplier: 1.25 }
      ],
      finishing: [
        { id: 'gallery-wrap', name: 'Gallery wrap on 1.5" bars', type: 'flat', rate: 0, default: true },
        { id: 'canvas-roll', name: 'Unstretched roll (no frame)', type: 'perSqFt', rate: -2.5 },
        { id: 'satin-coat', name: 'Satin protective coating', type: 'perSqFt', rate: 0.85 }
      ]
    }
  },
  {
    slug: 'styrene',
    active: false,
    name: 'Styrene',
    category: 'large-format',
    badge: 'Lightweight',
    emoji: '📄',
    tagline: 'Thin rigid plastic for POP displays & shelf signage.',
    description:
      'Lightweight rigid styrene printed direct-to-board — thin enough to slot into shelf channels and sign holders, rigid enough to stand on its own.',
    features: ['Fits sign holders', 'Lightweight & rigid', 'Die cutting available', 'Indoor use'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 5.25,
      minAreaSqFt: 0.5,
      defaultWidthIn: 11,
      defaultHeightIn: 17,
      minWidthIn: 4,
      maxWidthIn: 48,
      minHeightIn: 4,
      maxHeightIn: 96,
      materials: [
        { id: 'styrene-20', name: '.020" Styrene', multiplier: 1 },
        { id: 'styrene-40', name: '.040" Styrene', multiplier: 1.3 },
        { id: 'styrene-60', name: '.060" Styrene', multiplier: 1.55 }
      ],
      finishing: [
        { id: 'single-sided', name: 'Single sided print', type: 'flat', rate: 0, default: true },
        { id: 'double-sided', name: 'Double sided print', type: 'multiplyArea', rate: 1.7 },
        { id: 'die-cut', name: 'Custom die cut', type: 'perSqFt', rate: 1.2 },
        { id: 'radius-corners', name: 'Radius (rounded) corners', type: 'perUnit', rate: 1.0 }
      ]
    }
  },
  {
    slug: 'backlit-film',
    active: false,
    name: 'Backlit Film',
    category: 'large-format',
    badge: 'Illuminated',
    emoji: '🔦',
    tagline: 'Translucent film for lightboxes & menu boards.',
    description:
      'Translucent polyester film printed at high ink density for lightbox inserts, menu boards, and illuminated signage. Diffuses evenly with no visible hot spots.',
    features: ['Even light diffusion', 'Menu board ready', 'Duratrans-style output', 'Trimmed to size'],
    turnaround: 'Ships in 2–4 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 8.75,
      minAreaSqFt: 1,
      defaultWidthIn: 24,
      defaultHeightIn: 36,
      minWidthIn: 6,
      maxWidthIn: 60,
      minHeightIn: 6,
      maxHeightIn: 120,
      materials: [
        { id: 'backlit-film', name: '7mil Backlit Polyester Film', multiplier: 1 },
        { id: 'duratrans', name: 'Premium Duratrans Film', multiplier: 1.35 }
      ],
      finishing: [
        { id: 'trim', name: 'Trimmed to size', type: 'flat', rate: 0, default: true },
        { id: 'diffuser', name: 'Add diffuser layer', type: 'perSqFt', rate: 1.75 }
      ]
    }
  },
  {
    slug: 'reflective-signs',
    active: false,
    name: 'Reflective Products',
    category: 'large-format',
    badge: 'DOT Grade',
    emoji: '🦺',
    tagline: 'Retroreflective signs & decals for traffic and safety.',
    description:
      'Printed on engineer- or high-intensity-grade retroreflective sheeting that returns headlight glare, for traffic control, parking, and job-site safety signage.',
    features: ['Engineer & HIP grades', 'Returns headlight glare', 'Aluminum mount available', 'Outdoor rated'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 11.5,
      minAreaSqFt: 1,
      defaultWidthIn: 18,
      defaultHeightIn: 24,
      minWidthIn: 4,
      maxWidthIn: 48,
      minHeightIn: 4,
      maxHeightIn: 96,
      materials: [
        { id: 'engineer', name: 'Engineer Grade Reflective', multiplier: 1 },
        { id: 'high-intensity', name: 'High Intensity Prismatic', multiplier: 1.6 }
      ],
      finishing: [
        { id: 'decal-only', name: 'Reflective decal only', type: 'flat', rate: 0, default: true },
        { id: 'alum-mount', name: 'Mount to .080 aluminum', type: 'perSqFt', rate: 5.5 },
        { id: 'drill-holes', name: 'Drill mounting holes', type: 'perUnit', rate: 0.75 },
        { id: 'radius-corners', name: 'Radius (rounded) corners', type: 'perUnit', rate: 1.0 }
      ]
    }
  },
  {
    slug: 'dry-erase',
    active: false,
    name: 'Dry Erase Products',
    category: 'large-format',
    badge: 'Writable',
    emoji: '🖊️',
    tagline: 'Writable dry-erase boards, calendars & planners.',
    description:
      'Custom-printed graphics under a dry-erase laminate so the surface takes marker and wipes clean. Print your own grid, calendar, or production board layout.',
    features: ['Wipes clean — no ghosting', 'Custom printed grid', 'Board or wall decal', 'Marker tray option'],
    turnaround: 'Ships in 3–5 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 9.25,
      minAreaSqFt: 2,
      defaultWidthIn: 36,
      defaultHeightIn: 24,
      minWidthIn: 8,
      maxWidthIn: 96,
      minHeightIn: 8,
      maxHeightIn: 60,
      materials: [
        { id: 'dry-erase-decal', name: 'Dry Erase Wall Decal', multiplier: 1 },
        { id: 'pvc-board', name: '3mm PVC Board', multiplier: 1.2 },
        { id: 'alum-board', name: '.040 Aluminum Board', multiplier: 1.5 }
      ],
      finishing: [
        { id: 'dry-erase-lam', name: 'Dry erase laminate', type: 'flat', rate: 0, default: true },
        { id: 'marker-tray', name: 'Add marker tray', type: 'perUnit', rate: 14 },
        { id: 'marker-kit', name: 'Add marker + eraser kit', type: 'perUnit', rate: 9 }
      ]
    }
  },
  {
    slug: 'magnets',
    active: false,
    name: 'Magnets',
    category: 'decals',
    badge: 'Vehicle',
    emoji: '🧲',
    tagline: 'Vehicle door magnets & custom-cut magnet shapes.',
    description:
      'Printed 30mil magnetic sheeting with rounded corners, sized for vehicle doors or custom cut to shape. Removable and reusable — no adhesive residue.',
    features: ['30mil magnetic sheet', 'Rounded corners standard', 'Custom cut to shape', 'Removable & reusable'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.75,
      minAreaSqFt: 0.5,
      defaultWidthIn: 24,
      defaultHeightIn: 12,
      minWidthIn: 2,
      maxWidthIn: 48,
      minHeightIn: 2,
      maxHeightIn: 48,
      materials: [
        { id: 'magnet-30', name: '30mil Magnetic Sheet', multiplier: 1 },
        { id: 'magnet-60', name: '60mil Heavy Magnetic Sheet', multiplier: 1.45 }
      ],
      finishing: [
        { id: 'radius-corners', name: 'Radius (rounded) corners', type: 'flat', rate: 0, default: true },
        { id: 'gloss-lam', name: 'Gloss laminate (UV protection)', type: 'perSqFt', rate: 0.9 },
        { id: 'contour-cut', name: 'Contour / die cut to shape', type: 'perSqFt', rate: 1.2 }
      ]
    }
  },
  {
    slug: 'window-clings',
    active: false,
    name: 'Premium Window Cling',
    category: 'decals',
    badge: 'No Adhesive',
    emoji: '🪟',
    tagline: 'Static cling vinyl — sticks with no adhesive at all.',
    description:
      'Static-cling vinyl that holds to glass by suction alone, so it peels off cleanly and can be reused. Print for the inside or outside face of the glass.',
    features: ['No adhesive — static cling', 'Peels off clean', 'Reusable', 'Inside or outside glass'],
    turnaround: 'Ships in 2–3 business days',
    pricing: {
      model: 'area',
      pricePerSqFt: 6.95,
      minAreaSqFt: 0.5,
      defaultWidthIn: 18,
      defaultHeightIn: 24,
      minWidthIn: 2,
      maxWidthIn: 54,
      minHeightIn: 2,
      maxHeightIn: 120,
      materials: [
        { id: 'clear-cling', name: 'Clear Static Cling', multiplier: 1 },
        { id: 'white-cling', name: 'White Static Cling', multiplier: 1 },
        { id: 'perf-cling', name: 'Perforated One-Way Cling', multiplier: 1.3 }
      ],
      finishing: [
        { id: 'face-print', name: 'Face print (inside glass)', type: 'flat', rate: 0, default: true },
        { id: 'reverse-print', name: 'Reverse print (outside glass)', type: 'perSqFt', rate: 0.75 },
        { id: 'contour-cut', name: 'Contour / die cut', type: 'perSqFt', rate: 0.6 }
      ]
    }
  }
];

// Quantity discount tiers (applied to the printed goods subtotal).
const quantityBreaks = [
  { min: 1, discount: 0 },
  { min: 5, discount: 0.05 },
  { min: 10, discount: 0.1 },
  { min: 25, discount: 0.18 },
  { min: 50, discount: 0.25 },
  { min: 100, discount: 0.32 }
];

export function getQuantityDiscount(quantity) {
  let discount = 0;
  for (const tier of quantityBreaks) {
    if (quantity >= tier.min) discount = tier.discount;
  }
  return discount;
}

// Products carrying `active: false` are dormant: kept in the data (so the full
// print catalog can be switched back on later) but never surfaced in nav, the
// home page, /products or the sitemap. Direct URLs still resolve, so existing
// inbound links do not break.
export function listProducts({ includeInactive = false } = {}) {
  return products
    .filter((p) => includeInactive || p.active !== false)
    .map(({ pricing, ...rest }) => {
      const disp = priceDisplayFor(pricing);
      return {
        ...rest,
        model: pricing.model,
        startingPrice: disp.startingPrice,
        // For canopy kit products the "from" price is the graphic-only column,
        // while the default configuration is the full set — surface both so the
        // UI can say what "Starting at $X" actually buys.
        startingNote: disp.startingNote || null,
        fullConfig: disp.full || null
      };
    });
}

export function getProduct(slug) {
  return products.find((p) => p.slug === slug) || null;
}

// Exported so the build can recompute "from $X" badges when a pricing override
// changes the cheapest reachable configuration.
export function startingPriceFor(pricing) {
  return estimateStartingPrice(pricing);
}

// Display context for the "Starting at $X" badge. All numbers come from the
// pricing data itself — nothing is hardcoded. For canopy kit products the
// cheapest reachable price is the GRAPHIC-ONLY column, while the configurator
// DEFAULT is the full set (canopy + frame + bag). Without a qualifier "Starting
// at $510" reads as the price of the whole kit, so we return:
//   - startingPrice : the "from" floor (unchanged)
//   - startingNote  : short label of the config that floor buys (e.g. "Graphic only")
//   - full          : { price, label } of the DEFAULT (full-set) configuration
// Non-kit products (table covers, banner stands, etc.) have no such split, so
// startingNote/full are null and the badge stays a plain "Starting at $X".
export function priceDisplayFor(pricing) {
  const startingPrice = estimateStartingPrice(pricing);
  if (startingPrice == null) return { startingPrice: null };
  if (
    pricing.model === 'configured' &&
    Array.isArray(pricing.quantityTiers) &&
    pricing.quantityTiers.length &&
    pricing.kitGroupId
  ) {
    const kit = (pricing.optionGroups || []).find((g) => g.id === pricing.kitGroupId);
    // Lowest-min tier holds the single-unit prices the "from" badge is built on.
    const tier = pricing.quantityTiers.reduce((a, b) => (b.min < a.min ? b : a));
    if (kit && tier && tier.prices) {
      const short = (label) => (label ? String(label).split('—')[0].trim() : null);
      let minId = null;
      let minVal = Infinity;
      let defId = null;
      for (const c of kit.choices || []) {
        const v = Number(tier.prices[c.id]);
        if (Number.isFinite(v) && v < minVal) {
          minVal = v;
          minId = c.id;
        }
        if (c.default) defId = c.id;
      }
      const defChoice = (kit.choices || []).find((c) => c.id === defId);
      const defVal = defChoice ? Number(tier.prices[defChoice.id]) : NaN;
      // Only annotate when the default config costs MORE than the "from" floor —
      // i.e. the floor really is a cheaper, different configuration.
      if (defChoice && Number.isFinite(defVal) && minId && minId !== defId) {
        return {
          startingPrice,
          startingNote: short(kit.choices.find((c) => c.id === minId)?.label),
          full: { price: Math.round(defVal), label: defChoice.label }
        };
      }
    }
  }
  return { startingPrice };
}

function estimateStartingPrice(pricing) {
  // Quote-only products carry no price; the card/pages show "Request a Quote".
  if (pricing.model === 'quote' || pricing.quoteOnly) return null;
  // Competitive products: cheapest variant priced from its competitorPrice.
  // If none are filled in yet, null → "Request a Quote".
  if (pricing.model === 'competitive') {
    const prices = (pricing.variants || [])
      .map((v) => calculateCompetitivePrice(competitorCurrentPrice(v), pricing.discountPercent))
      .filter((n) => n != null);
    return prices.length ? Math.round(Math.min(...prices)) : null;
  }
  if (pricing.model === 'configured') {
    // Cheapest reachable build: smallest base, lowest multiplier on every axis,
    // no add-ons. A genuine floor for "from $X".
    const groups = pricing.optionGroups || [];
    let price;
    if (pricing.priceMatrix) {
      // "From" = the cheapest entry in the price matrix.
      const vals = Object.values(pricing.priceMatrix).map(Number).filter(Number.isFinite);
      price = vals.length ? Math.min(...vals) : 0;
    } else if (Array.isArray(pricing.quantityTiers) && pricing.quantityTiers.length) {
      // "From" = the cheapest single-unit (lowest-min) tier price — the graphic-
      // only column when a kit price table is present.
      const entry = pricing.quantityTiers.reduce((a, b) => (b.min < a.min ? b : a));
      price = entry.prices
        ? Math.min(...Object.values(entry.prices).map(Number).filter(Number.isFinite))
        : (Number(entry.price) || 0);
    } else {
      const baseGroup = groups.find((g) => g.pricing === 'base');
      const bases = (baseGroup?.choices || []).map((c) => Number(c.price)).filter(Number.isFinite);
      price = bases.length ? Math.min(...bases) : 0;
    }
    for (const g of groups) {
      if (g.pricing !== 'multiplier') continue;
      const mults = (g.choices || []).map((c) => Number(c.mult)).filter(Number.isFinite);
      if (mults.length) price *= Math.min(...mults);
    }
    return Math.round(price);
  }
  if (pricing.model === 'unit') {
    const cheapest = Math.min(...pricing.variants.map((v) => v.unitPrice));
    return Math.round(cheapest);
  }
  // A per-banner dollar minimum is the true floor ("from $X") — a small banner
  // always prices at the minimum charge regardless of the default size.
  if (pricing.minChargeUsd) return Math.round(pricing.minChargeUsd);
  const area = Math.max(
    pricing.minAreaSqFt || 0,
    (pricing.defaultWidthIn * pricing.defaultHeightIn) / 144
  );
  return Math.round(area * pricing.pricePerSqFt);
}

export { products };

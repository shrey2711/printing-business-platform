// Large-format / wholesale print catalog, modeled after trade printers like B2Sign.
// Two pricing models are supported:
//   - 'area': price scales with printed square footage (banners, signs, decals)
//   - 'unit': price is per finished piece, chosen from fixed size variants
//             (feather flags, retractable stands, table covers, tents)
//
// All prices are illustrative wholesale rates and are easy to tune in one place.

// Active categories for the canopy storefront.
export const categories = [
  { id: 'tents', name: 'Canopy Tents' },
  { id: 'packages', name: 'Packages' },
  { id: 'walls', name: 'Sidewalls' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'events', name: 'Event Add-ons' }
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
      { name: 'Custom Printed Canopy', slug: 'canopy-tents' },
      { name: 'Canopy Packages', slug: 'canopy-packages' },
      { name: 'Replacement Tops', slug: 'canopy-replacement-tops' }
    ]
  },
  {
    name: 'Walls & Sidewalls',
    items: [{ name: 'Canopy Sidewalls', slug: 'canopy-sidewalls' }]
  },
  {
    name: 'Accessories',
    items: [{ name: 'Weights, Stakes & Bags', slug: 'canopy-accessories' }]
  },
  {
    name: 'Event Add-ons',
    items: [
      { name: 'Table Covers & Throws', slug: 'table-covers' },
      { name: 'Feather & Teardrop Flags', slug: 'feather-flags' },
      { name: 'Retractable Banner Stands', slug: 'retractable-banner-stands' }
    ]
  }
];

const products = [
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
    .map(({ pricing, ...rest }) => ({
      ...rest,
      model: pricing.model,
      startingPrice: estimateStartingPrice(pricing)
    }));
}

export function getProduct(slug) {
  return products.find((p) => p.slug === slug) || null;
}

// Exported so the build can recompute "from $X" badges when a pricing override
// changes the cheapest reachable configuration.
export function startingPriceFor(pricing) {
  return estimateStartingPrice(pricing);
}

function estimateStartingPrice(pricing) {
  if (pricing.model === 'configured') {
    // Cheapest reachable build: smallest base, lowest multiplier on every axis,
    // no add-ons. A genuine floor for "from $X".
    const groups = pricing.optionGroups || [];
    const baseGroup = groups.find((g) => g.pricing === 'base');
    const bases = (baseGroup?.choices || []).map((c) => Number(c.price)).filter(Number.isFinite);
    let price = bases.length ? Math.min(...bases) : 0;
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
  const area = Math.max(
    pricing.minAreaSqFt,
    (pricing.defaultWidthIn * pricing.defaultHeightIn) / 144
  );
  return Math.round(area * pricing.pricePerSqFt);
}

export { products };

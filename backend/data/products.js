// Large-format / wholesale print catalog, modeled after trade printers like B2Sign.
// Two pricing models are supported:
//   - 'area': price scales with printed square footage (banners, signs, decals)
//   - 'unit': price is per finished piece, chosen from fixed size variants
//             (feather flags, retractable stands, table covers, tents)
//
// All prices are illustrative wholesale rates and are easy to tune in one place.

export const categories = [
  { id: 'banners', name: 'Banners' },
  { id: 'signs', name: 'Signs & Boards' },
  { id: 'displays', name: 'Displays & Stands' },
  { id: 'flags', name: 'Flags' },
  { id: 'events', name: 'Events & Trade Show' },
  { id: 'decals', name: 'Decals & Stickers' }
];

// Left-hand catalog navigation groups, modeled after B2Sign's sidebar.
export const navGroups = [
  {
    name: 'Banners',
    items: [
      { name: '13oz Vinyl Banner', slug: 'vinyl-banners' },
      { name: 'Mesh Banner', slug: 'mesh-banners' },
      { name: 'Fabric Banner', slug: 'fabric-banners' }
    ]
  },
  {
    name: 'Signs & Rigid',
    items: [
      { name: 'Coroplast Yard Signs', slug: 'yard-signs' },
      { name: 'Aluminum / PVC / Foam', slug: 'rigid-signs' }
    ]
  },
  {
    name: 'Displays & Stands',
    items: [
      { name: 'Retractable Banner Stands', slug: 'retractable-banner-stands' }
    ]
  },
  {
    name: 'Flags',
    items: [{ name: 'Feather Flags', slug: 'feather-flags' }]
  },
  {
    name: 'Events & Trade Show',
    items: [
      { name: 'Table Covers', slug: 'table-covers' },
      { name: 'Canopy Tents', slug: 'canopy-tents' }
    ]
  },
  {
    name: 'Adhesive & Decals',
    items: [{ name: 'Decals & Stickers', slug: 'decals-stickers' }]
  }
];

const products = [
  {
    slug: 'vinyl-banners',
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
    category: 'flags',
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
    category: 'displays',
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
  {
    slug: 'canopy-tents',
    name: 'Canopy Tents',
    category: 'events',
    badge: 'Outdoor',
    emoji: '⛺',
    tagline: 'Custom-printed pop-up canopy tents for outdoor events.',
    description:
      'Full-color printed pop-up tents with an aluminum or steel frame. Great for markets, fairs, and sporting events. Add walls and a carry bag.',
    features: ['Pop-up frame included', 'Full canopy print', 'Wheeled carry bag', 'Optional side walls'],
    turnaround: 'Ships in 5–7 business days',
    pricing: {
      model: 'unit',
      variants: [
        { id: '10x10', name: '10 ft x 10 ft', unitPrice: 349 },
        { id: '10x15', name: '10 ft x 15 ft', unitPrice: 469 },
        { id: '10x20', name: '10 ft x 20 ft', unitPrice: 599 }
      ],
      materials: [
        { id: 'steel', name: 'Steel frame', multiplier: 1 },
        { id: 'aluminum', name: 'Aluminum frame (lighter)', multiplier: 1.3 }
      ],
      finishing: [
        { id: 'canopy-only', name: 'Printed canopy only', type: 'perUnit', rate: 0, default: true },
        { id: 'half-wall', name: 'Add printed half wall', type: 'perUnit', rate: 89 },
        { id: 'full-wall', name: 'Add printed full back wall', type: 'perUnit', rate: 129 }
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

export function listProducts() {
  return products.map(({ pricing, ...rest }) => ({
    ...rest,
    model: pricing.model,
    startingPrice: estimateStartingPrice(pricing)
  }));
}

export function getProduct(slug) {
  return products.find((p) => p.slug === slug) || null;
}

function estimateStartingPrice(pricing) {
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

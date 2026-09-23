// Trade Show Booth Budget Calculator — a free planning tool.
//
// Like boothPackages.js, this file invents NO prices. It only references real
// product slugs; every dollar figure shown to the user is the live
// `startingPrice` resolved from the product catalog at render time. Products
// that are quote-only resolve to "request a quote" rather than a made-up number.
//
// The tool exists to answer the question first-time exhibitors actually ask —
// "what does a booth cost?" — honestly, including the line items people forget.

export const BOOTH_BUDGET_META = {
  slug: 'tools/booth-budget-calculator',
  nav: 'Booth Budget Calculator',
  h1: 'Trade Show Booth Budget Calculator',
  title: 'Trade Show Booth Budget Calculator — Free Cost Estimator',
  description:
    'Estimate what a trade show booth costs. Pick your booth size and what you need, and get a starting budget built from real Apex prices — plus the costs first-time exhibitors forget.'
};

// Starting points. Each preselects real product slugs; the user can change any of it.
export const BOOTH_SETUPS = [
  {
    id: 'outdoor-10x10',
    label: "Outdoor 10' × 10'",
    blurb: 'A market, fair or outdoor expo booth built around a branded canopy.',
    preselect: ['canopy-tent-10x10', 'pleated-table-covers', 'standard-retractable-banner']
  },
  {
    id: 'outdoor-10x20',
    label: "Outdoor 10' × 20'",
    blurb: 'Double-width outdoor footprint with more aisle presence.',
    preselect: ['canopy-tent-10x20', 'pleated-table-covers', 'standard-retractable-banner', 'feather-angled-flag']
  },
  {
    id: 'indoor-10x10',
    label: "Indoor 10' × 10'",
    blurb: 'A standard indoor show booth: back wall, table and a banner stand.',
    preselect: ['straight-tension-fabric-display', 'stretch-table-covers', 'standard-retractable-banner']
  },
  {
    id: 'tabletop',
    label: 'Tabletop / small format',
    blurb: 'A shared table or small career-fair setup — the cheapest way to show up.',
    preselect: ['stretch-table-covers', 'table-top-banner-stand', 'flyers-80lb-uncoated']
  }
];

// Selectable line items, grouped. Slugs must exist in the real catalog.
export const BUDGET_GROUPS = [
  {
    key: 'structure',
    title: 'Booth structure',
    note: 'The tent or back wall — usually the single biggest line item.',
    items: [
      { slug: 'canopy-tent-10x10', label: "10' × 10' Canopy Tent" },
      { slug: 'canopy-tent-10x15', label: "10' × 15' Canopy Tent" },
      { slug: 'canopy-tent-10x20', label: "10' × 20' Canopy Tent" },
      { slug: 'straight-tension-fabric-display', label: 'Straight Tension Fabric Display' },
      { slug: 'step-and-repeat-backdrop', label: 'Step & Repeat Backdrop' }
    ]
  },
  {
    key: 'table',
    title: 'Table covers',
    note: 'Nearly every booth has a table. An unbranded one wastes the surface.',
    items: [
      { slug: 'pleated-table-covers', label: 'Pleated Table Cover' },
      { slug: 'stretch-table-covers', label: 'Stretch Table Cover' }
    ]
  },
  {
    key: 'signage',
    title: 'Banner stands & signage',
    note: 'What pulls people in from the aisle. Most booths use one or two.',
    items: [
      { slug: 'standard-retractable-banner', label: 'Standard Retractable Banner Stand' },
      { slug: 'deluxe-retractable-banner', label: 'Deluxe Retractable Banner Stand' },
      { slug: 'x-stand-banner', label: 'X-Stand Banner' },
      { slug: 'table-top-banner-stand', label: 'Table Top Banner Stand' },
      { slug: '13oz-vinyl-banner', label: '13oz Vinyl Banner' }
    ]
  },
  {
    key: 'flags',
    title: 'Flags',
    note: 'Height gets you seen from across an outdoor lot.',
    items: [
      { slug: 'feather-angled-flag', label: 'Feather Angled Flag' },
      { slug: 'feather-convex-flag', label: 'Feather Convex Flag' },
      { slug: 'teardrop-flag', label: 'Teardrop Flag' }
    ]
  },
  {
    key: 'handouts',
    title: 'Handouts & essentials',
    note: 'Small spend, easy to forget until the week of the show.',
    items: [
      { slug: 'business-cards-16pt-matte', label: 'Business Cards (16pt Matte)' },
      { slug: 'flyers-80lb-uncoated', label: 'Flyers (80lb Uncoated)' },
      { slug: 'brochures-80lb-uncoated', label: 'Brochures (80lb Uncoated)' },
      { slug: 'custom-lanyards', label: 'Custom Lanyards' }
    ]
  }
];

// Costs that are NOT Apex products and that first-timers routinely miss. No
// figures are given, because they vary by show and we will not invent them.
export const FORGOTTEN_COSTS = [
  {
    title: 'Booth space itself',
    body: 'Paid to the show organiser, not to a printer. Usually the largest single cost of exhibiting and quoted per square foot.'
  },
  {
    title: 'Drayage and material handling',
    body: 'The fee the venue charges to move your freight from the dock to your booth. It surprises almost every first-time exhibitor.'
  },
  {
    title: 'Electricity, wifi and furnishings',
    body: 'Ordered from the venue separately. Ordering on site instead of in advance typically costs more.'
  },
  {
    title: 'Shipping both ways',
    body: 'Getting the booth there and home again. Reusable hardware makes this cheaper across multiple shows.'
  },
  {
    title: 'Travel and staffing',
    body: 'Flights, hotel and the days of staff time the show consumes.'
  },
  {
    title: 'Artwork and design time',
    body: 'Apex includes a free artwork proof, but someone still has to design the graphics.'
  }
];

export const BUDGET_FAQS = [
  {
    q: 'Are these prices exact?',
    a: 'They are real starting prices from our catalogue, not estimates. Your final price depends on the size, material and options you choose, so configure a product to see its exact price.'
  },
  {
    q: 'Why does the total not include the booth space?',
    a: 'Booth space is paid to the show organiser and varies enormously by show and city. This tool covers what you would spend on the display itself, then lists the other costs so nothing blindsides you.'
  },
  {
    q: 'What is the cheapest way to exhibit?',
    a: 'A branded table cover and a tabletop banner. It is a fraction of a full booth and still looks deliberate rather than improvised.'
  },
  {
    q: 'Will this hardware last more than one show?',
    a: 'The hardware is reusable. Graphics are what date — which is why many exhibitors reprint a banner between shows and keep the stand.'
  }
];

// Every slug this tool can reference, for schema and prefetching.
export const BUDGET_SLUGS = Array.from(
  new Set(BUDGET_GROUPS.flatMap((g) => g.items.map((i) => i.slug)))
);

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
      'Shop the complete trade show booth from Apex — custom canopy tents, retractable banner stands, step & repeat backdrops and table covers, printed in your brand. Free artwork proof, US & Canada.',
    intro:
      'Apex supplies every branded piece of a professional trade show booth from one place — canopy tents, banner stands, backdrops, table covers and accessories, all printed in your brand so the whole booth matches. Custom canopies are priced instantly online; banner stands, backdrops and table covers are quoted per order.',
    points: [
      'Custom canopy tents with instant online pricing and up to 3 printed walls.',
      'Retractable and X-stand banner stands for aisles, lobbies and counters.',
      'Step & repeat backdrops for event and press photography.',
      'Pleated and stretch table covers, closed back.',
      'Weights, sandbags, flags and hardware to finish the booth.'
    ]
  },
  {
    slug: 'custom-canopies',
    category: 'tents',
    nav: 'Custom Canopies',
    h1: 'Custom Canopy Tents',
    title: 'Custom Canopy Tents — 10x10, 10x15 & 10x20',
    description:
      'Custom printed pop-up canopy tents in 10x10, 10x15 and 10x20 with up to 3 printed walls and instant online pricing. Dye-sublimation print, free artwork proof, US & Canada.',
    intro:
      'Custom printed pop-up canopy tents — the branded roof over your booth. Choose 10x10, 10x15 or 10x20, add full or half printed walls, and see the price update live. Dye sublimation bonds the ink into 600D polyester over a heavy-duty aluminium hex frame, so colours will not crack, peel or fade.',
    points: [
      'Three sizes: 10x10, 10x15 and 10x20.',
      'Up to 3 printed walls, full or half height.',
      'Instant online pricing — no quote form.',
      'Free artwork proof before production.'
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
      'Custom printed banner stands from Apex — standard and deluxe retractable banners, X-stand and tabletop banners for trade shows, lobbies, counters and events. Configure size and production speed for instant online pricing.',
    intro:
      'Portable printed banner stands for aisles, entrances, counters and events. Retractable stands roll the graphic into the base for travel; the X-stand uses a lightweight X-frame; the tabletop version sits on a counter. All use a replaceable printed graphic.',
    points: [
      'Standard and Deluxe retractable banner stands (33" × 81").',
      'X-Stand banner (24" × 63") — lightweight X-frame.',
      'Table Top banner (11.5" × 17.5") for counters and desks.',
      'Replaceable graphics; quick tool-free setup.'
    ]
  },
  {
    slug: 'banners',
    category: 'banners',
    nav: 'Banners',
    h1: 'Custom Vinyl, Mesh & Fabric Banners',
    title: 'Custom Banners — Vinyl, Mesh & Fabric',
    description:
      'Made-to-size custom banners from Apex — 13oz vinyl, 18oz blockout, perforated mesh and 9oz wrinkle-free fabric. Enter your width and height for instant per-square-foot pricing, welded hem and grommets included.',
    intro:
      'Full-colour banners printed to any size you enter, priced by the square foot. Choose economical 13oz scrim vinyl, opaque 18oz blockout for double-sided prints, wind-friendly perforated mesh, or premium wrinkle-free fabric — each finished ready to hang.',
    points: [
      '13oz vinyl — the economical indoor/outdoor workhorse.',
      '18oz blockout — opaque core for true double-sided banners.',
      'Mesh — perforated for reduced wind load on fences & wraps.',
      '9oz fabric — dye-sublimated, no-glare matte finish.'
    ]
  },
  {
    slug: 'table-covers',
    category: 'table-covers',
    nav: 'Table Covers',
    h1: 'Custom Table Covers',
    title: 'Custom Table Covers — Pleated & Stretch',
    description:
      'Custom printed table covers from Apex — pleated throws and fitted stretch covers, closed back, for trade show tables, registration desks and counters. Configure size and production speed for instant online pricing.',
    intro:
      'Custom printed table covers that turn a plain table into a branded surface. Choose a pleated throw that drapes with rounded corners, or a fitted stretch cover for a tight, modern look — both closed-back (4-sided) and printed in full colour.',
    points: [
      'Pleated throws in 4, 6 and 8 ft.',
      'Fitted stretch covers in 6 and 8 ft.',
      'Closed back — covers all four sides.',
      'Wrinkle-resistant, machine washable.'
    ]
  },
  {
    slug: 'backdrops',
    category: 'backdrops',
    nav: 'Backdrops',
    h1: 'Step & Repeat Backdrops',
    title: 'Step & Repeat Backdrops',
    description:
      'Custom step & repeat backdrops from Apex — large-format fabric media walls with repeating logo branding for event and press photography, on a portable adjustable frame. Configure size, kit and production speed for instant online pricing.',
    intro:
      'Step & repeat backdrops are the branded media wall behind press, red-carpet and event photos. Print repeating logos across a large-format fabric on an adjustable, portable frame so your branding reads in every shot.',
    points: [
      'Large-format fabric on an adjustable frame.',
      'Repeating logo / step & repeat layout.',
      'Portable — packs down for transport.',
      'Replaceable graphic.'
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

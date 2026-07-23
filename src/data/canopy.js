// Size and use-case landing-page data. Shared by the React routes and
// scripts/prerender.mjs so the crawlable HTML and the hydrated app can never
// drift apart. Plain ESM, no React imports — the prerender script imports it
// directly (same pattern as src/data/states.js).

export const SIZES = [
  { slug: '8x8', label: "8' × 8'", blurb: 'The compact footprint — fits tighter market stalls and single-vendor pitches.' },
  { slug: '10x10', label: "10' × 10'", blurb: 'The standard vendor booth, and the size most event organisers allocate by default.' },
  { slug: '10x15', label: "10' × 15'", blurb: 'Half again the width, for when one table is not enough.' },
  { slug: '10x20', label: "10' × 20'", blurb: 'A double booth under one roof — the widest single-canopy span most shows allow.' },
  { slug: '13x13', label: "13' × 13'", blurb: 'A larger square footprint with more usable shade than a 10x10.' },
  { slug: '13x20', label: "13' × 20'", blurb: 'The largest pop-up we print — maximum covered area and branding surface.' }
];

export const SOLUTIONS = [
  { slug: 'vendor-market-tents', title: 'Vendor & Market Tents', blurb: 'Weekend markets and craft fairs where the booth is the whole storefront.' },
  { slug: 'trade-show-tents', title: 'Trade Show Tents', blurb: 'Outdoor expo space that has to match your indoor booth branding.' },
  { slug: 'sports-team-tents', title: 'Sports & Tailgate Tents', blurb: 'Team colours, shade for the bench, and something findable in a crowded lot.' },
  { slug: 'food-truck-tents', title: 'Food Truck & Concession Tents', blurb: 'Menu on the valance, shade over the queue.' },
  { slug: 'church-school-tents', title: 'Church & School Tents', blurb: 'Registration desks, fundraisers and open days.' },
  { slug: 'job-site-tents', title: 'Job Site & Safety Tents', blurb: 'Shade and a visible company mark on active sites.' }
];

export const getSize = (slug) => SIZES.find((s) => s.slug === slug) || null;
export const getSolution = (slug) => SOLUTIONS.find((s) => s.slug === slug) || null;

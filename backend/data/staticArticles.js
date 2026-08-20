// In-repo blog articles (evergreen buying guides).
//
// The blog is otherwise Supabase-authored (dashboard). These articles live in
// git so they are version-controlled and prerender deterministically even when
// Supabase is not configured at build. Both the public blog API (backend/app.js)
// and the prerenderer (scripts/prerender.mjs) merge these with any published
// Supabase posts; on a slug clash the static article wins.
//
// Shape matches publicPost() in backend/app.js:
//   { slug, title, excerpt, html, coverUrl, tags, seo:{title,description},
//     publishedAt, updatedAt }
// `html` is trusted, hand-authored HTML (no user input) rendered as-is.
// Only cite specs/prices that exist in backend/data/products.js — never invent.

import { listProducts } from './products.js';

// Live starting prices derived from the product catalog, so price references in
// articles never drift out of sync with the store. `startFrom(slug)` returns
// "from $X" for priced products or "Request a quote" for quote-only ones.
const _PRODUCTS = Object.fromEntries(listProducts().map((p) => [p.slug, p]));
const startFrom = (slug) => {
  const p = _PRODUCTS[slug];
  return p && p.startingPrice != null ? `from $${Number(p.startingPrice).toLocaleString('en-US')}` : 'Request a quote';
};

export const STATIC_ARTICLES = [
  {
    slug: 'standard-vs-deluxe-retractable-banner',
    title: 'Standard Retractable Banner vs Deluxe Retractable Banner: Which Should You Choose?',
    excerpt:
      'Same 33″ × 81″ graphic, different hardware. How to choose between the Apex Standard and Deluxe retractable banner stands for your booth.',
    tags: ['Buying Guide', 'Banner Stands'],
    seo: {
      title: 'Standard vs Deluxe Retractable Banner',
      description:
        'Compare the Apex Standard and Deluxe retractable banner stands — hardware, finish, portability and which fits your trade show needs. Both 33×81 in with replaceable graphics.'
    },
    coverUrl: '/images/showcase/banner-summit-outdoors.webp',
    publishedAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
    html: `
<p>Both of Apex's roll-up banner stands print the same size graphic — <strong>33″ wide × 81″ tall</strong> — and both roll that graphic into an aluminium base that pops up in seconds with no tools. So the choice between the <a href="/products/standard-retractable-banner">Standard Retractable Banner Stand</a> and the <a href="/products/deluxe-retractable-banner">Deluxe Retractable Banner Stand</a> is not about size or print. It's about the <em>hardware</em> underneath the graphic: how it looks up close, how well it travels, and how many shows it will live through.</p>

<p>Here is how the two actually differ, and who each one is for.</p>

<h2>At a glance</h2>
<table>
  <thead>
    <tr><th>&nbsp;</th><th>Standard Retractable</th><th>Deluxe Retractable</th></tr>
  </thead>
  <tbody>
    <tr><td>Graphic size</td><td>33″ × 81″</td><td>33″ × 81″</td></tr>
    <tr><td>Base</td><td>Compact aluminium with two stabilising feet</td><td>Heavier aluminium with chrome-style end caps</td></tr>
    <tr><td>Support pole</td><td>Fixed</td><td>Adjustable support pole</td></tr>
    <tr><td>Carry bag</td><td>Carry bag included</td><td>Padded bag included</td></tr>
    <tr><td>Setup</td><td>Tool-free — pops up in seconds</td><td>Tool-free — pops up in seconds</td></tr>
    <tr><td>Graphic</td><td>Replaceable printed banner</td><td>Replaceable printed banner</td></tr>
    <tr><td>Ships in</td><td>2–4 business days</td><td>2–4 business days</td></tr>
    <tr><td>Best for</td><td>Occasional use, tight budgets, spares</td><td>Frequent travel, a premium look</td></tr>
  </tbody>
</table>

<h2>Construction and hardware</h2>
<p>The Standard stand uses a compact aluminium base with two stabilising feet that fold out to keep it upright. It is light, simple and does exactly what a retractable stand needs to do.</p>
<p>The Deluxe steps up the hardware: heavier aluminium, chrome-style end caps that finish the base cleanly, and an adjustable support pole instead of a fixed one. The extra material and the end caps are what you are paying for — a base built to be handled, packed and re-packed many times.</p>

<figure class="blog-fig">
  <img src="/images/displays/deluxe-retractable-banner.webp" alt="Apex Deluxe retractable banner stand with a full-colour printed graphic, chrome-style end caps and an adjustable pole" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>The Deluxe stand — heavier base and chrome-style end caps for a finished look up close.</figcaption>
</figure>

<h2>Appearance and professional presentation</h2>
<p>From across an aisle, both stands read the same, because the graphic is identical. The difference shows up close, at the base, where visitors standing at your booth actually see it. The Standard base is functional and unobtrusive. The Deluxe base, with its chrome-style end caps, looks deliberately finished — the kind of detail that matters at a corporate booth, a showroom or a reception area where people are standing right next to it.</p>

<h2>Portability and how often you'll use it</h2>
<p>This is the deciding factor for most buyers. Both stands are portable and both include a bag, but the Deluxe ships in a <strong>padded</strong> bag and uses heavier hardware designed for repeated setup and teardown. If the stand lives in a closet and comes out twice a year, the Standard is plenty. If it travels the show circuit, gets set up weekly and rides in the back of a car or a shipping case, the Deluxe's sturdier base and padded bag are built for that life.</p>

<h2>Trade show suitability</h2>
<p>Both stands suit trade shows, conferences, lobbies and retail. A practical pattern many exhibitors use: a <strong>Deluxe</strong> as the main stand beside the booth entrance where people get close to it, and one or more <strong>Standard</strong> stands for secondary messages further back or at satellite locations. Because the graphic is the same 33″ × 81″ on both, your artwork and layout carry across them without redesign.</p>

<h2>Value: the graphic is replaceable on both</h2>
<p>On either stand the printed banner is replaceable, so the hardware is a one-time buy and you only reprint the graphic when your message changes. That reframes the decision: the Standard is the lower up-front cost; the Deluxe costs more but is built to survive more setups, which is where it earns its keep for a stand you use often. Neither is "better" in a vacuum — it depends on how hard the stand will work.</p>

<h2>Which should you choose?</h2>
<p><strong>Choose the Standard Retractable Banner if</strong> you need an affordable, portable stand for occasional events, you're buying several for a budget, or you want inexpensive spares that match your main display.</p>
<p><strong>Choose the Deluxe Retractable Banner if</strong> you exhibit often, travel with your stand, or want the more finished, premium look at a booth where visitors stand close to the base.</p>

<h3>Frequently asked questions</h3>
<p><strong>Are the two stands the same size?</strong> Yes — both print a 33″ × 81″ graphic. The difference is the base hardware, not the display size.</p>
<p><strong>Can I replace the graphic later?</strong> Yes, on both. The banner is replaceable, so you keep the hardware and only reprint when your message changes.</p>
<p><strong>Which one is more durable?</strong> The Deluxe — heavier aluminium, chrome-style end caps and a padded bag make it the better choice for frequent travel and repeated setup.</p>
<p><strong>How do I get pricing?</strong> Request a quote with your artwork and quantity and we'll send pricing and a free proof before production.</p>

<p>Ready to pick one? Compare them directly — the <a href="/products/standard-retractable-banner">Standard Retractable Banner Stand</a> and the <a href="/products/deluxe-retractable-banner">Deluxe Retractable Banner Stand</a> — or see the full <a href="/banner-stands">banner stands range</a> and the rest of our <a href="/trade-show-displays">trade show displays</a>.</p>
`
  },
  {
    slug: 'x-stand-vs-retractable-banner',
    title: 'X-Stand vs Retractable Banner: Which Banner Stand Is Right for You?',
    excerpt:
      'The X-stand is lighter and more economical; a retractable protects the graphic and looks more finished. How to choose for your booth.',
    tags: ['Buying Guide', 'Banner Stands'],
    seo: {
      title: 'X-Stand vs Retractable Banner',
      description:
        'Compare the Apex X-Stand banner (24×63 in) and retractable banner stands (33×81 in) — mechanism, durability, portability and cost — to pick the right display for your booth.'
    },
    coverUrl: '/images/showcase/xstand-volt.webp',
    publishedAt: '2026-08-11T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>Both the <a href="/products/x-stand-banner">X-Stand banner</a> and a <a href="/products/standard-retractable-banner">retractable banner stand</a> put a tall printed graphic beside your booth and set up in seconds without tools. The difference is how the banner is held up — and that one difference drives cost, durability and how the display looks.</p>

<h2>At a glance</h2>
<table>
  <thead><tr><th>&nbsp;</th><th>X-Stand Banner</th><th>Retractable Banner</th></tr></thead>
  <tbody>
    <tr><td>Graphic size</td><td>24″ × 63″</td><td>33″ × 81″</td></tr>
    <tr><td>Mechanism</td><td>Collapsible X-frame, grommets at four corners</td><td>Graphic rolls into an aluminium base</td></tr>
    <tr><td>Graphic when packed</td><td>Rolled loose or folded</td><td>Protected inside the base</td></tr>
    <tr><td>Weight / setup</td><td>Very light, folds flat</td><td>Light, tool-free pop-up</td></tr>
    <tr><td>Cost</td><td>One of the most economical displays</td><td>Higher — you're paying for the base</td></tr>
    <tr><td>Ships in</td><td>2–4 business days</td><td>2–4 business days</td></tr>
    <tr><td>Best for</td><td>Budget, high volume, quick swaps</td><td>Repeat use, a cleaner look, graphic protection</td></tr>
  </tbody>
</table>

<h2>How they hold the graphic</h2>
<p>The X-Stand is <strong>not</strong> a retractable. The banner has grommets at its four corners that hook onto a collapsible, lightweight X-shaped frame. It folds flat, weighs almost nothing and is fast to swap. A retractable stand works differently: the printed banner rolls into a weighted aluminium base and pulls up against a support pole, so the graphic is tensioned flat and tucked away when packed.</p>

<figure class="blog-fig">
  <img src="/images/displays/standard-retractable-banner.webp" alt="Apex standard retractable banner stand with the graphic rolled into an aluminium base" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>A retractable stand rolls the graphic into its base — more protection, a more finished look.</figcaption>
</figure>

<h2>Durability and graphic protection</h2>
<p>Because a retractable rolls the banner into its base, the graphic is protected in transit and stays flat and taut when deployed. An X-Stand's banner travels exposed, so it is more prone to creasing and edge wear over many shows. For a display you'll set up again and again, that protection matters.</p>

<h2>Cost and portability</h2>
<p>The X-Stand is one of the most economical portable displays we offer, and its fold-flat frame is the lightest to carry — ideal when you need several units or a cheap, grab-and-go sign. The retractable costs more because of the base, but that base is what buys you the cleaner look and the protection.</p>

<h2>Which should you choose?</h2>
<p><strong>Choose the X-Stand if</strong> budget is the priority, you need several signs, or you swap messaging often and want the lightest, cheapest option.</p>
<p><strong>Choose a retractable if</strong> you exhibit regularly, want the graphic protected between shows, and prefer the more finished look of a rolled-up stand. If you go retractable, our <a href="/blog/standard-vs-deluxe-retractable-banner">Standard vs Deluxe guide</a> helps you pick the hardware grade.</p>

<h3>Frequently asked questions</h3>
<p><strong>Is the X-Stand a retractable banner?</strong> No — it uses a collapsible X-frame and a grommet-mounted banner, not a roll-up cassette. It's lighter and more economical.</p>
<p><strong>Which lasts longer?</strong> A retractable generally protects the graphic better because it rolls into the base; an X-Stand's banner travels exposed.</p>
<p><strong>How do I get pricing?</strong> Request a quote with your artwork and quantity and we'll send pricing and a free proof before production.</p>

<p>Compare them yourself: the <a href="/products/x-stand-banner">X-Stand Banner</a> and the <a href="/products/standard-retractable-banner">Standard Retractable Banner</a>, or browse all <a href="/banner-stands">banner stands</a> and <a href="/trade-show-displays">trade show displays</a>.</p>
`
  },
  {
    slug: 'what-size-retractable-banner',
    title: 'What Size Retractable Banner Should I Buy?',
    excerpt:
      'Tabletop or full height? A quick guide to Apex retractable banner sizes — 11.5×17.5 in tabletop vs 33×81 in floor stands — and where each fits.',
    tags: ['Buying Guide', 'Banner Stands'],
    seo: {
      title: 'What Size Retractable Banner Should I Buy?',
      description:
        'Choosing a retractable banner size: tabletop (11.5×17.5 in) for counters and desks, or a full-height 33×81 in floor stand for aisles and entrances. A quick Apex sizing guide.'
    },
    coverUrl: '/images/showcase/xstand-sunset-yoga.webp',
    publishedAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-12T00:00:00.000Z',
    html: `
<p>Retractable banners come in two very different heights, and picking the right one is mostly about <em>where the banner will stand</em> — on the floor beside your booth, or on a table or counter. Here's how the Apex sizes map to those spots.</p>

<h2>The two sizes</h2>
<table>
  <thead><tr><th>Size</th><th>Dimensions</th><th>Where it works</th></tr></thead>
  <tbody>
    <tr><td><a href="/products/table-top-banner-stand">Table Top</a></td><td>11.5″ × 17.5″</td><td>Registration and welcome desks, retail and restaurant counters, exhibition tables, point of sale</td></tr>
    <tr><td><a href="/products/standard-retractable-banner">Floor — Standard</a></td><td>33″ × 81″</td><td>Aisles, booth entrances, lobbies — full-height presence you read from a distance</td></tr>
    <tr><td><a href="/products/deluxe-retractable-banner">Floor — Deluxe</a></td><td>33″ × 81″</td><td>Same footprint as Standard, premium hardware for frequent use and close-up looks</td></tr>
  </tbody>
</table>

<h2>Full-height floor stands (33″ × 81″)</h2>
<p>This is the classic trade-show banner — tall enough to read across an aisle and to frame the edge of a booth. Both the Standard and Deluxe stands print at this size; they differ only in hardware, not dimensions. If you're deciding between them, see <a href="/blog/standard-vs-deluxe-retractable-banner">Standard vs Deluxe</a>.</p>

<figure class="blog-fig">
  <img src="/images/displays/standard-retractable-banner.webp" alt="Full-height 33 by 81 inch Apex retractable banner stand beside a booth" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>A 33″ × 81″ floor stand — the standard height for aisle and entrance presence.</figcaption>
</figure>

<h2>Tabletop banners (11.5″ × 17.5″)</h2>
<p>The <a href="/products/table-top-banner-stand">Table Top banner</a> is a compact retractable that sits on a counter or table — a mini version of the floor stand. It's the right size for a registration desk, a restaurant or retail counter, or a demo table where a full-height banner would be too big.</p>

<h2>Which should you choose?</h2>
<p><strong>Go full height (33″ × 81″)</strong> for anything read at a distance — the front of a booth, an entrance, a lobby.</p>
<p><strong>Go tabletop (11.5″ × 17.5″)</strong> for close-range messaging on a surface — desks, counters and tables. Many exhibitors use both: a floor stand out front and a tabletop on the counter.</p>

<h3>Frequently asked questions</h3>
<p><strong>Can I get a size between the two?</strong> Ask about other sizes when you request a quote and we'll tell you what's available for your artwork.</p>
<p><strong>Is the tabletop a retractable too?</strong> Yes — it's a compact retractable with a small aluminium base and a replaceable graphic.</p>
<p><strong>How do I get pricing?</strong> Request a quote with your size, artwork and quantity and we'll send pricing and a free proof.</p>

<p>See the <a href="/products/table-top-banner-stand">Table Top</a>, <a href="/products/standard-retractable-banner">Standard</a> and <a href="/products/deluxe-retractable-banner">Deluxe</a> stands, or browse all <a href="/banner-stands">banner stands</a>.</p>
`
  },
  {
    slug: '6ft-vs-8ft-table-cover',
    title: '6 ft vs 8 ft Table Cover: Which Size Do You Need?',
    excerpt:
      'Match the cover to your table. A quick guide to choosing 6 ft or 8 ft custom table covers for trade shows, markets and events.',
    tags: ['Buying Guide', 'Table Covers'],
    seo: {
      title: '6 ft vs 8 ft Table Cover: Which Size?',
      description:
        'Choosing between a 6 ft and 8 ft custom table cover — how to match the size to your folding table, in pleated or stretch, closed-back and full-colour from Apex.'
    },
    coverUrl: '/images/showcase/tablecover-brightpath-dental.webp',
    publishedAt: '2026-08-13T00:00:00.000Z',
    updatedAt: '2026-08-13T00:00:00.000Z',
    html: `
<p>Table covers are sized to the table they go over, so the first question is simple: is your table a <strong>6 ft</strong> or an <strong>8 ft</strong> folding table? Those are the two standard sizes at most shows, and Apex covers are built to fit them.</p>

<h2>Match the cover to the table</h2>
<table>
  <thead><tr><th>Table</th><th>Cover size</th><th>Typical use</th></tr></thead>
  <tbody>
    <tr><td>6 ft folding table</td><td>6 ft cover</td><td>Most trade-show and market booths, registration desks</td></tr>
    <tr><td>8 ft folding table</td><td>8 ft cover</td><td>Wider counters, product displays, larger booths</td></tr>
  </tbody>
</table>
<p>Our <a href="/products/pleated-table-covers">pleated table covers</a> come in 4 ft, 6 ft and 8 ft; our <a href="/products/stretch-table-covers">stretch covers</a> come in 6 ft and 8 ft. Both are closed-back (4-sided) and printed full-colour.</p>

<h2>How to choose</h2>
<p>Measure the table, or check the label — folding tables are almost always sold as 6 ft or 8 ft. Order the cover that matches. A 6 ft cover on an 8 ft table won't reach; an 8 ft cover on a 6 ft table will pool at the ends. If you run both table sizes across events, it's common to own one of each.</p>

<figure class="blog-fig">
  <img src="/images/table-covers/stretch.webp" alt="Custom printed stretch table cover fitted tight to a trade show table" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>A fitted stretch cover pulled tight — one reason to get the size right.</figcaption>
</figure>

<h2>A note on the small (4 ft) option</h2>
<p>Pleated covers also come in a 4 ft size for compact demo or sampling tables. Stretch covers start at 6 ft.</p>

<h3>Frequently asked questions</h3>
<p><strong>How do I know my table size?</strong> Standard folding tables are 6 ft or 8 ft long; measure the top edge if you're unsure.</p>
<p><strong>Pleated or stretch?</strong> That's a separate choice about look and fit — see <a href="/blog/pleated-vs-stretch-table-cover">Pleated vs Stretch table covers</a>.</p>
<p><strong>Are they machine washable?</strong> Yes — both are wrinkle-resistant and machine washable.</p>

<p>Shop <a href="/products/pleated-table-covers">pleated</a> or <a href="/products/stretch-table-covers">stretch</a> covers, or see all <a href="/table-covers">table covers</a>.</p>
`
  },
  {
    slug: 'pleated-vs-stretch-table-cover',
    title: 'Pleated vs Stretch Table Covers: Which Look Is Right for Your Booth?',
    excerpt:
      'A draped pleated throw or a tight fitted stretch cover? Compare the two Apex table-cover styles — fit, look and use — to choose.',
    tags: ['Buying Guide', 'Table Covers'],
    seo: {
      title: 'Pleated vs Stretch Table Covers',
      description:
        'Compare Apex pleated (draped throw) and stretch (fitted) table covers — fit, look and best use. Both closed-back, full-colour, wrinkle-resistant and machine washable.'
    },
    coverUrl: '/images/showcase/tablecover-corner-cafe.webp',
    publishedAt: '2026-08-14T00:00:00.000Z',
    updatedAt: '2026-08-14T00:00:00.000Z',
    html: `
<p>Apex prints table covers in two styles — a <a href="/products/pleated-table-covers">pleated throw</a> and a <a href="/products/stretch-table-covers">fitted stretch cover</a>. Both are closed-back (all four sides), full-colour dye-sublimated, wrinkle-resistant and machine washable. The difference is fit and look.</p>

<h2>At a glance</h2>
<table>
  <thead><tr><th>&nbsp;</th><th>Pleated (throw)</th><th>Stretch (fitted)</th></tr></thead>
  <tbody>
    <tr><td>Fit</td><td>Drapes loosely with rounded corners</td><td>Pulls tight to the table</td></tr>
    <tr><td>Look</td><td>Classic, soft, forgiving</td><td>Modern, sharp, tailored</td></tr>
    <tr><td>Sizes</td><td>4 ft, 6 ft, 8 ft</td><td>6 ft, 8 ft</td></tr>
    <tr><td>Back</td><td>Closed (4-sided)</td><td>Closed (4-sided)</td></tr>
    <tr><td>Care</td><td>Wrinkle-resistant, machine washable</td><td>Wrinkle-resistant, machine washable</td></tr>
  </tbody>
</table>

<h2>Pleated throws — the classic drape</h2>
<p>A pleated cover drapes over the table with rounded corners and a soft fall to the floor. It's the traditional trade-show look, and because it isn't tailored to the table it's forgiving about exact dimensions and easy to store gear under.</p>

<figure class="blog-fig">
  <img src="/images/table-covers/pleated.webp" alt="Custom printed pleated table throw draped over a trade show table with rounded corners" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>A pleated throw — soft drape, rounded corners, the classic booth look.</figcaption>
</figure>

<h2>Stretch covers — the tailored look</h2>
<p>A stretch cover is a spandex-style fabric that pulls tight to the table for a clean, modern, wrinkle-free surface. It reads as more contemporary and premium — a good match for tech, product-demo and corporate booths where a sharp look counts.</p>

<h2>Which should you choose?</h2>
<p><strong>Choose pleated</strong> for a classic, forgiving drape, the widest size range (including 4 ft), and easy storage underneath.</p>
<p><strong>Choose stretch</strong> for a tight, modern, tailored look at a booth where presentation is front and centre.</p>
<p>Not sure about size? See <a href="/blog/6ft-vs-8ft-table-cover">6 ft vs 8 ft table covers</a>.</p>

<h3>Frequently asked questions</h3>
<p><strong>Are both closed-back?</strong> Yes — both cover all four sides.</p>
<p><strong>Can I wash them?</strong> Yes — both are wrinkle-resistant and machine washable.</p>
<p><strong>Which is more formal?</strong> The stretch cover reads more modern and tailored; the pleated throw is the classic, softer look.</p>

<p>Compare <a href="/products/pleated-table-covers">pleated</a> and <a href="/products/stretch-table-covers">stretch</a> covers, or browse all <a href="/table-covers">table covers</a>.</p>
`
  },
  {
    slug: 'trade-show-backdrop-size-guide',
    title: 'Trade Show Backdrop Size Guide: Choosing a Step & Repeat',
    excerpt:
      'How big should your backdrop be, and how do you space the logos? A practical guide to the Apex step & repeat media wall.',
    tags: ['Buying Guide', 'Backdrops'],
    seo: {
      title: 'Trade Show Backdrop Size Guide',
      description:
        'How to size a step & repeat backdrop — the Apex 10×8 ft media wall, how much it covers, and how to space repeating logos so your branding reads in every photo.'
    },
    coverUrl: '/images/showcase/backdrop-greenleaf.webp',
    publishedAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    html: `
<p>A <a href="/products/step-and-repeat-backdrop">step & repeat backdrop</a> is the branded media wall behind press, red-carpet and event photos — the surface that puts your logo in every shot. Getting the size and the logo spacing right is what makes it work.</p>

<h2>The standard size</h2>
<table>
  <thead><tr><th>Dimension</th><th>Backdrop</th></tr></thead>
  <tbody>
    <tr><td>Display size</td><td>10 ft × 8 ft (120″ × 96″)</td></tr>
    <tr><td>Frame</td><td>Adjustable, portable frame system</td></tr>
    <tr><td>Graphic</td><td>Large-format fabric — replaceable</td></tr>
    <tr><td>Ships in</td><td>4–6 business days</td></tr>
  </tbody>
</table>
<p>At 10 ft wide by 8 ft tall, the standard media wall is big enough to frame one or two people head-to-toe in a photo, which is what most press and event walls need. Need a different size? Ask when you request a quote.</p>

<h2>How much wall you get</h2>
<p>Ten feet of width comfortably fits a person or a small group posing in front; eight feet of height keeps logos above and around them rather than cropped out at the top of the frame. That's the whole point of a step & repeat — the branding has to survive the crop of a tight photo.</p>

<h2>Spacing the repeating logos</h2>
<p>The "step and repeat" name comes from the layout: your logo (or two alternating logos/artwork) repeated evenly across the whole surface. We space them so at least one full logo lands in any tight photo — no matter where a person stands. Send your logo and we lay out the repeat for you and confirm it on a free proof before printing.</p>

<h2>When you need one</h2>
<p>Step & repeat backdrops suit press events, galas, conferences, brand activations and any booth that wants a clean photo background. Indoors it can stand in for a tent as the visual anchor of the booth; see how it fits a full setup in our <a href="/blog/trade-show-booth-checklist">booth checklist</a>.</p>

<h3>Frequently asked questions</h3>
<p><strong>What size is the standard backdrop?</strong> 10 ft × 8 ft (120″ × 96″). Other sizes are available on request.</p>
<p><strong>Can it show more than one logo?</strong> Yes — we can repeat a single logo or alternate two logos/artwork across the surface.</p>
<p><strong>Is the graphic replaceable?</strong> Yes — reuse the frame and reprint the fabric when your branding changes.</p>

<p>See the <a href="/products/step-and-repeat-backdrop">step & repeat backdrop</a>, all <a href="/backdrops">backdrops</a>, or the full range of <a href="/trade-show-displays">trade show displays</a>.</p>
`
  },
  {
    slug: 'trade-show-booth-checklist',
    title: 'The Complete Trade Show Booth Checklist',
    excerpt:
      'Everything a professional booth needs — shelter, table, signage, branding and the small stuff — with what to order for each.',
    tags: ['Planning', 'Trade Show Displays'],
    seo: {
      title: 'Complete Trade Show Booth Checklist',
      description:
        'A practical trade show booth checklist — canopy or backdrop, table cover, banner stands, artwork and accessories — with links to the right products for each part of your booth.'
    },
    coverUrl: '/images/showcase/canopy-nova-tech.webp',
    publishedAt: '2026-08-16T00:00:00.000Z',
    updatedAt: '2026-08-16T00:00:00.000Z',
    html: `
<p>A booth that looks professional is really just a few well-chosen pieces that match. Here's the checklist we walk exhibitors through, part by part, with the Apex product for each. You can buy any of these on its own — nothing here forces you into a bundle.</p>

<h2>1. Shelter or backdrop</h2>
<p><strong>Outdoors:</strong> a <a href="/custom-canopies">custom canopy tent</a> is the whole booth — shade plus branding overhead. Choose 10×10, 10×15 or 10×20 and add printed walls.<br>
<strong>Indoors:</strong> you don't need a tent — a <a href="/backdrops">step & repeat backdrop</a> anchors the booth and gives you a branded photo wall.</p>

<figure class="blog-fig">
  <img src="/images/table-covers/pleated.webp" alt="Custom printed table cover on a trade show table" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>A branded table cover turns a plain folding table into part of the booth.</figcaption>
</figure>

<h2>2. Table cover</h2>
<p>A <a href="/table-covers">custom table cover</a> turns the folding table into branded space. Match it to your table size (<a href="/blog/6ft-vs-8ft-table-cover">6 ft vs 8 ft</a>) and pick a style (<a href="/blog/pleated-vs-stretch-table-cover">pleated vs stretch</a>).</p>

<h2>3. Signage</h2>
<p><a href="/banner-stands">Banner stands</a> pull people in from the aisle. A full-height <a href="/products/standard-retractable-banner">retractable</a> at the booth entrance, a <a href="/products/table-top-banner-stand">tabletop banner</a> on the counter, or an economical <a href="/products/x-stand-banner">X-Stand</a> for secondary messages.</p>

<h2>4. Branding and artwork</h2>
<p>One logo, applied consistently across every piece, is what makes a booth look "designed" rather than assembled. Send print-ready files or add our design service — see the <a href="/artwork-guidelines">artwork guidelines</a>. Every order includes a free proof before production.</p>

<h2>5. The small stuff</h2>
<p>Weights or sandbags for an outdoor canopy (most venues require them), a carry bag for each display, and a plan for power and lighting if your booth needs it.</p>

<h2>Putting it together</h2>
<p>Want the whole booth in one place? Our <a href="/trade-show-booth-packages">trade show booth packages</a> group these pieces into ready-to-shop combinations — and you can still buy each item individually.</p>

<h3>Frequently asked questions</h3>
<p><strong>Do I need a canopy indoors?</strong> No — indoors, a backdrop and table cover usually anchor the booth; canopies are for outdoor shows.</p>
<p><strong>Do I have to buy a package?</strong> No — every product is sold individually. Packages are just recommended combinations.</p>
<p><strong>How much does a full booth cost?</strong> It depends on the pieces — see <a href="/blog/trade-show-display-cost">how much a trade show display costs</a>.</p>

<p>Start with <a href="/trade-show-displays">all trade show displays</a>, or jump to <a href="/custom-canopies">canopies</a>, <a href="/banner-stands">banner stands</a>, <a href="/table-covers">table covers</a> or <a href="/backdrops">backdrops</a>.</p>
`
  },
  {
    slug: 'trade-show-display-cost',
    title: 'How Much Does a Trade Show Display Cost?',
    excerpt:
      'Real starting prices for canopies, table covers, banner stands and backdrops — and how to budget a complete booth without surprises.',
    tags: ['Buying Guide', 'Trade Show Displays'],
    seo: {
      title: 'How Much Does a Trade Show Display Cost?',
      description:
        'Trade show display pricing from Apex — real starting prices for custom canopy tents, table covers, banner stands and step & repeat backdrops, with instant online pricing on most products. How to budget a full booth.'
    },
    coverUrl: '/images/showcase/canopy-harbor-realty.webp',
    publishedAt: '2026-08-17T00:00:00.000Z',
    updatedAt: '2026-08-17T00:00:00.000Z',
    html: `
<p>"How much is a trade show display?" depends on which pieces you need. Here are Apex's real starting prices so you can budget honestly — no bundle gimmicks, no invented numbers. Most products configure for an instant price online; a few (like the tabletop banner) are quoted per order.</p>

<h2>Starting prices</h2>
<table>
  <thead><tr><th>Product</th><th>Starting price (USD)</th></tr></thead>
  <tbody>
    <tr><td><a href="/products/canopy-tent-10x10">10×10 canopy tent</a></td><td>${startFrom('canopy-tent-10x10')} (printed top only) — complete set with frame + bag on the product page</td></tr>
    <tr><td><a href="/products/canopy-tent-10x15">10×15 canopy tent</a></td><td>${startFrom('canopy-tent-10x15')} (printed top only)</td></tr>
    <tr><td><a href="/products/canopy-tent-10x20">10×20 canopy tent</a></td><td>${startFrom('canopy-tent-10x20')} (printed top only)</td></tr>
    <tr><td><a href="/products/pleated-table-covers">Pleated table cover</a> (4/6/8 ft)</td><td>${startFrom('pleated-table-covers')}</td></tr>
    <tr><td><a href="/products/stretch-table-covers">Stretch table cover</a> (6/8 ft)</td><td>${startFrom('stretch-table-covers')}</td></tr>
    <tr><td><a href="/products/standard-retractable-banner">Standard retractable banner</a></td><td>${startFrom('standard-retractable-banner')}</td></tr>
    <tr><td><a href="/products/deluxe-retractable-banner">Deluxe retractable banner</a></td><td>${startFrom('deluxe-retractable-banner')}</td></tr>
    <tr><td><a href="/products/x-stand-banner">X-stand banner</a></td><td>${startFrom('x-stand-banner')}</td></tr>
    <tr><td><a href="/products/step-and-repeat-backdrop">Step &amp; repeat backdrop</a></td><td>${startFrom('step-and-repeat-backdrop')}</td></tr>
    <tr><td><a href="/products/table-top-banner-stand">Table top banner stand</a></td><td>${startFrom('table-top-banner-stand')}</td></tr>
  </tbody>
</table>
<p>Canopy prices are per unit and drop when you order three or more. "Printed Canopy Top Only" is the custom-printed fabric top on its own (for customers who already have a compatible frame); the "Complete Canopy Set" adds the aluminium frame and carry bag — the difference is explained on each product page. Prices above are the starting (from) price for each product; the final price depends on the size, options and production speed you choose.</p>

<figure class="blog-fig">
  <img src="/images/displays/standard-retractable-banner.webp" alt="Apex standard retractable banner stand, one piece of a trade show booth budget" loading="lazy" decoding="async" width="900" height="700">
  <figcaption>Banner stands configure for an instant price — pick your size and production speed on the product page.</figcaption>
</figure>

<h2>Instant pricing vs quote-only</h2>
<p>Canopy tents, banner stands (standard, deluxe and X-stand), step &amp; repeat backdrops and table covers all configure for an instant online price — choose your options and the price updates live. A few items, such as the tabletop banner stand and large or non-standard bulk orders, are quoted per order: <a href="/quote">request a quote</a> with your artwork and quantity and we'll send pricing and a free proof before anything prints.</p>

<h2>Budgeting a complete booth</h2>
<p>A full booth is the sum of its pieces, not a discounted bundle — each product keeps its own price and configuration. A simple outdoor setup might be a 10×10 canopy plus a table cover; a larger booth adds banner stands and a backdrop. See how the pieces fit together in the <a href="/blog/trade-show-booth-checklist">booth checklist</a>, or browse recommended combinations on the <a href="/trade-show-booth-packages">booth packages</a> page. For a full-booth total, <a href="/quote">request a quote</a> listing everything you need.</p>

<h3>Frequently asked questions</h3>
<p><strong>What's the cheapest way to start?</strong> A printed canopy top only or a pleated table cover are the lowest entry points; add pieces as your booth grows.</p>
<p><strong>Do canopies get cheaper in bulk?</strong> Yes — the per-unit canopy price drops at three or more.</p>
<p><strong>Are there package discounts?</strong> No hidden bundle price — packages are priced as their individual products. Ask for a quote on large or multi-item orders.</p>

<p>Price a <a href="/custom-canopies">canopy</a> or <a href="/table-covers">table cover</a> instantly, or <a href="/quote">request a quote</a> for banner stands, backdrops or a full booth.</p>
`
  },
  // ── Overrides for the obsolete Supabase canopy posts (static wins on slug) ──
  // These drop the retired top-only-discount claim and the old per-wall-limit
  // wording; top-only is an explicitly-configured separate price per size, and
  // walls are capped at three total in any full/half combination.
  {
    slug: 'custom-canopy-tent-buying-guide',
    title: 'Custom Canopy Tent Buying Guide',
    excerpt:
      'Everything to decide before ordering a custom printed canopy tent: size, what you get, walls, print coverage, delivery speed and artwork.',
    tags: ['buying guide'],
    seo: {
      title: 'Custom Canopy Tent Buying Guide',
      description:
        'How to order a custom printed canopy tent — size, complete set vs printed top only, walls, print, production speed and artwork.'
    },
    coverUrl: '/images/showcase/canopy-nova-tech.webp',
    publishedAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>Everything to decide before ordering a custom printed canopy tent — size, what you get, walls, print, delivery speed and artwork.</p>
<h2>1. Size</h2>
<p>Pick by table count and booth space — 10×10 (standard), 10×15 (more room), 10×20 (double booth). See <a href="/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents">what size to buy</a>.</p>
<h2>2. What you get</h2>
<ul>
  <li><strong>Complete Canopy Set</strong> — the printed canopy top + aluminium hex frame + carry bag.</li>
  <li><strong>Printed Canopy Top Only</strong> — the custom-printed fabric top on its own (no frame, no carry bag), for customers who already have a compatible frame. Pricing varies by canopy size; see the relevant product page for current pricing.</li>
</ul>
<h2>3. Walls</h2>
<p>Add up to <strong>3 printed walls total</strong> — any combination of full-height and half-height walls — for weather cover and branding. See <a href="/blog/custom-canopy-tent-wall-options-explained">wall options</a>.</p>
<h2>4. Print</h2>
<p>Every canopy is <strong>dye-sublimated</strong> — ink bonded into the fabric, so it will not crack, peel or fade in the sun.</p>
<h2>5. Delivery speed</h2>
<p><strong>Production</strong> is 6–8 business days (standard) or 2–3 business days (rush, +50%) after you approve your free proof. Shipping/transit time is additional and depends on your destination.</p>
<h2>6. Quantity</h2>
<p>Ordering <strong>3 or more</strong> drops the per-tent price automatically.</p>
<h2>7. Artwork</h2>
<p>Upload a print-ready file or add the <strong>design service ($35)</strong>. You approve a free proof before anything prints.</p>
<p><a href="/custom-canopies">Start configuring →</a></p>
`
  },
  {
    slug: 'how-much-does-a-custom-printed-canopy-tent-cost',
    title: 'How Much Does a Custom Printed Canopy Tent Cost?',
    // Canonicalised to the broader cost guide — Google treats these as the same
    // topic and picked a different canonical, so we consolidate signals there.
    canonical: '/blog/trade-show-display-cost',
    excerpt:
      'Transparent pricing for custom printed canopy tents — complete-set vs printed-top-only prices, wall costs, rush fees and volume discounts.',
    tags: ['buying guide', 'pricing'],
    seo: {
      title: 'How Much Does a Custom Printed Canopy Tent Cost?',
      description:
        'Custom canopy tent pricing — complete-set base prices by size, the printed-top-only option, wall costs, rush production and volume discounts.'
    },
    coverUrl: '/images/showcase/canopy-harbor-realty.webp',
    publishedAt: '2026-08-06T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>Transparent pricing for custom printed canopy tents — what each option includes, wall costs, rush fees and volume discounts. Prices update live as you configure on the product page.</p>
<h2>Complete Canopy Set — base price by size</h2>
<p>The complete set is the printed canopy top + aluminium hex frame + carry bag.</p>
<table>
  <thead><tr><th>Size</th><th>1–2 units</th><th>3+ units (each)</th></tr></thead>
  <tbody>
    <tr><td>10×10</td><td>$835</td><td>$799</td></tr>
    <tr><td>10×15</td><td>$1,375</td><td>$1,250</td></tr>
    <tr><td>10×20</td><td>$1,635</td><td>$1,445</td></tr>
  </tbody>
</table>
<h2>Printed Canopy Top Only</h2>
<p>Already have a compatible frame? You can order the <strong>printed canopy top only</strong> — the custom-printed fabric top on its own, at a lower price than the complete set. Each size has its own top-only price shown live on the product page (the 10×10 top only starts at $510). It is a separate configuration, not a percentage discount off the set.</p>
<h2>Add-ons</h2>
<ul>
  <li><strong>Walls</strong> (up to 3 total, any mix of full or half): $275 each on 10×10, $365 each on 10×15 and 10×20.</li>
  <li><strong>Rush production</strong> (2–3 business days instead of 6–8): +50% of the order. This is production time — shipping is additional.</li>
  <li><strong>Design service</strong> (we create the artwork): one-time $35.</li>
</ul>
<h2>Example</h2>
<p>A 10×10 complete set with one printed back wall, standard production: <strong>$835 + $275 = $1,110</strong>. Order three and the tent price drops to $799 each.</p>
<h2>No hidden quotes</h2>
<p>Every price updates live as you configure — no waiting on a sales rep.</p>
<p><a href="/custom-canopies">Price your canopy now →</a></p>
`
  },
  // ── Rich overrides for the older, thin Supabase canopy posts ──────────────
  {
    slug: 'what-size-canopy-tent-should-i-buy',
    title: 'What Size Canopy Tent Should I Buy?',
    // Canonicalised to the side-by-side size comparison — same intent; Google
    // deduped them, so consolidate ranking signals into that stronger article.
    canonical: '/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents',
    excerpt:
      'A practical way to choose between a 10x10, 10x15 and 10x20 custom canopy tent — by booth space, table count, staff and what you sell.',
    tags: ['Buying Guide', 'Sizing'],
    seo: {
      title: 'What Size Canopy Tent Should I Buy? (10x10 vs 10x15 vs 10x20)',
      description:
        'Choose the right custom canopy tent size — 10x10, 10x15 or 10x20 — by booth space, table count and staff. Dimensions, capacity and real examples from Apex.'
    },
    coverUrl: '/images/showcase/canopy-nova-tech.webp',
    publishedAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>Buying the right size canopy is mostly about two things: the <strong>space you're given</strong> and <strong>what has to fit under cover</strong>. Get those right and the rest follows. Here's how to decide between a 10×10, 10×15 and 10×20 without guesswork.</p>

<h2>Start with your booth space</h2>
<p>Most markets, fairs and trade shows assign booths in <strong>10-foot increments</strong> — a 10×10 single, a 10×20 double, and sometimes 10×15 in between. Check your vendor packet first: if the show gives you a 10×10 space, a 10×10 canopy is the answer and the decision is made for you. If you have a choice, size up from what you need to fit.</p>

<h2>Match the size to what you're doing</h2>
<table>
  <thead><tr><th>Size</th><th>Footprint</th><th>Comfortably fits</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td><strong>10×10</strong></td><td>100 sq ft</td><td>One 6 ft table + 1–2 staff</td><td>The standard single vendor booth</td></tr>
    <tr><td><strong>10×15</strong></td><td>150 sq ft</td><td>1–2 tables + a small product display</td><td>A little more room to work and store stock</td></tr>
    <tr><td><strong>10×20</strong></td><td>200 sq ft</td><td>Two tables, a queue, or a full display wall</td><td>A double booth under one roof</td></tr>
  </tbody>
</table>

<h2>Capacity rules of thumb</h2>
<ul>
  <li><strong>Selling from one table?</strong> A 10×10 covers a single 6 ft table with room to stand and serve.</li>
  <li><strong>Running a line, demo or tasting?</strong> Step up to 10×15 or 10×20 so customers stay under shade while they wait.</li>
  <li><strong>Sharing the booth, or storing boxes and stock?</strong> Go bigger — vendors almost always fill the extra space.</li>
  <li><strong>Two staff working at once?</strong> 10×15 or 10×20 keeps you from bumping elbows behind the table.</li>
</ul>

<h2>Walls change the equation</h2>
<p>A printed <strong>back wall</strong> turns any size into a branded backdrop, and side walls add weather cover and privacy. You can add <strong>up to 3 printed walls total</strong>, in any combination of full-height and half-height — so factor walls into your plan, not just the roof. See <a href="/blog/custom-canopy-tent-wall-options-explained">wall options explained</a>.</p>

<h2>A quick example</h2>
<p>A coffee roaster doing weekend markets from one table and a grinder chose a <strong>10×10</strong> with a printed back wall — enough for the table, a queue in front, and branding overhead. When they added a second market with a full tasting bar and two staff, they moved to a <strong>10×20</strong> so the line stayed under shade.</p>

<h2>Still unsure? Default to 10×10</h2>
<p>If you're tight on space or budget, the 10×10 is the safe standard and the most widely allowed booth size. You can always add walls for presence without going bigger.</p>

<h3>Frequently asked questions</h3>
<p><strong>Which size is most common?</strong> The 10×10 — it's what most events allocate by default and fits a single vendor table.</p>
<p><strong>Can I fit two tables under a 10×10?</strong> It's tight. For two tables plus staff, choose a 10×15 or 10×20.</p>
<p><strong>Do bigger tents cost more per unit?</strong> Yes, and walls are priced per wall — but ordering 3 or more of any size drops the per-tent price. See <a href="/blog/trade-show-display-cost">canopy pricing</a>.</p>

<p>Compare sizes and price yours: <a href="/products/canopy-tent-10x10">10×10</a>, <a href="/products/canopy-tent-10x15">10×15</a> or <a href="/products/canopy-tent-10x20">10×20</a>, or read the full <a href="/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents">size comparison</a>.</p>
`
  },
  {
    slug: '10x10-vs-10x15-vs-10x20-custom-canopy-tents',
    title: '10x10 vs 10x15 vs 10x20 Custom Canopy Tents',
    excerpt:
      'A side-by-side comparison of the three custom canopy tent sizes — footprint, price, wall count and when each one makes sense.',
    tags: ['Buying Guide', 'Comparison'],
    seo: {
      title: '10x10 vs 10x15 vs 10x20 Canopy Tents',
      description:
        'Compare 10x10, 10x15 and 10x20 custom canopy tents — footprint, price (top only vs complete set), walls and best use. Apex dye-sublimation, US & Canada.'
    },
    coverUrl: '/images/showcase/canopy-harbor-realty.webp',
    publishedAt: '2026-08-02T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>All three Apex canopies are the same commercial-grade, dye-sublimated tent on a heavy-duty aluminium hex frame. They differ in <strong>footprint, price and how much branding surface</strong> you get. Here's the side-by-side.</p>

<h2>At a glance</h2>
<table>
  <thead><tr><th>&nbsp;</th><th>10×10</th><th>10×15</th><th>10×20</th></tr></thead>
  <tbody>
    <tr><td>Footprint</td><td>100 sq ft</td><td>150 sq ft</td><td>200 sq ft</td></tr>
    <tr><td>Complete set (from)</td><td>$835</td><td>$1,375</td><td>$1,635</td></tr>
    <tr><td>Printed top only (from)</td><td>$510</td><td>$545</td><td>$915</td></tr>
    <tr><td>Wall price (each)</td><td>$275</td><td>$365</td><td>$365</td></tr>
    <tr><td>Best for</td><td>Single vendor booth</td><td>More room to work</td><td>Double booth</td></tr>
  </tbody>
</table>
<p>Prices are per unit and drop at 3+. "Complete set" = printed top + aluminium frame + carry bag; "printed top only" is the fabric top for a frame you already own.</p>

<h2>10×10 — the standard booth</h2>
<p>The size most events allocate by default. Fits one 6 ft table and two people, sets up in minutes, and packs down small. If you're new or unsure, this is the one.</p>

<h2>10×15 — more room to work</h2>
<p>Half again the width of a 10×10 — space for a second table, a product display, or two staff working without crowding. A good middle ground when a 10×10 feels tight but a double booth is overkill.</p>

<h2>10×20 — a double booth</h2>
<p>Effectively two booths under one roof, and the widest single-canopy span most shows allow. Ideal for a full display wall, a queue that needs shade, or sharing the space with a partner.</p>

<h2>Walls scale with size</h2>
<p>Walls are priced per wall and you can combine <strong>up to three total</strong> (full or half, same price), so a larger tent also gives you more branding surface. See <a href="/blog/custom-canopy-tent-wall-options-explained">wall options</a>.</p>

<h2>Which should you pick?</h2>
<ul>
  <li>Unsure, or tight on space → <strong>10×10</strong>.</li>
  <li>Need a second table or a display → <strong>10×15</strong>.</li>
  <li>Want maximum shade, branding and a double footprint → <strong>10×20</strong>.</li>
</ul>
<p>Ordering <strong>3 or more</strong> of any size drops the per-tent price automatically.</p>

<h3>Frequently asked questions</h3>
<p><strong>Is the 10×15 worth it over a 10×10?</strong> If you run two tables or two staff, yes — the extra 50 sq ft removes the crowding without jumping to a full double booth.</p>
<p><strong>Can I buy just the printed top?</strong> Yes, on any size, if you already own a compatible frame. See <a href="/blog/trade-show-display-cost">pricing</a>.</p>
<p><strong>Are all three the same fabric and frame?</strong> Yes — dye-sublimated 600D polyester on a heavy-duty aluminium hex frame; only the size changes.</p>

<p>Build yours: <a href="/products/canopy-tent-10x10">10×10</a>, <a href="/products/canopy-tent-10x15">10×15</a> or <a href="/products/canopy-tent-10x20">10×20</a>. Not sure? <a href="/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents">What size should I buy?</a></p>
`
  },
  {
    slug: 'custom-canopy-tent-wall-options-explained',
    title: 'Custom Canopy Tent Wall Options Explained',
    excerpt:
      'Full walls, half walls, back and side walls — what each does, what they cost, and the one rule that governs how many you can add.',
    tags: ['Guide', 'Walls'],
    seo: {
      title: 'Canopy Tent Wall Options Explained',
      description:
        'Full walls vs half walls, back and side walls for a custom canopy tent — what each does, per-size pricing, popular setups, and the 3-walls-total rule.'
    },
    coverUrl: '/images/showcase/canopy-nova-tech.webp',
    publishedAt: '2026-08-03T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>A canopy top gives you shade and overhead branding. <strong>Walls</strong> do three more things: block wind and sun, add privacy and security, and give you a large printed backdrop right at eye level. Here's how they work.</p>

<h2>Full walls vs half walls</h2>
<ul>
  <li><strong>Full wall</strong> — floor-to-frame coverage. Maximum branding surface and the best choice for a back wall, weather protection or an enclosed booth.</li>
  <li><strong>Half wall</strong> — waist height. Defines the booth and adds a branded band without closing it off — ideal for counter service, sampling and open, welcoming layouts.</li>
</ul>
<p>Both cost the <strong>same per wall</strong>, so choose by function, not price.</p>

<h2>The one rule: up to 3 printed walls total</h2>
<p>A pop-up canopy has three coverable sides plus an open front, so you can add <strong>up to 3 printed walls total — in any combination of full-height and half-height</strong>. For example: one full back wall + two half side walls, or three full walls for a fully enclosed space. It is three walls total, not three of each.</p>

<h2>What walls cost</h2>
<table>
  <thead><tr><th>Size</th><th>Per wall (full or half)</th></tr></thead>
  <tbody>
    <tr><td>10×10</td><td>$275</td></tr>
    <tr><td>10×15</td><td>$365</td></tr>
    <tr><td>10×20</td><td>$365</td></tr>
  </tbody>
</table>

<h2>Popular setups</h2>
<ul>
  <li><strong>1 full back wall</strong> — the classic branded backdrop; keeps the booth open and inviting.</li>
  <li><strong>Back + 1 side</strong> — wind protection from one direction and a tidy corner booth.</li>
  <li><strong>1 back + 2 half sides</strong> — branding on three sides while staff can still serve over the half walls.</li>
  <li><strong>3 full walls</strong> — an enclosed, photo-ready, weather-tight space for cash handling or product security.</li>
</ul>

<h2>Weather and branding considerations</h2>
<p>Walls catch wind, so always run weights or sandbags on every leg when walls are up — most venues require them. For branding, remember the <strong>valance</strong> (the hanging skirt on the roof) is prime eye-level space too; walls and valance together give you a wraparound brand presence.</p>

<h3>Frequently asked questions</h3>
<p><strong>Can I add 3 full walls and 3 half walls?</strong> No — it's 3 walls total in any full/half mix. A tent has three coverable sides.</p>
<p><strong>Do full and half walls cost the same?</strong> Yes, per wall, so pick by function.</p>
<p><strong>Can I add walls later?</strong> It's easiest to order them with the tent so the print matches, but walls attach with hook-and-loop to a standard frame.</p>

<p>Add walls when you <a href="/products/canopy-tent-10x10">build your canopy</a>, or see <a href="/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents">what size to buy</a>.</p>
`
  },
  {
    slug: 'how-to-prepare-artwork-for-a-custom-canopy-tent',
    title: 'How to Prepare Canopy Tent Artwork',
    excerpt:
      'File types, resolution, colour and layout tips so your custom canopy tent prints sharp — plus what to do if your artwork is not ready.',
    tags: ['Guide', 'Artwork'],
    seo: {
      title: 'How to Prepare Canopy Tent Artwork',
      description:
        'Prepare print-ready artwork for a custom canopy tent — file formats, resolution/DPI, CMYK colour, bleed and safe zones, plus the free proof and design service.'
    },
    coverUrl: '/images/showcase/canopy-harbor-realty.webp',
    publishedAt: '2026-08-04T00:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>Dye sublimation prints edge to edge in full colour, so a canopy is only as sharp as the file you send. A few minutes getting the artwork right saves a reprint — here's what matters.</p>

<h2>Get the file format right</h2>
<ul>
  <li><strong>Vector (best):</strong> print-ready PDF, AI or EPS. Vectors scale to tent size with zero loss — ideal for logos, text and solid shapes.</li>
  <li><strong>Raster (works):</strong> high-resolution PNG or TIFF. Supply the largest, highest-quality version you have.</li>
</ul>

<h2>Resolution and scale</h2>
<p>Because a canopy is large, low-resolution images look soft when blown up. Aim for at least <strong>150 DPI at full size</strong> for raster art. If you only have a small logo, send the vector — never upscale a tiny JPG and hope.</p>

<h2>Colour</h2>
<p>Design in <strong>CMYK</strong> where you can, so on-screen colour matches the print. Dye sublimation reproduces solid brand colours, gradients, photos and full-bleed backgrounds well. If exact brand-colour matching matters, tell us in your order notes and we'll confirm it on the proof.</p>

<h2>Bleed, safe zones and seams</h2>
<ul>
  <li>Extend backgrounds to <strong>full bleed</strong> — past the trim edge — so there are no white slivers.</li>
  <li>Keep logos and key text <strong>centred and away from edges and seams</strong>.</li>
  <li>Remember the <strong>valance</strong> (the hanging skirt) is prime eye-level space — put your business name or tagline there.</li>
</ul>

<h2>Where you can print</h2>
<p>A canopy has several printable surfaces — the top (peak panels), the valance, and full or half walls, each its own surface. Decide how much to print before you design; see <a href="/blog/print-coverage-explained">print coverage explained</a>.</p>

<h2>Common mistakes to avoid</h2>
<ul>
  <li>Low-resolution logos pulled from a website.</li>
  <li>Text too close to seams or the valance fold.</li>
  <li>RGB files with neon colours that can't be printed exactly.</li>
  <li>Busy backgrounds that bury the logo from a distance — high contrast reads across a lot.</li>
</ul>

<h2>No print-ready file? Two options</h2>
<ol>
  <li><strong>Upload what you have</strong> — we review it and flag any issues on the free proof.</li>
  <li><strong>Add our design service (+$35)</strong> — our team builds the artwork from your logo and direction.</li>
</ol>
<p>Either way, <strong>nothing prints until you approve the proof</strong>.</p>

<h3>Frequently asked questions</h3>
<p><strong>What file format is best?</strong> Vector (PDF/AI/EPS). High-resolution PNG/TIFF also works.</p>
<p><strong>Will my colours print exactly?</strong> Close — design in CMYK and flag critical brand colours in your notes; we confirm on the proof.</p>
<p><strong>What if I don't have a designer?</strong> Add the $35 design service and we'll create the artwork for you.</p>

<p><a href="/products/canopy-tent-10x10">Configure your canopy and upload artwork →</a> or read <a href="/blog/print-coverage-explained">print coverage explained</a>.</p>
`
  },
  {
    slug: 'print-coverage-explained',
    title: 'Canopy Print Coverage Explained: Top, Valance, Walls & Inside',
    excerpt:
      'What "print coverage" means on a custom canopy — the top, valance, walls and inside — and what to print where for the most impact.',
    tags: ['Guide', 'Printing'],
    seo: {
      title: 'Canopy Print Coverage Explained',
      description:
        'Understand canopy print coverage — the top, valance, walls and inside underside — and what to print on each surface for maximum branding, full-bleed dye sublimation.'
    },
    coverUrl: '/images/showcase/canopy-nova-tech.webp',
    publishedAt: '2026-08-05T12:00:00.000Z',
    updatedAt: '2026-08-11T00:00:00.000Z',
    html: `
<p>"Print coverage" simply means <strong>how much of the canopy carries your artwork</strong>. A canopy is not one surface — it's several, and each does a different job. Knowing what to print where gets you the most branding for your budget.</p>

<h2>The printable surfaces</h2>
<ul>
  <li><strong>Canopy top (peak panels)</strong> — the roof. Seen from a distance and in overhead photos. Great for a logo or a bold pattern.</li>
  <li><strong>Valance</strong> — the hanging skirt around the roof edge, right at eye level as people walk by. The single most valuable spot for your <strong>business name or tagline</strong>.</li>
  <li><strong>Walls (full or half)</strong> — the biggest continuous surfaces. Ideal for large graphics, product shots, QR codes and calls to action.</li>
  <li><strong>Inside / underside</strong> — the ceiling seen by anyone standing under the tent. A "wow" surface for a pattern, brand colour or message that surrounds the customer.</li>
</ul>

<h2>What to print where</h2>
<table>
  <thead><tr><th>Surface</th><th>Best used for</th></tr></thead>
  <tbody>
    <tr><td>Valance</td><td>Business name + tagline (eye-level, read first)</td></tr>
    <tr><td>Top</td><td>Logo or pattern (distance + overhead photos)</td></tr>
    <tr><td>Walls</td><td>Big graphics, product imagery, offers, QR codes</td></tr>
    <tr><td>Inside</td><td>Immersive brand colour or pattern overhead</td></tr>
  </tbody>
</table>

<h2>It's all full-bleed dye sublimation</h2>
<p>Every surface prints edge to edge in full colour, with the ink bonded into the fabric — so it won't crack, peel or fade in the sun. There's no upcharge for "more colours"; coverage is about how many <em>surfaces</em> you print, not how complex the art is.</p>

<h2>How much coverage do you need?</h2>
<ul>
  <li><strong>Budget / essentials:</strong> valance + top. You're named at eye level and visible from a distance.</li>
  <li><strong>Most vendors:</strong> add a <strong>printed back wall</strong> — a full-height branded backdrop behind your table.</li>
  <li><strong>Maximum impact:</strong> top, valance, walls and the inside underside for a fully wrapped, photo-ready booth.</li>
</ul>

<h2>An example</h2>
<p>A realtor kept the top and valance to their logo and name, printed a full back wall with listings and a QR code, and left the inside a clean brand navy. From the aisle you read the name; at the table you scan the code; in photos the whole booth is on-brand.</p>

<h3>Frequently asked questions</h3>
<p><strong>Do more colours cost more?</strong> No — dye sublimation is full colour by default. Cost scales with size and the number of surfaces/walls, not colour count.</p>
<p><strong>What's the most important surface?</strong> The valance — it sits at eye level and is read first. Put your name there.</p>
<p><strong>Can I print the inside of the roof?</strong> Yes — the underside is a great surface for an immersive pattern or brand colour.</p>

<p>Choose your coverage when you <a href="/products/canopy-tent-10x10">build your canopy</a>, and see <a href="/blog/how-to-prepare-artwork-for-a-custom-canopy-tent">how to prepare artwork</a>.</p>
`
  },
  {
    slug: 'feather-angled-vs-convex-vs-teardrop-flags',
    title: 'Feather Angled vs Convex vs Teardrop Flags',
    excerpt:
      'Compare the three Apex flag shapes — top profile, heights, wind behaviour, base options and price — to pick the right advertising flag.',
    tags: ['Buying Guide', 'Comparison', 'Flags'],
    seo: {
      title: 'Feather Angled vs Convex vs Teardrop Flags',
      description:
        'Compare Apex feather angled, feather convex and teardrop flags — shape, heights (7–14 ft), wind behaviour, bases and instant pricing from $140.'
    },
    coverUrl: '/images/flags/feather_angled_flag_taco_vista_large_cross_base.png',
    publishedAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    html: `
<p><strong>Short answer:</strong> pick a <strong>feather angled</strong> flag for maximum height and motion, a <strong>feather convex</strong> flag for the same feather look with a smoother curved top, and a <strong>teardrop</strong> flag when you want the shape that holds tightest in wind. All three are custom printed by dye sublimation, single or double sided, and start at <strong>$140</strong> with instant online pricing.</p>

<h2>At a glance</h2>
<table>
  <thead><tr><th>&nbsp;</th><th>Feather Angled</th><th>Feather Convex</th><th>Teardrop</th></tr></thead>
  <tbody>
    <tr><td>Top profile</td><td>Angled, pointed tip</td><td>Curved convex top</td><td>Rounded teardrop</td></tr>
    <tr><td>Heights</td><td>9, 10.5, 14 ft</td><td>9, 10.5, 14 ft</td><td>7, 9, 11.2 ft</td></tr>
    <tr><td>Wind behaviour</td><td>Tall, flies and flutters</td><td>Flies, cleaner top edge</td><td>Holds its shape best</td></tr>
    <tr><td>Print</td><td>Dye-sub, 1 or 2 sided</td><td>Dye-sub, 1 or 2 sided</td><td>Dye-sub, 1 or 2 sided</td></tr>
    <tr><td>Base</td><td colspan="3">Ground spike included · cross base +$31 · metal plate base +$35</td></tr>
    <tr><td>From</td><td>$140</td><td>$140</td><td>$140</td></tr>
  </tbody>
</table>
<p>Every flag includes a flexible pole and a carry bag; choose the base for your surface — spike for grass, cross or plate for hard floors.</p>

<h2>Feather Angled — height and motion</h2>
<p>The classic feather with an angled, pointed tip. It reads as the tallest profile and moves the most in a breeze, so it catches attention from across a lot — the popular pick for event entrances and roadside promotion.</p>

<h2>Feather Convex — a smoother curved top</h2>
<p>The same feather family, but the top edge curves over in a smooth convex arc instead of tapering to a point. It keeps the height and flutter of a feather flag with a slightly more contained, premium-looking outline.</p>

<h2>Teardrop — the most stable in wind</h2>
<p>A rounded teardrop profile bowed tight onto its pole. Because the fabric is held on more sides, it keeps its shape and flaps less in wind — the pick for exposed, windy spots. Teardrops come in 7, 9 and 11.2 ft.</p>

<h2>Which should you pick?</h2>
<ul>
  <li>Maximum height and eye-catching motion → <strong>Feather Angled</strong>.</li>
  <li>The feather look with a smoother, curved top → <strong>Feather Convex</strong>.</li>
  <li>Windy or exposed location, or you want the shape to stay readable → <strong>Teardrop</strong>.</li>
</ul>

<h2>What's included and how it's priced</h2>
<p>All flag shapes are instant-priced online: choose height, single or double sided, and base, upload your artwork (or add our design service), and the price updates live from $140. Every order includes a free artwork proof before printing.</p>

<p>Build yours: <a href="/products/feather-angled-flag">Feather Angled Flag</a>, <a href="/products/feather-convex-flag">Feather Convex Flag</a> or <a href="/products/teardrop-flag">Teardrop Flag</a>. See the whole range on the <a href="/flags">flags page</a>.</p>
`,
    faqs: [
      { q: 'Which flag is best for windy locations?', a: 'The teardrop. Its fabric is held on more sides, so it keeps its shape and flaps less than a feather flag in wind.' },
      { q: "What's the difference between angled and convex feather flags?", a: 'The angled flag tapers to a pointed tip at the top; the convex flag has a smooth curved top edge. Both are the same feather family and the same heights (9, 10.5 and 14 ft).' },
      { q: 'Can any flag be printed on both sides?', a: 'Yes — every shape is available single or double sided in full-colour dye sublimation.' },
      { q: 'What base do I need?', a: 'A ground spike is included for grass. For hard surfaces choose a cross base (+$31) or a metal plate base (+$35).' },
      { q: 'How much do custom flags cost?', a: 'Flags start at $140 with instant online pricing; the price updates as you choose height, sides and base.' }
    ]
  },
  {
    slug: 'seg-modular-kit-a-vs-b-vs-c',
    title: 'SEG Modular Kit A vs B vs C',
    excerpt:
      'Compare the three Apex SEG modular lightbox booth kits — layout, structure, widths, counter and what each is best for.',
    tags: ['Buying Guide', 'Comparison', 'SEG'],
    seo: {
      title: 'SEG Modular Kit A vs B vs C',
      description:
        'Compare Apex SEG modular lightbox booth kits A, B and C — layout, backlit structure, 10–20 ft widths, counter and best use. Quoted per order.'
    },
    coverUrl: '/images/seg-kits/apex-seg-modular-kit-a-main.jpeg',
    publishedAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    html: `
<p><strong>Short answer:</strong> <strong>Kit A</strong> is a straight backlit backwall with an overhead archway and a reception counter; <strong>Kit B</strong> adds a side privacy wall for a semi-enclosed space; <strong>Kit C</strong> uses two angled backlit walls for a more dynamic, open layout. All three are illuminated SEG (silicone-edge graphic) lightbox kits with replaceable graphics and a counter, and are <strong>quoted per order</strong>.</p>

<h2>At a glance</h2>
<table>
  <thead><tr><th>&nbsp;</th><th>Kit A</th><th>Kit B</th><th>Kit C</th></tr></thead>
  <tbody>
    <tr><td>Layout</td><td>Straight backwall</td><td>Backwall + side wall</td><td>Two angled walls</td></tr>
    <tr><td>Overhead archway</td><td>Yes</td><td>Yes</td><td>—</td></tr>
    <tr><td>Side privacy wall</td><td>—</td><td>Yes</td><td>Angled walls</td></tr>
    <tr><td>Counter</td><td>Reception counter</td><td>Display counter</td><td>Display counter</td></tr>
    <tr><td>Lighting</td><td colspan="3">Backlit SEG (silicone-edge) fabric graphics, replaceable</td></tr>
    <tr><td>Widths</td><td>10–20 ft</td><td>10–20 ft</td><td>10–20 ft (fewer size options)</td></tr>
    <tr><td>Pricing</td><td colspan="3">Quoted per order</td></tr>
  </tbody>
</table>

<h2>Kit A — classic backlit backwall</h2>
<p>A straight illuminated SEG backwall with an overhead archway and a reception counter. The clean, symmetrical layout that suits most booths and puts your brand on a large backlit surface.</p>

<h2>Kit B — add a semi-private corner</h2>
<p>The straight-backwall layout plus a side privacy wall, which closes off one side for a semi-private space to talk, demo or store gear. Includes a display counter.</p>

<h2>Kit C — angled, open presence</h2>
<p>Two angled backlit walls in place of a single straight backwall, for a more dynamic footprint that reads from multiple aisles. Includes a display counter. Kit C is offered in fewer size options than A and B.</p>

<h2>Which should you pick?</h2>
<ul>
  <li>A straightforward, large backlit backwall → <strong>Kit A</strong>.</li>
  <li>You want a semi-private meeting or demo corner → <strong>Kit B</strong>.</li>
  <li>You want an angled, open layout that catches multiple aisles → <strong>Kit C</strong>.</li>
</ul>

<h2>What's included and how it's priced</h2>
<p>Each kit is a snap-fit aluminium SEG frame with backlit fabric graphics, a counter and a transport bag; the graphics push into the frame and are replaceable, so you can reprint without rebuying the frame. Because size, backlighting and configuration vary, the kits are <strong>quoted per order</strong> rather than instant-priced — send your size and artwork for pricing and a free proof.</p>

<p>See each kit: <a href="/products/seg-modular-trade-show-kit-a">SEG Modular Kit A</a>, <a href="/products/seg-modular-trade-show-kit-b">SEG Modular Kit B</a> or <a href="/products/seg-modular-trade-show-kit-c">SEG Modular Kit C</a>, or read more about <a href="/seg-displays">SEG displays</a>.</p>
`,
    faqs: [
      { q: 'Are all three SEG kits backlit?', a: 'Yes. All three use backlit SEG (silicone-edge graphic) fabric panels for an illuminated lightbox finish.' },
      { q: "What's the main difference between the kits?", a: 'Kit A is a straight backwall with an overhead archway and a reception counter; Kit B adds a side privacy wall; Kit C uses two angled backlit walls. All three include a counter.' },
      { q: 'Can the graphics be replaced?', a: 'Yes — the SEG fabric graphics push into the frame and are replaceable, so you keep the frame and reprint the graphic when your branding changes.' },
      { q: 'How are the kits priced?', a: 'The SEG modular kits are quoted per order by size and configuration. Request a quote with your size and artwork for pricing and a free proof.' }
    ]
  }
];

export const getStaticArticle = (slug) => STATIC_ARTICLES.find((a) => a.slug === slug) || null;

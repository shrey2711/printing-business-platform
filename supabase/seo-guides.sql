-- ============================================================================
-- SEO buying guides (P10). Paste into Supabase SQL Editor -> Run, then rebuild
-- the site so they prerender. Idempotent (on conflict do nothing).
-- Content is accurate to the live catalog (3 sizes, full/half walls max 3,
-- dye-sublimation, 6-8 / 2-3 day production, design service $35).
-- ============================================================================
insert into public.blog_posts (slug, title, excerpt, body_md, tags, status, published_at)
values
(
  'what-size-canopy-tent-should-i-buy',
  'What Size Canopy Tent Should I Buy?',
  'A quick way to pick between a 10x10, 10x15 and 10x20 custom canopy tent based on your table count, team size and event space.',
  E'## Start with the space you are given\n\nMost markets, fairs and shows assign booths in 10-foot increments, so your size is often decided for you. If you have a choice, work backwards from **how many tables and people** need to fit under cover.\n\n| Size | Fits | Best for |\n| --- | --- | --- |\n| **10x10** | 1 table + 2 people | Single vendor booth, the default |\n| **10x15** | 1-2 tables + product display | A little more room to work |\n| **10x20** | 2 tables, a line, or a full display | A double booth under one roof |\n\n## Rules of thumb\n\n- **Selling from a table?** A 10x10 covers one 6-foot table with room to stand.\n- **Running a line or demo?** Step up to 10x15 or 10x20 so customers stay under shade.\n- **Sharing the booth or storing stock?** Go bigger — you always fill the space.\n\n## Don''t forget walls\n\nA printed **back wall** turns any size into a branded backdrop, and side walls add weather cover. You can add up to **3 walls** (full or half) to any size.\n\n[Compare sizes and price yours →](/products)',
  ARRAY['buying guide','sizing'],
  'published', now() - interval '5 days'
),
(
  '10x10-vs-10x15-vs-10x20-custom-canopy-tents',
  '10x10 vs 10x15 vs 10x20 Custom Canopy Tents',
  'The real differences between the three custom canopy tent sizes — footprint, price, walls and when each one makes sense.',
  E'## The three sizes at a glance\n\nAll three are the same commercial-grade, dye-sublimated canopy on a heavy-duty aluminium hex frame. They differ in footprint, price and how much branding surface you get.\n\n### 10x10 — the standard booth\nThe size most events allocate by default. Fits one table and two people. **From $835.**\n\n### 10x15 — more room to work\nHalf again the width for a second table or a product display. **From $1,375.**\n\n### 10x20 — a double booth\nEffectively two booths under one roof, and the widest single-canopy span most shows allow. **From $1,635.**\n\n## Walls scale with size\n\nWalls are priced per wall and you can combine up to three (full or half, same price):\n\n- 10x10 — $275 per wall\n- 10x15 & 10x20 — $365 per wall\n\n## Which should you pick?\n\n- Unsure, or tight on space → **10x10**.\n- Need a second table or a display → **10x15**.\n- Want maximum shade and branding → **10x20**.\n\nOrder **3 or more** of any size and the per-tent price drops.\n\n[Build your canopy →](/products)',
  ARRAY['buying guide','sizing','comparison'],
  'published', now() - interval '4 days'
),
(
  'custom-canopy-tent-wall-options-explained',
  'Custom Canopy Tent Wall Options Explained',
  'Full walls, half walls, back and side walls — what each does, what they cost, and how many you can add.',
  E'## Why add walls?\n\nA canopy top gets you shade and overhead branding. **Walls** do three more things: block wind and sun, add privacy, and give you a big printed backdrop at eye level.\n\n## Full vs half walls\n\n- **Full wall** — floor-to-frame. Maximum coverage and branding, best as a back wall or for weather.\n- **Half wall** — waist-height. Defines the booth and adds branding without closing it off — good for counter-service.\n\nBoth cost the **same per wall**, so choose by function, not price.\n\n## How many can I add?\n\nUp to **3 walls total** (a tent has three coverable sides plus the open front). You can mix full and half — for example 1 full back wall + 2 half side walls.\n\n## What they cost\n\n| Size | Per wall |\n| --- | --- |\n| 10x10 | $275 |\n| 10x15 | $365 |\n| 10x20 | $365 |\n\n## Popular setups\n\n- **1 back wall** — the classic branded backdrop.\n- **Back + 1 side** — wind protection and a corner booth.\n- **3 walls** — an enclosed, photo-ready space.\n\n[Add walls to your canopy →](/products)',
  ARRAY['guide','walls'],
  'published', now() - interval '3 days'
),
(
  'how-to-prepare-artwork-for-a-custom-canopy-tent',
  'How to Prepare Artwork for a Custom Canopy Tent',
  'File types, resolution and layout tips so your custom canopy tent prints sharp — plus what to do if you do not have artwork ready.',
  E'## Get the files right\n\nDye sublimation prints edge to edge in full colour, so good source files matter.\n\n- **Format:** vector (PDF, AI, EPS) is ideal; high-resolution PNG/TIFF also works.\n- **Resolution:** at least 150 DPI at full size for raster art.\n- **Colour:** design in CMYK where possible so on-screen colour matches print.\n- **Fonts:** outline/embed them so nothing shifts.\n\n## Layout tips\n\n- Keep logos and key text **centred and away from seams and edges**.\n- Remember the **valance** (the hanging skirt) is prime eye-level space — put your name or tagline there.\n- High contrast reads from a distance; busy backgrounds bury a logo.\n\n## No print-ready file?\n\nTwo options at checkout:\n\n1. **Upload what you have** — we review it and flag issues on the free proof.\n2. **Add our design service (+$35)** — our team builds the artwork for you.\n\nEither way, **nothing prints until you approve the proof**.\n\n[Configure your canopy and upload artwork →](/products)',
  ARRAY['guide','artwork'],
  'published', now() - interval '2 days'
),
(
  'custom-canopy-tent-buying-guide',
  'Custom Canopy Tent Buying Guide',
  'Everything to decide before ordering a custom printed canopy tent: size, frame, walls, print coverage, delivery speed and artwork.',
  E'## 1. Size\nPick by table count and booth space — 10x10 (standard), 10x15 (more room), 10x20 (double booth). See [what size to buy](/blog/what-size-canopy-tent-should-i-buy).\n\n## 2. What you get\n- **Full set** — printed canopy + aluminium hex frame + carry bag.\n- **Printed Canopy Top Only** — the custom-printed fabric top for a frame you already own. Pricing varies by canopy size; see the product page for current pricing.\n\n## 3. Walls\nAdd up to **3 walls** (full or half, same price) for weather cover and branding. See [wall options](/blog/custom-canopy-tent-wall-options-explained).\n\n## 4. Print\nEvery canopy is **dye-sublimated** — ink bonded into the fabric, so it will not crack, peel or fade in the sun.\n\n## 5. Delivery speed\n- **6-8 business days** — standard.\n- **2-3 business days** — rush (+50%).\n\n## 6. Quantity\nOrdering **3 or more** drops the per-tent price automatically.\n\n## 7. Artwork\nUpload a print-ready file or add the **design service ($35)**. You approve a free proof before anything prints.\n\n[Start configuring →](/products)',
  ARRAY['buying guide'],
  'published', now() - interval '1 day'
),
(
  'how-much-does-a-custom-printed-canopy-tent-cost',
  'How Much Does a Custom Printed Canopy Tent Cost?',
  'Transparent pricing for custom printed canopy tents — base prices by size, wall costs, rush fees and volume discounts.',
  E'## Base price by size\n\nEach price is the full set — printed canopy, aluminium hex frame and carry bag.\n\n| Size | 1-2 units | 3+ units (each) |\n| --- | --- | --- |\n| 10x10 | $835 | $799 |\n| 10x15 | $1,375 | $1,250 |\n| 10x20 | $1,635 | $1,445 |\n\n## Add-ons\n\n- **Walls** (full or half, up to 3): $275 each on 10x10, $365 each on 10x15 and 10x20.\n- **Rush production** (2-3 days instead of 6-8): +50% of the order.\n- **Design service** (we create the artwork): one-time $35.\n- **Printed Canopy Top Only** (the fabric top, no frame): a separate lower price per size — see the product page. For customers who already have a compatible frame.\n\n## Example\n\nA 10x10 with 1 printed back wall, standard delivery: **$835 + $275 = $1,110**. Order three and the tent price drops to $799 each.\n\n## No hidden quotes\n\nEvery price updates live as you configure — no waiting on a sales rep. Free shipping over $99.\n\n[Price your canopy now →](/products)',
  ARRAY['buying guide','pricing'],
  'published', now() - interval '6 hours'
)
on conflict (slug) do nothing;

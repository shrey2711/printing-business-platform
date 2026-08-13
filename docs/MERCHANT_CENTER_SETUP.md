# Google Merchant Center — Readiness & Setup

Status: **not yet connected.** This documents the human/account steps (which
Claude cannot perform) and the data readiness on the site side.

## Data readiness (site side)
Product data has a single source of truth in `backend/data/products.js`
(`listProducts`, `priceDisplayFor`). Structured data on product pages uses
`Product` + `AggregateOffer` with `availability: MadeToOrder` and USD pricing
(see `scripts/prerender.mjs`). Product pages carry real photo galleries.

**Feed:** a Google Shopping product feed is the next technical task. It should be
generated at build from `listProducts()` so it never contradicts the site:
- Include only **active, publicly-listed, priced** products (canopies, table
  covers, retractable/X-stand banner stands, step & repeat backdrop).
- Fields: `id` (slug), `title`, `description`, `link` (canonical product URL),
  `image_link` (real product photo), `additional_image_link` (gallery), `price`
  + `USD`, `availability` (`in_stock` / made-to-order equivalent), `condition`
  (`new`), `brand` (Apex Trade Show).
- **No GTIN/MPN:** these are custom-made, so set `identifier_exists = no`.
- For "starting at" prices, the feed price must match the visible starting price
  and its meaning (e.g. canopy "complete set" vs "top only") — do not advertise a
  top-only price as the full product.
- Quote-only display types (SEG, tension fabric, pop-up, flags) are **excluded**
  from the feed until they have real prices.

## Human/account steps (owner — Claude cannot do these)
1. Create/verify a **Google Merchant Center** account for the business.
2. **Verify and claim** the website `https://www.apextradeshow.com` in Merchant
   Center (via Search Console / meta tag / DNS).
3. Set up **business information**, **shipping** settings (real carriers, rates,
   transit times — currently a stub on-site; Merchant Center requires real values),
   and **return policy** (real terms — currently owner-pending).
4. Submit the product feed (scheduled fetch of the generated feed URL, or Content API).
5. Resolve any disapprovals (usually price/availability/policy mismatches).
6. Only after Google approves items are they eligible for Shopping surfaces.

## Blockers requiring real owner policy (do not fabricate)
- **Shipping terms** (carriers, rates, transit) — Merchant Center requires these.
- **Return policy terms** — required for the returns feed attribute and trust.
- **Warranty terms** — not required by Merchant Center but referenced on-site.

Do **not** claim Merchant Center approval anywhere on the site until Google has
actually approved the account and items.

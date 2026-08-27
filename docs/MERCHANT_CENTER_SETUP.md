# Google Merchant Center — Readiness & Setup

Status: **feed live at `/feed.xml`; account not yet connected.** The product
feed is implemented and price-parity-tested; the remaining steps are the
human/account actions below (which Claude cannot perform).

## Data readiness (site side)
Product data has a single source of truth in `backend/data/products.js`
(`listProducts`, `priceDisplayFor`). Structured data on product pages uses
`Product` + `AggregateOffer` with `availability: MadeToOrder` and USD pricing
(see `scripts/prerender.mjs`). Product pages carry real photo galleries.

**Feed: IMPLEMENTED** — live at **`https://www.apextradeshow.com/feed.xml`**
(RSS 2.0 + `g:` namespace, Google Shopping format). Generated at build from
`listProducts()` in `scripts/prerender.mjs`, so it never contradicts the site.
`scripts/test-seo-invariants.mjs` asserts every feed price matches the product's
landing page (price parity is gated by `npm test`).

Per item: `g:id` (slug), `title`, `description`, `link` (canonical product URL),
`g:image_link` (real product photo) + `g:additional_image_link` (gallery),
`g:price` in **USD** (the real "starting at" / lowest purchasable config),
`g:availability` `in_stock`, `g:condition` `new`, `g:brand` Apex Trade Show,
`g:identifier_exists` `no` (custom-made — no GTIN/MPN), `g:google_product_category`
"Business & Industrial > Advertising & Marketing > Trade Show Displays",
`g:product_type` + `g:custom_label_0` = category, `g:custom_label_1` =
`starting-price` (segment configurable SKUs).

- **17 products** currently listed; **4 excluded** (quote-only / no advertisable
  price: SEG kits, tension-fabric quote SKUs, podium, etc.). Quote-only SKUs stay
  out until they have real prices.
- **"Starting at" honesty:** the feed price is the lowest *purchasable* config
  (e.g. canopy `510.00 USD` = printed top only, matching the landing page). It
  never advertises a price the customer cannot actually buy at.
- **CAD:** the current feed is USD for the US target. A CAD feed for a Canada
  target can be added later by emitting a second file with converted prices — do
  not mix currencies in one feed.

## Human/account steps (owner — Claude cannot do these)
1. Create/verify a **Google Merchant Center** account for the business.
2. **Verify and claim** the website `https://www.apextradeshow.com` in Merchant
   Center (via Search Console / meta tag / DNS).
3. Set up **business information**, **shipping** settings (real carriers, rates,
   transit times — currently a stub on-site; Merchant Center requires real values),
   and **return policy** (real terms — currently owner-pending).
4. Submit the product feed: in Merchant Center → **Products → Feeds → Add feed**,
   choose **Scheduled fetch**, and enter the feed URL
   `https://www.apextradeshow.com/feed.xml` (set a daily fetch). The feed
   regenerates on every deploy, so scheduled fetch keeps it current.
5. Resolve any disapprovals (usually price/availability/policy mismatches).
6. Only after Google approves items are they eligible for Shopping surfaces.

## Blockers requiring real owner policy (do not fabricate)
- **Shipping terms** (carriers, rates, transit) — Merchant Center requires these.
- **Return policy terms** — required for the returns feed attribute and trust.
- **Warranty terms** — not required by Merchant Center but referenced on-site.

Do **not** claim Merchant Center approval anywhere on the site until Google has
actually approved the account and items.

---

## Operations

### How to generate the feed
The feed is generated at build time — no separate command:
```
npm run build          # writes dist/feed.xml from listProducts()
```
Feed URL (after deploy): `https://www.apextradeshow.com/feed.xml`.

### Currency handling (USD now; CAD is owner/future)
- The current feed is **USD** for the **US** target. Every `g:price` matches the
  USD "Starting at $X" on the product page (asserted by `npm test`).
- The site can display **CAD** via a live FX conversion. A CAD feed must show a
  price that matches what the CA-market landing page charges — but a live-FX
  number is not stable enough to submit as a fixed feed price. **To ship a CAD
  feed, the owner must provide either a fixed CAD price list or authorize a
  build-time FX snapshot**; then add a second `dist/feed-ca.xml` targeted at
  Canada. Do not mix currencies in one feed.

### Update cadence
The feed regenerates on every deploy. In Merchant Center use **Scheduled fetch,
daily**, so approvals track the live catalog automatically.

### Validation procedure
1. `npm test` — asserts feed is well-formed, every item has the required fields
   (id/title/description/image_link/availability/condition/brand/identifier_exists),
   price format is `N.NN USD`, links resolve, and **feed price == landing price**.
2. After deploy, run Merchant Center **Diagnostics** and Google's
   **Rich Results Test** on a product URL.

### Troubleshooting price mismatches
- `npm test` fails with `feed {id} — price … not shown on landing page` →
  the engine `startingPrice` changed but the page cache/prerender is stale;
  rebuild. Feed, schema, card and page all derive from `listProducts()`, so a
  mismatch means a stale artifact, never divergent data.
- Merchant Center "price mismatch" disapproval → confirm the deployed
  `/feed.xml` is the latest build (scheduled fetch may be a day behind a hotfix;
  trigger a manual fetch).
- Quote-only SKU rejected for "missing price" → it should be **excluded** from
  the feed; if it appears, its `startingPrice` became non-null unexpectedly —
  check the pricing model.

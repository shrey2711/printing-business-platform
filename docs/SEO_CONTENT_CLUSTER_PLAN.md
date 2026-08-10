# Apex Trade Show — SEO Content Cluster Plan

**Status:** planning only — nothing published from this doc. Implement articles ONE at a time.
**Rule reminder:** never invent specs/pricing/reviews; preserve canopy SEO authority; individual products stay independently purchasable; booth packages are an additional path and must not cannibalize tent pages.

## How to read this
Each cluster = one **pillar** (a category page) + **spokes** (product pages + buying-guide/informational articles) that link up to the pillar and across to siblings. "Commercial" pages target buy-intent; "informational" articles target research-intent and funnel to the commercial pages.

## Current page inventory (audit)

**Category (pillar) pages** — all live, indexable:
`/trade-show-displays` (hub) · `/custom-canopies` · `/banner-stands` · `/table-covers` · `/backdrops`

**Product (commercial) pages** — live:
`/products/canopy-tent-10x10` · `-10x15` · `-10x20` · `/products/pleated-table-covers` · `/products/stretch-table-covers` · `/products/standard-retractable-banner` · `/products/deluxe-retractable-banner` · `/products/x-stand-banner` · `/products/table-top-banner-stand` · `/products/step-and-repeat-backdrop`

**Informational pages** — live:
Size guides `/sizes/10x10` · `/10x15` · `/10x20` (canopy-only) · Solution/use-case pages `/solutions/{vendor-market,trade-show,sports-team,food-truck,church-school,job-site}-tents` (canopy-only) · `/artwork-guidelines`

**Blog:** `/blog` hub repositioned to "Trade Show Resources & Buying Guides" (TASK 8). Articles are Supabase-authored; historically canopy-focused. **Currently ~0 articles build locally** (Supabase not wired at build) — see "Implementation note" at the end.

**Gap at a glance:** canopy has deep informational support (size guides + 6 use-case pages); banner stands, table covers and backdrops have product pages but **almost no informational/comparison content**; there is **no booth-packages pillar yet** (TASK 10).

---

## Cluster 1 — Custom Canopy Tents  *(protect existing authority; do not cannibalize)*

- **Pillar:** `/custom-canopies`
- **Existing commercial:** 10x10 / 10x15 / 10x20 product pages.
- **Existing informational:** 3 size guides + 6 solution pages. **This cluster is already strong — mostly maintain.**
- **Missing commercial:** none critical. (Replacement tops / sidewalls exist as dormant `active:false` products — a future decision, not a gap.)
- **Missing informational (low priority — canopy is saturated):**
  - "10x10 vs 10x15 vs 10x20 canopy tent — which size?" (a *comparison* guide that links to all three; distinct from the individual size guides which stay single-size).
  - "How to design a custom canopy tent (artwork prep)" — thin overlap with `/artwork-guidelines`; only build if canopy-specific enough to not duplicate.
- **Keyword intent:** high commercial ("10x10 custom canopy tent", "custom pop up tent with logo"); the size guides target "10x10 canopy tent size". Buyers here want ONE tent — keep pages single-tent-focused.
- **Internal linking:** size guides + solutions → up to `/custom-canopies`; product pages cross-link to table covers/banners as booth add-ons (already in `related`). Add a single link from each tent page to `/trade-show-booth-packages` ("Need the whole booth?") once it exists — a soft upsell, NOT a redirect.
- **Cannibalization risk:** **HIGH and pre-existing.** Keep the 10x10 product page as the canonical target for "10x10 custom canopy tent". Ensure the new booth-packages page and any "complete booth" article do NOT target single-tent queries. Size guides (`/sizes/*`) must stay informational, product pages commercial (this split was fixed earlier — maintain).

## Cluster 2 — Retractable Banner Stands  *(biggest content gap = biggest opportunity)*

- **Pillar:** `/banner-stands`
- **Existing commercial:** standard-retractable-banner, deluxe-retractable-banner, table-top-banner-stand (x-stand also in this category).
- **Missing informational (HIGH priority — buyers compare before buying):**
  1. **Standard vs Deluxe Retractable Banner — which to choose?** → TASK 13 Article 1. Links both product pages.
  2. **What size retractable banner should I buy?** (33×81 standard vs tabletop 11.5×17.5). → Article 3.
  3. "Retractable banner stand setup & care" (uses real specs: tool-free, replaceable graphic).
- **Missing commercial:** none — the four products cover the range.
- **Keyword intent:** commercial ("retractable banner stand", "roll up banner"); comparison/research ("standard vs deluxe banner", "what size retractable banner") — these are cheap-to-rank, high-conversion.
- **Internal linking:** each guide → the two/three product pages it compares + up to `/banner-stands` + across to `/trade-show-displays`. Product pages → the comparison guide ("Not sure which? See our comparison").
- **Cannibalization risk:** LOW, but keep each product page as the target for its own brand/model query; guides target comparison queries only.

## Cluster 3 — X-Stand Banners

- **Pillar:** `/banner-stands` (X-stand is a member; no separate pillar needed).
- **Existing commercial:** `/products/x-stand-banner` (24×63).
- **Missing informational (HIGH priority):**
  1. **X-Stand vs Retractable Banner — which is right for you?** → Article 2. (economy/portability vs premium/reusable). Links x-stand + standard-retractable + `/banner-stands`.
- **Keyword intent:** "x-stand banner", "x banner stand vs retractable" (research → conversion).
- **Internal linking:** guide → x-stand + standard-retractable product pages; x-stand page → the comparison guide.
- **Cannibalization risk:** LOW. Ensure the X-vs-Retractable guide does not outrank the x-stand product page for "x-stand banner" (guide targets the *comparison* phrase).

## Cluster 4 — Table Covers

- **Pillar:** `/table-covers`
- **Existing commercial:** pleated-table-covers (4/6/8 ft), stretch-table-covers (6/8 ft).
- **Missing informational (HIGH priority — the split invites comparison):**
  1. **Stretch vs Fitted (Pleated) Table Cover — which look?** → Article 5. Links both product pages.
  2. **6 ft vs 8 ft table cover — which size?** → Article 4. (uses real size options; ties to standard folding-table sizes).
- **Missing commercial:** none (runner is a dormant option, not a gap).
- **Keyword intent:** "custom table cover / throw", "stretch vs fitted table cover", "6ft vs 8ft table cloth" (all convertible research).
- **Internal linking:** guides → both table-cover product pages + up to `/table-covers` + across to `/custom-canopies` (booth context). Product pages already cross-link to each other via `related` — add a link to the relevant guide.
- **Cannibalization risk:** MEDIUM — pleated vs stretch pages already overlap. Keep pleated page for "pleated/throw table cover", stretch page for "stretch/fitted table cover"; the comparison article targets "stretch vs fitted" only. (Table-cover data was de-canopied earlier — keep specs product-specific.)

## Cluster 5 — Backdrops

- **Pillar:** `/backdrops`
- **Existing commercial:** `/products/step-and-repeat-backdrop` (10×8).
- **Missing informational (MEDIUM):**
  1. **Trade show backdrop size guide / How to choose a backdrop** → Article 6. (media wall sizing, repeating-logo spacing — from real product copy).
- **Missing commercial:** possibly a tension-fabric / straight backdrop variant later — but **do not invent** a product; flag for owner if demand exists.
- **Keyword intent:** "step and repeat backdrop", "trade show backdrop size", "media wall for events".
- **Internal linking:** guide → step-and-repeat product page + up to `/backdrops` + across to `/trade-show-booth-packages`. Backdrop page → booth packages (backdrops are usually bought as part of a booth).
- **Cannibalization risk:** LOW (only one product).

## Cluster 6 — Trade Show Booth Packages  *(new pillar — TASK 10)*

- **Pillar (to create):** `/trade-show-booth-packages` — recommended combinations of EXISTING products, not new SKUs.
- **Existing commercial:** none yet; will link to all individual product pages.
- **Missing informational (HIGH priority — top-of-funnel, high value):**
  1. **Complete Trade Show Booth Checklist** → Article 7.
  2. **How much does a trade show display/booth cost?** → Article 8. (uses real starting prices + "request a quote" honesty; NO invented bundle prices.)
  3. "How to build a trade show booth on a budget" (later).
- **Keyword intent:** "trade show booth packages/kits", "trade show display packages", "complete event booth", "trade show booth cost/checklist" — broad, high-intent, currently unowned.
- **Internal linking:** pillar → every individual product page + each category ("Shop Canopies Individually", etc.); articles → pillar + relevant product pages. Home + `/trade-show-displays` → link to the packages pillar.
- **Cannibalization risk:** **HIGH — the whole point of the guardrail.** The packages pillar and its articles must target *complete-booth/package* intent only. They must NOT rank for "10x10 custom canopy tent" or other single-product queries — those stay owned by the product pages. Positioning: "Need one tent?" → product page. "Need a whole booth?" → packages pillar.

---

## Priority build order (buy/choose intent first)

| # | Article | Cluster | Intent | Priority |
|---|---|---|---|---|
| 1 | Standard vs Deluxe Retractable Banner | 2 | compare→buy | ★★★ (TASK 13) |
| 2 | X-Stand vs Retractable Banner | 3 | compare→buy | ★★★ |
| 3 | What Size Retractable Banner Should I Buy? | 2 | choose→buy | ★★★ |
| 4 | 6 ft vs 8 ft Table Cover | 4 | choose→buy | ★★★ |
| 5 | Stretch vs Fitted Table Cover | 4 | compare→buy | ★★★ |
| 6 | Trade Show Backdrop Size Guide | 5 | choose→buy | ★★ |
| 7 | Complete Trade Show Booth Checklist | 6 | plan→buy | ★★ |
| 8 | How Much Does a Trade Show Display Cost? | 6 | research→buy | ★★ |
| — | 10x10 vs 10x15 vs 10x20 Canopy (comparison) | 1 | choose→buy | ★ (canopy already strong) |

## Cross-cluster internal-linking model
```
Home
 └─ /trade-show-displays (hub)
     ├─ /custom-canopies ──── product pages (10x10/15/20) ──── size guides, solution pages
     ├─ /banner-stands ────── standard / deluxe / x-stand / tabletop ──── guides 1,2,3
     ├─ /table-covers ─────── pleated / stretch ──── guides 4,5
     ├─ /backdrops ────────── step-and-repeat ──── guide 6
     └─ /trade-show-booth-packages ── links to ALL products + categories ── guides 7,8
```
Every buying guide links: (a) up to its pillar, (b) to the specific product pages it discusses, (c) across to `/trade-show-displays`. No generic "click here" anchors; descriptive text; no repetition/keyword stuffing.

## Implementation note (blog storage)
Articles are stored in Supabase (`blog_posts`) and merged at build by `scripts/buildData.mjs`. Locally Supabase is unconfigured, so repo-only articles won't prerender. **Decision needed before TASK 13:** either (a) author articles in the admin dashboard (they then prerender on the next deploy), or (b) add a small in-repo static-article module that the prerenderer + `/api/blog` merge with Supabase posts (versioned, no DB needed, builds anywhere). Recommend (b) for these evergreen buying guides so they live in git and prerender deterministically.
```
```

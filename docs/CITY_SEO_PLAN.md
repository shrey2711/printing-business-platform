# Apex — City × Category Local SEO Plan

**Source:** `public/Apex_Trade_Show_US_City_SEO_Keywords.xlsx` (City Matrix, All Keywords, Priority Summary).
**Goal:** category-first local landing pages — `/trade-show-canopies/[city]`, `/trade-show-displays/[city]`, `/banner-stands/[city]` — 19 cities × 3 = **57 pages**, plus supporting modifier pages (10x10, 10x20, retractable, portable, outdoor, custom printed, branded).

## Cities (from the sheet)
- **Tier 1 (8):** Las Vegas, Orlando, Chicago, Atlanta, New York, Dallas, Los Angeles, Houston
- **Tier 2 (7):** Miami, Baltimore, Anaheim, Washington DC, Philadelphia, San Diego, Boston
- **Tier 3 (4):** Phoenix, Denver, New Orleans, San Antonio

## The two risks to resolve BEFORE building (per the Apex SEO rule)

### 1. Thin doorway pages (hard rule violation if done wrong)
57 pages that only swap the city name = the exact doorway pattern that already got the earlier `/locations` city pages noindex'd. **Every page must carry genuinely local, useful content**, not a templated shell. Real hooks available per city (public facts): the major **convention center(s)** (e.g. Las Vegas Convention Center + Mandalay Bay; Chicago = McCormick Place; Orlando = Orange County CC; Atlanta = Georgia World Congress Center; NYC = Javits; Dallas = KBHCCD; LA = LACC; Houston = George R. Brown), typical local show types, and the category's real products + pricing + internal links. That's enough for unique T1 pages; thinner cities stay noindex until earned.

### 2. Cannibalization with existing `/locations/[state]/[city]` (CRITICAL — decide this first)
The existing location pages are **canopy-focused**. `/trade-show-canopies/[city]` targets the *same* intent ("canopies in {city}"). Two URLs competing for one query splits authority. **Options:**
- **A. Consolidate (recommended).** Make the new category×city pages the canonical local pages; 301 the old `/locations/[state]/[city]` canopy pages into `/trade-show-canopies/[city]` (or canonical-tag them). One URL per intent. Preserves authority via redirect.
- **B. Differentiate.** Keep `/locations/*` as a state/city hub (all products, navigation) and the new pages as category-specific. Requires the location pages to stop competing on the canopy head term (retarget to "trade show displays in {city}" hub intent).
- **C. Only build the two NEW categories** (`/trade-show-displays/[city]`, `/banner-stands/[city]`) and reuse existing `/locations` for canopies. Avoids canopy duplication entirely; fewer new pages.

## Recommended phased build
1. **Phase 1 — Tier 1, done right (24 pages):** 8 cities × 3 categories, each with unique local content (convention center + local context), category products with real prices, internal links up to the category + across to sibling category-city pages + the product pages. Indexed, in sitemap.
2. **Phase 2 — Tier 2/3 (33 pages):** built but `noindex, follow` until each earns unique content (same discipline as the current priority-city gate). Promoted to indexed as content is written.
3. **Supporting modifier pages:** map "10x10 / 10x20 / retractable / outdoor / custom printed" to the EXISTING product + size-guide pages with the right internal anchors — do **not** spin up a separate page per modifier per city (that's thin-page explosion). Use them as on-page keyword targets within the city pages.

## Data/infra needed
- `src/data/citySeo.js`: the 19 cities with slug, state, tier, and a short unique local blurb + convention-center fact per city (I'll draft from public info — no invention of Apex specifics).
- 3 React routes + 3 prerender loops (mirror the existing category-page pattern), BreadcrumbList + LocalBusiness/Service schema per page, sitemap entries for indexed tiers only.
- Redirect/canonical handling for option A/B (middleware or canonical tags).

## Decision needed
Which cannibalization option — **A (consolidate, recommended)**, **B (differentiate)**, or **C (skip canopy city pages)** — and confirm the phased indexing (T1 indexed, T2/T3 noindex until content). On your answer I'll build Phase 1 (Tier 1) with real per-city content.

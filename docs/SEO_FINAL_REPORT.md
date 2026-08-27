# SEO / AEO / GEO Engagement — Final Report (Phase 16)

**Date:** 2026-08-27 · Site: https://www.apextradeshow.com
Companion docs: [`SEO_BASELINE.md`](SEO_BASELINE.md) (phase status matrix),
[`LOCATION_AUDIT.md`](../LOCATION_AUDIT.md), [`MERCHANT_CENTER_SETUP.md`](MERCHANT_CENTER_SETUP.md).

No promise of a score or rankings. This documents technically-correct,
evidence-based work that improves eligibility, trust, visibility and conversion,
plus exactly what still needs the owner.

---

## 1. Summary of completed changes (by phase)

| Phase | Commit | Outcome |
|---|---|---|
| 1 Baseline inventory | `8446bd5` | Route/sitemap/meta/schema/location inventory + phase matrix |
| 2 Meta length | `9e7c555` | 4 long titles + 20 long descriptions trimmed; `fitTitle()` guard; warnings 43→20 |
| 15 Test suite | `47e78d1` | `test-seo-invariants.mjs` + `npm test` gate (was **no test runner**) |
| 4 Contradictions | `09a7cad` | Standard Retractable size/FAQ fixed (sells 33×81 **and** 47×81 at instant price); stale "quote-only" comment corrected |
| 10 Merchant feed | `0ab97d3` | Live `/feed.xml` (17 products, USD, price-parity gated) |
| 14 robots.txt | `932015e` | Blocks cart/checkout/login/register/password + `/api/` across all crawler groups |
| 12 Images | `4b129e9` | Hero + PDP gallery LCP images no longer lazy-loaded |
| 6 + 8 Category/AEO | `81b78bd` | Answer block + live-priced comparison table + FAQPage on every category page |

Earlier in-session work (already live before this engagement): city-SEO system
(5 category slugs × 24 cities, tier-gated), backdrop/table-cover city pages,
shipping-model page, "what's in the box" on PDPs, tension-fabric product +
gallery, internal-link clusters.

## 2. Files changed (this engagement)
- **Data/content:** `backend/data/products.js`, `backend/data/staticArticles.js`, `src/data/categoryPages.js`, `src/data/canopy.js`, `src/data/boothPackages.js`, `src/data/resources.js`, `src/data/pages.js`, `src/pages/BlogIndex.jsx`.
- **Render:** `scripts/prerender.mjs` (fitTitle, feed, category answer/compare/FAQ), `src/pages/CategoryPage.jsx`, `src/components/ProductGallery.jsx`, `src/pages/HomePage.jsx`, `src/styles.css`.
- **Infra/test:** `scripts/test-seo-invariants.mjs` (new), `package.json` (`npm test`), `public/robots.txt`.
- **Docs:** `docs/SEO_BASELINE.md`, `docs/SEO_FINAL_REPORT.md` (this), `docs/MERCHANT_CENTER_SETUP.md`, `LOCATION_AUDIT.md`.

## 3. Tests & results
`npm test` runs: `verify-media` → `verify-banner-pricing` (66) → `verify-prerender-meta` (49) → `vite build` → `prerender` → `verify-tension-podium-pricing` (28) → `audit:seo` → `audit:locations` → `test:seo`.
**All green.** `audit:seo`: 258 URLs, 258 unique titles + descriptions, **0 critical defects**, 20 warnings (all "og:image is generic SVG" — Phase 11, needs raster art). `test:seo`: 258 URLs pass H1/canonical/index/length/JSON-LD/img-alt/blog-dates/product-currency/breadcrumb/no-private-in-sitemap + Merchant-feed price parity + robots rules.

## 4. Structured data by page type
| Page type | JSON-LD |
|---|---|
| Home (`/`) | `OnlineStore` (ContactPoint, areaServed US/CA, logo, email, tel) + `WebSite`; FAQPage on visible home FAQ. No `SearchAction` (no public search — correct) |
| Product (`/products/*`) | `Product` + `Offer`/`AggregateOffer` (USD, `MadeToOrder`, price == visible "Starting at") + `Brand` + `BreadcrumbList` + `FAQPage` |
| Category (`/custom-canopies`, `/banner-stands`, …) | `BreadcrumbList` + `ItemList` + **`FAQPage`** (new) |
| Blog (`/blog/*`) | `BlogPosting` (author "Apex Trade Show Production Team", datePublished, dateModified, publisher, mainEntityOfPage) + `BreadcrumbList` + `FAQPage` |
| City (`/{category}/{city}`) | `WebPage`-type + `FAQPage` + `BreadcrumbList` (**no LocalBusiness** — online-only) |
| Landing (`/seg-displays`, …) | `Service` + `FAQPage` |
| Sitemaps | index + 5 children; `/feed.xml` Google Shopping RSS |

## 5. Pages intentionally left unchanged (and why)
- **Warranty** (`/warranty`) — noindex stub; real terms owner-pending (do not fabricate).
- **Extended catalog** (yard signs, channel letters, wall-art, etc.) — out of the trade-show core; not re-spelled (see §6 spelling flag) to avoid a large brand-voice change.
- **Tier-3 city pages** (San Antonio) — deliberately `noindex,follow` until they earn unique depth; not force-indexed.
- **Home/PDP visual design, configurators, cart, checkout, pricing** — untouched by policy (Rule 3); only non-visual perf hints added to images.

## 6. Product-data items needing owner confirmation
- **Spelling house style:** core products use British (`colour`/`aluminium`); extended catalog uses North-American (`color`/`aluminum`). Both internally consistent — pick one and it's a one-pass normalize (see `SEO_BASELINE.md §6b`).
- No other price/spec contradictions found. Banner pricing, tension/podium, and prerender-meta are assertion-locked by verifiers.

## 7. Location pages — keep / improve / noindex / consolidate
From `audit:locations` (**355 pages · 148 indexed · 207 already noindex · 84 flagged**):
- **Keep/index (as-is):** Tier-1/2 city pages with unique `cityDetail` (real venues, industries, climate, FAQs) — the priority convention markets.
- **Improve:** the **84 flagged** indexed pages that still read as templated — listed in `LOCATION_AUDIT.md`. Add a unique local paragraph or verified venue detail, or drop to noindex.
- **Noindex (already correct):** Tier-3 cities + thin state/province pages — `noindex,follow`, excluded from sitemap.
- **Consolidate:** none required — old `/locations/{state}/{city}` already 301 → canonical `/trade-show-canopies/{city}`. Do **not** auto-delete/redirect existing URLs.

## 8. Information still needed from the owner (nothing will be invented)
Real customer reviews/ratings · official social profiles (`sameAs`) · About founding year / legal name / team · shipping rates + free-ship threshold + real transit windows · warranty legal terms · return-policy legal terms · GTIN/MPN (if any exist) · customer photos / case studies (UGC) · spelling house-style choice (§6). These unblock Phases 5, 9, 13 and Merchant Center shipping/returns.

## 9. Expected SEO impact (eligibility, not guarantees)
- **Rich results:** Product (Merchant listings) + FAQ eligibility across products, categories, blog, cities; feed enables Shopping/free listings once the account is connected.
- **CTR:** titles/descriptions within display limits; no truncation of product names.
- **AEO/answer engines:** answer-first blocks + Q&A + comparison tables are extractable, consistent with product data.
- **Crawl hygiene:** private/transactional + `/api/` blocked; no private URL or redirect in any sitemap; single canonical host.
- **CWV:** LCP images no longer lazy-loaded (faster paint on home + PDPs).

## 10. Deployment & rollback
- **Deploy:** merge to `main` → Vercel builds. Build **is** the gate: `npm run build` runs the verifiers and fails the deploy on any pricing/media/meta regression. Run `npm test` locally first for the full audit + invariant suite.
- **Rollback:** `git revert <commit>` (each phase is an isolated commit) and redeploy, or roll back the Vercel deployment to the previous build. No DB migrations, no schema/state changes — reverts are clean.

---

## Phase 16 pre-deploy QA (verified)
- [x] Reviewed diff — content/meta/schema/test only; no configurator/cart/checkout code touched.
- [x] No secrets committed — only `.env.example` tracked; `.env`, `uploads/` gitignored.
- [x] Pricing unchanged — `verify-banner-pricing`, `verify-tension-podium-pricing` pass; feed prices == landing prices.
- [x] Build passes (verifiers + prerender) and full `npm test` green.
- [x] No indexable page carries noindex; no private route in any sitemap (asserted).
- [x] JSON-LD matches visible content (audit + invariant checks).
- [x] No fabricated location/review claims; no LocalBusiness schema.
- [x] Internal links use the canonical host; no broken/redirected internal links.
- [ ] Manual: spot-check major pages on mobile + desktop after deploy (visual only).

## Post-deployment checklist (owner, in Google Search Console / Merchant Center)
1. Submit sitemap index `https://www.apextradeshow.com/sitemap.xml` in Search Console.
2. URL-Inspect one of each type (home, a product, a category, a blog post, a city page); request indexing.
3. Validate product **Rich Results** (Rich Results Test) on 2–3 product URLs; check FAQ results on a category + blog page.
4. Merchant Center → add a **Scheduled fetch** feed at `https://www.apextradeshow.com/feed.xml` (daily); resolve disapprovals (usually shipping/returns/policy — owner-supplied).
5. Monitor **Page Indexing** report weekly for the first month (watch for the 84 flagged location pages).
6. Monitor **Core Web Vitals** (field data) + run Lighthouse to finish Phase 12 (head preload, fonts/JS, contrast).
7. Compare **branded vs non-branded** queries in the Performance report over 4–8 weeks.
8. Track **product-page clicks/impressions** and on-site conversions (quotes/orders).
9. Review **Merchant Listings** report once items are approved.
10. Begin collecting **genuine customer reviews** (unblocks Review/AggregateRating schema) and real social profiles (`sameAs`).
11. Where analytics identifies them, track **AI-search referrals** (ChatGPT/Perplexity/Gemini) as a distinct source.

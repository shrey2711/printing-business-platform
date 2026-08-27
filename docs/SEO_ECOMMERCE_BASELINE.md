# Apex Trade Show — SEO & Ecommerce Baseline

**Date:** 2026-08-27 · Inspection only (no fixes in this step).
Reproduce: `npm run build && node scripts/seo-baseline-report.mjs`.
Companion: [`SEO_BASELINE.md`](SEO_BASELINE.md), [`SEO_FINAL_REPORT.md`](SEO_FINAL_REPORT.md), [`../LOCATION_AUDIT.md`](../LOCATION_AUDIT.md).

## Tooling baseline (lint / tests / build)
| Gate | Status |
|---|---|
| `npm run build` (verify-media, verify-banner-pricing 66, verify-prerender-meta 49, vite, prerender) | **PASS** |
| `npm test` (build → tension/podium 28 → audit:seo → audit:locations → test:seo) | **PASS, exit 0, no failing tests** |
| `audit:seo` | **PASS** — 0 critical defects, 20 non-critical warnings |
| `test:seo` (SEO invariants, 263 URLs) + Merchant-feed price parity + robots + home LCP preload | **PASS** |
| **Lint / ESLint** | **NONE** — no `lint` script, no eslint config (tooling gap, see findings) |
| **Type checking** | **NONE** — plain JS/JSX, no TypeScript |
| **Playwright / e2e** | **NONE** — configurator/cart/checkout not covered by browser tests |

## Sitemaps & URL counts
5 child sitemaps + index. **263 indexable URLs.**
`pages=20 · categories=12 · products=21 · blog=19 · locations=191`

**By page type:** city=120 · state=64 · product=21 · policy/other=15 · category/hub=14 · blog-article=18 · solution=6 · size-guide=3 · home=1 · blog-index=1.

## Meta / canonical / H1 / indexability (all clean)
- Missing titles **0** · duplicate titles **0** · missing descriptions **0** · duplicate descriptions **0**.
- Canonical mismatches **0** (every page self-canonical to its production URL).
- Pages with H1 ≠ 1: **0**.
- noindex URLs in a sitemap: **0** · sitemap 404s: **0** · **redirecting sitemap URLs: 0**.
- Private routes (cart/checkout/account/admin/login/register/order/reset/forgot) indexable or in sitemap: **0** (all noindex + excluded; robots.txt blocks them + `/api/`).
- Broken internal links: **0**.

## JSON-LD by page type (all pages carry OnlineStore + WebSite via the shared head)
| Page type | Types |
|---|---|
| Product (×21) | Product + Offer/AggregateOffer (nested) + Brand + BreadcrumbList + FAQPage |
| Category/hub | BreadcrumbList + ItemList + FAQPage (+ Service on landings) |
| Blog article (×18) | BlogPosting + BreadcrumbList + FAQPage |
| City (×120) | BreadcrumbList + FAQPage (no LocalBusiness — online-only) |
| State (×64) | BreadcrumbList |
| Home | OnlineStore + WebSite + FAQPage |

- **Product pages missing Product or Offer schema: 0** (quote-only SKUs correctly carry no Offer).
- **Articles missing BlogPosting: 0.**

## Location pages
- 64 state/province pages (all indexed) + 120 city pages (5 category slugs × 24 cities, all indexed after San Antonio promotion).
- **Duplication signal:** the deeper `/locations/{state}/{city}` pages are noindex/redirecting by design; `audit-locations` flags **84 indexed pages** that still read as templated (candidates for unique content or noindex) — full list in `LOCATION_AUDIT.md`. Not an indexability bug.

## Images
- Prerendered `<img>`: **262** · missing alt: **0** · missing width/height: **0**.
- **Oversized source images (>500KB): 20**, largest **2.6MB**. Worst offenders are flag PNGs (2.1–2.6MB) and tension-display PNGs (1.3–1.5MB). These are the main Core-Web-Vitals risk (no AVIF/WebP variants for several PNGs).

---

## Prioritized findings (no fixes applied here)
| # | Priority | Finding | Fix belongs to |
|---|---|---|---|
| 1 | **High** | 20 source images >500KB (up to 2.6MB PNGs); no responsive/AVIF variants for several. LCP/CWV risk. | `perf: improve accessibility and Core Web Vitals` |
| 2 | Medium | 20 pages fall back to the generic OG SVG (no route-specific raster social image). | image/perf phase |
| 3 | Medium | 84 location pages read as templated (indexed) — need unique venue/shipping/industry content or noindex. | `feat: add location page quality controls` |
| 4 | Medium | **No lint / ESLint / type-check** in the repo — no static-analysis gate. | tooling (add eslint + `npm run lint`) |
| 5 | Medium | **No Playwright/e2e** — configurator, cart, checkout, quote have no automated browser coverage. | `feat: improve priority product page conversion UX` / accessibility phase |
| 6 | Low | Product spec breadth: weight, packed dims, setup time/people not in data (would be placeholders). | owner data |
| 7 | — | Commercial facts still owner-blocked: reviews/ratings, `sameAs` socials, About founding/team, shipping rates + free-ship threshold, warranty/return legal terms. | owner |

**Already resolved in prior work (not re-listed as gaps):** Standard Retractable size/FAQ contradiction, "Shipping additional." wording, spelling normalized to North-American, Merchant feed live, category comparison/FAQ/answer blocks, home/PDP LCP images no longer lazy, robots.txt hardened.

## Backlog — the 11 follow-up task packages (each its own commit)
Requested as separate commits; sequenced by dependency:
1. `fix: centralize product facts and remove commercial inconsistencies` (single source of truth) — **do first** (others consume it).
2. `feat: validate and strengthen ecommerce structured data`
3. `feat: add location page quality controls`
4. `feat: improve answer-ready buying guides`
5. `feat: add Google Merchant Center product feed` (largely done — validate/extend + docs)
6. `feat: improve priority product page conversion UX` (+ Playwright)
7. `fix: correct product imagery and optimize image delivery` (addresses finding #1/#2)
8. `feat: strengthen category pages and internal linking` (partly done)
9. `feat: improve buyer trust and order transparency`
10. `perf: improve accessibility and Core Web Vitals` (+ axe/Lighthouse CI)
11. `chore: complete SEO AEO GEO and conversion release` (final audit — last)

# SEO Baseline & Inventory — apextradeshow.com

**Generated:** 2026-08-27 · **Phase 1 of the 16-phase SEO/AEO/GEO brief.**
Non-destructive snapshot of the current state *before* new changes, plus a
phase-by-phase status matrix so completed work is not redone (Operating Rule 9).

Regenerate the machine parts with:

```
npm run build          # prerender + sitemaps + KNOWN_ROUTES
npm run audit:seo      # meta/canonical/H1/JSON-LD/broken-link audit (258 URLs)
npm run audit:locations # LOCATION_AUDIT.md quality scoring
```

---

## 1. Framework & architecture (verified, not assumed)

- **Frontend:** React 18 SPA + Vite. Client routes in `src/App.jsx`.
- **API:** Express (Node ESM), serverless on Vercel (`backend/app.js`). Public
  product data via `/api/products` + `/api/products/:slug` (spreads full product).
- **Prerender:** build-time `scripts/prerender.mjs` writes static `index.html`
  per route with title/description/canonical/OG/Twitter/JSON-LD +
  `#seo-prerender` server HTML that the SPA hydrates over. Meta applied via
  `scripts/lib/seo-meta.mjs` (function replacers — `$`-safe).
- **Single source of truth (pricing/specs):** `backend/data/products.js` +
  `backend/data/pricing.js` (`computePrice`). Consumed by API, prerender PDPs,
  category pages, and blog price rows via `${startFrom()}`.
- **Canonical host:** `https://www.apextradeshow.com` (ORIGIN in prerender).
- **Verifiers in the build chain:** `verify-media`, `verify-banner-pricing` (66),
  `verify-prerender-meta` (49), `verify-tension-podium-pricing` (28). Plus
  `audit-seo.mjs` and `audit-locations.mjs`. **No jest/vitest runner exists yet.**

---

## 2. Route inventory (by type)

| Type | Count | Indexable | Notes |
|---|---|---|---|
| Homepage | 1 | yes | OnlineStore + WebSite JSON-LD |
| Category / landing hubs | 12 | yes | `sitemap-categories.xml` |
| Product (PDP) | 21 | yes | `sitemap-products.xml` |
| Blog / article | 19 | yes | `sitemap-blog.xml` |
| Policy / trust / info | 20 | mixed | `sitemap-pages.xml` (warranty is noindex stub) |
| Location URLs | 186 in sitemap / 355 prerendered | tiered | `sitemap-locations.xml`; see §5 |
| Transactional / private | ~10 | **noindex, not in sitemap** | cart, checkout, account, admin, login, register, order, quote, reset/forgot-password |
| Canopy solutions / size guides | 6 + 3 | yes | `/solutions/*`, `/sizes/*` |

**Local city-SEO pages (canonical "Option A"):** 5 category slugs ×
24 cities = 120 city pages —
`/trade-show-displays|trade-show-canopies|banner-stands|trade-show-backdrops|table-covers/{city}`.
Tier 1–2 indexed (23 cities); tier 3 (San Antonio) noindex. Old
`/locations/{state}/{city}` 301 → `/trade-show-canopies/{city}` (never indexed,
excluded from sitemap).

---

## 3. Sitemaps (from `dist/`)

| Sitemap | URLs |
|---|---|
| `sitemap.xml` (index) | 5 children |
| `sitemap-pages.xml` | 20 |
| `sitemap-categories.xml` | 12 |
| `sitemap-products.xml` | 21 |
| `sitemap-blog.xml` | 19 |
| `sitemap-locations.xml` | 186 |
| **Total indexable** | **258** |

Private/transactional routes are noindex stubs and correctly excluded (verified by
`audit-seo.mjs` "no private route in sitemaps"). `lastmod` from `git log` per file.

---

## 4. Meta / schema audit results (`npm run audit:seo`)

**258 URLs · 258 unique titles · 258 unique descriptions · 0 critical defects.**

Passed invariants: exactly one of each head tag per page, self-referencing
canonical, `lang` set, correct index/noindex, valid JSON-LD (parses), no nested
meta, no placeholder brand, **no broken or redirected internal links**, no
private route in any sitemap.

**Warnings: 43 at baseline → 20 after Phase 2** (all remaining are the generic-OG item):

| Warning | Baseline | Now | Meaning | Fix phase |
|---|---|---|---|---|
| `og:image is generic SVG` | 20 | 20 | page falls back to generic OG art, no route-specific raster | 11 (image) |
| `description too long (>160)` | 19 | 0 | trimmed to target in Phase 2 | 2 ✅ |
| `title too long (>60)` | 4 | 0 | trimmed / `fitTitle()` guard in Phase 2 | 2 ✅ |

### Structured data currently emitted (per page type)
- **Home:** `OnlineStore` (+ `ContactPoint`, `areaServed` US/CA, logo, email, tel) + `WebSite`. FAQPage on visible home FAQ. *No `SearchAction`* (no public site search — correct).
- **PDP:** `Product` + `AggregateOffer`/`Offer` + `Brand` + `BreadcrumbList` + `FAQPage`. Price matches visible "Starting at $X".
- **Category:** `CollectionPage`/`ItemList` + `BreadcrumbList`.
- **Blog:** `BlogPosting` (author = "Apex Trade Show Production Team") + `BreadcrumbList` + `FAQPage`; EEAT byline w/ updated date + read time.
- **City pages:** `WebPage`-type + `FAQPage` + `BreadcrumbList`. **No LocalBusiness** (online-only — correct per brief §F).
- **Landings:** `Service` + `FAQPage`.

---

## 5. Location quality (`npm run audit:locations` → `LOCATION_AUDIT.md`)

- **355 location pages · 148 indexed · 84 flagged for review · 207 already noindex.**
- Indexing is **tier-gated**, not city-name-swap: tier 1–2 carry unique verified
  `cityDetail` (real convention centers, industries, climate, planning, 6 FAQs);
  tier 3 is noindex,follow until earned. Sitemap includes tier ≤ 2 only.
- No LocalBusiness schema anywhere; copy uses "ships to {city}" / "serves
  exhibitors in {city}" — never implies a local office/warehouse.
- **Full keep/improve/noindex review list: see `LOCATION_AUDIT.md`.**

---

## 6. Phase-by-phase status (brief's 16 phases)

Legend: ✅ done · 🟡 partial · ⬜ open (no owner data needed) · 🔒 owner-blocked.

| Phase | Status | Evidence / gap |
|---|---|---|
| 1 Baseline inventory | ✅ | this document |
| 2 Central SEO helper | ✅ | `seo-meta.mjs` + prerender centralize meta/canonical/OG/Twitter/robots. **Done (commit after baseline):** all 4 long titles + 20 long descriptions trimmed; added `fitTitle()` length-guard for template titles. Remaining: 20 generic-OG pages (Phase 11, needs raster art) |
| 3 Structured data | ✅ | all page types emit valid JSON-LD (see §4); connect via `@id`; no fake review schema |
| 4 Content contradictions | ✅ | **Done:** Standard Retractable size/FAQ contradiction fixed (was "33×81, ask for other sizes via quote" — actually sells 33×81 **and** 47×81 at instant price; corrected `size`, FAQ, seoDescription); stale "quote-only" header comment corrected (banner stands + step-repeat are instant-priced). Verified: "Shipping additional." has no double-period; production-vs-transit wording uniform. **Flagged for owner:** spelling house-style split (see §7) |
| 5 PDP IA & conversion | 🟡 | tabs (desc/specs/template/FAQ) + gallery + what's-in-the-box exist. Open: structured verified-field block (packed dims, weight, setup people) with config placeholders |
| 6 Category & comparison | 🟡 | category hubs exist w/ ItemList. Open: comparison tables + concise FAQs per hub |
| 7 Location QC | ✅ | tiered model + `audit-locations.mjs` scorer + `LOCATION_AUDIT.md`; brief §7 "do not expand" honored |
| 8 AEO | 🟡 | answer-blocks on city pages + PDP/blog FAQs. Open: answer-first blocks on category pages |
| 9 GEO / entity | 🟡 | stable Org `@id`, logo, email, tel, area served, About page. 🔒 legal name, founding year, `sameAs` socials, team |
| 10 Merchant feed | ✅ | **Done:** live `/feed.xml` (RSS 2.0 + g:), 17 priced products, 4 quote-only excluded, USD, generated at build from `listProducts()`, price parity gated by `npm test`. Account connection is owner's step (`MERCHANT_CENTER_SETUP.md`). CAD feed = later |
| 11 Internal linking | ✅ | `internalLinks.js` clusters, guide↔product↔city links, hub "by city". Backlog doc: `SEO_CONTENT_CLUSTER_PLAN.md` |
| 12 Accessibility/perf | 🟡 | mobile hardening done; alt coverage now gated by `npm test`; most media containers have CSS `aspect-ratio` (no CLS); hero/card images carry width/height. **Done:** home hero collage + PDP gallery hero switched from `loading="lazy"` to `eager` + `fetchpriority="high"` (were lazy-loading the LCP). **Open (needs live Lighthouse):** `<head>` LCP preload, font/JS budget, contrast/focus audit |
| 13 Trust components | 🟡 | free-proof / ordering / production-vs-shipping sections exist. 🔒 real reviews/case studies/UGC (placeholders only) |
| 14 Sitemaps & robots | ✅ | 5 sitemaps valid, escaped, no private/redirect URLs. **Done:** robots.txt now Disallows cart/checkout/login/register/password + `/api/` (was only account/admin/order) across all crawler groups; assets not blocked; AI crawlers preserved; asserted in `npm test` |
| 15 Automated testing | ✅ | **Done:** `scripts/test-seo-invariants.mjs` + `npm test` gate (build verifiers → tension/podium → audit:seo → audit:locations → test:seo). Asserts H1 count, canonical, index, unique+length-bounded title/desc, JSON-LD parse, img alt, blog dates/author/publisher, product currency + breadcrumb hierarchy, no private route in sitemap |
| 16 Final QA & docs | ⬜ | pending completion of open phases |

---

## 6b. Owner decision needed — spelling house style (Phase 4)
The catalog has two internally-consistent halves: the **core trade-show
products + trust pages use British spelling** (`colour` ×15 files, `aluminium`
×9), while the **extended catalog** (banners, signs, wall-art — `products.js`
~L1400–2750) uses **North-American spelling** (`color`, `aluminum`). Both are
coherent within themselves, so unifying is a brand-voice call, not a bug fix.
Apex serves US + Canada (where `aluminum` is standard but `colour`/`color`
varies). **Not mass-edited** — tell me which house style to normalize to and
I'll apply it in one pass. (No customer-facing contradiction; purely style.)

## 7. Owner-blocked (do NOT invent — brief §4)

Real customer reviews/ratings · business address / local offices · awards /
certifications · client names · order statistics · delivery-date guarantees ·
shipping rates + free-ship threshold · warranty legal terms · About founding
year / legal name / team · official social profiles (`sameAs`) · GTIN/MPN
identifiers · customer photos (UGC).

## 8. Baseline invariants that must not regress
- 258 unique titles + descriptions; 0 critical `audit:seo` defects.
- No private/transactional route in any sitemap; products & categories stay indexable.
- PDP schema price == visible "Starting at" price; quote-only products carry no invented Offer.
- No LocalBusiness schema; no fabricated review/rating schema.
- Cart/checkout/configurator/pricing untouched.

---

## 9. Recommended next phases (highest value, no owner data)
1. **Phase 2 cleanup** — trim the 19 long descriptions + 4 long titles to target; add a metadata unit test.
2. **Phase 15 test suite** — metadata/canonical/one-H1/JSON-LD-parse/broken-link/no-private-in-sitemap, over representative URLs of each type.
3. **Phase 10 feed route** — generate `/feed.xml` from `products.js` (starting-price + quote-only handling, USD/CAD), matching landing-page prices.
4. **Phase 4 contradiction sweep** — Standard Retractable size spec-vs-FAQ, US/CA spelling, "Shipping additional." wording.
5. **Phase 14 robots.txt review.**

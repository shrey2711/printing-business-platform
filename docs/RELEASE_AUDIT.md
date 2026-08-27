# Apex Trade Show — Release Audit (SEO / AEO / GEO + conversion)

**Date:** 2026-08-27 · Final audit for the 12-package program. No new features
in this step — verification, QA, and documentation only.

## 1. Changes completed (by package)
| # | Commit | Summary |
|---|---|---|
| baseline | `31cccf8` | Read-only SEO+ecommerce baseline diagnostic + report |
| 1 | `8d6d4ec` | Central `productFacts.js`; grammatical shipping wording; price-consistency test |
| 2 | `7487eef` | Product schema `@id`/`url`/`category`/`seller`→central org; schema tests |
| 3 | `6ec10df` | Enforced location quality gate + 6-class recommended-action taxonomy |
| 5 | `c33dd2c` | Merchant-feed field-completeness tests + CAD/cadence/troubleshoot docs |
| 8 | `e2f57c6` | Orphan + product↔category link tests; fixed `/resources` orphan |
| 7 | `243a12d` | Imagery: 26.2MB→1.4MB WebP; wrong-SKU image-assignment test |
| 4 | `93fe288` | Answer-first blocks on buying guides; content backlog doc |
| 10 | `60187ec` | Playwright+axe+Lighthouse stack; a11y fixes (label, contrast tokens) |
| 6 | `a216642` | Configurator/quote e2e (desktop+mobile) |
| 9 | `e5df058` | Central-contact enforcement test; empty gated social-proof models |
| 11 | *(this)* | Release audit |
| (prior) | `6fc4874` | Index San Antonio — all top cities indexable |

## 2. Test results
`npm test` (9 gates) — **PASS, exit 0:** verify-media, verify-banner-pricing (66),
verify-prerender-meta (49), vite build, verify-tension-podium (28), audit:seo
(0 critical / 20 non-critical warnings = generic-OG only), audit:locations,
test:seo (263 URLs + feed parity + robots + home LCP preload + contact match),
test:products (21), test:locations (191), test:links (263, no orphans),
test:images (11 identity-critical SKUs).
`npm run test:e2e` — configurator **6/6 pass** (desktop+mobile).
`npm run test:a11y` — **9/9 pass** (structural a11y = 0; color-contrast residual
1–2 nodes/page logged, tracked below).

## 3. Lighthouse results
Not run in this environment (needs a live deploy + Chrome). `lighthouserc.js` +
`npm run lhci` are wired. **Owner post-deploy:** run
`npx lighthouse https://www.apextradeshow.com/ --view` or PageSpeed Insights.
Config improvements already applied: system fonts (0 external), module scripts,
LCP images eager + `fetchpriority`, home `<head>` LCP preload, images WebP +
dimensioned (no CLS).

## 4. Schema results
Product (+ Offer/AggregateOffer, MadeToOrder, NewCondition, seller→`#organization`,
sku, category), BreadcrumbList, FAQPage on 21 PDPs; BlogPosting on articles;
OnlineStore+WebSite site-wide; ItemList+FAQPage on categories; no LocalBusiness;
**no Review/AggregateRating** (none real). All JSON-LD parses; Offer price ==
visible == card == feed (test-locked). Live Google Rich Results Test = owner step.

## 5. Location pages by recommended action
From `audit:locations` (`LOCATION_AUDIT.md`): **355 pages · ~148 indexed · ~207
noindex**. Taxonomy: **Keep/index** = tier-1/2 cities with unique `cityDetail` +
all state pages; **Improve** = ~84 flagged templated indexed pages; **Noindex
temporarily** = tier-3 + thin pages (already gated); **Consolidate/Redirect** =
old `/locations/{state}/{city}` already 301 → canonical; **Remove from sitemap**
= none (gate enforces no noindex in sitemap). No page auto-deleted/redirected.

## 6. Merchant-feed status
Live at `/feed.xml` (17 priced products; 4 quote-only excluded; USD). Field
completeness + price parity gated by `npm test`. CAD feed = owner (fixed CAD
price list or authorized FX snapshot). Account connection = owner. See
`MERCHANT_CENTER_SETUP.md`.

## 7. Remaining owner decisions / data (nothing fabricated)
Real reviews/ratings · customer photos/case studies/logos · About founding
year/legal name/team · official social profiles (`sameAs`) · shipping rates +
free-ship threshold + real transit windows · warranty/return legal terms · CAD
price list · product weight/packed-dims/setup-time/people (PDP verified-field
block) · color-contrast design pass on residual brand-blue links.

## 8. Commit hashes
See §1. All on `main`, pushed.

## 9. Production deployment
Established workflow = **git push to `main` → Vercel auto-deploy**. All commits
are pushed, so production (**https://www.apextradeshow.com**) deploys via Vercel's
git integration. No manual deploy performed; no deploy credentials used here.

## 10. Rollback
Each package is an isolated commit. `git revert <hash>` + push redeploys via
Vercel, or roll back to the previous deployment in the Vercel dashboard. No DB
migrations or state changes — reverts are clean. To fully unwind the program,
revert back through `31cccf8`.

## Dependency audit (reported, not force-fixed)
`npm audit`: 10 findings (1 critical, 5 high, 4 moderate) — all in **build/test
tooling** (esbuild dev-server SSRF; tar via the `sharp` install chain). None sit
in the shipped static site or the serverless request path. **Not** auto-fixed:
`npm audit fix --force` would bump vite to a major (breaking) version. Owner to
review before upgrading.

## Diff review (clean)
No secrets or `.env` (only `.env.example` tracked) · no customer artwork · no
unintended pricing changes (pricing.js unchanged; verifiers assert intact) · no
fake reviews/ratings · no staging/localhost/*.vercel.app URLs in `dist` · all
internal links use the canonical host.

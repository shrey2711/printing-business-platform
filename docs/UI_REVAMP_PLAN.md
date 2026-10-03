# UI Revamp Plan — modern, minimalist, < 100 KB

Branch: `uiRevamp`

## 1. Where we are (audit, Oct 2026)

**Recent commits did not revamp the UI.** The last 15 commits on `uiRevamp`
are SEO (city pages, redirects, Search Console), payments, emails and the new
reviews feature. Only `e5c996a` touched `src/styles.css`, adding 21 lines of
review styles. The look is unchanged.

**Current styling**
- One global stylesheet, `src/styles.css`: 1,442 lines, 84 KB raw, ~770
  top-level selectors. It mixes storefront, blog editor and admin styles, and
  every page downloads all of it.
- Tokens exist (`--red`, `--blue`, `--navy`, `--gold`, radii, shadows,
  spacing) but they are only partly used, and there are about 40 inline
  `style={{}}` blocks in JSX.
- The palette has 4 competing accents (red, blue, navy, gold), uses
  `Segoe UI`/Roboto at a 15px base, a 72px-tall logo in the header, and
  shadow-heavy cards. It reads as dated and busy.

**Current weight (homepage, first load, gzipped; measured with `vite build`)**

| Asset | Size |
|---|---|
| Entry JS `index-*.js` | **208.5 KB** (722 KB raw) |
| CSS `index-*.css` | 12.9 KB |
| **Total** | **~221 KB**, more than twice the budget |

What is in the entry chunk (raw source size):

| Module | Why it's there | Fix |
|---|---|---|
| `@supabase/*` (~800 KB src) | `AuthContext` imports `lib/supabase` eagerly | Lazy-load only when a session exists or on login |
| `src/data/cityProductPages.js` (195 KB) | `App.jsx` maps it to build `<Route>`s | Use a slim generated slug list, or one dynamic route plus a lazy lookup |
| `axios` (146 KB src) | `services/api.js` | Replace with a ~1 KB `fetch` wrapper |
| `src/data/categoryPages.js` (43 KB) | pulled in transitively | Trace the import and move it behind the lazy pages |
| `react-router-dom` + `@remix-run/router` | needed | Keep it (~20 KB gz) |
| `react-dom` | needed | Keep it (~42 KB gz); Preact/compat is the last-resort lever |

### Progress
- **Phases 0–1 done:** homepage first load went from 221 KB to **86.8 KB** gzipped
  (JS 74.4 KB + CSS 12.4 KB). Supabase is now lazy (a separate `supabase-*`
  chunk, loaded only with a stored session or on sign-in), the router uses a
  generated slug list instead of `cityProductPages.js`, axios is gone, and
  GA/Clarity load after `load` + idle. Enforced by `npm run check:budget`.

## 2. The budget (definition)

> **Homepage first load: ≤ 100 KB gzipped for all first-party JS, CSS and
> fonts on the critical path.**

The split:

| Bucket | Budget |
|---|---|
| JS (React, router, app shell, HomePage) | ≤ 80 KB |
| CSS (tokens, base, shell, home) | ≤ 12 KB |
| Fonts | 0 KB with the system stack (≤ 20 KB if we choose one subset woff2, which then comes out of the JS budget) |
| Any other route's lazy chunk | ≤ 30 KB extra JS+CSS |
| LCP image | ≤ 60 KB AVIF/WebP, preloaded, explicit dimensions (tracked separately from the 100 KB) |

**Third-party scripts:** GA and Clarity are excluded from the 100 KB, but
they must stop competing with the first paint. Load them after
`load`/idle (Phase 1).

A CI script enforces the budget so it cannot drift (Phase 0).

## 3. Design direction

The goal is modern and minimalist, which mostly means less of everything.

- **Color:** neutral ink-on-white with **one accent**, the brand red,
  reserved for primary CTAs and key highlights. Drop blue and gold as accents;
  navy becomes the ink colour. Use soft grey surfaces (`#f7f7f8`) for sections
  instead of boxes and shadows.
- **Type:** the `system-ui` stack (`-apple-system, Segoe UI, Roboto, Inter,
  sans-serif`) costs zero bytes. Use a 16px base, a fluid `clamp()` scale with
  large, tight display headings (`letter-spacing: -0.02em`), and an 8-step
  modular scale.
- **Space:** 8-pt spacing grid, generous section padding (`clamp(48px, 8vw,
  112px)`), a 1200px content width and a 68ch prose width.
- **Surfaces:** hairline 1px borders instead of shadows, 12px radius on cards
  and 8px on inputs and buttons, and a single subtle shadow kept only for
  overlays.
- **Motion:** 150–200ms ease-out on hover and focus only, with everything
  disabled under `prefers-reduced-motion`.
- **Imagery:** large, uncluttered product photography on neutral backgrounds
  with consistent aspect ratios (`aspect-ratio` CSS, so there is no CLS).
- **Header:** slim (≈64px) with the logo at 32–36px instead of 72px, a few
  top-level nav items, and the cart and CTA on the right.

## 4. Phases

Each phase is shippable on its own: build and tests stay green, and the
budget check passes from Phase 1 onwards.

### Phase 0: Guardrails and baseline (≈1 day)
- Add `scripts/check-budget.mjs`. It reads `dist/index.html`, follows the
  entry JS, its static imports and the CSS, gzips them, and fails above 100 KB
  (and per-route above 30 KB). Wire it into `npm test` and CI.
- Add a Playwright visual-baseline spec that screenshots ~10 key routes at
  375px and 1280px: home, products, configurator, category, city, city-product,
  blog post, cart, contact, quote. These give before/after comparisons for
  review.
- Tighten `lighthouserc.js`: performance `minScore` 0.9, plus
  `total-byte-weight` and `resource-summary` assertions.
- Record the baseline numbers in this doc.

### Phase 1: Performance diet, before any visual change (≈2–3 days)
Doing this first makes room in the budget for the redesign.
1. **Lazy Supabase.** `AuthContext` should check `localStorage` for a
   session token and `import('../lib/supabase')` only if one exists or when
   login/register/account/admin mounts. This is the single biggest win.
2. **Route table without the data.** Replace the
   `CITY_PRODUCT_PAGES.map(...)` in `App.jsx` with a slug list from
   `src/generated/routes.js` (the build already generates it), or a single
   catch-all route that lazy-loads the page data. Keep the
   prerender/router parity guarantee (`scripts/prerender.mjs`,
   `test:city-products`).
3. **Drop axios.** Rewrite `services/api.js` on `fetch` with the same
   interface, then remove the dependency.
4. Trace and evict `categoryPages.js`, `content.js` and other data modules
   from the entry chunk.
5. **Defer GA and Clarity** until `requestIdleCallback` or after `load`.
6. **CSS split.** Move admin and blog-editor rules into CSS imported by
   `AdminPage` (Vite emits it with that lazy chunk), and move page-specific
   rules next to their lazy pages.
7. **LCP image.** Add `<link rel="preload" as="image">` with
   `fetchpriority="high"`, AVIF/WebP via `scripts/optimize-images.mjs`, and
   explicit `width`/`height`.
- **Exit:** homepage ≤ 100 KB, with no visual change and all existing tests
  passing.

### Phase 2: Design system foundation (≈2–3 days)
- Split CSS into `@layer`s: `src/styles/tokens.css`, `reset.css`,
  `base.css`, `layout.css` and `components.css`, with page CSS colocated.
- New tokens: a neutral colour ramp (`--gray-50…900`), `--accent`
  (red), `--ink`, `--surface`, `--border`; fluid type scale `--step--1…5`;
  space scale `--s-1…10`; radii, a single shadow and motion durations.
  Keep the old token names as aliases until Phase 7 so nothing breaks
  mid-migration.
- Core primitives as CSS classes, with tiny components only where behaviour
  is needed: `.container`, `.section`, `.stack`, `.cluster`, `.grid`,
  `.btn` (primary, secondary, ghost; sm, md, lg), form fields, `.card`,
  `.badge`, `.price`, `.rating`, `.breadcrumb`, `.accordion` (native
  `<details>`, no JS) and `.tabs`.
- A hidden `/styleguide` route, lazy-loaded and `noindex`, so the
  primitives can be reviewed in isolation.
- **Budget:** foundation CSS ≤ 8 KB gzipped.

### Phase 3: Global shell (≈2 days)
- Header: slim sticky bar, smaller logo, a simplified nav and a full-screen
  mobile menu, keeping the existing `body.menu-open` behaviour. Currency
  switcher and cart badge restyled.
- Footer: a calm 4-column grid that collapses to `<details>` on mobile. It
  must keep every existing internal link, because the SEO link audits depend
  on them.
- `EmailCapture` restyled inline in the footer.
- Remove the `.wl-badge` and other gold accents.

### Phase 4: Homepage, the LCP route (≈3 days)
- Hero: a short headline, one supporting line, one primary and one secondary
  CTA, and a single large product image (preloaded). No carousel.
- Category grid: 5–6 tiles with consistent aspect ratio, image and label
  only.
- Trust strip: free proof, instant pricing, US and Canada shipping, and the
  review rating (from the new reviews feature), as one quiet row.
- Product highlights use the new `ProductCard`, followed by a short FAQ in
  `<details>` and a final CTA band.
- Keep the H1/H2 text and structured data that the SEO suite checks
  (`test:seo`, `audit:seo`). Change markup and styling only, not copy.

### Phase 5: Commerce flow (≈4–5 days)
- `ProductsPage`, `ProductCard`, `CategorySidebar`: a clean grid, filters as
  chips on mobile and a sidebar on desktop.
- `ProductConfigurator` (961 lines, the conversion page): two columns, with
  a sticky gallery on the left and the options stacked on the right. Options
  become segmented controls and swatches, with a sticky price/CTA bar on
  mobile. Split it into sub-components while we're there, without changing
  the pricing logic (`test:cms-pricing`, `test:products`, `configurator.spec`).
- `ProductGallery`, `ProductTabs`, `ProductReviews`, `AccessoriesSection`:
  restyle these.
- `CartPage`, `PlaceOrderPage`, `QuotePage`, `ContactPage`: single-column
  forms with clear labels, inline validation styling, and an order summary
  card. Payment logic stays untouched (`test:payments`, `test:fallback`).

### Phase 6: Content and SEO templates (≈3–4 days)
These templates serve hundreds of pages, so each fix scales.
- `CategoryPage`, `LandingPage`, `SolutionPage`, `SizePage`,
  `BoothPackagesPage`.
- `CityPage`, `CityCategoryPage`, `CityProductPage`, `LocationPage(s)`.
- `BlogIndex`, `BlogPost` (prose typography: 68ch measure, 1.7 line height),
  `ResourcesPage`, `InfoPage`.
- **Rule:** no change to text content, heading hierarchy, internal links or
  JSON-LD. The `test:cities` and `test:links` suites must pass unchanged.
- Also shrink `CityCategoryPage` (75 KB gz chunk) by moving per-city data to
  per-city lazy JSON.

### Phase 7: Account, auth, admin and cleanup (≈2 days)
- `Login`, `Register`, `Account` and `Review` pages get the new form
  primitives.
- Admin gets the new tokens only, with no redesign. It is internal and
  already split into its own chunk.
- Delete the legacy CSS and old token aliases, convert the remaining inline
  `style={{}}` blocks to classes, and remove unused selectors.
- Final pass: a11y (`test:a11y` with axe; contrast ≥ 4.5:1, focus rings,
  44px tap targets), Lighthouse CI on the 4 audited URLs, and a visual diff
  review.

## 5. Working rules
- **One PR per phase**, each with before/after screenshots from the Phase 0
  spec and the budget-script output.
- **No copy, URL, heading or schema changes** in this project. Those belong
  to the SEO work, and the existing audit scripts guard them.
- **No new runtime dependencies** (no UI kits, no Tailwind runtime, no icon
  fonts). Icons are inline SVG.
- **Mobile first:** design at 375px, then scale up.

## 6. Timeline at a glance

| Phase | Scope | Est. | Budget state |
|---|---|---|---|
| 0 | Guardrails, baseline | 1d | measured (221 KB) |
| 1 | Performance diet | 2–3d | **≤ 100 KB** ✅ |
| 2 | Design system | 2–3d | ≤ 100 KB |
| 3 | Header/footer | 2d | ≤ 100 KB |
| 4 | Homepage | 3d | ≤ 100 KB |
| 5 | Commerce flow | 4–5d | per-route ≤ 30 KB |
| 6 | SEO templates | 3–4d | per-route ≤ 30 KB |
| 7 | Auth/admin/cleanup | 2d | final audit |

Total: roughly 3–4 weeks of focused work.

## 7. Next level: making it more appealing (proposed, Oct 2026)

Phases 0–7 are done: new design system, header, every page restyled,
FREESHIP promotion, layout tests. Current weight: **89.0 / 100 KB**
(CSS 14.0 / 15 KB). Anything below that adds bytes has to be paid for, so
each item lists its cost.

### Phase A: Free up budget (≈1 day, saves ~4–6 KB)
- Move admin, blog-editor and account-table CSS (~25% of `styles.css`)
  into CSS imported by those lazy pages, so the public first load stops
  paying for it.
- Delete dead selectors left from the old design (`.facilities`,
  `.pickup`, `.ft-btn`, `.logo-mark`, old size-picker rules) after a usage
  check.
- **Exit:** CSS ≤ 10 KB on first load, which is the headroom for B–E.

### Phase B: Imagery, the biggest lever (needs assets from you)
- Today the hero and cards use product renders on mixed backgrounds, and
  several category tiles have no image at all. A premium store is mostly
  photography.
- **Hero:** one wide photo of a real Apex booth at a show (people, a busy
  aisle) in place of the 4-tile collage, preloaded as AVIF ≤ 60 KB.
- **Category tiles:** one consistent shot per category, same angle and
  backdrop and a soft grey seamless background.
- **"What we print":** real customer installs rather than renders.
- **Customer logo strip** (5–8 logos, monochrome SVG, ~3 KB) under the
  trust row, if customers agree.
- Cost: images only (not counted in the 100 KB); `optimize-images`
  already exists.

### Phase C: Brand typography (≈0.5 day, ~15–20 KB)
- A display face for headings only (e.g. Inter Tight, Manrope or
  Plus Jakarta Sans), subset to Latin, one variable woff2,
  `font-display: swap`, preloaded. Body text stays on the system font.
- Only fits after Phase A. Needs your pick from 2–3 options shown on the
  real homepage.

### Phase D: Homepage storytelling (≈1–2 days, needs your sign-off)
- 15 sections is too many; premium homepages tell one story in about 8:
  Hero → Trust/logos → Categories → Build your booth → Real work →
  Best sellers → Reviews → FAQ → CTA.
- Merge industry, event and city chips into one compact "Browse by"
  block; move the buying guides into the FAQ area as "Learn more".
- **SEO note:** every link that leaves the homepage keeps a home (footer,
  Browse block or Guides), so internal links are preserved rather than
  dropped.

### Phase E: Motion and polish (≈1 day, ~1 KB)
- Gentle reveal-on-scroll for sections and cards (one
  IntersectionObserver, CSS transitions, off under
  `prefers-reduced-motion`).
- Images fade in on load instead of popping; skeleton shimmer while
  products load.
- One consistent inline-SVG line-icon set for the trust strip, use cases
  and contact tiles (replacing the hidden emoji).
- A branded 404 page and better empty states (cart, orders).

### Phase F: Conversion details on the product page (≈2 days, ~2 KB)
- **Sticky price and CTA bar on mobile**, so the price and "Order" are
  always one tap away while scrolling options.
- **Estimated delivery date** ("Order today, arrives by Oct 21"), computed
  from production days plus a transit window, beside the price.
- **Review stars** on product cards and under the product title once
  reviews exist (the reviews feature is live).
- **Gallery:** larger main image, swipe on mobile, click to zoom.

### Phase G: Social proof once it exists
- Show the aggregate rating in the hero badge ("4.9 · 120 reviews") and a
  testimonial band on the homepage, only from genuine published reviews
  (the rule in `src/data/socialProof.js` stands).

### Suggested order
A → E → F first: no assets or decisions needed and visible on every page.
Then B, C and D as you supply photos, pick a font and approve the leaner
homepage. G follows reviews.

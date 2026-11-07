# Product indexing phase 1 (2026-11-07)

Policy copy and Offer JSON-LD only. No contextual-link edits, no SEG copy edits, no canonical/noindex/robots changes, no removals, no deployment. Relevance of extra links and SEG differentiation is **not classified** here. Those mappings are evidence for a jev assessment on this same branch.

Live policy pages fetched 2026-11-07 (Googlebot UA) match the repo pages and the brief: `/returns` (“We do not offer refunds”; transit damage within three days; reprint one year), `/warranty` (frames 5 years, everything else 1 year, no lifetime warranty), `/shipping` (cost depends on destination, size and weight; no flat rate; transit is not a published window). Policy pages were not edited.

## 17 priced products — Offer JSON-LD before and after

These are the only active products with `startingPrice != null` (17 of 36). Each previously received the same `merchantProps` block in `scripts/prerender.mjs`. Quote-only products never received an Offer.

Before, on every priced Offer / AggregateOffer:

- `shippingDetails.shippingRate.value` = `"0"` USD (Google documents `0` as free shipping)
- `handlingTime` 2–4 days and `transitTime` 2–5 days for US and CA
- `returnPolicyCategory` `MerchantReturnFiniteReturnWindow`
- `merchantReturnDays` 30, `returnMethod` `ReturnByMail`, `returnFees` `FreeReturn`

After (rendered on `/products/fabric-banner-9oz-wrinkle-free` and the other 16):

- no `shippingDetails` (a rate is required if that type is present, and no flat rate is published)
- `hasMerchantReturnPolicy.returnPolicyCategory` = `https://schema.org/MerchantReturnNotPermitted`
- `applicableCountry` `US` and `CA`
- no `merchantReturnDays`, `returnMethod`, or `returnFees`
- `priceValidUntil` remains an offer-price date (about 30 days from build). It is not a return window.

URLs:

1. https://www.apextradeshow.com/products/canopy-tent-10x10
2. https://www.apextradeshow.com/products/canopy-tent-10x15
3. https://www.apextradeshow.com/products/canopy-tent-10x20
4. https://www.apextradeshow.com/products/pleated-table-covers
5. https://www.apextradeshow.com/products/stretch-table-covers
6. https://www.apextradeshow.com/products/standard-retractable-banner
7. https://www.apextradeshow.com/products/deluxe-retractable-banner
8. https://www.apextradeshow.com/products/x-stand-banner
9. https://www.apextradeshow.com/products/step-and-repeat-backdrop
10. https://www.apextradeshow.com/products/feather-angled-flag
11. https://www.apextradeshow.com/products/feather-convex-flag
12. https://www.apextradeshow.com/products/teardrop-flag
13. https://www.apextradeshow.com/products/straight-tension-fabric-display
14. https://www.apextradeshow.com/products/13oz-vinyl-banner
15. https://www.apextradeshow.com/products/18oz-blockout-banner
16. https://www.apextradeshow.com/products/mesh-banner
17. https://www.apextradeshow.com/products/fabric-banner-9oz-wrinkle-free

The other 19 active products stay quote-only: no Offer, not in `feed.xml`.

## Visible product copy

Every product page (prerendered HTML and the configurator) now shows the same sentence from `productPolicyNote` in `src/data/warranty.js`, plus crawlable links to `/returns` and `/warranty`:

- Frame products (tents, banner stands, backdrops, SEG kits, A-frame): “5-year limited warranty on the frame, 1 year on everything else. We do not offer refunds. Damaged in transit? Tell us within 3 days for a reship. A printing defect is reprinted at no charge for 1 year from delivery.”
- Every other product: “1-year limited warranty.” plus the same refund, reship, and reprint clauses.

`/products/fabric-banner-9oz-wrinkle-free` turnaround before: “Ships in 3–5 business days”. That disagreed with the same product’s Production spec, “6-8 business days standard, 2-3 day rush (production time, not delivery)”. After: “Production: 6-8 business days standard, 2-3 day rush (production time, not delivery). Shipping is calculated separately at checkout.” The spec row was not given a new number.

No other active product turnaround was changed. The 16 other priced products already said production time and that shipping is calculated at checkout.

## Unresolved — left unchanged

- `/products/table-top-banner-stand` (quote-only, so it never had the 30-day Offer). Turnaround: “Ships in 2–4 business days”. Authored FAQ: “Standard production is 6-8 business days after you approve the free artwork proof, with an optional 2-3 business day rush. That is production time only; transit is added on top and depends on the delivery address.” No Production spec row decides which number is the supplier fact.
- Indexed `/banners` still says vinyl banners print “up to 50 ft on one side” (guide and FAQ). Product records for 13oz, 18oz, and mesh say up to 10' x 145' single sided, and the product file comments that the old 50' x 150' cap was wrong. Not edited in this phase.
- Inactive catalog rows (not in the 36) still contain “Ships in …” turnarounds. They are `active: false` and are not sitemap products.
- `feed.xml` still uses `g:availability` `in_stock` while Offer availability is `MadeToOrder`. Not part of the 30-day / free-shipping conflict; left as-is.
- Checkout still offers code `FREESHIP` for $15 off shipping (`src/config/brand.js`). That is a code, not a $0 shipping rate in schema. Not changed.

## Files changed

- `scripts/lib/offerPolicy.mjs` (new)
- `scripts/prerender.mjs` — product Offer block and one policy paragraph only
- `scripts/test-product-consistency.mjs`
- `scripts/test-product-policy.mjs` (new)
- `src/data/warranty.js`
- `src/pages/ProductConfigurator.jsx`
- `backend/data/products.js` — fabric banner turnaround only
- `docs/PRODUCT_INDEXING_PHASE1.md` (this note)

## Tests (after `npm run build`, exit 0)

- `node scripts/test-product-policy.mjs` — pass (17 NotPermitted, no shipping rate, 19 quote-only without Offer, visible note)
- `node scripts/test-product-consistency.mjs` — pass
- `npm run test:seo` — pass, 129 sitemap URLs
- `npm run test:links` — pass, 129 indexed pages have inbound links
- `npm run test:gone` — pass: 70 removed location URLs answer 410. Pre-existing warning, still passing: “61 retired URL(s) still 301 to a page that is now 410”. Redirects were not edited.

Indexing is not claimed. These checks are HTML, schema, and internal-link tests only.

## Overlap with blog pagination

`bc-ef0d8590-fd61-5d32-b927-059fcd70f260` squash-merged to `main` as `61bd2ba` (“Make blog listing pages crawlable at /blog?page=N”, PR 14) before this branch. This branch starts at that commit.

Shared file: `scripts/prerender.mjs`. This change does not touch `blogPaginationNav`, blog sitemap `?page=` entries, `render()` canonical handling, or `src/lib/blogPagination.js`. Untouched files from that PR: `middleware.js`, `package.json`, `scripts/audit-seo.mjs`, `scripts/audit-sitewide-duplicates.mjs`, `scripts/buildData.mjs`, `scripts/serve-dist.mjs`, `scripts/test-blog-pagination.mjs`, `scripts/test-internal-links.mjs`, `scripts/test-seo-invariants.mjs`, `src/generated/blogListing.js`, `src/pages/BlogIndex.jsx`, `src/styles/blog.css`.

`/blog/how-to-choose-canopy-tent-size` is in the route manifest but has no body in `backend/data/staticArticles.js`. This build did not emit its HTML (“CMS posts were not loaded”). No excerpt was taken from it.

## Existing crawlable links (not a relevance ranking)

Indexed `/products` lists every active product by name and price, including all 25 non-indexed products, via the category sections in `scripts/prerender.mjs`.

Additional indexed-page links already present:

| Non-indexed product | Indexed donors that already link it |
|---|---|
| 13oz, 18oz, mesh, 9oz fabric | `/banners` product list and compare table. 18oz also in `/products` contextual paragraph. 13oz also in `/blog/print-coverage-explained` related-products list and `/blog/trade-show-display-cost` table (one anchor covering “Vinyl / mesh / fabric banners”). |
| feather angled, convex, teardrop | `/flags` “Shop flags” list. Angled also in the cost article (“Feather & teardrop flags” anchor points only at the angled URL). |
| business cards, lanyards, wristbands, flyers, brochures | `/marketing-essentials` product list and compare table |
| custom table runner | `/table-covers` product list and compare table |
| tabletop banner | `/banner-stands` product list; `/blog/trade-show-booth-checklist` body; `/blog/trade-show-display-cost` table |
| SEG kits A, B, C | `/seg-displays` and `/pop-up-displays` shop lists; `/products` catalog section. Contextual paragraphs link A and B from `/products` and `/tension-fabric-displays`. Kit C is not in those two paragraphs. Cost article links `/seg-displays`, not the three product URLs. |
| coroplast, PVC, ACP, A-frame, sandwich board | `/products` “Rigid signs” list only. `/rigid-signs` also links them and is **not** indexed in the 2026-11-05 snapshot. |
| four channel-letter products | `/products` “Channel letters” list only. `/channel-letters` also links them and is **not** indexed in that snapshot. |

`/trade-show-booth-packages` components are canopies, table covers, banner stands, and the step-and-repeat. None of the 25.

## Unevaluated excerpts (string overlap with the product’s own name or spec, not a ranking)

These sentences sit on indexed pages and name the product. Several already sit above a product list that links the URL. Whether another in-sentence link is useful is a jev question. Do not treat this list as an approved map.

- `/products` guide: “Priced by size, so choose the material by where it hangs: scrim vinyl for general use, blockout when both sides show, mesh where wind needs to pass through, and wrinkle-free fabric for indoor walls.” Targets, by those words: `/products/13oz-vinyl-banner`, `/products/18oz-blockout-banner`, `/products/mesh-banner`, `/products/fabric-banner-9oz-wrinkle-free`. The same page’s Banners list already links all four.
- `/products` guide: “Angled, convex and teardrop flags carry the same print on different silhouettes; the choice is about how the pole sits in crowds and wind.” Targets: the three flag URLs. The Flags list on the same page already links them. Confirmed sizes in product data: angled and convex 9 / 10.5 / 14 ft; teardrop 7 / 9 / 11.2 ft. Same pole kit and bases. Shape FAQs say the difference is the top edge (angled vs convex) and a shorter closed profile (teardrop).
- `/products` guide: “Kit A, B and C differ in which side and overhead panels they include.” The SEG list on the same page already links all three.
- `/products` guide: “Rigid signs, marketing print and channel letters are quoted per order — send the size and quantity and we return pricing and a proof.” The following sections already link each SKU. The sentence does not name coroplast vs PVC vs ACP or the four letter types.
- `/banners` guide: “Four materials cover almost every job. 13oz matte scrim vinyl is the default… 18oz blockout adds an opaque grey centre layer… Mesh is perforated to let roughly 30% of wind pass through… 9oz polyester fabric is dye-sublimated for a no-glare matte finish…” Compare table and product list already link the four URLs.
- `/flags`: “Angled feather flags hold their shape in low wind and keep the top edge taut; convex feather flags give a rounded top with more graphic area high up; teardrop flags hold the tightest silhouette and flap least…” Shop list already links the three URLs. Product FAQs state the same shape distinction and the same size sets.
- `/marketing-essentials` intro names 16pt matte cards, lanyards, silicone wristbands, 80lb uncoated flyers, and 80lb uncoated brochures. Product list and compare table already link each URL.
- `/table-covers` FAQ: “Yes. A custom table runner is a printed strip of fabric laid along the table… Choose a length for a 6 ft or 8 ft table and a width…” Product data: lengths 72" and 96" (or custom); widths 14", 18", 24", 30", or custom. Fabric and finish: “Confirmed with your quote.” Compare table already links `/products/custom-table-runner`.
- `/blog/trade-show-display-cost` table links 13oz for the words “Vinyl / mesh / fabric banners” and links only the angled flag for “Feather & teardrop flags”. 18oz, mesh, 9oz, convex, and teardrop are not separate anchors in that table.
- `/blog/trade-show-booth-checklist` links `/products/table-top-banner-stand` in the signage paragraph. It does not name the 25 rigid, channel, SEG, or marketing SKUs.
- Indexed `/trade-show-displays` mentions “SEG modular kits” and flags as categories. It does not name Kit A/B/C or the three flag shapes.

## SEG specs confirmed in `backend/data/products.js` (not inferred from names or images)

Shared by A, B, and C: quote-only; dye-sublimated flame-retardant 200g backlit fabric; SEG silicone edge; modular PVC lightbox frame; tool-free snap-fit; integrated LED; plugs US/EU/AU/none; widths 10, 13, 16.4, and 20 ft. Source comment: “Frame is PVC and fabric is FR 200g backlit per the source spec (do not silently change to aluminum).”

| Field | Kit A | Kit B | Kit C |
|---|---|---|---|
| Heights | 6.6, 7.4, 8.2 ft | 6.6, 7.4, 8.2 ft | 7.4 and 8.2 ft only |
| Config | Backdrop + single illuminated archway/return + illuminated counter | Backdrop + side panel/arch front + illuminated overhead/arch section + illuminated counter | Backdrop + left and right illuminated side panels + illuminated counter (no overhead arch) |
| Counter | 10/13 ft: 2.8 ft W × 3.3 ft H; 16.4/20 ft: 3.3 × 3.3 | same as A | 3.3 ft W × 3.3 ft H |
| Weight with graphics | 72–80 lb | 68–110 lb | 60–165 lb |
| Bag | ≈ 43" × 14" × 8" | ≈ 46" × 16" × 10" | ≈ 46" × 17" × 13" |
| Carry images on disk | `apex-seg-modular-kit-a-main.jpeg`, `…-structure.webp`, `…-included.png`, `…-sizes.png` | `…-b-main.jpeg`, `…-b-structure.webp`, `…-b-sizes.png` | `…-c-main.jpeg`, `…-c-structure.webp`, `apex-seg-light-box-components.webp`, `…-c-sizes.png` |

Image paths are file names only. Nothing here is inferred from how the pictures look.

### SEG conflicts — not edited

- Kit B FAQ: “It costs weight for that: 68-110 lb with graphics against Kit A at 72-80 lb.” The published ranges overlap, and Kit B’s low end is below Kit A’s. Which kit is heavier is not settled by those ranges.
- Kit C `seoDescription`: “two angled backlit walls”. Config and FAQ: left and right side panels, three walls, no overhead arch. “Angled” is not in the config string.
- `/seg-displays` intro and “What is an SEG display?” say a slim **aluminum** frame. The three kit specs say **Modular PVC lightbox frame**. The same landing page later says “modular PVC lightbox frame” and “A complete kit with graphics weighs roughly 72 to 80 lb” (Kit A’s range) and lists 6.6 ft as a kit height (Kit C has no 6.6 ft option). Counter copy “2.8 ft wide on the 10 and 13 ft kits” does not match Kit C’s single counter size.
- `/pop-up-displays` describes an accordion frame with magnetic or hook-and-loop panels, then says the kits are SEG snap-fit lightboxes and links Kits A, B, and C. “about 72 to 80 lb” and “43 by 14 by 8 inches” are Kit A figures in that pop-up copy.

No kit paragraph was rewritten. No new image was added.

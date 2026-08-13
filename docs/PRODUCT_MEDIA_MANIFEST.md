# Product Media Manifest

Provenance of production commerce imagery. Every file is either an owner-provided
upload or an original Apex-authored SVG diagram. **No competitor (B2Sign) images
are used.** Card thumbnails come from `src/data/brandImages.js`; galleries from
`backend/data/products.js`. Guard: `scripts/verify-media.mjs`.

## Banner stands (`public/images/displays/`)

| Product | Card image | Gallery | Source | Approved |
|---|---|---|---|---|
| Standard Retractable | `standard-retractable-front-back.png` | front-back, detail, kit, dimensions.svg, banner.webp | owner uploads + Apex SVG | yes |
| Deluxe Retractable | `deluxe-retractable-banner.webp` | banner, led, hardware, base, dimensions.svg | owner uploads + Apex SVG | yes |
| X-Stand | `x-stand-front-back.jpg` | front-back, hardware, banner, graphic-vs-complete.svg, dimensions.svg | owner uploads + Apex SVG | yes |
| Table Top | `table-top-example.png` | example, banner.webp, dimensions.svg | owner uploads + Apex SVG | yes |

Dimension/comparison SVGs (`apex-*-dimensions.svg`, `apex-x-stand-graphic-vs-complete.svg`) are original Apex-authored vector diagrams.

## Table covers (`public/images/table-covers/`)

| Product | Card image | Gallery hero | Source |
|---|---|---|---|
| Pleated (standard/draped) | `showcase/tablecover-brightpath-dental.webp` (correct-type brand-mix mockup) | `pleated.webp` | owner uploads |
| Stretch | `showcase/tablecover-corner-cafe.webp` (correct-type brand-mix mockup) | `stretch.webp` | owner uploads |

## Canopies / backdrop

| Product | Card image | Source |
|---|---|---|
| 10×10 / 10×15 | `showcase/canopy-*.webp` (correct-type brand-mix mockups) | Apex mockups |
| Step & Repeat | `showcase/backdrop-greenleaf.webp` (correct-type) | Apex mockup |

## Notes on brand-mix `showcase/` mockups
Canopy and table-cover cards intentionally use fictional-brand mockups **of the
correct product type** (Nova Tech, Harbor Realty, BrightPath, Corner Café, GreenLeaf)
so the catalog reads as "we print many brands". These are Apex-authored mockups,
not competitor assets. `banner-summit-outdoors.webp` is **no longer used on any
product card or the homepage banner card** (it remains only in the editorial "what
we print" showcase gallery and one blog cover).

## Owner inputs still open (imagery)
- Real photos for: Deluxe rear/what's-included; Table Top cassette close-up/rear;
  table-cover rear open-back / rear closed-back / stretch leg-attachment / lifestyle.
  Diagrams exist; authentic photos require owner upload (no AI-faked hardware).

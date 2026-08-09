# Tent image manifest

Drop image files here (`public/images/tents/`) using these **exact names**. The
site auto-selects them — no code change needed after upload. Missing files fall
back gracefully (config photo → wall-count photo → SVG drawing), so you can add
them in any order.

**Artwork rule:** use Apex Trade Show branding or neutral/blank art on the
canopies — NOT the demo brands (Northridge / Elevate / Pioneer). Those were just
layout references.

**Format:** `.webp`, ~1200×900 for canopy shots, square (~1000×1000) for
accessories. Keep each file under ~150 KB.

---

## 1. Canopy — six wall configurations (per size)

Needed for **each** size: `10x10`, `10x15`, `10x20` → 6 files each = 18 total.
The preview swaps to the matching photo as the customer picks full/half walls.

| File | Configuration shown |
|------|---------------------|
| `<size>-full3.webp` | Full setup — 3 full walls |
| `<size>-back.webp`  | 1 full wall (back)      |
| `<size>-half2.webp` | 2 half walls (sides)    |
| `<size>-half1.webp` | 1 half wall (front or side) |
| `<size>-none.webp`  | Canopy only (no walls)  |

Example for 10x10: `10x10-full3.webp`, `10x10-back.webp`, `10x10-half2.webp`,
`10x10-half1.webp`, `10x10-none.webp`.

> The older count-based files (`<size>-1wall.webp`, `-2wall.webp`, `-3wall.webp`)
> still work as a fallback and can stay until the config photos are in.

## 2. Frame / hardware (shared across sizes)

| File | Shown |
|------|-------|
| `frame-folded.webp` | Aluminium hex frame, collapsed for transport |
| `frame-open.webp`   | Frame expanded / set up |

## 3. Carry bags & weights (shared)

| File | Shown |
|------|-------|
| `bag-standard.webp` | Standard carry bag (included) |
| `bag-wheeled.webp`  | Wheeled carry bag (optional upgrade) |
| `weight-bags.webp`  | Leg weight bags |
| `sandbags-setup.webp` | Tent with sandbags on all four legs (for the Sandbags option) |

## 4. Shared marketing images (same on all 3 product pages)

| File | Shown |
|------|-------|
| `customize-sides.webp` | "Customize every side" infographic (valance / top / walls callouts) |

Use neutral or Apex artwork on these too — not the demo brands.

---

Once these are in the repo (committed + pushed), the config-aware main preview
uses section 1 automatically. The frame/bag/weight shots (sections 2–3) are for
the product-page gallery — tell me when they're uploaded and I'll wire the
thumbnail strip to them.

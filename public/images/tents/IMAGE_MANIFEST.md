# Tent & table-cover image manifest

The site auto-selects these by filename. Replace one by dropping a new file with
the **same name**.

## Canopy tents — `public/images/tents/`

Per size (`10x10`, `10x15`, `10x20`), the product preview swaps by wall setup:

| File | Configuration |
|------|---------------|
| `<size>-full3.webp` | Full setup — 3 full walls |
| `<size>-back.webp`  | 1 full wall (back) |
| `<size>-half2.webp` | 2 half walls (sides) |
| `<size>-half1.webp` | 1 half wall |
| `<size>-none.webp`  | Canopy only (no walls) |
| `<size>-1wall.webp` `-2wall.webp` `-3wall.webp` | Count aliases (cards / home / size pages) = back / half2 / full3 |

**Current art:** real Apex Exhibits-branded 10×10 photos. The **10×15 and 10×20
files reuse the 10×10 art** as a stopgap — send size-specific 10×15 / 10×20
shots (same 5 configs) and drop them at these names to replace.

The configurator tracks wall *counts*, not positions, so only these 5 configs
are shown; extra combos (2 full walls, front+side halves, angled views) aren't
distinguished. Ask if you want a separate image gallery that shows them.

## Table covers — `public/images/table-covers/`

| File | Used for |
|------|----------|
| `pleated.webp` | 4/6/8 ft **Pleated** options |
| `stretch.webp` | 6/8 ft **Stretch** options |
| `plain.webp` `pleated-alt.webp` `fitted.webp` `runner.webp` `round.webp` | Gallery (runner + round not current SKUs) |

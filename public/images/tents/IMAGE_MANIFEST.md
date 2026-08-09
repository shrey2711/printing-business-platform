# Tent & table-cover image manifest

The site auto-selects these by filename. Replace/add by dropping a file with the
matching name. Missing combos fall back to the nearest available photo.

## Canopy tents — `public/images/tents/`

Preview swaps by the exact wall combination (full walls, half walls; combined ≤ 3),
one file per combo, per size (`10x10`, `10x15`, `10x20`):

| File | Full | Half | Status |
|------|------|------|--------|
| `<size>-none.webp`  | 0 | 0 | ✅ |
| `<size>-back.webp`  | 1 | 0 | ✅ |
| `<size>-full2.webp` | 2 | 0 | ✅ |
| `<size>-full3.webp` | 3 | 0 | ✅ |
| `<size>-half1.webp` | 0 | 1 | ✅ |
| `<size>-half2.webp` | 0 | 2 | ✅ |
| `<size>-half3.webp` | 0 | 3 | ⬜ not in photo set → falls back to half2 |
| `<size>-f1h1.webp`  | 1 | 1 | ✅ |
| `<size>-f1h2.webp`  | 1 | 2 | ✅ |
| `<size>-f2h1.webp`  | 2 | 1 | ✅ |
| `<size>-1wall/2wall/3wall.webp` | — | — | count aliases = back / half2 / full3 |

**Art:** real Apex Exhibits-branded 10×10 photos. 10×15 / 10×20 reuse the 10×10
art until size-specific shots are provided.

## Table covers — `public/images/table-covers/`

| File | Used for |
|------|----------|
| `pleated.webp` | 4/6/8 ft Pleated |
| `stretch.webp` | 6/8 ft Stretch |
| `plain.webp` `pleated-alt.webp` `fitted.webp` `runner.webp` `round.webp` | Gallery |

# Tent & table-cover image manifest

The site auto-selects these by filename. Replace/add by dropping a file with the
matching name. Missing combos fall back to the nearest available photo.

## Canopy tents — `public/images/tents/`

The product preview swaps by the exact wall combination (full walls, half walls;
combined ≤ 3). One file per combo, per size (`10x10`, `10x15`, `10x20`):

| File | Full walls | Half walls | Status |
|------|-----------|-----------|--------|
| `<size>-none.webp`  | 0 | 0 | ✅ present |
| `<size>-back.webp`  | 1 | 0 | ✅ present |
| `<size>-full2.webp` | **2** | 0 | ⬜ needs upload (falls back to full3) |
| `<size>-full3.webp` | 3 | 0 | ✅ present |
| `<size>-half1.webp` | 0 | 1 | ✅ present |
| `<size>-half2.webp` | 0 | 2 | ✅ present |
| `<size>-half3.webp` | 0 | 3 | ⬜ needs upload (falls back to half2) |
| `<size>-f1h1.webp`  | 1 | 1 | ⬜ needs upload (falls back to back) |
| `<size>-f1h2.webp`  | 1 | 2 | ⬜ needs upload (falls back to back) |
| `<size>-f2h1.webp`  | 2 | 1 | ⬜ needs upload (falls back to full3) |
| `<size>-1wall.webp` `-2wall.webp` `-3wall.webp` | — | — | count aliases for cards/home = back / half2 / full3 |

**Current art:** real Apex Exhibits-branded 10×10 photos. 10×15 / 10×20 reuse the
10×10 art until size-specific shots are provided.

The ⬜ combos exist in the photo set you uploaded but were not saved — re-upload
the tent images (raw is fine) and they'll be mapped to these names.

## Table covers — `public/images/table-covers/`

| File | Used for |
|------|----------|
| `pleated.webp` | 4/6/8 ft Pleated |
| `stretch.webp` | 6/8 ft Stretch |
| `plain.webp` `pleated-alt.webp` `fitted.webp` `runner.webp` `round.webp` | Gallery |

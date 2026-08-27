// One-off/repeatable image optimizer. Re-encodes oversized source rasters in
// public/images to WebP (longest side capped, quality 80) alongside the original.
// It does NOT change references or delete originals — that is done deliberately
// after review. Prints a mapping + savings. Requires devDependency `sharp`.
//
//   node scripts/optimize-images.mjs           # convert all rasters > THRESHOLD
//   node scripts/optimize-images.mjs --min=300 # custom KB threshold

import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import path from 'path';

const arg = (process.argv.find((a) => a.startsWith('--min=')) || '').split('=')[1];
const THRESHOLD = (Number(arg) || 400) * 1024;
const MAX_SIDE = 1400; // product display images never need more
const ROOT = 'public/images';

const rasters = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(png|jpe?g)$/i.test(e.name)) rasters.push(p);
  }
})(ROOT);

let converted = 0, before = 0, after = 0;
for (const src of rasters) {
  const size = statSync(src).size;
  if (size < THRESHOLD) continue;
  const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const img = sharp(src);
  const meta = await img.metadata();
  const resize = Math.max(meta.width || 0, meta.height || 0) > MAX_SIDE
    ? { width: meta.width >= meta.height ? MAX_SIDE : null, height: meta.height > meta.width ? MAX_SIDE : null, fit: 'inside', withoutEnlargement: true }
    : null;
  const pipe = resize ? img.resize(resize) : img;
  await pipe.webp({ quality: 80 }).toFile(out);
  const newSize = statSync(out).size;
  converted++; before += size; after += newSize;
  console.log(`  ${(size / 1024).toFixed(0)}KB -> ${(newSize / 1024).toFixed(0)}KB  ${src.replace('public/', '')} -> ${path.basename(out)}`);
}
console.log(`\nConverted ${converted} images: ${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB (${before ? Math.round((1 - after / before) * 100) : 0}% smaller).`);
console.log('Next: update references (.png/.jpg -> .webp) and remove the originals, then run `npm test`.');

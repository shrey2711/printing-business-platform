// Generates 1200x630 social-card variants for every image used as an og:image.
//
// Why: most product/gallery photos are square (1200x1200 or 1254x1254). A
// square image in a summary_large_image card is centre-cropped to 1.91:1, which
// removes roughly a third off the top and bottom — on a canopy photo that takes
// out the canopy and the base. A few sources are also below LinkedIn's 600px
// floor and get downgraded to a small thumbnail.
//
// Each variant letterboxes the whole source onto a 1200x630 canvas over a
// blurred, darkened copy of itself, so nothing is cropped away.
//
// Run after a build (it reads the og:image tags out of dist/), then rebuild so
// the prerenderer picks the variants up:  npm run og:images && npm run build
import sharp from 'sharp';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ogVariantPath } from './lib/og-image.mjs';

const DIST = 'dist';
const SRC_ROOT = 'public';
const OUT_DIR = join('public', 'images', 'og');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

// Collect every distinct local og:image the build emitted.
const sources = new Set();
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      const m = readFileSync(p, 'utf8').match(/<meta property="og:image" content="([^"]*)"/);
      if (m) {
        const u = m[1].replace(/^https?:\/\/[^/]+/, '');
        if (u.startsWith('/images/') && !u.startsWith('/images/og')) sources.add(u);
      }
    }
  }
})(DIST);

mkdirSync(OUT_DIR, { recursive: true });

let made = 0;
let skipped = 0;
let missing = 0;
for (const src of [...sources].sort()) {
  const inFile = join(SRC_ROOT, src);
  const outFile = join(SRC_ROOT, ogVariantPath(src).replace(/^\//, ''));
  if (!existsSync(inFile)) { console.warn(`  missing source: ${src}`); missing++; continue; }
  if (existsSync(outFile)) { skipped++; continue; }
  const bg = await sharp(inFile).resize(1200, 630, { fit: 'cover' }).blur(40).modulate({ brightness: 0.85 }).toBuffer();
  const fg = await sharp(inFile).resize(1100, 630, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp(bg).composite([{ input: fg, gravity: 'center' }]).jpeg({ quality: 86 }).toFile(outFile);
  made++;
}

console.log(`OG images: ${made} created, ${skipped} already present, ${missing} missing source, from ${sources.size} og:image(s).`);

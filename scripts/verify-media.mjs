// Product media integrity guard. Fails the build if:
//  1. any product CARD image or gallery image file is missing from /public,
//  2. two DIFFERENT products share the same primary image (card thumbnail or
//     gallery hero) — the class of bug that showed a Table Top card an X-Stand
//     photo and a Standard card a Summit banner.
// Intentional shared images (e.g. a graphic-only vs full-set variant) must be
// listed in ALLOWED_SHARED below with a reason.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { listProducts } from '../backend/data/products.js';
import { PRODUCT_CARD_IMAGE } from '../src/data/brandImages.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

// slugs that may legitimately share a primary image, with justification.
const ALLOWED_SHARED = {
  // (none today) e.g. 'a-slug|b-slug': 'graphic-only + full-set share artwork'
};

const srcOf = (g) => (typeof g === 'string' ? g : g && g.src);
const fileFor = (url) => join(PUBLIC, url.replace(/^\//, ''));

const errors = [];
const primaries = new Map(); // image url -> slug that first claimed it

for (const p of listProducts()) {
  const gallery = Array.isArray(p.gallery) ? p.gallery.map(srcOf).filter(Boolean) : [];
  const card = PRODUCT_CARD_IMAGE[p.slug];
  const all = [...(card ? [card] : []), ...gallery];

  // 1. every referenced file must exist
  for (const url of all) {
    if (!existsSync(fileFor(url))) errors.push(`MISSING FILE: ${p.slug} -> ${url}`);
  }

  // 2. no cross-product primary reuse. Primary = card image, else gallery[0].
  const primary = card || gallery[0];
  if (primary) {
    const prev = primaries.get(primary);
    if (prev && prev !== p.slug) {
      const key1 = `${prev}|${p.slug}`;
      const key2 = `${p.slug}|${prev}`;
      if (!ALLOWED_SHARED[key1] && !ALLOWED_SHARED[key2]) {
        errors.push(`CROSS-PRODUCT PRIMARY: "${primary}" used by both "${prev}" and "${p.slug}"`);
      }
    } else {
      primaries.set(primary, p.slug);
    }
  }
}

if (errors.length) {
  console.error('✗ media integrity FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('✓ media integrity OK — all card/gallery images exist; no cross-product primary reuse.');

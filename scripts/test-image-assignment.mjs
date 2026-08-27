// Guards against cross-product image mix-ups: a product's card thumbnail and
// gallery hero must contain a filename token that identifies THAT product, so a
// Standard/Deluxe/X-Stand/Table-Top or feather-angled/convex/teardrop/SEG hero
// can never be assigned to the wrong SKU. Fails the build on a violation.

import { PRODUCT_CARD_IMAGE } from '../src/data/brandImages.js';
import { listProducts } from '../backend/data/products.js';

// slug -> substring that must appear in its card + gallery-hero filename.
const EXPECT = {
  'standard-retractable-banner': 'standard',
  'deluxe-retractable-banner': 'deluxe',
  'x-stand-banner': 'x-stand',
  'table-top-banner-stand': 'table-top',
  'feather-angled-flag': 'angled',
  'feather-convex-flag': 'convex',
  'teardrop-flag': 'teardrop',
  'seg-modular-trade-show-kit-a': 'kit-a',
  'seg-modular-trade-show-kit-b': 'kit-b',
  'seg-modular-trade-show-kit-c': 'kit-c',
  'straight-tension-fabric-display': 'tension'
};

const fails = [];
const bySlug = Object.fromEntries(listProducts().map((p) => [p.slug, p]));

for (const [slug, token] of Object.entries(EXPECT)) {
  const card = (PRODUCT_CARD_IMAGE[slug] || '').toLowerCase();
  if (card && !card.includes(token)) fails.push(`${slug}: card image "${card}" does not contain "${token}" (possible wrong-SKU assignment)`);
  const p = bySlug[slug];
  const hero = p && Array.isArray(p.gallery) && p.gallery[0]
    ? (typeof p.gallery[0] === 'string' ? p.gallery[0] : p.gallery[0].src).toLowerCase()
    : '';
  if (hero && !hero.includes(token)) fails.push(`${slug}: gallery hero "${hero}" does not contain "${token}"`);
}

// No two SKUs may share the same card image (cross-product reuse).
const seen = new Map();
for (const [slug, img] of Object.entries(PRODUCT_CARD_IMAGE)) {
  if (seen.has(img)) fails.push(`${slug}: card image reused from ${seen.get(img)} (${img})`);
  else seen.set(img, slug);
}

if (fails.length) {
  console.error(`\n✗ IMAGE ASSIGNMENT FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ IMAGE ASSIGNMENT OK — ${Object.keys(EXPECT).length} identity-critical SKUs have correct card/hero images; no cross-product card reuse.`);

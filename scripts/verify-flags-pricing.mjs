// Validates every flag price combination against the supplied rate card.
// 4 flag shapes × 3 sizes × 2 packages × 2 sides × 2 production = 96 combos,
// plus base add-ons (spike +0, cross +31, plate +35) and the "from" price.
import { getProduct, priceDisplayFor } from '../backend/data/products.js';
import { computePrice } from '../backend/data/pricing.js';

// Supplied table — hardcoded here (NOT imported from the product) so a data-entry
// error in the product matrix is actually caught. size|pkg|sides|days -> USD.
const SPEC = {
  'sm|hw|single|rush': 215, 'sm|hw|single|std': 165, 'sm|hw|double|rush': 260, 'sm|hw|double|std': 210,
  'sm|go|single|rush': 190, 'sm|go|single|std': 140, 'sm|go|double|rush': 235, 'sm|go|double|std': 185,
  'md|hw|single|rush': 225, 'md|hw|single|std': 175, 'md|hw|double|rush': 278, 'md|hw|double|std': 228,
  'md|go|single|rush': 200, 'md|go|single|std': 150, 'md|go|double|rush': 245, 'md|go|double|std': 195,
  'lg|hw|single|rush': 245, 'lg|hw|single|std': 215, 'lg|hw|double|rush': 305, 'lg|hw|double|std': 275,
  'lg|go|single|rush': 210, 'lg|go|single|std': 180, 'lg|go|double|rush': 270, 'lg|go|double|std': 240
};
const FLAGS = ['feather-angled-flag', 'feather-straight-flag', 'feather-convex-flag', 'teardrop-flag'];
const BASE_ADD = { spike: 0, cross: 31, plate: 35 };

let checked = 0;
const errors = [];
const price = (slug, sel) => {
  const r = computePrice({ slug, selections: sel, quantity: 1 });
  return r && r.ok !== false ? r.total : null;
};

for (const slug of FLAGS) {
  if (!getProduct(slug)) { errors.push(`${slug}: product not found`); continue; }
  for (const [key, expected] of Object.entries(SPEC)) {
    const [size, pkg, sides, days] = key.split('|');
    // base = spike (+0), design = self (+0) → total must equal the matrix value.
    const total = price(slug, { pkg, size, sides, days, base: 'spike', design: 'self' });
    checked++;
    if (total !== expected) errors.push(`${slug} ${key}: got ${total}, expected ${expected}`);
  }
  // Base add-ons on one representative combo (with hardware).
  for (const [base, add] of Object.entries(BASE_ADD)) {
    const total = price(slug, { pkg: 'hw', size: 'sm', sides: 'single', days: 'std', base, design: 'self' });
    const expected = 165 + add;
    checked++;
    if (total !== expected) errors.push(`${slug} base=${base}: got ${total}, expected ${expected}`);
  }
  // Starting ("from") price must be $140 (graphic-only small single 6-8 day).
  const sp = priceDisplayFor(getProduct(slug).pricing)?.startingPrice;
  checked++;
  if (sp !== 140) errors.push(`${slug} startingPrice: got ${sp}, expected 140`);
  // No purchasable combo may be <= 0.
  for (const [key] of Object.entries(SPEC)) {
    const [size, pkg, sides, days] = key.split('|');
    const total = price(slug, { pkg, size, sides, days, base: 'spike', design: 'self' });
    if (!(total > 0)) errors.push(`${slug} ${key}: non-positive price ${total}`);
  }
}

if (errors.length) {
  console.error(`✗ FLAG PRICING FAILED (${errors.length}):\n  ` + errors.slice(0, 40).join('\n  '));
  process.exit(1);
}
console.log(`✓ FLAG PRICING OK — ${checked} assertions across ${FLAGS.length} flags (96 matrix combos + base add-ons + starting price), no non-positive prices.`);

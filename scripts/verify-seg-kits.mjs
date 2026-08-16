// Validates the 3 SEG modular kits: quote-only (no price ever), correct size
// counts, Kit C has no 6.6' height, and no supplier references leak.
import { getProduct, priceDisplayFor } from '../backend/data/products.js';
import { computePrice } from '../backend/data/pricing.js';

const errors = [];
let checked = 0;
const KITS = [
  { slug: 'seg-modular-trade-show-kit-a', sizes: 12 },
  { slug: 'seg-modular-trade-show-kit-b', sizes: 12 },
  { slug: 'seg-modular-trade-show-kit-c', sizes: 8 }
];
const FORBIDDEN = /china-flag-makers|\bCFM\b|china flag|michael kors|elevate solutions|innovate global|global innovation/i;

for (const { slug, sizes } of KITS) {
  const p = getProduct(slug);
  if (!p) { errors.push(`${slug}: not found`); continue; }
  checked++;

  // Quote-only: no price is ever computed.
  const sizeChoices = p.pricing.optionGroups.find((g) => g.id === 'size').choices;
  const first = { size: sizeChoices[0].id, plug: 'us', mockup: 'no' };
  const r = computePrice({ slug, selections: first, quantity: 1 });
  checked++;
  if (!(r && r.ok === false && r.quote === true)) errors.push(`${slug}: expected quote-only, got ${JSON.stringify(r).slice(0, 80)}`);
  if (r && typeof r.total === 'number') errors.push(`${slug}: a price (${r.total}) was computed for a quote-only product`);

  // No starting price shown.
  const sp = priceDisplayFor(p.pricing)?.startingPrice;
  checked++;
  if (sp != null) errors.push(`${slug}: startingPrice should be null, got ${sp}`);

  // Correct number of size variants.
  checked++;
  if (sizeChoices.length !== sizes) errors.push(`${slug}: expected ${sizes} sizes, got ${sizeChoices.length}`);

  // Plug + mockup groups present.
  checked++;
  if (!p.pricing.optionGroups.find((g) => g.id === 'plug')) errors.push(`${slug}: missing plug group`);
  if (!p.pricing.optionGroups.find((g) => g.id === 'mockup')) errors.push(`${slug}: missing mockup group`);

  // No supplier / third-party strings anywhere in the product data.
  checked++;
  const blob = JSON.stringify(p);
  if (FORBIDDEN.test(blob)) errors.push(`${slug}: forbidden supplier/brand string in product data`);

  // No supplier lead-time language.
  if (/72\s*h|1\s*day rush|2\s*day|3\s*day|4\s*day/i.test(p.turnaround || '')) errors.push(`${slug}: supplier lead-time in turnaround`);
}

// Kit C must NOT have a 6.6' height.
const kitC = getProduct('seg-modular-trade-show-kit-c');
checked++;
if (kitC && kitC.pricing.optionGroups.find((g) => g.id === 'size').choices.some((c) => /6\.6/.test(c.label))) {
  errors.push('kit-c: must not have a 6.6 ft height variant');
}

if (errors.length) {
  console.error(`✗ SEG KITS FAILED (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ SEG KITS OK — ${checked} assertions: 3 quote-only kits (no price ever), sizes 12/12/8, Kit C has no 6.6' height, no supplier/third-party strings, no supplier lead-time.`);

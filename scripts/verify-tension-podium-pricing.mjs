// Validates tension fabric display + hard case podium pricing against the
// supplied sheet, and proves the three -400 placeholder cells can NEVER be
// purchased (they must return a quote, not a price and never $0 / negative).
import { getProduct, priceDisplayFor } from '../backend/data/products.js';
import { computePrice } from '../backend/data/pricing.js';

// Supplied VALID tension cells — hardcoded independently. pkg|size|sides|days.
const TENSION_SPEC = {
  'hw|8ft|single|rush': 774, 'hw|8ft|single|std': 645, 'hw|8ft|double|rush': 889, 'hw|8ft|double|std': 699,
  'go|8ft|single|rush': 374, 'go|8ft|single|std': 245, 'go|8ft|double|std': 489,
  'hw|10ft|single|rush': 894, 'hw|10ft|single|std': 745, 'hw|10ft|double|rush': 1009, 'hw|10ft|double|std': 799,
  'go|10ft|single|rush': 494, 'go|10ft|single|std': 345, 'go|10ft|double|std': 609,
  'hw|20ft|single|rush': 1734, 'hw|20ft|single|std': 1445, 'hw|20ft|double|rush': 1849, 'hw|20ft|double|std': 1499,
  'go|20ft|single|rush': 1334, 'go|20ft|single|std': 1045, 'go|20ft|double|std': 1449
};
// The three cells that held -400 in the sheet — must be unpurchasable.
const TENSION_INVALID = ['go|8ft|double|rush', 'go|10ft|double|rush', 'go|20ft|double|rush'];

const errors = [];
let checked = 0;
const priceOf = (slug, sel) => computePrice({ slug, selections: sel, quantity: 1 });
const total = (slug, sel) => { const r = priceOf(slug, sel); return r && r.ok !== false ? r.total : null; };

// --- Tension: valid cells ---
for (const [key, expected] of Object.entries(TENSION_SPEC)) {
  const [pkg, size, sides, days] = key.split('|');
  const t = total('straight-tension-fabric-display', { pkg, size, sides, days, design: 'self' });
  checked++;
  if (t !== expected) errors.push(`tension ${key}: got ${t}, expected ${expected}`);
  if (!(t > 0)) errors.push(`tension ${key}: non-positive ${t}`);
}
// --- Tension: invalid cells must NOT be purchasable (quote, not a number) ---
for (const key of TENSION_INVALID) {
  const [pkg, size, sides, days] = key.split('|');
  const r = priceOf('straight-tension-fabric-display', { pkg, size, sides, days, design: 'self' });
  checked++;
  const purchasable = r && r.ok !== false && typeof r.total === 'number';
  if (purchasable) errors.push(`tension ${key}: MUST be unpurchasable but priced ${r.total}`);
  // Also confirm no negative ever surfaces.
  if (r && typeof r.total === 'number' && r.total < 0) errors.push(`tension ${key}: negative price ${r.total}`);
}
// Tension starting price = 245 (cheapest valid cell).
const tsp = priceDisplayFor(getProduct('straight-tension-fabric-display').pricing)?.startingPrice;
checked++;
if (tsp !== 245) errors.push(`tension startingPrice: got ${tsp}, expected 245`);

// --- Podium: two explicit prices ---
const podCase = total('hard-case-podium', { kit: 'case', design: 'self' });
const podPrint = total('hard-case-podium', { kit: 'print', design: 'self' });
checked += 2;
if (podCase !== 650) errors.push(`podium case: got ${podCase}, expected 650`);
if (podPrint !== 135) errors.push(`podium print: got ${podPrint}, expected 135`);
const psp = priceDisplayFor(getProduct('hard-case-podium').pricing)?.startingPrice;
checked++;
if (psp !== 135) errors.push(`podium startingPrice: got ${psp}, expected 135`);

if (errors.length) {
  console.error(`✗ TENSION/PODIUM PRICING FAILED (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ TENSION/PODIUM PRICING OK — ${checked} assertions: ${Object.keys(TENSION_SPEC).length} valid tension cells, ${TENSION_INVALID.length} invalid cells unpurchasable (no -400/negative), podium $650/$135, starting prices $245/$135.`);

// Validates made-to-size banner pricing + size validation against the spec.
// Pricing rule (per banner):
//   area_sqft  = (w * h) / 144
//   raw        = area_sqft * rate_per_sqft
//   unit_price = max(raw, minChargeUsd)   // $45 floor, PER banner, before qty
//   line_total = unit_price * quantity
// Size rule: sort(w,h); smaller <= smallCap AND larger <= largeCap (orientation
// independent); otherwise the size is rejected (never silently clamped).
import { getProduct, priceDisplayFor } from '../backend/data/products.js';
import { computePrice, bannerSizeError } from '../backend/data/pricing.js';

const BANNERS = {
  '13oz-vinyl-banner': { rate: 2.75, small: 600, large: 1800 },
  '18oz-blockout-banner': { rate: 4.0, small: 600, large: 1800 },
  'mesh-banner': { rate: 3.1, small: 600, large: 1800 },
  'fabric-banner-9oz-wrinkle-free': { rate: 5.0, small: 96, large: 1200 }
};

let checked = 0;
const errors = [];
const eq = (label, got, want) => {
  checked++;
  if (got !== want) errors.push(`${label}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
};

// Every product must exist, be active, use the area model with the $45 floor.
for (const [slug, spec] of Object.entries(BANNERS)) {
  const p = getProduct(slug);
  if (!p) { errors.push(`${slug}: product not found`); continue; }
  eq(`${slug} active`, p.active, true);
  eq(`${slug} model`, p.pricing.model, 'area');
  eq(`${slug} pricePerSqFt`, p.pricing.pricePerSqFt, spec.rate);
  eq(`${slug} minChargeUsd`, p.pricing.minChargeUsd, 45);
  eq(`${slug} smallCap`, p.pricing.sizeSmallCapIn, spec.small);
  eq(`${slug} largeCap`, p.pricing.sizeLargeCapIn, spec.large);
  // Starting ("from") price is the $45 floor.
  eq(`${slug} startingPrice`, priceDisplayFor(p.pricing).startingPrice, 45);
}

const unit = (slug, width, height, quantity = 1) => {
  const r = computePrice({ slug, width, height, quantity });
  return r && r.ok !== false ? r : null;
};

// ---- Step 3 worked examples (unit price /ea) --------------------------------
eq('13oz 96x48 → 88.00', unit('13oz-vinyl-banner', 96, 48).unitPrice, 88.0);
eq('13oz 24x24 → 45.00 (min)', unit('13oz-vinyl-banner', 24, 24).unitPrice, 45.0);
eq('18oz 120x60 → 200.00', unit('18oz-blockout-banner', 120, 60).unitPrice, 200.0);
eq('mesh 144x72 → 223.20', unit('mesh-banner', 144, 72).unitPrice, 223.2);
eq('fabric 96x120 → 400.00', unit('fabric-banner-9oz-wrinkle-free', 96, 120).unitPrice, 400.0);

// ---- Min charge is PER banner, before quantity ------------------------------
const five = unit('13oz-vinyl-banner', 12, 12, 5); // 1 sq ft → raw 2.75 → floor 45
eq('5 × 1ft² 13oz unit', five.unitPrice, 45.0);
// Per-banner floor × qty = 5 × $45 = $225 (NOT one $45 for the order). This is
// the goods subtotal; the site's standard volume discount then applies on top,
// exactly as it does for every other area-model product.
eq('5 × 1ft² 13oz subtotal (5 × $45)', five.subtotal, 225.0);
eq('5 × 1ft² min flag', five.minChargeApplied, true);
eq('5 × 1ft² min usd', five.minChargeUsd, 45);

// ---- Min-charge boundary (strict <, so exactly $45 raw does NOT flag) --------
// fabric 36×36 = 9 sq ft × $5 = exactly $45.00 raw.
const at = unit('fabric-banner-9oz-wrinkle-free', 36, 36);
eq('fabric 36x36 raw==45 unit', at.unitPrice, 45.0);
eq('fabric 36x36 raw==45 no floor flag', at.minChargeApplied, false);
// fabric 36×35 = 8.75 sq ft × $5 = 43.75 < 45 → floor applies.
const below = unit('fabric-banner-9oz-wrinkle-free', 36, 35);
eq('fabric 36x35 below floor unit', below.unitPrice, 45.0);
eq('fabric 36x35 floor flag', below.minChargeApplied, true);

// ---- Decimal dimensions -----------------------------------------------------
// 13oz 96.5 × 48 = 32.1666.. sq ft × 2.75 = 88.4583.. → round2 88.46.
eq('13oz 96.5x48 decimal', unit('13oz-vinyl-banner', 96.5, 48).unitPrice, 88.46);

// ---- Size validation (sorted caps, orientation independent) -----------------
const vinyl = getProduct('13oz-vinyl-banner').pricing; // 600 × 1800
const fabric = getProduct('fabric-banner-9oz-wrinkle-free').pricing; // 96 × 1200
const valid = (label, pricing, w, h) => eq(`valid ${label}`, bannerSizeError(w, h, pricing), null);
const invalid = (label, pricing, w, h) => {
  checked++;
  if (!bannerSizeError(w, h, pricing)) errors.push(`invalid ${label}: expected an error, got null`);
};

// 600×1800 product
valid('at cap 600×1800', vinyl, 600, 1800);
valid('swapped 1800×600', vinyl, 1800, 600);
invalid('one over 601×1800', vinyl, 601, 1800);
invalid('one over 600×1801', vinyl, 600, 1801);
invalid('both over 700×1900', vinyl, 700, 1900);
invalid('square over 700×700', vinyl, 700, 700);
invalid('601×1801', vinyl, 601, 1801);
invalid('zero 0×100', vinyl, 0, 100);
invalid('negative -5×100', vinyl, -5, 100);
invalid('non-numeric abc×100', vinyl, 'abc', 100);
invalid('NaN×100', vinyl, NaN, 100);

// 96×1200 product (fabric)
valid('fabric at cap 96×1200', fabric, 96, 1200);
valid('fabric swapped 1200×96', fabric, 1200, 96);
invalid('fabric one over 97×1200', fabric, 97, 1200);
invalid('fabric one over 96×1201', fabric, 96, 1201);
invalid('fabric both over 200×1300', fabric, 200, 1300);
invalid('fabric zero 0×50', fabric, 0, 50);

// Message pulls numbers from config so it can't drift from the rule.
eq(
  'message uses config caps',
  bannerSizeError(700, 700, vinyl),
  'Size not available. This banner can be up to 600" on one side and 1800" on the other. Please adjust your dimensions or contact us for oversized orders.'
);

// ---- Server rejects out-of-range sizes (never trusts client) ----------------
const rejected = computePrice({ slug: '13oz-vinyl-banner', width: 700, height: 700, quantity: 1 });
eq('server rejects 700×700 ok', rejected.ok, false);
eq('server rejects 700×700 sizeError', rejected.sizeError, true);

if (errors.length) {
  console.error(`✗ BANNER PRICING FAILED (${errors.length}):\n  ` + errors.slice(0, 40).join('\n  '));
  process.exit(1);
}
console.log(`✓ BANNER PRICING OK — ${checked} assertions (4 products, Step 3 fixtures, per-banner $45 floor, boundary, decimals, sorted-cap validation, server rejection).`);

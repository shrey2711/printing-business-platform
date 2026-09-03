// Tests for the CMS -> pricing mapper. This is the code path that lets a
// non-technical editor change what a customer is charged, so it is tested for
// what it REFUSES as much as for what it applies.
//
// Run: node scripts/test-pricing-from-cms.mjs

import { readFileSync } from 'fs';
import { getProduct, listProducts } from '../backend/data/products.js';
import { computePrice } from '../backend/data/pricing.js';
import { composePricing, priceShift, isPrice, scalePricing } from '../backend/lib/pricingFromCms.js';

const fails = [];
let ran = 0;

const check = (name, fn) => {
  ran++;
  try {
    const problem = fn();
    if (problem) fails.push(`${name}: ${problem}`);
  } catch (e) {
    fails.push(`${name}: threw ${e.message}`);
  }
};

const priceOf = (slug, pricing, input = {}) => computePrice({ slug, quantity: 1, ...input }, { pricing }).total;

// ---------------------------------------------------------------- accepts --
check('canopy base price applies to the first quantity tier', () => {
  const p = getProduct('canopy-tent-10x10');
  const before = priceOf('canopy-tent-10x10', p.pricing);
  const r = composePricing(p.pricing, { base_price: 899 });
  if (!r.ok) return r.error;
  const after = priceOf('canopy-tent-10x10', r.pricing);
  if (before !== 835) return `baseline moved: expected 835, got ${before}`;
  if (after !== 899) return `expected 899 after edit, got ${after}`;
  return null;
});

check('banner per-square-foot rate applies', () => {
  const p = getProduct('13oz-vinyl-banner');
  const r = composePricing(p.pricing, { price_per_sqft: 3.5 });
  if (!r.ok) return r.error;
  if (r.pricing.pricePerSqFt !== 3.5) return `rate not applied: ${r.pricing.pricePerSqFt}`;
  const big = priceOf('13oz-vinyl-banner', r.pricing, { width: 120, height: 60 });
  const same = priceOf('13oz-vinyl-banner', p.pricing, { width: 120, height: 60 });
  if (!(big > same)) return `raising the rate did not raise the price (${same} -> ${big})`;
  return null;
});

check('the $45 banner floor still applies after a rate change', () => {
  const p = getProduct('13oz-vinyl-banner');
  const r = composePricing(p.pricing, { price_per_sqft: 0.01 });
  if (!r.ok) return r.error;
  const tiny = priceOf('13oz-vinyl-banner', r.pricing, { width: 12, height: 12 });
  if (tiny < 45) return `floor breached: ${tiny}`;
  return null;
});

check('flag base option price applies', () => {
  const p = getProduct('feather-angled-flag');
  const sel = { pkg: 'hw', size: 'sm', sides: 'single', days: 'std', base: 'water' };
  const before = priceOf('feather-angled-flag', p.pricing, { selections: sel });
  const r = composePricing(p.pricing, { option_prices: [{ group: 'base', choice: 'water', price: 30 }] });
  if (!r.ok) return r.error;
  const after = priceOf('feather-angled-flag', r.pricing, { selections: sel });
  if (after - before !== 10) return `expected +10 (20 -> 30), got ${before} -> ${after}`;
  return null;
});

check('a reported change list is produced', () => {
  const p = getProduct('canopy-tent-10x10');
  const r = composePricing(p.pricing, { base_price: 899 });
  if (!r.ok) return r.error;
  if (!Array.isArray(r.changes) || !r.changes.length) return 'no change list';
  return null;
});

// ---------------------------------------------------------------- refuses --
const refusals = [
  ['negative price', 'canopy-tent-10x10', { base_price: -5 }],
  ['zero-ish typo above the cap', 'canopy-tent-10x10', { base_price: 8350000 }],
  ['non-numeric price', 'canopy-tent-10x10', { base_price: 'eight hundred' }],
  ['unknown option group', 'feather-angled-flag', { option_prices: [{ group: 'nope', choice: 'water', price: 10 }] }],
  ['unknown option choice', 'feather-angled-flag', { option_prices: [{ group: 'base', choice: 'gold', price: 10 }] }],
  ['multiplier out of range', 'feather-angled-flag', { option_multipliers: [{ group: 'sides', choice: 'double', mult: 50 }] }],
  ['tier that does not exist', 'canopy-tent-10x10', { tiers: [{ min: 99, price: 500 }] }],
  ['per-sqft on a non-area product', 'canopy-tent-10x10', { price_per_sqft: 3 }],
  ['empty payload', 'canopy-tent-10x10', {}],
  ['unrecognised field only', 'canopy-tent-10x10', { discount_everything: true }]
];
for (const [name, slug, payload] of refusals) {
  check(`refuses: ${name}`, () => {
    const r = composePricing(getProduct(slug).pricing, payload);
    return r.ok ? 'was ACCEPTED but should have been refused' : null;
  });
}

check('a rejected edit does not mutate the live pricing block', () => {
  const p = getProduct('canopy-tent-10x10');
  const snapshot = JSON.stringify(p.pricing);
  composePricing(p.pricing, { base_price: -1 });
  composePricing(p.pricing, { tiers: [{ min: 99, price: 1 }] });
  return JSON.stringify(getProduct('canopy-tent-10x10').pricing) === snapshot ? null : 'live block was mutated';
});

// ------------------------------------------------------------- shift guard --
check('priceShift reports the size of a change', () => {
  const p = getProduct('canopy-tent-10x10');
  const r = composePricing(p.pricing, { base_price: 1670 });
  if (!r.ok) return r.error;
  const shift = priceShift(computePrice, 'canopy-tent-10x10', p.pricing, r.pricing);
  if (!shift.comparable) return 'not comparable';
  if (shift.pct !== 100) return `expected +100%, got ${shift.pct}% (${shift.from} -> ${shift.to})`;
  return null;
});

check('isPrice bounds', () => {
  if (isPrice(-1) || isPrice(NaN) || isPrice(Infinity) || isPrice(100001)) return 'accepted an invalid price';
  if (!isPrice(0) || !isPrice(45) || !isPrice(2.75)) return 'rejected a valid price';
  return null;
});


// ------------------------------------------------------- bulk / percentage --
check('a percentage rise reaches the customer price, through the normal checks', () => {
  const p = getProduct('canopy-tent-10x10');
  const scaled = scalePricing(p.pricing, 10);
  if (!scaled.ok) return scaled.error;
  const composed = composePricing(p.pricing, scaled.simple);
  if (!composed.ok) return composed.error;
  const before = priceOf('canopy-tent-10x10', p.pricing);
  const after = priceOf('canopy-tent-10x10', composed.pricing);
  const pct = Math.round(((after - before) / before) * 100);
  if (pct !== 10) return `expected +10%, got ${pct}% (${before} -> ${after})`;
  return null;
});

check('a percentage rise on an area product scales the rate, not the floor alone', () => {
  const p = getProduct('13oz-vinyl-banner');
  const scaled = scalePricing(p.pricing, 10);
  if (!scaled.ok) return scaled.error;
  if (scaled.simple.price_per_sqft == null) return 'per-sqft rate was not scaled';
  const composed = composePricing(p.pricing, scaled.simple);
  if (!composed.ok) return composed.error;
  const before = priceOf('13oz-vinyl-banner', p.pricing, { width: 120, height: 60 });
  const after = priceOf('13oz-vinyl-banner', composed.pricing, { width: 120, height: 60 });
  if (!(after > before)) return `price did not rise (${before} -> ${after})`;
  return null;
});

check('every quantity tier moves together, not just the first', () => {
  const p = getProduct('canopy-tent-10x10');
  const scaled = scalePricing(p.pricing, 10);
  if (!scaled.ok) return scaled.error;
  const tiers = scaled.simple.tiers || [];
  if (tiers.length !== (p.pricing.quantityTiers || []).length) return `scaled ${tiers.length} of ${(p.pricing.quantityTiers || []).length} tiers`;
  return null;
});

check('a bulk add-on price change does not ride along with a percentage', () => {
  const p = getProduct('feather-angled-flag');
  const scaled = scalePricing(p.pricing, 10);
  if (!scaled.ok) return scaled.error;
  if (scaled.simple.option_prices || scaled.simple.option_multipliers) {
    return 'a percentage change touched add-on prices, which it must leave alone';
  }
  return null;
});

for (const [name, pct] of [['zero', 0], ['absurdly high', 500], ['below -90', -95], ['not a number', 'ten']]) {
  check(`refuses a ${name} percentage`, () => {
    const r = scalePricing(getProduct('canopy-tent-10x10').pricing, pct);
    return r.ok ? 'was ACCEPTED but should have been refused' : null;
  });
}

check('scaling never mutates the live pricing block', () => {
  const before = JSON.stringify(getProduct('canopy-tent-10x10').pricing);
  scalePricing(getProduct('canopy-tent-10x10').pricing, 25);
  return JSON.stringify(getProduct('canopy-tent-10x10').pricing) === before ? null : 'live block was mutated';
});

check('the bulk route is declared before /:slug, or "bulk" is read as a product', () => {
  const src = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
  const bulk = src.indexOf("app.put('/api/admin/pricing/bulk'");
  const slug = src.indexOf("app.put('/api/admin/pricing/:slug'");
  if (bulk === -1) return 'the bulk route is missing';
  if (slug === -1) return 'the single-product route is missing';
  return bulk < slug ? null : 'the /:slug route would swallow /bulk — Express matches in declaration order';
});

check('bulk validates every product before writing any', () => {
  const src = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf("app.put('/api/admin/pricing/bulk'"), src.indexOf("app.put('/api/admin/pricing/:slug'"));
  const validate = body.indexOf('validatePricingBlock');
  const write = body.indexOf('.upsert(');
  if (validate === -1) return 'bulk does not validate at all';
  if (write === -1) return 'bulk does not write';
  if (!(validate < write)) return 'it writes before validating';
  if (!/problems\.length[\s\S]{0,200}return res\.status\(400\)/.test(body)) {
    return 'it does not abort the whole batch when one product fails';
  }
  return null;
});


check('a percentage change reaches the real price of every priced product', () => {
  const unsupported = [];
  const wrong = [];
  for (const p of listProducts({ includeInactive: true })) {
    const current = getProduct(p.slug).pricing;
    const scaled = scalePricing(current, 10);
    if (!scaled.ok) { unsupported.push(p.slug); continue; }
    const composed = composePricing(current, scaled.simple);
    if (!composed.ok) { wrong.push(`${p.slug}: ${composed.error}`); continue; }
    const before = computePrice({ slug: p.slug, quantity: 1 }, { pricing: current });
    const after = computePrice({ slug: p.slug, quantity: 1 }, { pricing: composed.pricing });
    if (!before.ok || !after.ok || before.total <= 0) continue;
    // Add-ons deliberately do not scale, so a product whose default selection
    // includes one moves slightly less than the headline percentage.
    const pct = ((after.total - before.total) / before.total) * 100;
    if (pct < 8 || pct > 10.5) wrong.push(`${p.slug}: moved ${pct.toFixed(1)}% on a 10% change`);
  }
  if (wrong.length) return wrong.join('; ');
  // Quote-only kits and the competitor-priced stand have no number to scale.
  if (unsupported.length > 4) return `${unsupported.length} products cannot be bulk-priced: ${unsupported.join(', ')}`;
  return null;
});

check('quote-only and competitor-priced products are refused with a reason, not silently skipped', () => {
  for (const slug of ['seg-modular-trade-show-kit-a', 'table-top-banner-stand']) {
    const r = scalePricing(getProduct(slug).pricing, 10);
    if (r.ok) return `${slug} was scaled but has no price of its own`;
    if (!/quote-only|competitor/i.test(r.error)) return `${slug}: unhelpful reason "${r.error}"`;
  }
  return null;
});

if (fails.length) {
  console.error(`\n✗ CMS PRICING MAPPER FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CMS PRICING MAPPER OK — ${ran} assertions: editable values apply, the engine's floors and caps survive, and bad edits are refused without touching the live block.`);

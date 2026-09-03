// Compose a full pricing block from the handful of friendly fields a
// non-technical editor sets in the CMS.
//
// Editors never see or edit the pricing JSON. They set values — a base price, a
// per-square-foot rate, a quantity-tier price, an add-on amount — and this maps
// them onto the product's CURRENT effective pricing block, leaving the engine's
// structure (area maths, size caps, minimum charges, matrix shape) untouched.
//
// Everything composed here is then run through validatePricingBlock() in
// app.js, which prices the product with the candidate block across every
// selection and rejects anything that cannot produce a positive, finite total.
// This module's job is to make sure only the intended numbers can move at all.

// A price must be a finite, non-negative number within a sane band. The upper
// bound is a typo guard: a slipped keypress turning 835 into 83500 is caught
// here rather than by a customer.
const MAX_PRICE = 100000;

export function isPrice(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= MAX_PRICE;
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Fields an editor may set. Anything not listed is ignored, so a stray key in
 * the CMS payload can never reach the pricing block.
 */
export const EDITABLE_FIELDS = [
  'base_price',        // unit / configured base
  'price_per_sqft',    // area model
  'min_charge',        // area model floor
  'tiers',             // [{ min, price }] or [{ min, prices: { key: value } }]
  'option_prices',     // [{ group, choice, price }] — add-ons (walls, bases, …)
  'option_multipliers', // [{ group, choice, mult }] — e.g. fabric upgrades
  'variant_prices',     // [{ id, price }] — per-size unit price on unit-model products
  'price_matrix'        // [{ key, price }] — cells of a size x turnaround matrix
];

/**
 * @param {object} current  the product's effective pricing block (override or code default)
 * @param {object} simple   friendly fields from the CMS
 * @returns {{ ok: boolean, pricing?: object, error?: string, changes?: string[] }}
 */
export function composePricing(current, simple) {
  if (!current || typeof current !== 'object' || !current.model) {
    return { ok: false, error: 'The product has no pricing block to update.' };
  }
  if (!simple || typeof simple !== 'object') {
    return { ok: false, error: 'No pricing fields supplied.' };
  }

  // Deep clone so a rejected edit cannot mutate the live block.
  const next = JSON.parse(JSON.stringify(current));
  const changes = [];

  // ---- area model: per-square-foot rate and minimum charge ----
  if (simple.price_per_sqft != null) {
    if (next.model !== 'area') return { ok: false, error: 'price_per_sqft only applies to area-priced products.' };
    if (!isPrice(simple.price_per_sqft)) return { ok: false, error: `price_per_sqft ${simple.price_per_sqft} is not a valid price.` };
    changes.push(`pricePerSqFt ${next.pricePerSqFt} -> ${round2(simple.price_per_sqft)}`);
    next.pricePerSqFt = round2(simple.price_per_sqft);
  }
  if (simple.min_charge != null) {
    if (!isPrice(simple.min_charge)) return { ok: false, error: `min_charge ${simple.min_charge} is not a valid price.` };
    changes.push(`minChargeUsd ${next.minChargeUsd} -> ${round2(simple.min_charge)}`);
    next.minChargeUsd = round2(simple.min_charge);
  }

  // ---- flat base price ----
  if (simple.base_price != null) {
    if (!isPrice(simple.base_price)) return { ok: false, error: `base_price ${simple.base_price} is not a valid price.` };
    if (Array.isArray(next.quantityTiers) && next.quantityTiers.length) {
      // Apply to the first (lowest-quantity) tier, which is what "from $X" shows.
      const tier = next.quantityTiers[0];
      if (tier.prices && typeof tier.prices === 'object') {
        const key = Object.keys(tier.prices)[0];
        changes.push(`tier[0].prices.${key} ${tier.prices[key]} -> ${round2(simple.base_price)}`);
        tier.prices[key] = round2(simple.base_price);
      } else {
        changes.push(`tier[0].price ${tier.price} -> ${round2(simple.base_price)}`);
        tier.price = round2(simple.base_price);
      }
    } else if (next.basePrice != null) {
      changes.push(`basePrice ${next.basePrice} -> ${round2(simple.base_price)}`);
      next.basePrice = round2(simple.base_price);
    } else {
      return { ok: false, error: 'This product has no simple base price to set — use tiers or option prices.' };
    }
  }

  // ---- quantity tiers ----
  if (simple.tiers != null) {
    if (!Array.isArray(simple.tiers) || !simple.tiers.length) return { ok: false, error: 'tiers must be a non-empty list.' };
    if (!Array.isArray(next.quantityTiers)) return { ok: false, error: 'This product is not priced by quantity tiers.' };
    for (const t of simple.tiers) {
      const min = Number(t.min);
      if (!Number.isInteger(min) || min < 1) return { ok: false, error: `tier min ${t.min} must be a whole number of 1 or more.` };
      const target = next.quantityTiers.find((x) => Number(x.min) === min);
      if (!target) return { ok: false, error: `No quantity tier starting at ${min} on this product.` };
      if (t.price != null) {
        if (!isPrice(t.price)) return { ok: false, error: `tier ${min} price ${t.price} is not a valid price.` };
        if (target.prices) return { ok: false, error: `Tier ${min} has multiple prices — set them individually.` };
        changes.push(`tier[${min}].price ${target.price} -> ${round2(t.price)}`);
        target.price = round2(t.price);
      }
      if (t.prices && typeof t.prices === 'object') {
        for (const [key, value] of Object.entries(t.prices)) {
          if (!target.prices || !(key in target.prices)) return { ok: false, error: `Tier ${min} has no "${key}" price.` };
          if (!isPrice(value)) return { ok: false, error: `tier ${min} "${key}" ${value} is not a valid price.` };
          changes.push(`tier[${min}].prices.${key} ${target.prices[key]} -> ${round2(value)}`);
          target.prices[key] = round2(value);
        }
      }
    }
  }

  // ---- option add-on amounts (walls, bases, finishing) ----
  if (simple.option_prices != null) {
    if (!Array.isArray(simple.option_prices)) return { ok: false, error: 'option_prices must be a list.' };
    for (const row of simple.option_prices) {
      const group = (next.optionGroups || []).find((g) => g.id === row.group);
      if (!group) return { ok: false, error: `No option group "${row.group}" on this product.` };
      const choice = (group.choices || []).find((c) => c.id === row.choice);
      if (!choice) return { ok: false, error: `No choice "${row.choice}" in group "${row.group}".` };
      if (!isPrice(row.price)) return { ok: false, error: `${row.group}/${row.choice} price ${row.price} is not a valid price.` };
      changes.push(`${row.group}/${row.choice} price ${choice.price} -> ${round2(row.price)}`);
      choice.price = round2(row.price);
    }
  }

  // ---- option multipliers (fabric upgrades, print coverage) ----
  if (simple.option_multipliers != null) {
    if (!Array.isArray(simple.option_multipliers)) return { ok: false, error: 'option_multipliers must be a list.' };
    for (const row of simple.option_multipliers) {
      const group = (next.optionGroups || []).find((g) => g.id === row.group);
      if (!group) return { ok: false, error: `No option group "${row.group}" on this product.` };
      const choice = (group.choices || []).find((c) => c.id === row.choice);
      if (!choice) return { ok: false, error: `No choice "${row.choice}" in group "${row.group}".` };
      const m = Number(row.mult);
      // A multiplier below 1 discounts, above 5 is almost certainly a typo.
      if (!Number.isFinite(m) || m <= 0 || m > 5) return { ok: false, error: `${row.group}/${row.choice} multiplier ${row.mult} is out of range (0-5).` };
      changes.push(`${row.group}/${row.choice} mult ${choice.mult} -> ${m}`);
      choice.mult = m;
    }
  }

  // ---- matrix cells (size x turnaround grids: banner stands, flags, SEG kits) ----
  if (simple.price_matrix != null) {
    if (!Array.isArray(simple.price_matrix)) return { ok: false, error: 'price_matrix must be a list.' };
    if (!next.priceMatrix || typeof next.priceMatrix !== 'object') return { ok: false, error: 'This product is not priced from a matrix.' };
    for (const row of simple.price_matrix) {
      if (!(row.key in next.priceMatrix)) return { ok: false, error: `No matrix cell "${row.key}" on this product.` };
      if (!isPrice(row.price)) return { ok: false, error: `matrix ${row.key} price ${row.price} is not a valid price.` };
      changes.push(`matrix ${row.key} ${next.priceMatrix[row.key]} -> ${round2(row.price)}`);
      next.priceMatrix[row.key] = round2(row.price);
    }
  }

  // ---- per-variant unit prices (unit-model products: flags, stands, covers) ----
  if (simple.variant_prices != null) {
    if (!Array.isArray(simple.variant_prices)) return { ok: false, error: 'variant_prices must be a list.' };
    if (!Array.isArray(next.variants)) return { ok: false, error: 'This product is not priced per variant.' };
    for (const row of simple.variant_prices) {
      const variant = next.variants.find((v) => v.id === row.id);
      if (!variant) return { ok: false, error: `No variant "${row.id}" on this product.` };
      if (variant.unitPrice == null) return { ok: false, error: `Variant "${row.id}" has no unit price to set.` };
      if (!isPrice(row.price)) return { ok: false, error: `variant ${row.id} price ${row.price} is not a valid price.` };
      changes.push(`variant ${row.id} ${variant.unitPrice} -> ${round2(row.price)}`);
      variant.unitPrice = round2(row.price);
    }
  }

  if (!changes.length) return { ok: false, error: 'Nothing to change — no recognised pricing fields were supplied.' };
  return { ok: true, pricing: next, changes };
}

/**
 * Guard against a fat-finger edit reaching customers: compare the price of a
 * representative configuration before and after. A swing beyond `maxShiftPct`
 * needs explicit confirmation, mirroring the existing `confirm` flag on the
 * admin pricing endpoint.
 */
export function priceShift(computePrice, slug, before, after) {
  const a = computePrice({ slug, quantity: 1 }, { pricing: before });
  const b = computePrice({ slug, quantity: 1 }, { pricing: after });
  if (!a.ok || !b.ok || !Number.isFinite(a.total) || !Number.isFinite(b.total) || a.total <= 0) {
    return { comparable: false };
  }
  return {
    comparable: true,
    from: a.total,
    to: b.total,
    pct: Math.round(((b.total - a.total) / a.total) * 100)
  };
}

/**
 * Turn "raise this product by N%" into the same friendly field payload
 * composePricing() already validates. Deliberately NOT a separate write path:
 * a bulk change is the most dangerous edit in the system, so it goes through
 * exactly the checks a single edit does.
 *
 * Scales the field that actually drives the price for this model, and leaves
 * add-on amounts alone — a 5% rise on a canopy should not silently reprice a
 * sandbag.
 *
 * @returns {{ ok: boolean, simple?: object, error?: string }}
 */
export function scalePricing(current, percent) {
  const pct = Number(percent);
  if (!Number.isFinite(pct)) return { ok: false, error: 'The percentage must be a number.' };
  if (pct === 0) return { ok: false, error: 'A 0% change would do nothing.' };
  // Wider than the per-product confirm threshold, which still applies on top.
  if (pct < -90 || pct > 200) return { ok: false, error: `${pct}% is outside the allowed range (-90 to 200).` };

  // Quote-only products carry no prices at all, so there is nothing to scale.
  // Say that plainly rather than reporting a missing field.
  if (current.quoteOnly) return { ok: false, error: 'This product is quote-only and has no published price to change.' };

  const f = 1 + pct / 100;
  const scale = (n) => round2(Number(n) * f);

  if (current.model === 'area') {
    const simple = {};
    if (current.pricePerSqFt != null) simple.price_per_sqft = scale(current.pricePerSqFt);
    if (current.minChargeUsd != null) simple.min_charge = scale(current.minChargeUsd);
    if (!Object.keys(simple).length) return { ok: false, error: 'This area-priced product has no rate to scale.' };
    return { ok: true, simple };
  }

  if (Array.isArray(current.quantityTiers) && current.quantityTiers.length) {
    const tiers = current.quantityTiers.map((t) => {
      if (t.prices && typeof t.prices === 'object') {
        const prices = {};
        for (const [k, v] of Object.entries(t.prices)) prices[k] = scale(v);
        return { min: Number(t.min), prices };
      }
      return { min: Number(t.min), price: scale(t.price) };
    });
    return { ok: true, simple: { tiers } };
  }

  if (current.basePrice != null) return { ok: true, simple: { base_price: scale(current.basePrice) } };

  // Configured products price by adding up chosen options. Only the groups
  // marked as the base carry the product's own price; the rest are add-ons
  // (rush production, design help) and a percentage rise should not move them.
  if (Array.isArray(current.optionGroups)) {
    const option_prices = [];
    for (const g of current.optionGroups) {
      if (g.pricing !== 'base') continue;
      for (const c of g.choices || []) {
        if (typeof c.price === 'number') option_prices.push({ group: g.id, choice: c.id, price: scale(c.price) });
      }
    }
    if (option_prices.length) return { ok: true, simple: { option_prices } };
  }

  // Matrix-priced products keep their prices in a size x turnaround grid.
  if (current.priceMatrix && typeof current.priceMatrix === 'object') {
    const price_matrix = Object.entries(current.priceMatrix)
      .filter(([, v]) => typeof v === 'number')
      .map(([key, v]) => ({ key, price: scale(v) }));
    if (price_matrix.length) return { ok: true, simple: { price_matrix } };
  }

  // Unit products price per size.
  if (Array.isArray(current.variants)) {
    const variant_prices = current.variants
      .filter((v) => typeof v.unitPrice === 'number')
      .map((v) => ({ id: v.id, price: scale(v.unitPrice) }));
    if (variant_prices.length) return { ok: true, simple: { variant_prices } };

    // Competitive products derive our price from a competitor's, so there is no
    // number here that a percentage could honestly move.
    return { ok: false, error: 'This product is priced against a competitor, so a percentage change does not apply. Edit it individually.' };
  }

  return { ok: false, error: 'This product has no scalable price — edit it individually.' };
}

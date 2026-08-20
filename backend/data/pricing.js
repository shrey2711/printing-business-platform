import { getProduct, getQuantityDiscount } from './products.js';
import { calculateCompetitivePrice, competitorCurrentPrice } from './competitive.js';

// Compute an instant price for a configured product.
// Returns a structured breakdown so the frontend can show the math (like B2Sign).
// `opts.pricing` replaces the product's code-default pricing block — used to
// apply a dashboard pricing override at request time (display AND checkout), so
// the quoted price and the charged price always agree.
export function computePrice(input, opts = {}) {
  const { slug, quantity = 1, width, height, materialId, variantId, options = [], finishing = {} } = input;
  const product = getProduct(slug);
  if (!product) {
    return { ok: false, error: 'Unknown product' };
  }

  const qty = clampInt(quantity, 1, 100000);
  const pricing = opts.pricing || product.pricing;

  // Quote-only products have no computed price — surfaced as "Request a Quote".
  // `quoteOnly` lets a CONFIGURED product (with size/plug/mockup selectors) stay
  // quote-only: the selectors render for the quote, but no price is computed.
  if (pricing.model === 'quote' || pricing.quoteOnly) {
    return { ok: false, quote: true, error: 'Custom quote' };
  }
  const selectedOptions = Array.isArray(options) ? options : [];

  let perPieceGoods = 0;
  let preMultUnit = null; // per-piece price before whole-order multipliers (rush)
  let minChargeApplied = false; // per-banner dollar floor kicked in (area model)
  const breakdown = [];
  const flatAddons = []; // one-time order charges (e.g. design service), not x qty
  const dims = {};

  if (pricing.model === 'area') {
    let w, h;
    if (isCappedSize(pricing)) {
      // Made-to-size banners use sorted, orientation-independent size caps and
      // REJECT out-of-range dimensions (never silently clamp). This server check
      // is authoritative — the client mirrors it for instant feedback, but a
      // crafted request with an out-of-range size is rejected, not priced.
      w = Number(width ?? pricing.defaultWidthIn);
      h = Number(height ?? pricing.defaultHeightIn);
      const sizeErr = bannerSizeError(w, h, pricing);
      if (sizeErr) return { ok: false, sizeError: true, error: sizeErr };
    } else {
      w = clampNum(width ?? pricing.defaultWidthIn, pricing.minWidthIn, pricing.maxWidthIn);
      h = clampNum(height ?? pricing.defaultHeightIn, pricing.minHeightIn, pricing.maxHeightIn);
    }
    const rawArea = (w * h) / 144;
    const area = Math.max(rawArea, pricing.minAreaSqFt || 0);
    dims.widthIn = w;
    dims.heightIn = h;
    dims.areaSqFt = round2(area);

    const material = pickMaterial(pricing.materials, materialId);
    let base = area * pricing.pricePerSqFt * material.multiplier;
    breakdown.push({
      label: `${material.name} — ${round2(area)} sq ft @ $${pricing.pricePerSqFt}/sq ft`,
      amount: round2(base)
    });

    const linearFt = (2 * (w + h)) / 12; // perimeter in linear feet
    perPieceGoods = base + applyFinishing(pricing.finishing, selectedOptions, {
      area,
      linearFt,
      breakdown
    });

    // Some finishing (e.g. double sided) multiplies the whole area cost.
    perPieceGoods = applyAreaMultipliers(pricing.finishing, selectedOptions, base, perPieceGoods, breakdown);

    // Per-banner dollar minimum, applied to the UNIT price before quantity, so
    // e.g. 5 tiny banners = 5 × $45, not one $45 charge for the whole order.
    if (pricing.minChargeUsd && perPieceGoods < pricing.minChargeUsd) {
      const bump = pricing.minChargeUsd - perPieceGoods;
      perPieceGoods = pricing.minChargeUsd;
      breakdown.push({ label: 'Minimum order charge', amount: round2(bump) });
      minChargeApplied = true;
    }

    // Production-speed multiplier from a finishing group whose choices carry a
    // `mult` (banner "Delivery": standard 1× included, rush 1.55×). Snapshot the
    // pre-rush price so the UI shows the exact rush surcharge in DOLLARS, never a
    // percentage. Applied to the per-piece price after the minimum charge.
    preMultUnit = perPieceGoods;
    for (const g of pricing.finishingGroups || []) {
      if (!(g.choices || []).some((c) => Number(c.mult) && Number(c.mult) !== 1)) continue;
      const def = g.choices.find((c) => c.default) || g.choices[0];
      const chosen = g.choices.find((c) => c.id === finishing[g.id]) || def;
      const mult = Number(chosen?.mult) || 1;
      dims[g.id] = chosen?.name;
      if (mult !== 1) {
        const before = perPieceGoods;
        perPieceGoods = round2(perPieceGoods * mult);
        breakdown.push({ label: `${g.label} — ${chosen.name}`, amount: round2(perPieceGoods - before) });
      }
    }
  } else if (pricing.model === 'configured') {
    // Multi-axis configuration (canopy tents): one base group sets the starting
    // price, any number of multiplier groups scale it, and additive groups bolt
    // on extras with their own quantities.
    const rawSelections = input.selections && typeof input.selections === 'object' ? input.selections : {};
    // Enforce combined caps (e.g. full + half walls <= 3) so a crafted request
    // can never price an impossible configuration.
    const selections = applyConstraints(pricing.constraints, rawSelections);
    const groups = pricing.optionGroups || [];
    const chosen = {};

    // 1. Base. Two ways to set it:
    //    a) quantityTiers: base price changes by order quantity (e.g. 1-2 units
    //       vs 3+ units). The tier IS the volume discount — no % discount added.
    //    b) a base option group where the customer picks (e.g. tent size).
    let running = 0;
    if (pricing.priceMatrix && Array.isArray(pricing.matrixGroups) && pricing.matrixGroups.length) {
      // c) priceMatrix: the price is looked up from a combination of separate
      //    select dimensions (e.g. size × kit × delivery) whose values are
      //    irregular and can't compose as base ± multiplier/add. Each matrix
      //    group renders as its own select, so "with stand" and "graphic only"
      //    are a distinct choice rather than mixed into one long list.
      const idFor = (gid) => {
        if (selections[gid] != null) return selections[gid];
        const g = groups.find((x) => x.id === gid);
        const d = (g?.choices || []).find((c) => c.default) || (g?.choices || [])[0];
        return d?.id;
      };
      const key = pricing.matrixGroups.map(idFor).join('|');
      // A combination absent from the matrix is intentionally NOT sold online
      // (e.g. a rush double-sided cell with no supplied price) — surface it as a
      // quote rather than silently charging $0.
      if (!(key in pricing.priceMatrix)) {
        return { ok: false, quote: true, error: 'This configuration is quoted — contact us for pricing.' };
      }
      running = Number(pricing.priceMatrix[key]) || 0;
      for (const gid of pricing.matrixGroups) {
        const g = groups.find((x) => x.id === gid);
        const c = pickChoice(g, idFor(gid));
        if (g && c) chosen[g.id] = c.label || c.id;
      }
      breakdown.push({ label: pricing.baseLabel || 'Price', amount: round2(running) });
    } else if (Array.isArray(pricing.quantityTiers) && pricing.quantityTiers.length) {
      const tier = pickTier(pricing.quantityTiers, qty);
      // Base may vary by a "kit" selection (e.g. full set vs graphic only):
      // tier.prices = { full: 835, canopy: 510 }. Falls back to tier.price.
      if (tier.prices && pricing.kitGroupId) {
        const kitId = selections[pricing.kitGroupId];
        running = Number(tier.prices[kitId] != null ? tier.prices[kitId] : Object.values(tier.prices)[0]) || 0;
        // Record the kit choice so it shows in the order spec line.
        const kitGroup = groups.find((g) => g.id === pricing.kitGroupId);
        const kitChoice = pickChoice(kitGroup, kitId);
        if (kitGroup && kitChoice) chosen[kitGroup.id] = kitChoice.label || kitChoice.id;
      } else {
        running = Number(tier.price) || 0;
      }
      breakdown.push({ label: `${pricing.baseLabel || 'Base price'}${tier.min > 1 ? ` (${tier.min}+ units)` : ''}`, amount: round2(running) });
    } else {
      const baseGroup = groups.find((g) => g.pricing === 'base');
      const baseChoice = pickChoice(baseGroup, selections[baseGroup?.id]);
      running = baseChoice ? Number(baseChoice.price) || 0 : 0;
      if (baseGroup && baseChoice) {
        chosen[baseGroup.id] = baseChoice.label || baseChoice.id;
        breakdown.push({ label: `${baseGroup.label} — ${baseChoice.label}`, amount: round2(running) });
      }
    }

    // 2. Multipliers — e.g. frame grade, print coverage.
    for (const g of groups) {
      if (g.pricing !== 'multiplier') continue;
      const choice = pickChoice(g, selections[g.id]);
      if (!choice) continue;
      chosen[g.id] = choice.label || choice.id;
      const mult = Number(choice.mult);
      if (!Number.isFinite(mult) || mult === 1) continue;
      const before = running;
      running *= mult;
      breakdown.push({ label: `${g.label} — ${choice.label}`, amount: round2(running - before) });
    }

    // 3. Add-ons. A 'select' add group adds the chosen option's price once
    //    (e.g. walls: none/1/2/3). A 'multi' add group adds each picked option
    //    times its count (e.g. accessories).
    for (const g of groups) {
      if (g.pricing !== 'add') continue;

      if (g.type === 'select') {
        const choice = pickChoice(g, selections[g.id]);
        if (!choice) continue;
        chosen[g.id] = choice.label || choice.id;
        const amt = Number(choice.price) || 0;
        if (amt) {
          running += amt;
          breakdown.push({ label: `${g.label} — ${choice.label}`, amount: round2(amt) });
        }
        continue;
      }

      const picked = pickMulti(g, selections[g.id]);
      if (picked.length) {
        chosen[g.id] = picked.map((p) => (p.count > 1 ? `${p.choice.label} x${p.count}` : p.choice.label)).join(', ');
      }
      for (const { choice, count } of picked) {
        const amt = (Number(choice.price) || 0) * count;
        if (!amt) continue;
        running += amt;
        breakdown.push({
          label: count > 1 ? `${choice.label} × ${count}` : choice.label,
          amount: round2(amt)
        });
      }
    }

    // Snapshot the price BEFORE whole-order multipliers, so the UI can show a
    // rush add-on's dollar value without dividing a lagging total (avoids flicker).
    preMultUnit = running;

    // 4. Whole-order multipliers (e.g. rush delivery), applied AFTER add-ons so
    //    they scale base + walls together.
    for (const g of groups) {
      if (g.pricing !== 'multiplyTotal') continue;
      const choice = pickChoice(g, selections[g.id]);
      if (!choice) continue;
      chosen[g.id] = choice.label || choice.id;
      const mult = Number(choice.mult);
      if (!Number.isFinite(mult) || mult === 1) continue;
      const before = running;
      running *= mult;
      breakdown.push({ label: `${g.label} — ${choice.label}`, amount: round2(running - before) });
    }

    // 5. Flat add-ons — charged ONCE per order, not per piece (e.g. design fee).
    for (const g of groups) {
      if (g.pricing !== 'addFlat') continue;
      const choice = pickChoice(g, selections[g.id]);
      if (!choice) continue;
      chosen[g.id] = choice.label || choice.id;
      const amt = Number(choice.price) || 0;
      if (amt) flatAddons.push({ label: `${g.label} — ${choice.label}`, amount: round2(amt) });
    }

    dims.configuration = chosen;
    // Readable one-liner for order specs / emails, matching how `unit` reports.
    dims.variant = Object.values(chosen).filter(Boolean).join(' • ');
    perPieceGoods = running;
  } else if (pricing.model === 'competitive') {
    // Apex price = competitor's comparable selling price × (1 − discount%).
    // competitorPrice is entered manually; null → quote required.
    const variant = (pricing.variants || []).find((v) => v.id === variantId) || (pricing.variants || [])[0];
    const apex = variant ? calculateCompetitivePrice(competitorCurrentPrice(variant), pricing.discountPercent) : null;
    if (apex == null) return { ok: false, quote: true, error: 'Quote required' };
    dims.variant = variant.name || variant.id;
    breakdown.push({ label: `${product.name} — ${variant.name || variant.id}`, amount: round2(apex) });
    perPieceGoods = apex;
  } else {
    const variant = pickVariant(pricing.variants, variantId);
    const material = pickMaterial(pricing.materials, materialId);
    let base = variant.unitPrice * material.multiplier;
    dims.variant = variant.name;
    breakdown.push({
      label: `${variant.name} — ${material.name}`,
      amount: round2(base)
    });
    perPieceGoods = base + applyFinishing(pricing.finishing, selectedOptions, {
      area: 1,
      linearFt: 0,
      breakdown
    });
  }

  // quantityTiers already price in the volume break, so don't stack a % discount.
  const usesTiers = pricing.model === 'configured' && Array.isArray(pricing.quantityTiers) && pricing.quantityTiers.length;
  // Competitive products are already priced per variant — no extra volume % on top.
  const discount = usesTiers || pricing.model === 'competitive' ? 0 : getQuantityDiscount(qty);
  const unitPrice = round2(perPieceGoods);
  const goodsSubtotal = perPieceGoods * qty;
  const discountAmount = goodsSubtotal * discount;
  const flatTotal = flatAddons.reduce((n, a) => n + a.amount, 0);
  const total = goodsSubtotal - discountAmount + flatTotal;

  return {
    ok: true,
    slug,
    productName: product.name,
    quantity: qty,
    dims,
    unitPrice,
    // Subtotal before rush/whole-order multipliers, x qty — lets the UI show a
    // rush add-on's exact $ without dividing a lagging total.
    preMultipliedSubtotal: round2((preMultUnit ?? perPieceGoods) * qty),
    breakdown,
    flatAddons,
    quantityDiscountPct: Math.round(discount * 100),
    discountAmount: round2(discountAmount),
    subtotal: round2(goodsSubtotal),
    total: round2(total),
    perPieceAfterDiscount: round2(total / qty),
    // Per-banner dollar-minimum flag, so the UI can show "Minimum order charge
    // applied: $XX.00 each" (area model only; null on every other product).
    minChargeApplied,
    minChargeUsd: pricing.minChargeUsd || null,
    turnaround: product.turnaround
  };
}

// True when a product uses sorted, orientation-independent made-to-size caps
// (vs the legacy per-axis min/max clamp). Only these products reject out-of-range
// sizes; everything else keeps the existing clamp behaviour untouched.
function isCappedSize(pricing) {
  return pricing.sizeSmallCapIn != null && pricing.sizeLargeCapIn != null;
}

// Sorted, orientation-independent size validation for made-to-size products.
// Returns an error message string, or null when the size is valid. All numbers
// come from the product's own pricing config so the message can never drift from
// the rule it enforces. Shared by computePrice and the pricing verify script.
export function bannerSizeError(width, height, pricing) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return 'Enter a width and height greater than 0.';
  }
  const small = Math.min(w, h);
  const large = Math.max(w, h);
  if (small > pricing.sizeSmallCapIn || large > pricing.sizeLargeCapIn) {
    return bannerSizeCapMessage(pricing);
  }
  return null;
}

export function bannerSizeCapMessage(pricing) {
  return `Size not available. This banner can be up to ${pricing.sizeSmallCapIn}" on one side and ${pricing.sizeLargeCapIn}" on the other. Please adjust your dimensions or contact us for oversized orders.`;
}

function applyFinishing(finishing = [], selected, ctx) {
  let extra = 0;
  for (const opt of finishing) {
    if (!isSelected(opt, selected)) continue;
    if (opt.type === 'flat') {
      extra += opt.rate;
      if (opt.rate) ctx.breakdown.push({ label: opt.name, amount: round2(opt.rate) });
    } else if (opt.type === 'perLinearFt') {
      const amt = opt.rate * ctx.linearFt;
      extra += amt;
      if (amt) ctx.breakdown.push({ label: `${opt.name} (${round2(ctx.linearFt)} lin ft)`, amount: round2(amt) });
    } else if (opt.type === 'perSqFt') {
      const amt = opt.rate * ctx.area;
      extra += amt;
      if (amt) ctx.breakdown.push({ label: `${opt.name} (${round2(ctx.area)} sq ft)`, amount: round2(amt) });
    } else if (opt.type === 'perUnit') {
      extra += opt.rate;
      if (opt.rate) ctx.breakdown.push({ label: opt.name, amount: round2(opt.rate) });
    }
    // 'multiplyArea' handled separately in applyAreaMultipliers
  }
  return extra;
}

function applyAreaMultipliers(finishing = [], selected, base, current, breakdown) {
  let result = current;
  for (const opt of finishing) {
    if (opt.type !== 'multiplyArea' || !isSelected(opt, selected)) continue;
    const added = base * (opt.rate - 1);
    result += added;
    if (added) breakdown.push({ label: opt.name, amount: round2(added) });
  }
  return result;
}

function isSelected(opt, selected) {
  if (opt.default && selected.length === 0) return true;
  return selected.includes(opt.id);
}

// Resolve a single-select option group to a choice: explicit id, else the one
// flagged `default`, else the first. Never returns undefined for a valid group.
function pickChoice(group, value) {
  if (!group || !Array.isArray(group.choices) || !group.choices.length) return null;
  return (
    group.choices.find((c) => c.id === value) ||
    group.choices.find((c) => c.default) ||
    group.choices[0]
  );
}

// Normalise a multi-select value into [{ choice, count }].
// Accepts ['walls'] or { walls: 3 }; undefined falls back to `default` choices.
// Counts are clamped to each choice's `max` so a hand-crafted API call cannot
// price 999 walls onto a tent.
function pickMulti(group, value) {
  if (!group || !Array.isArray(group.choices)) return [];
  const out = [];
  const add = (id, count) => {
    const choice = group.choices.find((c) => c.id === id);
    if (!choice) return;
    const max = Number(choice.max) > 0 ? Number(choice.max) : 1;
    const n = Math.min(Math.max(Math.round(Number(count) || 0), 0), max);
    if (n > 0) out.push({ choice, count: n });
  };

  if (Array.isArray(value)) {
    for (const id of value) add(id, 1);
  } else if (value && typeof value === 'object') {
    for (const [id, count] of Object.entries(value)) add(id, count);
  } else if (value === undefined) {
    for (const c of group.choices) if (c.default) add(c.id, 1);
  }
  return out;
}

// Clamp numeric select groups so their combined value stays within a cap.
// Reduces from the LAST group listed first (e.g. keep full walls, trim half).
function applyConstraints(constraints, selections) {
  if (!Array.isArray(constraints) || !constraints.length) return selections;
  const s = { ...selections };
  for (const con of constraints) {
    let total = con.groups.reduce((n, g) => n + (Number(s[g]) || 0), 0);
    for (let i = con.groups.length - 1; i >= 0 && total > con.max; i--) {
      const g = con.groups[i];
      const count = Number(s[g]) || 0;
      const reduce = Math.min(count, total - con.max);
      const next = count - reduce;
      total -= reduce;
      s[g] = next > 0 ? String(next) : 'none';
    }
  }
  return s;
}

// Pick the pricing tier for an order quantity: the highest `min` that is <= qty.
function pickTier(tiers, qty) {
  let chosen = tiers[0];
  for (const t of tiers) {
    if (qty >= t.min && t.min >= (chosen?.min ?? 0)) chosen = t;
  }
  return chosen || { min: 1, price: 0 };
}

function pickMaterial(materials = [], id) {
  if (!materials.length) return { name: 'Standard', multiplier: 1 };
  return materials.find((m) => m.id === id) || materials[0];
}

function pickVariant(variants = [], id) {
  return variants.find((v) => v.id === id) || variants[0];
}

function clampNum(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function clampInt(value, min, max) {
  return Math.round(clampNum(value, min, max));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

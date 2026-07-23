import { getProduct, getQuantityDiscount } from './products.js';

// Compute an instant price for a configured product.
// Returns a structured breakdown so the frontend can show the math (like B2Sign).
export function computePrice(input) {
  const { slug, quantity = 1, width, height, materialId, variantId, options = [] } = input;
  const product = getProduct(slug);
  if (!product) {
    return { ok: false, error: 'Unknown product' };
  }

  const qty = clampInt(quantity, 1, 100000);
  const pricing = product.pricing;
  const selectedOptions = Array.isArray(options) ? options : [];

  let perPieceGoods = 0;
  const breakdown = [];
  const dims = {};

  if (pricing.model === 'area') {
    const w = clampNum(width ?? pricing.defaultWidthIn, pricing.minWidthIn, pricing.maxWidthIn);
    const h = clampNum(height ?? pricing.defaultHeightIn, pricing.minHeightIn, pricing.maxHeightIn);
    const rawArea = (w * h) / 144;
    const area = Math.max(rawArea, pricing.minAreaSqFt);
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
  } else if (pricing.model === 'configured') {
    // Multi-axis configuration (canopy tents): one base group sets the starting
    // price, any number of multiplier groups scale it, and additive groups bolt
    // on extras with their own quantities.
    const selections = input.selections && typeof input.selections === 'object' ? input.selections : {};
    const groups = pricing.optionGroups || [];
    const chosen = {};

    // 1. Base — e.g. tent size.
    const baseGroup = groups.find((g) => g.pricing === 'base');
    const baseChoice = pickChoice(baseGroup, selections[baseGroup?.id]);
    let running = baseChoice ? Number(baseChoice.price) || 0 : 0;
    if (baseGroup && baseChoice) {
      chosen[baseGroup.id] = baseChoice.label || baseChoice.id;
      breakdown.push({ label: `${baseGroup.label} — ${baseChoice.label}`, amount: round2(running) });
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

    // 3. Add-ons — e.g. walls, weights, lighting.
    for (const g of groups) {
      if (g.pricing !== 'add') continue;
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

    dims.configuration = chosen;
    // Readable one-liner for order specs / emails, matching how `unit` reports.
    dims.variant = Object.values(chosen).filter(Boolean).join(' • ');
    perPieceGoods = running;
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

  const discount = getQuantityDiscount(qty);
  const unitPrice = round2(perPieceGoods);
  const goodsSubtotal = perPieceGoods * qty;
  const discountAmount = goodsSubtotal * discount;
  const total = goodsSubtotal - discountAmount;

  return {
    ok: true,
    slug,
    productName: product.name,
    quantity: qty,
    dims,
    unitPrice,
    breakdown,
    quantityDiscountPct: Math.round(discount * 100),
    discountAmount: round2(discountAmount),
    subtotal: round2(goodsSubtotal),
    total: round2(total),
    perPieceAfterDiscount: round2(total / qty),
    freeShipping: total >= 99,
    turnaround: product.turnaround
  };
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

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

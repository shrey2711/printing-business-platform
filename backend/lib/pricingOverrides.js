// Runtime pricing overrides, cached in memory.
//
// A dashboard price edit must reach the CHECKOUT path — not just the display —
// or the customer sees one price and is charged another. So the override is
// merged server-side in /api/price AND /api/checkout, both of which re-price
// from this cache. Short TTL + invalidate-on-write so edits take effect fast.

import { supabaseAdmin } from './clients.js';

const TTL_MS = 60 * 1000;
let cache = { at: 0, map: null };

// { slug: pricingBlock } for every product with an override.
export async function getPricingOverrides() {
  if (cache.map && Date.now() - cache.at < TTL_MS) return cache.map;
  if (!supabaseAdmin) return cache.map || {};
  const { data, error } = await supabaseAdmin.from('pricing_overrides').select('slug, pricing');
  if (error) return cache.map || {};
  const map = {};
  for (const row of data || []) map[row.slug] = row.pricing;
  cache = { at: Date.now(), map };
  return map;
}

export async function getPricingOverride(slug) {
  const map = await getPricingOverrides();
  return map[slug] || null;
}

export function invalidatePricingCache() {
  cache = { at: 0, map: cache.map };
}

// Products. Reads the storefront API, which serves the catalogue the pricing
// engine actually uses — never Directus directly from the browser, so a price
// on screen always matches the price checkout computes.

import { getProducts, getProduct } from '../api';
import { cached, invalidate } from './cache';

const KEY = 'product:';

export async function list({ category } = {}) {
  return cached(`${KEY}list:${category || 'all'}`, () => getProducts(category));
}

export async function bySlug(slug) {
  if (!slug) return null;
  return cached(`${KEY}one:${slug}`, () => getProduct(slug));
}

/** Products for the home rails and cross-sells, in the order given. An unknown
 *  slug is skipped rather than rendering a broken card. */
export async function bySlugs(slugs = []) {
  const all = await list();
  const bySlugMap = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlugMap.get(s)).filter(Boolean);
}

export function clear() {
  invalidate(KEY);
}

export default { list, bySlug, bySlugs, clear };

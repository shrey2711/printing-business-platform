// Header, footer and category navigation.
//
// Navigation is structural: a wrong or missing menu is more damaging than
// slightly stale labels, so this holds its result for longer than product data
// and falls back to an empty shape rather than throwing into a render.

import { getCategories } from '../api';
import { cached, invalidate } from './cache';

const KEY = 'nav:';
const TTL = 10 * 60_000;

export async function tree() {
  return cached(`${KEY}tree`, async () => {
    try {
      const { categories = [], navGroups = [] } = (await getCategories()) || {};
      return { categories, navGroups };
    } catch {
      // A failed nav read must not blank the header.
      return { categories: [], navGroups: [] };
    }
  }, { ttl: TTL });
}

export async function categories() {
  return (await tree()).categories;
}

export async function groups() {
  return (await tree()).navGroups;
}

export function clear() {
  invalidate(KEY);
}

export default { tree, categories, groups, clear };

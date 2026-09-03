// Editorial pages: category pages, size guides, solutions, city pages.
//
// These are compiled into the bundle rather than fetched. They are the pages the
// SEO work depends on, and a page whose body arrives over the network is a page
// a crawler may never see. This service exists so consumers have one way in, and
// so the source can change without touching every caller.

import { CATEGORY_PAGES, SUBCATEGORIES } from '../../data/categoryPages';
import { resolveContent } from '../../data/content';

const bySlug = new Map([...CATEGORY_PAGES, ...SUBCATEGORIES].map((p) => [p.slug, p]));

/** A page by slug, with no leading slash. Null when it does not exist — callers
 *  should render a 404 rather than an empty shell. */
export function get(slug) {
  return bySlug.get(String(slug || '').replace(/^\//, '')) || null;
}

export function all() {
  return [...bySlug.values()];
}

export function categoryPages() {
  return CATEGORY_PAGES;
}

export function subcategories() {
  return SUBCATEGORIES;
}

/** Editable copy for a page, resolved against its shipped default. */
export function copy(overrides, key) {
  return resolveContent(overrides, key);
}

export default { get, all, categoryPages, subcategories, copy };

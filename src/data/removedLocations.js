// Location URLs that no longer exist. Pages that cannot carry enough
// city-specific copy to be >=80% unique are removed instead of being left
// as noindex stubs: they 301 to the closest page that does exist, passing
// their links on, and nothing links to them any more.
//
// One definition for the prerenderer (writes no file), the edge middleware
// (301s), the SPA (client-side redirect) and the link lists (omit the link).
// To bring a page back, give it enough copy: it leaves this set on its own
// (state: add LOCAL_FACTS + STATE_OUTDOOR; category page: cityPagePlan clears
// the uniqueness bar).
import { territories, slugify } from './states.js';
import { INDEXED_STATES } from './stateContent.js';
import { SEO_CITIES, LOCAL_CATEGORIES } from './citySeo.js';
import { CITY_DETAIL } from './cityDetail.js';
import { cityPagePlan } from './cityPagePlan.js';
import { CITY_PRODUCT_PAGES } from './cityProductPages.js';

const HUB = LOCAL_CATEGORIES.find((l) => l.slug === 'trade-show-displays');
const planOf = (city, lc) => cityPagePlan(city, lc, CITY_DETAIL[city.slug]);

export const isStateLive = (stateSlug) => INDEXED_STATES.has(stateSlug);
// Crawl budget (2026-10). Two more cuts so a new domain's few crawls land on
// the pages that matter:
//  - In the cities that have product × city pages, the category × city page
//    targets the same search as the product page (/banner-stands/chicago vs
//    /retractable-banner-stands-chicago). The category page goes; it 301s to
//    the product page.
//  - Backdrop and table-cover city pages elsewhere are the thinnest and have
//    the least demand. They go; they 301 to the city hub.
// None of these had a click or an impression in Search Console over 90 days.
const PRODUCT_PAGE_FOR = {
  'trade-show-canopies': 'custom-canopy-tents',
  'banner-stands': 'retractable-banner-stands',
  'trade-show-backdrops': 'step-and-repeat-backdrop',
  'table-covers': 'custom-table-covers'
};
const productPageFor = (catSlug, citySlug) => {
  const base = PRODUCT_PAGE_FOR[catSlug];
  const slug = base && `${base}-${citySlug}`;
  return slug && CITY_PRODUCT_PAGES.some((p) => p.slug === slug) ? `/${slug}` : null;
};
const THIN_CATEGORIES = new Set(['trade-show-backdrops', 'table-covers']);

export const isCategoryCityLive = (catSlug, citySlug) => {
  const city = SEO_CITIES.find((c) => c.slug === citySlug);
  const lc = LOCAL_CATEGORIES.find((l) => l.slug === catSlug);
  if (!(city && lc && city.tier <= 2 && planOf(city, lc).indexable)) return false;
  if (productPageFor(catSlug, citySlug)) return false;
  if (THIN_CATEGORIES.has(catSlug)) return false;
  return true;
};

let cache = null;
// [{ source, destination }] for every removed location URL.
export function removedLocationRedirects() {
  if (cache) return cache;
  const out = [];
  for (const s of territories) {
    const live = isStateLive(s.slug);
    if (!live) out.push({ source: `/locations/${s.slug}`, destination: '/locations' });
    for (const c of s.cities) {
      const seo = SEO_CITIES.find((x) => x.slug === slugify(c) && x.stateSlug === s.slug);
      const dest = seo
        ? (isCategoryCityLive('trade-show-displays', seo.slug) ? `/trade-show-displays/${seo.slug}` : '/trade-show-displays')
        : (live ? `/locations/${s.slug}` : '/locations');
      out.push({ source: `/locations/${s.slug}/${slugify(c)}`, destination: dest });
    }
  }
  for (const lc of LOCAL_CATEGORIES) {
    for (const city of SEO_CITIES) {
      if (isCategoryCityLive(lc.slug, city.slug)) continue;
      const hubLive = isCategoryCityLive(HUB.slug, city.slug);
      const product = productPageFor(lc.slug, city.slug);
      out.push({
        source: `/${lc.slug}/${city.slug}`,
        destination: product || (lc.slug !== HUB.slug && hubLive ? `/${HUB.slug}/${city.slug}` : (lc.slug === HUB.slug ? `/${HUB.slug}` : lc.hub || `/${lc.slug}`))
      });
    }
  }
  cache = out;
  return out;
}
export const removedRedirectFor = (path) => removedLocationRedirects().find((r) => r.source === path) || null;

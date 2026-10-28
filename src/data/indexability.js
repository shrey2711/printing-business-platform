// Single source of truth for which LOCATION URLs are indexable.
//
// Three templates decide robots client-side (CityPage, LocationPage,
// CityCategoryPage) and the prerenderer decides it again for the static HTML
// and the sitemap. Those used to be separate copies of the same rules, so a
// change to one could put a URL in the sitemap that the page itself marks
// "noindex, follow". Everything now asks this module:
//   - the pages and prerender.mjs use the *Indexable / *Robots helpers
//   - the sitemap lists exactly indexableLocationPaths()
// so a sitemap URL can only be one these helpers call indexable.
//
// The rules themselves are unchanged (moved here verbatim):
//   state  /locations/{state}          indexable iff INDEXED_STATES has it
//   legacy /locations/{state}/{city}   indexable iff PRIORITY_CITIES has it
//                                      (empty today; those URLs 301 anyway)
//   city   /{category}/{city}          indexable iff tier <= 2 and the
//                                      cityPagePlan uniqueness gate passes
// A page must also be live (not 301'd by removedLocations.js) to be listed.
import { territories, slugify } from './states.js';
import { INDEXED_STATES } from './stateContent.js';
import { PRIORITY_CITIES } from './cityContent.js';
import { SEO_CITIES, LOCAL_CATEGORIES } from './citySeo.js';
import { CITY_DETAIL } from './cityDetail.js';
import { cityPagePlan } from './cityPagePlan.js';
import { isCategoryCityLive, removedRedirectFor } from './removedLocations.js';

export const NOINDEX_FOLLOW = 'noindex, follow';

export const isStateIndexable = (stateSlug) => INDEXED_STATES.has(stateSlug);
export const isLegacyCityIndexable = (citySlug) => PRIORITY_CITIES.has(citySlug);
// `plan` is optional: callers that already computed cityPagePlan pass it in.
export const isCityCategoryIndexable = (city, cat, plan) => {
  if (!city || !cat) return false;
  const p = plan || cityPagePlan(city, cat, CITY_DETAIL[city.slug]);
  return !!(city.tier <= 2 && p && p.indexable);
};

export const stateRobots = (stateSlug) => (isStateIndexable(stateSlug) ? undefined : NOINDEX_FOLLOW);
export const legacyCityRobots = (citySlug) => (isLegacyCityIndexable(citySlug) ? undefined : NOINDEX_FOLLOW);
export const cityCategoryRobots = (city, cat, plan) => (isCityCategoryIndexable(city, cat, plan) ? undefined : NOINDEX_FOLLOW);

// Every indexable, live location URL, in sitemap order. The sitemap generator
// lists exactly these (scripts/prerender.mjs), and nothing else location-shaped.
export function indexableLocationPaths() {
  const out = [];
  for (const s of territories) {
    const path = `/locations/${s.slug}`;
    if (isStateIndexable(s.slug) && !removedRedirectFor(path)) out.push({ kind: 'state', path, state: s });
  }
  for (const s of territories) {
    for (const c of s.cities) {
      const path = `/locations/${s.slug}/${slugify(c)}`;
      if (isLegacyCityIndexable(slugify(c)) && !removedRedirectFor(path)) out.push({ kind: 'legacy-city', path, state: s });
    }
  }
  for (const lc of LOCAL_CATEGORIES) {
    for (const city of SEO_CITIES) {
      if (isCategoryCityLive(lc.slug, city.slug) && isCityCategoryIndexable(city, lc)) {
        out.push({ kind: 'city-category', path: `/${lc.slug}/${city.slug}`, city, cat: lc });
      }
    }
  }
  return out;
}

// Robots value the page's own template would emit for a location path, or
// null when the path is not a location page. Used by the sitemap check.
export function locationRobotsFor(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'locations' && parts.length === 2) return stateRobots(parts[1]) || '';
  if (parts[0] === 'locations' && parts.length === 3) return legacyCityRobots(parts[2]) || '';
  if (parts.length === 2) {
    const cat = LOCAL_CATEGORIES.find((l) => l.slug === parts[0]);
    const city = SEO_CITIES.find((c) => c.slug === parts[1]);
    if (cat && city) return cityCategoryRobots(city, cat) || '';
  }
  return null;
}

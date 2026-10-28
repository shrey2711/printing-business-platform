// Whether a city's /trade-show-displays/{city} hub is expected to be indexable.
// cityPagePlan() withholds indexing from a page whose copy is mostly the shared
// template (see src/data/cityPagePlan.js), so the city audits that assert
// "indexed, in the sitemap, linked" apply only to hubs that earned it. A gated
// hub is reported, not failed: the fix is more city copy, not a code change.
import { LOCAL_CATEGORIES } from '../../src/data/citySeo.js';
import { CITY_DETAIL } from '../../src/data/cityDetail.js';
import { cityPagePlan } from '../../src/data/cityPagePlan.js';
import { isGonePath } from '../../src/data/goneLocations.js';

const HUB = LOCAL_CATEGORIES.find((l) => l.slug === 'trade-show-displays');
// Hubs removed on 2026-10-28 (src/data/goneLocations.js) answer 410 and are
// not built, so no city audit expects them.
export const hubIndexable = (city) =>
  cityPagePlan(city, HUB, CITY_DETAIL[city.slug]).indexable && !isGonePath(`/${HUB.slug}/${city.slug}`);

// Category pages (/banner-stands/{city} …) that still exist after the removal
// of pages that could not reach the uniqueness bar (src/data/removedLocations.js).
export { isCategoryCityLive as catLive } from '../../src/data/removedLocations.js';

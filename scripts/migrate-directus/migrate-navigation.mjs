// Navigation: the header product menu, built from the same navGroups the API
// serves, so the CMS menu matches the live one on day one.
//
// Groups become parent items with no link; products become children pointing at
// their product page. Parents are created first so children can reference them.

import { navGroups } from '../../backend/data/products.js';
import { requireConfig, indexBy, upsert, newCounters, report, DRY, api, FORCE } from './lib.mjs';

export async function migrateNavigation() {
  const existing = await indexBy('navigation', 'label');
  const c = newCounters();
  let sort = 0;

  for (const group of navGroups) {
    await upsert('navigation', 'label', {
      status: 'published', label: group.name, url: '', location: 'header', sort: sort++
    }, existing, c);

    // Look the parent up again: on a dry run nothing was written, so there is no
    // id to point children at.
    const parent = existing.get(group.name);
    for (const item of group.items || []) {
      const desired = {
        status: 'published', label: item.name, url: `/products/${item.slug}`, location: 'header', sort: sort++
      };
      if (parent?.id) desired.parent = parent.id;
      else if (!DRY) { c.skipped++; continue; }
      await upsert('navigation', 'label', desired, existing, c);
    }
  }
  return report(`navigation (${navGroups.length} groups)`, c);
}

if (process.argv[1] && /migrate-navigation\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'Navigation (dry run)' : 'Navigation');
  process.exit((await migrateNavigation()) ? 0 : 1);
}

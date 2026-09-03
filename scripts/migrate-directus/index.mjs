// Run every migration, in dependency order.
//
//   cd <repo root>
//   DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/migrate-directus --dry-run
//   DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/migrate-directus
//
// Flags:
//   --dry-run              print what would change, write nothing
//   --force                overwrite fields an editor has already filled in
//   --skip-images          leave the file library alone
//   --allow-local-storage  import images even into container-local storage
//   --with-values          copy generated SEO values into the override rows,
//                          which PINS those pages to them
//
// Repeatable by design: a second run creates nothing that already exists and
// fills only blank fields. Nothing is ever deleted — a product dropped from the
// code stays in Directus for a person to archive.

import { requireConfig, DRY, FORCE } from './lib.mjs';
import { migrateCategories } from './migrate-categories.mjs';
import { migrateProducts } from './migrate-products.mjs';
import { migrateNavigation } from './migrate-navigation.mjs';
import { migrateBlog } from './migrate-blog.mjs';
import { migrateSeo } from './migrate-seo.mjs';
import { migrateImages } from './migrate-images.mjs';

requireConfig();

const SKIP_IMAGES = process.argv.includes('--skip-images');

console.log(DRY ? 'Directus migration — DRY RUN, nothing will be written\n' : 'Directus migration\n');
if (FORCE) console.log('--force: fields an editor has already changed WILL be overwritten.\n');

// Categories before products (products link to them); products before images
// (images attach to product records).
const steps = [
  ['Categories', migrateCategories],
  ['Products', migrateProducts],
  ['Navigation', migrateNavigation],
  ['Blog posts', migrateBlog],
  ['SEO overrides', migrateSeo]
];
if (!SKIP_IMAGES) steps.push(['Images', migrateImages]);

let ok = true;
for (const [name, run] of steps) {
  console.log(`\n— ${name}`);
  try {
    if (!(await run())) ok = false;
  } catch (e) {
    ok = false;
    console.error(`✗ ${name} threw: ${e.message}`);
  }
}

console.log(ok
  ? `\n✓ migration complete${DRY ? ' (dry run)' : ''}. Safe to run again: it fills blanks and creates what is missing.`
  : '\n✗ migration finished with failures — see above. Re-running is safe; it will retry what did not land.');
process.exit(ok ? 0 : 1);

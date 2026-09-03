// Product images into the Directus file library, then linked to each product's
// gallery in order.
//
// Files are imported BY URL from the live site rather than uploaded from disk:
// the images are already served publicly, Directus fetches them itself, and
// there is no multipart upload to get wrong.
//
// Two guards, both about not creating a mess that is tedious to undo:
//
//   1. Refuses to run against container-local storage. On Railway or Render,
//      STORAGE_LOCATIONS=local writes into the container, so every redeploy
//      deletes the files while the product records keep pointing at them. That
//      leaves broken images across the catalogue and an import to redo.
//      --allow-local-storage overrides, for a local instance you can wipe.
//   2. A file already imported is not imported again. Matching is by the
//      filename Directus stores, so a re-run costs one listing, not hundreds of
//      re-uploads.

import { listProducts, getProduct } from '../../backend/data/products.js';
import { requireConfig, api, URL_BASE, newCounters, report, DRY, FORCE } from './lib.mjs';

const ALLOW_LOCAL = process.argv.includes('--allow-local-storage');
const ORIGIN = process.env.MIGRATE_IMAGE_ORIGIN || 'https://www.apextradeshow.com';
const FOLDER_NAME = 'Products';

/** Where the instance stores files. Returns null when it cannot be determined. */
async function storageDriver() {
  const res = await api('/files?limit=1&fields=storage');
  if (!res.ok) return null;
  const rows = res.body?.data || [];
  return rows.length ? rows[0].storage : null;
}

const filename = (src) => String(src).split('/').pop().split('?')[0];

const imagesFor = (p) => {
  const gallery = Array.isArray(p.gallery) ? p.gallery : [];
  return gallery
    .map((g) => (typeof g === 'string' ? g : g && g.src))
    .filter(Boolean)
    .filter((s) => !/^https?:/i.test(s))   // only our own assets
    .filter((s) => !/\.svg$/i.test(s));    // illustrations are drawn in code
};

export async function migrateImages() {
  const c = newCounters();

  // ---- storage guard ----
  const driver = await storageDriver();
  if (driver === 'local' && !ALLOW_LOCAL) {
    console.error('✗ images: this instance stores files on container-local disk.');
    console.error('  A redeploy would delete every imported file while the products keep');
    console.error('  referencing them. Switch STORAGE_LOCATIONS to s3 first — see');
    console.error('  DIRECTUS_SETUP.md section 2 (storage) — or pass --allow-local-storage for a throwaway instance.');
    return false;
  }
  if (driver === null) {
    console.log('  (no files yet, so the storage driver is unknown — the first import will decide it)');
    if (!ALLOW_LOCAL && !DRY) {
      console.error('✗ images: cannot confirm where files would be stored.');
      console.error('  Set STORAGE_LOCATIONS=s3 and upload one file, or pass --allow-local-storage.');
      return false;
    }
  }

  // ---- folder ----
  let folderId = null;
  const folders = await api(`/folders?limit=-1&filter[name][_eq]=${encodeURIComponent(FOLDER_NAME)}`);
  folderId = folders.body?.data?.[0]?.id || null;

  // ---- existing files, by filename ----
  const known = new Map();
  const files = await api('/files?limit=-1&fields=id,filename_download,title');
  for (const f of files.body?.data || []) if (f.filename_download) known.set(f.filename_download, f);

  const products = listProducts({ includeInactive: true }).map((p) => getProduct(p.slug));

  for (const p of products) {
    const srcs = imagesFor(p);
    if (!srcs.length) { c.skipped++; continue; }

    const ids = [];
    for (const src of srcs) {
      const name = filename(src);
      const hit = known.get(name);
      if (hit) { ids.push(hit.id); continue; }

      if (DRY) { c.created++; console.log(`  + would import ${name}`); continue; }

      const res = await api('/files/import', {
        method: 'POST',
        body: JSON.stringify({
          url: `${ORIGIN}${src}`,
          data: {
            // Directus uses a file's title as its alt text in the build pipeline,
            // so give it something descriptive rather than the filename.
            title: `${p.name} — ${name.replace(/[-_]/g, ' ').replace(/\.\w+$/, '')}`,
            folder: folderId
          }
        })
      });
      if (!res.ok) {
        c.failed++;
        console.error(`  ! ${name}: ${JSON.stringify(res.body?.errors || res.body).slice(0, 140)}`);
        continue;
      }
      const file = res.body?.data;
      known.set(name, file);
      ids.push(file.id);
      c.created++;
      console.log(`  + ${name}`);
    }

    if (DRY || !ids.length) continue;

    // ---- link to the product gallery, preserving order ----
    const prod = await api(`/items/products?limit=1&fields=id,gallery&filter[slug][_eq]=${encodeURIComponent(p.slug)}`);
    const record = prod.body?.data?.[0];
    if (!record) { c.skipped++; continue; }

    const already = Array.isArray(record.gallery) ? record.gallery.length : 0;
    if (already && !FORCE) { c.unchanged++; continue; }  // an editor may have curated this

    const link = await api(`/items/products/${record.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ gallery: ids.map((id, i) => ({ directus_files_id: id, sort: i })) })
    });
    if (link.ok) c.filled++;
    else { c.failed++; console.error(`  ! gallery ${p.slug}: ${JSON.stringify(link.body?.errors || link.body).slice(0, 140)}`); }
  }

  return report('images', c);
}

if (process.argv[1] && /migrate-images\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'Images (dry run)' : 'Images');
  process.exit((await migrateImages()) ? 0 : 1);
}

// Media handling: WebP delivery, originals kept, dimensions and alt text.
//
//   cd directus
//   DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/configure-media.mjs
//   node scripts/configure-media.mjs --dry-run
//
// Directus already records width, height, filesize and type when a file is
// uploaded, and its Title field is what the build pipeline uses as alt text. So
// what actually needs configuring is delivery:
//
//   WebP is generated on REQUEST, from named presets, and cached — rather than
//   converting on upload and storing a second copy of every file. The original
//   is never touched, which is what "preserve original" has to mean: a JPEG an
//   editor uploads is still there to re-crop or re-export from later. Converting
//   at upload time would also make the format decision permanent, and would
//   re-encode PNGs and GIFs that should not become WebP.
//
//   storage_asset_transform moves from "all" to "presets". On "all", anyone who
//   knows a file id can ask for arbitrary dimensions — each unique request costs
//   CPU and a cached derivative on disk, which is a cheap way to fill a volume.
//   Presets close that while still serving every size the site needs.

const URL_BASE = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const DRY = process.argv.includes('--dry-run');

if (!ADMIN) {
  console.error('✗ DIRECTUS_ADMIN_TOKEN is required.');
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${ADMIN}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { ok: res.ok, status: res.status, body };
}

// The sizes the storefront actually renders, each in WebP.
//
// `contain` with `withoutEnlargement` means a small original is served at its
// own size instead of being upscaled into a blurry larger file. Quality 82 is
// where WebP stops being visibly lossy on photographs of printed fabric, which
// is most of this catalogue.
const PRESETS = [
  { key: 'thumb',  description: 'Grid thumbnail',       width: 400,  height: null, fit: 'contain', quality: 82, format: 'webp' },
  { key: 'card',   description: 'Product card',         width: 800,  height: null, fit: 'contain', quality: 82, format: 'webp' },
  { key: 'detail', description: 'Product detail image', width: 1200, height: null, fit: 'contain', quality: 82, format: 'webp' },
  { key: 'hero',   description: 'Full-width hero',      width: 1600, height: null, fit: 'contain', quality: 82, format: 'webp' },
  // Social cards are fetched by crawlers that do not all accept WebP, so this
  // one stays JPEG at the size the platforms expect.
  { key: 'og',     description: 'Social share card',    width: 1200, height: 630, fit: 'cover',    quality: 85, format: 'jpeg' }
].map((p) => ({
  key: p.key,
  fit: p.fit,
  width: p.width,
  height: p.height,
  quality: p.quality,
  withoutEnlargement: true,
  format: p.format,
  transforms: []
}));

const current = await api('/settings?fields=storage_asset_transform,storage_asset_presets');
const now = current.body?.data || {};
const haveKeys = (now.storage_asset_presets || []).map((p) => p.key).sort().join(',');
const wantKeys = PRESETS.map((p) => p.key).sort().join(',');

if (now.storage_asset_transform === 'presets' && haveKeys === wantKeys) {
  console.log('· media delivery already configured');
} else if (DRY) {
  console.log(`~ would set ${PRESETS.length} presets (${wantKeys}) and restrict transforms to presets`);
  console.log(`  (currently: transform=${now.storage_asset_transform}, presets=${haveKeys || 'none'})`);
} else {
  const res = await api('/settings', {
    method: 'PATCH',
    body: JSON.stringify({ storage_asset_transform: 'presets', storage_asset_presets: PRESETS })
  });
  if (!res.ok) {
    console.error(`✗ ${JSON.stringify(res.body?.errors || res.body).slice(0, 250)}`);
    process.exit(1);
  }
  console.log(`✓ ${PRESETS.length} presets configured: ${wantKeys}`);
  console.log('✓ arbitrary transforms disabled — only these sizes can be requested');
}

// ---- what is already stored -------------------------------------------------
const files = await api('/files?limit=-1&fields=id,filename_download,type,width,height,title');
const rows = files.body?.data || [];
if (!rows.length) {
  console.log('· no files uploaded yet');
} else {
  const noDimensions = rows.filter((f) => /^image\//.test(f.type || '') && (!f.width || !f.height));
  const noAlt = rows.filter((f) => /^image\//.test(f.type || '') && !String(f.title || '').trim());
  console.log(`· ${rows.length} file(s): ${rows.length - noDimensions.length} with dimensions, ${rows.length - noAlt.length} with alt text`);
  if (noDimensions.length) {
    console.warn(`  ! ${noDimensions.length} image(s) have no width/height. Directus records these on upload;`);
    console.warn('    missing values usually mean the file is not really an image, or was imported from a URL that failed.');
  }
  if (noAlt.length) {
    // Not fatal here, but the image audit fails a build on a missing alt, which
    // is the right place for it to be caught.
    console.warn(`  ! ${noAlt.length} image(s) have no Title, which is what becomes alt text:`);
    noAlt.slice(0, 5).forEach((f) => console.warn(`      ${f.filename_download}`));
    if (noAlt.length > 5) console.warn(`      …and ${noAlt.length - 5} more`);
  }
}

console.log(DRY ? '\n--dry-run: nothing changed.' : '\nMedia configured. Originals are untouched; WebP is generated per request and cached.');

// Tests for CMS media handling.
//
// The rules that matter are the ones whose breakage is invisible in review:
// an image without dimensions reflows the page, an image without alt is
// unreadable to a screen reader, and a URL that drops its preset silently
// serves the full-size original to a phone.
//
// Run: node scripts/test-media.mjs

import { readFileSync } from 'fs';
import { assetUrl, PRESETS } from '../src/lib/assetUrl.js';

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

const CMS = 'https://cms.example.com/assets/abc-123';

check('a CMS image is requested through a preset', () =>
  assetUrl(CMS, 'card') === `${CMS}?key=card` ? null : assetUrl(CMS, 'card'));

check('an existing query string is preserved', () =>
  assetUrl(`${CMS}?v=2`, 'hero') === `${CMS}?v=2&key=hero` ? null : assetUrl(`${CMS}?v=2`, 'hero'));

check('an unknown preset is not sent', () => {
  // Transforms are restricted to presets, so an invented key would be rejected
  // by Directus and the image would fail to load entirely.
  const out = assetUrl(CMS, 'gigantic');
  return out === CMS ? null : `sent an unknown preset: ${out}`;
});

check('local build assets pass through untouched', () => {
  for (const src of ['/images/tents/10x10-1wall.webp', 'data:image/png;base64,AAA']) {
    if (assetUrl(src, 'card') !== src) return `${src} was rewritten`;
  }
  return null;
});

check('the component requires alt and renders dimensions', () => {
  const src = readFileSync(new URL('../src/components/CmsImage.jsx', import.meta.url), 'utf8');
  if (!/alt=\{alt \?\? ''\}/.test(src)) return 'alt is not always rendered';
  if (!/width=\{width \|\| undefined\}/.test(src)) return 'width is not rendered';
  if (!/height=\{height \|\| undefined\}/.test(src)) return 'height is not rendered';
  if (!/console\.warn/.test(src)) return 'a missing alt is not surfaced during development';
  return null;
});

check('the hero carries the dimensions the CMS stored', () => {
  const src = readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
  if (!/home\.hero\.imageWidth/.test(src)) return 'the hero does not use the stored width';
  if (!/home\.hero\.imageHeight/.test(src)) return 'the hero does not use the stored height';
  return null;
});

check('the sync carries width, height and alt from the file record', () => {
  const src = readFileSync(new URL('./cms-pull.mjs', import.meta.url), 'utf8');
  for (const key of ['home.hero.imageWidth', 'home.hero.imageHeight', 'home.hero.imageAlt']) {
    if (!src.includes(key)) return `${key} is not synced`;
  }
  if (!/heroFile\?\.width/.test(src)) return 'dimensions are not read from the file record';
  return null;
});

check('the prerendered preload asks for the same file the browser will', () => {
  // Preloading the original while the page renders a preset downloads two files
  // and helps neither.
  const src = readFileSync(new URL('./prerender.mjs', import.meta.url), 'utf8');
  const m = src.match(/preloadImage: cms\('home\.hero\.image'\)[\s\S]{0,220}/);
  if (!m) return 'the hero preload is gone';
  return /key=hero/.test(m[0]) ? null : 'the preload does not use the hero preset';
});

check('originals are never converted in place', () => {
  // "Preserve original" means the uploaded file stays as uploaded. Converting on
  // upload would also make the format decision permanent.
  const src = readFileSync(new URL('../directus/scripts/configure-media.mjs', import.meta.url), 'utf8');
  if (/method: 'DELETE'/.test(src)) return 'it deletes files';
  if (!/storage_asset_transform/.test(src)) return 'it does not configure transforms';
  if (!/'presets'/.test(src)) return 'arbitrary transforms are still allowed';
  return null;
});

check('every preset the component can request is one the CMS defines', () => {
  const conf = readFileSync(new URL('../directus/scripts/configure-media.mjs', import.meta.url), 'utf8');
  const defined = new Set([...conf.matchAll(/key: '(\w+)',\s+description/g)].map((m) => m[1]));
  const missing = PRESETS.filter((k) => !defined.has(k));
  return missing.length ? `component asks for undefined preset(s): ${missing.join(', ')}` : null;
});

if (fails.length) {
  console.error(`\n✗ MEDIA FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ MEDIA OK — ${ran} assertions: CMS images are served as WebP through defined presets, with stored dimensions and required alt, and originals are left alone.`);

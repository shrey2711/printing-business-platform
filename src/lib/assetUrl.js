// Build the URL for a CMS-hosted image at a given size.
//
// Kept out of the component so it can be tested directly, and so the prerenderer
// can build the same URL it will preload.
//
// Directus serves a file at /assets/<id> and renders a derivative when a preset
// key is supplied. Only these presets exist: transforms are restricted to them,
// so an unrecognised key would be refused and the image would not load at all.
// Passing an unknown one therefore falls back to the plain asset rather than
// producing a broken request.

export const PRESETS = ['thumb', 'card', 'detail', 'hero', 'og'];

/** True for assets built into the site rather than served by the CMS. */
export const isLocalAsset = (src) =>
  typeof src === 'string' && (src.startsWith('/images/') || src.startsWith('data:'));

export function assetUrl(src, preset) {
  if (!src) return '';
  if (isLocalAsset(src)) return src;
  if (!preset || !PRESETS.includes(preset)) return src;
  return `${src}${src.includes('?') ? '&' : '?'}key=${preset}`;
}

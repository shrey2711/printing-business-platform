import { assetUrl, isLocalAsset } from '../lib/assetUrl';

// An <img> for images that come from the CMS.
//
// Three things this exists to get right, because each one is easy to lose and
// expensive to notice later:
//
//   WebP without losing the original. Directus renders a WebP from a named
//   preset on request and caches it; the uploaded file is untouched. So this
//   points at a preset rather than at a converted copy, and there is no second
//   file to keep in step.
//
//   Dimensions, always. An image without width and height reflows the page when
//   it loads. Directus records both at upload, so they travel with the URL and
//   are rendered as attributes — the browser reserves the space before the
//   bytes arrive.
//
//   Alt text, deliberately. `alt` is required. A decorative image passes
//   alt="" explicitly, which tells a screen reader to skip it; leaving it off
//   entirely makes the reader announce the filename, and fails the image audit.

export default function CmsImage({
  src,
  alt,
  width,
  height,
  preset = 'card',
  sizes,
  className,
  loading = 'lazy',
  fetchpriority,
  decoding = 'async',
  ...rest
}) {
  if (!src) return null;

  // Missing alt is a mistake worth surfacing while developing rather than
  // shipping an unlabelled image. Rendering still proceeds with an empty alt,
  // since a broken page helps nobody.
  if (alt === undefined && import.meta.env?.DEV) {
    console.warn(`CmsImage: no alt for ${src}. Pass alt="" only if the image is decorative.`);
  }

  const isCms = !isLocalAsset(src);

  // Serve a smaller file to smaller screens. Only for CMS images: local assets
  // have no transform endpoint behind them.
  const srcSet = isCms
    ? [
        `${assetUrl(src, 'thumb')} 400w`,
        `${assetUrl(src, 'card')} 800w`,
        `${assetUrl(src, 'detail')} 1200w`,
        `${assetUrl(src, 'hero')} 1600w`
      ].join(', ')
    : undefined;

  return (
    <img
      src={assetUrl(src, preset)}
      srcSet={srcSet}
      sizes={srcSet ? sizes || '(max-width: 700px) 100vw, 800px' : undefined}
      alt={alt ?? ''}
      width={width || undefined}
      height={height || undefined}
      className={className}
      loading={loading}
      fetchpriority={fetchpriority}
      decoding={decoding}
      {...rest}
    />
  );
}

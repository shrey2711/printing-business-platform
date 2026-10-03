// A complete Apex-branded booth, composed from Apex product renders by
// scripts/gen-booth-scenes.mjs (not a photograph of a real event — alt text
// says so). AVIF with a WebP fallback, two widths each.
// Intrinsic size of the 1600px file, per scene (the indoor scene is cropped).
const DIMENSIONS = { 'booth-stage': [1600, 930], 'booth-indoor': [1600, 969], 'booth-outdoor': [1600, 1000] };

export const BOOTH_SCENES = {
  'booth-stage': 'A complete Apex-branded expo booth on a dark stage: red step and repeat backdrop, two retractable banner stands and a fitted table cover (product renders)',
  'booth-indoor': 'A complete Apex-branded expo booth set: red step and repeat backdrop, two retractable banner stands and a fitted table cover (product renders)',
  'booth-outdoor': 'A complete Apex-branded outdoor booth: 10×10 canopy tent with three printed walls and a matching stretch table cover (product renders)'
};

export default function BoothScene({ scene = 'booth-indoor', sizes = '100vw', eager = false, className = '' }) {
  const base = `/images/booth/${scene}`;
  return (
    <picture className={`booth-scene ${className}`.trim()}>
      <source type="image/avif" srcSet={`${base}-960.avif 960w, ${base}-1600.avif 1600w`} sizes={sizes} />
      <img
        src={`${base}-1600.webp`}
        srcSet={`${base}-960.webp 960w, ${base}-1600.webp 1600w`}
        sizes={sizes}
        alt={BOOTH_SCENES[scene]}
        width={DIMENSIONS[scene][0]}
        height={DIMENSIONS[scene][1]}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
      />
    </picture>
  );
}

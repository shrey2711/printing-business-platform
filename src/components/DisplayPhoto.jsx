import { useState, useEffect, lazy, Suspense } from 'react';

// The drawn fallback only renders when the photo fails to load, so it is
// fetched on that path instead of riding in every page's first load.
const ProductArt = lazy(() => import('./ProductArt'));

// Real photo for banner stands / backdrops / tabletop displays. Files live in
// public/images/displays/<slug>.webp. Falls back to the ProductArt illustration
// if the photo is missing, so the site never shows a broken image.
export default function DisplayPhoto({ slug, label }) {
  const src = `/images/displays/${slug}.webp`;
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (broken) return <Suspense fallback={null}><ProductArt slug={slug} /></Suspense>;
  return (
    <img
      className="display-photo"
      src={src}
      alt={label || slug}
      width="1000"
      height="1200"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

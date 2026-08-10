import { useState, useEffect } from 'react';
import ProductArt from './ProductArt';

// Real photo for banner stands / backdrops / tabletop displays. Files live in
// public/images/displays/<slug>.webp. Falls back to the ProductArt illustration
// if the photo is missing, so the site never shows a broken image.
export default function DisplayPhoto({ slug, label }) {
  const src = `/images/displays/${slug}.webp`;
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (broken) return <ProductArt slug={slug} />;
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

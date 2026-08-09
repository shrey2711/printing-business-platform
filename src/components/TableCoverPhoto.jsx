import { useState, useEffect } from 'react';
import ProductArt from './ProductArt';

// Table-cover product photo, chosen by fabric style. Files live in
// public/images/table-covers/. Falls back to the generic ProductArt drawing if
// the image is missing, so the site never shows a broken image before the
// photos are uploaded. See public/images/tents/IMAGE_MANIFEST.md for filenames.
//   pleated.webp  → loose draped throw (rounded corners)
//   stretch.webp  → fitted stretch cover (tight corners)
export default function TableCoverPhoto({ style, label }) {
  const key = String(style || '').includes('stretch') ? 'stretch' : 'pleated';
  const src = `/images/table-covers/${key}.webp`;
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (broken) return <ProductArt slug="table-covers" />;

  return (
    <img
      className="tent-photo"
      src={src}
      alt={label || `Custom printed ${key} table cover`}
      width="1200"
      height="900"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

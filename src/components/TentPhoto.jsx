import { useState, useEffect } from 'react';
import CanopyPreview from './CanopyPreview';

// Real product photo, chosen by size + wall count. Files live in
// public/images/tents/<size>-<walls>wall.jpg (e.g. 10x10-2wall.jpg).
// Falls back to the SVG canopy drawing if the image is missing, so the site
// never shows a broken image before the photos are uploaded.
export default function TentPhoto({ size, walls = 1, label }) {
  const n = Math.min(3, Math.max(1, Number(walls) || 1)); // no 0-wall photo → show 1-wall
  const src = `/images/tents/${size}-${n}wall.webp`;
  const [broken, setBroken] = useState(false);

  // Retry when the src changes (size/wall switch in the configurator).
  useEffect(() => setBroken(false), [src]);

  if (broken || !size) {
    return <CanopyPreview size={size} print="top" walls={Number(walls) || 0} label={label} />;
  }
  // Descriptive, keyword-relevant ALT (image SEO) — falls back to a specific
  // default, not a generic "tent image".
  const wallText = n > 1 ? `${n} printed walls` : '1 printed wall';
  const alt = label
    ? `${size} custom printed canopy tent — ${label}`
    : `${size} custom printed canopy tent with ${wallText}`;
  return (
    <img
      className="tent-photo"
      src={src}
      alt={alt}
      width="1200"
      height="900"
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

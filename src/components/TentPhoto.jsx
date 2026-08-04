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
  return (
    <img
      className="tent-photo"
      src={src}
      alt={label || `${size} canopy tent, ${n} wall${n > 1 ? 's' : ''}`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

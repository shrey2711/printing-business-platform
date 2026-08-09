import { useState, useEffect } from 'react';
import CanopyPreview from './CanopyPreview';

// Real product photo, chosen by size + the ACTUAL wall configuration.
//
// Files live in public/images/tents/. The component tries, in order:
//   1. a config-specific photo   <size>-<config>.webp   (matches the exact setup)
//   2. a wall-count photo        <size>-<n>wall.webp     (older, by count only)
//   3. the SVG canopy drawing    (never a broken image)
// so adding the config photos upgrades the preview without breaking anything
// before they exist. See public/images/tents/IMAGE_MANIFEST.md for filenames.
//
// Config keys map to the six canonical setups:
//   full3  = full setup (3 full walls)
//   back   = 1 full wall (back)         [also used for 2 full walls]
//   half2  = 2 half walls (sides)
//   half1  = 1 half wall (front or side)
//   none   = canopy only (no walls)
function configKey(fullWalls, halfWalls) {
  const f = Number(fullWalls) || 0;
  const h = Number(halfWalls) || 0;
  if (f >= 3) return 'full3';
  if (f >= 1) return 'back';
  if (h >= 2) return 'half2';
  if (h >= 1) return 'half1';
  return 'none';
}

export default function TentPhoto({ size, walls = 1, fullWalls, halfWalls, label }) {
  // Total wall count is still used for the count-based fallback + alt text.
  const total =
    fullWalls != null || halfWalls != null
      ? (Number(fullWalls) || 0) + (Number(halfWalls) || 0)
      : Number(walls) || 0;
  const n = Math.min(3, Math.max(1, total || 1)); // no 0-wall count photo → show 1-wall

  // Build the ordered candidate list of image URLs to try.
  const candidates = [];
  if (size && (fullWalls != null || halfWalls != null)) {
    candidates.push(`/images/tents/${size}-${configKey(fullWalls, halfWalls)}.webp`);
  }
  if (size) candidates.push(`/images/tents/${size}-${n}wall.webp`);

  const [idx, setIdx] = useState(0);
  // Reset to the best candidate whenever the configuration/size changes.
  const key = candidates.join('|');
  useEffect(() => setIdx(0), [key]);

  if (!size || idx >= candidates.length) {
    return <CanopyPreview size={size} print="top" walls={total} label={label} />;
  }

  // Descriptive, keyword-relevant ALT (image SEO).
  const wallText = total === 0 ? 'no walls' : total > 1 ? `${total} printed walls` : '1 printed wall';
  const alt = label
    ? `${size} custom printed canopy tent — ${label}`
    : `${size} custom printed canopy tent with ${wallText}`;

  return (
    <img
      className="tent-photo"
      src={candidates[idx]}
      alt={alt}
      width="1200"
      height="900"
      loading="lazy"
      decoding="async"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

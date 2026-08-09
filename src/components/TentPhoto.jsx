import { useState, useEffect } from 'react';
import CanopyPreview from './CanopyPreview';

// Real product photo, chosen by size + the ACTUAL wall configuration.
//
// Files live in public/images/tents/. For a given size the component tries, in
// order, until one loads:
//   1. the exact wall-combo photo   <size>-<combo>.webp
//   2. the nearest available combo  (graceful fallback)
//   3. a wall-count photo           <size>-<n>wall.webp
//   4. the SVG canopy drawing       (never a broken image)
// so adding more combo photos upgrades the preview without breaking anything.
// See public/images/tents/IMAGE_MANIFEST.md for the filenames.
//
// Combo keys (full walls, half walls; combined <= 3):
//   full3 (3,0)  full2 (2,0)  back (1,0)
//   half3 (0,3)  half2 (0,2)  half1 (0,1)  none (0,0)
//   f1h1 (1,1)   f1h2 (1,2)   f2h1 (2,1)
const clampWall = (n) => Math.min(3, Math.max(0, Number(n) || 0));

function comboKeys(full, half) {
  const f = clampWall(full);
  const h = clampWall(half);
  const exact = {
    '3,0': 'full3', '2,0': 'full2', '1,0': 'back',
    '0,3': 'half3', '0,2': 'half2', '0,1': 'half1', '0,0': 'none',
    '1,1': 'f1h1', '1,2': 'f1h2', '2,1': 'f2h1'
  }[`${f},${h}`];
  // Nearest of the always-present base set, used until the exact combo photo
  // is uploaded.
  const fallback = f >= 2 ? 'full3' : f === 1 ? 'back' : h >= 2 ? 'half2' : h === 1 ? 'half1' : 'none';
  return [...new Set([exact, fallback].filter(Boolean))];
}

export default function TentPhoto({ size, walls = 1, fullWalls, halfWalls, label }) {
  const configMode = fullWalls != null || halfWalls != null;
  const total = configMode ? clampWall(fullWalls) + clampWall(halfWalls) : Number(walls) || 0;
  const n = Math.min(3, Math.max(1, total || 1)); // no 0-wall count photo → show 1-wall

  const candidates = [];
  if (size && configMode) {
    for (const k of comboKeys(fullWalls, halfWalls)) candidates.push(`/images/tents/${size}-${k}.webp`);
  }
  if (size) candidates.push(`/images/tents/${size}-${n}wall.webp`);

  const [idx, setIdx] = useState(0);
  const key = candidates.join('|');
  useEffect(() => setIdx(0), [key]);

  if (!size || idx >= candidates.length) {
    return <CanopyPreview size={size} print="top" walls={total} label={label} />;
  }

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

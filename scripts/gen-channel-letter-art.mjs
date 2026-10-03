// Renders the channel-letter product illustrations (one per illumination type)
// to public/images/channel-letters/. These are drawn scenes, not photographs —
// the product data labels them as illustrations in their alt text. Replace them
// with photos of real installs when there are some.
//
//   node scripts/gen-channel-letter-art.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'channel-letters');
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 900;
const WORD = 'STUDIO';
const TEXT = `x="600" y="478" text-anchor="middle" font-family="Liberation Sans, Arial, sans-serif" font-weight="700" font-size="220" letter-spacing="14"`;

// Extruded returns: the same word stacked a few pixels down-right reads as the
// aluminum sides of each letter.
const returns = (fill) =>
  Array.from({ length: 7 }, (_, i) => `<text ${TEXT} dx="${(i + 1) * 1.6}" dy="${(i + 1) * 1.6}" fill="${fill}">${WORD}</text>`).join('');

function scene(variant) {
  const night = variant !== 'non-lit';
  const halo = variant === 'halo' || variant === 'both';
  const faceLit = variant === 'front' || variant === 'both';
  const face = { front: '#ffffff', halo: '#151d2c', both: '#fff6e2', 'non-lit': '#c8102e' }[variant];
  const returnFill = { front: '#0a0f1a', halo: '#0a0f1a', both: '#0a0f1a', 'non-lit': '#6e0718' }[variant];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${night ? '#0a1020' : '#eef1f5'}"/>
      <stop offset="1" stop-color="${night ? '#1a253b' : '#d9dee7'}"/>
    </linearGradient>
    <linearGradient id="fascia" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${night ? '#202c43' : '#cfd5de'}"/>
      <stop offset="1" stop-color="${night ? '#18223a' : '#c2c9d4'}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${night ? '#3b3122' : '#9fabbd'}"/>
      <stop offset="1" stop-color="${night ? '#151b29' : '#7d8aa0'}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="wide" x="-30%" y="-90%" width="160%" height="280%"><feGaussianBlur stdDeviation="36"/></filter>
    <filter id="shadow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <!-- fascia panel the letters are mounted on -->
  <rect x="0" y="200" width="${W}" height="380" fill="url(#fascia)"/>
  ${[300, 400, 500].map((y) => `<rect x="0" y="${y}" width="${W}" height="2" fill="${night ? '#0f1729' : '#b7bfcb'}" opacity="0.6"/>`).join('')}
  <rect x="0" y="574" width="${W}" height="10" fill="${night ? '#0b1120' : '#a9b2c0'}"/>
  <!-- storefront glazing below -->
  <rect x="0" y="584" width="${W}" height="316" fill="url(#glass)"/>
  ${[240, 480, 720, 960].map((x) => `<rect x="${x}" y="584" width="14" height="316" fill="${night ? '#0b1120' : '#5f6b80'}"/>`).join('')}
  <polygon points="80,600 200,600 60,900 0,900 0,760" fill="#ffffff" opacity="${night ? 0.04 : 0.18}"/>
  <polygon points="620,600 700,600 560,900 470,900" fill="#ffffff" opacity="${night ? 0.03 : 0.14}"/>
  ${variant === 'front' ? `<rect x="150" y="372" width="900" height="44" rx="6" fill="#2a3650"/><rect x="150" y="372" width="900" height="6" rx="3" fill="#3a4866"/>` : ''}
  ${halo ? `<text ${TEXT} fill="#ffc35a" filter="url(#wide)" opacity="${variant === 'both' ? 1 : 0.75}">${WORD}</text><text ${TEXT} fill="#ffe2a8" filter="url(#soft)" opacity="0.95">${WORD}</text>` : ''}
  ${variant === 'non-lit' ? `<text ${TEXT} dx="22" dy="26" fill="#1b2433" filter="url(#shadow)" opacity="0.35">${WORD}</text>` : ''}
  ${returns(returnFill)}
  ${faceLit ? `<text ${TEXT} fill="#ffffff" filter="url(#wide)" opacity="${halo ? 0.25 : 0.55}">${WORD}</text>` : ''}
  <text ${TEXT} fill="${face}"${variant === 'halo' ? ' stroke="#3a4a66" stroke-width="2"' : ''}>${WORD}</text>
  ${faceLit ? `<text ${TEXT} fill="#ffffff" filter="url(#soft)" opacity="0.35">${WORD}</text>` : ''}
</svg>`;
}

const FILES = {
  front: 'front-lit-channel-letters.webp',
  halo: 'halo-lit-channel-letters.webp',
  both: 'front-and-back-lit-channel-letters.webp',
  'non-lit': 'non-illuminated-channel-letters.webp'
};

for (const [variant, file] of Object.entries(FILES)) {
  await sharp(Buffer.from(scene(variant))).webp({ quality: 84 }).toFile(join(OUT, file));
  console.log('wrote', file);
}

// Renders the channel-letter product illustrations to
// public/images/channel-letters/. Four views per illumination type:
//   <slug>.webp                 storefront at night (daylight for non-lit) — card + gallery hero
//   <slug>-single-letter.webp   one letter close up, showing face, returns and light
//   <slug>-daytime.webp         the same storefront by day (non-lit: a lobby wall)
//   <slug>-cutaway.webp         labelled side section: how the letter is built
// These are drawn illustrations, not photographs — the product data says so in
// every alt text. Replace them with photos of real installs when there are some.
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
const FONT = 'font-family="Liberation Sans, Arial, sans-serif"';
const WORD = 'STUDIO';
const TEXT = `x="600" y="478" text-anchor="middle" ${FONT} font-weight="700" font-size="220" letter-spacing="14"`;

const FACE = { front: '#ffffff', halo: '#151d2c', both: '#fff6e2', 'non-lit': '#c8102e' };
const FACE_DAY = { front: '#f3f4f6', halo: '#151d2c', both: '#f4efe4', 'non-lit': '#c8102e' };
const RETURN = { front: '#0a0f1a', halo: '#0a0f1a', both: '#0a0f1a', 'non-lit': '#6e0718' };

const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="wide" x="-30%" y="-90%" width="160%" height="280%"><feGaussianBlur stdDeviation="36"/></filter>
    <filter id="shadow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="huge" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="48"/></filter>
    ${defs}
  </defs>
  ${body}
</svg>`;

// Extruded returns: the same glyphs stacked a few pixels down-right read as the
// aluminum sides of each letter.
const extrude = (attrs, text, fill, steps = 7, dx = 1.6, dy = 1.6) =>
  Array.from({ length: steps }, (_, i) => `<text ${attrs} dx="${(i + 1) * dx}" dy="${(i + 1) * dy}" fill="${fill}">${text}</text>`).join('');

// ---- 1 + 3. Storefront: night (lit types) or day ---------------------------
function storefront(variant, { day = false } = {}) {
  const night = variant !== 'non-lit' && !day;
  const halo = night && (variant === 'halo' || variant === 'both');
  const faceLit = night && (variant === 'front' || variant === 'both');
  const face = night ? FACE[variant] : FACE_DAY[variant];
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect x="0" y="200" width="${W}" height="380" fill="url(#fascia)"/>
  ${[300, 400, 500].map((y) => `<rect x="0" y="${y}" width="${W}" height="2" fill="${night ? '#0f1729' : '#b7bfcb'}" opacity="0.6"/>`).join('')}
  <rect x="0" y="574" width="${W}" height="10" fill="${night ? '#0b1120' : '#a9b2c0'}"/>
  <rect x="0" y="584" width="${W}" height="316" fill="url(#glass)"/>
  ${[240, 480, 720, 960].map((x) => `<rect x="${x}" y="584" width="14" height="316" fill="${night ? '#0b1120' : '#5f6b80'}"/>`).join('')}
  <polygon points="80,600 200,600 60,900 0,900 0,760" fill="#ffffff" opacity="${night ? 0.04 : 0.18}"/>
  <polygon points="620,600 700,600 560,900 470,900" fill="#ffffff" opacity="${night ? 0.03 : 0.14}"/>
  ${variant === 'front' ? `<rect x="150" y="372" width="900" height="44" rx="6" fill="#2a3650"/><rect x="150" y="372" width="900" height="6" rx="3" fill="#3a4866"/>` : ''}
  ${halo ? `<text ${TEXT} fill="#ffc35a" filter="url(#wide)" opacity="${variant === 'both' ? 1 : 0.75}">${WORD}</text><text ${TEXT} fill="#ffe2a8" filter="url(#soft)" opacity="0.95">${WORD}</text>` : ''}
  ${!night ? `<text ${TEXT} dx="22" dy="26" fill="#1b2433" filter="url(#shadow)" opacity="0.35">${WORD}</text>` : ''}
  ${extrude(TEXT, WORD, RETURN[variant])}
  ${faceLit ? `<text ${TEXT} fill="#ffffff" filter="url(#wide)" opacity="${halo ? 0.25 : 0.55}">${WORD}</text>` : ''}
  <text ${TEXT} fill="${face}"${variant === 'halo' ? ` stroke="${night ? '#3a4a66' : '#2b3850'}" stroke-width="2"` : ''}${!night && variant !== 'halo' && variant !== 'non-lit' ? ' stroke="#9aa3b2" stroke-width="2"' : ''}>${WORD}</text>
  ${faceLit ? `<text ${TEXT} fill="#ffffff" filter="url(#soft)" opacity="0.35">${WORD}</text>` : ''}`, `
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
    </linearGradient>`);
}

// ---- 3 (non-lit). Lobby wall with standoff-mounted brushed letters ----------
function lobby() {
  const T = `x="600" y="430" text-anchor="middle" ${FONT} font-weight="700" font-size="170" letter-spacing="12"`;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 100 - 2}" y="0" width="2" height="640" fill="#d7d2c8" opacity="0.6"/>`).join('')}
  <rect x="0" y="640" width="${W}" height="260" fill="#b9a58a"/>
  <rect x="0" y="640" width="${W}" height="8" fill="#a48f73"/>
  <!-- reception desk -->
  <rect x="300" y="560" width="600" height="250" rx="6" fill="#3a3530"/>
  <rect x="300" y="560" width="600" height="18" rx="4" fill="#efeae2"/>
  <rect x="330" y="600" width="540" height="2" fill="#4a443e"/>
  <!-- ceiling wash -->
  ${[250, 600, 950].map((x) => `<ellipse cx="${x}" cy="0" rx="150" ry="260" fill="#ffffff" opacity="0.22" filter="url(#wide)"/>`).join('')}
  <text ${T} dx="26" dy="30" fill="#2a2620" filter="url(#shadow)" opacity="0.3">${WORD}</text>
  ${extrude(T, WORD, '#6b7380', 6, 1.4, 1.4)}
  <text ${T} fill="url(#brushed)">${WORD}</text>`, `
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f1ec"/><stop offset="1" stop-color="#e6e1d8"/>
    </linearGradient>
    <linearGradient id="brushed" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9edf2"/><stop offset="0.45" stop-color="#b7c0cc"/>
      <stop offset="0.55" stop-color="#d6dce4"/><stop offset="1" stop-color="#9aa4b2"/>
    </linearGradient>`);
}

// ---- 2. One letter, close up ------------------------------------------------
function singleLetter(variant) {
  const lit = variant !== 'non-lit';
  const halo = variant === 'halo' || variant === 'both';
  const faceLit = variant === 'front' || variant === 'both';
  const T = `x="610" y="760" text-anchor="middle" ${FONT} font-weight="700" font-size="760"`;
  const wall = lit ? ['#1d283d', '#121a2b'] : ['#e9ecf1', '#d3d9e2'];
  const trim = variant === 'front' || variant === 'both' ? ' stroke="#1b2333" stroke-width="7" stroke-linejoin="round"' : '';
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${i * 120 + 60}" width="${W}" height="2" fill="${lit ? '#0f1729' : '#c4cad4'}" opacity="0.55"/>`).join('')}
  ${halo ? `<text ${T} fill="#ffb84a" filter="url(#huge)" opacity="0.9">A</text><text ${T} fill="#ffe0a3" filter="url(#soft)" opacity="0.9">A</text>` : ''}
  ${!lit ? `<text ${T} dx="34" dy="40" fill="#1b2433" filter="url(#shadow)" opacity="0.32">A</text>` : ''}
  ${extrude(T, 'A', RETURN[variant], 30, 1.25, 0.9)}
  ${extrude(T, 'A', lit ? '#232d40' : '#9b1027', 3, 0.5, 0.35)}
  ${faceLit ? `<text ${T} fill="#ffffff" filter="url(#wide)" opacity="${halo ? 0.35 : 0.6}">A</text>` : ''}
  <text ${T} fill="${variant === 'non-lit' ? 'url(#paint)' : variant === 'halo' ? 'url(#metal)' : FACE[variant]}"${trim}>A</text>
  ${faceLit ? `<text ${T} fill="url(#hot)" opacity="0.65">A</text>` : ''}`, `
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${wall[0]}"/><stop offset="1" stop-color="${wall[1]}"/>
    </linearGradient>
    <radialGradient id="hot" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="${variant === 'both' ? '#f3dcae' : '#dfe6f2'}" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a3448"/><stop offset="0.5" stop-color="#151d2c"/><stop offset="1" stop-color="#0d1320"/>
    </linearGradient>
    <linearGradient id="paint" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0283f"/><stop offset="1" stop-color="#a80d24"/>
    </linearGradient>`);
}

// ---- 4. Labelled side section -----------------------------------------------
function cutaway(variant) {
  const TITLES = {
    front: 'Front-lit channel letter — side section',
    halo: 'Halo-lit (back-lit) channel letter — side section',
    both: 'Front &amp; back-lit channel letter — side section',
    'non-lit': 'Non-illuminated channel letter — side section'
  };
  const spaced = variant === 'halo' || variant === 'both';
  const lit = variant !== 'non-lit';
  const wallX = 170;
  const backX = spaced ? 300 : 236; // back of the letter
  const faceX = backX + 330; // inside of the face
  const top = 290;
  const bot = 650;
  const g = [];
  const labels = [];
  const label = (x, y, lx, ly, text) => labels.push(
    `<line x1="${x}" y1="${y}" x2="${lx - 12}" y2="${ly - 9}" stroke="#8b95a6" stroke-width="2"/>` +
    `<circle cx="${x}" cy="${y}" r="5" fill="#c8102e"/>` +
    `<text x="${lx}" y="${ly}" ${FONT} font-size="26" fill="#16233b">${text}</text>`);

  // wall, hatched
  g.push(`<rect x="60" y="140" width="${wallX - 60}" height="640" fill="#d5dae2"/>`);
  for (let y = 140; y < 780; y += 26) g.push(`<line x1="60" y1="${y + 40}" x2="${wallX}" y2="${y - 70}" stroke="#b5bdc9" stroke-width="2"/>`);
  g.push(`<rect x="${wallX}" y="140" width="6" height="640" fill="#9aa4b2"/>`);

  // light first, so the metal sits on top of it
  if (lit && (variant === 'front' || variant === 'both')) {
    for (const y of [360, 470, 580]) g.push(`<polygon points="${backX + 40},${y} ${faceX},${y - 70} ${faceX},${y + 70}" fill="url(#beam)" opacity="0.8"/>`);
  }
  if (spaced) {
    for (const y of [360, 470, 580]) g.push(`<polygon points="${backX + 30},${y} ${wallX + 6},${y - 60} ${wallX + 6},${y + 60}" fill="url(#beamL)" opacity="0.85"/>`);
    g.push(`<ellipse cx="${wallX + 10}" cy="${top - 40}" rx="22" ry="70" fill="#ffc35a" opacity="0.7" filter="url(#soft)"/>`);
    g.push(`<ellipse cx="${wallX + 10}" cy="${bot + 40}" rx="22" ry="70" fill="#ffc35a" opacity="0.7" filter="url(#soft)"/>`);
  }

  // standoffs or a flush back
  if (spaced) {
    for (const y of [330, 610]) g.push(`<rect x="${wallX + 6}" y="${y}" width="${backX - wallX - 6}" height="16" rx="3" fill="#6b7585"/>`);
  }
  // back: clear polycarbonate on halo / combination, aluminum otherwise
  g.push(spaced
    ? `<rect x="${backX}" y="${top}" width="8" height="${bot - top + 10}" fill="#bfe3ff" stroke="#7fb3d9" stroke-width="2" opacity="0.9"/>`
    : `<rect x="${backX}" y="${top}" width="8" height="${bot - top + 10}" fill="#8b95a6"/>`);
  // returns (top and bottom)
  const retFill = variant === 'non-lit' ? '#a50d24' : '#1b2333';
  g.push(`<rect x="${backX}" y="${top}" width="${faceX - backX + 14}" height="10" fill="${retFill}"/>`);
  g.push(`<rect x="${backX}" y="${bot}" width="${faceX - backX + 14}" height="10" fill="${retFill}"/>`);
  // face
  if (variant === 'front' || variant === 'both') {
    g.push(`<rect x="${faceX}" y="${top - 4}" width="14" height="${bot - top + 18}" fill="#ffffff" stroke="#c7cfdb" stroke-width="2"/>`);
    g.push(`<rect x="${faceX - 6}" y="${top - 10}" width="26" height="16" rx="3" fill="#2a3346"/>`);
    g.push(`<rect x="${faceX - 6}" y="${bot + 4}" width="26" height="16" rx="3" fill="#2a3346"/>`);
  } else {
    g.push(`<rect x="${faceX}" y="${top}" width="14" height="${bot - top + 10}" fill="${variant === 'non-lit' ? '#c8102e' : '#2a3448'}"/>`);
  }
  // LEDs
  if (variant === 'front') for (const y of [360, 470, 580]) g.push(`<rect x="${backX + 10}" y="${y - 16}" width="26" height="32" rx="4" fill="#ffd34e" stroke="#c99a12" stroke-width="2"/>`);
  if (variant === 'halo') for (const y of [360, 470, 580]) g.push(`<rect x="${faceX - 36}" y="${y - 16}" width="26" height="32" rx="4" fill="#ffd34e" stroke="#c99a12" stroke-width="2"/>`);
  if (variant === 'both') {
    g.push(`<rect x="${backX + 36}" y="${top + 10}" width="8" height="${bot - top - 10}" fill="#9aa4b2"/>`);
    for (const y of [360, 470, 580]) g.push(`<rect x="${backX + 28}" y="${y - 16}" width="24" height="32" rx="4" fill="#ffd34e" stroke="#c99a12" stroke-width="2"/>`);
  }
  // power supply behind the wall + wire
  if (lit) {
    g.push(`<rect x="70" y="690" width="84" height="60" rx="6" fill="#5f6b80"/><rect x="82" y="704" width="60" height="6" rx="3" fill="#ffd34e"/>`);
    g.push(`<path d="M154 720 H${wallX + 30} V${variant === 'halo' ? 480 : 470} H${variant === 'halo' ? faceX - 36 : backX + 10}" fill="none" stroke="#c8102e" stroke-width="3" stroke-dasharray="8 6"/>`);
  }

  // labels (right column)
  const LX = 790;
  label(wallX - 40, 200, LX, 170, 'Wall or fascia');
  label((backX + faceX) / 2, top + 5, LX, 230, variant === 'non-lit' ? 'Aluminum return, painted' : 'Aluminum return (side)');
  if (variant === 'front' || variant === 'both') {
    label(faceX + 7, 420, LX, 290, 'Translucent acrylic face');
    label(faceX + 7, top - 2, LX, 350, 'Trim cap');
  } else {
    label(faceX + 7, 420, LX, 290, variant === 'non-lit' ? 'Solid aluminum face' : 'Solid aluminum face (stays dark)');
  }
  if (lit) label(variant === 'halo' ? faceX - 23 : backX + 23, 580, LX, 410, 'LED modules');
  if (spaced) {
    label(backX + 4, 520, LX, 470, 'Clear back — light exits here');
    label((wallX + backX) / 2, 618, LX, 530, 'Standoff spacer');
    label(wallX + 10, top - 60, LX, 590, 'Halo of light on the wall');
  } else {
    label(backX + 4, 520, LX, 470, variant === 'non-lit' ? 'Back, fixed flush to the wall' : 'Aluminum back, mounted flush');
  }
  if (lit) label(112, 690, LX, spaced ? 650 : 530, 'Remote LED power supply');

  return svg(`
  <rect width="${W}" height="${H}" fill="#f5f7fa"/>
  <text x="60" y="84" ${FONT} font-weight="700" font-size="38" fill="#0b1220">${TITLES[variant]}</text>
  ${g.join('\n  ')}
  ${labels.join('\n  ')}
  <text x="60" y="850" ${FONT} font-size="22" fill="#5b6475">Illustration — not to scale. Construction varies with letter size and style.</text>`, `
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd34e" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd34e" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="beamL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#ffc35a" stop-opacity="0.9"/><stop offset="1" stop-color="#ffc35a" stop-opacity="0.15"/>
    </linearGradient>`);
}

const SLUGS = {
  front: 'front-lit-channel-letters',
  halo: 'halo-lit-channel-letters',
  both: 'front-and-back-lit-channel-letters',
  'non-lit': 'non-illuminated-channel-letters'
};

const write = async (file, markup) => {
  await sharp(Buffer.from(markup)).webp({ quality: 84 }).toFile(join(OUT, file));
  console.log('wrote', file);
};

for (const [variant, slug] of Object.entries(SLUGS)) {
  await write(`${slug}.webp`, storefront(variant));
  await write(`${slug}-single-letter.webp`, singleLetter(variant));
  await write(`${slug}-${variant === 'non-lit' ? 'lobby' : 'daytime'}.webp`, variant === 'non-lit' ? lobby() : storefront(variant, { day: true }));
  await write(`${slug}-cutaway.webp`, cutaway(variant));
}

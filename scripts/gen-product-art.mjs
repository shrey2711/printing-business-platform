// Draws the illustrations for the A-frame sign, sandwich board sign, custom
// table runner, custom lanyards and silicone wristbands products into
// public/images/{signs,table-covers,marketing}/. They are illustrations, not
// photographs — the product data says so in every alt text. Replace them with
// real product photography when it exists.
//
//   node scripts/gen-product-art.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
for (const d of ['signs', 'table-covers', 'marketing']) mkdirSync(join(ROOT, d), { recursive: true });

const W = 1200;
const H = 900;
const FONT = 'font-family="Liberation Sans, Arial, sans-serif"';
const NAVY = '#16233b';
const RED = '#c8102e';
const BLUE = '#1f5fe0';

const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="blur6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
    <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#e3e7ee"/></linearGradient>
    ${defs}
  </defs>
  ${body}
</svg>`;

const text = (x, y, t, { size = 30, weight = 400, fill = NAVY, anchor = 'middle', extra = '' } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${t}</text>`;

const dim = (x1, y1, x2, y2, label, { size = 26, offset = 0, vertical = false } = {}) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const ticks = vertical
    ? `<line x1="${x1 - 10}" y1="${y1}" x2="${x1 + 10}" y2="${y1}" stroke="#5b6475" stroke-width="3"/><line x1="${x2 - 10}" y1="${y2}" x2="${x2 + 10}" y2="${y2}" stroke="#5b6475" stroke-width="3"/>`
    : `<line x1="${x1}" y1="${y1 - 10}" x2="${x1}" y2="${y1 + 10}" stroke="#5b6475" stroke-width="3"/><line x1="${x2}" y1="${y2 - 10}" x2="${x2}" y2="${y2 + 10}" stroke="#5b6475" stroke-width="3"/>`;
  const label_ = vertical
    ? text(mx + offset, my + 9, label, { size, fill: '#5b6475', weight: 700, anchor: 'start' })
    : text(mx, my + offset, label, { size, fill: '#5b6475', weight: 700 });
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5b6475" stroke-width="3"/>${ticks}${label_}`;
};

// A bit of sample artwork for printed panels.
const panelArt = (x, y, w, h, { head = 'FRESH COFFEE', sub = 'Open daily · 7am – 6pm', a = '#c8102e', b = '#16233b' } = {}) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h * 0.42}" fill="${b}"/>
  <circle cx="${x + w * 0.22}" cy="${y + h * 0.21}" r="${Math.min(w, h) * 0.1}" fill="${a}"/>
  ${text(x + w * 0.62, y + h * 0.27, head, { size: Math.max(14, w * 0.085), weight: 700, fill: '#fff' })}
  ${text(x + w / 2, y + h * 0.62, sub, { size: Math.max(12, w * 0.06), fill: b })}
  <rect x="${x + w * 0.2}" y="${y + h * 0.72}" width="${w * 0.6}" height="${h * 0.06}" rx="${h * 0.03}" fill="${a}"/>
  <rect x="${x + w * 0.3}" y="${y + h * 0.84}" width="${w * 0.4}" height="${h * 0.04}" rx="${h * 0.02}" fill="#c9d2e0"/>`;

// ---------------------------------------------------------------------------
// A-frame sign
// ---------------------------------------------------------------------------
const pavement = (top, tone = '#c9ccd2') => `
  <rect x="0" y="${top}" width="${W}" height="${H - top}" fill="${tone}"/>
  ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 160 - 80}" y1="${top}" x2="${i * 190 - 220}" y2="${H}" stroke="#aeb2bb" stroke-width="3"/>`).join('')}
  ${[top + 60, top + 150, top + 270].map((y) => `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#aeb2bb" stroke-width="3"/>`).join('')}`;

function aFrameFront(cx, baseY, pw, ph, art, { metal = '#2a3140' } = {}) {
  const x = cx - pw / 2;
  const topW = pw * 0.94;
  const y = baseY - ph - 36;
  const pts = `${cx - topW / 2},${y} ${cx + topW / 2},${y} ${x + pw},${baseY - 28} ${x},${baseY - 28}`;
  return `
  <ellipse cx="${cx}" cy="${baseY + 6}" rx="${pw * 0.62}" ry="16" fill="#000" opacity="0.18" filter="url(#blur6)"/>
  <rect x="${x + 6}" y="${baseY - 32}" width="26" height="30" fill="${metal}"/>
  <rect x="${x + pw - 32}" y="${baseY - 32}" width="26" height="30" fill="${metal}"/>
  <polygon points="${pts}" fill="${metal}"/>
  <g transform="translate(${cx} ${y + (baseY - 28 - y) / 2}) scale(0.94) translate(${-cx} ${-(y + (baseY - 28 - y) / 2)})">
    ${art(x + 14, y + 14, pw - 28, baseY - 28 - y - 28)}
  </g>
  <rect x="${cx - topW / 2}" y="${y - 10}" width="${topW}" height="14" rx="5" fill="#161b26"/>`;
}

function aFrameHero() {
  return svg(`
  <rect width="${W}" height="${H}" fill="#dfe4ec"/>
  <!-- shopfront -->
  <rect x="0" y="0" width="${W}" height="560" fill="#b9c2cf"/>
  <rect x="0" y="60" width="${W}" height="120" fill="${NAVY}"/>
  ${text(600, 138, 'CORNER CAFÉ', { size: 64, weight: 700, fill: '#fff', extra: 'letter-spacing="10"' })}
  <rect x="80" y="220" width="460" height="320" fill="#8fb4cc"/>
  <rect x="660" y="220" width="460" height="320" fill="#8fb4cc"/>
  <polygon points="80,220 260,220 120,540 80,540" fill="#fff" opacity="0.18"/>
  <polygon points="660,220 820,220 700,540 660,540" fill="#fff" opacity="0.18"/>
  <rect x="560" y="200" width="80" height="340" fill="#5a4636"/>
  ${pavement(540)}
  ${aFrameFront(600, 830, 420, 560, (x, y, w, h) => panelArt(x, y, w, h))}
  `);
}

function aFrameSizes() {
  const s = 15; // px per inch
  const base = 740;
  const small = { w: 18 * s, h: 24 * s };
  const large = { w: 24 * s, h: 36 * s };
  const draw = (cx, d) => `
    <rect x="${cx - d.w / 2}" y="${base - d.h}" width="${d.w}" height="${d.h}" fill="#2a3140"/>
    ${panelArt(cx - d.w / 2 + 8, base - d.h + 8, d.w - 16, d.h - 16, { head: 'SALE', sub: 'Today only' })}`;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Two common panel sizes', { size: 44, weight: 700 })}
  <rect x="0" y="${base}" width="${W}" height="3" fill="#c3c9d4"/>
  ${draw(380, small)}
  ${draw(820, large)}
  ${dim(380 - small.w / 2, base + 36, 380 + small.w / 2, base + 36, '18"', { offset: 40 })}
  ${dim(380 - small.w / 2 - 36, base - small.h, 380 - small.w / 2 - 36, base, '24"', { vertical: true, offset: -84 })}
  ${dim(820 - large.w / 2, base + 36, 820 + large.w / 2, base + 36, '24"', { offset: 40 })}
  ${dim(820 - large.w / 2 - 36, base - large.h, 820 - large.w / 2 - 36, base, '36"', { vertical: true, offset: -84 })}
  ${text(380, 868, 'Counter, doorway, event table', { size: 24, fill: '#5b6475' })}
  ${text(820, 868, 'Pavement sign, read from a few steps away', { size: 24, fill: '#5b6475' })}
  `);
}

function aFrameFold(label1 = 'Stands in an A shape', label2 = 'Folds flat for storage', title = 'A-frame sign, side view') {
  const apexX = 330;
  const apexY = 220;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, title, { size: 44, weight: 700 })}
  <rect x="0" y="720" width="${W}" height="3" fill="#c3c9d4"/>
  <!-- open -->
  <polygon points="${apexX},${apexY} ${apexX - 160},720 ${apexX - 130},720 ${apexX + 6},${apexY + 24}" fill="#2a3140"/>
  <polygon points="${apexX},${apexY} ${apexX + 160},720 ${apexX + 130},720 ${apexX - 6},${apexY + 24}" fill="#3a4357"/>
  <circle cx="${apexX}" cy="${apexY + 8}" r="16" fill="#9aa4b2" stroke="#6b7585" stroke-width="3"/>
  <line x1="${apexX - 120}" y1="560" x2="${apexX + 120}" y2="560" stroke="#8b95a6" stroke-width="5" stroke-dasharray="14 10"/>
  ${text(apexX, 790, label1, { size: 32, weight: 700 })}
  <!-- folded -->
  <rect x="800" y="${apexY}" width="26" height="500" rx="4" fill="#2a3140"/>
  <rect x="830" y="${apexY}" width="26" height="500" rx="4" fill="#3a4357"/>
  <circle cx="828" cy="${apexY + 12}" r="14" fill="#9aa4b2" stroke="#6b7585" stroke-width="3"/>
  ${text(828, 790, label2, { size: 32, weight: 700 })}
  <path d="M520 470 H690" stroke="#8b95a6" stroke-width="5" fill="none"/>
  <polygon points="690,452 722,470 690,488" fill="#8b95a6"/>
  `);
}

// ---------------------------------------------------------------------------
// Sandwich board sign
// ---------------------------------------------------------------------------
function board(cx, baseY, w, h, art, { wood = '#6b4a2f', woodLight = '#8a6542' } = {}) {
  const x = cx - w / 2;
  const y = baseY - h;
  return `
  <ellipse cx="${cx}" cy="${baseY + 8}" rx="${w * 0.66}" ry="18" fill="#000" opacity="0.2" filter="url(#blur6)"/>
  <rect x="${x - 26}" y="${y + h * 0.1}" width="28" height="${h * 0.92}" fill="${wood}" transform="skewY(0)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${wood}"/>
  <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="3" fill="${woodLight}"/>
  ${art(x + 22, y + 22, w - 44, h - 44)}
  <rect x="${x + w * 0.4}" y="${y - 8}" width="${w * 0.2}" height="14" rx="6" fill="#9aa4b2" stroke="#6b7585" stroke-width="2"/>
  <rect x="${x + 6}" y="${baseY - 10}" width="24" height="12" fill="#3b2a1b"/>
  <rect x="${x + w - 30}" y="${baseY - 10}" width="24" height="12" fill="#3b2a1b"/>`;
}

const menuArt = (x, y, w, h) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d2b22"/>
  ${text(x + w / 2, y + h * 0.17, 'TODAY&apos;S MENU', { size: Math.max(16, w * 0.09), weight: 700, fill: '#f3e3b3', extra: 'letter-spacing="3"' })}
  <line x1="${x + w * 0.2}" y1="${y + h * 0.23}" x2="${x + w * 0.8}" y2="${y + h * 0.23}" stroke="#f3e3b3" stroke-width="3"/>
  ${[0.36, 0.5, 0.64, 0.78].map((p, i) => `
    <rect x="${x + w * 0.14}" y="${y + h * p}" width="${w * (0.45 + (i % 2) * 0.12)}" height="${h * 0.035}" rx="4" fill="#e9eef0" opacity="0.9"/>
    <rect x="${x + w * 0.76}" y="${y + h * p}" width="${w * 0.1}" height="${h * 0.035}" rx="4" fill="#f3e3b3"/>`).join('')}`;

function sandwichHero() {
  return svg(`
  <rect width="${W}" height="${H}" fill="#cfd4dc"/>
  <rect x="0" y="0" width="${W}" height="560" fill="#9c5b45"/>
  ${Array.from({ length: 14 }, (_, r) => Array.from({ length: 16 }, (_, c) => `<rect x="${c * 80 + (r % 2) * 40 - 40}" y="${r * 40}" width="76" height="36" fill="${['#a8644c', '#94533d', '#a05a45'][(r + c) % 3]}"/>`).join('')).join('')}
  <rect x="120" y="80" width="360" height="40" fill="#1d2b22"/>
  ${text(300, 110, 'BISTRO', { size: 34, weight: 700, fill: '#f3e3b3', extra: 'letter-spacing="8"' })}
  <rect x="640" y="150" width="460" height="330" fill="#2a3a46"/>
  <polygon points="640,150 820,150 700,480 640,480" fill="#fff" opacity="0.12"/>
  ${pavement(540, '#bfc3cb')}
  ${board(600, 830, 420, 560, menuArt)}
  `);
}

function sandwichFaces() {
  const sale = (x, y, w, h) => panelArt(x, y, w, h, { head: 'SALE', sub: 'This weekend only', a: '#c8102e', b: '#16233b' });
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Print both faces', { size: 44, weight: 700 })}
  <rect x="0" y="800" width="${W}" height="3" fill="#c3c9d4"/>
  ${board(340, 800, 330, 520, menuArt)}
  ${board(860, 800, 330, 520, sale)}
  ${text(340, 860, 'Front face', { size: 30, weight: 700 })}
  ${text(860, 860, 'Back face — same or different artwork', { size: 30, weight: 700 })}
  `);
}

function sandwichContexts() {
  const welcome = (x, y, w, h) => panelArt(x, y, w, h, { head: 'WELCOME', sub: 'Registration · Level 2', a: '#1f5fe0', b: '#16233b' });
  const open = (x, y, w, h) => panelArt(x, y, w, h, { head: 'NOW OPEN', sub: 'Mon – Sat 9am – 7pm', a: '#c8102e', b: '#2b3a55' });
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Where sandwich boards work', { size: 44, weight: 700 })}
  <rect x="0" y="760" width="${W}" height="3" fill="#c3c9d4"/>
  ${board(220, 760, 280, 440, menuArt)}
  ${board(600, 760, 280, 440, open)}
  ${board(980, 760, 280, 440, welcome)}
  ${text(220, 830, 'Restaurant menu', { size: 28, weight: 700 })}
  ${text(600, 830, 'Shop frontage', { size: 28, weight: 700 })}
  ${text(980, 830, 'Event entrance', { size: 28, weight: 700 })}
  `);
}

// ---------------------------------------------------------------------------
// Table runner
// ---------------------------------------------------------------------------
// Table top as a parallelogram (long edge running left to right, receding).
const tbl = { x0: 140, y0: 440, len: 760, depth: 190, skew: 150, thick: 28 };
const tp = (u, v) => [tbl.x0 + u * tbl.len + v * tbl.skew, tbl.y0 - v * tbl.depth];
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;

function tableTop({ runner = null, cover = false, offsetX = 0 }) {
  const g = [];
  const sh = (p) => [p[0] + offsetX, p[1]];
  const A = sh(tp(0, 0));
  const B = sh(tp(1, 0));
  const C = sh(tp(1, 1));
  const D = sh(tp(0, 1));
  // shadow
  g.push(`<ellipse cx="${(A[0] + C[0]) / 2}" cy="${A[1] + 250}" rx="${tbl.len * 0.62}" ry="34" fill="#000" opacity="0.13" filter="url(#blur14)"/>`);
  if (cover) {
    g.push(poly([A, B, [B[0], B[1] + 250], [A[0], A[1] + 250]], '#1c2b4a'));
    g.push(poly([B, C, [C[0], C[1] + 250], [B[0], B[1] + 250]], '#142038'));
    g.push(`<rect x="${A[0] + 30}" y="${A[1] + 80}" width="${B[0] - A[0] - 60}" height="40" fill="#fff" opacity="0.9" rx="6"/>`);
    g.push(text((A[0] + B[0]) / 2, A[1] + 110, 'YOUR LOGO', { size: 30, weight: 700, fill: '#1c2b4a' }));
    g.push(poly([A, B, C, D], '#26396a'));
    return g.join('');
  }
  // legs
  for (const [u, v] of [[0.04, 0.05], [0.96, 0.05], [0.04, 0.95], [0.96, 0.95]]) {
    const p = sh(tp(u, v));
    g.push(`<rect x="${p[0] - 8}" y="${p[1] + tbl.thick}" width="16" height="${v < 0.5 ? 230 : 190}" fill="${v < 0.5 ? '#8a8f99' : '#a2a7b1'}"/>`);
  }
  g.push(poly([A, B, [B[0], B[1] + tbl.thick], [A[0], A[1] + tbl.thick]], '#b9a07a'));
  g.push(poly([A, B, C, D], '#d9c29b'));
  if (runner) g.push(runner(sh));
  return g.join('');
}

function runnerShape(sh, { v0 = 0.22, v1 = 0.78, pattern = 'repeat' } = {}) {
  const A = sh(tp(0, v0));
  const B = sh(tp(1, v0));
  const C = sh(tp(1, v1));
  const D = sh(tp(0, v1));
  const out = [];
  // the runner overhangs the front/back ends a little, as a real one does
  out.push(poly([A, B, C, D], '#16233b'));
  const logos = pattern === 'once' ? [0.5] : pattern === 'repeat' ? [0.18, 0.5, 0.82] : [];
  for (const u of logos) {
    const c = sh(tp(u, (v0 + v1) / 2));
    out.push(`<g transform="translate(${c[0]} ${c[1]}) skewX(-38) scale(1 0.62)">
      <polygon points="-18,18 0,-22 18,18 8,18 0,0 -8,18" fill="#e63950"/>
      ${text(0, 54, 'YOUR LOGO', { size: 26, weight: 700, fill: '#ffffff' })}
    </g>`);
  }
  if (pattern === 'full') {
    for (let i = 0; i < 9; i++) {
      const a = sh(tp(i / 9, v0));
      const b = sh(tp((i + 0.5) / 9, v0));
      const c = sh(tp((i + 0.5) / 9, v1));
      const d = sh(tp(i / 9, v1));
      out.push(poly([a, b, c, d], i % 2 ? '#e63950' : '#1f5fe0', 'opacity="0.9"'));
    }
    const c = sh(tp(0.5, (v0 + v1) / 2));
    out.push(`<g transform="translate(${c[0]} ${c[1]}) skewX(-38) scale(1 0.62)">${text(0, 10, 'YOUR BRAND', { size: 40, weight: 800, fill: '#fff' })}</g>`);
  }
  return out.join('');
}

function runnerHero() {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#cdd3dd" opacity="0.35"/>
  <g transform="translate(-80 40) scale(1.12)">
  ${tableTop({ runner: (sh) => runnerShape(sh, { pattern: 'repeat' }) })}
  </g>`);
}

function runnerDesigns() {
  const strip = (y, pattern, label) => {
    const A = [200, y];
    const w = 800;
    const h = 150;
    const body = pattern === 'full'
      ? Array.from({ length: 10 }, (_, i) => `<rect x="${A[0] + i * 80}" y="${y}" width="80" height="${h}" fill="${i % 2 ? '#e63950' : '#1f5fe0'}"/>`).join('') + text(600, y + 92, 'YOUR BRAND', { size: 56, weight: 800, fill: '#fff' })
      : `<rect x="${A[0]}" y="${y}" width="${w}" height="${h}" fill="#16233b"/>` +
        (pattern === 'once' ? [600] : [330, 600, 870]).map((cx) => `<polygon points="${cx - 22},${y + 70} ${cx},${y + 28} ${cx + 22},${y + 70} ${cx + 10},${y + 70} ${cx},${y + 50} ${cx - 10},${y + 70}" fill="#e63950"/>${text(cx, y + 112, 'YOUR LOGO', { size: 26, weight: 700, fill: '#fff' })}`).join('');
    return `<g>${body}</g>${text(600, y + h + 44, label, { size: 30, weight: 700 })}`;
  };
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Three ways to print a table runner', { size: 44, weight: 700 })}
  ${strip(150, 'once', 'Logo once, at the front')}
  ${strip(400, 'repeat', 'Logo repeated along the length')}
  ${strip(650, 'full', 'Full design, edge to edge')}
  `);
}

function runnerVsCover() {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 80, 'Table runner or table cover?', { size: 44, weight: 700 })}
  <g transform="translate(30 170) scale(0.56)">${tableTop({ runner: (sh) => runnerShape(sh, { pattern: 'repeat' }) })}</g>
  <g transform="translate(580 170) scale(0.56)">${tableTop({ cover: true })}</g>
  ${text(360, 760, 'Runner', { size: 36, weight: 700 })}${text(360, 805, 'A branded strip; the table stays visible', { size: 24, fill: '#5b6475' })}
  ${text(910, 760, 'Cover', { size: 36, weight: 700 })}${text(910, 805, 'Hides storage and brands the whole table', { size: 24, fill: '#5b6475' })}
  `);
}

// ---------------------------------------------------------------------------
// Lanyards
// ---------------------------------------------------------------------------
const strap = (x1, y1, x2, y2, width, fill, { pattern = '', label = '' } = {}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `<g transform="translate(${x1} ${y1}) rotate(${ang})">
    <rect x="0" y="${-width / 2}" width="${len}" height="${width}" fill="${fill}"/>
    ${pattern}
    ${label}
    <rect x="0" y="${-width / 2}" width="${len}" height="3" fill="#000" opacity="0.18"/>
    <rect x="0" y="${width / 2 - 3}" width="${len}" height="3" fill="#000" opacity="0.18"/>
  </g>`;
};

const repeatLogo = (len, width, color = '#fff', every = 230) =>
  Array.from({ length: Math.floor(len / every) }, (_, i) => text(i * every + every / 2 + 20, width * 0.12, 'YOUR LOGO', { size: Math.max(14, width * 0.34), weight: 700, fill: color, extra: `letter-spacing="2"` })).join('');

function lanyardHero() {
  const badge = `
    <rect x="530" y="590" width="140" height="22" rx="5" fill="#9aa4b2" stroke="#6b7585" stroke-width="3"/>
    <rect x="440" y="610" width="320" height="220" rx="16" fill="#ffffff" stroke="#c7cfdb" stroke-width="4"/>
    <path d="M440 626 a16 16 0 0 1 16-16 h288 a16 16 0 0 1 16 16 v52 h-320 Z" fill="${RED}"/>
    ${text(600, 660, 'EXHIBITOR', { size: 32, weight: 700, fill: '#fff', extra: 'letter-spacing="6"' })}
    <circle cx="520" cy="750" r="40" fill="#e0e5ec" stroke="#c7cfdb" stroke-width="3"/>
    <rect x="580" y="725" width="140" height="16" rx="8" fill="${NAVY}"/>
    <rect x="580" y="758" width="100" height="14" rx="7" fill="#c9d2e0"/>`;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  <ellipse cx="600" cy="860" rx="300" ry="20" fill="#000" opacity="0.14" filter="url(#blur14)"/>
  ${strap(430, -20, 590, 590, 66, BLUE, { pattern: repeatLogo(640, 66) })}
  ${strap(770, -20, 610, 590, 66, BLUE, { pattern: repeatLogo(640, 66) })}
  <path d="M570 560 L630 560 L618 600 L582 600 Z" fill="#c9d2e0" stroke="#8b95a6" stroke-width="3"/>
  ${badge}
  `);
}

function lanyardMaterials() {
  const cols = [
    { name: 'Polyester', note: 'One or two colours', fill: BLUE, pat: () => '' },
    { name: 'Nylon', note: 'Smooth, glossy', fill: '#c8102e', pat: () => '' },
    { name: 'Woven', note: 'Heavier, textured', fill: '#16233b', pat: 'weave' },
    { name: 'Tubular', note: 'Rounded, soft', fill: '#2a8f5a', pat: 'tube' },
    { name: 'Dye sublimation', note: 'Full colour, photos', fill: 'url(#dye)', pat: '' }
  ];
  const cw = 200;
  const gap = 24;
  const x0 = (W - (cols.length * cw + (cols.length - 1) * gap)) / 2;
  const body = cols.map((c, i) => {
    const x = x0 + i * (cw + gap);
    const overlay = c.pat === 'weave'
      ? `<g stroke="#fff" stroke-opacity="0.22" stroke-width="3">${Array.from({ length: 36 }, (_, k) => `<line x1="${x}" y1="${190 + k * 14}" x2="${x + cw}" y2="${190 + k * 14}"/>`).join('')}${Array.from({ length: 12 }, (_, k) => `<line x1="${x + k * 16 + 8}" y1="190" x2="${x + k * 16 + 8}" y2="690"/>`).join('')}</g>`
      : c.pat === 'tube'
        ? `<rect x="${x}" y="190" width="${cw}" height="500" fill="url(#tube)"/>`
        : '';
    const logo = c.name === 'Dye sublimation'
      ? Array.from({ length: 5 }, (_, k) => `<g transform="translate(${x + cw / 2} ${240 + k * 100})"><polygon points="-22,22 0,-24 22,22 10,22 0,0 -10,22" fill="#fff"/></g>`).join('')
      : Array.from({ length: 5 }, (_, k) => text(x + cw / 2, 250 + k * 100, 'YOUR LOGO', { size: 26, weight: 700, fill: '#fff' })).join('');
    return `<rect x="${x}" y="190" width="${cw}" height="500" fill="${c.fill}"/>${overlay}${logo}
      <rect x="${x}" y="190" width="6" height="500" fill="#000" opacity="0.15"/><rect x="${x + cw - 6}" y="190" width="6" height="500" fill="#000" opacity="0.15"/>
      ${text(x + cw / 2, 740, c.name, { size: 30, weight: 700 })}
      ${text(x + cw / 2, 780, c.note, { size: 20, fill: '#5b6475' })}`;
  }).join('');
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 100, 'Choose your lanyard material', { size: 46, weight: 700 })}
  ${body}`, `
    <linearGradient id="dye" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d8f"/><stop offset="0.5" stop-color="#7b5cff"/><stop offset="1" stop-color="#18c6d8"/></linearGradient>
    <linearGradient id="tube" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>`);
}

function lanyardAttachments() {
  const cell = (cx, cy, name, icon) => `<g transform="translate(${cx} ${cy})"><rect x="-250" y="-170" width="500" height="340" rx="24" fill="#fff" stroke="#d8dee8" stroke-width="3"/>${icon}${text(0, 140, name, { size: 32, weight: 700 })}</g>`;
  const metal = '#9aa4b2';
  const swivel = `<rect x="-26" y="-150" width="52" height="60" fill="${BLUE}"/><circle cx="0" cy="-70" r="14" fill="${metal}" stroke="#6b7585" stroke-width="4"/><path d="M0 -56 V-20 C0 20 -50 20 -50 -20 M-50 -20 C-50 -50 -30 -60 -14 -40" stroke="${metal}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  const bulldog = `<rect x="-26" y="-150" width="52" height="60" fill="${BLUE}"/><rect x="-44" y="-86" width="88" height="28" rx="6" fill="${metal}" stroke="#6b7585" stroke-width="3"/><path d="M-40 -58 L-30 30 H30 L40 -58 Z" fill="${metal}" stroke="#6b7585" stroke-width="3"/><rect x="-24" y="30" width="48" height="12" rx="4" fill="#6b7585"/>`;
  const ring = `<rect x="-26" y="-150" width="52" height="60" fill="${BLUE}"/><circle cx="0" cy="-30" r="50" fill="none" stroke="${metal}" stroke-width="10"/><circle cx="0" cy="-30" r="38" fill="none" stroke="#6b7585" stroke-width="3" opacity="0.6"/><circle cx="0" cy="-30" r="58" fill="none" stroke="#6b7585" stroke-width="2" opacity="0.5"/>`;
  const phone = `<rect x="-26" y="-150" width="52" height="60" fill="${BLUE}"/><path d="M-26 -90 C-26 -30 -26 -10 0 -10 C26 -10 26 -30 26 -90" fill="none" stroke="${BLUE}" stroke-width="16"/><rect x="-44" y="-30" width="88" height="130" rx="14" fill="#1b2333"/><rect x="-36" y="-20" width="72" height="104" rx="6" fill="#3a4a66"/>`;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 80, 'Four ways to attach', { size: 46, weight: 700 })}
  ${cell(330, 290, 'Swivel hook', swivel)}
  ${cell(870, 290, 'Bulldog clip', bulldog)}
  ${cell(330, 665, 'Split ring', ring)}
  ${cell(870, 665, 'Cell phone loop', phone)}
  `);
}

function lanyardWidths() {
  const px = 190; // px per inch
  const rows = [
    { w: 5 / 8, label: '5/8"' },
    { w: 3 / 4, label: '3/4"' },
    { w: 1, label: '1"' }
  ];
  let y = 210;
  const body = rows.map((r) => {
    const h = r.w * px;
    const out = `<rect x="140" y="${y}" width="760" height="${h}" fill="${BLUE}"/>${[0, 1, 2].map((i) => text(270 + i * 250, y + h / 2 + 10, 'YOUR LOGO', { size: 30, weight: 700, fill: '#fff' })).join('')}
      <rect x="140" y="${y}" width="760" height="4" fill="#000" opacity="0.18"/><rect x="140" y="${y + h - 4}" width="760" height="4" fill="#000" opacity="0.18"/>
      ${dim(960, y, 960, y + h, '', { vertical: true })}${text(990, y + h / 2 + 12, r.label, { size: 36, weight: 700, anchor: 'start' })}`;
    y += h + 70;
    return out;
  }).join('');
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 100, 'Three widths, to scale', { size: 46, weight: 700 })}
  ${body}
  ${text(600, 850, '36" standard loop length — printed on one or both sides', { size: 28, fill: '#5b6475' })}`);
}

// ---------------------------------------------------------------------------
// Silicone wristbands
// ---------------------------------------------------------------------------
function band(cx, cy, rx, ry, h, color, dark, { imprint = 'screen', logo = 'LOGO', fillColor = '#fff' } = {}) {
  const wallInset = 22;
  const innerRx = rx - wallInset;
  const innerRy = ry - wallInset * (ry / rx);
  const id = `g${Math.round(cx)}${Math.round(cy)}`;
  const front = `M${cx - rx},${cy} L${cx - rx},${cy + h} A${rx},${ry} 0 0 0 ${cx + rx},${cy + h} L${cx + rx},${cy} A${rx},${ry} 0 0 1 ${cx - rx},${cy} Z`;
  let mark;
  const my = cy + ry + h * 0.62;
  const size = Math.min(44, h * 0.62);
  if (imprint === 'screen') mark = text(cx, my, logo, { size, weight: 800, fill: '#fff' });
  else if (imprint === 'deboss') mark = text(cx + 1.5, my + 1.5, logo, { size, weight: 800, fill: '#fff', extra: 'opacity="0.5"' }) + text(cx, my, logo, { size, weight: 800, fill: dark });
  else if (imprint === 'emboss') mark = text(cx + 2.5, my + 2.5, logo, { size, weight: 800, fill: dark }) + text(cx, my, logo, { size, weight: 800, fill: '#ffffff', extra: 'opacity="0.38"' }) + text(cx - 0.5, my - 0.5, logo, { size, weight: 800, fill: color, extra: 'opacity="0.9"' });
  else mark = text(cx - 1.5, my - 1.5, logo, { size, weight: 800, fill: dark }) + text(cx, my, logo, { size, weight: 800, fill: fillColor });
  return `
  <ellipse cx="${cx}" cy="${cy + h + ry * 0.55}" rx="${rx * 0.95}" ry="${ry * 0.3}" fill="#000" opacity="0.16" filter="url(#blur14)"/>
  <ellipse cx="${cx}" cy="${cy + h}" rx="${rx}" ry="${ry}" fill="${dark}"/>
  <path d="${front}" fill="url(#${id}f)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}" fill="#e6eaf0"/>
  <clipPath id="${id}c"><ellipse cx="${cx}" cy="${cy}" rx="${innerRx}" ry="${innerRy}"/></clipPath>
  <path clip-path="url(#${id}c)" d="M${cx - innerRx},${cy} A${innerRx},${innerRy} 0 0 1 ${cx + innerRx},${cy} L${cx + innerRx},${cy + h} A${innerRx},${innerRy} 0 0 0 ${cx - innerRx},${cy + h} Z" fill="${dark}"/>
  ${mark}
  <defs><linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${dark}"/><stop offset="0.35" stop-color="${color}"/><stop offset="0.7" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`;
}

function wristbandHero() {
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${band(380, 330, 250, 78, 120, '#e63950', '#9b1027', { imprint: 'deboss' })}
  ${band(760, 450, 250, 78, 120, '#1f5fe0', '#143d96', { imprint: 'screen' })}
  ${band(480, 640, 250, 78, 120, '#16233b', '#0a1020', { imprint: 'emboss' })}
  `);
}

function wristbandImprints() {
  const items = [
    ['screen', 'Screen printed', 'Fastest, one or two colours', '#1f5fe0', '#143d96'],
    ['deboss', 'Debossed', 'Pressed into the band', '#e63950', '#9b1027'],
    ['emboss', 'Embossed', 'Raised from the band', '#2a8f5a', '#17603a'],
    ['filled', 'Debossed, colour-filled', 'Recess matches your logo', '#16233b', '#0a1020']
  ];
  const body = items.map(([kind, name, note, c, d], i) => {
    const cx = i % 2 === 0 ? 320 : 880;
    const cy = i < 2 ? 250 : 600;
    return `${band(cx, cy, 190, 58, 100, c, d, { imprint: kind, fillColor: '#ffd34e' })}${text(cx, cy + 215, name, { size: 32, weight: 700 })}${text(cx, cy + 252, note, { size: 22, fill: '#5b6475' })}`;
  }).join('');
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 80, 'Four imprint styles', { size: 46, weight: 700 })}
  ${body}`);
}

function wristbandSizes() {
  const sx = 30; // px per inch of band width
  const rows = [
    { w: 0.5, label: '1/2"' },
    { w: 0.75, label: '3/4"' },
    { w: 1, label: '1"' }
  ];
  let y = 250;
  const widths = rows.map((r) => {
    const h = r.w * 180;
    const out = `<rect x="90" y="${y}" width="310" height="${h}" rx="${h / 2.2}" fill="#e63950"/>${text(245, y + h / 2 + 11, 'LOGO', { size: Math.min(34, h * 0.5), weight: 800, fill: '#fff' })}${text(430, y + h / 2 + 13, r.label, { size: 36, weight: 700, anchor: 'start' })}`;
    y += h + 50;
    return out;
  }).join('');
  const ring = (cx, cy, label, sub, rx) => `
    <ellipse cx="${cx}" cy="${cy + 14}" rx="${rx}" ry="${rx * 0.3}" fill="none" stroke="#143d96" stroke-width="34"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.3}" fill="none" stroke="#1f5fe0" stroke-width="34"/>
    ${text(cx, cy + rx * 0.3 + 78, label, { size: 34, weight: 700 })}${text(cx, cy + rx * 0.3 + 114, sub, { size: 24, fill: '#5b6475' })}`;
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Sizes and widths', { size: 46, weight: 700 })}
  ${text(245, 200, 'Band width', { size: 30, weight: 700, fill: '#5b6475' })}
  <g>${widths}</g>
  ${text(880, 200, 'Circumference', { size: 30, weight: 700, fill: '#5b6475' })}
  ${ring(880, 320, 'Adult', '8" / 202 mm', 165)}
  ${ring(880, 640, 'Youth', '7" / 180 mm', 142)}`);
}

function wristbandColours() {
  const colours = [
    ['#e63950', '#9b1027'], ['#f28c28', '#a85a0b'], ['#ffd34e', '#b8921c'], ['#2a8f5a', '#17603a'],
    ['#1f5fe0', '#143d96'], ['#7b4fd6', '#4b2b9a'], ['#16233b', '#0a1020'], ['#e9edf2', '#a7b0bf']
  ];
  const body = colours.map(([c, d], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return band(210 + col * 260, 250 + row * 270, 108, 36, 70, c, d, { imprint: 'screen', logo: '' });
  }).join('');
  return svg(`
  <rect width="${W}" height="${H}" fill="url(#studio)"/>
  ${text(600, 90, 'Standard colours — or a custom PMS match', { size: 44, weight: 700 })}
  ${body}
  <rect x="300" y="740" width="600" height="86" rx="43" fill="#fff" stroke="#d8dee8" stroke-width="3"/>
  ${text(600, 795, 'Match your brand colour exactly', { size: 32, weight: 700 })}`);
}

// ---------------------------------------------------------------------------
const OUTPUT = {
  'signs/a-frame-sign-sidewalk.webp': aFrameHero,
  'signs/a-frame-sign-sizes.webp': aFrameSizes,
  'signs/a-frame-sign-folds-flat.webp': () => aFrameFold(),
  'signs/sandwich-board-sign-pavement.webp': sandwichHero,
  'signs/sandwich-board-sign-both-faces.webp': sandwichFaces,
  'signs/sandwich-board-sign-uses.webp': sandwichContexts,
  'table-covers/custom-table-runner-trade-show.webp': runnerHero,
  'table-covers/custom-table-runner-designs.webp': runnerDesigns,
  'table-covers/custom-table-runner-vs-cover.webp': runnerVsCover,
  'marketing/custom-lanyards-printed.webp': lanyardHero,
  'marketing/custom-lanyards-materials.webp': lanyardMaterials,
  'marketing/custom-lanyards-attachments.webp': lanyardAttachments,
  'marketing/custom-lanyards-widths.webp': lanyardWidths,
  'marketing/silicone-wristbands-colours-hero.webp': wristbandHero,
  'marketing/silicone-wristbands-imprint-styles.webp': wristbandImprints,
  'marketing/silicone-wristbands-sizes-widths.webp': wristbandSizes,
  'marketing/silicone-wristbands-colour-range.webp': wristbandColours
};

const only = process.argv[2];
for (const [file, fn] of Object.entries(OUTPUT)) {
  if (only && !file.includes(only)) continue;
  await sharp(Buffer.from(fn())).webp({ quality: 84 }).toFile(join(ROOT, file));
  console.log('wrote', file);
}

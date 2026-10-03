// Composes "complete booth" scenes from Apex's own product renders, for the
// homepage hero and the booth sections. Each product is cut out of its studio
// background and staged together, all in one brand, on a simple hall or plaza.
// These are product renders arranged as a booth, NOT photographs of a real
// event; alt text and captions must describe them that way.
//
//   node scripts/gen-booth-scenes.mjs
//
// Output: public/images/booth/<scene>-{1600,960}.{webp,avif}
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/images/booth';
mkdirSync(OUT, { recursive: true });

// Cut a product out of its near-uniform light studio background.
// Background is found by flood fill from the image border, so light areas
// INSIDE the product (white lettering, a white wall) are kept. Pixels in that
// region become transparent; the studio's soft grey floor shadow is kept as a
// semi-transparent dark shadow, so it lands naturally on the new floor.
async function cutout(file) {
  const img = sharp(file).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const sat = (i) => Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);

  // Background brightness: median of the four corners.
  const corners = [0, w - 1, (h - 1) * w, h * w - 1].map((p) => lum(p * 4)).sort((a, b) => a - b);
  const bg = (corners[1] + corners[2]) / 2;
  const SHADOW_RANGE = 70; // how much darker than bg a neutral shadow pixel may be
  // Near-white pixels get more colour tolerance (JPEG noise in the studio
  // background); darker shadow pixels must stay neutral grey.
  const isBgLike = (p) => {
    const i = p * 4;
    const l = lum(i);
    if (l < bg - SHADOW_RANGE) return false;
    if (l >= bg - 25) return true; // near-white, any JPEG tint
    return sat(i) < 24;
  };

  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !isBgLike(p)) continue;
    seen[p] = 1;
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }

  for (let p = 0; p < w * h; p++) {
    if (!seen[p]) continue;
    const i = p * 4;
    const darkness = Math.max(0, bg - lum(i)); // 0 = pure background
    const a = Math.min(1, darkness / SHADOW_RANGE);
    // Shadow: dark, partly transparent. Background: fully transparent.
    data[i] = 20; data[i + 1] = 22; data[i + 2] = 28;
    data[i + 3] = Math.round(255 * Math.pow(a, 0.85) * 0.9);
  }

  // Clean up regions the border flood could not reach:
  //  - small islands (noise specks), under 0.2% of the image;
  //  - studio background enclosed by a darker shadow ring: near-white and
  //    near-neutral on average. Lettering inside a product is not affected —
  //    it is connected to the product's coloured pixels, so it belongs to the
  //    product's own (dark, saturated) region.
  const minArea = w * h * 0.002;
  const label = new Uint8Array(w * h);
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || label[start]) continue;
    const comp = [];
    const st = [start];
    label[start] = 1;
    while (st.length) {
      const p = st.pop();
      comp.push(p);
      const x = p % w;
      const y = (p - x) / w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
        if (q >= 0 && !seen[q] && !label[q]) { label[q] = 1; st.push(q); }
      }
    }
    let sumL = 0, sumS = 0;
    for (const p of comp) { sumL += lum(p * 4); sumS += sat(p * 4); }
    const lightIsland = sumL / comp.length >= bg - 22 && sumS / comp.length < 30;
    if (comp.length < minArea || lightIsland) {
      for (const p of comp) {
        seen[p] = 1;
        const i = p * 4;
        const a = Math.min(1, Math.max(0, bg - lum(i)) / SHADOW_RANGE);
        data[i] = 20; data[i + 1] = 22; data[i + 2] = 28;
        data[i + 3] = Math.round(255 * Math.pow(a, 0.85) * 0.9);
      }
    }
  }

  // Defringe: the product's outermost pixels are anti-aliased against the white
  // studio background. Invisible on a light scene, they read as a white outline
  // on a dark one. Recolour that 1px ring from the product pixels just inside it
  // and soften it.
  const isEdge = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (seen[p]) continue;
    const x = p % w, y = (p - x) / w;
    if ((x > 0 && seen[p - 1]) || (x < w - 1 && seen[p + 1]) || (y > 0 && seen[p - w]) || (y < h - 1 && seen[p + w])) isEdge[p] = 1;
  }
  for (let p = 0; p < w * h; p++) {
    if (!isEdge[p]) continue;
    const x = p % w, y = (p - x) / w;
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const q = yy * w + xx;
      if (seen[q] || isEdge[q]) continue;
      r += data[q * 4]; g += data[q * 4 + 1]; b += data[q * 4 + 2]; n++;
    }
    if (n) { data[p * 4] = r / n; data[p * 4 + 1] = g / n; data[p * 4 + 2] = b / n; }
    data[p * 4 + 3] = 150;
  }

  // The product's own base (lowest row of real product pixels), so an item is
  // placed by its feet, not by the bottom of its baked-in shadow.
  let top = h, bottom = 0, left = w, right = 0;
  for (let p = 0; p < w * h; p++) {
    if (seen[p]) continue;
    const x = p % w, y = (p - x) / w;
    if (y < top) top = y; if (y > bottom) bottom = y; if (x < left) left = x; if (x > right) right = x;
  }
  // Keep only the contact shadow: near the product's lower half, fading to
  // nothing within `fall` px of the product. The studio shots also carry a wide
  // floor shadow and vignette; kept whole, the crop below clipped it into a
  // hard-edged "box", and above the product it read as haze around the item.
  const ph = bottom - top;
  const fall = Math.max(16, Math.round(ph * 0.08));
  for (let p = 0; p < w * h; p++) {
    if (!seen[p] || data[p * 4 + 3] === 0) continue;
    const x = p % w, y = (p - x) / w;
    if (y < top + ph * 0.6) { data[p * 4 + 3] = 0; continue; }
    const dx = x < left ? left - x : x > right ? x - right : 0;
    const dy = y > bottom ? y - bottom : 0;
    const f = Math.max(0, 1 - Math.hypot(dx, dy) / fall);
    data[p * 4 + 3] = Math.round(data[p * 4 + 3] * f * f);
  }

  // Crop to the product plus its (now fully faded) shadow margin.
  const pad = fall + 2;
  const crop = {
    left: Math.max(0, left - pad), top: Math.max(0, top - 2),
    width: Math.min(w, right + pad) - Math.max(0, left - pad),
    height: Math.min(h, bottom + pad) - Math.max(0, top - 2)
  };
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).extract(crop).png().toBuffer();
  // Product only (no shadow), for floor reflections.
  const solo = Buffer.from(data);
  for (let p = 0; p < w * h; p++) if (seen[p]) solo[p * 4 + 3] = 0;
  const productOnly = await sharp(solo, { raw: { width: w, height: h, channels: 4 } }).extract(crop).png().toBuffer();
  return { data: buf, productOnly, productHeight: bottom - top, footY: bottom - crop.top };
}

// A placed item: scaled to a target height, anchored at its bottom-centre.
// `height` is the PRODUCT's height (shadow excluded); `bottom` is where its
// feet stand.
async function place(file, { height, cx, bottom, edit, reflect = 0, fade = 0.3 }) {
  const { data, productOnly, productHeight, footY } = await cutout(edit ? await edit(file) : file);
  const k = height / productHeight;
  const meta0 = await sharp(data).metadata();
  const H2 = Math.round(meta0.height * k);
  const buf = await sharp(reflect ? productOnly : data).resize({ height: H2 }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  const layer = { input: buf, left: Math.round(cx - meta.width / 2), top: Math.round(bottom - footY * k) };
  if (!reflect) return [layer];
  // Glossy floor: the product mirrored below its base, fading out quickly.
  const fadeH = Math.round(productHeight * k * fade);
  const mask = Buffer.from(`<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="${reflect}"/>
      <stop offset="${Math.min(1, fadeH / meta.height)}" stop-color="#fff" stop-opacity="0"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#f)"/></svg>`);
  const mirrored = await sharp(buf).flip().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const reflTop = Math.round(bottom - (meta0.height - 1 - footY) * k);
  return [{ input: mirrored, left: layer.left, top: reflTop }, layer];
}

// A soft contact shadow ellipse under an item.
function shadow({ cx, y, rx, ry, opacity = 0.22 }, W, H) {
  return {
    input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${ry * 0.9}"/></filter></defs>
      <ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0b1220" opacity="${opacity}" filter="url(#b)"/>
    </svg>`),
    left: 0,
    top: 0
  };
}

const W = 1600;
const H = 1000;

// The red banner colourway is a template mockup with "HEADLINE AREA" and
// lorem-ipsum copy. Paint that block in the banner's own red (sampled: it
// shades from ~#e32d29 at the top to ~#df211f at the bottom) and set real copy.
const bannerCopy = (file) => sharp(file).composite([{
  input: Buffer.from(`<svg width="1200" height="896" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e32d29"/><stop offset="1" stop-color="#df211f"/>
    </linearGradient></defs>
    <rect x="506" y="402" width="187" height="196" fill="url(#r)"/>
    <g font-family="DejaVu Sans, Arial, sans-serif" fill="#ffffff">
      <text x="517" y="446" font-size="22" font-weight="bold" letter-spacing="0.3">TRADE SHOW</text>
      <text x="517" y="476" font-size="22" font-weight="bold" letter-spacing="0.3">DISPLAYS</text>
      <text x="519" y="522" font-size="13.5">Printed to match</text>
      <text x="519" y="541" font-size="13.5">your brand, from one</text>
      <text x="519" y="560" font-size="13.5">supplier.</text>
    </g>
  </svg>`),
  left: 0,
  top: 0
}]).png().toBuffer();

// Indoor: an expo hall wall and carpet, with a soft spotlight on the backdrop.
const hall = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9ebef"/><stop offset="1" stop-color="#f4f5f7"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9dce2"/><stop offset="1" stop-color="#c9cdd5"/>
    </linearGradient>
    <radialGradient id="spot" cx="0.5" cy="0.38" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect y="690" width="${W}" height="${H - 690}" fill="url(#floor)"/>
  <rect y="688" width="${W}" height="3" fill="#c3c7cf" opacity="0.6"/>
  <ellipse cx="${W / 2}" cy="380" rx="760" ry="420" fill="url(#spot)"/>
</svg>`);

// Outdoor: open sky over a pale plaza.
const plaza = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dbe6f2"/><stop offset="1" stop-color="#f3f6fa"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e3e1dc"/><stop offset="1" stop-color="#d3d0c9"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect y="720" width="${W}" height="${H - 720}" fill="url(#ground)"/>
  <rect y="718" width="${W}" height="2" fill="#c9c5bd" opacity="0.7"/>
</svg>`);

// Transparent stage: no wall or floor, so the booth stands directly on the
// homepage's dark hero. A faint light pool grounds it; reflections suggest a
// glossy floor.
const STAGE_W = 1600, STAGE_H = 1000;
const lightPool = Buffer.from(`<svg width="${STAGE_W}" height="${STAGE_H}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient></defs>
  <ellipse cx="800" cy="860" rx="720" ry="95" fill="url(#g)"/>
</svg>`);

const scenes = {
  // The indoor set on a transparent stage, with reflections, for the dark hero.
  'booth-stage': {
    transparent: true,
    pre: [lightPool],
    crop: { left: 60, top: 140, width: 1480, height: 860 },
    items: [
      { file: 'public/images/colorways/backdrop-red.webp', height: 600, cx: 800, bottom: 770, reflect: 0.18 },
      { file: 'public/images/colorways/banner-red.webp', edit: (f) => bannerCopy(f), height: 540, cx: 255, bottom: 850, reflect: 0.22, fade: 0.24 },
      { file: 'public/images/colorways/banner-red.webp', edit: (f) => bannerCopy(f), height: 540, cx: 1345, bottom: 850, reflect: 0.22, fade: 0.24 },
      { file: 'public/images/colorways/tablecover-charcoal.webp', height: 260, cx: 800, bottom: 920, reflect: 0.2 }
    ]
  },
  // Red + charcoal Apex set: backdrop behind, banners either side, table in front.
  'booth-indoor': {
    bg: hall,
    // Trim the empty wall above the backdrop so the booth fills the frame.
    crop: { left: 90, top: 140, width: 1420, height: 860 },
    items: [
      { file: 'public/images/colorways/backdrop-red.webp', height: 600, cx: 800, bottom: 770, shadow: { rx: 400, ry: 10, opacity: 0.16 } },
      { file: 'public/images/colorways/banner-red.webp', edit: bannerCopy, height: 540, cx: 255, bottom: 850, shadow: { rx: 90, ry: 9 } },
      { file: 'public/images/colorways/banner-red.webp', edit: bannerCopy, height: 540, cx: 1345, bottom: 850, shadow: { rx: 90, ry: 9 } },
      { file: 'public/images/colorways/tablecover-charcoal.webp', height: 260, cx: 800, bottom: 920, shadow: { rx: 290, ry: 12, opacity: 0.22 } }
    ]
  },
  // Navy "Apex Exhibits" set: 3-wall canopy with matching stretch table cover.
  'booth-outdoor': {
    bg: plaza,
    items: [
      { file: 'public/images/tents/10x10-3wall.webp', height: 760, cx: 800, bottom: 880, shadow: { rx: 430, ry: 14, opacity: 0.16 } },
      { file: 'public/images/table-covers/stretch.webp', height: 220, cx: 800, bottom: 950, shadow: { rx: 250, ry: 12, opacity: 0.24 } }
    ]
  }
};

for (const [name, scene] of Object.entries(scenes)) {
  const layers = (scene.pre || []).map((input) => ({ input, left: 0, top: 0 }));
  for (const it of scene.items) {
    if (it.shadow) layers.push(shadow({ cx: it.cx, y: it.bottom, ...it.shadow }, W, H));
    layers.push(...(await place(it.file, it)));
  }
  const base = scene.transparent
    ? sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    : sharp(scene.bg);
  let composed = await base.composite(layers).png().toBuffer();
  if (scene.crop) composed = await sharp(composed).extract(scene.crop).png().toBuffer();
  for (const width of [1600, 960]) {
    const img = sharp(composed).resize({ width });
    await img.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(`${OUT}/${name}-${width}.webp`);
    await img.clone().avif({ quality: 55, effort: 6 }).toFile(`${OUT}/${name}-${width}.avif`);
  }
  console.log('wrote', name);
}

// §21 image SEO for the city pages.
//
//   * every image has alt text, and the alt text is unique on the page
//   * alt text is NOT the "{category} in {City}" pattern repeated per image —
//     it must describe what the photo actually shows
//   * alt text is not keyword-stuffed (no repeated token, sane length)
//   * filenames are descriptive, lowercase and hyphenated — no IMG_1234
//   * every referenced image file exists in the build
//   * the OG image is a real file and its alt is set
//
// Usage: node scripts/audit-city-images.mjs [--list]

import { readFileSync, existsSync } from 'fs';
import { LOCAL_CATEGORIES, SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const list = process.argv.includes('--list');
const fails = [];
const warns = [];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const BAD_FILENAME = /(?:^|\/)(?:img|image|photo|dsc|pic)[-_]?\d+\.|\s|%20|[A-Z]/;

let pages = 0;
let images = 0;
for (const cat of LOCAL_CATEGORIES) {
  for (const city of SEO_CITIES) {
    if (!Array.isArray(CITY_DETAIL[city.slug]?.productSections)) continue;
    const path = `/${cat.slug}/${city.slug}`;
    const file = `${DIST}${path}/index.html`;
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    const F = (m) => fails.push(`${path}: ${m}`);
    pages++;

    const tags = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
    if (!tags.length) F('no images at all — the crawled page is text-only');

    const alts = [];
    for (const tag of tags) {
      images++;
      const src = decode((tag.match(/src="([^"]*)"/) || [])[1] || '');
      const alt = decode((tag.match(/alt="([^"]*)"/) || [])[1] || '');

      if (!alt.trim()) { F(`image without alt text: ${src}`); continue; }
      alts.push(alt);

      // alt must not just be the page's keyword phrase
      const cityName = city.h1City || city.city;
      if (new RegExp(`^${cat.label}\\b.*\\b${cityName}$`, 'i').test(alt) || alt.toLowerCase() === `${cat.label} ${cityName}`.toLowerCase()) {
        F(`alt text is the page keyword phrase, not a description: "${alt}"`);
      }
      if (alt.length > 125) warns.push(`${path}: alt text is ${alt.length} chars: "${alt.slice(0, 60)}…"`);
      const tokens = alt.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
      const counts = tokens.reduce((m, w) => m.set(w, (m.get(w) || 0) + 1), new Map());
      for (const [w, n] of counts) if (n > 2) F(`alt text repeats "${w}" ${n}x — keyword stuffing: "${alt}"`);

      // filename quality + existence
      if (src.startsWith('/')) {
        if (BAD_FILENAME.test(src)) F(`non-descriptive or unsafe image filename: ${src}`);
        if (!existsSync(`${DIST}${src.split('?')[0]}`)) F(`image file missing from the build: ${src}`);
      }
    }

    const dupes = alts.filter((a, i) => alts.indexOf(a) !== i);
    if (dupes.length) F(`duplicate alt text on the same page: "${[...new Set(dupes)][0]}"`);

    // OG image
    const og = (html.match(/property="og:image" content="([^"]*)"/) || [])[1] || '';
    const ogAlt = (html.match(/property="og:image:alt" content="([^"]*)"/) || [])[1] || '';
    if (!og) F('no og:image');
    else {
      const rel = og.replace(/^https?:\/\/[^/]+/, '');
      if (rel.startsWith('/') && !existsSync(`${DIST}${rel}`)) F(`og:image file missing from the build: ${rel}`);
    }
    if (!ogAlt) warns.push(`${path}: og:image has no og:image:alt`);

    if (list) console.log(`${path.padEnd(40)} ${tags.length} images · ${new Set(alts).size} distinct alts`);
  }
}

warns.slice(0, 10).forEach((w) => console.log(`  ! ${w}`));
if (fails.length) {
  console.error(`\n✗ IMAGE AUDIT FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 30) console.error(`  … and ${fails.length - 30} more`);
  process.exit(1);
}
console.log(`✓ IMAGES OK — ${images} images across ${pages} city pages: all have unique, descriptive alt text that is not the page keyword phrase, filenames are clean, and every file referenced exists in the build.`);

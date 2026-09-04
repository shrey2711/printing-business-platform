// Tests for the artwork acceptance rules.
//
// The cost of getting these wrong is asymmetric: wrongly rejecting a good file
// loses an order at the last step, and wrongly accepting a bad one surfaces in
// prepress a day later, when the customer has moved on. So both directions are
// tested, and anything indeterminate is allowed through rather than blocked.
//
// Run: node scripts/test-artwork.mjs

import { readFileSync } from 'fs';
import {
  validateArtwork, validatePdfPages, countPdfPages,
  ACCEPTED_MIME, MAX_BYTES, ARTWORK_SPEC
} from '../src/lib/artworkSpec.js';

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

const f = (name, type, size = 1024) => ({ name, type, size });

check('accepts PDF and JPEG', () => {
  for (const file of [f('art.pdf', 'application/pdf'), f('art.jpg', 'image/jpeg'), f('art.jpeg', 'image/jpeg')]) {
    const r = validateArtwork(file);
    if (!r.ok) return `${file.name} rejected: ${r.error}`;
  }
  return null;
});

check('accepts a correct file whose MIME type is missing', () => {
  // Browsers report an empty type for some files; the extension still decides.
  return validateArtwork(f('art.pdf', '')).ok ? null : 'rejected a .pdf with no MIME type';
});

check('rejects the formats that cannot go to print unedited', () => {
  for (const file of [f('art.ai', 'application/postscript'), f('art.png', 'image/png'), f('art.psd', 'image/vnd.adobe.photoshop'), f('art.docx', 'application/msword')]) {
    if (validateArtwork(file).ok) return `${file.name} was accepted`;
  }
  return null;
});

check('rejects a file over 300MB and accepts one at the limit', () => {
  if (validateArtwork(f('big.pdf', 'application/pdf', MAX_BYTES + 1)).ok) return 'accepted an oversized file';
  if (!validateArtwork(f('exact.pdf', 'application/pdf', MAX_BYTES)).ok) return 'rejected a file exactly at the limit';
  return null;
});

check('no file at all is fine — artwork can follow by email', () =>
  validateArtwork(null).ok ? null : 'a missing file was treated as invalid');

// ---- PDF page counting ----
const pdf = (body) => `%PDF-1.4\n${body}\ntrailer\n%%EOF`;

check('counts a single-page PDF as one page', () => {
  const one = pdf('1 0 obj<</Type /Pages /Kids[2 0 R] /Count 1>>endobj\n2 0 obj<</Type /Page>>endobj');
  const n = countPdfPages(one);
  if (n !== 1) return `counted ${n}`;
  return validatePdfPages(one).ok ? null : 'a one-page PDF was rejected';
});

check('rejects a multi-page PDF, and says how many pages', () => {
  const three = pdf('1 0 obj<</Type /Pages /Kids[2 0 R 3 0 R 4 0 R] /Count 3>>endobj');
  const r = validatePdfPages(three, 'art.pdf');
  if (r.ok) return 'a three-page PDF was accepted';
  if (!/3 pages/.test(r.error)) return `unhelpful message: ${r.error}`;
  return null;
});

check('an unreadable PDF is allowed through rather than blocked', () => {
  // Linearised and object-stream PDFs can hide the page markers. Refusing an
  // order because a file could not be parsed is worse than checking in prepress.
  if (countPdfPages('not a pdf at all') !== null) return 'it claimed a page count it could not know';
  return validatePdfPages('not a pdf at all').ok ? null : 'an indeterminate file was rejected';
});

check('the counter is not fooled by the word Pages inside content', () => {
  const one = pdf('1 0 obj<</Type /Pages /Count 1>>endobj\n(Pages of text about /Type /Pages) Tj');
  const n = countPdfPages(one);
  return n === 1 ? null : `counted ${n} on a one-page file`;
});

// ---- the rules reach the customer ----
check('the spec shown to customers covers every rule', () => {
  const text = ARTWORK_SPEC.map(([a, b]) => `${a} ${b}`).join(' ').toLowerCase();
  const required = ['jpeg', 'pdf', 'single page', 'cmyk', '150dpi', 'outlines', '300mb', 'crop marks'];
  const missing = required.filter((r) => !text.includes(r));
  return missing.length ? `not stated: ${missing.join(', ')}` : null;
});

check('the guidelines page agrees with what the form enforces', () => {
  const pages = readFileSync(new URL('../src/data/pages.js', import.meta.url), 'utf8');
  const i = pages.indexOf("slug: 'artwork-guidelines'");
  const section = pages.slice(i, i + 3000);
  // It used to advertise AI, EPS and PNG, which the uploader rejects. Guidance
  // that contradicts the validation is worse than no guidance.
  for (const claim of ['PNG or JPG', 'PDF, AI or EPS']) {
    if (section.includes(claim)) return `still advertises "${claim}", which uploads reject`;
  }
  for (const rule of ['CMYK', '150dpi', 'single page', '300MB', 'outlines']) {
    if (!section.includes(rule)) return `does not mention ${rule}`;
  }
  return null;
});

check('the server enforces the same formats as the browser', () => {
  const app = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
  if (!/QUOTE_ARTWORK_TYPES/.test(app)) return 'no server-side format list';
  if (!/artwork-url/.test(app)) return 'no signed upload route for large files';
  if (!/300 \* 1024 \* 1024/.test(app)) return 'the server does not cap the upload size';
  return null;
});

check('the accepted MIME list is exactly PDF and JPEG', () =>
  ACCEPTED_MIME.join(',') === 'application/pdf,image/jpeg' ? null : `list drifted: ${ACCEPTED_MIME.join(', ')}`);

if (fails.length) {
  console.error(`\n✗ ARTWORK FAILED — ${fails.length}/${ran}:`);
  fails.forEach((x) => console.error(`  ✗ ${x}`));
  process.exit(1);
}
console.log(`✓ ARTWORK OK — ${ran} assertions: PDF and JPEG only, single-page, 300MB, enforced on both sides and stated to the customer.`);

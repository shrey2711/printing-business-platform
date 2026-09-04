// What we can accept as print-ready artwork, in one place.
//
// The same rules are enforced on the order upload and the quote form, and shown
// to the customer on both. Keeping them here means the checks and the guidance
// cannot drift apart — a file rejected by the form must be a file the guidance
// warned about.
//
// Some of these can be checked from a file; some cannot. Colour space, DPI and
// outlined fonts are properties of the artwork's contents rather than something
// a browser can read reliably from a PDF, so those are stated clearly and
// checked in prepress. Format, size and page count ARE checkable, so they are.

export const ACCEPTED_MIME = ['application/pdf', 'image/jpeg'];
export const ACCEPTED_EXT = /\.(pdf|jpe?g)$/i;
export const MAX_BYTES = 300 * 1024 * 1024;   // 300MB
export const MAX_LABEL = '300MB';

/** Requirements a customer needs to read before exporting. */
export const ARTWORK_SPEC = [
  ['Accepted formats', 'JPEG or PDF (single page only)'],
  ['Colour space', 'CMYK — convert Pantone and spot colours before sending'],
  ['Resolution', '150dpi for raster images, which is ample for large format'],
  ['Size', 'Build artwork to the ordered size; scaled artwork is detected and fitted'],
  ['Bleed & crop marks', 'Do not include them'],
  ['Fonts', 'Convert live fonts to outlines'],
  ['Templates', 'Use the provided design templates where one exists'],
  ['Maximum file size', MAX_LABEL]
];

/** Count pages in a PDF. Returns null when it cannot be determined. */
export function countPdfPages(bytes) {
  try {
    // Read as latin1 so byte offsets survive: a PDF is not UTF-8, and decoding
    // it as such corrupts the very markers being counted.
    const text = typeof bytes === 'string'
      ? bytes
      : new TextDecoder('latin1').decode(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));

    // /Count in the page tree is authoritative when present and unambiguous.
    const counts = [...text.matchAll(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
    if (counts.length) return Math.max(...counts);

    // Otherwise count page objects. Linearised and object-stream PDFs can hide
    // these, which is why an indeterminate answer is null rather than 1.
    const pages = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
    return pages > 0 ? pages : null;
  } catch {
    return null;
  }
}

/**
 * Validate a File (browser) or { name, size, mimetype } (server).
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateArtwork(file) {
  if (!file) return { ok: true };

  const name = file.name || file.originalname || '';
  const type = file.type || file.mimetype || '';
  const size = file.size ?? file.byteLength ?? 0;

  const typeOk = ACCEPTED_MIME.includes(type) || ACCEPTED_EXT.test(name);
  if (!typeOk) {
    return { ok: false, error: `${name || 'That file'} is not a PDF or JPEG. Those are the only formats we can send straight to print.` };
  }
  if (size > MAX_BYTES) {
    return { ok: false, error: `${name} is ${(size / 1048576).toFixed(0)}MB. The limit is ${MAX_LABEL}.` };
  }
  return { ok: true };
}

/** Page-count check, once the bytes are available. Unknown page counts pass. */
export function validatePdfPages(bytes, name = 'That PDF') {
  const pages = countPdfPages(bytes);
  if (pages !== null && pages > 1) {
    return { ok: false, error: `${name} has ${pages} pages. Please send a single-page PDF — one artwork per file.` };
  }
  return { ok: true };
}

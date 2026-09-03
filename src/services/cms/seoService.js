// Per-route SEO values for the client.
//
// The authoritative copy of a page's SEO is in the HTML the prerenderer wrote —
// that is what crawlers read, and it is already in the document before React
// mounts. This service reads it back from the live document rather than
// re-fetching, so the client can never disagree with what was served.
//
// useDocumentMeta() is what SETS these during client navigation; this is the
// read side, for components that need to know the current values.

const meta = (selector, attr = 'content') =>
  (typeof document !== 'undefined' && document.querySelector(selector)?.getAttribute(attr)) || null;

export function current() {
  if (typeof document === 'undefined') return null;
  return {
    title: document.title || null,
    description: meta('meta[name="description"]'),
    canonical: meta('link[rel="canonical"]', 'href'),
    robots: meta('meta[name="robots"]'),
    ogTitle: meta('meta[property="og:title"]'),
    ogDescription: meta('meta[property="og:description"]'),
    ogImage: meta('meta[property="og:image"]'),
    h1: (typeof document !== 'undefined' && document.querySelector('h1')?.textContent?.trim()) || null
  };
}

/** Structured data blocks currently on the page, parsed. Malformed blocks are
 *  skipped rather than thrown, so one bad block cannot break a caller. */
export function structuredData() {
  if (typeof document === 'undefined') return [];
  return [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((el) => { try { return JSON.parse(el.textContent); } catch { return null; } })
    .filter(Boolean)
    .flatMap((node) => (Array.isArray(node) ? node : [node]));
}

/** True when the current page asks search engines not to index it. */
export function isNoindex() {
  return /noindex/i.test(meta('meta[name="robots"]') || '');
}

export default { current, structuredData, isNoindex };

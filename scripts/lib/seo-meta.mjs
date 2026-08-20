// Shared, testable metadata replacement for the prerenderer.
//
// CRITICAL: every replacement uses a FUNCTION replacer, never a `$1…$2`
// replacement string. When the replacement is a string, JavaScript interprets
// `$n` sequences as capture-group references — so a value like "from $140."
// turns "$1" into capture group 1 (the tag prefix) followed by "40", corrupting
// the tag into `content="<meta name="description" content="40."`. A function
// replacer returns its string verbatim, so "$" is never special.

export const escAttr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const setAttr = (html, re, value) =>
  html.replace(re, (_m, p1, p2) => p1 + escAttr(value) + p2);

// Replace the single head tags with per-route values. Only fields that are
// provided (non-null/undefined) are touched.
export function applyMeta(html, { title, description, canonical, url } = {}) {
  if (title != null) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escAttr(title)}</title>`);
    html = setAttr(html, /(<meta property="og:title" content=")[\s\S]*?(")/, title);
  }
  if (description != null) {
    html = setAttr(html, /(<meta name="description" content=")[\s\S]*?(")/, description);
    html = setAttr(html, /(<meta property="og:description" content=")[\s\S]*?(")/, description);
  }
  if (canonical != null) html = setAttr(html, /(<link rel="canonical" href=")[\s\S]*?(")/, canonical);
  if (url != null) html = setAttr(html, /(<meta property="og:url" content=")[\s\S]*?(")/, url);
  return html;
}

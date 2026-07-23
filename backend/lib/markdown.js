// Markdown → sanitized HTML, server-side only (API + prerender, both Node).
// The browser never renders markdown — it receives already-clean HTML — so no
// sanitizer ships in the client bundle. Blog bodies are admin-authored, but we
// sanitize anyway: an editor account is not a licence for stored XSS.

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: false });

const OPTS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'blockquote',
    'strong', 'em', 'code', 'pre', 'hr', 'br', 'img', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'figure', 'figcaption', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'loading'],
    '*': ['class']
  },
  // Only http(s), protocol-relative, and mailto — blocks javascript:/data: URIs.
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // External links open safely; internal ones stay in-tab.
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      const external = /^https?:\/\//i.test(href);
      return {
        tagName: 'a',
        attribs: external
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' }
          : attribs
      };
    },
    img: (tagName, attribs) => ({ tagName: 'img', attribs: { ...attribs, loading: 'lazy' } })
  }
};

export function renderMarkdown(md) {
  if (!md) return '';
  return sanitizeHtml(marked.parse(String(md)), OPTS);
}

// First ~N chars of plain text, for auto-excerpts and meta descriptions.
export function excerptFromMarkdown(md, max = 160) {
  const text = sanitizeHtml(marked.parse(String(md || '')), { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

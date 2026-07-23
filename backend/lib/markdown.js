// Markdown → sanitized HTML, server-side only (API + prerender, both Node).
// The browser never renders markdown — it receives already-clean HTML — so no
// sanitizer ships in the client bundle. Blog bodies are admin-authored, but we
// sanitize anyway: an editor account is not a licence for stored XSS.
//
// Uses markdown-it (CommonJS), NOT marked: Vercel bundles the serverless
// function to CommonJS, and marked v18 is ESM-only, so a compiled require()
// of it throws ERR_REQUIRE_ESM and takes down the entire API. markdown-it is
// CJS and bundles cleanly. `html: false` also escapes raw HTML in the source,
// so sanitize-html is defence-in-depth over an already-safe pipeline.

import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: false });

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

export function renderMarkdown(source) {
  if (!source) return '';
  return sanitizeHtml(md.render(String(source)), OPTS);
}

// First ~N chars of plain text, for auto-excerpts and meta descriptions.
export function excerptFromMarkdown(source, max = 160) {
  const text = sanitizeHtml(md.render(String(source || '')), { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

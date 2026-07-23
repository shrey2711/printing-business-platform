// Markdown → safe HTML, server-side only (API + prerender, both Node).
//
// markdown-it with `html: false` is XSS-safe on its own: it escapes ALL raw
// HTML in the source and refuses to build links/images with dangerous protocols
// (javascript:, data:, vbscript:) — leaving them as inert text. Verified against
// script / img-onerror / onclick / svg-onload / js-image / data-uri payloads.
//
// We deliberately DON'T use sanitize-html: it pulls in htmlparser2, which went
// ESM-only, and Vercel runs node_modules un-bundled — so a CJS require() of an
// ESM dependency throws ERR_REQUIRE_ESM at load and takes down the whole API.
// markdown-it is CommonJS with only CJS dependencies, so it loads everywhere.

import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false, typographer: false });

// Open external links safely in a new tab; leave internal links in-tab.
const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || '';
  if (/^https?:\/\//i.test(href)) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer nofollow');
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

// Lazy-load images.
const defaultImage =
  md.renderer.rules.image ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('loading', 'lazy');
  return defaultImage(tokens, idx, options, env, self);
};

export function renderMarkdown(source) {
  if (!source) return '';
  return md.render(String(source));
}

// First ~N chars of plain text, for auto-excerpts and meta descriptions.
export function excerptFromMarkdown(source, max = 160) {
  // Render, then strip tags to plain text.
  const text = md
    .render(String(source || ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

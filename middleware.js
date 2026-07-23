// Vercel Edge Middleware: dashboard-managed redirects.
//
// Rules live in the `redirects` table and are baked into
// src/generated/redirects.js at build time (by scripts/prerender.mjs), so this
// runs with zero per-request DB calls. A redirect change triggers a rebuild
// (same model as blog/SEO), which regenerates the module.
//
// Runs at the edge before routing, so it issues a real 301/302/308 — unlike a
// client-side redirect, this preserves SEO signal and works for crawlers.

import { redirects } from './src/generated/redirects.js';

// Skip assets and API — only page routes should be considered for redirects.
export const config = {
  matcher: ['/((?!api/|assets/|favicon|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)']
};

const bySource = new Map(redirects.map((r) => [r.source.replace(/\/$/, '') || '/', r]));

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const rule = bySource.get(path);
  if (!rule) return; // continue to normal routing

  const destination = /^https?:\/\//i.test(rule.destination)
    ? rule.destination
    : new URL(rule.destination, url.origin).toString();

  return Response.redirect(destination, rule.code || 301);
}

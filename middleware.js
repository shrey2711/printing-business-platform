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

// Built-in permanent redirects for removed routes, independent of the DB table
// (so they survive even if the redirects table is empty). The Design Studio was
// removed — /design must not serve a duplicate of the homepage.
const BUILT_IN = [
  { source: '/design', destination: '/artwork-guidelines', code: 301 },
  // Table covers split into Pleated + Stretch products; send the old single
  // product URL to the category page that lists both.
  { source: '/products/table-covers', destination: '/table-covers', code: 301 }
];

// DB-managed rules can still override a built-in source if ever needed.
const bySource = new Map(
  [...BUILT_IN, ...redirects].map((r) => [r.source.replace(/\/$/, '') || '/', r])
);

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

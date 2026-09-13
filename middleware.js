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
import { SEO_CITIES } from './src/data/citySeo.js';
import { KNOWN_ROUTES, STATIC_FILES } from './src/generated/routes.js';

// Skip the API and the three directories that hold real static files:
// /assets (hashed build output), /images and /templates.
//
// This used to exclude every path ending in a file extension, which was a hole:
// an unknown /anything.html never reached the 404 below, fell through to the SPA
// rewrite, and came back HTTP 200 with the full homepage. Google calls that a
// soft 404. It mattered here because this domain had a previous life as an
// affiliate site whose URLs all ended in .html — every one of those was
// answering 200 instead of telling Google it was gone.
//
// Extensions now reach the middleware, and STATIC_FILES (generated from the
// build) says which root-level files are real.
export const config = {
  matcher: ['/((?!api/|assets/|images/|templates/|\\.well-known/).*)']
};

// Built-in permanent redirects for removed routes, independent of the DB table
// (so they survive even if the redirects table is empty). The Design Studio was
// removed — /design must not serve a duplicate of the homepage.
const BUILT_IN = [
  { source: '/design', destination: '/artwork-guidelines', code: 301 },
  // Table covers split into Pleated + Stretch products; send the old single
  // product URL to the category page that lists both.
  { source: '/products/table-covers', destination: '/table-covers', code: 301 },
  // Dormant legacy products (active:false) still resolve via the SPA — thin
  // duplicates. Consolidate each to its live category so any historical
  // authority (e.g. the previously-indexed /products/canopy-tents) is preserved.
  { source: '/products/canopy-tents', destination: '/custom-canopies', code: 301 },
  { source: '/products/canopy-packages', destination: '/custom-canopies', code: 301 },
  { source: '/products/canopy-replacement-tops', destination: '/custom-canopies', code: 301 },
  { source: '/products/canopy-sidewalls', destination: '/custom-canopies', code: 301 },
  { source: '/products/canopy-accessories', destination: '/custom-canopies', code: 301 },
  { source: '/products/retractable-banner-stands', destination: '/banner-stands', code: 301 },
  // Old full-print catalog (never part of the canopy store) — send to the catalog.
  { source: '/products/vinyl-banners', destination: '/products', code: 301 },
  { source: '/products/mesh-banners', destination: '/products', code: 301 },
  { source: '/products/fabric-banners', destination: '/products', code: 301 },
  { source: '/products/yard-signs', destination: '/products', code: 301 },
  { source: '/products/rigid-signs', destination: '/products', code: 301 },
  { source: '/products/decals-stickers', destination: '/products', code: 301 },
  { source: '/products/feather-flags', destination: '/products', code: 301 }
];

// Option-A consolidation: the /trade-show-canopies/[city] pages are the
// canonical local canopy pages, so the old /locations/[state]/[city] canopy
// pages 301 into them. The bare /trade-show-canopies path goes to the canopy
// category.
const CITY_REDIRECTS = [
  { source: '/trade-show-canopies', destination: '/custom-canopies', code: 301 },
  ...SEO_CITIES.filter((c) => c.stateSlug).map((c) => ({
    source: `/locations/${c.stateSlug}/${c.slug}`,
    destination: `/trade-show-canopies/${c.slug}`,
    code: 301
  }))
];

// DB-managed rules can still override a built-in source if ever needed.
const bySource = new Map(
  [...BUILT_IN, ...CITY_REDIRECTS, ...redirects].map((r) => [r.source.replace(/\/$/, '') || '/', r])
);

// Minimal branded 404 body (self-contained, noindex) returned with a real 404
// status for unknown page routes.
function notFoundHtml(origin) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page not found — Apex Trade Show</title><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;color:#0b1f4d;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center}.b{background:#fff;border:1px solid #e4e9f2;border-radius:14px;padding:44px 36px;max-width:460px;margin:16px}h1{font-size:56px;margin:0;color:#ED1C24}h2{font-size:22px;margin:6px 0 10px}p{color:#6b7480;line-height:1.6}a{display:inline-block;margin:6px;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:700}.r{background:#ED1C24;color:#fff}.o{border:1px solid #e4e9f2;color:#0b1f4d}</style></head><body><div class="b"><h1>404</h1><h2>Page not found</h2><p>That page doesn't exist or may have moved. Let's get you back on track.</p><a class="r" href="${origin}/">Home</a><a class="o" href="${origin}/products">Shop products</a></div></body></html>`;
}

export default function middleware(request) {
  const url = new URL(request.url);

  // Enforce the canonical host: apex (non-www) -> www, preserving path + query,
  // as a 301. Guarded to the production apex domain only, so preview
  // (*.vercel.app) and localhost are untouched. HTTP->HTTPS is handled by Vercel.
  if (url.hostname === 'apextradeshow.com') {
    url.hostname = 'www.apextradeshow.com';
    return Response.redirect(url.toString(), 301);
  }

  const path = url.pathname.replace(/\/$/, '') || '/';

  // 1) Redirects (301/308) win first.
  const rule = bySource.get(path);
  if (rule) {
    const destination = /^https?:\/\//i.test(rule.destination)
      ? rule.destination
      : new URL(rule.destination, url.origin).toString();
    return Response.redirect(destination, rule.code || 301);
  }

  // 2) A path carrying a file extension is either a real root-level file
  //    (favicon, robots.txt, a sitemap, feed.xml) or it is junk. Serve the
  //    first, 404 the second. Asset directories never get here — the matcher
  //    excludes them — so this list only has to cover the root of the build.
  if (/\.[A-Za-z0-9]+$/.test(path)) {
    if (STATIC_FILES.has(path)) return;
    return new Response(notFoundHtml(url.origin), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, follow' }
    });
  }

  // 3) Real 404 for unknown page routes. Without this the SPA rewrite serves
  //    index.html (HTTP 200) for every path — a soft-404 that hurts SEO.
  if (!KNOWN_ROUTES.has(path)) {
    return new Response(notFoundHtml(url.origin), {
      status: 404,
      headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, follow' }
    });
  }

  // 4) Known route → continue to normal routing (prerendered HTML + SPA).
  return;
}

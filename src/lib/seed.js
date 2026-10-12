// Data the prerenderer embeds in a page (`<script id="seo-seed">`), so a product
// or blog page can render its real content on the very first paint instead of a
// "Loading…" placeholder while it waits for /api. A crawler that snapshots the
// page before that request returns used to see the same empty shell on many
// URLs, and Search Console reported them as duplicates of each other.
//
// The seed is only used for the page it was written for (kind + slug + path), so
// it can never leak into a different route. Callers still refetch afterwards;
// the seed is a first paint, not the source of truth.

let parsed; // undefined = not read yet, null = none / unreadable

export function readSeed(kind, slug) {
  if (typeof document === 'undefined') return null;
  if (parsed === undefined) {
    try {
      const el = document.getElementById('seo-seed');
      parsed = el ? JSON.parse(el.textContent) : null;
    } catch {
      parsed = null;
    }
  }
  if (!parsed || parsed.kind !== kind || parsed.slug !== slug) return null;
  if (parsed.path !== window.location.pathname) return null;
  return parsed.data || null;
}

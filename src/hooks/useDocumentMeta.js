import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { brand } from '../config/brand';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Track the initial page path so hydration never overwrites server-rendered
// <title>, <meta description> or duplicates the server-rendered JSON-LD graph.
let initialPath =
  typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/$/, '') || '/'
    : null;

// Per-page SEO: sets a unique <title>, description, canonical URL, Open Graph /
// Twitter tags, and optional JSON-LD structured data. Canonical/OG URLs use the
// live origin so they stay correct on any custom domain.
export default function useDocumentMeta(title, description, jsonLd, robots, canonical) {
  const { pathname } = useLocation();

  useEffect(() => {
    const currentPath = pathname.replace(/\/$/, '') || '/';

    // On initial page load/hydration, the server/prerendered HTML already has the
    // authoritative, audited <title>, <meta description>, canonical, and JSON-LD.
    // Overwriting them on mount introduces a hydration race where client fallbacks
    // undo server fixes, and appending JSON-LD duplicates the entire graph.
    if (initialPath && currentPath === initialPath) {
      // If robots is explicitly noindex (e.g. auth/cart pages), ensure it's honored.
      if (robots) {
        upsertMeta('name', 'robots', robots);
      }
      return;
    }

    // Once the user navigates away from the initial landing page, all subsequent
    // route changes are client navigations that need document updates.
    initialPath = null;

    // `title === false` means "this component is embedded in a page that owns
    // the document head". Not the same as no title: passing null still resets
    // the title to the brand default, which would wipe the host page's.
    if (title === false) return;
    // A title already containing " | " is a complete title (its own suffix) —
    // pass it through; otherwise append the brand.
    const fullTitle = title
      ? (title.includes(' | ') ? title : `${title} | ${brand.name}`)
      : `${brand.name} — ${brand.tagline}`;
    document.title = fullTitle;

    const url = window.location.origin + pathname;
    // A page may canonicalise to another URL (duplicate-topic consolidation);
    // otherwise the canonical is the page itself.
    const canonicalUrl = canonical
      ? (/^https?:/.test(canonical) ? canonical : window.location.origin + canonical)
      : url;
    upsertLink('canonical', canonicalUrl); // overrides the static homepage canonical per page
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', fullTitle);

    // Robots: set noindex on templated pages; clear it when moving to an indexable one.
    const robotsEl = document.head.querySelector('meta[name="robots"]');
    if (robots) upsertMeta('name', 'robots', robots);
    else if (robotsEl) robotsEl.remove();

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    // Optional per-page structured data (Product, BreadcrumbList, …).
    const existing = document.getElementById('page-jsonld');
    if (jsonLd) {
      const el = existing || document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'page-jsonld';
      el.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(el);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, pathname, jsonLd, robots, canonical]);
}

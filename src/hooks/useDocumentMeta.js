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

// Per-page SEO: sets a unique <title>, description, canonical URL, Open Graph /
// Twitter tags, and optional JSON-LD structured data. Canonical/OG URLs use the
// live origin so they stay correct on any custom domain.
export default function useDocumentMeta(title, description, jsonLd, robots) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${brand.name}` : `${brand.name} — ${brand.tagline}`;
    document.title = fullTitle;

    const url = window.location.origin + pathname;
    upsertLink('canonical', url); // overrides the static homepage canonical per page
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
  }, [title, description, pathname, jsonLd]);
}

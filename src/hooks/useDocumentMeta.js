import { useEffect } from 'react';

// Lightweight per-page SEO: sets the document <title> and meta description.
// (Google renders client-side JS, so these are picked up for indexing.)
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | PrintUSA` : 'PrintUSA — Wholesale Banners, Signs & Displays';
    document.title = fullTitle;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);
}

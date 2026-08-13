import { useState, useEffect } from 'react';

// Real-photo gallery for a product: one large active image plus a thumbnail
// strip. Used when a product supplies a `gallery` array of image paths.
export default function ProductGallery({ images = [], label }) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [images]);

  if (!images.length) return null;

  // Accept plain strings or { src, alt } objects. Per-image alt text (when
  // supplied) describes each specific view for accessibility + image SEO.
  const items = images.map((it) =>
    typeof it === 'string' ? { src: it, alt: label } : { src: it.src, alt: it.alt || label }
  );

  return (
    <div className="pgallery">
      <div className="pgallery-main">
        <img src={items[active].src} alt={items[active].alt || 'Product photo'} decoding="async" />
      </div>
      {items.length > 1 && (
        <div className="pgallery-thumbs">
          {items.map((it, i) => (
            <button
              type="button"
              key={it.src}
              className={`pgallery-thumb ${i === active ? 'is-active' : ''}`}
              aria-label={it.alt || `View photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <img src={it.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

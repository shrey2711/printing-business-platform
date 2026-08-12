import { useState, useEffect } from 'react';

// Real-photo gallery for a product: one large active image plus a thumbnail
// strip. Used when a product supplies a `gallery` array of image paths.
export default function ProductGallery({ images = [], label }) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [images]);

  if (!images.length) return null;

  return (
    <div className="pgallery">
      <div className="pgallery-main">
        <img src={images[active]} alt={label || 'Product photo'} decoding="async" />
      </div>
      {images.length > 1 && (
        <div className="pgallery-thumbs">
          {images.map((src, i) => (
            <button
              type="button"
              key={src}
              className={`pgallery-thumb ${i === active ? 'is-active' : ''}`}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

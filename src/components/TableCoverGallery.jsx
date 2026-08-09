import { useState, useEffect } from 'react';
import ProductArt from './ProductArt';

// Image gallery for the Table Covers product: a large main image plus a
// thumbnail strip of every table-cover photo. Thumbnails whose file is missing
// hide themselves; the main image falls back to ProductArt. Files live in
// public/images/table-covers/.
const GALLERY = [
  { key: 'pleated', label: 'Pleated table cover' },
  { key: 'stretch', label: 'Stretch table cover' },
  { key: 'plain', label: 'Plain closed-back table cover' },
  { key: 'fitted', label: 'Fitted table cover' },
  { key: 'runner', label: 'Table runner' },
  { key: 'round', label: 'Round table cover' }
];
const src = (key) => `/images/table-covers/${key}.webp`;

export default function TableCoverGallery({ style }) {
  // Start on the image matching the selected style (pleated / stretch).
  const initial = String(style || '').includes('stretch') ? 'stretch' : 'pleated';
  const [active, setActive] = useState(initial);
  const [hidden, setHidden] = useState({}); // thumbs whose file 404s
  const [mainBroken, setMainBroken] = useState(false);

  // Follow the style selection until the user clicks a thumbnail themselves.
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!touched) setActive(initial);
  }, [initial, touched]);
  useEffect(() => setMainBroken(false), [active]);

  const visible = GALLERY.filter((g) => !hidden[g.key]);

  return (
    <div className="tc-gallery">
      <div className="tc-main">
        {mainBroken ? (
          <ProductArt slug="table-covers" />
        ) : (
          <img
            className="tent-photo"
            src={src(active)}
            alt={`Custom printed ${active} table cover`}
            width="1200"
            height="900"
            loading="lazy"
            decoding="async"
            onError={() => setMainBroken(true)}
          />
        )}
      </div>
      {visible.length > 1 && (
        <div className="tc-thumbs">
          {visible.map((g) => (
            <button
              type="button"
              key={g.key}
              className={`tc-thumb ${g.key === active ? 'is-active' : ''}`}
              aria-label={g.label}
              aria-pressed={g.key === active}
              onClick={() => { setActive(g.key); setTouched(true); }}
            >
              <img
                src={src(g.key)}
                alt={g.label}
                loading="lazy"
                decoding="async"
                onError={() => setHidden((h) => ({ ...h, [g.key]: true }))}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import TentPhoto from './TentPhoto';

// Product-page gallery for canopy tents: a large main image plus a thumbnail
// strip. The first thumb is the LIVE configurable preview (updates with the
// wall/sandbag selection); the rest are additional static photos (the
// "customize every side" infographic, the sandbags shot). Thumbs whose file is
// missing hide themselves.
export default function TentGallery({ size, fullWalls, halfWalls, walls, sandbags, label }) {
  const extras = [
    { key: 'info', src: `/images/tents/${size}-infographic.webp`, label: 'Customize every side' },
    { key: 'sand', src: '/images/tents/sandbags.webp', label: 'With leg sandbags' }
  ];
  const [active, setActive] = useState('live'); // 'live' or an extra key
  const [hidden, setHidden] = useState({});

  // Back to the live preview whenever the product/size changes.
  useEffect(() => setActive('live'), [size]);

  const live = (
    <TentPhoto size={size} fullWalls={fullWalls} halfWalls={halfWalls} walls={walls} sandbags={sandbags} label={label} />
  );
  const activeExtra = extras.find((e) => e.key === active && !hidden[e.key]);
  const visibleExtras = extras.filter((e) => !hidden[e.key]);

  return (
    <div className="tent-gallery">
      <div className="tent-gallery-main">
        {activeExtra ? (
          <img className="tent-photo" src={activeExtra.src} alt={activeExtra.label} loading="lazy" decoding="async" />
        ) : (
          live
        )}
      </div>
      <div className="tent-thumbs">
        <button
          type="button"
          className={`tent-thumb ${active === 'live' ? 'is-active' : ''}`}
          onClick={() => setActive('live')}
          aria-label="Live preview"
          aria-pressed={active === 'live'}
        >
          {live}
        </button>
        {visibleExtras.map((e) => (
          <button
            type="button"
            key={e.key}
            className={`tent-thumb ${active === e.key ? 'is-active' : ''}`}
            onClick={() => setActive(e.key)}
            aria-label={e.label}
            aria-pressed={active === e.key}
          >
            <img src={e.src} alt={e.label} loading="lazy" decoding="async" onError={() => setHidden((h) => ({ ...h, [e.key]: true }))} />
          </button>
        ))}
      </div>
    </div>
  );
}

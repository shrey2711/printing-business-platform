import { useState } from 'react';
import { getColorways } from '../data/colorways';

// Shows alternate-color product mockups when their image files exist in
// public/images/colorways/. Each thumbnail starts hidden and only reveals once
// its image actually loads (onLoad), so a not-yet-uploaded colorway simply never
// appears — no broken images, no code change to activate one. The whole strip
// stays hidden until at least one image loads.
export default function ColorwayStrip({ slug }) {
  const items = getColorways(slug);
  const [loaded, setLoaded] = useState({});
  if (!items.length) return null;
  const anyLoaded = items.some((i) => loaded[i.file]);

  return (
    <div className="colorways" style={{ display: anyLoaded ? undefined : 'none' }}>
      <h3 className="colorways-title">Also available in</h3>
      <div className="colorway-row">
        {items.map((i) => (
          <figure
            className="colorway"
            key={i.file}
            style={{ display: loaded[i.file] ? undefined : 'none' }}
          >
            <img
              src={`/images/colorways/${i.file}`}
              alt={`${i.label} colorway`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded((s) => ({ ...s, [i.file]: true }))}
            />
            <figcaption>{i.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

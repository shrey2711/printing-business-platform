import { Link } from 'react-router-dom';
import { states, regions } from '../data/states';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function LocationsPage() {
  useDocumentMeta(
    'Custom Printing Across the USA — All 50 States',
    'PrintUSA ships custom banners, signs, flags and displays to all 50 states. Find your state for local printing with instant online pricing and fast delivery.'
  );

  return (
    <main className="page">
      <section className="section-head">
        <span className="eyebrow">Nationwide · All 50 states</span>
        <h1>Custom Printing Across the USA</h1>
        <p>We ship custom banners, signs, flags and displays to every state. Pick yours for local details, or just start pricing — we deliver nationwide.</p>
      </section>

      {regions.map((region) => (
        <section className="section-block-bare" key={region}>
          <h2 className="section-title">{region}</h2>
          <div className="loc-grid">
            {states.filter((s) => s.region === region).map((s) => (
              <Link className="loc-chip" to={`/locations/${s.slug}`} key={s.slug}>
                <span className="loc-abbr">{s.abbr}</span>
                <span>{s.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

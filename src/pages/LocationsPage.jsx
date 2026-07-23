import { Link } from 'react-router-dom';
import { territories, regions } from '../data/states';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function LocationsPage() {
  useDocumentMeta(
    'Custom Canopy Tents Across the US & Canada',
    'Custom printed canopy tents shipped to every US state and Canadian province, with instant online pricing in USD or CAD.'
  );

  return (
    <main className="page">
      <section className="section-head">
        <span className="eyebrow">United States &amp; Canada</span>
        <h1>Custom Canopy Tents Across North America</h1>
        <p>
          We ship printed canopy tents, walls and accessories to every US state and Canadian
          province, priced in USD or CAD. Pick your area for local details, or start pricing now.
        </p>
      </section>

      {regions.map((region) => {
        const inRegion = territories.filter((s) => s.region === region);
        if (!inRegion.length) return null;
        return (
          <section className="section-block-bare" key={region}>
            <h2 className="section-title">{region}</h2>
            <div className="loc-grid">
              {inRegion.map((s) => (
                <Link className="loc-chip" to={`/locations/${s.slug}`} key={s.slug}>
                  <span className="loc-abbr">{s.abbr}</span>
                  <span>{s.name}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

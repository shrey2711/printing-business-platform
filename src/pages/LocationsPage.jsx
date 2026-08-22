import { Link } from 'react-router-dom';
import { territories, regions } from '../data/states';
import { SEO_CITIES } from '../data/citySeo';
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

      <section className="section-block-bare">
        <h2 className="section-title">Popular cities</h2>
        <p className="muted" style={{ marginTop: '-0.4rem', marginBottom: '0.9rem' }}>
          Trade show displays printed and shipped to major convention cities — with local venue, industry and shipping details.
        </p>
        <div className="loc-grid">
          {SEO_CITIES.map((c) => (
            <Link className="loc-chip" to={`/trade-show-displays/${c.slug}`} key={c.slug}>
              <span className="loc-abbr">{c.abbr}</span>
              <span>{c.city}</span>
            </Link>
          ))}
        </div>
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

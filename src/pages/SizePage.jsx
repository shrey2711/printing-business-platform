import { Link, useParams } from 'react-router-dom';
import { SIZES, getSize } from '../data/canopy';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';

// INFORMATIONAL size guide. Mirrors the prerendered /sizes/<slug> HTML in
// scripts/prerender.mjs so crawler and hydrated app match. Deliberately NOT a
// second commercial page for the size — it hands off to /products/<product>.
export default function SizePage() {
  const { size: slug } = useParams();
  const size = getSize(slug);

  useDocumentMeta(
    size ? size.guide.title : 'Canopy tent size guides',
    size ? size.guide.metaDescription : undefined
  );

  if (!size) {
    return (
      <main className="page">
        <p className="muted">We don't have a guide for that size.</p>
        <Link className="btn btn-outline" to="/products">See available sizes</Link>
      </main>
    );
  }

  const g = size.guide;
  const others = SIZES.filter((s) => s.slug !== size.slug);

  return (
    <main className="page">
      <Link className="back-link" to="/custom-canopies">← All canopies</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">{size.slug} size guide</span>
          <h1>{g.title}</h1>
          <p className="lead">{size.blurb}</p>
          <p>{g.footprint}</p>
          <div className="hero-actions">
            <Link className="btn btn-red" to={`/products/${size.product}`}>
              Shop the {size.label} canopy tent
            </Link>
          </div>
        </div>
        <div className="landing-art">
          <TentPhoto size={size.slug} walls={1} label={`${size.label} canopy tent`} />
        </div>
      </div>

      <section className="steps-section">
        <div className="section-head">
          <h2>How many tables and people fit</h2>
        </div>
        <ul className="guide-list">
          {g.capacity.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>Booth layout ideas</h2>
        </div>
        <ul className="guide-list">
          {g.layouts.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>Wall options for a {size.label}</h2>
        </div>
        <p className="muted">
          Add up to 3 printed walls, in any mix of full-height and half-height (both cost the same per
          wall) — for shade, a printed backdrop, weather protection and privacy while keeping the front
          open. You can also print the canopy top and valance, and choose standard 6–8 day or rush
          2–3 day production.
        </p>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>Common uses for a {size.label}</h2>
        </div>
        <ul className="guide-list">
          {g.uses.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>{size.slug} vs other sizes</h2>
        </div>
        <p className="muted">{g.comparison}</p>
        <div className="size-grid">
          {others.map((s) => (
            <Link className="size-card" to={`/sizes/${s.slug}`} key={s.slug}>
              <TentPhoto size={s.slug} walls={1} label={`${s.label} canopy`} />
              <div className="size-card-body">
                <strong>{s.slug} size guide</strong>
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="turnaround-band">
        <p className="turn-main">Ready to order your {size.label} canopy tent?</p>
        <p className="turn-sub">Configure walls, print and delivery and see the price update live.</p>
        <Link className="btn btn-red" to={`/products/${size.product}`}>
          Shop the {size.label} Custom Canopy Tent
        </Link>
      </section>
    </main>
  );
}

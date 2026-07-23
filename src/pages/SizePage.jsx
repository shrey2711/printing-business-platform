import { Link, useParams } from 'react-router-dom';
import { SIZES, SOLUTIONS, getSize } from '../data/canopy';
import CanopyPreview from '../components/CanopyPreview';
import useDocumentMeta from '../hooks/useDocumentMeta';

const configurable = [
  { title: 'Frame grade', copy: 'Steel economy, commercial aluminium, or heavy-duty hex for constant setups.' },
  { title: 'Print coverage', copy: 'Canopy top, top plus valance, or top, valance and the inside as well.' },
  { title: 'Walls', copy: 'Full, half, mesh, zippered door and rail skirts — up to four per tent.' },
  { title: 'Accessories', copy: 'Weight bags, stake kits, wheeled carry bags and LED lighting.' }
];

export default function SizePage() {
  const { size: slug } = useParams();
  const size = getSize(slug);

  useDocumentMeta(
    size ? `${size.slug} Custom Canopy Tent — Instant Pricing` : 'Canopy tent sizes',
    size ? `Custom printed ${size.label} pop-up canopy tent with instant online pricing.` : undefined
  );

  if (!size) {
    return (
      <main className="page">
        <p className="muted">We don't print that size.</p>
        <Link className="btn btn-outline" to="/products/canopy-tents">See available sizes</Link>
      </main>
    );
  }

  const others = SIZES.filter((s) => s.slug !== size.slug);

  return (
    <main className="page">
      <Link className="back-link" to="/products">← All products</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">Canopy tent size</span>
          <h1>{size.label} Custom Printed Canopy Tent</h1>
          <p className="lead">{size.blurb}</p>
          <p>
            Printed to order in full colour with your choice of frame grade and print coverage, and
            priced instantly — pick your options and the total updates as you go.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-red" to="/products/canopy-tents">Configure a {size.label} tent</Link>
            <Link className="btn btn-outline" to="/products/canopy-packages">See packages</Link>
          </div>
        </div>
        <div className="landing-art">
          <CanopyPreview size={size.slug} print="top-valance" walls={1} label={`${size.label} canopy tent`} />
        </div>
      </div>

      <section className="steps-section">
        <div className="section-head">
          <h2>What you can configure</h2>
        </div>
        <div className="frame-grid">
          {configurable.map((c) => (
            <article className="frame-card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>Other sizes</h2>
        </div>
        <div className="size-grid">
          {others.map((s) => (
            <Link className="size-card" to={`/sizes/${s.slug}`} key={s.slug}>
              <CanopyPreview size={s.slug} print="top" walls={0} label={`${s.label} canopy`} />
              <div className="size-card-body">
                <strong>{s.label}</strong>
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="solutions-section">
        <div className="section-head">
          <h2>Common uses for a {size.label}</h2>
        </div>
        <div className="solutions-grid">
          {SOLUTIONS.slice(0, 6).map((s) => (
            <Link className="solution-card" to={`/solutions/${s.slug}`} key={s.slug}>
              <strong>{s.title}</strong>
              <p>{s.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

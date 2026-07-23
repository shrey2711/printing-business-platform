import { Link, useParams } from 'react-router-dom';
import { SIZES, SOLUTIONS, getSolution } from '../data/canopy';
import CanopyPreview from '../components/CanopyPreview';
import useDocumentMeta from '../hooks/useDocumentMeta';

const whatToOrder = [
  { to: '/products/canopy-tents', title: 'Custom printed canopy tent', copy: 'Configure size, frame, print coverage and walls from scratch.' },
  { to: '/products/canopy-packages', title: 'Canopy packages', copy: 'Tent, walls and weights bundled below the à-la-carte price.' },
  { to: '/products/canopy-sidewalls', title: 'Sidewalls', copy: 'Add weather protection, privacy and more branding surface.' },
  { to: '/products/canopy-accessories', title: 'Accessories', copy: 'Weights, stakes, wheeled bags and LED lighting.' }
];

export default function SolutionPage() {
  const { useCase } = useParams();
  const solution = getSolution(useCase);

  useDocumentMeta(
    solution ? `${solution.title} — Custom Printed` : 'Canopy tent solutions',
    solution?.blurb
  );

  if (!solution) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that page.</p>
        <Link className="btn btn-outline" to="/products/canopy-tents">Browse canopy tents</Link>
      </main>
    );
  }

  const others = SOLUTIONS.filter((s) => s.slug !== solution.slug);

  return (
    <main className="page">
      <Link className="back-link" to="/products">← All products</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">Canopy tents for</span>
          <h1>{solution.title}</h1>
          <p className="lead">{solution.blurb}</p>
          <p>
            Every tent is printed to order, so the size, frame and print coverage are chosen to match
            how often it goes up and how much branding you need.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-red" to="/products/canopy-tents">Build your canopy</Link>
            <Link className="btn btn-outline" to="/quote">Ask about bulk orders</Link>
          </div>
        </div>
        <div className="landing-art">
          <CanopyPreview size="10x10" print="top-valance" walls={2} label={solution.title} />
        </div>
      </div>

      <section className="steps-section">
        <div className="section-head">
          <h2>Choose a size</h2>
        </div>
        <div className="size-grid">
          {SIZES.map((s) => (
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

      <section className="steps-section">
        <div className="section-head">
          <h2>What to order</h2>
        </div>
        <div className="frame-grid">
          {whatToOrder.map((w) => (
            <Link className="frame-card" to={w.to} key={w.to}>
              <h3>{w.title}</h3>
              <p>{w.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="solutions-section">
        <div className="section-head">
          <h2>Other uses</h2>
        </div>
        <div className="solutions-grid">
          {others.map((s) => (
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

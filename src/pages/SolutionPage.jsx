import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SIZES, SOLUTIONS, getSolution } from '../data/canopy';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';

const sizeKey = (slug) => slug.replace('canopy-tent-', '');

export default function SolutionPage() {
  const { useCase } = useParams();
  const solution = getSolution(useCase);
  const [products, setProducts] = useState([]);

  useDocumentMeta(
    solution ? `${solution.title} — Custom Printed` : 'Canopy tent solutions',
    solution?.guide?.metaDescription
  );

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!solution) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that page.</p>
        <Link className="btn btn-outline" to="/custom-canopies">Browse canopies</Link>
      </main>
    );
  }

  const g = solution.guide;
  const others = SOLUTIONS.filter((s) => s.slug !== solution.slug);

  return (
    <main className="page">
      <Link className="back-link" to="/custom-canopies">← All canopies</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">Canopy tents for</span>
          <h1>{solution.title}</h1>
          <p className="lead">{solution.blurb}</p>
          <p>{g.intro}</p>
          <div className="hero-actions">
            <Link className="btn btn-red" to="/custom-canopies">Shop canopies</Link>
            <Link className="btn btn-outline" to="/quote">Ask about bulk orders</Link>
          </div>
        </div>
        <div className="landing-art">
          <TentPhoto size="10x10" walls={2} label={solution.title} />
        </div>
      </div>

      <section className="steps-section">
        <div className="section-head">
          <h2>What matters for {solution.title.toLowerCase()}</h2>
        </div>
        <ul className="guide-list">
          {g.focus.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>Choosing a size</h2>
          <p>{g.sizing}</p>
        </div>
        <div className="size-grid">
          {SIZES.map((s) => (
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

      <section className="steps-section">
        <div className="section-head">
          <h2>Wall &amp; print setup</h2>
        </div>
        <p className="muted">{g.walls}</p>
      </section>

      <section className="size-section">
        <div className="section-head">
          <h2>Order your canopy tent</h2>
          <p>Pick a size and configure walls, print and delivery for an instant price.</p>
        </div>
        {products.length > 0 && (
          <div className="pcard-grid">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} previewSize={sizeKey(p.slug)} />
            ))}
          </div>
        )}
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

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { getState, slugify } from '../data/states';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function LocationPage() {
  const { stateSlug } = useParams();
  const state = getState(stateSlug);
  const [products, setProducts] = useState([]);

  useDocumentMeta(
    state ? `Custom Printed Canopy Tents in ${state.name}` : 'Location',
    state
      ? `Order custom printed canopy tents, sidewalls and accessories in ${state.name} with instant online pricing and shipping to ${state.cities.slice(0, 3).join(', ')} and beyond.`
      : ''
  );

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p.slice(0, 6))).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!state) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that location.</p>
        <Link className="btn btn-red" to="/locations">See all locations</Link>
      </main>
    );
  }

  const cityList = state.cities.join(', ');

  return (
    <main className="page">
      <nav className="crumbs"><Link to="/locations">Locations</Link> / <span>{state.name}</span></nav>

      <section className="loc-hero">
        <span className="eyebrow">Serving {state.name} · {state.region}</span>
        <h1>Custom Printed Canopy Tents in {state.name}</h1>
        <p className="lead">
          Order custom printed pop-up canopy tents, sidewalls and accessories for {state.name} with
          <strong> instant pricing</strong> — choose your size, frame grade and print coverage online,
          then we ship to {cityList} and everywhere across {state.name} ({state.abbr}).
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/products/canopy-tents">Build your canopy</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Shipping to {state.abbr}</strong><p>Delivered to {state.cities[0]} and beyond.</p></div></div>
        <div className="badge"><span className="badge-icon">🖨️</span><div><strong>Dye-sublimated print</strong><p>Colour bonded into the fabric — no peeling.</p></div></div>
        <div className="badge"><span className="badge-icon">💲</span><div><strong>Instant pricing</strong><p>See your price online — no sales rep needed.</p></div></div>
        <div className="badge"><span className="badge-icon">📐</span><div><strong>Free artwork proof</strong><p>You approve it before anything prints.</p></div></div>
      </section>

      <section className="section-block-bare">
        <div className="section-head-row"><h2>Popular products in {state.name}</h2><Link className="link-arrow" to="/products">View all →</Link></div>
        <div className="pcard-grid">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="section-block card">
        <h2>Canopy tents for businesses across {state.name}</h2>
        <p className="muted">
          From weekend markets in {state.cities[0]} to trade shows in {state.cities[1] || state.cities[0]},
          a printed canopy is often the whole booth. We ship to every city in {state.name}, including
          {' '}{cityList}. Configure and order online at any hour — no minimums.
        </p>
        <p className="muted">
          Whether it is a single 10&nbsp;×&nbsp;10 for a {state.cities[0]} market stall or a matching set for a
          season of events, you pick the size, frame and print coverage and see the price as you go.
        </p>
      </section>

      <section className="section-block-bare">
        <h2 className="section-title">Cities we serve in {state.name}</h2>
        <div className="loc-grid">
          {state.cities.map((c) => (
            <Link className="loc-chip" to={`/locations/${state.slug}/${slugify(c)}`} key={c}>
              <span className="loc-abbr">{state.abbr}</span><span>{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to order in {state.name}?</h2>
        <p>Get instant wholesale pricing and fast shipping to {state.abbr}.</p>
        <Link className="btn btn-light" to="/products">Start pricing</Link>
      </section>
    </main>
  );
}

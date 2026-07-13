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
    state ? `Custom Banners, Signs & Displays in ${state.name}` : 'Location',
    state
      ? `Order custom banners, yard signs, feather flags and trade-show displays in ${state.name} with instant online pricing and fast shipping to ${state.cities.slice(0, 3).join(', ')} and statewide.`
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
        <span className="eyebrow">Serving {state.name} · {state.region} USA</span>
        <h1>Custom Banners, Signs &amp; Displays in {state.name}</h1>
        <p className="lead">
          PrintUSA is your online wholesale print shop for {state.name}. Order custom vinyl banners,
          coroplast yard signs, feather flags, retractable stands and trade-show displays with
          <strong> instant pricing</strong> — printed fast and shipped to {cityList} and everywhere across {state.name} ({state.abbr}).
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/products">Shop &amp; price products</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Fast shipping to {state.abbr}</strong><p>Delivered to {state.cities[0]} and statewide.</p></div></div>
        <div className="badge"><span className="badge-icon">⚡</span><div><strong>Next-day production</strong><p>Most banners &amp; signs print in 1–2 days.</p></div></div>
        <div className="badge"><span className="badge-icon">💲</span><div><strong>Instant pricing</strong><p>See your price online — no sales rep needed.</p></div></div>
        <div className="badge"><span className="badge-icon">🎨</span><div><strong>Free file check</strong><p>We proof your artwork before printing.</p></div></div>
      </section>

      <section className="section-block-bare">
        <div className="section-head-row"><h2>Popular products in {state.name}</h2><Link className="link-arrow" to="/products">View all →</Link></div>
        <div className="pcard-grid">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="section-block card">
        <h2>Printing for businesses across {state.name}</h2>
        <p className="muted">
          From storefronts and events in {state.cities[0]} to trade shows in {state.cities[1] || state.cities[0]},
          businesses throughout {state.name} trust PrintUSA for durable, full-color large-format printing.
          We ship to every city in {state.name}, including {cityList}. Order online 24/7 and get wholesale
          pricing with no minimums.
        </p>
        <p className="muted">
          Whether you need a single banner for a {state.cities[0]} grand opening or a bulk order of yard
          signs for a statewide campaign, our online tools make it easy to design, price, and order in minutes.
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

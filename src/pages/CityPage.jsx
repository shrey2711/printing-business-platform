import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { getCity, slugify } from '../data/states';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function CityPage() {
  const { stateSlug, citySlug } = useParams();
  const match = getCity(stateSlug, citySlug);
  const [products, setProducts] = useState([]);

  useDocumentMeta(
    match ? `Custom Banners & Signs in ${match.city}, ${match.state.abbr}` : 'Location',
    match
      ? `Order custom banners, yard signs, feather flags and displays in ${match.city}, ${match.state.name} with instant online pricing and fast local shipping.`
      : ''
  );

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p.slice(0, 6))).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!match) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that city.</p>
        <Link className="btn btn-red" to="/locations">See all locations</Link>
      </main>
    );
  }

  const { state, city } = match;
  const others = state.cities.filter((c) => c !== city);

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/locations">Locations</Link> / <Link to={`/locations/${state.slug}`}>{state.name}</Link> / <span>{city}</span>
      </nav>

      <section className="loc-hero">
        <span className="eyebrow">Serving {city}, {state.abbr}</span>
        <h1>Custom Banners &amp; Signs in {city}, {state.name}</h1>
        <p className="lead">
          Need custom printing in {city}? PrintUSA delivers vinyl banners, coroplast yard signs,
          feather flags, retractable stands and trade-show displays to {city} and the surrounding
          {' '}{state.name} area — with <strong>instant online pricing</strong> and fast shipping.
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/products">Shop &amp; price products</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Ships to {city}</strong><p>Fast, tracked delivery across {state.abbr}.</p></div></div>
        <div className="badge"><span className="badge-icon">⚡</span><div><strong>Next-day production</strong><p>Most banners &amp; signs print in 1–2 days.</p></div></div>
        <div className="badge"><span className="badge-icon">💲</span><div><strong>Instant pricing</strong><p>See your {city} price online, 24/7.</p></div></div>
        <div className="badge"><span className="badge-icon">🎨</span><div><strong>Free file check</strong><p>We proof your artwork before printing.</p></div></div>
      </section>

      <section className="section-block-bare">
        <div className="section-head-row"><h2>Popular products in {city}</h2><Link className="link-arrow" to="/products">View all →</Link></div>
        <div className="pcard-grid">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="section-block card">
        <h2>Local printing for {city} businesses</h2>
        <p className="muted">
          From storefront signage and event banners to trade-show displays, {city} businesses order
          professional large-format printing from PrintUSA online — no need to visit a print shop.
          Design your artwork in our Design Studio or upload your own, get an instant quote, and we'll
          print and ship it to {city}, {state.name}.
        </p>
      </section>

      {others.length > 0 && (
        <section className="section-block-bare">
          <h2 className="section-title">Also serving nearby {state.name} cities</h2>
          <div className="loc-grid">
            {others.map((c) => (
              <Link className="loc-chip" to={`/locations/${state.slug}/${slugify(c)}`} key={c}>
                <span className="loc-abbr">{state.abbr}</span><span>{c}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="cta-banner">
        <h2>Order custom printing in {city}</h2>
        <p>Instant wholesale pricing and fast shipping to {city}, {state.abbr}.</p>
        <Link className="btn btn-light" to="/products">Start pricing</Link>
      </section>
    </main>
  );
}

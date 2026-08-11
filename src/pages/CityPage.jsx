import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import { getCity, slugify } from '../data/states';
import { getSeoCity } from '../data/citySeo';
import { PRIORITY_CITIES, cityContent } from '../data/cityContent';
import { SIZE_COMPARISON, STATE_FAQS } from '../data/stateContent';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function CityPage() {
  const { stateSlug, citySlug } = useParams();
  const match = getCity(stateSlug, citySlug);
  const [products, setProducts] = useState([]);
  const cityPriority = match && PRIORITY_CITIES.has(slugify(match.city));
  const cc = match && cityContent[slugify(match.city)];

  useDocumentMeta(
    match ? `Custom Canopy Tents in ${match.city}, ${match.state.abbr}` : 'Location',
    match
      ? `Order custom printed pop-up canopy tents in ${match.city}, ${match.state.name} with printed walls, instant online pricing and fast shipping.`
      : '',
    undefined,
    // Priority cities have unique content and are indexed; the rest stay noindex.
    match && !cityPriority ? 'noindex, follow' : undefined
  );

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p.slice(0, 6))).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Option-A consolidation: for the priority SEO cities, the canonical canopy
  // page is /trade-show-canopies/[city]. The edge middleware 301s direct hits;
  // this mirrors it for in-app (SPA) navigation so clicks land on the same page.
  const seoCity = getSeoCity(citySlug);
  if (seoCity && seoCity.stateSlug === stateSlug) {
    return <Navigate to={`/trade-show-canopies/${citySlug}`} replace />;
  }

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
        <h1>Custom Printed Canopy Tents in {city}, {state.name}</h1>
        <p className="lead">
          Need a branded canopy in {city}? We print pop-up canopy tents with up to 3 walls and ship
          them to {city} and the surrounding {state.name} area — with
          {' '}<strong>instant online pricing</strong> and a free artwork proof.
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/custom-canopies">Build your canopy</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Ships to {city}</strong><p>Tracked delivery across {state.abbr}.</p></div></div>
        <div className="badge"><span className="badge-icon">🖨️</span><div><strong>Dye-sublimated print</strong><p>Colour bonded in — it won't peel or crack.</p></div></div>
        <div className="badge"><span className="badge-icon">💲</span><div><strong>Instant pricing</strong><p>See your {city} price online, 24/7.</p></div></div>
        <div className="badge"><span className="badge-icon">📐</span><div><strong>Free artwork proof</strong><p>You approve it before anything prints.</p></div></div>
      </section>

      <section className="section-block-bare">
        <div className="section-head-row"><h2>Popular products in {city}</h2><Link className="link-arrow" to="/products">View all products →</Link></div>
        <div className="pcard-grid">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="section-block card">
        <h2>Custom canopy tents in {city}</h2>
        {cityPriority && cc ? (
          <>
            <p>{cc.intro}</p>
            <h3>Where canopy tents get used in {city}</h3>
            <ul className="feature-list">
              {cc.events.map((e) => <li key={e}>{e}</li>)}
            </ul>
            <h3>Choosing a size for {city} events</h3>
            <ul className="feature-list">
              {SIZE_COMPARISON.map(([sz, txt]) => (
                <li key={sz}><Link to={`/sizes/${sz}`}>{sz} canopy tent</Link> — {txt}</li>
              ))}
            </ul>
            <h3>Custom canopy tent FAQs</h3>
            {STATE_FAQS.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
            <p className="muted">
              We're online-only — configure your tent, upload artwork, approve the free proof, and we
              print and ship it to {city}. <Link to={`/locations/${state.slug}`}>More on {state.name} →</Link>
            </p>
          </>
        ) : (
          <p className="muted">
            We're an online shop — there's no storefront in {city}, and you don't need one. Market
            vendors, teams and event organisers in {city} configure a tent, upload artwork, approve the
            proof we send back, and we print and ship it to {city}, {state.name}.
          </p>
        )}
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

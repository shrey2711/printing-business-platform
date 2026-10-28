import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { isCategoryCityLive } from '../data/removedLocations';
import { list as getProducts } from '../services/cms/productService';
import { getState, slugify } from '../data/states';
import { SEO_CITIES } from '../data/citySeo';
import {
  PRIORITY_STATES, INDEXED_STATES, stateContent, ORDERING_STEPS, LOCAL_FACTS, BUYING_GUIDE_NOTE, STATE_OUTDOOR, distinctIntro,
  SIZE_COMPARISON, OUTDOOR_CONSIDERATIONS, ARTWORK_NOTES, STATE_FAQS
} from '../data/stateContent';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { stateRobots } from '../data/indexability';

export default function LocationPage() {
  const { stateSlug } = useParams();
  const state = getState(stateSlug);
  const [products, setProducts] = useState([]);
  const priority = state && PRIORITY_STATES.has(state.slug);
  const content = state && stateContent[state.slug];
  const local = state && LOCAL_FACTS[state.slug];
  // SEO cities in this state → their canonical /trade-show-displays/{city} pages (§27 State→City).
  const seoInState = state ? SEO_CITIES.filter((c) => c.stateSlug === state.slug && isCategoryCityLive('trade-show-displays', c.slug)) : [];

  useDocumentMeta(
    state ? `Custom Printed Canopy Tents in ${state.name}` : 'Location',
    state
      ? `Order custom printed pop-up canopy tents in ${state.name} with up to 3 printed walls, instant online pricing and shipping to ${state.cities.slice(0, 3).join(', ')} and beyond.`
      : '',
    undefined,
    // Templated long-tail states are noindex until they earn unique content.
    // Rule lives in src/data/indexability.js (shared with the sitemap).
    state ? stateRobots(state.slug) : undefined
  );

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p.slice(0, 6))).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Regions without verified local facts have no page; they 301 to /locations.
  if (state && !INDEXED_STATES.has(state.slug)) return <Navigate to="/locations" replace />;

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
          Order custom printed pop-up canopy tents for {state.name} with
          <strong> instant pricing</strong> — choose your size, printed walls and print coverage online,
          then we ship to {cityList} and everywhere across {state.name} ({state.abbr}).
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/custom-canopies">Build your canopy</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Shipping to {state.abbr}</strong><p>Delivered to {state.cities[0]} and beyond.</p></div></div>
        <div className="badge"><span className="badge-icon">🖨️</span><div><strong>Dye-sublimated print</strong><p>Color bonded into the fabric — no peeling.</p></div></div>
        <div className="badge"><span className="badge-icon">💲</span><div><strong>Instant pricing</strong><p>See your price online — no sales rep needed.</p></div></div>
        <div className="badge"><span className="badge-icon">📐</span><div><strong>Free artwork proof</strong><p>You approve it before anything prints.</p></div></div>
      </section>

      <section className="section-block-bare">
        <div className="section-head-row"><h2>Popular products in {state.name}</h2><Link className="link-arrow" to="/products">View all products →</Link></div>
        <div className="pcard-grid">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="section-block card loc-content">
        {!local && <h2>Custom canopy tents in {state.name}</h2>}
        {priority && content ? (
          <>
            <p>{local ? distinctIntro(state.slug) : content.intro}</p>
            {!local && (<>
              <h3>Popular event uses in {state.name}</h3>
              <ul className="feature-list">
                {content.events.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </>)}
            {local ? (
              <>
                <h3>Events and venues in {state.name}</h3>
                <ul className="feature-list">
                  {content.events.map((e) => <li key={e}>{e}</li>)}
                  {local.venues.map((v) => <li key={v}>{v}</li>)}
                  {local.events.map(([n, when, where]) => <li key={n}>{n} — {when}, {where}</li>)}
                </ul>
                {STATE_OUTDOOR[state.slug] && (<>
                  <h3>Setting up outdoors in {state.name}</h3>
                  <p>{STATE_OUTDOOR[state.slug]}</p>
                </>)}
                <p>
                  {BUYING_GUIDE_NOTE}{' '}
                  {SIZE_COMPARISON.map(([sz], i) => (
                    <span key={sz}>{i > 0 && ', '}<Link to={`/sizes/${sz}`}>{sz} canopy tent</Link></span>
                  ))}.
                </p>
              </>
            ) : (
              <>
            <h3>Choosing a canopy size for {state.name} events</h3>
            <ul className="feature-list">
              {SIZE_COMPARISON.map(([sz, txt]) => (
                <li key={sz}><Link to={`/sizes/${sz}`}>{sz} canopy tent</Link> — {txt}</li>
              ))}
            </ul>
            <h3>Outdoor event considerations</h3>
            <ul className="feature-list">
              {OUTDOOR_CONSIDERATIONS.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <h3>Artwork &amp; branding</h3>
            <ul className="feature-list">
              {ARTWORK_NOTES.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <h3>How ordering works</h3>
            <ol className="feature-list">
              {ORDERING_STEPS.map((x) => <li key={x}>{x}</li>)}
            </ol>
            <h3>Custom canopy tent FAQs</h3>
            {STATE_FAQS.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
              </>
            )}
          </>
        ) : (
          <p className="muted">
            From weekend markets in {state.cities[0]} to trade shows in {state.cities[1] || state.cities[0]},
            a printed canopy is often the whole booth. We ship to every city in {state.name}, including
            {' '}{cityList}. Configure and order online at any hour — no minimums.
          </p>
        )}
      </section>

      {seoInState.length > 0 && (
        <section className="section-block-bare">
          <h2 className="section-title">Trade show display cities in {state.name}</h2>
          <div className="loc-grid">
            {seoInState.map((c) => (
              <Link className="loc-chip" to={`/trade-show-displays/${c.slug}`} key={c.slug}>
                <span className="loc-abbr">{c.abbr}</span><span>{c.city}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section-block-bare">
        <h2 className="section-title">Cities we serve in {state.name}</h2>
        <div className="loc-grid">
          {state.cities.map((c) => {
            const cs = slugify(c);
            const seo = seoInState.find((x) => x.slug === cs);
            // City pages are removed: link only a live city hub, else plain text.
            return seo && isCategoryCityLive('trade-show-displays', cs) ? (
              <Link className="loc-chip" to={`/trade-show-displays/${cs}`} key={c}>
                <span className="loc-abbr">{state.abbr}</span><span>{c}</span>
              </Link>
            ) : (
              <span className="loc-chip" key={c}><span className="loc-abbr">{state.abbr}</span><span>{c}</span></span>
            );
          })}
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

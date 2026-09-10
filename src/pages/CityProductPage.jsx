import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { list as getProducts } from '../services/cms/productService';
import ProductConfigurator from './ProductConfigurator';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { getCityProductPage } from '../data/cityProductPages';
import { SEO_CITIES, LOCAL_CATEGORIES } from '../data/citySeo';

// Transactional product + city page.
//
// Deliberately not the same thing as the generic city page at
// /trade-show-canopies/{city}. That one answers "what is exhibiting in this
// city like"; this one answers "I want to buy this product, in this city, now".
// It carries real configurable products, live prices and a route into checkout,
// and it links across to the generic page rather than competing with it.
export default function CityProductPage({ slug }) {
  const page = getCityProductPage(slug);
  const city = page ? SEO_CITIES.find((c) => c.slug === page.citySlug) : null;
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // Which product's configurator is mounted. These pages cover a product group,
  // so the page picks one to configure and lets the visitor switch — rather than
  // stacking three or four full configurators down the page.
  const [active, setActive] = useState(page ? page.products[0] : null);

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((p) => alive && setProducts(p))
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => { alive = false; };
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : brand.origin;
  const items = page ? page.products.map((s) => products.find((p) => p.slug === s)).filter(Boolean) : [];

  const jsonLd = page
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: page.h1, item: `${origin}/${page.slug}` }
          ]
        },
        ...(items.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: items.map((p, i) => ({
                '@type': 'ListItem', position: i + 1, url: `${origin}/products/${p.slug}`, name: p.name
              }))
            }]
          : []),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: page.faqs.map((f) => ({
            '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        }
      ]
    : null;

  useDocumentMeta(page ? page.title : 'Not found', page ? page.description : undefined, jsonLd);

  if (!page) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that page.</p>
        <Link className="btn btn-outline" to="/products">All products</Link>
      </main>
    );
  }

  // The matching generic city page, so the two layers link rather than compete.
  const lane = LOCAL_CATEGORIES.find((l) => (l.productCats || []).some(
    (c) => items.some((p) => p.category === c)
  ));

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Home</Link> / <span>{page.h1}</span>
      </nav>

      <section className="loc-hero">
        <span className="eyebrow">{city ? `${city.city}, ${city.abbr}` : 'Trade show displays'}</span>
        <h1>{page.h1}</h1>
        <p className="lead">{page.intro}</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a className="btn btn-red" href="#configure">Configure &amp; buy</a>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      {/* The buying half of the page. This mounts the real Apex configurator —
          the same component /products/{slug} uses — so options, live pricing,
          quantity, artwork routing and checkout are the production ones rather
          than a second implementation that could drift from them. */}
      <section className="size-section" id="configure">
        <div className="section-head"><h2>{page.h1} — configure and buy</h2></div>

        {items.length > 1 && (
          <div className="city-product-picker" role="tablist" aria-label="Choose a product to configure">
            {items.map((p) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={active === p.slug}
                className={`chip ${active === p.slug ? 'chip-active' : ''}`}
                onClick={() => setActive(p.slug)}
              >
                {p.name}
                {p.startingPrice != null ? <span className="chip-price"> from ${p.startingPrice}</span> : null}
              </button>
            ))}
          </div>
        )}

        {!loaded ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">
            These products are being updated. <Link to="/quote">Request a quote</Link> and we will price your job.
          </p>
        ) : (
          <ProductConfigurator slug={active || page.products[0]} embedded />
        )}
      </section>

      {page.local.map((s) => (
        <section className="section-block" key={s.h2}>
          <h2>{s.h2}</h2>
          <p>{s.p}</p>
        </section>
      ))}

      <section className="section-block">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          {page.faqs.map((f, i) => (
            <details className="faq-item" key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Sends the local-research visitor to the page written for them, and
          keeps the two layers pointing at each other rather than apart. */}
      {city && lane && (
        <section className="section-block-bare">
          <h2 className="section-title">Exhibiting in {city.city}?</h2>
          <div className="loc-grid">
            <Link className="loc-chip" to={`/${lane.slug}/${city.slug}`}>
              <span>{lane.label} in {city.city}</span>
            </Link>
            <Link className="loc-chip" to="/products"><span>All Apex products</span></Link>
            <Link className="loc-chip" to="/trade-show-booth-packages"><span>Complete booth packages</span></Link>
          </div>
        </section>
      )}
    </main>
  );
}

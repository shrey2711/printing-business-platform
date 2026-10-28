import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { list as getProducts } from '../services/cms/productService';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { SEO_CITIES, LOCAL_CATEGORIES, getSeoCity, getLocalCategory, cityDisplaysTitle, cityCatTitle, cityCatDescription, cityBreadcrumb, cityWithAbbr, cityVenueName } from '../data/citySeo';
import { CITY_BOOTH_GUIDES } from '../data/internalLinks';
import { CITY_PRODUCT_PAGES } from '../data/cityProductPages';
import { cityDetailFor } from '../data/cityDetail';
import { cityPagePlan } from '../data/cityPagePlan';
import { isCategoryCityLive } from '../data/removedLocations';
import { isCityCategoryIndexable, NOINDEX_FOLLOW } from '../data/indexability';

const sizeKey = (s) => s.replace('canopy-tent-', '');

// One template for every /trade-show-canopies|trade-show-displays|banner-stands/[city]
// page. categoryKey identifies which local category; :city comes from the route.

// Which editorial block shows on which of a city's five pages is decided in
// cityPagePlan (shared with scripts/prerender.mjs). Each block appears on
// exactly one page, so the five URLs for a city are not near-duplicates.

export default function CityCategoryPage({ categoryKey }) {
  const cat = getLocalCategory(categoryKey);
  const { city: citySlug } = useParams();
  const city = getSeoCity(citySlug);
  const detail = cityDetailFor(citySlug);
  const plan = cat && city ? cityPagePlan(city, cat, detail) : null;
  const shownFaqs = plan ? plan.faqs : [];
  // Product + city pages for THIS city, if the pilot covers it.
  const cityBuy = CITY_PRODUCT_PAGES.filter((p) => p.citySlug === citySlug);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Tier 1 + 2 are indexed (each carries unique local content); Tier 3 stays
  // noindex until it earns depth.
  // Rule lives in src/data/indexability.js (shared with the sitemap).
  const indexed = isCityCategoryIndexable(city, cat, plan);
  const metaDesc = (cat.slug === 'trade-show-displays' && detail?.metaDescription)
    ? detail.metaDescription
    : (detail?.categoryMeta?.[cat.slug] || cityCatDescription(cat.label, city));

  useDocumentMeta(
    city
      ? (cat.slug === 'trade-show-displays' ? cityDisplaysTitle(city) : cityCatTitle(cat.label, city))
      : cat?.label || 'Location',
    city ? metaDesc : undefined,
    city
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: cityBreadcrumb(cat.label, cat.slug, city).map((c, i) => ({
              '@type': 'ListItem', position: i + 1, name: c.name, item: `${brand.origin}${c.url}`
            }))
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${brand.origin}/${cat.slug}/${city.slug}#webpage`,
            url: `${brand.origin}/${cat.slug}/${city.slug}`,
            name: `${cat.label} in ${cityWithAbbr(city)}`,
            description: metaDesc,
            isPartOf: { '@id': `${brand.origin}/#website` },
            about: { '@id': `${brand.origin}/#organization` }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${brand.origin}/${cat.slug}/${city.slug}#service`,
            name: `${cat.label} in ${city.city}`,
            serviceType: `Custom ${cat.label.toLowerCase()} printing`,
            provider: { '@id': `${brand.origin}/#organization` },
            areaServed: { '@type': 'City', name: city.city },
            description: metaDesc
          },
          ...(shownFaqs.length
            ? [{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: shownFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
              }]
            : [])
        ]
      : undefined,
    // Only Tier 1 cities are indexed; the rest stay noindex until they earn content.
    city && !indexed ? NOINDEX_FOLLOW : undefined
  );

  // A page that cannot reach the uniqueness bar is removed; mirror the edge 301.
  if (cat && city && !isCategoryCityLive(cat.slug, city.slug)) {
    return <Navigate to={cat.slug === 'trade-show-displays' ? '/trade-show-displays' : (isCategoryCityLive('trade-show-displays', city.slug) ? `/trade-show-displays/${city.slug}` : cat.hub)} replace />;
  }

  if (!cat || !city) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that location.</p>
        <Link className="btn btn-red" to={cat?.hub || '/products'}>Browse {cat?.label || 'products'}</Link>
      </main>
    );
  }

  const items = products.filter((p) => cat.productCats.includes(p.category));
  // Sibling category pages for the SAME city (cross-link the local cluster).
  const siblings = LOCAL_CATEGORIES.filter((l) => l.key !== cat.key && isCategoryCityLive(l.slug, city.slug));
  // A few other cities in the same category (nearby discovery).
  const otherCities = SEO_CITIES.filter((c) => c.slug !== city.slug && isCategoryCityLive(cat.slug, c.slug)).slice(0, 8);

  return (
    <main className="page">
      <nav className="crumbs">
        {cityBreadcrumb(cat.label, cat.slug, city).map((c, i, arr) => (
          <span key={c.url}>
            {i > 0 ? ' / ' : ''}
            {i === arr.length - 1 ? <span>{c.name}</span> : <Link to={c.url}>{c.name}</Link>}
          </span>
        ))}
      </nav>

      <section className="loc-hero">
        <span className="eyebrow">Ships to {cityWithAbbr(city)}</span>
        <h1>{cat.label} in {cityWithAbbr(city)}</h1>
        {plan.hasDetail ? (plan.lead ? <p className="lead">{plan.lead}</p> : null) : <p className="lead">{cat.lead(city)}</p>}
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-red" to={cat.hub}>Shop {cat.label.toLowerCase()}</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      <section className="badge-row">
        <div className="badge"><span className="badge-icon">🚚</span><div><strong>Ships to {city.city}</strong><p>Tracked delivery across {city.abbr}.</p></div></div>
        <div className="badge"><span className="badge-icon">🖨️</span><div><strong>Dye-sublimated print</strong><p>Color bonded in — it won't peel or fade.</p></div></div>
        <div className="badge"><span className="badge-icon">📐</span><div><strong>Free artwork proof</strong><p>You approve it before anything prints.</p></div></div>
      </section>

      {plan.answer && <p className="answer-block">{plan.answer}</p>}
      {plan.sections.map((sec) => (
        <section className="section-block" key={sec.id}>
          <h2>{sec.h2}</h2>
          {(sec.paras || []).map((t, i) => (<p key={i}>{t}</p>))}
          {sec.bullets && <ul>{sec.bullets.map(([n, d]) => (<li key={n}><strong>{n}</strong> — {d}</li>))}</ul>}
          {sec.spec && (
            <div className="table-wrap">
              <table className="compare-table">
                <caption>{sec.spec.caption}</caption>
                <thead><tr>{sec.spec.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {sec.spec.rows.map((r) => (
                    <tr key={r[0]}>{r.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {Array.isArray(sec.links) && sec.links.length > 0 && (
            <p className="info-links">
              {sec.links.map((l, i) => (
                <span key={l.to}>{i > 0 ? ' · ' : ''}<Link to={l.to}>{l.label}</Link></span>
              ))}
            </p>
          )}
        </section>
      ))}

      <section className="size-section">
        <div className="section-head"><h2>{cat.label} for {city.city} events</h2></div>
        {items.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="pcard-grid">
            {items.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                previewSize={p.slug.startsWith('canopy-tent-') ? sizeKey(p.slug) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* The city hub points DOWN at its product + city pages, which point back
          UP here. Displays hub only, and only where those pages exist — the
          pilot is Los Angeles and Chicago, so every other city renders nothing
          rather than an empty heading. Mirrors scripts/prerender.mjs. */}
      {cat.slug === 'trade-show-displays' && cityBuy.length > 0 && (
        <section className="section-block-bare">
          <h2 className="section-title">Order by product in {city.city}</h2>
          <div className="loc-grid">
            {cityBuy.map((p) => (
              <Link className="loc-chip" to={`/${p.slug}`} key={p.slug}><span>{p.h1}</span></Link>
            ))}
          </div>
        </section>
      )}

      <section className="section-block card">
        <p className="info-links">
          {siblings.map((s, i) => (
            <span key={s.key}>{i > 0 ? ' · ' : ''}<Link to={`/${s.slug}/${city.slug}`}>{s.label} in {city.city}</Link></span>
          ))}
        </p>
        <p className="info-links">
          <Link to="/custom-canopies">canopy tents</Link> · <Link to="/banner-stands">banner stands</Link> · <Link to="/backdrops">backdrops</Link> · <Link to="/table-covers">table covers</Link> · <Link to="/trade-show-displays">all trade show displays</Link>.
        </p>
        <p className="info-links">
          Guides: {CITY_BOOTH_GUIDES.map((g, i) => (
            <span key={g.slug}>{i > 0 ? ' · ' : ''}<Link to={`/blog/${g.slug}`}>{g.label}</Link></span>
          ))}
        </p>
      </section>

      {shownFaqs.length > 0 && (
        <section className="faq-section">
          <div className="section-head"><h2>{city.city} {cat.label.toLowerCase()} FAQ</h2></div>
          <div className="faq-list">
            {shownFaqs.map((f) => (
              <details className="faq-item" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <p className="info-links">
          Elsewhere: {otherCities.map((c, i) => (
            <span key={c.slug}>{i > 0 ? ' · ' : ''}<Link to={`/${cat.slug}/${c.slug}`}>{c.city}</Link></span>
          ))}
        </p>
      </section>

      <section className="cta-banner">
        <h2>Order {cat.label.toLowerCase()} in {city.city}</h2>
        <p>Instant pricing on canopies, fast quotes on the rest — shipped to {city.city}, {city.abbr}.</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-light" to={cat.hub}>Shop now</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>
    </main>
  );
}

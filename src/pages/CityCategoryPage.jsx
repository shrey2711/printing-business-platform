import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { SEO_CITIES, LOCAL_CATEGORIES, getSeoCity, getLocalCategory, cityDisplaysTitle, cityCatDescription, cityBreadcrumb } from '../data/citySeo';
import { CITY_BOOTH_GUIDES } from '../data/internalLinks';
import { cityDetailFor } from '../data/cityDetail';

const sizeKey = (s) => s.replace('canopy-tent-', '');
// "City, ABBR" without redundancy/double punctuation (mirrors the prerenderer).
const cityWithAbbr = (c) => (/[.]$/.test(c.city) || c.city.includes(c.abbr) ? c.city : `${c.city}, ${c.abbr}`);

// One template for every /trade-show-canopies|trade-show-displays|banner-stands/[city]
// page. categoryKey identifies which local category; :city comes from the route.
export default function CityCategoryPage({ categoryKey }) {
  const cat = getLocalCategory(categoryKey);
  const { city: citySlug } = useParams();
  const city = getSeoCity(citySlug);
  const detail = cityDetailFor(citySlug);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Tier 1 + 2 are indexed (each carries unique local content); Tier 3 stays
  // noindex until it earns depth.
  const indexed = city && city.tier <= 2;
  useDocumentMeta(
    city
      ? (cat.slug === 'trade-show-displays' ? cityDisplaysTitle(city) : `${cat.label} in ${cityWithAbbr(city)}`)
      : cat?.label || 'Location',
    city ? cityCatDescription(cat.label, city) : undefined,
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
            description: cityCatDescription(cat.label, city),
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
            description: cityCatDescription(cat.label, city)
          },
          ...(detail && detail.faqs
            ? [{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: detail.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
              }]
            : [])
        ]
      : undefined,
    // Only Tier 1 cities are indexed; the rest stay noindex until they earn content.
    city && !indexed ? 'noindex, follow' : undefined
  );

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
  const siblings = LOCAL_CATEGORIES.filter((l) => l.key !== cat.key);
  // A few other cities in the same category (nearby discovery).
  const otherCities = SEO_CITIES.filter((c) => c.slug !== city.slug).slice(0, 8);

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
        <p className="lead">{cat.lead(city)}</p>
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

      {detail && (
        <>
          <p className="answer-block">{detail.answer}</p>
          <section className="section-block">
            <h2>Why exhibit in {city.city}?</h2>
            {detail.overview.map((t, i) => (<p key={i}>{t}</p>))}
            <p>{detail.whyExhibit}</p>
          </section>
          <section className="section-block">
            <h2>Top convention centers in {city.city}</h2>
            <ul>{detail.conventionCenters.map((v) => (<li key={v.name}><strong>{v.name}</strong> — {v.desc}</li>))}</ul>
          </section>
          <section className="section-block">
            <h2>Popular trade show industries in {city.city}</h2>
            <ul>{detail.industries.map(([n, d]) => (<li key={n}><strong>{n}</strong> — {d}</li>))}</ul>
          </section>
          <section className="section-block">
            <h2>Shipping to {city.city}</h2>
            <p>Apex prints to order and ships to {city.city}, {city.stateName}. Standard production is 6–8 business days after you approve your free artwork proof, with an optional 2–3 business day rush; transit time is added on top and depends on the delivery address.</p>
          </section>
          <section className="section-block">
            <h2>Outdoor &amp; climate tips for {city.city}</h2>
            <p>{detail.climate}</p>
          </section>
          {detail.bestDisplays && (
            <section className="section-block"><h2>Best displays for {city.city} trade shows</h2><p>{detail.bestDisplays}</p></section>
          )}
          {detail.planning && (
            <section className="section-block"><h2>Planning your {city.city} booth</h2><p>{detail.planning}</p></section>
          )}
        </>
      )}

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

      <section className="section-block card">
        <h2>Trade shows in {city.city}</h2>
        <p>
          {city.city} hosts {city.scene}. Whether you're exhibiting at {city.venue} or running an
          outdoor activation nearby, Apex prints your {cat.label.toLowerCase()} in your brand and ships
          them to {city.city}, {city.stateName} — configure online, approve a free proof, and we handle
          the rest.
        </p>
        <p className="info-links">
          Building a full booth in {city.city}? {siblings.map((s, i) => (
            <span key={s.key}>{i > 0 ? ' · ' : ''}<Link to={`/${s.slug}/${city.slug}`}>{s.label} in {city.city}</Link></span>
          ))}
        </p>
      </section>

      <section className="section-block">
        <p className="info-links">
          Complete your {city.city} booth: <Link to="/custom-canopies">canopy tents</Link> · <Link to="/banner-stands">banner stands</Link> · <Link to="/backdrops">backdrops</Link> · <Link to="/table-covers">table covers</Link> · <Link to="/trade-show-displays">all trade show displays</Link>.
        </p>
      </section>

      <section className="section-block-bare">
        <h2 className="section-title">Guides for your {city.city} booth</h2>
        <div className="loc-grid">
          {CITY_BOOTH_GUIDES.map((g) => (
            <Link className="loc-chip" to={`/blog/${g.slug}`} key={g.slug}><span>{g.label}</span></Link>
          ))}
        </div>
      </section>

      {detail && detail.faqs && (
        <section className="faq-section">
          <div className="section-head"><h2>{city.city} FAQ</h2></div>
          <div className="faq-list">
            {detail.faqs.map((f) => (
              <details className="faq-item" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>
      )}

      <section className="section-block-bare">
        <h2 className="section-title">{cat.label} in other cities</h2>
        <div className="loc-grid">
          {otherCities.map((c) => (
            <Link className="loc-chip" to={`/${cat.slug}/${c.slug}`} key={c.slug}>
              <span className="loc-abbr">{c.abbr}</span><span>{c.city}</span>
            </Link>
          ))}
        </div>
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

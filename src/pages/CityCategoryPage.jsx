import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { list as getProducts } from '../services/cms/productService';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { SEO_CITIES, LOCAL_CATEGORIES, getSeoCity, getLocalCategory, cityDisplaysTitle, cityCatDescription, cityBreadcrumb, cityWithAbbr } from '../data/citySeo';
import { CITY_BOOTH_GUIDES } from '../data/internalLinks';
import { cityDetailFor } from '../data/cityDetail';

const sizeKey = (s) => s.replace('canopy-tent-', '');

// One template for every /trade-show-canopies|trade-show-displays|banner-stands/[city]
// page. categoryKey identifies which local category; :city comes from the route.

// Per-category view rules, mirroring scripts/prerender.mjs exactly. Each city
// page renders only the product section, spec rows and FAQs that match its own
// product intent, so the five category URLs for a city do not repeat one
// another's content.
const SECTION_FOR = {
  'trade-show-displays': [0, 1, 2, 3, 4],
  'trade-show-canopies': [1],
  'trade-show-backdrops': [2],
  'banner-stands': [3],
  'table-covers': [4]
};
const SPEC_ROWS_FOR = {
  'trade-show-displays': null, // all rows
  'trade-show-canopies': ['Canopy tent'],
  'banner-stands': ['Retractable banner stand'],
  'trade-show-backdrops': ['Step & repeat backdrop', 'Tension fabric display'],
  'table-covers': ['Table cover']
};
const FAQ_TOPIC = {
  'trade-show-canopies': /canop|outdoor|weight|wind|sun|rain|shade/i,
  'banner-stands': /banner|retractable|x-stand|tabletop|aisle/i,
  'trade-show-backdrops': /backdrop|step & repeat|step and repeat|tension|media wall|photo/i,
  'table-covers': /table cover|tablecloth|fitted|stretch|pleated/i
};
const ALWAYS_FAQ = /ship|deliver|receiving|rush|how early|in time for|order/i;

const faqsForCategory = (detail, slug) => {
  if (!detail || !Array.isArray(detail.faqs)) return [];
  const topic = FAQ_TOPIC[slug];
  return topic ? detail.faqs.filter((f) => topic.test(f.q) || ALWAYS_FAQ.test(f.q)) : detail.faqs;
};
const specTableForCategory = (detail, slug, cityName, label) => {
  const base = detail && detail.specTable;
  if (!base) return null;
  const filter = SPEC_ROWS_FOR[slug];
  if (filter === undefined) return null;
  if (filter === null) return base;
  return { ...base, caption: `${cityName} ${label.toLowerCase()} at a glance`, rows: base.rows.filter((r) => filter.includes(r[0])) };
};

const CATEGORY_LOCAL_H2 = {
  'trade-show-canopies': (c) => `Outdoor branding in ${c}`,
  'banner-stands': (c) => `Getting banner stands into ${c} venues`,
  'trade-show-backdrops': (c) => `Where ${c} exhibitors use backdrops`,
  'table-covers': (c) => `Table covers at ${c} shows`
};

export default function CityCategoryPage({ categoryKey }) {
  const cat = getLocalCategory(categoryKey);
  const { city: citySlug } = useParams();
  const city = getSeoCity(citySlug);
  const detail = cityDetailFor(citySlug);
  const shownFaqs = faqsForCategory(detail, cat ? cat.slug : '');
  const shownSpec = cat && city ? specTableForCategory(detail, cat.slug, city.city, cat.label) : null;
  const shownSections = (Array.isArray(detail?.productSections) && cat)
    ? (SECTION_FOR[cat.slug] || []).map((i) => detail.productSections[i]).filter(Boolean)
    : [];
  const showClimate = cat && (cat.slug === 'trade-show-displays' || cat.slug === 'trade-show-canopies');
  const showBestDisplays = cat && cat.slug === 'trade-show-displays';
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
    city ? ((cat.slug === 'trade-show-displays' && detail?.metaDescription) ? detail.metaDescription : cityCatDescription(cat.label, city)) : undefined,
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
          {showClimate && (
            <section className="section-block">
              <h2>Outdoor &amp; climate tips for {city.city}</h2>
              <p>{detail.climate}</p>
            </section>
          )}
          {showBestDisplays && detail.bestDisplays && (
            <section className="section-block">
              <h2>Best displays for {city.city} trade shows</h2>
              <p>{detail.bestDisplays}</p>
              {shownSpec && (
                <div className="table-wrap">
                  <table className="compare-table">
                    <caption>{shownSpec.caption}</caption>
                    <thead><tr>{shownSpec.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>
                      {shownSpec.rows.map((r) => (
                        <tr key={r[0]}>{r.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
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

      {detail?.categoryLocal?.[cat.slug] && CATEGORY_LOCAL_H2[cat.slug] && (
        <section className="section-block">
          <h2>{CATEGORY_LOCAL_H2[cat.slug](city.city)}</h2>
          <p>{detail.categoryLocal[cat.slug]}</p>
        </section>
      )}

      {shownSections.map((s) => (
        <section className="section-block" key={s.h2}>
          <h2>{s.h2}</h2>
          <p>{s.body}</p>
          {Array.isArray(s.links) && s.links.length > 0 && (
            <p className="info-links">
              {s.links.map((l, i) => (
                <span key={l.to}>{i > 0 ? ' · ' : ''}<Link to={l.to}>{l.label}</Link></span>
              ))}
            </p>
          )}
        </section>
      ))}

      {detail && detail.planning && (
        <section className="section-block"><h2>Planning your {city.city} booth</h2><p>{detail.planning}</p></section>
      )}

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

      {shownFaqs.length > 0 && (
        <section className="faq-section">
          <div className="section-head"><h2>{city.city} FAQ</h2></div>
          <div className="faq-list">
            {shownFaqs.map((f) => (
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

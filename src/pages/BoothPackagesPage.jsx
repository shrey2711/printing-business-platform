import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { list as getProducts } from '../services/cms/productService';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useMoney } from '../context/CurrencyContext';
import { brand } from '../config/brand';
import {
  BOOTH_PACKAGES_META, BOOTH_PACKAGES, SHOP_INDIVIDUALLY,
  BOOTH_USE_CASES, BOOTH_FAQS, BOOTH_COMPONENT_SLUGS
} from '../data/boothPackages';

// Trade Show Booth Packages — recommended combinations of EXISTING products.
// No package price / cart item; every component links to its own product page so
// customers can always buy individually. Targets "complete booth" intent only —
// it must not outrank the individual tent/product pages for single-product queries.
export default function BoothPackagesPage() {
  const m = BOOTH_PACKAGES_META;
  const [bySlug, setBySlug] = useState({});
  const money = useMoney();

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((all) => alive && setBySlug(Object.fromEntries(all.map((p) => [p.slug, p]))))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : brand.origin;
  const priceHint = (p) =>
    p && p.startingPrice != null ? `from ${money(p.startingPrice, { cents: false })}` : 'request a quote';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Trade Show Displays', item: `${origin}/trade-show-displays` },
        { '@type': 'ListItem', position: 3, name: m.h1, item: `${origin}/${m.slug}` }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Products in Apex booth packages',
      itemListElement: BOOTH_COMPONENT_SLUGS.map((slug, i) => ({
        '@type': 'ListItem', position: i + 1, url: `${origin}/products/${slug}`,
        name: bySlug[slug]?.name || slug
      }))
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: BOOTH_FAQS.map((f) => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ];

  useDocumentMeta(m.title, m.description, jsonLd);

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Home</Link> / <Link to="/trade-show-displays">Trade Show Displays</Link> / <span>Booth Packages</span>
      </nav>

      <section className="loc-hero">
        <span className="eyebrow">Complete booth solutions</span>
        <h1>{m.h1}</h1>
        <p className="lead">
          Need a whole booth, not just one piece? These packages combine Apex products that work well
          together — canopy tents, banner stands, table covers and backdrops, all printed to match.
          Prefer to buy one product? Every item below is sold individually, with its own price and
          checkout.
        </p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-red" to="/products">Shop all products</Link>
          <Link className="btn btn-outline" to="/quote">Request a booth quote</Link>
        </div>
      </section>

      <section className="section-block card">
        <h2>Buy the whole booth, or any single product</h2>
        <p>
          Apex sells individual products <strong>and</strong> complete booths. You never have to buy a
          bundle — pick a package as a starting point, or jump straight to a single product and
          configure it on its own.
        </p>
        <p className="info-links">
          {SHOP_INDIVIDUALLY.map((s, i) => (
            <span key={s.to}>{i > 0 && ' · '}<Link to={s.to}>{s.label}</Link></span>
          ))}
        </p>
      </section>

      <section className="size-section">
        <div className="section-head"><h2>Recommended booth packages</h2></div>
        <div className="booth-pkg-grid">
          {BOOTH_PACKAGES.map((pkg) => (
            <article className="booth-pkg card" key={pkg.id}>
              <h3>{pkg.name}</h3>
              <p className="booth-pkg-tag">{pkg.tagline}</p>
              <ul className="feature-list">
                {pkg.components.map((slug) => {
                  const p = bySlug[slug];
                  return (
                    <li key={slug}>
                      <Link to={`/products/${slug}`}>{p?.name || slug}</Link>
                      <span className="muted"> — {priceHint(p)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="booth-pkg-best"><strong>Best for:</strong> {pkg.bestFor}</p>
              <p className="muted booth-pkg-note">
                No bundle price — each product is priced and configured on its own page. Want it all in
                one quote? <Link to="/quote">Request a booth quote</Link>.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block card">
        <h2>Where these booths work</h2>
        <ul className="feature-list">
          {BOOTH_USE_CASES.map((u) => <li key={u}>{u}</li>)}
        </ul>
      </section>

      <section className="section-block-bare">
        <h2 className="section-title">Booth package FAQs</h2>
        {BOOTH_FAQS.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </section>

      <section className="cta-banner">
        <h2>Build your booth your way</h2>
        <p>Buy one product or the whole booth — instant pricing on canopies, quotes on the rest.</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-light" to="/products">Shop all products</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>
    </main>
  );
}

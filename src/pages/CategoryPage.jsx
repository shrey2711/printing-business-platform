import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { list as getProducts } from '../services/cms/productService';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { getCategoryPage, SUBCATEGORIES } from '../data/categoryPages';
import { LANDING_PAGES } from '../data/landingPages';

const cardPreview = {
  'canopy-tent-10x10': { full: 3, half: 0 },
  'canopy-tent-10x15': { full: 0, half: 2 },
  'canopy-tent-10x20': { full: 1, half: 0 }
};
const sizeKey = (s) => s.replace('canopy-tent-', '');

// Indexable category / collection landing page. Mirrors the prerendered HTML in
// scripts/prerender.mjs (same content + BreadcrumbList + ItemList schema).
export default function CategoryPage({ slug }) {
  const page = getCategoryPage(slug);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const items = page ? (page.category ? products.filter((p) => p.category === page.category) : products) : [];
  const origin = typeof window !== 'undefined' ? window.location.origin : brand.origin;
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
        ...(page.faqs?.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: page.faqs.map((f) => ({
                '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            }]
          : [])
      ]
    : null;
  const priceMap = Object.fromEntries(products.map((p) => [p.slug, p.startingPrice]));
  const liveFrom = (s) => (priceMap[s] != null ? `from $${priceMap[s]}` : 'Quote');

  useDocumentMeta(page ? page.title : 'Category', page ? page.description : undefined, jsonLd);

  if (!page) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that category.</p>
        <Link className="btn btn-outline" to="/products">All products</Link>
      </main>
    );
  }

  const shown = page.hub ? items.slice(0, 8) : items;

  return (
    <main className="page">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{page.nav}</span></nav>

      <section className="loc-hero">
        <span className="eyebrow">Trade show displays</span>
        <h1>{page.h1}</h1>
        <p className="lead">{page.intro}</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <Link className="btn btn-red" to="/products">Shop all products</Link>
          <Link className="btn btn-outline" to="/quote">Request a quote</Link>
        </div>
      </section>

      {page.answer && <p className="answer-block">{page.answer}</p>}

      {page.hub && (
        <section className="cat-cards-section">
          <div className="section-head"><h2>Shop by category</h2></div>
          <div className="cat-cards">
            {SUBCATEGORIES.map((sc) => (
              <Link className="cat-card" to={`/${sc.slug}`} key={sc.slug}>
                <div className="cat-card-body">
                  <strong>{sc.nav}</strong>
                  <span>{sc.title}</span>
                </div>
              </Link>
            ))}
            <Link className="cat-card" to="/trade-show-booth-packages" key="booth-packages">
              <div className="cat-card-body">
                <strong>Booth Packages</strong>
                <span>Build a complete trade show booth</span>
              </div>
            </Link>
            {LANDING_PAGES.map((lp) => (
              <Link className="cat-card" to={`/${lp.slug}`} key={lp.slug}>
                <div className="cat-card-body">
                  <strong>{lp.nav}</strong>
                  <span>{lp.h1}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="size-section">
        <div className="section-head"><h2>{page.hub ? 'Featured products' : page.h1}</h2></div>
        {shown.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="pcard-grid">
            {shown.map((p) => {
              const isTent = p.slug.startsWith('canopy-tent-');
              const cfg = cardPreview[p.slug] || {};
              return (
                <ProductCard
                  key={p.slug}
                  product={p}
                  previewSize={isTent ? sizeKey(p.slug) : undefined}
                  previewFull={cfg.full}
                  previewHalf={cfg.half}
                />
              );
            })}
          </div>
        )}
      </section>

      {page.points?.length > 0 && (
        <section className="section-block card">
          <h2>What's included</h2>
          <ul className="feature-list">
            {page.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
        </section>
      )}

      {page.guideLinks?.length > 0 && (
        <section className="section-block-bare">
          <h2 className="section-title">Canopy size guides</h2>
          <div className="loc-grid">
            {page.guideLinks.map((g) => (
              <Link className="loc-chip" to={g.to} key={g.to}><span>{g.label}</span></Link>
            ))}
          </div>
        </section>
      )}

      {page.compare?.length > 0 && (
        <section className="section-block">
          <h2>Compare {page.nav.toLowerCase()}</h2>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr><th>{page.hub ? 'Category' : 'Product'}</th>{page.compareCols.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {page.compare.map((row) => {
                  const priceCol = page.compareCols.includes('From');
                  return (
                    <tr key={row.name}>
                      <td><Link to={row.to}>{row.name}</Link></td>
                      {row.cells.map((cell, i) => <td key={i}>{cell}</td>)}
                      {priceCol && <td>{row.slug ? liveFrom(row.slug) : ''}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Buying-decision guidance — same source the prerenderer renders, so SSR
          and the client stay in step. */}
      {page.guide?.length > 0 && page.guide.map((g) => (
        <section className="section-block" key={g.h2}>
          <h2>{g.h2}</h2>
          <p>{g.p}</p>
        </section>
      ))}

      {page.faqs?.length > 0 && (
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
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
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
          : [])
      ]
    : null;

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
    </main>
  );
}

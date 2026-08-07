import { Link } from 'react-router-dom';
import { getPage } from '../data/pages';
import useDocumentMeta from '../hooks/useDocumentMeta';

// Renders a static trust/info page (About, Artwork Guidelines, Shipping,
// Returns, Warranty, Privacy, Terms) from src/data/pages.js. Mirrors the
// prerendered HTML in scripts/prerender.mjs.
export default function InfoPage({ slug }) {
  const page = getPage(slug);
  useDocumentMeta(page ? `${page.title}` : 'Page', page?.description);

  if (!page) {
    return (
      <main className="page">
        <p className="muted">Page not found.</p>
        <Link className="btn btn-outline" to="/">Home</Link>
      </main>
    );
  }

  return (
    <main className="page info-page">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{page.nav}</span></nav>
      <h1>{page.title}</h1>
      {page.blocks.map((b, i) => (
        <div key={i} className="info-block">
          {b.h && <h2>{b.h}</h2>}
          {b.p && <p>{b.p}</p>}
          {b.list && (
            <ul className="feature-list">
              {b.list.map((li) => <li key={li}>{li}</li>)}
            </ul>
          )}
        </div>
      ))}
      <p className="info-cta">
        <Link className="btn btn-red" to="/products">Shop canopy tents</Link>
        <Link className="btn btn-outline" to="/contact">Contact us</Link>
      </p>
    </main>
  );
}

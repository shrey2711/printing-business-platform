import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import { getLandingPage } from '../data/landingPages';

// Content-first SEO landing page for a display product type (SEG, tension
// fabric, pop-up, flags). Quote-based — no invented specs/prices. Mirrors the
// prerendered HTML in scripts/prerender.mjs.
export default function LandingPage({ slug }) {
  const page = getLandingPage(slug);
  const origin = typeof window !== 'undefined' ? window.location.origin : brand.origin;

  const jsonLd = page
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: 'Trade Show Displays', item: `${origin}/trade-show-displays` },
            { '@type': 'ListItem', position: 3, name: page.h1, item: `${origin}/${page.slug}` }
          ]
        },
        ...(page.faqs?.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: page.faqs.map((f) => ({
                '@type': 'Question', name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            }]
          : [])
      ]
    : null;

  useDocumentMeta(page ? page.title : 'Displays', page ? page.description : undefined, jsonLd);

  if (!page) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that page.</p>
        <Link className="btn btn-red" to="/trade-show-displays">All trade show displays</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="crumbs">
        <Link to="/">Home</Link> / <Link to="/trade-show-displays">Trade Show Displays</Link> / <span>{page.nav}</span>
      </nav>

      <section className="loc-hero">
        <span className="eyebrow">Trade show displays</span>
        <h1>{page.h1}</h1>
        <p className="lead">{page.intro}</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-red" to="/quote">Request a quote</Link>
          <Link className="btn btn-outline" to="/trade-show-displays">All displays</Link>
        </div>
      </section>

      {page.image && (
        <section className="landing-photo">
          <img src={page.image} alt={page.imageAlt || page.h1} loading="lazy" decoding="async" />
        </section>
      )}

      {page.sections?.map((s, i) => (
        <section className="section-block card" key={i}>
          <h2>{s.h2}</h2>
          {s.p && <p>{s.p}</p>}
          {s.list && <ul className="feature-list">{s.list.map((li) => <li key={li}>{li}</li>)}</ul>}
        </section>
      ))}

      {page.faqs?.length > 0 && (
        <section className="section-block-bare">
          <h2 className="section-title">Frequently asked questions</h2>
          {page.faqs.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </section>
      )}

      {page.related?.length > 0 && (
        <section className="section-block card">
          <h2>Related displays</h2>
          <p className="info-links">
            {page.related.map((r, i) => (
              <span key={r.to}>{i > 0 && ' · '}<Link to={r.to}>{r.label}</Link></span>
            ))}
          </p>
        </section>
      )}

      <section className="cta-banner">
        <h2>Get a quote for {page.nav.toLowerCase()}</h2>
        <p>Send your size and artwork — we'll come back with pricing and a free proof.</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-light" to="/quote">Request a quote</Link>
          <Link className="btn btn-outline" to="/contact">Contact us</Link>
        </div>
      </section>
    </main>
  );
}

import { Link, useParams } from 'react-router-dom';
import { getSolution, splitRich } from '../data/solutions';
import useDocumentMeta from '../hooks/useDocumentMeta';

function Rich({ text }) {
  return splitRich(text).map((part, i) =>
    part.to ? (
      <Link key={i} to={part.to}>{part.label}</Link>
    ) : (
      <span key={i}>{part.text}</span>
    )
  );
}

// Segment guide. The crawlable copy is the same blocks, rendered in
// scripts/prerender.mjs from src/data/solutions.js.
export default function SolutionPage() {
  const { useCase } = useParams();
  const solution = getSolution(useCase);

  useDocumentMeta(
    solution ? `${solution.title} — Custom Printed` : 'Canopy tent solutions',
    solution?.guide?.metaDescription
  );

  if (!solution) {
    return (
      <main className="page">
        <p className="muted">We couldn't find that page.</p>
        <Link className="btn btn-outline" to="/custom-canopies">Browse canopies</Link>
      </main>
    );
  }

  const g = solution.guide;

  return (
    <main className="page">
      <Link className="back-link" to="/custom-canopies">← All canopies</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">{g.eyebrow}</span>
          <h1>{solution.title}</h1>
          <p className="lead">{solution.blurb}</p>
          <p><Rich text={g.intro} /></p>
          <div className="hero-actions">
            <Link className="btn btn-red" to={g.primaryCta.to}>{g.primaryCta.label}</Link>
            <Link className="btn btn-outline" to="/quote">Ask about bulk orders</Link>
          </div>
        </div>
        <div className="landing-art">
          <img
            className="tent-photo"
            src={g.photo.src}
            alt={g.photo.alt}
            width="1200"
            height="900"
          />
        </div>
      </div>

      <section className="steps-section">
        <div className="section-head">
          <h2>{g.focusHeading}</h2>
        </div>
        <ul className="guide-list">
          {g.focus.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      {g.sections.map((sec) => (
        <section className="section-block" key={sec.h2}>
          <h2>{sec.h2}</h2>
          {sec.paragraphs.map((p) => <p key={p.slice(0, 48)}><Rich text={p} /></p>)}
        </section>
      ))}

      <section className="faq-section">
        <h2>{g.faqHeading}</h2>
        <div className="faq-list">
          {g.faqs.map((f, i) => (
            <details className="faq-item" key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>{g.relatedHeading}</h2>
        <p><Rich text={g.relatedLead} /></p>
      </section>
    </main>
  );
}

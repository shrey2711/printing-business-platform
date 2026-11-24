import { Link, useParams } from 'react-router-dom';
import { SIZES, getSize } from '../data/canopy';
import { splitRich } from '../data/solutions';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';

function Rich({ text }) {
  return splitRich(text).map((part, i) => (
    part.to ? <Link to={part.to} key={i}>{part.label}</Link> : <span key={i}>{part.text}</span>
  ));
}

// INFORMATIONAL size guide. Mirrors the prerendered /sizes/<slug> HTML in
// scripts/prerender.mjs so crawler and hydrated app match. Deliberately NOT a
// second commercial page for the size — it hands off to /products/<product>.
export default function SizePage() {
  const { size: slug } = useParams();
  const size = getSize(slug);

  useDocumentMeta(
    size ? size.guide.title : 'Canopy tent size guides',
    size ? size.guide.metaDescription : undefined
  );

  if (!size) {
    return (
      <main className="page">
        <p className="muted">We don't have a guide for that size.</p>
        <Link className="btn btn-outline" to="/products">See available sizes</Link>
      </main>
    );
  }

  const g = size.guide;
  const h = g.headings || {};
  const others = SIZES.filter((s) => s.slug !== size.slug);
  const stockWall = 'Add up to 3 printed walls, in any mix of full-height and half-height (both cost the same per wall) — for shade, a printed backdrop, weather protection and privacy while keeping the front open. You can also print the canopy top and valance, and choose standard 6–8 day or rush 2–3 day production.';

  return (
    <main className="page">
      <Link className="back-link" to="/custom-canopies">← All canopies</Link>

      <div className="landing-hero">
        <div>
          <span className="eyebrow">{size.slug} size guide</span>
          <h1>{g.title}</h1>
          <p className="lead">{size.blurb}</p>
          {g.lead ? <p><Rich text={g.lead} /></p> : (
            <p>This guide covers the {size.slug} canopy tent&apos;s dimensions, how many tables and people it fits, booth layout ideas and what it is best used for — so you can pick the right size before you configure and buy.</p>
          )}
          <p><Rich text={g.footprint} /></p>
          <div className="hero-actions">
            <Link className="btn btn-red" to={`/products/${size.product}`}>
              Shop the {size.label} canopy tent
            </Link>
          </div>
        </div>
        <div className="landing-art">
          <TentPhoto size={size.slug} walls={1} label={`${size.label} canopy tent`} />
        </div>
      </div>

      {(g.extraSections || []).map((sec) => (
        <section className="steps-section" key={sec.h2}>
          <div className="section-head"><h2>{sec.h2}</h2></div>
          {(sec.paragraphs || []).map((p) => <p key={p.slice(0, 48)}><Rich text={p} /></p>)}
          {sec.items && (
            <ul className="guide-list">
              {sec.items.map((item) => <li key={item}><Rich text={item} /></li>)}
            </ul>
          )}
        </section>
      ))}

      <section className="steps-section">
        <div className="section-head">
          <h2>{h.capacity || 'How many tables and people fit'}</h2>
        </div>
        <ul className="guide-list">
          {g.capacity.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>{h.layouts || 'Booth layout ideas'}</h2>
        </div>
        <ul className="guide-list">
          {g.layouts.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>{h.walls || `Wall options for a ${size.label}`}</h2>
        </div>
        <p className="muted"><Rich text={g.wallIntro || stockWall} /></p>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>{h.uses || `Common uses for a ${size.label}`}</h2>
        </div>
        <ul className="guide-list">
          {g.uses.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      <section className="steps-section">
        <div className="section-head">
          <h2>{h.compare || `${size.slug} vs other sizes`}</h2>
        </div>
        <p className="muted"><Rich text={g.comparison} /></p>
        <div className="size-grid">
          {others.map((s) => (
            <Link className="size-card" to={`/sizes/${s.slug}`} key={s.slug}>
              <TentPhoto size={s.slug} walls={1} label={`${s.label} canopy`} />
              <div className="size-card-body">
                <strong>{s.slug} size guide</strong>
                <span>View</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {Array.isArray(g.faqs) && g.faqs.length > 0 && (
        <section className="steps-section">
          <div className="section-head"><h2>{g.faqHeading || 'Questions'}</h2></div>
          {g.faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
      )}

      <section className="turnaround-band">
        <p className="turn-main">{h.shop || `Ready to order your ${size.label} canopy tent?`}</p>
        <p className="turn-sub">
          {g.closing ? <Rich text={g.closing} /> : 'Configure walls, print and delivery and see the price update live.'}
        </p>
        <Link className="btn btn-red" to={`/products/${size.product}`}>
          Shop the {size.label} Custom Canopy Tent
        </Link>
      </section>
    </main>
  );
}

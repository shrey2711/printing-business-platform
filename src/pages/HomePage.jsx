import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useContentResolver } from '../context/ContentContext';
import { brand } from '../config/brand';

const trustBadges = [
  { icon: '🖨️', title: 'Dye-sublimated print', copy: 'Ink bonded into the fabric — it will not crack, peel or fade.' },
  { icon: '📐', title: 'Free artwork proof', copy: 'You approve a visual proof before anything goes to production.' },
  { icon: '🧱', title: 'Add up to 3 walls', copy: 'Half or full printed walls — same price either way.' },
  { icon: '💬', title: 'Real people on support', copy: 'Talk to someone who knows tents, not a ticket queue.' }
];

const solutions = [
  { icon: '🧺', title: 'Vendor & market booths', copy: 'Weekend markets and craft fairs where the booth is the storefront.' },
  { icon: '🎪', title: 'Trade shows', copy: 'Outdoor expo space that needs to match your indoor booth branding.' },
  { icon: '🏟️', title: 'Sports & tailgates', copy: 'Team colours, shade for the bench, and something to find in a crowded lot.' },
  { icon: '🌮', title: 'Food trucks & concessions', copy: 'Menu on the wall, shade over the queue.' },
  { icon: '⛪', title: 'Churches & schools', copy: 'Registration desks, fundraisers and open days.' },
  { icon: '🏗️', title: 'Job sites & safety', copy: 'Shade and a visible company mark on active sites.' }
];

const steps = [
  { n: 1, title: 'Pick a size and see the price', copy: 'Choose 10×10, 10×15 or 10×20, add walls. The price updates as you go — no quote form.' },
  { n: 2, title: 'Upload your artwork', copy: 'Send a print-ready file or build one in the Design Studio.' },
  { n: 3, title: 'Approve the proof', copy: 'We send a visual proof. Nothing prints until you say yes.' },
  { n: 4, title: 'We print and ship', copy: 'Production runs after approval, then it ships to your door.' }
];

// preview size key ('10x20') from product slug ('canopy-tent-10x20')
const sizeKey = (slug) => slug.replace('canopy-tent-', '');

export default function HomePage() {
  useDocumentMeta('Custom Printed Canopy Tents — Instant Pricing', brand.description);
  const c = useContentResolver();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">{c('home.hero.eyebrow')}</span>
            <h1>{c('home.hero.title')}</h1>
            <p>{c('home.hero.subtitle')}</p>
            <div className="hero-actions">
              <Link className="btn btn-red" to="/products">Shop canopy tents</Link>
              <Link className="btn btn-outline" to="/products/canopy-tent-10x10">Start with a 10×10</Link>
            </div>
            <ul className="hero-ticks">
              <li>Live pricing</li>
              <li>Proof before production</li>
              <li>Bulk price at 3+</li>
            </ul>
          </div>
          <div className="hero-art">
            <TentPhoto size="10x20" walls={3} label="Custom printed canopy tent" />
          </div>
        </div>
      </section>

      {/* The three sizes */}
      <section className="size-section">
        <div className="section-head">
          <h2>{c('home.sizes.title')}</h2>
          <p>{c('home.sizes.subtitle')}</p>
        </div>
        {products.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="pcard-grid">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} previewSize={sizeKey(p.slug)} />
            ))}
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="trust-row">
        {trustBadges.map((b) => (
          <div className="trust-badge" key={b.title}>
            <span className="trust-icon" aria-hidden="true">{b.icon}</span>
            <div>
              <strong>{b.title}</strong>
              <p>{b.copy}</p>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="section-head">
          <h2>How ordering works</h2>
          <p>Four steps, and you approve the artwork before anything prints.</p>
        </div>
        <ol className="steps-row">
          {steps.map((s) => (
            <li className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <strong>{s.title}</strong>
              <p>{s.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Use cases */}
      <section className="solutions-section">
        <div className="section-head">
          <h2>Built for the way you use it</h2>
        </div>
        <div className="solutions-grid">
          {solutions.map((s) => (
            <article className="solution-card" key={s.title}>
              <span className="solution-icon" aria-hidden="true">{s.icon}</span>
              <strong>{s.title}</strong>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="turnaround-band">
        <p className="turn-main">{c('home.cta.main')}</p>
        <p className="turn-sub">{c('home.cta.sub')}</p>
        <Link className="btn btn-red" to="/products">Shop canopy tents</Link>
      </section>
    </>
  );
}

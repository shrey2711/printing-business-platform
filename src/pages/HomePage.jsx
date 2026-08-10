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

const categoryTiles = [
  { icon: '⛺', title: 'Custom Canopies', copy: 'Printed pop-up tents & walls', to: '/products?category=tents' },
  { icon: '📐', title: 'Banner Stands', copy: 'Retractable & X-stand banners', to: '/products?category=banner-stands' },
  { icon: '📸', title: 'Backdrops', copy: 'Step & repeat media walls', to: '/products?category=backdrops' },
  { icon: '🎪', title: 'Table Covers', copy: 'Pleated & stretch throws', to: '/products?category=table-covers' },
  { icon: '🧰', title: 'Accessories', copy: 'Weights, flags & hardware', to: '/products' },
  { icon: '🏢', title: 'Complete Booth', copy: 'Everything for your booth', to: '/quote' }
];

const steps = [
  { n: 1, title: 'Pick a size and see the price', copy: 'Choose 10×10, 10×15 or 10×20, add walls. The price updates as you go — no quote form.' },
  { n: 2, title: 'Upload your artwork', copy: 'Send a print-ready file, or a logo for us to place. We send a free proof before printing.' },
  { n: 3, title: 'Approve the proof', copy: 'We send a visual proof. Nothing prints until you say yes.' },
  { n: 4, title: 'We print and ship', copy: 'Production runs after approval, then it ships to your door.' }
];

// preview size key ('10x20') from product slug ('canopy-tent-10x20')
const sizeKey = (slug) => slug.replace('canopy-tent-', '');

// Show a DIFFERENT wall configuration on each tent card so the three don't
// look identical (they share the same base art).
const cardPreview = {
  'canopy-tent-10x10': { full: 3, half: 0 }, // fully walled
  'canopy-tent-10x15': { full: 0, half: 2 }, // two half walls
  'canopy-tent-10x20': { full: 1, half: 0 }  // single back wall
};

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
              <Link className="btn btn-red" to="/products">Shop all displays</Link>
              <Link className="btn btn-outline" to="/products?category=tents">Custom canopies</Link>
            </div>
            <ul className="hero-ticks">
              <li>Canopies · banners · backdrops</li>
              <li>Free artwork proof</li>
              <li>One supplier for your booth</li>
            </ul>
          </div>
          <div className="hero-art">
            <TentPhoto size="10x20" walls={3} label="Custom printed canopy tent" />
          </div>
        </div>
      </section>

      {/* Shop by category — signals the full range up front */}
      <section className="cat-tiles-section">
        <div className="section-head">
          <h2>Everything you need to build a professional booth</h2>
          <p>One supplier for your whole trade show presence.</p>
        </div>
        <div className="cat-tiles">
          {categoryTiles.map((c) => (
            <Link className="cat-tile" to={c.to} key={c.title}>
              <span className="cat-tile-icon" aria-hidden="true">{c.icon}</span>
              <strong>{c.title}</strong>
              <span className="cat-tile-copy">{c.copy}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Canopy tents — our most popular category */}
      <section className="size-section">
        <div className="section-head">
          <h2>{c('home.sizes.title')}</h2>
          <p>{c('home.sizes.subtitle')}</p>
        </div>
        {products.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="pcard-grid">
            {products
              .filter((p) => p.category === 'tents' || p.category === 'table-covers')
              .map((p) => {
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

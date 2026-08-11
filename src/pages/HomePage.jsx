import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import DisplayPhoto from '../components/DisplayPhoto';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useContentResolver } from '../context/ContentContext';
import { brand } from '../config/brand';
import { SHOWCASE } from '../data/showcase';

const trustBadges = [
  { icon: '🖨️', title: 'Dye-sublimated print', copy: 'Ink bonded into the fabric — it will not crack, peel or fade.' },
  { icon: '📐', title: 'Free artwork proof', copy: 'You approve a visual proof before anything goes to production.' },
  { icon: '🎯', title: 'One supplier, one brand', copy: 'Canopy, banners, backdrop and table cover — printed to match.' },
  { icon: '💬', title: 'Real people on support', copy: 'Talk to someone who knows trade show displays.' }
];

const solutions = [
  { icon: '🧺', title: 'Vendor & market booths', copy: 'Weekend markets and craft fairs where the booth is the storefront.' },
  { icon: '🎪', title: 'Trade shows', copy: 'Expo space that needs canopy, banners and backdrop all on-brand.' },
  { icon: '🏟️', title: 'Sports & tailgates', copy: 'Team colours, shade for the bench, and something to find in a crowded lot.' },
  { icon: '🌮', title: 'Food trucks & concessions', copy: 'Menu on the wall, shade over the queue.' },
  { icon: '⛪', title: 'Churches & schools', copy: 'Registration desks, fundraisers and open days.' },
  { icon: '🏗️', title: 'Job sites & safety', copy: 'Shade and a visible company mark on active sites.' }
];

// Visually strong category cards, using real product images where we have them
// (banner stands / backdrops fall back to the ProductArt illustration).
// Each card uses a DIFFERENT product colourway so the range reads varied, not
// all-navy (the hero collage carries the red banner + red backdrop, so these
// deliberately use other colours/products).
const categoryCards = [
  { title: 'Custom Canopies', copy: 'Printed pop-up tents & walls', to: '/custom-canopies', img: '/images/colorways/canopy-charcoal.webp' },
  { title: 'Banner Stands', copy: 'Retractable & X-stand banners', to: '/banner-stands', img: '/images/colorways/banner-white.webp' },
  { title: 'Table Covers', copy: 'Pleated & stretch throws', to: '/table-covers', img: '/images/colorways/tablecover-charcoal.webp' },
  { title: 'Backdrops', copy: 'Step & repeat media walls', to: '/backdrops', art: 'step-and-repeat-backdrop' },
  { title: 'Trade Show Displays', copy: 'Shop the complete range', to: '/trade-show-displays', img: '/images/colorways/canopy-red.webp' },
  { title: 'Accessories', copy: 'Weights, sandbags & hardware', to: '/products', img: '/images/tents/sandbags.webp' }
];

// Purpose-led discovery — maps a shopper's intent to a category landing page.
const displayTypes = [
  { label: 'Canopies & Outdoor', to: '/custom-canopies' },
  { label: 'Banner Stands', to: '/banner-stands' },
  { label: 'Backdrops', to: '/backdrops' },
  { label: 'Table Displays', to: '/table-covers' },
  { label: 'All Displays', to: '/trade-show-displays' }
];

// "Build your booth" merchandising examples — coordinated sets of EXISTING
// products. Not fixed bundles: no package price, no SKU. Each line links to the
// real product/category; the CTA seeds a quote with the set.
const boothSetups = [
  {
    tier: 'Essential Setup',
    icon: '🎯',
    tagline: 'Show up looking sharp.',
    items: [
      { label: 'Custom Canopy (10×10)', to: '/products/canopy-tent-10x10' },
      { label: 'Branded Table Cover', to: '/table-covers' },
      { label: 'Retractable Banner', to: '/products/standard-retractable-banner' }
    ]
  },
  {
    tier: 'Professional Setup',
    icon: '🏆',
    featured: true,
    tagline: 'A fuller, more branded presence.',
    items: [
      { label: 'Custom Canopy + Back Wall', to: '/products/canopy-tent-10x10' },
      { label: 'Branded Table Cover', to: '/table-covers' },
      { label: 'Two Banner Stands', to: '/banner-stands' }
    ]
  },
  {
    tier: 'Complete Brand Experience',
    icon: '💎',
    tagline: 'The whole booth, coordinated.',
    items: [
      { label: 'Custom Canopy + Walls', to: '/products/canopy-tent-10x10' },
      { label: 'Branded Table Cover', to: '/table-covers' },
      { label: 'Banner Stands', to: '/banner-stands' },
      { label: 'Event Backdrop', to: '/products/step-and-repeat-backdrop' },
      { label: 'Accessories', to: '/products' }
    ]
  }
];

// A mix across categories for product discovery (all real, in-database products).
const featuredSlugs = [
  'canopy-tent-10x10',
  'standard-retractable-banner',
  'pleated-table-covers',
  'step-and-repeat-backdrop',
  'x-stand-banner',
  'table-top-banner-stand'
];

const sizeKey = (slug) => slug.replace('canopy-tent-', '');
const cardPreview = {
  'canopy-tent-10x10': { full: 3, half: 0 },
  'canopy-tent-10x15': { full: 0, half: 2 },
  'canopy-tent-10x20': { full: 1, half: 0 }
};

export default function HomePage() {
  useDocumentMeta('Trade Show Displays, Canopies, Banners & Backdrops', brand.description);
  const c = useContentResolver();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const featured = featuredSlugs.map((s) => bySlug.get(s)).filter(Boolean);
  const canopyProducts = products.filter((p) => p.slug.startsWith('canopy-tent-'));

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
              <Link className="btn btn-red" to="/products">Shop Trade Show Displays</Link>
              <Link className="btn btn-outline" to="/products?category=tents">Shop Custom Canopies</Link>
            </div>
            <ul className="hero-ticks">
              <li>Canopies · banners · backdrops · table covers</li>
              <li>Free artwork proof</li>
              <li>One supplier for your booth</li>
            </ul>
          </div>
          {/* Complete-booth collage — not a canopy alone */}
          <div className="hero-collage" aria-label="A complete Apex trade show booth: canopy, table cover, banner stand and backdrop">
            <div className="hc-tile hc-canopy"><TentPhoto size="10x20" walls={3} label="Custom printed canopy tent" /></div>
            <div className="hc-tile"><img src="/images/table-covers/pleated.webp" alt="Branded table cover" loading="lazy" decoding="async" width="600" height="450" /></div>
            <div className="hc-tile"><img src="/images/colorways/banner-red.webp" alt="Red custom retractable banner stand" loading="lazy" decoding="async" width="600" height="450" /></div>
            <div className="hc-tile"><img src="/images/colorways/backdrop-red.webp" alt="Red step & repeat backdrop" loading="lazy" decoding="async" width="600" height="450" /></div>
          </div>
        </div>
      </section>

      {/* Shop by category — signals the full range in the first screenful */}
      <section className="cat-cards-section">
        <div className="section-head">
          <h2>Shop by category</h2>
          <p>Everything you need to build a professional trade show booth, from one supplier.</p>
        </div>
        <div className="cat-cards">
          {categoryCards.map((cat) => (
            <Link className="cat-card" to={cat.to} key={cat.title}>
              <div className="cat-card-media">
                {cat.img ? (
                  <img src={cat.img} alt={cat.title} loading="lazy" decoding="async" width="600" height="450" />
                ) : (
                  <DisplayPhoto slug={cat.art} label={cat.title} />
                )}
              </div>
              <div className="cat-card-body">
                <strong>{cat.title}</strong>
                <span>{cat.copy}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="display-types">
          <span className="dt-label">Shop by display type:</span>
          {displayTypes.map((d) => (
            <Link className="dt-chip" to={d.to} key={d.label}>{d.label}</Link>
          ))}
        </div>
      </section>

      {/* One brand, one booth — the complete-solution message */}
      <section className="booth-band">
        <div className="booth-band-inner">
          <h2>One brand. One booth. Everything you need.</h2>
          <p>
            Apex prints every branded piece of your trade show booth — canopy, banner stands, backdrop,
            table cover and accessories — from one supplier, so it all matches. Send your logo once and
            we coordinate the whole set.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-red" to="/products">Shop trade show displays</Link>
            <Link className="btn btn-outline" to="/quote">Plan a complete booth</Link>
          </div>
        </div>
      </section>

      {/* Build your booth — merchandising examples (no fixed packages) */}
      <section className="booth-builder">
        <div className="section-head">
          <h2>Build your trade show booth</h2>
          <p>Coordinate Apex products into one branded booth. Examples to start from — mix and match.</p>
          <p><Link className="link-arrow" to="/trade-show-booth-packages">See all booth packages →</Link></p>
        </div>
        <div className="booth-tiers">
          {boothSetups.map((s) => (
            <div className={`booth-tier ${s.featured ? 'is-featured' : ''}`} key={s.tier}>
              {s.featured && <span className="bt-flag">Most popular</span>}
              <span className="bt-icon" aria-hidden="true">{s.icon}</span>
              <h3>{s.tier}</h3>
              <p className="bt-tag">{s.tagline}</p>
              <ul className="bt-items">
                {s.items.map((it) => (
                  <li key={it.label}><Link to={it.to}>{it.label}</Link></li>
                ))}
              </ul>
              <Link
                className="btn btn-outline btn-block"
                to="/quote"
                state={{ product: `${s.tier} — booth`, specs: s.items.map((i) => i.label).join(', ') }}
              >
                Quote this setup
              </Link>
            </div>
          ))}
        </div>
        <p className="booth-note">
          Pricing is per product — request a quote and we'll coordinate the set. No fixed package pricing.
        </p>
      </section>

      {/* What we print — sample booths in a range of customer brands */}
      <section className="showcase-section">
        <div className="section-head">
          <h2>What we print for our customers</h2>
          <p>Every booth is printed in the customer's own brand — a few examples across canopies, banners, backdrops and table covers.</p>
        </div>
        <div className="showcase-grid">
          {SHOWCASE.map((s) => (
            <figure className="showcase-item" key={s.file}>
              <img src={`/images/showcase/${s.file}`} alt={`${s.product} printed for ${s.brand}`} loading="lazy" decoding="async" width="900" height="675" />
              <figcaption><strong>{s.brand}</strong><span>{s.product}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Product discovery — a mix across categories */}
      {featured.length > 0 && (
        <section className="size-section">
          <div className="section-head">
            <h2>Featured across the range</h2>
            <p>A mix of what Apex prints for your booth.</p>
          </div>
          <div className="pcard-grid">
            {featured.map((p) => {
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
        </section>
      )}

      {/* Custom canopies — still an important, dedicated category */}
      <section className="size-section">
        <div className="section-head">
          <h2>{c('home.sizes.title')}</h2>
          <p>{c('home.sizes.subtitle')}</p>
        </div>
        {canopyProducts.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="pcard-grid">
            {canopyProducts.map((p) => {
              const cfg = cardPreview[p.slug] || {};
              return (
                <ProductCard
                  key={p.slug}
                  product={p}
                  previewSize={sizeKey(p.slug)}
                  previewFull={cfg.full}
                  previewHalf={cfg.half}
                />
              );
            })}
          </div>
        )}
        <div className="section-more">
          <Link className="btn btn-outline" to="/products?category=tents">All canopy sizes &amp; walls</Link>
        </div>
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
        <Link className="btn btn-red" to="/products">Shop all displays</Link>
      </section>
    </>
  );
}

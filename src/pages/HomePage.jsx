import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import ProductArt from '../components/ProductArt';
import useDocumentMeta from '../hooks/useDocumentMeta';

const valueProps = [
  { stat: '24/7', label: 'Online ordering & instant pricing' },
  { stat: '50', label: 'States shipped nationwide' },
  { stat: '1–2 days', label: 'Typical production time' },
  { stat: 'Free', label: 'Artwork file check on every order' }
];

// Promo blocks under the hero. Each points at a real configurator route.
const featured = [
  {
    slug: 'vinyl-banners',
    eyebrow: 'Most ordered',
    title: 'Custom Vinyl Banners',
    copy: 'Full-color 13oz scrim vinyl, cut to any size. Free hem and grommets on every banner.',
    cta: 'Build a banner'
  },
  {
    slug: 'feather-flags',
    eyebrow: 'Roadside impact',
    title: 'Feather & Teardrop Flags',
    copy: 'Complete pole kits that swivel in the wind. Ground spike or cross base included.',
    cta: 'Shop flags'
  },
  {
    slug: 'trade-show-displays',
    eyebrow: 'Booth ready',
    title: 'Trade Show Displays',
    copy: 'Pop-up walls, counters and backdrops that set up in minutes and pack into a wheeled case.',
    cta: 'See displays'
  }
];

const trustBadges = [
  { icon: '🇺🇸', title: 'Printed in the USA', copy: 'Produced and shipped from US facilities.' },
  { icon: '⚡', title: 'Fast turnaround', copy: 'Most orders ship in 1–2 business days.' },
  { icon: '🔒', title: 'Secure checkout', copy: 'Encrypted payments, no card data stored.' },
  { icon: '🎨', title: 'Free file check', copy: 'A human reviews your artwork before print.' }
];

// Category rails shown on the home page, in order.
const rails = [
  { id: 'banners', title: 'Banners', blurb: 'Vinyl, mesh, fabric and backlit — cut to any size.' },
  { id: 'signs', title: 'Signs & Letters', blurb: 'Yard signs, rigid boards, A-frames and storefront letters.' },
  { id: 'displays', title: 'Displays & Stands', blurb: 'Retractables, backdrops, light boxes and booth kits.' },
  { id: 'large-format', title: 'Large Format', blurb: 'Posters, murals, canvas, reflective and backlit film.' }
];

// TODO: replace with real, attributed customer reviews before launch.
// These are placeholders showing the layout only — do not ship them as genuine.
const placeholderReviews = [
  { quote: 'Replace this with a real customer quote about turnaround time.', name: 'Customer name', role: 'Company, State' },
  { quote: 'Replace this with a real customer quote about print quality.', name: 'Customer name', role: 'Company, State' },
  { quote: 'Replace this with a real customer quote about the ordering process.', name: 'Customer name', role: 'Company, State' }
];

export default function HomePage() {
  useDocumentMeta(
    'Wholesale Banners, Signs & Displays',
    'Get instant pricing on wholesale banners, custom signs, feather flags and trade-show displays. Choose your size, quantity and finishing online, with fast nationwide shipping.'
  );
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((prods) => alive && setProducts(prods))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const byCategory = useMemo(() => {
    const map = {};
    for (const p of products) {
      (map[p.category] ||= []).push(p);
    }
    return map;
  }, [products]);

  const findProduct = (slug) => products.find((p) => p.slug === slug);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Wholesale trade printing</span>
            <h1>From yard signs to trade show walls — priced instantly, shipped fast.</h1>
            <p>
              Pick your size, material and finishing and watch the price update as you go. No quotes to
              chase, no sales calls. Blind shipping to all 50 states.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-red" to="/products">Shop all products</Link>
              <Link className="btn btn-outline" to="/quote">Request a custom quote</Link>
            </div>
            <ul className="hero-ticks">
              <li>Instant online pricing</li>
              <li>Free artwork file check</li>
              <li>Ships in 1–2 business days</li>
            </ul>
          </div>
          <div className="hero-art">
            <ProductArt slug="vinyl-banners" />
          </div>
        </div>
      </section>

      {/* Featured promo blocks */}
      <section className="featured-row">
        {featured.map((f) => {
          const product = findProduct(f.slug);
          return (
            <Link className="featured-card" to={`/products/${f.slug}`} key={f.slug}>
              <div className="featured-art">
                <ProductArt slug={f.slug} />
              </div>
              <div className="featured-body">
                <span className="featured-eyebrow">{f.eyebrow}</span>
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
                <span className="featured-cta">
                  {f.cta}
                  {product ? <em> — from ${product.startingPrice}</em> : null}
                </span>
              </div>
            </Link>
          );
        })}
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

      {/* Catalog: sidebar + category rails */}
      <div className="catalog-shell">
        <CategorySidebar />

        <main className="catalog-main">
          <div className="catalog-heading">
            <h1>Shop by category</h1>
            <p>Order today before 6am PST — ships today. Wholesale pricing, blind shipping nationwide.</p>
          </div>

          {products.length === 0 ? (
            <p className="muted">Loading products…</p>
          ) : (
            rails.map((rail) => {
              const items = byCategory[rail.id] || [];
              if (!items.length) return null;
              return (
                <section className="cat-rail" key={rail.id}>
                  <div className="cat-rail-head">
                    <div>
                      <h2>{rail.title}</h2>
                      <p>{rail.blurb}</p>
                    </div>
                    <Link className="cat-rail-all" to={`/products?category=${rail.id}`}>
                      View all {items.length} →
                    </Link>
                  </div>
                  <div className="pcard-grid">
                    {items.slice(0, 6).map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>

      {/* Online value props band */}
      <section className="facilities">
        <h2>A fully online print shop — order anytime, ships to your door</h2>
        <div className="facility-row">
          {valueProps.map((f, i) => (
            <div className="facility" key={i}>
              <span className="facility-size">{f.stat}</span>
              <span className="facility-label">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews — placeholder content, see note above */}
      <section className="reviews">
        <h2>What customers say</h2>
        <div className="review-row">
          {placeholderReviews.map((r, i) => (
            <figure className="review" key={i}>
              <div className="review-stars" aria-label="5 out of 5">★★★★★</div>
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Turnaround messaging */}
      <section className="turnaround-band">
        <p className="turn-main">Orders placed by 4pm PST ship the next business day</p>
        <p className="turn-sub">Same-day service is also available if ordered by 12pm PST</p>
        <Link className="btn btn-red" to="/products">Shop All Products</Link>
      </section>
    </>
  );
}

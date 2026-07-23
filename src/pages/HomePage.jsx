import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getProduct } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import CanopyPreview from '../components/CanopyPreview';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useMoney } from '../context/CurrencyContext';
import { brand } from '../config/brand';

const trustBadges = [
  { icon: '🖨️', title: 'Dye-sublimated print', copy: 'Ink bonded into the fabric — it will not crack, peel or fade.' },
  { icon: '📐', title: 'Free artwork proof', copy: 'You approve a visual proof before anything goes to production.' },
  { icon: '🚚', title: 'US & Canada shipping', copy: 'Priced in USD or CAD, delivered across both countries.' },
  { icon: '💬', title: 'Real people on support', copy: 'Talk to someone who knows tents, not a ticket queue.' }
];

// How the print-coverage choice actually changes the tent.
const coverage = [
  { id: 'top', title: 'Canopy top', copy: 'Your artwork across all four roof panels — the highest-visibility surface from a distance.' },
  { id: 'top-valance', title: 'Top + valance', copy: 'Adds the hanging skirt at eye level, where people read it as they walk past.' },
  { id: 'top-inside', title: 'Top + valance + inside', copy: 'Prints the underside too, so everyone standing in your booth sees the brand.' }
];

const frames = [
  { id: 'steel', title: 'Steel — economy', copy: 'Heaviest and lowest cost. Best where the tent lives in one place and rarely moves.' },
  { id: 'aluminium', title: 'Commercial aluminium', copy: 'The everyday choice. Noticeably lighter to carry and set up, holds up to weekly use.' },
  { id: 'hex', title: 'Heavy-duty hex', copy: 'Thickest legs and strongest joints — for crews setting up and tearing down constantly.' }
];

const solutions = [
  { icon: '🧺', title: 'Vendor & market booths', copy: 'Weekend markets and craft fairs where the booth is the storefront.' },
  { icon: '🎪', title: 'Trade shows', copy: 'Outdoor expo space that needs to match your indoor booth branding.' },
  { icon: '🏟️', title: 'Sports & tailgates', copy: 'Team colours, shade for the bench, and something to find in a crowded lot.' },
  { icon: '🌮', title: 'Food trucks & concessions', copy: 'Menu on the valance, shade over the queue.' },
  { icon: '⛪', title: 'Churches & schools', copy: 'Registration desks, fundraisers and open days.' },
  { icon: '🏗️', title: 'Job sites & safety', copy: 'Shade and a visible company mark on active sites.' }
];

const steps = [
  { n: 1, title: 'Configure and see the price', copy: 'Pick size, frame, print coverage and walls. The price updates as you go — no quote form.' },
  { n: 2, title: 'Upload your artwork', copy: 'Send a print-ready file or build one in the Design Studio.' },
  { n: 3, title: 'Approve the proof', copy: 'We send a visual proof. Nothing prints until you say yes.' },
  { n: 4, title: 'We print and ship', copy: 'Production runs after approval, then it ships to your door.' }
];

export default function HomePage() {
  useDocumentMeta(
    'Custom Printed Canopy Tents — Instant Pricing',
    brand.description
  );
  const money = useMoney();
  const [products, setProducts] = useState([]);
  const [canopy, setCanopy] = useState(null);

  useEffect(() => {
    let alive = true;
    getProducts().then((p) => alive && setProducts(p)).catch(() => {});
    // Full product (with optionGroups) so size cards show real catalog prices.
    getProduct('canopy-tents').then((p) => alive && setCanopy(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const sizes = useMemo(() => {
    const group = canopy?.pricing?.optionGroups?.find((g) => g.id === 'size');
    return group?.choices || [];
  }, [canopy]);

  const byCategory = useMemo(() => {
    const map = {};
    for (const p of products) (map[p.category] ||= []).push(p);
    return map;
  }, [products]);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Custom printed canopy tents</span>
            <h1>Your brand on a tent, priced before you ask.</h1>
            <p>
              Choose the size, frame and how much of the canopy gets printed — the price updates as
              you go. No quote forms, no waiting on a sales rep. Free artwork proof on every order.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-red" to="/products/canopy-tents">Build your canopy</Link>
              <Link className="btn btn-outline" to="/products/canopy-packages">See packages</Link>
            </div>
            <ul className="hero-ticks">
              <li>Live pricing</li>
              <li>Proof before production</li>
              <li>Ships US &amp; Canada</li>
            </ul>
          </div>
          <div className="hero-art">
            <CanopyPreview size="10x20" print="top-valance" walls={2} label="Custom printed canopy tent" />
          </div>
        </div>
      </section>

      {/* Size picker — the primary entry point on a canopy site */}
      <section className="size-section">
        <div className="section-head">
          <h2>Start with a size</h2>
          <p>Every size is printed to order. 10&nbsp;×&nbsp;10 is the standard vendor booth.</p>
        </div>
        <div className="size-grid">
          {sizes.length === 0
            ? <p className="muted">Loading sizes…</p>
            : sizes.map((s) => (
                <Link className="size-card" to="/products/canopy-tents" key={s.id}>
                  <CanopyPreview size={s.id} print="top" walls={0} label={`${s.label} canopy`} />
                  <div className="size-card-body">
                    <strong>{s.label}</strong>
                    <span>from {money(s.price, { cents: false })}</span>
                  </div>
                </Link>
              ))}
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

      {/* Print coverage explainer */}
      <section className="coverage-section">
        <div className="section-head">
          <h2>Decide how much gets printed</h2>
          <p>Coverage is the biggest lever on both impact and price.</p>
        </div>
        <div className="coverage-grid">
          {coverage.map((c) => (
            <article className="coverage-card" key={c.id}>
              <CanopyPreview size="10x10" print={c.id} walls={0} label={c.title} />
              <h3>{c.title}</h3>
              <p>{c.copy}</p>
            </article>
          ))}
        </div>
        <div className="section-foot">
          <Link className="btn btn-blue" to="/products/canopy-tents">Compare coverage and price</Link>
        </div>
      </section>

      {/* Frame comparison */}
      <section className="frame-section">
        <div className="section-head">
          <h2>Pick a frame that matches the use</h2>
          <p>The frame decides how long the tent survives repeated setups and weather.</p>
        </div>
        <div className="frame-grid">
          {frames.map((f) => (
            <article className="frame-card" key={f.id}>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works — replaces the old placeholder testimonials */}
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

      {/* Catalog */}
      <div className="catalog-shell">
        <CategorySidebar />
        <main className="catalog-main">
          <div className="catalog-heading">
            <h1>Shop the range</h1>
            <p>Tents, packages, walls and the hardware that goes with them.</p>
          </div>

          {products.length === 0 ? (
            <p className="muted">Loading products…</p>
          ) : (
            [
              { id: 'tents', title: 'Canopy tents', blurb: 'Printed to order in six footprints.' },
              { id: 'packages', title: 'Packages', blurb: 'Complete booth kits, cheaper than à-la-carte.' },
              { id: 'walls', title: 'Sidewalls', blurb: 'Add weather protection and branding surface.' },
              { id: 'accessories', title: 'Accessories', blurb: 'Weights, stakes, bags and lighting.' },
              { id: 'events', title: 'Event add-ons', blurb: 'Table covers, flags and stands to match your booth.' }
            ].map((rail) => {
              const items = byCategory[rail.id] || [];
              if (!items.length) return null;
              return (
                <section className="cat-rail" key={rail.id}>
                  <div className="cat-rail-head">
                    <div>
                      <h2>{rail.title}</h2>
                      <p>{rail.blurb}</p>
                    </div>
                  </div>
                  <div className="pcard-grid">
                    {items.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>

      {/* Closing CTA */}
      <section className="turnaround-band">
        <p className="turn-main">Most canopies ship in 6–8 business days after proof approval</p>
        <p className="turn-sub">Need it sooner? Ask us about rush production before you order.</p>
        <Link className="btn btn-red" to="/products/canopy-tents">Build your canopy</Link>
      </section>
    </>
  );
}

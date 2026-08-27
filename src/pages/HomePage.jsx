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
// Each card uses a DIFFERENT customer brand (from the showcase set) so the
// range reads as "we print any brand", not all-Apex.
const categoryCards = [
  { title: 'Custom Canopies', copy: 'Printed pop-up tents & walls', to: '/custom-canopies', img: '/images/showcase/canopy-nova-tech.webp' },
  { title: 'Banner Stands', copy: 'Retractable & X-stand banners', to: '/banner-stands', img: '/images/displays/standard-retractable-front-back.png' },
  { title: 'Banners', copy: 'Vinyl, mesh & fabric banners', to: '/banners', img: '/images/banners/13oz-vinyl-banner-burger-landscape.jpeg' },
  { title: 'Table Covers', copy: 'Pleated & stretch throws', to: '/table-covers', img: '/images/showcase/tablecover-brightpath-dental.webp' },
  { title: 'Backdrops', copy: 'Step & repeat media walls', to: '/backdrops', img: '/images/showcase/backdrop-oakwood.jpeg' },
  { title: 'Flags', copy: 'Feather & teardrop flags', to: '/flags', img: '/images/flags/feather_angled_flag_taco_vista_large_cross_base.png' },
  { title: 'SEG Modular Kits', copy: 'Illuminated modular booths', to: '/seg-displays', img: '/images/seg-kits/apex-seg-modular-kit-a-main.jpeg' },
  { title: 'Trade Show Displays', copy: 'Shop the complete range', to: '/trade-show-displays', img: '/images/showcase/canopy-harbor-realty.webp' },
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

// Shop-by-industry browse aid. Industries link to the full trade show display
// range (no per-industry pages are invented).
const industries = [
  'Technology', 'Healthcare', 'Construction', 'Food & Beverage',
  'Manufacturing', 'Beauty & Wellness', 'Automotive', 'Education'
];

// Shop-by-event-type — maps an event to the most relevant category.
const eventTypes = [
  { label: 'Trade Shows & Expos', to: '/trade-show-displays' },
  { label: 'Conventions', to: '/backdrops' },
  { label: 'Outdoor Events & Markets', to: '/custom-canopies' },
  { label: 'Grand Openings', to: '/flags' },
  { label: 'Conferences', to: '/banner-stands' },
  { label: 'Festivals & Fairs', to: '/custom-canopies' }
];

// Popular cities — links to the enriched local landing pages.
const popularCities = [
  ['Las Vegas', 'las-vegas'], ['Orlando', 'orlando'], ['Chicago', 'chicago'],
  ['Atlanta', 'atlanta'], ['Dallas', 'dallas'], ['New York', 'new-york'],
  ['Houston', 'houston'], ['Los Angeles', 'los-angeles'], ['Miami', 'miami'],
  ['San Diego', 'san-diego'], ['Phoenix', 'phoenix'], ['Washington, D.C.', 'washington-dc']
];

// Buying guides — real published articles.
const buyingGuides = [
  { title: 'What a custom trade show display costs', to: '/blog/trade-show-display-cost' },
  { title: '10×10 vs 10×15 vs 10×20 canopy tents', to: '/blog/10x10-vs-10x15-vs-10x20-custom-canopy-tents' },
  { title: 'Feather angled vs convex vs teardrop flags', to: '/blog/feather-angled-vs-convex-vs-teardrop-flags' },
  { title: 'SEG modular kit A vs B vs C', to: '/blog/seg-modular-kit-a-vs-b-vs-c' },
  { title: 'Standard vs deluxe retractable banner', to: '/blog/standard-vs-deluxe-retractable-banner' },
  { title: 'Pleated vs stretch table covers', to: '/blog/pleated-vs-stretch-table-cover' }
];

// Homepage FAQ (real answers; FAQPage schema is emitted by the prerenderer).
const homeFaqs = [
  { q: 'What does Apex Trade Show print?', a: 'Custom trade show displays and event branding — canopy tents, retractable and X-stand banner stands, step & repeat backdrops, table covers, vinyl/mesh/fabric banners and feather flags — all printed to order in your brand.' },
  { q: 'How does pricing work?', a: 'Canopy tents, banner stands, backdrops, table covers, banners and flags configure for instant online pricing. Larger custom displays — SEG modular kits, tension-fabric and pop-up displays — are quoted per order.' },
  { q: 'How fast can I get my order?', a: 'Standard production is 6–8 business days after you approve your free artwork proof, with an optional 2–3 business day rush. Shipping and transit time are added and vary by destination.' },
  { q: 'Do you ship nationwide?', a: 'Yes. Apex is an online supplier and ships custom displays across the United States and Canada.' },
  { q: 'Do I see my artwork before it prints?', a: 'Yes — every order includes a free digital artwork proof, and nothing goes to production until you approve it in writing.' },
  { q: 'Can I order a whole booth from one place?', a: 'Yes. You can order every branded piece of your booth from Apex so it all matches — request a quote and we coordinate the set.' }
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

  const loading = products.length === 0;
  // Skeleton cards reserve the exact grid space while products load, so the
  // async fetch doesn't shift the layout (fixes CLS).
  const skeletons = (n) =>
    Array.from({ length: n }).map((_, i) => (
      <div className="pcard pcard-skel" key={`sk-${i}`} aria-hidden="true">
        <div className="pcard-media" />
        <div className="pcard-body">
          <div className="skel-line" />
          <div className="skel-line short" />
        </div>
      </div>
    ));

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
          {/* Booth collage — displays we print, in a range of customer brands */}
          <div className="hero-collage" aria-label="Trade show displays Apex prints in any brand: canopy, table cover, banner and backdrop">
            <div className="hc-tile hc-canopy"><TentPhoto size="10x20" walls={3} label="Custom printed canopy tent" /></div>
            <div className="hc-tile"><img src="/images/showcase/tablecover-corner-cafe.webp" alt="Custom printed table cover for a customer's brand" loading="eager" fetchpriority="high" decoding="async" width="600" height="450" /></div>
            <div className="hc-tile"><img src="/images/showcase/xstand-sunset-yoga.webp" alt="Custom printed banner for a customer's brand" loading="eager" decoding="async" width="600" height="450" /></div>
            <div className="hc-tile"><img src="/images/colorways/backdrop-red.webp" alt="Custom step & repeat backdrop" loading="eager" decoding="async" width="600" height="450" /></div>
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

      {/* Shop by industry / event type */}
      <section className="browse-band">
        <div className="section-head">
          <h2>Shop by industry</h2>
          <p>Custom booth displays for every kind of exhibitor.</p>
        </div>
        <div className="chip-row">
          {industries.map((i) => (
            <Link className="browse-chip" to="/trade-show-displays" key={i}>{i}</Link>
          ))}
        </div>
        <div className="section-head browse-subhead">
          <h2>Shop by event type</h2>
        </div>
        <div className="chip-row">
          {eventTypes.map((e) => (
            <Link className="browse-chip" to={e.to} key={e.label}>{e.label}</Link>
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
      <section className="size-section">
        <div className="section-head">
          <h2>Featured across the range</h2>
          <p>A mix of what Apex prints for your booth.</p>
        </div>
        <div className="pcard-grid">
          {loading
            ? skeletons(featuredSlugs.length)
            : featured.map((p) => {
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

      {/* Custom canopies — still an important, dedicated category */}
      <section className="size-section">
        <div className="section-head">
          <h2>{c('home.sizes.title')}</h2>
          <p>{c('home.sizes.subtitle')}</p>
        </div>
        <div className="pcard-grid">
          {loading
            ? skeletons(3)
            : canopyProducts.map((p) => {
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

      {/* Trade show buying guides */}
      <section className="guides-section">
        <div className="section-head">
          <h2>Trade show buying guides</h2>
          <p>Practical, no-jargon guides to help you choose and print your booth.</p>
        </div>
        <div className="guides-grid">
          {buyingGuides.map((g) => (
            <Link className="guide-card" to={g.to} key={g.to}>
              <span>{g.title}</span>
              <span className="guide-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="section-more">
          <Link className="btn btn-outline" to="/blog">All guides &amp; resources</Link>
        </div>
      </section>

      {/* Popular cities */}
      <section className="cities-section">
        <div className="section-head">
          <h2>Trade show displays by city</h2>
          <p>Printed to order and shipped across the US &amp; Canada.</p>
        </div>
        <div className="chip-row">
          {popularCities.map(([label, slug]) => (
            <Link className="browse-chip" to={`/trade-show-displays/${slug}`} key={slug}>{label}</Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-head">
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {homeFaqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
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

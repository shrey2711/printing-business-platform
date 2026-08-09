import { Link } from 'react-router-dom';

// Tent accessories block for the products page. Sandbags is a real priced
// add-on (configured on any canopy); flags and hardware route to a quote so we
// never advertise a price we haven't set.
const ITEMS = [
  {
    title: 'Leg Sandbags (Set of 4)',
    img: '/images/tents/sandbags.webp',
    price: '$50 / set of 4',
    copy: 'Weight bags to anchor all four legs — most venues require weights. Add them to any canopy in the configurator.',
    to: '/products/canopy-tent-10x10',
    cta: 'Add to a canopy'
  },
  {
    title: 'Tent Flag Kit',
    icon: '🚩',
    copy: 'Tent-compatible feather flag to mark your booth and pull traffic from across the lot.',
    to: '/quote',
    cta: 'Request a quote'
  },
  {
    title: 'Hardware & Carry Bags',
    icon: '🧰',
    copy: 'Replacement frames, leg weights and wheeled carry bags for your canopy.',
    to: '/quote',
    cta: 'Request a quote'
  }
];

export default function AccessoriesSection() {
  return (
    <section className="acc-section">
      <div className="section-head">
        <h2>Tent Accessories</h2>
        <p>Weights, flags and hardware to complete your booth.</p>
      </div>
      <div className="acc-grid">
        {ITEMS.map((it) => (
          <Link className="acc-card" to={it.to} key={it.title}>
            <div className="acc-media">
              {it.img ? (
                <img src={it.img} alt={it.title} loading="lazy" decoding="async" />
              ) : (
                <span className="acc-icon" aria-hidden="true">{it.icon}</span>
              )}
            </div>
            <div className="acc-body">
              <h3>{it.title}</h3>
              {it.price && <span className="acc-price">{it.price}</span>}
              <p>{it.copy}</p>
              <span className="acc-cta">{it.cta} ›</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

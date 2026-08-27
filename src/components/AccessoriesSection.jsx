import { Link } from 'react-router-dom';

// Tent accessories block for the products page. Sandbags is a real priced
// add-on (configured on any canopy); flags and hardware route to a quote so we
// never advertise a price we haven't set.
const TENT_ITEMS = [
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
    img: '/images/tents/flag-kit.webp',
    copy: 'Tent-compatible feather flag to mark your booth and pull traffic from across the lot.',
    to: '/quote',
    cta: 'Request a quote'
  },
  {
    title: 'Hardware & Carry Bags',
    img: '/images/tents/hardware-carry-bags.webp',
    copy: 'Replacement frames, leg weights and wheeled carry bags for your canopy.',
    to: '/quote',
    cta: 'Request a quote'
  }
];

// Accessories to complete a banner-stand order. Real photo for the LED light;
// replacement graphic + carry bag are existing, generic add-ons (already noted
// in the products) shown with an icon. All quote-based — no invented prices.
export const BANNER_ACCESSORIES = [
  {
    title: 'LED Light for Banner Stand',
    img: '/images/displays/led-light-banner-stand.jpg',
    copy: 'Clip-on LED spotlight to illuminate your banner graphic at shows, lobbies and events.',
    to: '/quote',
    cta: 'Request a quote'
  },
  {
    title: 'Replacement Support Pole',
    img: '/images/displays/banner-stand-pole.jpg',
    copy: 'Telescopic aluminum support pole to replace a lost or damaged one on your retractable stand.',
    to: '/quote',
    cta: 'Request a quote'
  },
  {
    title: 'Replacement Printed Graphic',
    icon: '🖼️',
    copy: 'Reprint your banner with new artwork and reuse the existing hardware.',
    to: '/quote',
    cta: 'Request a quote'
  },
  {
    title: 'Padded Carry Bag',
    icon: '🎒',
    copy: 'Protective travel bag to transport your banner stand safely between shows.',
    to: '/quote',
    cta: 'Request a quote'
  }
];

export default function AccessoriesSection({
  items = TENT_ITEMS,
  title = 'Tent Accessories',
  subtitle = 'Weights, flags and hardware to complete your booth.'
}) {
  return (
    <section className="acc-section">
      <div className="section-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="acc-grid">
        {TENT_ITEMS.map((it) => (
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

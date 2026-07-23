import { brand } from '../config/brand';

export default function ContactPage() {
  return (
    <main className="page">
      <section className="contact-card card">
        <span className="eyebrow">Get in touch</span>
        <h1>Let's talk about your canopy order</h1>
        <p>
          We print branded canopy tents for market vendors, teams, event organisers and brands across
          the US and Canada — with instant online pricing, a free artwork proof, and no sales rep
          standing between you and a price.
        </p>

        <div className="contact-grid">
          <article className="contact-item">
            <h3>📧 Email</h3>
            <p><a href={`mailto:${brand.email}`}>{brand.email}</a></p>
          </article>
          <article className="contact-item">
            <h3>📞 Phone</h3>
            <p><a href={`tel:${brand.phoneHref}`}>{brand.phone}</a></p>
          </article>
          <article className="contact-item">
            <h3>🕒 Hours</h3>
            <p>{brand.hours}</p>
          </article>
          <article className="contact-item">
            <h3>🚚 Shipping</h3>
            <p>{brand.shippingBlurb}</p>
          </article>
          <article className="contact-item">
            <h3>🎨 Artwork help</h3>
            <p>Free file checks &amp; design assistance</p>
          </article>
          <article className="contact-item">
            <h3>🤝 Wholesale</h3>
            <p>Reseller &amp; trade pricing on request</p>
          </article>
        </div>
      </section>
    </main>
  );
}

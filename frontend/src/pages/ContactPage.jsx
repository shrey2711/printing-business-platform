export default function ContactPage() {
  return (
    <main className="page">
      <section className="contact-card card">
        <span className="eyebrow">Get in touch</span>
        <h1>Let's talk about your next print order</h1>
        <p>
          We're a wholesale trade printer supporting sign shops, resellers, and brands across the United States
          with fast quotes, professional finishing, blind shipping, and dependable delivery.
        </p>

        <div className="contact-grid">
          <article className="contact-item">
            <h3>📧 Email</h3>
            <p><a href="mailto:sales@printusa.com">sales@printusa.com</a></p>
          </article>
          <article className="contact-item">
            <h3>📞 Phone</h3>
            <p><a href="tel:+18005550148">1 (800) 555-0148</a></p>
          </article>
          <article className="contact-item">
            <h3>🕒 Hours</h3>
            <p>Mon–Fri • 8:00 AM – 6:00 PM ET</p>
          </article>
          <article className="contact-item">
            <h3>🚚 Shipping</h3>
            <p>Nationwide • Blind shipping available</p>
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

import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { submitQuote } from '../services/api';

export default function QuotePage() {
  const location = useLocation();
  const prefill = location.state || {};

  const initialState = {
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    product: prefill.product || 'Vinyl Banners',
    quantity: prefill.quantity ? String(prefill.quantity) : '1',
    specs: prefill.specs || '',
    estimatedPrice: prefill.estimatedPrice || '',
    description: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The submit button goes live (theme blue) only once the required fields —
  // name, email, quantity and project details — are filled; dimmed otherwise.
  // Artwork must be a PDF or a JPEG. Anything else — an AI file, a screenshot
  // pasted into a Word document — cannot go to print without being redrawn, and
  // finding that out after the quote wastes a day for both sides.
  const ACCEPTED = ['application/pdf', 'image/jpeg'];
  const fileOk = !file || ACCEPTED.includes(file.type) || /\.(pdf|jpe?g)$/i.test(file.name);

  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.address.trim() &&
    formData.country.trim() &&
    formData.quantity.trim() &&
    formData.description.trim() &&
    fileOk;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      if (file) payload.append('file', file);

      const res = await submitQuote(payload);
      setReference(res.reference || '');
      setStatus({ type: 'success', message: 'Quote request sent! Our team will reach out shortly.' });
      setFormData({ ...initialState, product: formData.product });
      setFile(null);
    } catch (error) {
      setStatus({ type: 'error', message: 'We could not submit your request right now. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="quote-card card">
        <span className="eyebrow">Request an order or custom quote</span>
        <h1>Tell us about your print job</h1>
        <p>Confirm your details and upload artwork. We'll send a proof and final pricing before anything prints.</p>

        {prefill.estimatedPrice ? (
          <div className="prefill-banner">
            <div>
              <strong>{prefill.product}</strong>
              <span>{prefill.specs}</span>
            </div>
            <div className="prefill-price">
              Est. <strong>{prefill.estimatedPrice}</strong>
            </div>
          </div>
        ) : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">Business email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">Delivery address *</label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, city, state and postal code"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="country">Country *</label>
              <input id="country" name="country" value={formData.country} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="product">Product</label>
            <input id="product" name="product" value={formData.product} onChange={handleChange} />
          </div>

          {formData.specs ? (
            <div className="field">
              <label htmlFor="specs">Selected specs</label>
              <input id="specs" name="specs" value={formData.specs} onChange={handleChange} />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="file">Upload artwork (PDF or JPEG)</label>
            <input
              id="file"
              type="file"
              accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && !fileOk ? (
              <p className="field-error">
                {file.name} is not a PDF or JPEG. Those are the two formats we can send straight to
                print — please export and try again.
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="description">Project details / notes</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <button className="btn btn-blue btn-block" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>

        {status.message ? (
          <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
            {status.message}
            {reference ? <div className="ref">Reference: <strong>{reference}</strong></div> : null}
            {status.type === 'success' ? (
              <div><Link to="/products">← Continue browsing products</Link></div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

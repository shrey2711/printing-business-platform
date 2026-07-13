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
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
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
            <label htmlFor="file">Upload artwork (PDF, AI, PNG, JPG)</label>
            <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="field">
            <label htmlFor="description">Project details / notes</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
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

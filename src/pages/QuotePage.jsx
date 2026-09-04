import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { submitQuote } from '../services/api';
import { ARTWORK_SPEC, MAX_LABEL, validateArtwork, validatePdfPages } from '../lib/artworkSpec';
import { validateContact, formatAddress } from '../lib/contactValidation';
import { countryOptions, POSTAL, NO_POSTAL, DIAL } from '../data/countries';

// Built once: 235 entries, and the list never changes while the page is open.
const COUNTRIES = countryOptions();

export default function QuotePage() {
  const location = useLocation();
  const prefill = location.state || {};

  const initialState = {
    name: '',
    email: '',
    phone: '',
    // Structured rather than one free-text box: a postal code can only be
    // checked against its country if it arrives in its own field.
    street: '',
    city: '',
    state: '',
    postal: '',
    country: '',
    product: prefill.product || 'Vinyl Banners',
    quantity: prefill.quantity ? String(prefill.quantity) : '1',
    specs: prefill.specs || '',
    estimatedPrice: prefill.estimatedPrice || '',
    description: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A multi-page PDF is the one problem that cannot be seen from the file name
  // or size, so the bytes are read here to count pages before submitting.
  const handleFile = async (event) => {
    const picked = event.target.files?.[0] || null;
    setFile(picked);
    setFileError(null);
    if (!picked) return;

    const basic = validateArtwork(picked);
    if (!basic.ok) { setFileError(basic.error); return; }

    if (/\.pdf$/i.test(picked.name)) {
      try {
        const pages = validatePdfPages(await picked.arrayBuffer(), picked.name);
        if (!pages.ok) setFileError(pages.error);
      } catch {
        // An unreadable file is not necessarily invalid; prepress will catch it.
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The submit button goes live (theme blue) only once the required fields —
  // name, email, quantity and project details — are filled; dimmed otherwise.
  // Checked here so the customer finds out while they can still fix it, rather
  // than in prepress a day later. The same rules run on the server.
  const artworkError = fileError || (file ? (validateArtwork(file).error || null) : null);
  const fileOk = !artworkError;

  // Hints that follow the chosen country, so someone in Canada is shown a
  // Canadian example rather than a US one.
  const postalRule = POSTAL[formData.country];
  const postalLabel = NO_POSTAL.has(formData.country)
    ? 'Postal code (not used here)'
    : `${formData.country === 'US' ? 'ZIP code' : 'Postal code'} *`;
  const postalHint = postalRule ? `e.g. ${postalRule.hint}` : '';
  const dialHint = DIAL[formData.country] ? `+${DIAL[formData.country]} …` : '';

  const contactCheck = validateContact(formData);

  const canSubmit = contactCheck.ok && formData.quantity.trim() && formData.description.trim() && fileOk;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Surface everything wrong at once rather than one field at a time.
    const check = validateContact(formData);
    if (!check.ok) {
      setErrors(check.errors);
      setStatus({ type: 'error', message: 'Please correct the highlighted details.' });
      setIsSubmitting(false);
      return;
    }
    setErrors({});

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      // One readable line for the email and the record, alongside the parts.
      payload.append('address', formatAddress(formData));
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
              <label htmlFor="name">Your name *</label>
              <input id="name" name="name" value={formData.name} onChange={handleChange} required />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="email">Business email *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="country">Country *</label>
              <select id="country" name="country" value={formData.country} onChange={handleChange} required>
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              {errors.country ? <p className="field-error">{errors.country}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="phone">Phone *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={dialHint}
                required
              />
              {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
            </div>
          </div>

          <div className="field">
            <label htmlFor="street">Street address *</label>
            <input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Building number and street"
              required
            />
            {errors.street ? <p className="field-error">{errors.street}</p> : null}
          </div>

          <div className="three-col">
            <div className="field">
              <label htmlFor="city">City *</label>
              <input id="city" name="city" value={formData.city} onChange={handleChange} required />
              {errors.city ? <p className="field-error">{errors.city}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="state">State / province</label>
              <input id="state" name="state" value={formData.state} onChange={handleChange} />
              {errors.state ? <p className="field-error">{errors.state}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="postal">{postalLabel}</label>
              <input
                id="postal"
                name="postal"
                value={formData.postal}
                onChange={handleChange}
                placeholder={postalHint}
              />
              {errors.postal ? <p className="field-error">{errors.postal}</p> : null}
            </div>
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
              onChange={handleFile}
            />
            {artworkError ? <p className="field-error">{artworkError}</p> : null}
            <details className="artwork-spec">
              <summary>Artwork requirements</summary>
              <dl>
                {ARTWORK_SPEC.map(([term, detail]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Rather send it by email? Submit this form and reply to the confirmation with your
                artwork attached.
              </p>
            </details>
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

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { getReviewInvite, submitReview } from '../services/api';
import { brand } from '../config/brand';

const STATE_COPY = {
  used: 'A review has already been submitted with this link. Thank you!',
  expired: 'This review link has expired.',
  missing: 'This review link is not valid.'
};

// Reached only from the post-delivery review email: the token ties the review
// to a real, shipped order, which is what makes it a verified purchase.
export default function ReviewPage() {
  useDocumentMeta('Write a Review', 'Review your Apex Trade Show order.', null, 'noindex, nofollow');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: '', body: '', authorName: '', authorLocation: '' });
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!token) { setInvite({ state: 'missing' }); return; }
    getReviewInvite(token).then((d) => {
      setInvite(d);
      if (d.state === 'ok') setForm((f) => ({ ...f, authorName: d.suggestedName || '' }));
    });
  }, [token]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setStatus('sending');
    try {
      await submitReview(token, form);
      setStatus('done');
    } catch (err) {
      const body = err.response?.data;
      if (body?.state) setInvite({ state: body.state });
      setErrors(body?.errors || [body?.error || 'Something went wrong. Please try again.']);
      setStatus('idle');
    }
  }

  let content;
  if (!invite) {
    content = <p className="muted">Loading…</p>;
  } else if (status === 'done') {
    content = (
      <>
        <h1>Thank you for your review</h1>
        <p>We read every review before it goes live on the product page. It usually appears within a couple of days.</p>
        <p><Link className="btn btn-outline" to="/products">Back to the shop</Link></p>
      </>
    );
  } else if (invite.state !== 'ok') {
    content = (
      <>
        <h1>Write a review</h1>
        <p>{STATE_COPY[invite.state] || STATE_COPY.missing}</p>
        <p>Questions? Email <a href={`mailto:${brand.email}`}>{brand.email}</a>.</p>
      </>
    );
  } else {
    content = (
      <>
        <h1>How was your {invite.product.name}?</h1>
        <p className="muted">Your honest review helps other exhibitors choose. It is published on the product page after a quick check.</p>
        <form className="review-form" onSubmit={onSubmit}>
          <div>
            <span style={{ fontWeight: 600 }}>Your rating</span>
            <div className="star-picker" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className={n <= form.rating ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, rating: n }))}>★</button>
              ))}
            </div>
          </div>
          <label>Headline (optional)
            <input value={form.title} onChange={set('title')} maxLength={120} placeholder="e.g. Colours matched our brand perfectly" />
          </label>
          <label>Your review
            <textarea value={form.body} onChange={set('body')} maxLength={2000} required
              placeholder="How was the print quality, setup, and how did it look at your event?" />
          </label>
          <label>Name to show
            <input value={form.authorName} onChange={set('authorName')} maxLength={60} required />
          </label>
          <label>City (optional)
            <input value={form.authorLocation} onChange={set('authorLocation')} maxLength={60} placeholder="e.g. Vancouver, BC" />
          </label>
          {errors.length > 0 && <ul className="form-errors">{errors.map((m) => <li key={m}>{m}</li>)}</ul>}
          <button className="btn btn-red" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit review'}
          </button>
        </form>
      </>
    );
  }

  return (
    <main className="page">
      <section className="card" style={{ maxWidth: 720, margin: '0 auto' }}>{content}</section>
    </main>
  );
}

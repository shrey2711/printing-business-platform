import { useEffect, useState } from 'react';
import { listReviews, setReviewStatus, addReceivedReview, listReviewRequests, sendReviewRequest } from '../../services/admin';
import { getProducts } from '../../services/api';
import { Stars } from '../../components/ProductReviews';

const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso)) / 86400000) : null);
const EMPTY = { productSlug: '', rating: 5, title: '', body: '', authorName: '', authorLocation: '', sourceNote: '', permission: false };

// Three jobs: ask shipped customers for a review once the parcel has had time to
// arrive, moderate what comes back, and record reviews customers gave elsewhere.
export default function ReviewsTab({ onError, onFlash }) {
  const [filter, setFilter] = useState('pending');
  const [reviews, setReviews] = useState(null);
  const [requests, setRequests] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState('');

  const loadReviews = () => listReviews(filter).then(setReviews).catch((e) => onError(e.message));
  const loadRequests = () => listReviewRequests().then(setRequests).catch((e) => onError(e.message));

  useEffect(() => { loadReviews(); }, [filter]);
  useEffect(() => { loadRequests(); getProducts().then(setProducts).catch(() => {}); }, []);

  async function moderate(id, status) {
    setBusy(id);
    try {
      await setReviewStatus(id, status);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      onFlash(status === 'approved' ? 'Review approved — the site will rebuild to show it.' : `Review ${status}.`);
    } catch (e) { onError(e.message); }
    setBusy('');
  }

  async function ask(orderId) {
    setBusy(orderId);
    try {
      const r = await sendReviewRequest(orderId);
      setRequests((prev) => prev.filter((o) => o.id !== orderId));
      onFlash(r.email?.sent ? 'Review request emailed.' : `Link created, but the email did not send (${r.email?.reason || 'unknown'}).`);
    } catch (e) { onError(e.message); }
    setBusy('');
  }

  async function saveReceived(e) {
    e.preventDefault();
    setBusy('form');
    try {
      await addReceivedReview({ ...form, rating: Number(form.rating) });
      setForm(null);
      onFlash('Review added to Pending — approve it to publish.');
      if (filter === 'pending') loadReviews();
    } catch (err) { onError(err.message); }
    setBusy('');
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <h3>Ask for reviews</h3>
      <p className="muted">Shipped orders that have not been asked yet. Orders ship direct from production, so wait until the parcel has had time to arrive (usually 2–3 weeks) before sending.</p>
      {!requests ? <p className="muted">Loading…</p> : !requests.length ? (
        <div className="empty-state card"><p>No shipped orders waiting for a review request.</p></div>
      ) : (
        <div className="admin-table card">
          {requests.map((o) => {
            const d = daysSince(o.shipped_at);
            return (
              <div className="cms-row" key={o.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="wrap"><strong>{o.product}</strong><br /><small className="muted">{o.customer_name || 'Customer'} · {d === null ? 'ship date not recorded' : `shipped ${d} day${d === 1 ? '' : 's'} ago`}</small></span>
                <button className="btn btn-outline btn-sm" disabled={busy === o.id} onClick={() => ask(o.id)}>Request review</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="tab-head" style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
        <h3 style={{ margin: 0 }}>Reviews</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['pending', 'approved', 'rejected'].map((s) => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-blue' : 'btn-outline'}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
          <button className="btn btn-red btn-sm" onClick={() => setForm({ ...EMPTY })}>+ Add a review you received</button>
        </div>
      </div>

      {form && (
        <form className="review-form card" style={{ margin: '1rem 0', padding: '1.2rem', maxWidth: 'none' }} onSubmit={saveReceived}>
          <p className="muted" style={{ margin: 0 }}>For a real review a customer gave you by email, on Google or in person. Only add it if they agreed to have it published on the site.</p>
          <label>Product
            <select value={form.productSlug} onChange={set('productSlug')} required>
              <option value="">Choose…</option>
              {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </label>
          <label>Rating
            <select value={form.rating} onChange={set('rating')}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select>
          </label>
          <label>Headline (optional)<input value={form.title} onChange={set('title')} maxLength={120} /></label>
          <label>Review text, in the customer's words<textarea value={form.body} onChange={set('body')} required maxLength={2000} /></label>
          <label>Customer name as shown (e.g. "Jane S.")<input value={form.authorName} onChange={set('authorName')} required maxLength={60} /></label>
          <label>City (optional)<input value={form.authorLocation} onChange={set('authorLocation')} maxLength={60} /></label>
          <label>Where it came from<input value={form.sourceNote} onChange={set('sourceNote')} required maxLength={200} placeholder="e.g. Email from customer, 12 Sep 2026" /></label>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 400 }}>
            <input type="checkbox" checked={form.permission} onChange={set('permission')} required /> The customer agreed to have this review published.
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-red" type="submit" disabled={busy === 'form'}>Save to pending</button>
            <button className="btn btn-outline" type="button" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      {!reviews ? <p className="muted">Loading reviews…</p> : !reviews.length ? (
        <div className="empty-state card"><p>No {filter} reviews.</p></div>
      ) : (
        <ul className="reviews-list" style={{ marginTop: '1rem' }}>
          {reviews.map((r) => (
            <li className="review" key={r.id}>
              <Stars rating={r.rating} /> <small className="muted mono">/products/{r.product_slug}</small>
              {r.title && <h3 className="review-title">{r.title}</h3>}
              <p className="review-body">{r.body}</p>
              <p className="review-meta">
                {r.author_name}{r.author_location ? `, ${r.author_location}` : ''} · {r.verified_purchase ? 'Verified order' : `Added by staff — ${r.source_note || 'no source noted'}`} · {new Date(r.created_at).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                {r.status !== 'approved' && <button className="btn btn-blue btn-sm" disabled={busy === r.id} onClick={() => moderate(r.id, 'approved')}>Approve</button>}
                {r.status !== 'rejected' && <button className="btn btn-outline btn-sm" disabled={busy === r.id} onClick={() => moderate(r.id, 'rejected')}>{r.status === 'approved' ? 'Unpublish' : 'Reject'}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

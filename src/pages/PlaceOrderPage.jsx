import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeOrder, notifyOrderPlaced } from '../services/orders';
import { startCheckout, validateCoupon } from '../services/checkout';

export default function PlaceOrderPage() {
  const { user, isAuthenticated, isSupabaseReady, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state || {};

  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, label }
  const [couponMsg, setCouponMsg] = useState('');
  // Stable per-attempt key so retries/double-clicks don't create duplicate orders.
  const [idempotencyKey] = useState(() =>
    (crypto?.randomUUID?.() || `k-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  );

  const applyCouponCode = async () => {
    setCouponMsg('');
    if (!couponInput.trim()) return;
    const res = await validateCoupon(couponInput.trim());
    if (res.valid) {
      setCoupon({ code: res.code, label: res.label });
      setCouponMsg(`✓ ${res.label} applied`);
    } else {
      setCoupon(null);
      setCouponMsg('Invalid or expired code.');
    }
  };

  // Design can arrive as a dataURL (from Design Studio) or an uploaded file.
  const drawnDesign = incoming.design || null;

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;

  if (!isAuthenticated) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <h1>Sign in to place your order</h1>
          <p className="muted">Create an account or sign in to submit your order and artwork.</p>
          <div className="hero-actions" style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <Link className="btn btn-red" to="/login" state={{ from: '/order' }}>Sign in</Link>
            <Link className="btn btn-outline" to="/register">Create account</Link>
          </div>
        </div>
      </main>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const order = await placeOrder({
        user,
        product: incoming.product || 'Custom order',
        specs: incoming.specs || '',
        quantity: incoming.quantity || 1,
        estimatedPrice: incoming.estimatedPrice || '',
        notes,
        design: file || drawnDesign,
        config: incoming.config || null,
        idempotencyKey
      });

      // Fire confirmation + staff alert emails (best-effort).
      notifyOrderPlaced(order.id);

      // If the order has a priced config, try to send them straight to payment.
      if (incoming.config?.slug) {
        try {
          const checkout = await startCheckout(order.id, coupon?.code);
          if (checkout?.url) {
            window.location.href = checkout.url;
            return;
          }
        } catch {
          /* fall through to account — they can pay from there */
        }
      }
      navigate('/account', { state: { placed: order?.id } });
    } catch (err) {
      setError(err.message || 'Could not place the order.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <div className="order-layout">
        <form className="order-form card" onSubmit={submit}>
          <span className="eyebrow">Place your order</span>
          <h1>Confirm &amp; submit for printing</h1>

          <div className="order-summary">
            <div><span>Product</span><strong>{incoming.product || 'Custom order'}</strong></div>
            {incoming.specs && <div><span>Specs</span><strong>{incoming.specs}</strong></div>}
            <div><span>Quantity</span><strong>{incoming.quantity || 1}</strong></div>
            {incoming.estimatedPrice && (
              <div><span>Estimated price</span><strong>{incoming.estimatedPrice}</strong></div>
            )}
          </div>

          <div className="field">
            <label>Artwork</label>
            {drawnDesign ? (
              <div className="design-preview">
                <img src={drawnDesign} alt="Your design" />
                <span>✓ Design from the Design Studio attached</span>
              </div>
            ) : (
              <>
                <input type="file" accept="image/*,application/pdf,.ai,.eps"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <small>
                  Upload a print-ready file, or <Link to={`/design?product=${encodeURIComponent(incoming.product || '')}`}>draw it in the Design Studio</Link>.
                </small>
              </>
            )}
          </div>

          <div className="field">
            <label htmlFor="notes">Notes for our team</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Deadline, color notes, finishing details…" />
          </div>

          {incoming.config?.slug && (
            <div className="field">
              <label htmlFor="coupon">Coupon code</label>
              <div className="coupon-row">
                <input id="coupon" value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. WELCOME10" />
                <button type="button" className="btn btn-outline" onClick={applyCouponCode}>Apply</button>
              </div>
              {couponMsg && (
                <small className={coupon ? 'coupon-ok' : 'coupon-bad'}>{couponMsg}</small>
              )}
            </div>
          )}

          {!isSupabaseReady && (
            <div className="status-message status-error">
              Orders aren't connected yet — add Supabase keys (see DEPLOY.md) to enable ordering.
            </div>
          )}
          {error && <div className="status-message status-error">{error}</div>}

          <button className="btn btn-red" type="submit" disabled={busy || !isSupabaseReady}>
            {busy
              ? 'Submitting…'
              : incoming.config?.slug && incoming.estimatedPrice
                ? `Submit & pay ${incoming.estimatedPrice}`
                : 'Submit order'}
          </button>
          {incoming.config?.slug && (
            <p className="panel-foot">You'll be taken to secure Stripe checkout. If payment isn't set up yet,
              your order is still saved and we'll follow up.</p>
          )}
        </form>
      </div>
    </main>
  );
}

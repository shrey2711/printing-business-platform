import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency, useMoney } from '../context/CurrencyContext';
import { startCartCheckout, validateCoupon } from '../services/checkout';
import { startAirwallexCheckout } from '../services/airwallex';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { trackBeginCheckout } from '../lib/analytics';

// The cart.
//
// Every price here is display only — the server re-prices each line from its
// stored configuration at checkout. That is deliberate: a cart that survives in
// localStorage is editable by anyone who can open devtools, so it must never be
// the source of what someone is charged.
export default function CartPage() {
  useDocumentMeta('Your cart', undefined, undefined, 'noindex, follow');
  const { lines, remove, setQuantity, subtotal, count, anyUnpriced } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const { currency } = useCurrency();
  const money = useMoney();
  const navigate = useNavigate();
  // Airwallex is opt-in by URL while it is sandbox-only: /cart?pay=airwallex.
  // A second checkout button on the live cart would be a second way for a real
  // customer to pay, through a path that has never taken a real payment.
  //
  // Remembered for the session once seen, because the testing route is
  // "add to cart, then go to the cart" — and reaching the cart through the nav
  // drops the query string, so the button vanishes exactly when it is wanted.
  // sessionStorage, not localStorage: it should expire with the tab rather than
  // leave a tester's browser permanently showing a payment path nobody else has.
  const [params] = useSearchParams();
  const airwallexOptIn = (() => {
    try {
      if (params.get('pay') === 'airwallex') {
        sessionStorage.setItem('apex.pay.airwallex', '1');
        return true;
      }
      return sessionStorage.getItem('apex.pay.airwallex') === '1';
    } catch {
      // Private mode: fall back to the URL alone rather than breaking the cart.
      return params.get('pay') === 'airwallex';
    }
  })();

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const applyCouponCode = async () => {
    setCouponMsg('');
    if (!couponInput.trim()) return;
    const res = await validateCoupon(couponInput.trim());
    if (res.valid) {
      setCoupon({ code: res.code, label: res.label });
      setCouponMsg(`✓ ${res.label} applied — the exact total is confirmed at checkout`);
    } else {
      setCoupon(null);
      setCouponMsg('Invalid or expired code.');
    }
  };

  const payWithAirwallex = async () => {
    setError('');
    setBusy(true);
    try {
      await startAirwallexCheckout({
        lines: lines.map((l) => ({ config: l.config, specs: l.specs })),
        coupon: coupon?.code,
        currency
      });
      // Reached only if the redirect did not happen.
    } catch (e) {
      setError(e.message || 'Could not start the Airwallex checkout.');
    } finally {
      setBusy(false);
    }
  };

  const checkout = async () => {
    setError('');
    setBusy(true);
    try {
      trackBeginCheckout({ lines, value: subtotal, currency });
      const res = await startCartCheckout({
        lines: lines.map((l) => ({ config: l.config, specs: l.specs })),
        coupon: coupon?.code,
        currency
      });
      if (res?.unavailable) {
        setError('Payments are not configured yet. Please request a quote and we will follow up.');
        return;
      }
      if (res?.url) {
        // The cart is intentionally NOT cleared here. Stripe checkout can be
        // abandoned, and emptying it on the way out loses the customer's work
        // for a payment that never happened. The orders are already created and
        // stay "submitted" until the webhook settles them.
        window.location.href = res.url;
        return;
      }
      setError('Could not start checkout.');
    } catch (e) {
      setError(e.message || 'Could not start checkout.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;

  if (lines.length === 0) {
    return (
      <main className="page">
        <div className="empty-state card">
          <h1>Your cart is empty</h1>
          <p className="muted">Configure a product and add it here to build a full booth in one order.</p>
          <Link className="btn btn-red" to="/products">Shop all products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>Cart</span></nav>
      <div className="account-head">
        <div>
          <span className="eyebrow">Cart</span>
          <h1>{count} item{count === 1 ? '' : 's'}</h1>
        </div>
      </div>

      <div className="cart-table card">
        {lines.map((l) => (
          <div className="cart-row" key={l.lineId}>
            <div className="cart-main">
              <Link to={`/products/${l.slug}`}><strong>{l.name}</strong></Link>
              {l.specs ? <div className="muted cart-specs">{l.specs}</div> : null}
            </div>
            <div className="cart-qty">
              <label htmlFor={`q-${l.lineId}`}>Qty</label>
              <input
                id={`q-${l.lineId}`}
                type="number"
                min="1"
                value={l.quantity}
                onChange={(e) => setQuantity(l.lineId, e.target.value)}
              />
            </div>
            <div className="cart-price">
              {Number.isFinite(l.unitPrice) ? money(l.unitPrice * l.quantity) : 'Quote'}
            </div>
            <button className="btn btn-ghost-danger btn-sm" onClick={() => remove(l.lineId)} title="Remove">✕</button>
          </div>
        ))}
      </div>

      <div className="cart-foot card">
        <div className="field">
          <label htmlFor="cart-coupon">Coupon code</label>
          <div className="coupon-row">
            <input id="cart-coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="e.g. WELCOME10" />
            <button type="button" className="btn btn-outline" onClick={applyCouponCode}>Apply</button>
          </div>
          {couponMsg && <small className={coupon ? 'coupon-ok' : 'coupon-bad'}>{couponMsg}</small>}
        </div>

        <div className="cart-total">
          <span>Estimated total</span>
          <strong>{money(subtotal)}</strong>
        </div>
        <p className="panel-foot">
          Every item is re-priced when you check out, so this is an estimate until then.
          Shipping is calculated separately.
        </p>

        {anyUnpriced && (
          <div className="status-message status-error">
            One or more items need a manual quote and cannot be checked out. Remove them and{' '}
            <Link to="/quote">request a quote</Link> for those separately.
          </div>
        )}
        {error && <div className="status-message status-error">{error}</div>}

        {!isAuthenticated ? (
          <>
            <button className="btn btn-red btn-block" onClick={() => navigate('/login', { state: { from: '/cart' } })}>
              Sign in to check out
            </button>
            <p className="panel-foot">Your cart is saved while you sign in.</p>
          </>
        ) : (
          <>
            <button className="btn btn-red btn-block" onClick={checkout} disabled={busy || anyUnpriced}>
              {busy ? 'Starting checkout…' : `Check out — ${money(subtotal)}`}
            </button>
            {airwallexOptIn && (
              <>
                <button
                  className="btn btn-outline btn-block"
                  onClick={payWithAirwallex}
                  disabled={busy || anyUnpriced}
                >
                  {busy ? 'Starting…' : 'Pay with Airwallex (sandbox test)'}
                </button>
                <p className="panel-foot">
                  Sandbox only — no real money moves. Reached via ?pay=airwallex.
                </p>
              </>
            )}
          </>
        )}
        <p className="panel-foot">
          Artwork is uploaded per item after payment, and we send a free proof before anything prints.
        </p>
      </div>
    </main>
  );
}

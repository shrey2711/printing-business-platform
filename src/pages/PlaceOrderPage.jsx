import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeOrder, notifyOrderPlaced } from '../services/orders';
import { startCheckout, validateCoupon } from '../services/checkout';
import { redirectToAirwallex } from '../services/airwallex';
import { getPrice } from '../services/api';
import { useCurrency, useMoney } from '../context/CurrencyContext';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { trackBeginCheckout } from '../lib/analytics';
import ContactFields from '../components/ContactFields';
import { validateContact, formatAddress } from '../lib/contactValidation';


export default function PlaceOrderPage() {
  useDocumentMeta('Place Your Order', undefined, undefined, 'noindex, follow');
  const { user, isAuthenticated, isSupabaseReady, loading } = useAuth();
  const money = useMoney();
  const { currency } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state || {};

  const [notes, setNotes] = useState(incoming.notes || '');
  const [file, setFile] = useState(null);
  // The configurator records what the customer said they would do about artwork.
  // When that is "I'll upload my artwork", an order arriving with no file is
  // stuck before it starts — nobody can print it, and nobody knows it is waiting.
  const [artworkLater, setArtworkLater] = useState(false);
  const [payLater, setPayLater] = useState(false);
  // Collected here rather than at checkout: an unpaid order needs a contact and
  // a delivery address too, and Stripe only collects one if the customer gets
  // that far. Without these the staff notification carried an email and nothing
  // else, and every order started with a round of chasing.
  const [contact, setContact] = useState({
    name: '', phone: '', street: '', city: '', state: '', postal: '', country: ''
  });
  const contactCheck = validateContact(contact);
  const contactReady = contactCheck.ok;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, label }
  const [couponMsg, setCouponMsg] = useState('');
  // Server-recomputed total once a coupon is applied: { total, was, off }.
  const [discounted, setDiscounted] = useState(null);
  // Stable per-attempt key so retries/double-clicks don't create duplicate orders.
  const [idempotencyKey] = useState(() =>
    (crypto?.randomUUID?.() || `k-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  );

  const applyCouponCode = async () => {
    setCouponMsg('');
    if (!couponInput.trim()) return;
    const res = await validateCoupon(couponInput.trim());
    if (!res.valid) {
      setCoupon(null);
      setDiscounted(null);
      setCouponMsg('Invalid or expired code.');
      return;
    }
    setCoupon({ code: res.code, label: res.label });
    setCouponMsg(`✓ ${res.label} applied`);
    // Re-price on the server with the coupon applied. The button used to keep
    // quoting the undiscounted estimate carried over from the configurator, so
    // it promised one figure and checkout charged another. The number comes
    // from the same endpoint and the same applyCoupon() the checkout uses, so
    // the two cannot disagree.
    if (incoming.config?.slug) {
      try {
        const priced = await getPrice({ ...incoming.config, coupon: res.code });
        if (priced?.ok !== false && typeof priced?.total === 'number') {
          setDiscounted({ total: priced.total, was: priced.totalBeforeDiscount, off: priced.discount });
        }
      } catch {
        // Leave the original estimate showing rather than a guess.
        setDiscounted(null);
      }
    }
  };

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

  // 'design' means they bought the design service, so there is nothing for them
  // to send. Any other choice means we are waiting on a file from them.
  const designChoice = incoming.config?.selections?.design;
  const needsArtwork = designChoice !== 'design';
  const artworkChoice = file
    ? 'uploaded'
    : needsArtwork
      ? (artworkLater ? 'email_later' : null)
      : 'design_service';
  const artworkReady = Boolean(file) || !needsArtwork || artworkLater;

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
        design: file,
        config: incoming.config || null,
        idempotencyKey,
        artworkChoice,
        paymentChoice: payLater ? 'invoice_later' : 'pay_now',
        contact: { ...contact, address: formatAddress(contact) },
        // Must be recorded here, not only at checkout: `startCheckout` below is
        // the only other place the code was sent, and it does not run when the
        // customer asks to be invoiced instead.
        couponCode: coupon?.code || null
      });

      // Fire confirmation + staff alert emails (best-effort).
      notifyOrderPlaced(order.id);

      // Straight to payment, unless they asked to be invoiced instead.
      if (incoming.config?.slug && !payLater) {
        try {
          trackBeginCheckout({
            lines: [{ slug: incoming.config.slug, name: incoming.product, quantity: incoming.quantity || 1,
              unitPrice: discounted?.total ?? null, currency }],
            value: discounted?.total,
            currency
          });
          const checkout = await startCheckout(order.id, coupon?.code);
          // Stripe hands back a URL to navigate to. Airwallex hands back an
          // intent for the browser to redirect with, so the two are not
          // interchangeable and the response says which it is.
          if (checkout?.url) {
            window.location.href = checkout.url;
            return;
          }
          if (checkout?.provider === 'airwallex' && checkout.clientSecret) {
            await redirectToAirwallex(checkout);
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
              <div>
                <span>{discounted ? 'Total after discount' : 'Estimated price'}</span>
                <strong>{discounted ? money(discounted.total) : incoming.estimatedPrice}</strong>
              </div>
            )}
          </div>

          <div className="field">
            <label>Artwork</label>
            <input
              type="file"
              accept="application/pdf,image/jpeg,.pdf,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <small>
              PDF or JPEG, single page, built to the ordered size. See the{' '}
              <Link to="/artwork-guidelines">artwork guidelines</Link> for colour, resolution and
              file setup. We send a free proof for your approval before anything goes to production.
            </small>
          </div>

          <ContactFields value={contact} onChange={setContact} />

          {needsArtwork && !file ? (
            <div className="field artwork-gate">
              <label className="check">
                <input
                  type="checkbox"
                  checked={artworkLater}
                  onChange={(e) => setArtworkLater(e.target.checked)}
                />
                <span>I don&apos;t have my artwork ready — I&apos;ll email it to the team.</span>
              </label>
              {artworkLater ? (
                <p className="field-hint">
                  We&apos;ll reply with where to send it. Production starts once your artwork is in and
                  you have approved the proof.
                </p>
              ) : (
                <p className="field-hint">
                  Upload your artwork above to continue, or tick the box if you would rather send it
                  by email. Nothing can be printed until we have a file, so it is better to say now
                  than to have the order sit waiting.
                </p>
              )}
            </div>
          ) : null}

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
              {/* Show the arithmetic, so the new total is obviously a discount
                  and not a different product. */}
              {discounted && (
                <div className="coupon-total">
                  <span className="was">{discounted.was != null ? money(discounted.was) : incoming.estimatedPrice}</span>
                  {discounted.off ? <span className="off">−{money(discounted.off)}</span> : null}
                  <strong>{money(discounted.total)}</strong>
                </div>
              )}
            </div>
          )}

          {!isSupabaseReady && (
            <div className="status-message status-error">
              Orders aren't connected yet — add Supabase keys (see DEPLOY.md) to enable ordering.
            </div>
          )}
          {error && <div className="status-message status-error">{error}</div>}

          {incoming.config?.slug && incoming.estimatedPrice ? (
            <div className="field pay-choice">
              <label className="check">
                <input type="checkbox" checked={payLater} onChange={(e) => setPayLater(e.target.checked)} />
                <span>Send me an invoice instead — I&apos;ll pay from the email.</span>
              </label>
            </div>
          ) : null}

          <button
            className="btn btn-red"
            type="submit"
            disabled={busy || !isSupabaseReady || !artworkReady || !contactReady}
          >
            {busy
              ? 'Submitting…'
              : incoming.config?.slug && incoming.estimatedPrice
                ? (payLater
                    ? 'Submit order — invoice me'
                    : `Submit & pay ${discounted ? money(discounted.total) : incoming.estimatedPrice}`)
                : 'Submit order'}
          </button>
          {!contactReady ? (
            <p className="panel-foot">Add your contact and delivery details to continue.</p>
          ) : !artworkReady ? (
            <p className="panel-foot">Add your artwork, or tick the box above, to continue.</p>
          ) : null}
          {/* Deliberately does not name the processor. Which one takes the
              money is a single environment variable now, so copy naming one is
              wrong the day it changes — which it already was. What the customer
              needs to know is that the page is secure and the order survives. */}
          {incoming.config?.slug && (
            <p className="panel-foot">You'll be taken to a secure checkout page. If payment isn't set up yet,
              your order is still saved and we'll follow up.</p>
          )}
        </form>
      </div>
    </main>
  );
}

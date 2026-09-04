import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeOrder, notifyOrderPlaced } from '../services/orders';
import { startCheckout, validateCoupon } from '../services/checkout';
import useDocumentMeta from '../hooks/useDocumentMeta';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { validateContact, formatAddress } from '../lib/contactValidation';
import { countryOptions, POSTAL, NO_POSTAL } from '../data/countries';

const COUNTRIES = countryOptions();

export default function PlaceOrderPage() {
  useDocumentMeta('Place Your Order', undefined, undefined, 'noindex, follow');
  const { user, isAuthenticated, isSupabaseReady, loading } = useAuth();
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
  const setField = (k) => (e) => setContact((c) => ({ ...c, [k]: e.target.value }));
  // A chosen suggestion fills the rest; anything it does not supply keeps what
  // was already typed rather than being blanked.
  const applyAddress = (a) => setContact((c) => ({
    ...c,
    street: a.street || c.street,
    city: a.city || c.city,
    state: a.state || c.state,
    postal: a.postal || c.postal,
    country: a.country || c.country
  }));
  const contactCheck = validateContact(contact);
  const contactReady = contactCheck.ok;
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
        contact: { ...contact, address: formatAddress(contact) }
      });

      // Fire confirmation + staff alert emails (best-effort).
      notifyOrderPlaced(order.id);

      // Straight to payment, unless they asked to be invoiced instead.
      if (incoming.config?.slug && !payLater) {
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

          <div className="field-row">
            <div className="field">
              <label htmlFor="cname">Contact name *</label>
              <input id="cname" value={contact.name} onChange={setField('name')} required />
            </div>
            <div className="field">
              <label htmlFor="cphone">Phone *</label>
              <input id="cphone" type="tel" value={contact.phone} onChange={setField('phone')} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="ccountry">Country *</label>
            <select id="ccountry" value={contact.country} onChange={setField('country')} required>
              <option value="">Select a country…</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <small className="muted">Shipping cost and transit time depend on where this is going.</small>
          </div>

          <div className="field">
            <label htmlFor="cstreet">Street address *</label>
            <AddressAutocomplete
              id="cstreet"
              name="street"
              value={contact.street}
              country={contact.country}
              onChange={(v) => setContact((c) => ({ ...c, street: v }))}
              onSelect={applyAddress}
              required
            />
          </div>

          <div className="three-col">
            <div className="field">
              <label htmlFor="ccity">City *</label>
              <input id="ccity" value={contact.city} onChange={setField('city')} required />
            </div>
            <div className="field">
              <label htmlFor="cstate">State / province</label>
              <input id="cstate" value={contact.state} onChange={setField('state')} />
            </div>
            <div className="field">
              <label htmlFor="cpostal">
                {NO_POSTAL.has(contact.country) ? 'Postal code (not used here)' : 'Postal code *'}
              </label>
              <input
                id="cpostal"
                value={contact.postal}
                onChange={setField('postal')}
                placeholder={POSTAL[contact.country] ? `e.g. ${POSTAL[contact.country].hint}` : ''}
              />
            </div>
          </div>

          {!contactCheck.ok && (contact.name || contact.street) ? (
            <p className="field-error">{Object.values(contactCheck.errors)[0]}</p>
          ) : null}

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
                ? (payLater ? 'Submit order — invoice me' : `Submit & pay ${incoming.estimatedPrice}`)
                : 'Submit order'}
          </button>
          {!contactReady ? (
            <p className="panel-foot">Add your contact and delivery details to continue.</p>
          ) : !artworkReady ? (
            <p className="panel-foot">Add your artwork, or tick the box above, to continue.</p>
          ) : null}
          {incoming.config?.slug && (
            <p className="panel-foot">You'll be taken to secure Stripe checkout. If payment isn't set up yet,
              your order is still saved and we'll follow up.</p>
          )}
        </form>
      </div>
    </main>
  );
}

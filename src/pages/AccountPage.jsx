import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, getDesignUrl, deleteOrder } from '../services/orders';
import { startCheckout, confirmCheckout, respondToProof } from '../services/checkout';
import StatusTimeline from '../components/StatusTimeline';
import { useCurrency } from '../context/CurrencyContext';
import { formatCharged } from '../lib/money';

const statusColor = {
  submitted: 'st-blue',
  paid: 'st-green',
  proof_ready: 'st-amber',
  proof_approved: 'st-blue',
  in_production: 'st-amber',
  shipped: 'st-green',
  cancelled: 'st-red'
};

// An order counts as paid once it's paid or moved further along.
const isPaid = (o) => ['paid', 'in_production', 'shipped'].includes(o.status);

export default function AccountPage() {
  const { displayName, isAuthenticated, isSupabaseReady, loading } = useAuth();
  const { currency } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const justPlaced = location.state?.placed;

  const [orders, setOrders] = useState([]);
  const [designUrls, setDesignUrls] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [payMsg, setPayMsg] = useState('');
  const [proofNotes, setProofNotes] = useState({});
  const [proofBusy, setProofBusy] = useState(null);

  const loadOrders = async () => {
    const rows = await getMyOrders();
    setOrders(rows);
    const urls = {};
    for (const o of rows) {
      if (o.design_path) urls[o.id] = await getDesignUrl(o.design_path);
    }
    setDesignUrls(urls);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      if (params.get('checkout') === 'success' && params.get('order')) {
        const { paid } = await confirmCheckout(params.get('order')).catch(() => ({ paid: false }));
        setPayMsg(paid ? 'Payment received — thank you! Your order is now paid.' : '');
      } else if (params.get('checkout') === 'cancelled') {
        setPayMsg('Checkout cancelled. Your order was saved — you can pay any time below.');
      }
      if (params.get('checkout')) setParams({}, { replace: true });
      await loadOrders().catch(() => {});
      setLoadingOrders(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const sendProof = async (orderId, approved) => {
    setProofBusy(orderId);
    try {
      const { order } = await respondToProof(orderId, approved, proofNotes[orderId]);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...order } : o)));
      setPayMsg(
        approved
          ? 'Proof approved — your order is moving into production.'
          : 'Thanks — we have your changes and will send an updated proof.'
      );
    } catch (e) {
      setPayMsg(e.message);
    } finally {
      setProofBusy(null);
    }
  };

  const payNow = async (orderId) => {
    try {
      const { url, unavailable } = await startCheckout(orderId, undefined, currency);
      if (unavailable) return setPayMsg("Online payment isn't enabled yet — we'll invoice you directly.");
      if (url) window.location.href = url;
    } catch (e) {
      setPayMsg(e.message);
    }
  };

  const reorder = (o) => {
    navigate('/order', {
      state: {
        product: o.product,
        specs: o.specs,
        quantity: o.quantity,
        estimatedPrice: o.estimated_price,
        config: o.config
      }
    });
  };

  const remove = async (o) => {
    const label = isPaid(o)
      ? 'This order is already paid. Delete it from your history anyway?'
      : 'Delete this order? This cannot be undone.';
    if (!window.confirm(label)) return;
    try {
      await deleteOrder(o);
      setOrders((prev) => prev.filter((x) => x.id !== o.id));
    } catch (e) {
      setPayMsg(e.message || 'Could not delete the order.');
    }
  };

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;

  if (!isAuthenticated) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <h1>Your account</h1>
          <p className="muted">Sign in to view your orders and submitted designs.</p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
            <Link className="btn btn-red" to="/login">Sign in</Link>
            <Link className="btn btn-outline" to="/register">Create account</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="account-head">
        <div>
          <span className="eyebrow">My Account</span>
          <h1>Welcome{displayName ? `, ${displayName}` : ''}</h1>
        </div>
        <Link className="btn btn-red" to="/products">Start a new order</Link>
      </div>

      {justPlaced && (
        <div className="status-message status-success">
          Order placed! Reference: <strong>{justPlaced}</strong>. We emailed your confirmation and will review your artwork.
        </div>
      )}
      {payMsg && <div className="status-message status-success">{payMsg}</div>}

      <h2 className="section-title">Your orders</h2>

      {!isSupabaseReady ? (
        <p className="muted">Connect Supabase (see DEPLOY.md) to enable order history.</p>
      ) : loadingOrders ? (
        <p className="muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <p>You haven't placed any orders yet.</p>
          <Link className="btn btn-red" to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="order-cards">
          {orders.map((o) => (
            <div className="order-card card" key={o.id}>
              <div className="order-card-top">
                <div>
                  <span className="mono order-ref">#{String(o.id).slice(0, 8)}</span>
                  <h3>{o.product}</h3>
                  <p className="muted order-specs">{o.specs}</p>
                </div>
                <em className={`status-pill ${statusColor[o.status] || 'st-blue'}`}>
                  {String(o.status || 'submitted').replace('_', ' ')}
                </em>
              </div>

              <StatusTimeline status={o.status} />

              {o.status === 'proof_ready' && (
                <div className="proof-panel">
                  <strong>Your artwork proof is ready</strong>
                  <p>
                    Check the proof carefully — spelling, colours and logo placement. Nothing goes to
                    production until you approve it.
                  </p>
                  {designUrls[o.id] && (
                    <a className="proof-link" href={designUrls[o.id]} target="_blank" rel="noreferrer">
                      View proof
                    </a>
                  )}
                  <textarea
                    placeholder="Need a change? Tell us what to fix (optional)"
                    value={proofNotes[o.id] || ''}
                    onChange={(e) => setProofNotes({ ...proofNotes, [o.id]: e.target.value })}
                  />
                  <div className="proof-actions">
                    <button
                      className="btn btn-red btn-sm"
                      disabled={proofBusy === o.id}
                      onClick={() => sendProof(o.id, true)}
                    >
                      Approve &amp; start production
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={proofBusy === o.id || !(proofNotes[o.id] || '').trim()}
                      onClick={() => sendProof(o.id, false)}
                    >
                      Request changes
                    </button>
                  </div>
                </div>
              )}

              <div className="order-card-meta">
                <span>Qty <strong>{o.quantity}</strong></span>
                <span>
                  {isPaid(o) ? 'Paid ' : 'Est. '}
                  <strong>
                    {o.amount_total
                      ? formatCharged(o.amount_total, o.currency)
                      : o.estimated_price || '—'}
                  </strong>
                </span>
                {o.tracking_number && (
                  <span>Tracking <strong>{o.carrier ? `${o.carrier} ` : ''}{o.tracking_number}</strong></span>
                )}
                {designUrls[o.id] && (
                  <a href={designUrls[o.id]} target="_blank" rel="noreferrer">View artwork</a>
                )}
              </div>

              <div className="order-card-actions">
                {o.status === 'submitted' && o.config?.slug && (
                  <button className="btn btn-blue btn-sm" onClick={() => payNow(o.id)}>Pay now</button>
                )}
                {o.config?.slug && (
                  <button className="btn btn-outline btn-sm" onClick={() => reorder(o)}>Reorder</button>
                )}
                <button className="btn btn-ghost-danger btn-sm" onClick={() => remove(o)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

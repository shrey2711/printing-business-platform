import { useEffect, useState } from 'react';
import { getAllOrders, getAdminSession, updateOrder, deleteOrder, sendInvoice } from '../../services/admin';
import { formatCharged } from '../../lib/money';
import { CARRIERS } from '../../lib/tracking';

// What an unpaid order is actually waiting on, so a serious customer who asked
// to be invoiced is not chased the same way as one who submitted and vanished.
//
// The distinction only exists for orders placed after artwork_choice and
// payment_choice were recorded; older orders show nothing rather than a guess.
function waitingOn(o) {
  if (['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(o.status)) return '';
  const wants = [];
  if (o.payment_choice === 'invoice_later') wants.push('asked to be invoiced');
  if (o.artwork_choice === 'email_later') wants.push('sending artwork by email');
  if (wants.length) return `⏳ ${wants.join(', ')}`;

  // Neither paid nor told us anything: no artwork, no payment, no stated intent.
  if (!o.design_path && !o.artwork_choice && !o.payment_choice) return '⚠ no artwork, no payment — unconfirmed';
  if (!o.design_path && o.artwork_choice !== 'design_service') return '⚠ waiting on artwork';
  return '';
}

// Why an order can read "paid" with nothing in the live Stripe dashboard.
//
// A test-mode checkout completes normally and Stripe reports payment_status
// "paid", so the order advances correctly — but no card is charged and the
// payment only exists behind the dashboard's Test mode toggle. The session id
// is the evidence: cs_test_… is a test payment, cs_live_… is real money.
function paymentNote(o) {
  const id = o.stripe_session_id || '';
  if (id.startsWith('cs_test_')) return '⚠ TEST payment — no money was taken';
  if (['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(o.status)
      && !id && o.invoice_status !== 'paid') {
    return '⚠ marked paid with no Stripe session';
  }
  return '';
}

// Money has arrived on this order, so an invoice for it can only ever be a
// record of that — never a request for more.
const isSettled = (o) =>
  ['paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'].includes(o.status) ||
  o.invoice_status === 'paid';

const STATUSES = [
  'submitted', 'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped', 'canceled'
];
const statusColor = {
  submitted: 'st-blue', paid: 'st-green', proof_ready: 'st-amber', proof_approved: 'st-blue',
  in_production: 'st-amber', shipped: 'st-green', canceled: 'st-red'
};

// Orders management — the original admin surface, now a dashboard tab.
export default function OrdersTab({ onError, onFlash }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    getAdminSession().then(setSession);
    getAllOrders()
      .then(setOrders)
      .catch((e) => onError(e.message))
      .finally(() => setLoadingOrders(false));
    // onError/onFlash are stable enough for this one-shot load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (o, status) => {
    try {
      const { order, email } = await updateOrder(o.id, { status });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: order.status } : x)));
      onFlash(
        email?.sent
          ? `✓ Status updated — email sent to ${o.customer_email}`
          : `✓ Status updated — email NOT sent (reason: ${email?.reason || 'unknown'})`
      );
    } catch (e) {
      onError(e.message);
    }
  };

  const saveCarrier = async (o, carrier) => {
    if (carrier === (o.carrier || '')) return;
    try {
      const { order, email } = await updateOrder(o.id, { carrier });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, carrier: order.carrier } : x)));
      onFlash(email?.sent
        ? `✓ Carrier saved — tracking emailed to ${o.customer_email}`
        : '✓ Carrier saved');
    } catch (e) {
      onError(e.message);
    }
  };

  const saveTracking = async (o, tracking_number) => {
    if (tracking_number === (o.tracking_number || '')) return;
    try {
      const { order, email } = await updateOrder(o.id, { tracking_number });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, tracking_number: order.tracking_number } : x)));
      onFlash(email?.sent
        ? `✓ Tracking saved — emailed to ${o.customer_email}`
        : `✓ Tracking saved — email NOT sent (${email?.reason || 'unknown'})`);
      onFlash('✓ Tracking saved');
    } catch (e) {
      onError(e.message);
    }
  };

  // Two different documents behind one button. On an unpaid order this raises a
  // demand for payment; on a paid one it produces a receipt for what was
  // already charged. Say which, so nobody bills a customer twice by reflex.
  const invoice = async (o) => {
    const settled = isSettled(o);
    const who = o.customer_email || 'the customer';
    const ask = settled
      ? `Create a paid invoice (receipt) for order #${String(o.id).slice(0, 8)}, for the ${
          o.amount_total != null ? formatCharged(o.amount_total, o.currency) : 'amount charged'
        } already paid? It cannot take a second payment.`
      : `Create & email a Stripe invoice to ${who} for order #${String(o.id).slice(0, 8)}?`;
    if (!window.confirm(ask)) return;
    try {
      const { invoiceUrl } = await sendInvoice(o.id);
      setOrders((prev) => prev.map((x) => (
        x.id === o.id ? { ...x, invoice_url: invoiceUrl, invoice_status: settled ? 'paid' : 'open' } : x
      )));
      onFlash(settled ? '✓ Receipt created — open it to send to the customer' : '✓ Invoice sent to customer');
    } catch (e) {
      onError(e.message);
    }
  };

  const removeOrder = async (o) => {
    if (!window.confirm(`Delete order #${String(o.id).slice(0, 8)} from ${o.customer_email || 'customer'}? This cannot be undone.`)) return;
    try {
      await deleteOrder(o.id);
      setOrders((prev) => prev.filter((x) => x.id !== o.id));
      onFlash('✓ Order deleted');
    } catch (e) {
      onError(e.message);
    }
  };

  if (loadingOrders) return <p className="muted">Loading orders…</p>;
  if (orders.length === 0) return <div className="empty-state card"><p>No orders yet.</p></div>;

  return (
    <>
      <div className="tab-head">
        <span className="muted">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
        {/* Where the money actually goes. An order once read "paid" with no
            sign of the payment simply because the takings land in a different
            Stripe account than the one being checked. */}
        {session?.stripeAccount || session?.stripeMode ? (
          <span className={`muted stripe-dest${session.stripeMode === 'test' ? ' order-flag' : ''}`}>
            {session.stripeMode === 'test'
              ? '⚠ Stripe TEST mode — payments take no money'
              : `Payments go to ${session.stripeAccount?.name || session.stripeAccount?.email || session.stripeAccount?.id || 'Stripe'}`}
            {session.stripeAccount?.email && session.stripeMode !== 'test'
              ? ` (${session.stripeAccount.email})`
              : ''}
          </span>
        ) : null}
      </div>
      <div className="orders-table admin-table card">
        <div className="orders-row admin-row orders-head">
          <span>Order</span><span>Customer</span><span>Product / specs</span>
          <span>Amount</span><span>Status</span><span>Tracking #</span><span>Art</span><span></span>
        </div>
        {orders.map((o) => (
          <div className="orders-row admin-row" key={o.id}>
            <span className="mono">#{String(o.id).slice(0, 8)}</span>
            <span className="wrap">{o.customer_email || '—'}</span>
            <span className="wrap">
              {o.product}<br /><small className="muted">{o.specs} · Qty {o.quantity}</small>
              {waitingOn(o) ? <><br /><small className="order-flag">{waitingOn(o)}</small></> : null}
            </span>
            <span>
              {o.amount_total ? formatCharged(o.amount_total, o.currency) : o.estimated_price || '—'}
              {/* amount_total is written when the checkout session is CREATED,
                  so on its own it says what we asked for, not what was taken.
                  A test-mode session id is the giveaway for a payment that
                  completed without money moving. */}
              {paymentNote(o) ? <><br /><small className="order-flag">{paymentNote(o)}</small></> : null}
            </span>
            <span>
              <select
                className={`status-select ${statusColor[o.status] || ''}`}
                value={o.status}
                onChange={(e) => changeStatus(o, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </span>
            <span className="track-cell">
              <input
                className="track-input"
                defaultValue={o.tracking_number || ''}
                placeholder="add #"
                onBlur={(e) => saveTracking(o, e.target.value.trim())}
              />
              {/* Pick the carrier rather than inferring it from the number's
                  shape, so the customer's tracking link is right every time.
                  Saving either field emails them the number and the link. */}
              <select
                className="track-carrier"
                value={o.carrier || ''}
                onChange={(e) => saveCarrier(o, e.target.value)}
                title="Carrier — used for the tracking link in the customer's email"
              >
                <option value="">Carrier…</option>
                {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </span>
            <span>
              {o.designUrl ? (
                <span className="art-links">
                  <a href={o.designUrl} target="_blank" rel="noreferrer">View</a>
                  {o.designDownloadUrl ? (
                    <>
                      {' · '}
                      <a
                        href={o.designDownloadUrl}
                        download={o.designName || 'artwork'}
                        title={`Download ${o.designName || 'artwork'}`}
                      >
                        Download
                      </a>
                    </>
                  ) : null}
                  {o.designName ? <span className="art-name">{o.designName.replace(/^.*\./, '').toUpperCase()}</span> : null}
                </span>
              ) : (
                <span className="muted">—</span>
              )}
            </span>
            <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              {o.invoice_url ? (
                <a className="btn btn-outline btn-sm" href={o.invoice_url} target="_blank" rel="noreferrer" title="View invoice">📄</a>
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => invoice(o)}
                  title={isSettled(o)
                    ? 'Create a paid invoice (receipt) for the amount already charged'
                    : 'Create & email an invoice for payment'}
                >
                  {isSettled(o) ? 'Receipt' : 'Invoice'}
                </button>
              )}
              <button className="btn btn-ghost-danger btn-sm" onClick={() => removeOrder(o)} title="Delete order">✕</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

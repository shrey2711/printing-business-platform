import { useEffect, useState } from 'react';
import { getAllOrders, updateOrder, deleteOrder, sendInvoice } from '../../services/admin';
import { formatCharged } from '../../lib/money';

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

  useEffect(() => {
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

  const saveTracking = async (o, tracking_number) => {
    if (tracking_number === (o.tracking_number || '')) return;
    try {
      const { order } = await updateOrder(o.id, { tracking_number });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, tracking_number: order.tracking_number } : x)));
      onFlash('✓ Tracking saved');
    } catch (e) {
      onError(e.message);
    }
  };

  const invoice = async (o) => {
    if (!window.confirm(`Create & email a Stripe invoice to ${o.customer_email || 'the customer'} for order #${String(o.id).slice(0, 8)}?`)) return;
    try {
      const { invoiceUrl } = await sendInvoice(o.id);
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, invoice_url: invoiceUrl, invoice_status: 'open' } : x)));
      onFlash('✓ Invoice sent to customer');
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
            <span>{o.amount_total ? formatCharged(o.amount_total, o.currency) : o.estimated_price || '—'}</span>
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
            <span>
              <input
                className="track-input"
                defaultValue={o.tracking_number || ''}
                placeholder="add #"
                onBlur={(e) => saveTracking(o, e.target.value.trim())}
              />
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
                <button className="btn btn-outline btn-sm" onClick={() => invoice(o)} title="Create & email invoice">Invoice</button>
              )}
              <button className="btn btn-ghost-danger btn-sm" onClick={() => removeOrder(o)} title="Delete order">✕</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

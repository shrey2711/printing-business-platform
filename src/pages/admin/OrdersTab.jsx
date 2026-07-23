import { useEffect, useState } from 'react';
import { getAllOrders, updateOrder, deleteOrder } from '../../services/admin';
import { formatCharged } from '../../lib/money';

const STATUSES = [
  'submitted', 'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped', 'cancelled'
];
const statusColor = {
  submitted: 'st-blue', paid: 'st-green', proof_ready: 'st-amber', proof_approved: 'st-blue',
  in_production: 'st-amber', shipped: 'st-green', cancelled: 'st-red'
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
            <span className="wrap">{o.product}<br /><small className="muted">{o.specs} · Qty {o.quantity}</small></span>
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
              {o.designUrl ? <a href={o.designUrl} target="_blank" rel="noreferrer">View</a> : <span className="muted">—</span>}
            </span>
            <span>
              <button className="btn btn-ghost-danger btn-sm" onClick={() => removeOrder(o)} title="Delete order">✕</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

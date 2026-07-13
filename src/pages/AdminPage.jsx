import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, updateOrder } from '../services/admin';

const STATUSES = ['submitted', 'paid', 'in_production', 'shipped', 'cancelled'];
const statusColor = {
  submitted: 'st-blue', paid: 'st-green', in_production: 'st-amber', shipped: 'st-green', cancelled: 'st-red'
};

export default function AdminPage() {
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingOrders(false);
      return;
    }
    getAllOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const changeStatus = async (o, status) => {
    try {
      const { order, email } = await updateOrder(o.id, { status });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: order.status } : x)));
      flash(email?.sent ? `✓ Status updated — email sent to ${o.customer_email}` : '✓ Status updated (email not sent — check Resend key)');
    } catch (e) {
      setError(e.message);
    }
  };

  const saveTracking = async (o, tracking_number) => {
    if (tracking_number === (o.tracking_number || '')) return;
    try {
      const { order } = await updateOrder(o.id, { tracking_number });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, tracking_number: order.tracking_number } : x)));
      flash('✓ Tracking saved');
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;

  if (!isAuthenticated) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <h1>Admin</h1>
          <p className="muted">Sign in with a staff account to manage orders.</p>
          <Link className="btn btn-red" to="/login" state={{ from: '/admin' }}>Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="account-head">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>All orders</h1>
        </div>
        <span className="muted">{orders.length} order{orders.length === 1 ? '' : 's'}</span>
      </div>

      {error && <div className="status-message status-error">{error}</div>}
      {toast && <div className="status-message status-success">{toast}</div>}

      {loadingOrders ? (
        <p className="muted">Loading orders…</p>
      ) : orders.length === 0 && !error ? (
        <div className="empty-state card"><p>No orders yet.</p></div>
      ) : (
        <div className="orders-table admin-table card">
          <div className="orders-row admin-row orders-head">
            <span>Order</span><span>Customer</span><span>Product / specs</span>
            <span>Amount</span><span>Status</span><span>Tracking #</span><span>Art</span>
          </div>
          {orders.map((o) => (
            <div className="orders-row admin-row" key={o.id}>
              <span className="mono">#{String(o.id).slice(0, 8)}</span>
              <span className="wrap">{o.customer_email || '—'}</span>
              <span className="wrap">{o.product}<br /><small className="muted">{o.specs} · Qty {o.quantity}</small></span>
              <span>{o.amount_total ? `$${Number(o.amount_total).toFixed(2)}` : o.estimated_price || '—'}</span>
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
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

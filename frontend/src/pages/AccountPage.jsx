import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, getDesignUrl } from '../services/orders';

const statusColor = {
  submitted: 'st-blue',
  in_production: 'st-amber',
  shipped: 'st-green',
  cancelled: 'st-red'
};

export default function AccountPage() {
  const { displayName, isAuthenticated, isSupabaseReady, loading } = useAuth();
  const location = useLocation();
  const justPlaced = location.state?.placed;

  const [orders, setOrders] = useState([]);
  const [designUrls, setDesignUrls] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyOrders()
      .then(async (rows) => {
        setOrders(rows);
        const urls = {};
        for (const o of rows) {
          if (o.design_path) urls[o.id] = await getDesignUrl(o.design_path);
        }
        setDesignUrls(urls);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated]);

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
          Order placed! Reference: <strong>{justPlaced}</strong>. We'll review your artwork and follow up.
        </div>
      )}

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
        <div className="orders-table card">
          <div className="orders-row orders-head">
            <span>Order</span><span>Product</span><span>Qty</span><span>Est. price</span><span>Status</span><span>Artwork</span>
          </div>
          {orders.map((o) => (
            <div className="orders-row" key={o.id}>
              <span className="mono">#{String(o.id).slice(0, 8)}</span>
              <span>{o.product}<br /><small className="muted">{o.specs}</small></span>
              <span>{o.quantity}</span>
              <span>{o.estimated_price || '—'}</span>
              <span>
                <em className={`status-pill ${statusColor[o.status] || 'st-blue'}`}>
                  {String(o.status || 'submitted').replace('_', ' ')}
                </em>
              </span>
              <span>
                {designUrls[o.id] ? (
                  <a href={designUrls[o.id]} target="_blank" rel="noreferrer">View</a>
                ) : (
                  <span className="muted">—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

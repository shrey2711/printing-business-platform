import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrdersTab from './admin/OrdersTab';
import BlogTab from './admin/BlogTab';
import ContentTab from './admin/ContentTab';
import SeoTab from './admin/SeoTab';
import UsersTab from './admin/UsersTab';

// Dashboard tabs. `roles` lists who may see each; admins see everything.
const TABS = [
  { id: 'orders', label: 'Orders', roles: ['admin'], Comp: OrdersTab },
  { id: 'blog', label: 'Blog', roles: ['admin', 'editor'], Comp: BlogTab },
  { id: 'content', label: 'Content', roles: ['admin', 'editor'], Comp: ContentTab },
  { id: 'seo', label: 'SEO', roles: ['admin', 'editor'], Comp: SeoTab },
  { id: 'users', label: 'Users', roles: ['admin'], Comp: UsersTab }
];

export default function AdminPage() {
  const { isAuthenticated, loading, role, isAdmin, canSeeAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setError('');
    setTimeout(() => setToast(''), 4000);
  };
  const fail = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 6000);
  };

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;

  if (!isAuthenticated) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <h1>Dashboard</h1>
          <p className="muted">Sign in with a staff account to manage the site.</p>
          <Link className="btn btn-red" to="/login" state={{ from: '/admin' }}>Sign in</Link>
        </div>
      </main>
    );
  }

  // Signed in but not staff (no DB role and not allowlisted).
  if (!canSeeAdmin) {
    return (
      <main className="page auth-page">
        <div className="auth-card card">
          <h1>No access</h1>
          <p className="muted">This account doesn't have dashboard permissions. Ask an admin to grant you a role.</p>
          <Link className="btn btn-outline" to="/account">Back to my account</Link>
        </div>
      </main>
    );
  }

  // Effective role: an allowlisted user with no DB row still acts as admin.
  const effectiveRole = role || (isAdmin ? 'admin' : 'editor');
  const visible = TABS.filter((t) => effectiveRole === 'admin' || t.roles.includes(effectiveRole));

  const active = visible.find((t) => t.id === params.get('tab')) || visible[0];
  const setTab = (id) => setParams({ tab: id }, { replace: true });

  return (
    <main className="page">
      <div className="account-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>{active?.label}</h1>
        </div>
        <span className="admin-role-badge">{effectiveRole}</span>
      </div>

      <nav className="admin-tabs">
        {visible.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${active?.id === t.id ? 'admin-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <div className="status-message status-error">{error}</div>}
      {toast && <div className="status-message status-success">{toast}</div>}

      <div className="admin-tab-body">
        {active?.Comp ? (
          <active.Comp onError={fail} onFlash={flash} role={effectiveRole} />
        ) : (
          <div className="empty-state card">
            <p>The <strong>{active?.label}</strong> tab is coming next.</p>
          </div>
        )}
      </div>
    </main>
  );
}

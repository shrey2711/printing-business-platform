import { useEffect, useState } from 'react';
import { listStaff, setStaffRole, removeStaff } from '../../services/adminCms';

// Manage who can access the dashboard and at what level. Admin-only.
export default function UsersTab({ onError, onFlash }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [busy, setBusy] = useState(false);

  const load = () =>
    listStaff()
      .then(setStaff)
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grant = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await setStaffRole(email.trim(), role);
      setEmail('');
      onFlash(`✓ ${email.trim()} is now ${role}`);
      load();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (u) => {
    if (!window.confirm(`Remove dashboard access for ${u.email || u.user_id}?`)) return;
    try {
      await removeStaff(u.user_id);
      setStaff((prev) => prev.filter((x) => x.user_id !== u.user_id));
      onFlash('✓ Access removed');
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <>
      <form className="cms-inline-form card" onSubmit={grant}>
        <div className="field">
          <label>Grant access by email</label>
          <input
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <small>The person must have registered an account first.</small>
        </div>
        <div className="field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="editor">Editor — blog, content & SEO</option>
            <option value="admin">Admin — everything</option>
          </select>
        </div>
        <button className="btn btn-blue" disabled={busy}>Grant</button>
      </form>

      {loading ? (
        <p className="muted">Loading staff…</p>
      ) : staff.length === 0 ? (
        <div className="empty-state card">
          <p>No roles assigned yet. Anyone on the <code>ADMIN_EMAILS</code> allowlist still has admin access as a fallback.</p>
        </div>
      ) : (
        <div className="admin-table card">
          <div className="cms-row cms-row-head">
            <span>Email</span><span>Role</span><span></span>
          </div>
          {staff.map((u) => (
            <div className="cms-row" key={u.user_id}>
              <span className="wrap">{u.email || <span className="muted mono">{u.user_id}</span>}</span>
              <span>
                <select
                  value={u.role}
                  onChange={async (e) => {
                    try {
                      await setStaffRole(u.email, e.target.value);
                      setStaff((prev) => prev.map((x) => (x.user_id === u.user_id ? { ...x, role: e.target.value } : x)));
                      onFlash('✓ Role updated');
                    } catch (err) {
                      onError(err.message);
                    }
                  }}
                >
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </span>
              <span>
                <button className="btn btn-ghost-danger btn-sm" onClick={() => revoke(u)}>Remove</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

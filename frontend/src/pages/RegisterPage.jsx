import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, isSupabaseReady } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', company: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const data = await register(form);
      // If email confirmation is on, there is no active session yet.
      if (data?.session) {
        navigate('/account');
      } else {
        setNotice('Account created! Check your email to confirm, then sign in.');
      }
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <h1>Create your account</h1>
        <p className="muted">Order prints, upload artwork, and track everything in one place.</p>

        {!isSupabaseReady && (
          <div className="status-message status-error">
            Accounts aren't connected yet — add your Supabase keys (see DEPLOY.md) to enable sign-up.
          </div>
        )}

        <form className="form-grid" onSubmit={submit}>
          <div className="two-col">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="company">Company (optional)</label>
              <input id="company" value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <small>At least 6 characters.</small>
          </div>
          {error && <div className="status-message status-error">{error}</div>}
          {notice && <div className="status-message status-success">{notice}</div>}
          <button className="btn btn-red" type="submit" disabled={busy || !isSupabaseReady}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

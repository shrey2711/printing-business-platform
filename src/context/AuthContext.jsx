import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseReady, adminEmails, authHeader } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }
    // Load any existing session, then subscribe to auth changes.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve the DB-backed role whenever the user changes. The email allowlist
  // is only a client-side hint for showing the Admin link; the server is
  // authoritative via /api/me (and re-checks on every admin request).
  useEffect(() => {
    let alive = true;
    if (!user) {
      setRole(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/me', { headers: { ...(await authHeader()) } });
        const data = res.ok ? await res.json() : null;
        if (alive) setRole(data?.role ?? null);
      } catch {
        if (alive) setRole(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const register = async ({ name, company, email, password }) => {
    if (!isSupabaseReady) throw new Error('Supabase is not configured yet.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, company } }
    });
    if (error) throw error;
    return data;
  };

  const login = async ({ email, password }) => {
    if (!isSupabaseReady) throw new Error('Supabase is not configured yet.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (!isSupabaseReady) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // Client-side allowlist hint: shows the Admin link immediately on login,
  // before /api/me resolves. `role` (from the server) is the real gate.
  const allowlisted = Boolean(user && adminEmails.includes((user.email || '').toLowerCase()));

  const value = {
    user,
    loading,
    isSupabaseReady,
    isAuthenticated: Boolean(user),
    role,
    isAdmin: role === 'admin' || allowlisted,
    isEditor: role === 'admin' || role === 'editor' || allowlisted,
    canSeeAdmin: role === 'admin' || role === 'editor' || allowlisted,
    displayName: user?.user_metadata?.full_name || user?.email || '',
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

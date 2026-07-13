import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const value = {
    user,
    loading,
    isSupabaseReady,
    isAuthenticated: Boolean(user),
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

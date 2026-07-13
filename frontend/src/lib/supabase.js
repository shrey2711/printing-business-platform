import { createClient } from '@supabase/supabase-js';

// Supabase credentials come from Vercel/`.env` at build time.
// See DEPLOY.md for how to create the project and set these.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app must still run locally before Supabase is configured, so we only
// create a client when both values are present. Components check `isSupabaseReady`.
export const isSupabaseReady = Boolean(url && anonKey);

export const supabase = isSupabaseReady ? createClient(url, anonKey) : null;

// Storage bucket that holds submitted / drawn artwork.
export const DESIGN_BUCKET = 'designs';

// Client-side list used ONLY to show/hide the Admin link. The API independently
// enforces admin access against its own ADMIN_EMAILS server env var.
export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Authorization header carrying the signed-in user's access token, for calls
// to our own /api/* endpoints (checkout, admin).
export async function authHeader() {
  if (!isSupabaseReady) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

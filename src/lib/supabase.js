// Supabase credentials come from Vercel/`.env` at build time.
// See DEPLOY.md for how to create the project and set these.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app must still run locally before Supabase is configured, so we only
// create a client when both values are present. Components check `isSupabaseReady`.
export const isSupabaseReady = Boolean(url && anonKey);

// The client library is ~45 KB gzipped, more than the rest of the homepage
// combined, and most visitors never sign in. It is loaded on first use instead
// of in the entry bundle: by AuthContext when a session is already stored, or
// by whatever needs it (login, orders, admin).
let clientPromise = null;
export function getSupabase() {
  if (!isSupabaseReady) return Promise.resolve(null);
  clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) => createClient(url, anonKey));
  return clientPromise;
}

// Whether supabase-js has a persisted session in this browser (it stores it
// under `sb-<project-ref>-auth-token`), or the URL carries an auth redirect
// (email confirmation, password recovery) for it to consume. Either means the
// client is needed on load; otherwise it can wait until something asks for it.
export function needsSupabaseOnLoad() {
  if (!isSupabaseReady || typeof window === 'undefined') return false;
  if (/access_token=|refresh_token=|[?&]code=|error_description=/.test(window.location.hash + window.location.search)) return true;
  try {
    return Object.keys(window.localStorage).some((k) => /^sb-.+-auth-token$/.test(k));
  } catch {
    return false;
  }
}

// Storage bucket that holds submitted / drawn artwork.
export const DESIGN_BUCKET = 'designs';

// Client-side list used ONLY to show/hide the Admin link. The API independently
// enforces admin access against its own ADMIN_EMAILS server env var.
export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Authorization header carrying the signed-in user's access token, for calls
// to our own /api/* endpoints (checkout, admin). A guest has no token, so this
// does not load the client just to find that out.
export async function authHeader() {
  if (!clientPromise && !needsSupabaseOnLoad()) return {};
  const supabase = await getSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

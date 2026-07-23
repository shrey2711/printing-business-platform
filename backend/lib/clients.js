import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Server-side clients. Each is null when its env vars aren't set, so the app
// still boots and non-payment/admin features keep working.

const stripeKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeKey ? new Stripe(stripeKey) : null;

const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client bypasses RLS — server use ONLY, never sent to the browser.
export const supabaseAdmin =
  supaUrl && serviceKey
    ? createClient(supaUrl, serviceKey, { auth: { persistSession: false } })
    : null;

// Anon client used only to validate a caller's access token → user identity.
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseAuth = supaUrl && anonKey ? createClient(supaUrl, anonKey, { auth: { persistSession: false } }) : null;

export const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Resolve the Supabase user from a Bearer token; returns null if invalid.
export async function getUserFromToken(authHeader) {
  const client = supabaseAdmin || supabaseAuth;
  if (!client) return null;
  const token = (authHeader || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user || null;
}

// True if the user is on the env allowlist. This is the BOOTSTRAP path: it keeps
// working before the admin_users table is populated, so no one is ever locked out.
export function isAllowlisted(user) {
  return Boolean(user && adminEmails.includes((user.email || '').toLowerCase()));
}

// Resolve a user's role. The admin_users table is authoritative; the env
// allowlist is a fallback that grants 'admin' (bootstrap). Returns 'admin',
// 'editor', or null (no access). Order matters: an explicit DB row wins, but an
// allowlisted user with no row still gets admin so the first login works.
export async function getRole(user) {
  if (!user) return null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.role) return data.role;
  }
  return isAllowlisted(user) ? 'admin' : null;
}

// Back-compat: existing callers of isAdmin() still work (allowlist check).
// Role-aware routes should use getRole()/requireRole() instead.
export function isAdmin(user) {
  return isAllowlisted(user);
}

// Base URL for Stripe redirects: prefer explicit env, else the request origin.
export function baseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (origin) return origin.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}

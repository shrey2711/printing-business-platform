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

export function isAdmin(user) {
  return Boolean(user && adminEmails.includes((user.email || '').toLowerCase()));
}

// Base URL for Stripe redirects: prefer explicit env, else the request origin.
export function baseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const origin = req.headers.origin;
  if (origin) return origin.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}

import { authHeader } from '../lib/supabase';

// Start Stripe Checkout for an order; returns { url } or { unavailable: true }.
// `currency` is the code the buyer was quoted in — the server re-prices and
// converts authoritatively, so this is a display preference, not a price.
export async function startCheckout(orderId, coupon, currency) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ orderId, coupon, currency })
  });
  if (res.status === 503) return { unavailable: true };
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'Could not start checkout.');
  }
  return res.json();
}

// Confirm payment after returning from Stripe; returns { paid: boolean }.
export async function confirmCheckout(orderId) {
  const res = await fetch('/api/checkout/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ orderId })
  });
  if (!res.ok) return { paid: false };
  return res.json();
}

// Approve an artwork proof, or send back requested changes.
export async function respondToProof(orderId, approved, feedback) {
  const res = await fetch(`/api/orders/${orderId}/proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ approved, feedback })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'Could not submit your response.');
  }
  return res.json();
}

// Validate a coupon code; returns { valid, label, type, value } or { valid:false }.
export async function validateCoupon(code) {
  const res = await fetch('/api/coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  if (!res.ok) return { valid: false };
  return res.json();
}

// Cart checkout: several configured products in one payment. Only the configs
// are sent — the server re-prices every line, so nothing the browser stores can
// change what is charged.
export async function startCartCheckout({ lines, coupon, currency, contact }) {
  const res = await fetch('/api/checkout/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ lines, coupon, currency, contact })
  });
  if (res.status === 503) return { unavailable: true };
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'Could not start checkout.');
  }
  return res.json();
}

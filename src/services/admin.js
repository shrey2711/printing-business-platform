import { authHeader } from '../lib/supabase';

// Who the dashboard is signed in as, and which Stripe account the takings land
// in. Never throws: this only annotates the orders screen, so a failure here
// must not stop orders loading.
export async function getAdminSession() {
  try {
    const res = await fetch('/api/admin/session', { headers: { ...(await authHeader()) } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function getAllOrders() {
  const res = await fetch('/api/admin/orders', { headers: { ...(await authHeader()) } });
  if (res.status === 401) throw new Error('Please sign in.');
  if (res.status === 403) throw new Error('You are not authorized to view admin.');
  if (res.status === 503) throw new Error('Admin isn\'t configured yet (see DEPLOY.md).');
  if (!res.ok) throw new Error('Could not load orders.');
  return (await res.json()).orders;
}

// Patch an order: { status } and/or { tracking_number, carrier }.
// Returns { order, email } (email.sent is true when a status email went out).
export async function updateOrder(id, patch) {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(patch)
  });
  // Surface what the server said. It refuses some status changes on purpose —
  // an unpaid order cannot enter production — and a flat "could not update the
  // order" turns a deliberate, explained refusal into what looks like a bug.
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'Could not update the order.');
  }
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'DELETE',
    headers: { ...(await authHeader()) }
  });
  if (!res.ok) throw new Error('Could not delete the order.');
  return res.json();
}

// Create + email a Stripe invoice for an order. Returns { invoiceUrl }.
export async function sendInvoice(id) {
  const res = await fetch(`/api/admin/orders/${id}/invoice`, {
    method: 'POST',
    headers: { ...(await authHeader()) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not create the invoice.');
  return data;
}

// Reviews ------------------------------------------------------------------
async function adminJson(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(await authHeader()), ...(options.headers || {}) }
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.errors?.join(' ') || body?.error || 'Request failed.');
  return body;
}

export const listReviews = (status) =>
  adminJson(`/api/admin/reviews${status ? `?status=${status}` : ''}`).then((b) => b.reviews);

export const setReviewStatus = (id, status) =>
  adminJson(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const addReceivedReview = (review) =>
  adminJson('/api/admin/reviews', { method: 'POST', body: JSON.stringify(review) });

export const listReviewRequests = () =>
  adminJson('/api/admin/review-requests').then((b) => b.orders);

export const sendReviewRequest = (orderId) =>
  adminJson(`/api/admin/review-requests/${orderId}`, { method: 'POST' });

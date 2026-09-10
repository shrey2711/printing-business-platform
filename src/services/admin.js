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
  if (!res.ok) throw new Error('Could not update the order.');
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

import { authHeader } from '../lib/supabase';

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

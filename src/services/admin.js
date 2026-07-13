import { authHeader } from '../lib/supabase';

export async function getAllOrders() {
  const res = await fetch('/api/admin/orders', { headers: { ...(await authHeader()) } });
  if (res.status === 401) throw new Error('Please sign in.');
  if (res.status === 403) throw new Error('You are not authorized to view admin.');
  if (res.status === 503) throw new Error('Admin isn\'t configured yet (see DEPLOY.md).');
  if (!res.ok) throw new Error('Could not load orders.');
  return (await res.json()).orders;
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Could not update status.');
  return (await res.json()).order;
}

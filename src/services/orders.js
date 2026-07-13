import { supabase, isSupabaseReady, DESIGN_BUCKET, authHeader } from '../lib/supabase';

// Convert a canvas dataURL (from the Design Studio) into a File for upload.
function dataUrlToFile(dataUrl, filename) {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

// Upload an artwork file (uploaded OR drawn) to Supabase Storage.
async function uploadDesign(userId, source) {
  if (!source) return null;
  const file =
    typeof source === 'string' ? dataUrlToFile(source, `design-${Date.now()}.png`) : source;
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.round(performance.now())}.${ext}`;
  const { error } = await supabase.storage.from(DESIGN_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return path;
}

// Place an order: optionally upload a design, then insert the order row.
export async function placeOrder({ user, product, specs, quantity, estimatedPrice, notes, design, config, idempotencyKey }) {
  if (!isSupabaseReady) throw new Error('Supabase is not configured yet.');

  // Idempotency: if this exact attempt already created an order (retry / double
  // submit), return the existing one instead of creating a duplicate.
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('orders')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing) return existing;
  }

  const designPath = design ? await uploadDesign(user.id, design) : null;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      product,
      specs,
      quantity: Number(quantity) || 1,
      estimated_price: estimatedPrice || null,
      notes: notes || null,
      design_path: designPath,
      config: config || null,
      idempotency_key: idempotencyKey || null,
      status: 'submitted'
    })
    .select()
    .single();

  // 23505 = unique violation → another concurrent submit won the race; fetch it.
  if (error) {
    if (error.code === '23505' && idempotencyKey) {
      const { data: existing } = await supabase
        .from('orders')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (existing) return existing;
    }
    throw error;
  }
  return data;
}

// Fire confirmation (to customer) + alert (to staff) after an order is placed.
// Best-effort: failures here never block the order.
export async function notifyOrderPlaced(orderId) {
  try {
    await fetch(`/api/orders/${orderId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) }
    });
  } catch {
    /* ignore */
  }
}

export async function getMyOrders() {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Delete an order (and its uploaded design). RLS ensures a user can only
// delete their own orders.
export async function deleteOrder(order) {
  if (!isSupabaseReady) throw new Error('Supabase is not configured yet.');
  if (order.design_path) {
    await supabase.storage.from(DESIGN_BUCKET).remove([order.design_path]).catch(() => {});
  }
  const { error } = await supabase.from('orders').delete().eq('id', order.id);
  if (error) throw error;
}

// Signed URL so a user can view their submitted artwork.
export async function getDesignUrl(path) {
  if (!isSupabaseReady || !path) return null;
  const { data, error } = await supabase.storage.from(DESIGN_BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

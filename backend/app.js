import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import { listProducts, getProduct, categories, navGroups } from './data/products.js';
import { computePrice } from './data/pricing.js';
import { stripe, supabaseAdmin, getUserFromToken, isAdmin, baseUrl } from './lib/clients.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Memory storage keeps this stateless so it works on Vercel serverless.
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Printing API is running' });
});

// Catalog ------------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json({ categories, navGroups });
});

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let items = listProducts();
  if (category) items = items.filter((p) => p.category === category);
  res.json({ products: items });
});

app.get('/api/products/:slug', (req, res) => {
  const product = getProduct(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// Instant pricing ----------------------------------------------------------
app.post('/api/price', (req, res) => {
  const result = computePrice(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

// Guest quote request (authenticated orders go through Supabase directly).
app.post('/api/quote', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'Quote request received',
    reference: `Q-${Date.now().toString().slice(-6)}`,
    data: {
      name: req.body.name,
      email: req.body.email,
      product: req.body.product,
      quantity: req.body.quantity,
      file: req.file ? req.file.originalname : null
    }
  });
});

// ============================================================================
// Stripe payments
// ============================================================================

// Create a Stripe Checkout Session for an existing order the caller owns.
app.post('/api/checkout', async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(503).json({ error: 'Payments are not configured.' });
  }
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });

  const { orderId } = req.body || {};
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error || !order) return res.status(404).json({ error: 'Order not found.' });
  if (order.user_id !== user.id) return res.status(403).json({ error: 'Not your order.' });

  // Re-price server-side from the stored config (never trust the browser).
  let amount = 0;
  if (order.config && order.config.slug) {
    const priced = computePrice(order.config);
    if (priced.ok) amount = priced.total;
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'This order needs a manual quote before payment.' });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: order.product,
            description: order.specs || undefined
          }
        }
      }
    ],
    customer_email: user.email,
    metadata: { orderId: order.id },
    success_url: `${baseUrl(req)}/account?checkout=success&order=${order.id}`,
    cancel_url: `${baseUrl(req)}/account?checkout=cancelled`
  });

  await supabaseAdmin
    .from('orders')
    .update({ stripe_session_id: session.id, amount_total: amount })
    .eq('id', order.id);

  res.json({ url: session.url });
});

// Confirm payment on return from Stripe and mark the order paid.
app.post('/api/checkout/confirm', async (req, res) => {
  if (!stripe || !supabaseAdmin) return res.status(503).json({ error: 'Payments are not configured.' });
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });

  const { orderId } = req.body || {};
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
  if (!order || order.user_id !== user.id) return res.status(404).json({ error: 'Order not found.' });
  if (!order.stripe_session_id) return res.status(400).json({ error: 'No checkout session.' });

  const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
  if (session.payment_status === 'paid') {
    if (order.status === 'submitted') {
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', order.id);
    }
    return res.json({ paid: true });
  }
  res.json({ paid: false });
});

// ============================================================================
// Admin (email allowlist)
// ============================================================================

async function requireAdmin(req, res) {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Admin is not configured.' });
    return null;
  }
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  if (!isAdmin(user)) {
    res.status(403).json({ error: 'Not authorized.' });
    return null;
  }
  return user;
}

app.get('/api/admin/orders', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  // Attach signed artwork URLs + customer email so staff can act on orders.
  const emailCache = new Map();
  const orders = await Promise.all(
    (data || []).map(async (o) => {
      let designUrl = null;
      if (o.design_path) {
        const { data: signed } = await supabaseAdmin.storage
          .from('designs')
          .createSignedUrl(o.design_path, 3600);
        designUrl = signed?.signedUrl || null;
      }
      let email = emailCache.get(o.user_id);
      if (email === undefined) {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(o.user_id);
        email = u?.user?.email || null;
        emailCache.set(o.user_id, email);
      }
      return { ...o, designUrl, customer_email: email };
    })
  );
  res.json({ orders });
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const allowed = ['submitted', 'paid', 'in_production', 'shipped', 'cancelled'];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ order: data });
});

export default app;


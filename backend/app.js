import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

import { listProducts, getProduct, categories, navGroups } from './data/products.js';
import { computePrice } from './data/pricing.js';
import { getProductFaqs } from './data/faqs.js';
import { stripe, supabaseAdmin, getUserFromToken, isAdmin, adminEmails, baseUrl } from './lib/clients.js';
import { sendOrderStatusEmail, sendOrderConfirmationEmail, sendNewOrderAlert } from './lib/mailer.js';
import { findCoupon, applyCoupon } from './data/coupons.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // behind Vercel's proxy — needed for correct client IPs

app.use(cors());

// The Stripe webhook needs the RAW request body for signature verification,
// so it must be registered BEFORE the JSON body parser.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !supabaseAdmin) return res.status(503).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = secret
      ? stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret)
      : JSON.parse(req.body); // fallback if no secret set (dev only)
  } catch (err) {
    return res.status(400).send(`Webhook signature error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === 'paid') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)
        .eq('status', 'submitted'); // don't downgrade later statuses
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '2mb' }));

// Rate limiter for write / expensive endpoints (abuse & spam protection).
// Read-only pricing/catalog stay unthrottled. In-memory per instance; pair with
// a shared store (e.g. Upstash) if you later run a single always-on server.
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down and try again shortly.' }
});

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
  res.json({ product: { ...product, faqs: getProductFaqs(product) } });
});

// Instant pricing ----------------------------------------------------------
app.post('/api/price', (req, res) => {
  const result = computePrice(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

// Guest quote request (authenticated orders go through Supabase directly).
app.post('/api/quote', writeLimiter, upload.single('file'), (req, res) => {
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
app.post('/api/checkout', writeLimiter, async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(503).json({ error: 'Payments are not configured.' });
  }
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });

  const { orderId, coupon } = req.body || {};
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error || !order) return res.status(404).json({ error: 'Order not found.' });
  if (order.user_id !== user.id) return res.status(403).json({ error: 'Not your order.' });

  // Re-price server-side from the stored config (never trust the browser).
  let subtotal = 0;
  if (order.config && order.config.slug) {
    const priced = computePrice(order.config);
    if (priced.ok) subtotal = priced.total;
  }
  if (!subtotal || subtotal <= 0) {
    return res.status(400).json({ error: 'This order needs a manual quote before payment.' });
  }

  // Apply coupon server-side.
  const { discount, total, coupon: applied } = applyCoupon(subtotal, coupon);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(total * 100),
          product_data: {
            name: order.product,
            description: [order.specs, applied ? `Coupon ${applied.code} (-$${discount})` : null]
              .filter(Boolean)
              .join(' — ') || undefined
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
    .update({
      stripe_session_id: session.id,
      amount_total: total,
      coupon_code: applied?.code || null,
      discount: discount || null
    })
    .eq('id', order.id);

  res.json({ url: session.url });
});

// Validate a coupon code (for showing the discount before paying).
app.post('/api/coupon', writeLimiter, (req, res) => {
  const coupon = findCoupon((req.body || {}).code);
  if (!coupon) return res.status(404).json({ valid: false, error: 'Invalid or expired code.' });
  res.json({ valid: true, code: coupon.code, type: coupon.type, value: coupon.value, label: coupon.label });
});

// Send confirmation to the customer + alert to staff after an order is placed.
app.post('/api/orders/:id/notify', writeLimiter, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Not configured.' });
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });

  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', req.params.id).single();
  if (!order || order.user_id !== user.id) return res.status(404).json({ error: 'Order not found.' });

  const appUrl = baseUrl(req);
  const confirmation = await sendOrderConfirmationEmail({ to: user.email, order, appUrl });
  const alert = await sendNewOrderAlert({ to: adminEmails, order, customerEmail: user.email, appUrl });
  res.json({ confirmation, alert });
});

// Confirm payment on return from Stripe and mark the order paid.
app.post('/api/checkout/confirm', writeLimiter, async (req, res) => {
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

app.delete('/api/admin/orders/:id', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('design_path')
    .eq('id', req.params.id)
    .single();
  if (order?.design_path) {
    await supabaseAdmin.storage.from('designs').remove([order.design_path]).catch(() => {});
  }
  const { error } = await supabaseAdmin.from('orders').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const allowed = ['submitted', 'paid', 'in_production', 'shipped', 'cancelled'];
  const { status, tracking_number, carrier } = req.body || {};

  const patch = {};
  if (status !== undefined) {
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    patch.status = status;
  }
  if (tracking_number !== undefined) patch.tracking_number = tracking_number || null;
  if (carrier !== undefined) patch.carrier = carrier || null;
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update.' });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(patch)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Email the customer when the STATUS changes (not for silent tracking edits).
  let email = { sent: false, reason: 'no-status-change' };
  if (status !== undefined) {
    try {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
      email = await sendOrderStatusEmail({ to: u?.user?.email, order: data, status, appUrl: baseUrl(req) });
    } catch (e) {
      email = { sent: false, reason: e.message };
    }
  }

  res.json({ order: data, email });
});

export default app;


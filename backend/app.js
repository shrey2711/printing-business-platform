import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

import { listProducts, getProduct, categories, navGroups } from './data/products.js';
import { computePrice } from './data/pricing.js';
import { getProductFaqs } from './data/faqs.js';
import { stripe, supabaseAdmin, getUserFromToken, isAdmin, getRole, adminEmails, baseUrl } from './lib/clients.js';
import { sendOrderStatusEmail, sendOrderConfirmationEmail, sendNewOrderAlert } from './lib/mailer.js';
import { findCoupon, applyCoupon } from './data/coupons.js';
import { currencies, BASE_CURRENCY } from '../src/config/brand.js';
import { getRates, getRate } from './lib/fx.js';
import { renderMarkdown, excerptFromMarkdown } from './lib/markdown.js';
import { triggerRebuild, rebuildConfigured } from './lib/rebuild.js';
import { getContentMap, getSeoMap, invalidateContentCache } from './lib/content.js';
import { getPricingOverride, getPricingOverrides, invalidatePricingCache } from './lib/pricingOverrides.js';

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

// Live FX rates against the base currency, for price display. The browser reads
// this rather than calling an FX provider directly, so the rate the customer
// sees is the same cached rate the server will charge at. Always 200s — a
// provider outage degrades to the last good (or fallback) rate, never an error.
app.get('/api/rates', async (req, res) => {
  const { rates, live, fetchedAt, source } = await getRates();
  // Let the CDN hold this briefly; the server-side cache does the real work.
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ base: BASE_CURRENCY, rates, live, fetchedAt, source });
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
app.post('/api/price', async (req, res) => {
  const body = req.body || {};
  const pricing = await getPricingOverride(body.slug);
  const result = computePrice(body, pricing ? { pricing } : {});
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

  const { orderId, coupon, currency: requestedCurrency } = req.body || {};
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error || !order) return res.status(404).json({ error: 'Order not found.' });
  if (order.user_id !== user.id) return res.status(403).json({ error: 'Not your order.' });

  // Re-price server-side from the stored config (never trust the browser),
  // applying any live pricing override so checkout charges the current price.
  let subtotal = 0;
  if (order.config && order.config.slug) {
    const pricing = await getPricingOverride(order.config.slug);
    const priced = computePrice(order.config, pricing ? { pricing } : {});
    if (priced.ok) subtotal = priced.total;
  }
  if (!subtotal || subtotal <= 0) {
    return res.status(400).json({ error: 'This order needs a manual quote before payment.' });
  }

  // Apply coupon server-side. Totals here are in the base currency (USD).
  const { discount, total, coupon: applied } = applyCoupon(subtotal, coupon);

  // Charge in the currency the buyer was quoted. Only codes we actually define
  // are honoured, so a crafted request cannot invent a favourable rate, and the
  // rate itself comes from the server's FX cache — never from the request body.
  const cur = currencies[requestedCurrency] || currencies[BASE_CURRENCY];
  const fxRate = await getRate(cur.code);
  const chargeAmount = total * fxRate;
  const chargeDiscount = discount * fxRate;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: cur.stripe,
          unit_amount: Math.round(chargeAmount * 100),
          product_data: {
            name: order.product,
            description: [
              order.specs,
              applied ? `Coupon ${applied.code} (-${cur.code} ${chargeDiscount.toFixed(2)})` : null
            ]
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
      // Store the CHARGED amount and its currency together — amount_total is
      // denominated in `currency`, so it must not be FX-converted on display.
      amount_total: chargeAmount,
      currency: cur.code,
      coupon_code: applied?.code || null,
      discount: chargeDiscount || null
    })
    .eq('id', order.id);

  res.json({ url: session.url });
});

// Customer approves the artwork proof, or asks for changes. Production only
// starts after approval, so a bad file never reaches the press.
app.post('/api/orders/:id/proof', writeLimiter, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Not configured.' });
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });

  const { approved, feedback } = req.body || {};
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!order || order.user_id !== user.id) return res.status(404).json({ error: 'Order not found.' });
  if (order.status !== 'proof_ready') {
    return res.status(400).json({ error: 'There is no proof awaiting your approval on this order.' });
  }

  const patch = approved
    ? { status: 'proof_approved', proof_approved_at: new Date().toISOString(), proof_feedback: null }
    : { status: 'paid', proof_feedback: String(feedback || '').slice(0, 2000) };

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(patch)
    .eq('id', order.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, order: data });
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

// Gate a route by role. Pass the roles allowed to proceed; 'admin' always
// satisfies an 'editor' requirement (admins can do everything editors can).
// Returns { user, role } on success, or null after having sent the response.
async function requireRole(req, res, ...allowed) {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Admin is not configured.' });
    return null;
  }
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  const role = await getRole(user);
  const ok = role === 'admin' || (allowed.length ? allowed.includes(role) : Boolean(role));
  if (!ok) {
    res.status(403).json({ error: 'Not authorized.' });
    return null;
  }
  return { user, role };
}

// Admin-only gate. Returns the user (back-compat with existing callers that
// expect a truthy user object) or null after responding.
async function requireAdmin(req, res) {
  const ctx = await requireRole(req, res, 'admin');
  return ctx ? ctx.user : null;
}

// Identity + role for the current caller, so the dashboard can show the right
// tabs. Never errors on auth — an anonymous caller just gets role: null.
app.get('/api/me', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.json({ authenticated: false, role: null });
  const role = await getRole(user);
  res.json({ authenticated: true, email: user.email, role });
});

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
  const allowed = [
    'submitted', 'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped', 'cancelled'
  ];
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

// ─────────────────────────────────────────────────────────────────────────────
// BLOG — public read + admin CRUD (editor or admin)
// ─────────────────────────────────────────────────────────────────────────────

const slugifyTitle = (s) =>
  String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

const publicMediaUrl = (path) => {
  if (!path || !supabaseAdmin) return null;
  return supabaseAdmin.storage.from('media').getPublicUrl(path).data?.publicUrl || null;
};

// Shape a stored row into the public payload: rendered HTML + resolved cover URL.
function publicPost(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || excerptFromMarkdown(row.body_md),
    html: renderMarkdown(row.body_md),
    coverUrl: publicMediaUrl(row.cover_path),
    tags: row.tags || [],
    seo: row.seo || {},
    publishedAt: row.published_at,
    updatedAt: row.updated_at
  };
}

// Public: list published posts (newest first).
app.get('/api/blog', async (req, res) => {
  if (!supabaseAdmin) return res.json({ posts: [] });
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ posts: (data || []).map(publicPost) });
});

// Public: a single published post by slug.
app.get('/api/blog/:slug', async (req, res) => {
  if (!supabaseAdmin) return res.status(404).json({ error: 'Not found.' });
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', req.params.slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Not found.' });
  res.json({ post: publicPost(data) });
});

// Admin: list ALL posts (drafts included), newest first.
app.get('/api/admin/blog', async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const posts = (data || []).map((p) => ({ ...p, coverUrl: publicMediaUrl(p.cover_path) }));
  res.json({ posts });
});

app.get('/api/admin/blog/:id', async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Not found.' });
  res.json({ post: { ...data, coverUrl: publicMediaUrl(data.cover_path) } });
});

// Build the DB patch from an incoming post body, and detect publish transitions.
async function buildPostPatch(body, actorId, existing) {
  const patch = {};
  if (body.title !== undefined) patch.title = String(body.title).slice(0, 200);
  if (body.excerpt !== undefined) patch.excerpt = body.excerpt ? String(body.excerpt).slice(0, 400) : null;
  if (body.body_md !== undefined) patch.body_md = String(body.body_md);
  if (body.cover_path !== undefined) patch.cover_path = body.cover_path || null;
  if (body.tags !== undefined) patch.tags = Array.isArray(body.tags) ? body.tags.slice(0, 20) : [];
  if (body.seo !== undefined && typeof body.seo === 'object') patch.seo = body.seo;

  if (body.slug !== undefined) {
    const s = slugifyTitle(body.slug) || slugifyTitle(body.title) || `post-${Date.now()}`;
    patch.slug = s;
  }

  if (body.status !== undefined && ['draft', 'published'].includes(body.status)) {
    patch.status = body.status;
    const wasPublished = existing?.status === 'published';
    if (body.status === 'published' && !wasPublished) {
      patch.published_at = existing?.published_at || new Date().toISOString();
    }
  }
  patch.updated_at = new Date().toISOString();
  return patch;
}

app.post('/api/admin/blog', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'A title is required.' });

  const patch = await buildPostPatch(body, ctx.user.id);
  if (!patch.slug) patch.slug = slugifyTitle(body.title) || `post-${Date.now()}`;
  patch.author_id = ctx.user.id;

  const { data, error } = await supabaseAdmin.from('blog_posts').insert(patch).select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'That slug is already taken.' });
    return res.status(500).json({ error: error.message });
  }

  let rebuild = { triggered: false, reason: 'draft' };
  if (data.status === 'published') rebuild = await triggerRebuild();
  res.json({ post: { ...data, coverUrl: publicMediaUrl(data.cover_path) }, rebuild });
});

app.put('/api/admin/blog/:id', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;

  const { data: existing } = await supabaseAdmin
    .from('blog_posts').select('*').eq('id', req.params.id).maybeSingle();
  if (!existing) return res.status(404).json({ error: 'Not found.' });

  const patch = await buildPostPatch(req.body || {}, ctx.user.id, existing);
  const { data, error } = await supabaseAdmin
    .from('blog_posts').update(patch).eq('id', req.params.id).select().single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'That slug is already taken.' });
    return res.status(500).json({ error: error.message });
  }

  // Rebuild if the post is (or just became, or just stopped being) public — any
  // change to a published post, or a publish/unpublish transition, affects the
  // static site.
  const affectsPublic = data.status === 'published' || existing.status === 'published';
  const rebuild = affectsPublic ? await triggerRebuild() : { triggered: false, reason: 'draft' };
  res.json({ post: { ...data, coverUrl: publicMediaUrl(data.cover_path) }, rebuild });
});

app.delete('/api/admin/blog/:id', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data: existing } = await supabaseAdmin
    .from('blog_posts').select('status').eq('id', req.params.id).maybeSingle();
  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  const rebuild = existing?.status === 'published' ? await triggerRebuild() : { triggered: false, reason: 'draft' };
  res.json({ ok: true, rebuild });
});

// Upload an image to the public 'media' bucket; returns its path + public URL.
app.post('/api/admin/media', writeLimiter, upload.single('file'), async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  if (!req.file) return res.status(400).json({ error: 'No file provided.' });
  if (!/^image\//.test(req.file.mimetype)) return res.status(400).json({ error: 'Images only.' });

  const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `blog/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from('media')
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ path, url: publicMediaUrl(path) });
});

// Manual "rebuild the site now" button, for content changes that need baking.
app.post('/api/admin/rebuild', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  if (!rebuildConfigured()) {
    return res.status(503).json({ error: 'No deploy hook configured. Set VERCEL_DEPLOY_HOOK_URL.' });
  }
  const rebuild = await triggerRebuild();
  res.json(rebuild);
});

// ─────────────────────────────────────────────────────────────────────────────
// CMS: content overrides + per-route SEO (public read, editor CRUD)
// ─────────────────────────────────────────────────────────────────────────────

// Public: all content overrides as { key: value }. The site merges these over
// its hardcoded defaults, so editors' copy changes show within the cache window.
app.get('/api/content', async (req, res) => {
  const map = await getContentMap();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ content: map });
});

// Public: SEO override for one route (used by the SPA at runtime).
app.get('/api/seo', async (req, res) => {
  const map = await getSeoMap();
  const path = req.query.path;
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ seo: path ? map[path] || null : map });
});

// Admin: list content overrides (full rows).
app.get('/api/admin/content', async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin
    .from('content_overrides').select('*').order('key');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ content: data || [] });
});

// Admin: upsert or delete a content override. Empty value deletes (reverts to
// the code default).
app.put('/api/admin/content/:key', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const key = req.params.key;
  const { value } = req.body || {};

  if (value === undefined || value === null || value === '') {
    const { error } = await supabaseAdmin.from('content_overrides').delete().eq('key', key);
    if (error) return res.status(500).json({ error: error.message });
    invalidateContentCache();
    return res.json({ ok: true, deleted: true });
  }

  const { data, error } = await supabaseAdmin
    .from('content_overrides')
    .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: ctx.user.id }, { onConflict: 'key' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  invalidateContentCache();
  res.json({ content: data });
});

// Admin: list SEO overrides.
app.get('/api/admin/seo', async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin.from('seo_overrides').select('*').order('path');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ seo: data || [] });
});

// Admin: upsert/delete a per-route SEO override. SEO is baked into static HTML,
// so a change triggers a rebuild.
app.put('/api/admin/seo/:path(*)', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const path = '/' + String(req.params.path || '').replace(/^\/+/, '');
  const body = req.body || {};

  // No meaningful fields → delete the override.
  const fields = ['title', 'description', 'canonical', 'robots', 'og_image_path', 'jsonld', 'sitemap_priority'];
  const patch = { path };
  let hasValue = false;
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== '' && body[f] !== null) {
      patch[f] = body[f];
      hasValue = true;
    }
  }

  if (!hasValue) {
    const { error } = await supabaseAdmin.from('seo_overrides').delete().eq('path', path);
    if (error) return res.status(500).json({ error: error.message });
    invalidateContentCache();
    const rebuild = await triggerRebuild();
    return res.json({ ok: true, deleted: true, rebuild });
  }

  patch.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('seo_overrides').upsert(patch, { onConflict: 'path' }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  invalidateContentCache();
  const rebuild = await triggerRebuild();
  res.json({ seo: data, rebuild });
});

// ─────────────────────────────────────────────────────────────────────────────
// REDIRECTS (editor CRUD). Baked into the edge middleware at build time.
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/admin/redirects', async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin.from('redirects').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ redirects: data || [] });
});

app.post('/api/admin/redirects', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  let { source, destination, code } = req.body || {};
  source = String(source || '').trim();
  destination = String(destination || '').trim();
  code = [301, 302, 308].includes(Number(code)) ? Number(code) : 301;
  if (!source.startsWith('/')) return res.status(400).json({ error: 'Source must be a path starting with /.' });
  if (!destination) return res.status(400).json({ error: 'Destination is required.' });
  if (source === destination) return res.status(400).json({ error: 'Source and destination are identical.' });

  const { data, error } = await supabaseAdmin
    .from('redirects').upsert({ source, destination, code }, { onConflict: 'source' }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const rebuild = await triggerRebuild();
  res.json({ redirect: data, rebuild });
});

app.delete('/api/admin/redirects/:id', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'editor');
  if (!ctx) return;
  const { error } = await supabaseAdmin.from('redirects').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  const rebuild = await triggerRebuild();
  res.json({ ok: true, rebuild });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICING OVERRIDES (admin only — this charges real money)
// ─────────────────────────────────────────────────────────────────────────────

// Validate a candidate pricing block by actually pricing the product with it.
// Rejects anything that can't produce a positive, finite total — a bad edit
// must never reach a live product. Returns { ok, error }.
function validatePricingBlock(slug, pricing) {
  if (!pricing || typeof pricing !== 'object' || !pricing.model) {
    return { ok: false, error: 'Pricing must be an object with a model.' };
  }
  const inputs = [{ slug, quantity: 1 }];

  // Exercise representative selections so a broken choice is caught, not just
  // the default path.
  if (pricing.model === 'configured') {
    for (const g of pricing.optionGroups || []) {
      if (g.type === 'select') {
        for (const c of g.choices || []) inputs.push({ slug, quantity: 1, selections: { [g.id]: c.id } });
      }
    }
  } else if (pricing.model === 'unit') {
    for (const v of pricing.variants || []) inputs.push({ slug, quantity: 1, variantId: v.id });
  }

  for (const input of inputs) {
    const r = computePrice(input, { pricing });
    if (!r.ok) return { ok: false, error: `Priced to an error (${r.error}) for ${JSON.stringify(input.selections || input.variantId || 'default')}.` };
    if (!Number.isFinite(r.total) || r.total <= 0) {
      return { ok: false, error: `Produced a non-positive total for ${JSON.stringify(input.selections || input.variantId || 'default')}.` };
    }
  }
  return { ok: true };
}

// List products with their EFFECTIVE pricing (override if present, else code
// default) so the editor shows what's live.
app.get('/api/admin/pricing', async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;
  const overrides = await getPricingOverrides();
  const products = listProducts({ includeInactive: true }).map((p) => {
    const full = getProduct(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      active: p.active !== false,
      overridden: Boolean(overrides[p.slug]),
      pricing: overrides[p.slug] || full.pricing
    };
  });
  res.json({ products });
});

// Upsert (or clear) a product's pricing override. Admin only; validated;
// audited; rebuilds the site so prerendered "from $X" badges update.
app.put('/api/admin/pricing/:slug', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;
  const slug = req.params.slug;
  const product = getProduct(slug);
  if (!product) return res.status(404).json({ error: 'Unknown product.' });

  const { pricing, confirm } = req.body || {};

  // Clear the override → revert to the code default.
  if (pricing === null) {
    const before = (await getPricingOverride(slug)) || product.pricing;
    const { error } = await supabaseAdmin.from('pricing_overrides').delete().eq('slug', slug);
    if (error) return res.status(500).json({ error: error.message });
    await supabaseAdmin.from('pricing_audit').insert({ actor: ctx.user.id, slug, before, after: null });
    invalidatePricingCache();
    const rebuild = await triggerRebuild();
    return res.json({ ok: true, reverted: true, rebuild });
  }

  if (!confirm) return res.status(400).json({ error: 'Pricing changes require explicit confirmation.' });

  const check = validatePricingBlock(slug, pricing);
  if (!check.ok) return res.status(400).json({ error: `Rejected: ${check.error}` });

  const before = (await getPricingOverride(slug)) || product.pricing;
  const { data, error } = await supabaseAdmin
    .from('pricing_overrides')
    .upsert({ slug, pricing, updated_at: new Date().toISOString(), updated_by: ctx.user.id }, { onConflict: 'slug' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await supabaseAdmin.from('pricing_audit').insert({ actor: ctx.user.id, slug, before, after: pricing });
  invalidatePricingCache();
  const rebuild = await triggerRebuild();
  res.json({ pricing: data.pricing, rebuild });
});

// Recent pricing changes, for the audit trail.
app.get('/api/admin/pricing/audit', async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin
    .from('pricing_audit').select('*').order('at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ audit: data || [] });
});

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD: user roles (admin only)
// ─────────────────────────────────────────────────────────────────────────────

// List staff with roles, resolving each user's email for display.
app.get('/api/admin/users', async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const users = await Promise.all(
    (data || []).map(async (row) => {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
      return { ...row, email: u?.user?.email || null };
    })
  );
  res.json({ users });
});

// Grant or change a role. Looks the user up by email (they must have signed up
// already), then upserts their admin_users row.
app.post('/api/admin/users', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;
  const { email, role } = req.body || {};
  if (!email || !['admin', 'editor'].includes(role)) {
    return res.status(400).json({ error: 'Provide an email and a role of admin or editor.' });
  }

  // Resolve the email to a user id. listUsers is paginated; scan for a match.
  const target = email.trim().toLowerCase();
  let found = null;
  for (let page = 1; page <= 10 && !found; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return res.status(500).json({ error: error.message });
    found = (data?.users || []).find((u) => (u.email || '').toLowerCase() === target);
    if (!data?.users?.length || data.users.length < 200) break;
  }
  if (!found) return res.status(404).json({ error: 'No signed-up user has that email. Ask them to register first.' });

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .upsert({ user_id: found.id, role }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ user: { ...data, email: found.email } });
});

// Revoke a role. Guard against removing the last admin so the dashboard can
// never be locked out.
app.delete('/api/admin/users/:userId', writeLimiter, async (req, res) => {
  const ctx = await requireRole(req, res, 'admin');
  if (!ctx) return;

  const { count } = await supabaseAdmin
    .from('admin_users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');
  const { data: victim } = await supabaseAdmin
    .from('admin_users')
    .select('role')
    .eq('user_id', req.params.userId)
    .maybeSingle();
  if (victim?.role === 'admin' && (count || 0) <= 1) {
    return res.status(400).json({ error: 'Cannot remove the last admin.' });
  }

  const { error } = await supabaseAdmin.from('admin_users').delete().eq('user_id', req.params.userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default app;


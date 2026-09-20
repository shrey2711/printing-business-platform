// Airwallex client — authentication, payment intents, webhook verification.
//
// Added alongside Stripe rather than replacing it. Nothing in the live payment
// path calls this yet: the switch happens only once a sandbox payment has been
// taken end to end and the webhook has settled a real order. This is money, and
// the one incident this project has already had was an order reaching "paid"
// with nothing collected.
//
// HOW THIS DIFFERS FROM STRIPE, which matters for the frontend:
//
//   Stripe     server creates a Checkout Session -> returns session.url
//              -> the browser navigates to it.
//   Airwallex  server creates a PaymentIntent -> returns { id, client_secret }
//              -> the BROWSER redirects, using Airwallex.js redirectToCheckout().
//
// So there is no hosted URL to hand back. The checkout endpoint has to return
// the intent id and client secret, and the client has to load Airwallex.js.
// That is a frontend change, not just a backend swap.
//
// Verified against the Airwallex docs (Sep 2026):
//   auth      POST /api/v1/authentication/login   headers x-client-id, x-api-key
//   intent    POST /api/v1/pa/payment_intents/create
//   webhook   HMAC-SHA256 over (x-timestamp + raw body), compared to x-signature

import crypto from 'crypto';

// Sandbox unless explicitly told otherwise, so a missing env var can never
// mean "charge real cards" — the same failure mode the Stripe test/live badge
// exists to prevent.
const LIVE = process.env.AIRWALLEX_ENV === 'live';

// Airwallex sandbox and live are separate environments with separate
// credentials: a live key returns 401 credentials_invalid against sandbox and
// vice versa. Both sets therefore have to be able to coexist, with the
// environment choosing between them — otherwise switching means editing the
// same variables back and forth, and the day that goes wrong is the day a test
// runs against real money.
//
// The AIRWALLEX_SANDBOX_* names are preferred in sandbox and simply ignored in
// live, so there is no combination of variables that sends a sandbox intent to
// the live API.
const CLIENT_ID = LIVE
  ? process.env.AIRWALLEX_CLIENT_ID
  : (process.env.AIRWALLEX_SANDBOX_CLIENT_ID || process.env.AIRWALLEX_CLIENT_ID);
const API_KEY = LIVE
  ? process.env.AIRWALLEX_API_KEY
  : (process.env.AIRWALLEX_SANDBOX_API_KEY || process.env.AIRWALLEX_API_KEY);
// Each webhook has its own signing secret, and the sandbox webhook is a
// different webhook from the live one.
const WEBHOOK_SECRET = LIVE
  ? process.env.AIRWALLEX_WEBHOOK_SECRET
  : (process.env.AIRWALLEX_SANDBOX_WEBHOOK_SECRET
     || process.env.AIRWALLEX_SANDBOX_SECRET_KEY
     || process.env.AIRWALLEX_WEBHOOK_SECRET);
export const airwallexBase = LIVE
  ? 'https://api.airwallex.com'
  : 'https://api.sandbox.airwallex.com';

export const airwallexMode = (CLIENT_ID && API_KEY) ? (LIVE ? 'live' : 'sandbox') : 'unconfigured';
export const airwallexConfigured = airwallexMode !== 'unconfigured';

// Production running on sandbox credentials is the trap this flag exists for.
// Uploading both key sets to the same Vercel project is the natural thing to do,
// and because sandbox is the safe default, the live site then quietly points at
// the sandbox API. Harmless while nothing calls Airwallex — and the moment
// checkout is wired it means customers complete a fake payment and no money is
// collected. That is the "paid with nothing collected" incident wearing a
// different hat.
//
// The fix is one variable: AIRWALLEX_ENV=live on the Production environment
// only, with the sandbox keys scoped to Preview and Development.
// Which variable set actually supplied the credentials. Worth reporting because
// the two can be crossed: with AIRWALLEX_ENV unset but the sandbox variables
// absent (the state right after scoping them to Preview only), the fallback
// below hands LIVE credentials to the SANDBOX base URL, and Airwallex answers
// 401 credentials_invalid. Harmless but baffling without this line.
export const airwallexCredentialSource =
  !CLIENT_ID ? 'none'
  : (!LIVE && process.env.AIRWALLEX_SANDBOX_CLIENT_ID) ? 'AIRWALLEX_SANDBOX_*'
  : 'AIRWALLEX_*';

// True when the credentials and the API they are being sent to disagree.
export const airwallexCrossedWires =
  airwallexConfigured && !LIVE && airwallexCredentialSource === 'AIRWALLEX_*';

if (airwallexCrossedWires) {
  console.warn(
    '[airwallex] Sandbox API with AIRWALLEX_* credentials. If those are live keys ' +
    'every call returns 401. Set AIRWALLEX_ENV=live, or supply AIRWALLEX_SANDBOX_*.'
  );
}

export const airwallexEnvMismatch =
  process.env.NODE_ENV === 'production' && airwallexMode === 'sandbox';

if (airwallexEnvMismatch) {
  console.warn(
    '[airwallex] PRODUCTION IS USING SANDBOX CREDENTIALS. No real money can be ' +
    'taken. Set AIRWALLEX_ENV=live on the Production environment before wiring checkout.'
  );
}

/** Which pieces are missing, for the admin diagnostics panel. Never values. */
export function airwallexMissing() {
  const p = LIVE ? 'AIRWALLEX_' : 'AIRWALLEX_SANDBOX_';
  return [
    !CLIENT_ID && `${p}CLIENT_ID`,
    !API_KEY && `${p}API_KEY`,
    !WEBHOOK_SECRET && `${p}WEBHOOK_SECRET`
  ].filter(Boolean);
}

// ---------------------------------------------------------------- auth
// The token is short-lived and reusable. Cached in module scope with a safety
// margin; on a serverless platform each cold start simply logs in again, which
// is correct rather than wasteful.
let cached = null;

async function token() {
  if (!airwallexConfigured) throw new Error('Airwallex is not configured');
  if (cached && cached.expires > Date.now() + 60_000) return cached.value;

  const res = await fetch(`${airwallexBase}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      'x-api-key': API_KEY
    }
  });
  if (!res.ok) {
    // Never echo the body verbatim — an auth error can carry the credential back.
    throw new Error(`Airwallex login failed (${res.status})`);
  }
  const body = await res.json();
  if (!body.token) throw new Error('Airwallex login returned no token');
  cached = {
    value: body.token,
    expires: body.expires_at ? Date.parse(body.expires_at) : Date.now() + 25 * 60_000
  };
  return cached.value;
}

async function call(path, { method = 'POST', body } = {}) {
  const res = await fetch(`${airwallexBase}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await token()}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }
  if (!res.ok) {
    const detail = json?.message || json?.code || `HTTP ${res.status}`;
    throw new Error(`Airwallex ${path} failed: ${detail}`);
  }
  return json;
}

// ------------------------------------------------------- payment intents
/**
 * Create a PaymentIntent for the hosted payment page.
 *
 * `amountMinor` is in the smallest unit (cents) to match how the rest of this
 * codebase and Stripe both work; Airwallex expects a major-unit decimal, so the
 * conversion happens here in one place rather than at every call site.
 *
 * `requestId` is an idempotency key. Passing the order id means a retried
 * request cannot create a second intent — and therefore cannot double-charge.
 */
export async function createPaymentIntent({
  amountMinor, currency, merchantOrderId, requestId, returnUrl, email, metadata
}) {
  if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
    throw new Error(`Airwallex: refusing to create an intent for ${amountMinor} minor units`);
  }
  const intent = await call('/api/v1/pa/payment_intents/create', {
    body: {
      request_id: requestId || crypto.randomUUID(),
      amount: Number((amountMinor / 100).toFixed(2)),
      currency: String(currency).toUpperCase(),
      merchant_order_id: merchantOrderId,
      return_url: returnUrl,
      ...(email ? { customer: { email } } : {}),
      ...(metadata ? { metadata } : {})
    }
  });
  return {
    id: intent.id,
    clientSecret: intent.client_secret,
    amountMinor,
    currency: String(currency).toUpperCase()
  };
}

/** Read an intent back — the source of truth for what was actually collected. */
export async function retrievePaymentIntent(id) {
  return call(`/api/v1/pa/payment_intents/${encodeURIComponent(id)}`, { method: 'GET' });
}

// ------------------------------------------------------------- webhooks
/**
 * Verify an Airwallex webhook.
 *
 * MUST be given the RAW body. Airwallex signs the exact bytes they sent, so a
 * parsed-and-reserialised object produces a different digest and every event
 * fails — the same trap as Stripe's constructEvent.
 *
 * Returns the parsed event, or throws. It never returns an unverified event:
 * an unsigned webhook endpoint is a "mark any order paid" endpoint for anyone
 * who knows the URL.
 */
export function verifyWebhook({ rawBody, signature, timestamp }) {
  if (!WEBHOOK_SECRET) throw new Error('AIRWALLEX_WEBHOOK_SECRET is not set');
  if (!signature || !timestamp) throw new Error('Airwallex webhook is missing its signature headers');

  const raw = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(String(timestamp) + raw)
    .digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  // Length check first: timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Airwallex webhook signature does not match');
  }

  // Replay window. A captured request stays valid forever without this.
  const age = Math.abs(Date.now() - Number(timestamp));
  if (Number.isFinite(age) && age > 5 * 60_000) {
    throw new Error('Airwallex webhook timestamp is outside the 5 minute window');
  }

  return JSON.parse(raw);
}

/**
 * What an event says was actually collected, in minor units.
 *
 * Deliberately returns 0 rather than guessing when the amount is absent: every
 * caller treats 0 as "do not mark this paid", which is the safe direction.
 */
export function collectedMinor(event) {
  const d = event?.data?.object || {};
  const amount = d.captured_amount ?? d.amount ?? 0;
  return Math.round(Number(amount) * 100) || 0;
}

// ------------------------------------------------------------- invoices
// Endpoints confirmed from the Airwallex Invoice API reference:
//
//   create        POST /api/v1/billing/invoices/create
//   line items    POST /api/v1/billing/invoices/{id}/add_line_items
//   finalise      POST /api/v1/billing/invoices/{id}/finalize
//   mark paid     POST /api/v1/billing/invoices/{id}/mark_as_paid
//
// A finalised invoice exposes hosted_url and pdf_url. Those two fields are the
// whole reason this maps cleanly: Stripe never emailed our invoices either —
// app.js deliberately skips sendInvoice and the mailer puts the link in our own
// email. So only the URL has to survive the migration, not the delivery.
//
// The customer endpoint is the one piece NOT confirmed from the reference; the
// sandbox script prints what comes back so it can be settled by observation
// rather than assumption.

export async function createCustomer({ email, name, merchantCustomerId }) {
  return call('/api/v1/pa/customers/create', {
    body: {
      request_id: crypto.randomUUID(),
      email,
      ...(name ? { first_name: name } : {}),
      ...(merchantCustomerId ? { merchant_customer_id: merchantCustomerId } : {})
    }
  });
}

export async function createInvoice({ customerId, currency, orderId, description, daysUntilDue = 14 }) {
  return call('/api/v1/billing/invoices/create', {
    body: {
      request_id: crypto.randomUUID(),
      // Billing calls it billing_customer_id, not customer_id — the sandbox
      // rejects the latter with "'billing_customer_id' is mandatory".
      billing_customer_id: customerId,
      currency: String(currency).toUpperCase(),
      // Lets the hosted page take the payment, rather than being a record only.
      // Both of these are required BEFORE finalize, not on it: finalize refuses
      // with "collection method must be set" and "either due_at or
      // days_until_due must be provided" if they are missing here.
      collection_method: 'CHARGE_ON_CHECKOUT',
      days_until_due: daysUntilDue,
      ...(description ? { description } : {}),
      ...(orderId ? { metadata: { orderId } } : {})
    }
  });
}

export async function addInvoiceLineItems(invoiceId, items) {
  // Airwallex Billing is subscription-shaped, so a line is not an amount: it is
  // a price attached to a product. Discovered by probing the sandbox, each error
  // naming the next missing piece:
  //
  //   items                  -> "'line_items' is mandatory"
  //   amount                 -> "should only contain either price or priceId"
  //   price.amount           -> "should have 'pricing_model' of one of FLAT, ..."
  //   pricing_model FLAT     -> "Exactly one of 'product_id' or 'product'"
  //   product {name}         -> "'flat_amount' is required when 'pricing_model' is FLAT"
  //
  // FLAT with quantity 1 is the honest mapping for a printed order: one line,
  // one total, no per-unit arithmetic Airwallex would redo differently from the
  // pricing engine that produced the figure.
  return call(`/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}/add_line_items`, {
    body: {
      request_id: crypto.randomUUID(),
      line_items: items.map((i) => ({
        quantity: i.quantity || 1,
        price: {
          currency: String(i.currency || 'USD').toUpperCase(),
          pricing_model: 'FLAT',
          // Major units, like payment intents — the conversion stays in this file.
          flat_amount: Number((i.amountMinor / 100).toFixed(2)),
          product: { name: i.description }
        }
      }))
    }
  });
}

/**
 * Finalise an invoice, which is what produces hosted_url and makes it payable.
 *
 * Everything it needs — collection method and due date — has to be set when the
 * invoice is CREATED. Airwallex refuses a finalize that is missing either, which
 * is the safer behaviour of the two on offer.
 */
export async function finalizeInvoice(invoiceId) {
  return call(`/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}/finalize`, {
    body: { request_id: crypto.randomUUID() }
  });
}

/**
 * Mark an invoice paid outside Airwallex — the paid_out_of_band equivalent, for
 * an order already settled elsewhere.
 *
 * IRREVERSIBLE. Airwallex offers no undo, so the amount guard below is not
 * belt-and-braces: it is the only check there is. It refuses a zero invoice
 * against a real quote, which is the exact shape of the bug that once left a
 * $285 order carrying a $0.00 invoice marked paid.
 */
export async function markInvoicePaid(invoiceId, { quotedMinor } = {}) {
  const before = await retrieveInvoice(invoiceId);
  const totalMinor = Math.round(Number(before?.total_amount ?? before?.amount ?? 0) * 100);
  if (Number.isFinite(quotedMinor) && quotedMinor > 0 && totalMinor === 0) {
    throw new Error(
      `Airwallex: refusing to mark invoice ${invoiceId} paid — it totals 0 against a quote of ` +
      `${(quotedMinor / 100).toFixed(2)}. Marking paid cannot be undone.`
    );
  }
  return call(`/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}/mark_as_paid`, {
    body: { request_id: crypto.randomUUID() }
  });
}

export async function retrieveInvoice(invoiceId) {
  return call(`/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}`, { method: 'GET' });
}

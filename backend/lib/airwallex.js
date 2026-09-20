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

const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const API_KEY = process.env.AIRWALLEX_API_KEY;
const WEBHOOK_SECRET = process.env.AIRWALLEX_WEBHOOK_SECRET;

// Sandbox unless explicitly told otherwise, so a missing env var can never
// mean "charge real cards" — the same failure mode the Stripe test/live badge
// exists to prevent.
const LIVE = process.env.AIRWALLEX_ENV === 'live';
export const airwallexBase = LIVE
  ? 'https://api.airwallex.com'
  : 'https://api.sandbox.airwallex.com';

export const airwallexMode = (CLIENT_ID && API_KEY) ? (LIVE ? 'live' : 'sandbox') : 'unconfigured';
export const airwallexConfigured = airwallexMode !== 'unconfigured';

/** Which pieces are missing, for the admin diagnostics panel. Never values. */
export function airwallexMissing() {
  return [
    !CLIENT_ID && 'AIRWALLEX_CLIENT_ID',
    !API_KEY && 'AIRWALLEX_API_KEY',
    !WEBHOOK_SECRET && 'AIRWALLEX_WEBHOOK_SECRET'
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

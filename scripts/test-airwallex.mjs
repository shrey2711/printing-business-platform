// Tests for the Airwallex client, focused on the webhook.
//
// The webhook is the part that can mark an order paid, so it is the part that
// gets tested hardest. This project has already had one order reach "paid" with
// nothing collected; the Stripe guards exist because of it, and Airwallex needs
// the same scrutiny before it touches a real payment.
//
// No network: the signature check is pure, and the money-reading helper is pure.
// Authentication and intent creation need real credentials and a sandbox, which
// is `npm run check:airwallex` instead.
//
// Run: node scripts/test-airwallex.mjs

import crypto from 'crypto';

process.env.AIRWALLEX_WEBHOOK_SECRET = 'whsec_test_secret_for_this_file_only';
const { verifyWebhook, collectedMinor, airwallexBase, airwallexMode } =
  await import('../backend/lib/airwallex.js');

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};
const throws = (fn, why) => {
  try { fn(); return `expected a throw (${why}) but it returned`; }
  catch { return null; }
};

const SECRET = process.env.AIRWALLEX_WEBHOOK_SECRET;
const sign = (ts, body) => crypto.createHmac('sha256', SECRET).update(String(ts) + body).digest('hex');

const EVENT = JSON.stringify({
  name: 'payment_intent.succeeded',
  data: { object: { id: 'int_123', amount: 227.61, currency: 'USD', merchant_order_id: 'order-1' } }
});

// ---------------------------------------------------------------- happy path
check('a correctly signed event is accepted', () => {
  const ts = Date.now();
  const ev = verifyWebhook({ rawBody: EVENT, signature: sign(ts, EVENT), timestamp: ts });
  if (ev?.name !== 'payment_intent.succeeded') return 'the parsed event came back wrong';
  return null;
});

check('a Buffer body verifies the same as a string', () => {
  const ts = Date.now();
  const ev = verifyWebhook({ rawBody: Buffer.from(EVENT, 'utf8'), signature: sign(ts, EVENT), timestamp: ts });
  return ev?.data?.object?.id === 'int_123' ? null : 'Buffer body did not verify';
});

// ------------------------------------------------------------ the refusals
check('a forged signature is rejected', () => throws(
  () => verifyWebhook({ rawBody: EVENT, signature: 'f'.repeat(64), timestamp: Date.now() }),
  'wrong signature'));

check('a tampered body is rejected', () => {
  const ts = Date.now();
  const sig = sign(ts, EVENT);
  // The exact attack: same signature, amount raised.
  const tampered = EVENT.replace('227.61', '0.01');
  return throws(() => verifyWebhook({ rawBody: tampered, signature: sig, timestamp: ts }), 'body changed');
});

check('a reused timestamp with a valid signature is rejected once stale', () => {
  const old = Date.now() - 20 * 60_000;
  return throws(() => verifyWebhook({ rawBody: EVENT, signature: sign(old, EVENT), timestamp: old }),
    'replayed 20 minutes later');
});

check('a missing signature header is rejected', () => throws(
  () => verifyWebhook({ rawBody: EVENT, signature: '', timestamp: Date.now() }), 'no signature'));

check('a missing timestamp header is rejected', () => throws(
  () => verifyWebhook({ rawBody: EVENT, signature: 'a'.repeat(64), timestamp: '' }), 'no timestamp'));

check('a signature of the body alone, without the timestamp, is rejected', () => {
  // Getting the concatenation wrong is the most likely implementation slip, and
  // it would otherwise fail open against anyone who guessed the same mistake.
  const ts = Date.now();
  const wrong = crypto.createHmac('sha256', SECRET).update(EVENT).digest('hex');
  return throws(() => verifyWebhook({ rawBody: EVENT, signature: wrong, timestamp: ts }), 'timestamp omitted');
});

check('a signature made with the wrong secret is rejected', () => {
  const ts = Date.now();
  const wrong = crypto.createHmac('sha256', 'not-the-secret').update(String(ts) + EVENT).digest('hex');
  return throws(() => verifyWebhook({ rawBody: EVENT, signature: wrong, timestamp: ts }), 'wrong secret');
});

// --------------------------------------------------------------- the money
check('the collected amount is read in minor units', () => {
  const ev = { data: { object: { amount: 227.61 } } };
  return collectedMinor(ev) === 22761 ? null : `got ${collectedMinor(ev)}, expected 22761`;
});

check('captured_amount wins over the intent amount', () => {
  // An authorised-but-partially-captured intent must report what was CAPTURED,
  // not what was requested, or a partial capture looks like payment in full.
  const ev = { data: { object: { amount: 227.61, captured_amount: 1.65 } } };
  return collectedMinor(ev) === 165 ? null : `got ${collectedMinor(ev)}, expected 165`;
});

check('a missing amount reads as zero, never as paid', () => {
  for (const ev of [{}, { data: {} }, { data: { object: {} } }, { data: { object: { amount: null } } }]) {
    if (collectedMinor(ev) !== 0) return `${JSON.stringify(ev)} did not read as 0`;
  }
  return null;
});

// -------------------------------------------------------------- safe default
check('an unconfigured environment points at sandbox, never live', () => {
  if (airwallexBase.includes('sandbox')) return null;
  return `base URL is ${airwallexBase} without AIRWALLEX_ENV=live`;
});

check('mode reports unconfigured when credentials are absent', () => (
  airwallexMode === 'unconfigured' ? null : `mode is "${airwallexMode}" with no client id or key`
));

if (fails.length) {
  console.error(`\n✗ AIRWALLEX FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ AIRWALLEX OK — ${ran} assertions: a webhook is accepted only when the signature covers ` +
  'timestamp + raw body with the right secret and is recent, and a missing amount never reads as paid.'
);

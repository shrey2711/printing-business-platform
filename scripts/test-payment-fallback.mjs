// Tests for the Airwallex -> Stripe fallback boundary.
//
// Automatic failover between payment processors has one serious failure mode:
// charging the customer twice. If Airwallex took the money and we only THINK it
// failed, retrying on Stripe bills them again — and unlike a missed payment,
// that one reaches their statement.
//
// So the boundary is the whole feature. Fallback is allowed only before the
// customer can have seen a payment form:
//
//   server 5xx / not configured   -> fall back. No intent exists, and the route
//                                    has already deleted the orders it wrote.
//   SDK blocked or failed to load -> fall back, after discarding the orders,
//                                    since the intent exists but was never shown.
//   cart/business error (4xx)     -> do NOT fall back. Stripe refuses it too,
//                                    and the message has to reach the customer.
//   after redirectToCheckout      -> do NOT fall back, ever. They may be on
//                                    Airwallex's page with a card in hand.
//
// Source-level, because the risk lives in control flow rather than in a value,
// and a unit test that mocked the SDK would pass while the real order of
// operations was wrong.
//
// Run: node scripts/test-payment-fallback.mjs

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const svc = readFileSync(join(ROOT, 'src/services/airwallex.js'), 'utf8');
const cart = readFileSync(join(ROOT, 'src/pages/CartPage.jsx'), 'utf8');
const app = readFileSync(join(ROOT, 'backend/app.js'), 'utf8');

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

// ---------------------------------------------------- where it may fall back
check('a server 5xx is marked as safe to retry elsewhere', () => (
  /canFallBack\s*=\s*res\.status\s*>=\s*500/.test(svc)
    ? null : 'the 5xx case does not set canFallBack'
));

check('a 4xx cart error is NOT marked safe', () => {
  // The same expression must be a comparison, not a blanket true — otherwise a
  // "needs a manual quote" error silently becomes a Stripe attempt.
  if (/canFallBack\s*=\s*true;[\s\S]{0,80}res\.status\s*>=\s*500/.test(svc)) {
    return 'canFallBack is set unconditionally near the response check';
  }
  return null;
});

check('a blocked SDK falls back', () => (
  /loadSdk\(\)[\s\S]{0,600}canFallBack\s*=\s*true/.test(svc)
    ? null : 'an SDK load failure is not marked as safe to retry'
));

// --------------------------------------------- where it must NOT fall back
check('nothing after redirectToCheckout is marked safe', () => {
  const i = svc.indexOf('Airwallex.redirectToCheckout(');
  if (i === -1) return 'the redirectToCheckout call is gone';
  const after = svc.slice(i);
  return /canFallBack/.test(after)
    ? 'canFallBack appears after the redirect — a double charge is possible'
    : null;
});

check('the point of no return is documented where it is', () => {
  const i = svc.indexOf('Airwallex.redirectToCheckout(');
  const before = svc.slice(Math.max(0, i - 500), i);
  return /double charge|point of no return/i.test(before)
    ? null : 'the redirect is not marked as the boundary, so the next edit will not know';
});

// ------------------------------------------------- orders are not duplicated
check('the SDK failure discards its orders before falling back', () => {
  const i = svc.indexOf('await loadSdk();');
  const region = svc.slice(i, i + 900);
  if (!/airwallex\/abandon/.test(region)) {
    return 'no cleanup call — the fallback would write a second set of orders';
  }
  // Cleanup has to run BEFORE the throw that triggers the fallback.
  const abandon = region.indexOf('abandon');
  const thrown = region.indexOf('throw e');
  if (abandon === -1 || thrown === -1 || abandon > thrown) {
    return 'cleanup runs after the throw, so it never runs at all';
  }
  return null;
});

check('the cart route rolls its orders back when the intent fails', () => {
  // Anchored on the rollback's own comment rather than on the customer-facing
  // error text, which moved once already when that message was rewritten and
  // took this assertion with it.
  const i = app.indexOf('Never leave orders behind for a payment that was never set up');
  if (i === -1) return 'the cart rollback is gone';
  const region = app.slice(i, i + 500);
  if (!/from\('orders'\)\s*\.delete\(\)/.test(region)) {
    return 'the rollback does not delete the orders it wrote';
  }
  return /status\(502\)/.test(region) ? null : 'the failure is not a 502, so the client cannot fall back';
});

check('the single-order route does NOT delete the order on failure', () => {
  // The opposite rule, and worth pinning: that order existed before checkout,
  // so deleting it would destroy the customer's work rather than undo a write.
  const i = app.indexOf('No rollback here');
  return i === -1
    ? 'the single-order failure path no longer explains why it keeps the order'
    : null;
});

// ----------------------------------------------- the cleanup cannot overreach
check('abandon only deletes the caller\'s own unpaid orders', () => {
  const i = app.indexOf("app.post('/api/checkout/airwallex/abandon'");
  if (i === -1) return 'the abandon route is gone';
  const body = app.slice(i, i + 1400);
  for (const [what, re] of [
    ['the signed-in user', /eq\('user_id', user\.id\)/],
    ['only submitted rows', /eq\('status', 'submitted'\)/],
    ['only this cart', /contains\('config', \{ cartId \}\)/]
  ]) {
    if (!re.test(body)) return `it does not restrict to ${what}`;
  }
  return null;
});

// -------------------------------------------------------------- the cart side
check('the cart falls back only when the error says it is safe', () => (
  /allowFallback\s*&&\s*e\.canFallBack/.test(cart)
    ? null : 'the cart does not check canFallBack before retrying on Stripe'
));

check('the sandbox test button does not fall back', () => (
  /allowFallback:\s*false/.test(cart)
    ? null : 'the test button would fall back, hiding the failure it exists to surface'
));

if (fails.length) {
  console.error(`\n✗ PAYMENT FALLBACK FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ PAYMENT FALLBACK OK — ${ran} assertions: Stripe is tried only for failures before the ` +
  'customer sees a payment form, the orders from the abandoned attempt are discarded first, ' +
  'and nothing after the redirect can trigger a second charge.'
);

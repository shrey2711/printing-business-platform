// An unpaid order must not enter fulfilment.
//
// The dashboard's status dropdown used to offer every status on every row, and
// the PATCH route behind it accepted any of them. Nothing connected "has this
// been paid for" to "may this be printed and shipped": one wrong pick on an
// order the customer never paid for sent it to production, emailed them to say
// their proof was ready, and the work got done for free.
//
// Two halves, both tested here:
//   1. the rule itself, exercised as a function against real order shapes;
//   2. that the SERVER asks it, not only the dropdown — a disabled <option>
//      stops a misclick and nothing else.
//
// Run: node scripts/test-order-status-gating.mjs

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  ORDER_STATUSES, SETTLED_STATUSES, REQUIRES_PAYMENT,
  isOrderPaid, statusBlockedReason, needsOfflineConfirmation
} from '../src/lib/orderStatus.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const app = read('backend/app.js');
const tab = read('src/pages/admin/OrdersTab.jsx');
const admin = read('src/services/admin.js');
const orders = read('src/services/orders.js');
const place = read('src/pages/PlaceOrderPage.jsx');
const schema = read('supabase/schema.sql');

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

// ------------------------------------------------------------------ the rule
const unpaid = { id: 'a', status: 'submitted', invoice_status: null };
const paidByCard = { id: 'b', status: 'paid', invoice_status: null };
const paidByInvoice = { id: 'c', status: 'submitted', invoice_status: 'paid' };

check('an unpaid order is blocked from every fulfilment status', () => {
  const open = REQUIRES_PAYMENT.filter((s) => !statusBlockedReason(unpaid, s));
  return open.length ? `these are reachable while unpaid: ${open.join(', ')}` : null;
});

check('a paid order is blocked from nothing', () => {
  for (const o of [paidByCard, paidByInvoice]) {
    const shut = ORDER_STATUSES.filter((s) => statusBlockedReason(o, s));
    if (shut.length) return `status ${o.status}/${o.invoice_status}: blocked from ${shut.join(', ')}`;
  }
  return null;
});

check('an invoice settled out of band counts as paid', () => (
  isOrderPaid(paidByInvoice) ? null : 'invoice_status "paid" does not unlock the order'
));

check('submitted and canceled stay available on an unpaid order', () => {
  for (const s of ['submitted', 'canceled']) {
    if (statusBlockedReason(unpaid, s)) return `${s} is blocked on an unpaid order`;
  }
  return null;
});

check('a checkout session on its own is NOT proof of payment', () => {
  // amount_total and stripe_session_id are both written when the session is
  // CREATED, so an abandoned checkout leaves both behind. Treating either as
  // evidence would unlock every order that merely reached the payment page.
  const abandoned = {
    status: 'submitted', invoice_status: null,
    stripe_session_id: 'cs_live_x', amount_total: 314.8
  };
  return isOrderPaid(abandoned) ? 'an abandoned checkout counts as paid' : null;
});

check('marking an unpaid order paid needs a deliberate confirmation', () => (
  needsOfflineConfirmation(unpaid, 'paid') ? null : 'paid can be set with no confirmation'
));

check('an order already paid does not re-ask', () => (
  needsOfflineConfirmation(paidByCard, 'paid') ? 'it re-asks on an order already paid' : null
));

check('there is always a way back to paid, so nothing can get stuck', () => {
  // Moving a settled order back to `submitted` discards the only record that a
  // card payment happened. That must not trap it below the gate forever.
  const reverted = { status: 'submitted', invoice_status: null };
  if (statusBlockedReason(reverted, 'paid')) return 'paid is blocked outright — the order is stuck';
  return needsOfflineConfirmation(reverted, 'paid') ? null : 'no confirmation guards the way back';
});

// --------------------------------------------------------------- the server
check('the PATCH route refuses a blocked status', () => {
  const i = app.indexOf("app.patch('/api/admin/orders/:id'");
  if (i === -1) return 'the route is gone';
  const body = app.slice(i, i + 2400);
  if (!/statusBlockedReason\(before, status\)/.test(body)) {
    return 'the route never asks the rule — the dropdown is the only guard';
  }
  return /status\(409\)/.test(body) ? null : 'a blocked status is not refused with 409';
});

check('the route judges the STORED order, not the request', () => {
  // Asking the rule about the incoming patch rather than the stored row would
  // let any request simply claim to be paid.
  const i = app.indexOf("app.patch('/api/admin/orders/:id'");
  const body = app.slice(i, i + 2400);
  return /select\('status, invoice_status/.test(body)
    ? null
    : 'the pre-read does not fetch status/invoice_status, so the gate has nothing to judge';
});

check('the route requires the offline flag before marking paid by hand', () => {
  const i = app.indexOf("app.patch('/api/admin/orders/:id'");
  const body = app.slice(i, i + 2400);
  return /needsOfflineConfirmation\(before, status\)\s*&&\s*offline_payment !== true/.test(body)
    ? null : 'an unpaid order can be marked paid without the explicit flag';
});

check('server and dashboard share one rule, not two copies', () => {
  for (const [file, src] of [['backend/app.js', app], ['OrdersTab.jsx', tab]]) {
    if (!/orderStatus(\.js)?'/.test(src)) return `${file} does not import the shared rule`;
  }
  // The old inline copy must be gone, or the two will drift apart again.
  return /const STATUSES = \[/.test(tab) ? 'OrdersTab still has its own status list' : null;
});

check('the dashboard disables what the server refuses', () => (
  /disabled=\{Boolean\(blocked\)\}/.test(tab)
    ? null : 'the dropdown does not disable blocked statuses'
));

check('the refusal reaches the screen', () => {
  // The admin client used to throw a fixed "Could not update the order.",
  // which turns a deliberate, explained refusal into what looks like a bug.
  const i = admin.indexOf('export async function updateOrder');
  const body = admin.slice(i, i + 800);
  return /body\?\.error/.test(body) ? null : 'updateOrder discards the server error message';
});

// ---------------------------------------------------- the coupon on an order
check('an order records the coupon it was quoted with', () => {
  if (!/coupon_code: couponCode \|\| null/.test(orders)) {
    return 'placeOrder does not persist coupon_code';
  }
  return /couponCode: coupon\?\.code/.test(place)
    ? null : 'the order page never passes the applied coupon to placeOrder';
});

check('the invoice applies the coupon stored on the order', () => (
  /if \(order\.coupon_code\)[\s\S]{0,200}applyCoupon\(subtotal, order\.coupon_code\)/.test(app)
    ? null : 'createInvoiceForOrder no longer applies the stored coupon'
));

// ----------------------------------------------------------- the DB agrees
const constraint = () => {
  const m = schema.match(/orders_status_check[\s\S]{0,400}?check \(status in \(([\s\S]*?)\)\)/);
  return m ? m[1] : null;
};

check('every status the dropdown offers is allowed by the constraint', () => {
  const allowed = constraint();
  if (!allowed) return 'the status check constraint is gone from schema.sql';
  const bad = ORDER_STATUSES.filter((s) => !allowed.includes(`'${s}'`));
  // This caught a live one: the code has always written 'canceled' while the
  // constraint only allowed 'cancelled', so cancelling an order failed in
  // Postgres and the dashboard could not cancel anything at all.
  return bad.length ? `the constraint rejects: ${bad.join(', ')}` : null;
});

check('the settled list is a subset of the real statuses', () => {
  const bad = SETTLED_STATUSES.filter((s) => !ORDER_STATUSES.includes(s));
  return bad.length ? `settled contains unknown statuses: ${bad.join(', ')}` : null;
});

if (fails.length) {
  console.error(`\n✗ ORDER STATUS GATING FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ ORDER STATUS GATING OK — ${ran} assertions: an unpaid order cannot reach proof, ` +
  'production or shipping; the server enforces that rather than the dropdown; paid can ' +
  'still be recorded by hand for money that arrived off-platform; and the coupon a customer ' +
  'was quoted with survives onto the invoice.'
);

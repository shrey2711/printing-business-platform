// Tests for the rule that an order is only paid when money actually moved.
//
// Written after a live order was marked PAID with $0 collected against a $285
// quote. The order carried a Stripe invoice whose amount_paid was zero; the code
// advanced it because Stripe reported the invoice status as "paid". Finalized as
// paid and settled are not the same thing, and a customer's order shipping
// unpaid is the worst failure this system can produce.
//
// These read the source: the paths involve Stripe and Supabase, and the property
// worth protecting is that no branch can set status 'paid' without checking the
// amount.
//
// Run: node scripts/test-payment-guards.mjs

import { readFileSync } from 'fs';

const app = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

/** The code block that follows a marker, for scoped assertions. */
const block = (from, chars = 900) => {
  const i = app.indexOf(from);
  return i === -1 ? '' : app.slice(i, i + chars);
};

check('a zero invoice never marks an order paid on finalize', () => {
  const b = block('const paidCents = finalized.amount_paid');
  if (!b) return 'the finalize guard is gone';
  if (!/settled/.test(b)) return 'no settlement check';
  if (!/paidCents >= amountCents/.test(b)) return 'it does not compare what was collected against what is owed';
  const setsPaid = b.indexOf("patch.status = 'paid'");
  const guard = b.indexOf('&& settled');
  if (setsPaid === -1) return 'it never marks paid at all';
  if (guard === -1 || guard > setsPaid) return 'it marks paid before checking settlement';
  return null;
});

check('invoice.paid with nothing collected does not mark an order paid', () => {
  const b = block('const collected = (inv.amount_paid');
  if (!b) return 'the webhook guard is gone';
  if (!/if \(collected > 0\) patch\.status = 'paid'/.test(b)) {
    return 'status is set without checking the collected amount';
  }
  return null;
});

check('an order that owes money is never invoiced at zero', () => {
  const b = block('const quoted = Number(String(order.estimated_price');
  if (!b) return 'the quote comparison is gone';
  if (!/subtotal === 0 && quoted > 0/.test(b)) return 'it does not detect a zero re-price against a real quote';
  if (!/throw new Error/.test(b)) return 'it does not refuse — it would still raise the invoice';
  return null;
});

check('a genuinely free order can still be invoiced', () => {
  // The guard must not block $0 orders that really are free, or test and
  // comped orders stop working.
  const b = block('const quoted = Number(String(order.estimated_price');
  return /quoted > 0/.test(b) ? null : 'the refusal is not conditional on a non-zero quote';
});

check('a paid checkout records the amount, not just the status', () => {
  const b = block("if (event.type === 'checkout.session.completed')", 1200);
  if (!b) return 'the checkout webhook is gone';
  if (!/amount_total: \(session\.amount_total \|\| 0\) \/ 100/.test(b)) {
    return 'it records a status without an amount, which looks identical to an order marked paid in error';
  }
  return null;
});

check('every path that sets paid checks Stripe or an amount first', () => {
  // Catch a future branch that flips status without evidence of payment.
  const problems = [];
  const re = /status: 'paid'|patch\.status = 'paid'/g;
  let m;
  while ((m = re.exec(app))) {
    const before = app.slice(Math.max(0, m.index - 700), m.index);
    const verified = /payment_status === 'paid'|collected > 0|&& settled|amount_paid/.test(before);
    // The admin status dropdown is a deliberate manual action, not an automatic one.
    // Two legitimate exceptions, and both move an order that is ALREADY paid:
    //   - the admin status dropdown, which is a deliberate manual action
    //   - a rejected proof, which returns the order to the paid state it came
    //     from rather than claiming a new payment
    const isAdminPatch = /allowed\s*=\s*\[/.test(before);
    const isProofRevert = /proof_ready|proof_approved|proof_feedback/.test(before.slice(-400));
    // This guard is about DATABASE WRITES. `status: 'paid'` is also how the
    // mailer is told which template to render, and telling someone their
    // payment arrived is not the same as recording that it did. Narrowed to the
    // write, rather than relaxed: an email argument on the same line is the only
    // thing excused, and any real update still has to prove payment.
    const lineStart = app.lastIndexOf('\n', m.index) + 1;
    const lineEnd = app.indexOf('\n', m.index);
    const line = app.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const isMailArgument = /send[A-Za-z]*Email\(|sendNewOrderAlert\(/.test(line);
    if (!verified && !isAdminPatch && !isProofRevert && !isMailArgument) {
      problems.push(app.slice(0, m.index).split('\n').length);
    }
  }
  return problems.length ? `unverified 'paid' assignment near line(s) ${problems.join(', ')}` : null;
});

check('the webhook refuses an unsigned event in production', () => {
  // With no signing secret the handler used to fall back to JSON.parse on the
  // raw body, trusting whatever was posted. That turns the webhook into an
  // unauthenticated "mark any order paid" endpoint for anyone who knows the
  // URL and an order id. The unsigned path must exist only outside production.
  const i = app.indexOf("app.post('/api/stripe/webhook'");
  if (i === -1) return 'the webhook route is gone';
  const body = app.slice(i, i + 1600);
  if (!/JSON\.parse\(req\.body\)/.test(body)) return null; // no unsigned path at all — fine
  const guarded = /!secret[\s\S]{0,160}NODE_ENV\s*===\s*'production'[\s\S]{0,200}return res\.status\(\d{3}\)/.test(body);
  return guarded ? null : 'an unsigned webhook event is accepted without a production check';
});

check('a paid status is never written from a request body', () => {
  // The status must come from Stripe's own answer, never from JSON the caller
  // supplied. Catches the shape of the original bug: trusting the client.
  const bad = /status:\s*req\.body[^\n]*paid|paid.*=\s*req\.body\.(status|paid)/.test(app);
  return bad ? 'a paid status is taken from the request body' : null;
});

if (fails.length) {
  console.error(`\n✗ PAYMENT GUARDS FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ PAYMENT GUARDS OK — ${ran} assertions: an order reaches "paid" only when the money collected covers what is owed.`);

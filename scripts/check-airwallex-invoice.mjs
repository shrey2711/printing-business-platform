// Sandbox walkthrough of the Airwallex invoice flow, end to end.
//
// This is the acceptance test that decides whether the Stripe Invoices
// dependency can be dropped. It runs the four steps that matter:
//
//   1. create a customer
//   2. create an invoice, add line items, finalise it
//   3. assert a hosted_url and a pdf_url come back
//   4. mark it paid out of band, read it back, assert it actually settled
//
// SANDBOX ONLY, enforced. Marking an invoice paid cannot be undone, so this
// refuses to run against live even if every credential is present. Pass
// --i-know-this-is-live to override, which exists so the refusal is a decision
// rather than an obstacle — but there is no reason to use it.
//
//   npm run check:airwallex-invoice
//   node scripts/check-airwallex-invoice.mjs --email you@example.com

// Loads .env.local then .env, the same way the server does — without it the
// script reports "unconfigured" on a machine where the credentials are sitting
// right there in .env.local.
import '../backend/env.js';

const { 
  airwallexMode, airwallexBase, airwallexMissing,
  createCustomer, createInvoice, addInvoiceLineItems,
  finalizeInvoice, markInvoicePaid, retrieveInvoice
} = await import('../backend/lib/airwallex.js');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const EMAIL = arg('email', process.env.AIRWALLEX_TEST_EMAIL || '');
const LIVE_OVERRIDE = process.argv.includes('--i-know-this-is-live');

const fails = [];
const note = (m) => console.log(`   ${m}`);
const step = (n, m) => console.log(`\n${n}. ${m}`);

// ---------------------------------------------------------------- guards
if (airwallexMode === 'unconfigured') {
  console.error('✗ Airwallex is not configured. Missing: ' + (airwallexMissing().join(', ') || 'credentials'));
  console.error('  Set AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY in .env.local, then re-run.');
  process.exit(1);
}
if (airwallexMode === 'live' && !LIVE_OVERRIDE) {
  console.error('✗ REFUSING TO RUN: AIRWALLEX_ENV=live.');
  console.error('  This marks an invoice paid, which Airwallex cannot undo. Use the sandbox.');
  process.exit(1);
}
if (!EMAIL) {
  console.error('✗ No test email. Pass --email you@example.com (this is where the invoice email would land).');
  process.exit(1);
}

console.log(`Airwallex invoice walkthrough — ${airwallexMode} (${airwallexBase})`);
console.log(`Test email: ${EMAIL}`);

// Anything created here is labelled, so a stray record in the dashboard is
// obviously a test rather than a customer's order.
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const REF = `apex-invoice-check-${stamp}`;

try {
  // ------------------------------------------------------------ 1. customer
  step(1, 'Create a customer');
  const customer = await createCustomer({ email: EMAIL, name: 'Apex Invoice Check', merchantCustomerId: REF });
  note(`id: ${customer.id}`);
  if (!customer.id) fails.push('the customer came back without an id');

  // ------------------------------------------------------------- 2. invoice
  step(2, 'Create the invoice, add line items, finalise');
  const invoice = await createInvoice({
    customerId: customer.id,
    currency: 'USD',
    orderId: REF,
    description: 'Apex Trade Show — migration acceptance test, not a real order'
  });
  note(`id: ${invoice.id}   status: ${invoice.status || '(none)'}`);

  await addInvoiceLineItems(invoice.id, [
    { amountMinor: 12345, quantity: 1, description: '10ft x 10ft canopy tent — TEST LINE, do not fulfil' }
  ]);
  note('line item added: $123.45');

  const finalized = await finalizeInvoice(invoice.id);
  note(`status after finalize: ${finalized.status || '(none)'}`);

  // ------------------------------------------------------- 3. hosted + pdf
  step(3, 'The two fields the migration depends on');
  const hosted = finalized.hosted_url || finalized.hosted_invoice_url;
  const pdf = finalized.pdf_url || finalized.invoice_pdf;
  note(`hosted_url: ${hosted || 'MISSING'}`);
  note(`pdf_url:    ${pdf || 'MISSING'}`);
  if (!hosted) {
    fails.push('no hosted_url — this is what the customer email links to, and the whole migration rests on it');
  }
  if (!pdf) note('! no pdf_url — invoice_pdf is stored on the order today; check whether that column can be dropped');

  console.log('\n   >>> CHECK YOUR INBOX NOW. An email from Airwallex is a bonus, not a');
  console.log('   >>> requirement: app.js already skips Stripe\'s sendInvoice and the');
  console.log('   >>> mailer sends the link itself. Absence of an email changes nothing.');

  // ------------------------------------------------------- 4. mark as paid
  step(4, 'Mark it paid out of band, then read it back');
  note('(irreversible — this is why the script refuses to run against live)');
  await markInvoicePaid(invoice.id, { quotedMinor: 12345 });

  const after = await retrieveInvoice(invoice.id);
  const paymentStatus = after.payment_status || after.status || '(none)';
  const oob = after.paid_out_of_band;
  note(`payment_status:    ${paymentStatus}`);
  note(`paid_out_of_band:  ${oob}`);
  if (String(paymentStatus).toUpperCase() !== 'PAID') {
    fails.push(`payment_status is "${paymentStatus}", expected PAID`);
  }
  if (oob !== true) {
    fails.push(`paid_out_of_band is ${JSON.stringify(oob)}, expected true`);
  }

  // The guard that exists because of a real incident: a $285 order once carried
  // a $0.00 invoice marked paid. Prove it refuses rather than trusting it to.
  step(5, 'The zero-amount guard refuses, rather than marking a zero invoice paid');
  const empty = await createInvoice({
    customerId: customer.id, currency: 'USD', orderId: `${REF}-zero`,
    description: 'Apex — zero-amount guard test, no line items'
  });
  await finalizeInvoice(empty.id).catch(() => {});
  try {
    await markInvoicePaid(empty.id, { quotedMinor: 28500 });
    fails.push('a zero invoice against a $285 quote was marked paid — the guard did not fire');
  } catch (e) {
    note(`refused, correctly: ${e.message.split('—')[1]?.trim() || e.message}`);
  }
} catch (err) {
  fails.push(`threw: ${err.message}`);
}

// ---------------------------------------------------------------- report
if (fails.length) {
  console.error(`\n✗ INVOICE WALKTHROUGH FAILED — ${fails.length}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\nStripe Invoices cannot be dropped until these pass.');
  process.exit(1);
}
console.log(
  '\n✓ INVOICE WALKTHROUGH PASSED — create, line items, finalise, hosted_url, ' +
  'mark paid out of band, and the zero-amount guard all behave. Stripe Invoices can be replaced.'
);

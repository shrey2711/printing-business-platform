// One source of truth for order statuses and which of them an order has to be
// paid for.
//
// The status list had been copied into five places — the admin dropdown, two
// display helpers in that tab, the PATCH route's allow-list and the invoice
// guard — and the copies had already drifted apart in shape. Both the browser
// and the server import this file, so the dropdown disables exactly what the
// route would refuse and the two cannot disagree.

export const ORDER_STATUSES = [
  'submitted', 'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped', 'canceled'
];

/** Statuses that only exist downstream of money arriving. */
export const SETTLED_STATUSES = [
  'paid', 'proof_ready', 'proof_approved', 'in_production', 'shipped'
];

/**
 * Has this order actually been paid for?
 *
 * Deliberately NOT based on `stripe_session_id` or `amount_total`. Both are
 * written when the checkout session is CREATED, so both are present on orders
 * the customer abandoned without paying. Only a settled status or a paid
 * invoice is evidence that money moved.
 */
export const isOrderPaid = (order) =>
  SETTLED_STATUSES.includes(order?.status) || order?.invoice_status === 'paid';

/**
 * The fulfilment statuses that must not be reachable on an unpaid order.
 * Sending a proof, approving it, printing and shipping are all work, and work
 * done before payment is work that may never be paid for.
 *
 * `paid` is deliberately absent. It is the one status staff may set by hand,
 * because money really does arrive by bank transfer and cheque and there would
 * otherwise be no way to record it. It is gated separately, behind an explicit
 * confirmation, instead of being one careless click in a dropdown.
 */
export const REQUIRES_PAYMENT = ['proof_ready', 'proof_approved', 'in_production', 'shipped'];

/** `paid` set by hand on an order with no payment on record. */
export const needsOfflineConfirmation = (order, status) =>
  status === 'paid' && !isOrderPaid(order);

/**
 * Why `status` cannot be set on `order`, or '' if it can.
 * The one rule the dropdown and the PATCH route both ask.
 */
export function statusBlockedReason(order, status) {
  if (!REQUIRES_PAYMENT.includes(status)) return '';
  if (isOrderPaid(order)) return '';
  return `This order has not been paid for. "${status.replace(/_/g, ' ')}" stays locked until ` +
    'payment is recorded — mark it paid first, or send an invoice.';
}

/**
 * Note that moving a settled order back to `submitted` is allowed. It discards
 * the only record that a card payment happened, which looks like it would trap
 * the order below the gate forever — but it does not: the offline-payment
 * confirmation can always put it back. There is no state this leaves stuck.
 */

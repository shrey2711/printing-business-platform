// Simple coupon codes. Edit this list to add/remove promotions.
// type 'percent' => value is a percentage off; type 'fixed' => value is $ off.
const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, label: '10% off your order' },
  { code: 'SAVE25', type: 'percent', value: 25, label: '25% off your order' },
  { code: 'FREESHIP', type: 'fixed', value: 15, label: '$15 off (free shipping)' },
  { code: 'FIRST20', type: 'fixed', value: 20, label: '$20 off your first order' },
  // Internal end-to-end test code. 99% off leaves a real charge of roughly a
  // dollar, which exercises the whole path — Stripe checkout, the webhook, the
  // paid status, both emails, the invoice — against live keys without putting a
  // $1 price on a public product page where any customer could take it.
  //
  // Percent rather than a fixed amount on purpose: a fixed discount larger than
  // the order floors the total at $0, and a $0 charge is exactly the state that
  // marks an order paid with no money collected.
  //
  // DELETE THIS once testing is done.
  { code: 'APEXTEST99', type: 'percent', value: 99, label: 'Internal test — 99% off' },
  // As near free as a card payment can be. 99.99% would leave a couple of cents,
  // which Stripe will not take, so the floor above clamps it to MIN_CHARGE —
  // every order using this code charges exactly 50 cents, whatever it costs.
  //
  // Not 100%: a zero total cannot go through Stripe at all, and the $0 paths
  // are the ones that marked orders paid without collecting anything. A free
  // order should be comped by placing it with "invoice me" and settling it in
  // the dashboard, never by discounting a card payment to nothing.
  //
  // DELETE THIS once testing is done.
  { code: 'APEXTEST100', type: 'percent', value: 99.99, label: 'Internal test — 99.99% off' }
];

export function findCoupon(code) {
  if (!code) return null;
  return COUPONS.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase()) || null;
}

// Stripe refuses a card charge under 50 cents, and a $0 total is worse than a
// refused one: a zero-amount checkout or invoice finalizes as PAID with no money
// collected, which is how orders came to be marked paid for nothing. So a
// discount can take a total down to this floor and no further.
export const MIN_CHARGE = 0.5;

// Returns { discount, total, coupon } given a subtotal.
export function applyCoupon(subtotal, code) {
  const coupon = findCoupon(code);
  if (!coupon) return { discount: 0, total: subtotal, coupon: null };
  const round = (n) => Math.round(n * 100) / 100;
  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  discount = Math.min(discount, subtotal); // never below $0
  discount = round(discount);
  let total = round(subtotal - discount);

  // Clamp up to the floor rather than letting the charge fall through it. A 99%
  // code on a $45 order, or 99.99% on anything, otherwise produces a few cents
  // that Stripe will not take — the customer reaches checkout and it errors.
  // A total of zero is never allowed to reach Stripe. Where the subtotal is
  // already under the floor there is nothing to discount, so the order simply
  // charges what it costs.
  if (subtotal > 0 && total < MIN_CHARGE) {
    total = Math.min(round(subtotal), MIN_CHARGE);
    discount = round(subtotal - total);
  }
  return { discount, total, coupon };
}

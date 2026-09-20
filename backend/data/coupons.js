// Simple coupon codes. Edit this list to add/remove promotions.
// type 'percent' => value is a percentage off; type 'fixed' => value is $ off.
const COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, label: '10% off your order' },
  { code: 'SAVE25', type: 'percent', value: 25, label: '25% off your order' },
  { code: 'FREESHIP', type: 'fixed', value: 15, label: '$15 off (free shipping)' },
  { code: 'FIRST20', type: 'fixed', value: 20, label: '$20 off your first order' }
];

// The test codes APEXTEST99 and APEXTEST100 lived here through the Stripe and
// Airwallex migrations and are now removed: they were live on production and
// worked for anyone who typed them.
//
// The reasoning worth keeping, for whoever adds the next one. Use a PERCENT
// discount, never a fixed amount larger than the order: a fixed one floors the
// total at $0, and a $0 charge is exactly the state that marks an order paid
// with no money collected. MIN_CHARGE below exists for the same reason.
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

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
  { code: 'APEXTEST99', type: 'percent', value: 99, label: 'Internal test — 99% off' }
];

export function findCoupon(code) {
  if (!code) return null;
  return COUPONS.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase()) || null;
}

// Returns { discount, total, coupon } given a subtotal.
export function applyCoupon(subtotal, code) {
  const coupon = findCoupon(code);
  if (!coupon) return { discount: 0, total: subtotal, coupon: null };
  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  discount = Math.min(discount, subtotal); // never below $0
  discount = Math.round(discount * 100) / 100;
  return { discount, total: Math.round((subtotal - discount) * 100) / 100, coupon };
}

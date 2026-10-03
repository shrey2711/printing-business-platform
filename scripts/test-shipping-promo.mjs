// The site advertises brand.shippingPromo (announcement bar, price panel,
// cart). It must name a coupon that checkout actually accepts, for the amount
// it claims — otherwise the site promises a discount the customer cannot get.
import { brand } from '../src/config/brand.js';
import { findCoupon } from '../backend/data/coupons.js';

const promo = brand.shippingPromo;
if (!promo) {
  console.log('✓ SHIPPING PROMO OK — disabled (brand.shippingPromo is null)');
  process.exit(0);
}
const coupon = findCoupon(promo.code);
const fails = [];
if (!coupon) fails.push(`code ${promo.code} is not in backend/data/coupons.js`);
else {
  if (coupon.type !== 'fixed') fails.push(`${promo.code} is a ${coupon.type} coupon; the promo copy promises a fixed $${promo.amount}`);
  if (coupon.value !== promo.amount) fails.push(`${promo.code} takes $${coupon.value} off; the promo copy says $${promo.amount}`);
}
if (process.env.ALLOW_TEST_COUPONS === '1' && /^APEXTEST/i.test(promo.code)) fails.push('the promo must not advertise an internal test coupon');
if (fails.length) {
  console.error('✗ SHIPPING PROMO FAILED:\n  ' + fails.join('\n  '));
  process.exit(1);
}
console.log(`✓ SHIPPING PROMO OK — ${promo.code} is a live $${promo.amount}-off coupon`);

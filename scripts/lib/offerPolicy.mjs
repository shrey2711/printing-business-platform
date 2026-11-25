// Offer-level merchant markup for priced products.
//
// Every value below is taken from the published policy pages in
// src/data/pages.js. Nothing here is a guessed window, fee, or rate.
//
// /returns: a custom order cannot be canceled and is not refundable once the
// proof is approved. A confirmed problem is a reship (transit damage reported
// within 3 days) or a reprint (a printing defect, at no charge, for 1 year).
// That is not a customer return window, so the merchant-listing category that
// matches is MerchantReturnNotPermitted. merchantReturnDays, returnMethod and
// returnFees apply to a finite or unlimited window. FreeReturn would mean the
// customer can send the item back at no charge. Those fields are omitted.
// https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
//
// /shipping: orders ship to the United States and Canada. Shipping cost depends
// on destination, size and weight, and transit time is not a fixed window.
// OfferShippingDetails is omitted. Google requires a shippingRate on that type,
// and a value of 0 means free shipping. Merchant listings can then warn that
// shippingDetails is missing. That warning is accepted; a $0 rate would be false.
//
// applicableCountry is US and CA because those are the countries /shipping says
// we ship to, which is where this return policy applies. merchantReturnLink
// points at the published /returns page rather than restating a window.

import { brand } from '../../src/config/brand.js';

export const MERCHANT_RETURN_NOT_PERMITTED = 'https://schema.org/MerchantReturnNotPermitted';

export function offerMerchantPolicy() {
  return {
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'CA'],
      returnPolicyCategory: MERCHANT_RETURN_NOT_PERMITTED,
      merchantReturnLink: `${brand.origin}/returns`
    }
  };
}

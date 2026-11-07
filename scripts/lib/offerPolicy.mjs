// Offer-level merchant markup for priced products.
//
// /returns (published): custom orders are not refundable. A confirmed problem
// is a reship (transit damage reported within 3 days) or a reprint (print
// defect, 1 year). That is not a customer return window, so the only Google
// merchant-listing returnPolicyCategory that matches is MerchantReturnNotPermitted.
// merchantReturnDays, returnMethod and returnFees apply to a finite or unlimited
// return window and are omitted here. https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
//
// /shipping (published): shipping cost depends on destination, size and weight.
// There is no flat rate and no universal transit window. OfferShippingDetails
// is omitted entirely: when that type is present, Google requires a shippingRate,
// and a value of 0 means free shipping.

export const MERCHANT_RETURN_NOT_PERMITTED = 'https://schema.org/MerchantReturnNotPermitted';

export function offerMerchantPolicy() {
  return {
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'CA'],
      returnPolicyCategory: MERCHANT_RETURN_NOT_PERMITTED
    }
  };
}

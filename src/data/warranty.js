// Warranty terms shown on product pages and the /warranty page. One place so the
// two cannot drift apart. The terms themselves are the owner's: a 5-year limited
// warranty on frames, 1 year on everything else, nothing for life; a 1-year
// reprint guarantee for print defects (no refunds); and a reship if damage in
// transit is reported within 3 days of delivery.

export const WARRANTY = {
  frameYears: 5,
  otherYears: 1,
  reprintYears: 1,
  transitDamageDays: 3
};

// Products built around a structural frame: canopy tents, banner stands,
// tension fabric / step & repeat backdrops, SEG kits and the A-frame sign.
const FRAME_CATEGORIES = new Set(['tents', 'banner-stands', 'backdrops', 'seg-kits']);
const FRAME_SLUGS = new Set(['a-frame-sign']);

export const hasFrame = (product) =>
  !!product && (FRAME_CATEGORIES.has(product.category) || FRAME_SLUGS.has(product.slug));

export const warrantyHeadline = (product) =>
  hasFrame(product)
    ? `${WARRANTY.frameYears}-year limited warranty on the frame, ${WARRANTY.otherYears} year on everything else.`
    : `${WARRANTY.otherYears}-year limited warranty.`;

// One sentence for the product page (configurator and prerender). States only
// the published remedy: no refunds, a reship for transit damage reported within
// the notice window, and a reprint for a printing defect. It does not describe
// a customer return window.
export const productPolicyNote = (product) =>
  `${warrantyHeadline(product)} We do not offer refunds. Damaged in transit? Tell us within ${WARRANTY.transitDamageDays} days for a reship. A printing defect is reprinted at no charge for ${WARRANTY.reprintYears} year from delivery.`;

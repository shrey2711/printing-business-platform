// Single source of truth for cross-cutting Apex product FACTS that are otherwise
// repeated as string literals across product data, cards, FAQs, pages and blog
// comparisons. Prices/sizes/matrices live in products.js + pricing.js (the
// engine); this file holds the shared WORDING + timing so those never drift.
//
// RULE: no invented commercial facts. Production times are real; shipping rates
// are owner-pending, so shipping wording states the model (production vs transit)
// without inventing a rate or day-count.

// Production time is measured from written proof approval, in business days.
export const PRODUCTION_STANDARD = '6–8 business days';
export const PRODUCTION_RUSH = '2–3 business days';

// Transit/shipping is separate from production and varies by destination. This
// is the canonical, grammatically-correct shipping note (replaces the old
// terse "Shipping additional.").
export const SHIPPING_NOTE = 'Shipping is calculated separately at checkout.';

// Canonical production-vs-transit explanation (production time + transit time),
// reused by product pages, the shipping page and AEO answers.
export const PRODUCTION_VS_TRANSIT =
  `Production time (${PRODUCTION_STANDARD} standard, ${PRODUCTION_RUSH} rush) starts when you approve your free proof. ` +
  'Transit time is added on top and depends on your delivery address — it is not the same as production time.';

// Standard turnaround sentence for a product. rushNote lets a product add its
// own rush surcharge phrasing (e.g. "(+50%)") without re-stating the boilerplate.
export const turnaround = (rushNote = '') =>
  `Production: ${PRODUCTION_STANDARD} standard, ${PRODUCTION_RUSH} rush${rushNote ? ` ${rushNote}` : ''}. ${SHIPPING_NOTE}`;

export const CURRENCY = 'USD';

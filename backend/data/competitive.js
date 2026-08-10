// Competitive pricing.
//
// Apex sells a fixed percentage below the competitor's comparable, like-for-like
// selling price. Competitor prices are entered MANUALLY (competitorPrice) — we
// never fetch, scrape or guess them. When a variant's competitorPrice is null,
// the product shows "Request a Quote" until a real number is entered.
//
//   sellingPrice = competitorPrice × (1 − discountPercent / 100)
//
// The FINAL selling price is rounded to 2 decimals; intermediate values are not.
// One utility, used by estimateStartingPrice and computePrice — no repeated
// hard-coded math in components.

export const DEFAULT_DISCOUNT_PERCENT = 5;

export function calculateCompetitivePrice(competitorPrice, discountPercent = DEFAULT_DISCOUNT_PERCENT) {
  const c = Number(competitorPrice);
  if (!Number.isFinite(c) || c <= 0) return null;
  const pct = Number.isFinite(Number(discountPercent)) ? Number(discountPercent) : DEFAULT_DISCOUNT_PERCENT;
  return Math.round(c * (1 - pct / 100) * 100) / 100;
}

// Pick the comparison price a customer would actually pay at the competitor:
// the current/sale price when present, else the regular price.
export function competitorCurrentPrice(variant) {
  if (!variant) return null;
  const cur = Number(variant.competitorPrice);
  if (Number.isFinite(cur) && cur > 0) return cur;
  const reg = Number(variant.competitorRegularPrice);
  return Number.isFinite(reg) && reg > 0 ? reg : null;
}

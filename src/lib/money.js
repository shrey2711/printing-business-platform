// Central money formatting. Catalog prices are stored in the base currency
// (USD) and converted at render time using a LIVE rate supplied by the caller
// (see CurrencyContext, which fetches /api/rates). These functions stay pure —
// they never fetch — so the rate in play is always explicit.

import { BASE_CURRENCY, getCurrency } from '../config/brand';

const STORAGE_KEY = 'currency';

// Resolve the rate to use: caller-supplied live rate, else the static fallback.
function resolveRate(code, rate) {
  const n = Number(rate);
  if (Number.isFinite(n) && n > 0) return n;
  return getCurrency(code).fallbackRate ?? 1;
}

// Convert a base-currency (USD) amount into `code`.
export function convert(amount, code, rate) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return n * resolveRate(code, rate);
}

// Format a BASE-currency amount for display in `code`.
// formatMoney(1049, 'CAD', { rate: 1.3712 }) -> "CA$1,438.39"
export function formatMoney(amount, code = BASE_CURRENCY, { cents = true, rate } = {}) {
  const cur = getCurrency(code);
  const value = convert(amount, code, rate);
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0
    }).format(value);
  } catch {
    // Intl should always be present, but never let formatting break a price.
    return `${cur.symbol}${value.toFixed(cents ? 2 : 0)}`;
  }
}

// Whole-unit variant for "from $X" badges on cards and listings.
export function formatMoneyRounded(amount, code = BASE_CURRENCY, rate) {
  return formatMoney(amount, code, { cents: false, rate });
}

// Format an amount that is ALREADY denominated in `code` — a Stripe charge, a
// stored order total — so it must NOT be converted again. Using formatMoney()
// on a captured payment would double-apply the FX rate.
export function formatCharged(amount, code = BASE_CURRENCY) {
  const cur = getCurrency(code);
  const n = Number(amount);
  const value = Number.isFinite(n) ? n : 0;
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${cur.symbol}${value.toFixed(2)}`;
  }
}

// Guess a sensible default currency from the browser timezone, so Canadian
// visitors land on CAD without hunting for the switcher.
export function detectCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Montreal|Regina|St_Johns|Whitehorse|Yellowknife|Iqaluit)/.test(tz)) {
      return 'CAD';
    }
  } catch {
    /* fall through to base */
  }
  return BASE_CURRENCY;
}

export function loadCurrency() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && getCurrency(saved).code === saved) return saved;
  } catch {
    /* localStorage unavailable (SSR / privacy mode) */
  }
  return detectCurrency();
}

export function saveCurrency(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* non-fatal */
  }
}

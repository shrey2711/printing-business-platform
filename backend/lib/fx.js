// Live FX rates, cached in memory, with a static fallback.
//
// This sits in front of BOTH price display and Stripe charging, so a bad
// response here would mis-charge real money. Three guards, in order:
//   1. sane-range validation — a null/0/absurd rate is rejected outright
//   2. last-known-good cache — a failed refresh keeps serving the previous rate
//   3. static fallback from brand.js — used only if we have never succeeded
// The site never blocks on the FX provider and never prices at zero.

import { currencies, BASE_CURRENCY } from '../../src/config/brand.js';

// Free, keyless, and returns all rates against a base. Override via env to
// swap in a paid provider without touching code.
const RATES_URL = process.env.FX_RATES_URL || `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;
const TTL_MS = Number(process.env.FX_TTL_MS) || 60 * 60 * 1000; // 1 hour
const TIMEOUT_MS = 5000;

// Plausible bounds per currency. A provider glitch returning 0, null or 900
// must never reach a checkout session.
const SANE_RANGE = { CAD: [1.0, 2.0] };

const fallbackRates = Object.fromEntries(
  Object.values(currencies).map((c) => [c.code, c.fallbackRate])
);

let cache = { at: 0, rates: null, live: false };

function isSane(code, rate) {
  if (!Number.isFinite(rate) || rate <= 0) return false;
  const range = SANE_RANGE[code];
  if (!range) return true;
  return rate >= range[0] && rate <= range[1];
}

// Keep only the currencies we actually sell in, and only if sane.
function extract(payload) {
  const raw = payload?.rates || payload?.conversion_rates;
  if (!raw || typeof raw !== 'object') return null;

  const out = {};
  for (const code of Object.keys(fallbackRates)) {
    if (code === BASE_CURRENCY) {
      out[code] = 1;
      continue;
    }
    const rate = Number(raw[code]);
    if (!isSane(code, rate)) return null; // reject the whole payload, not just one leg
    out[code] = rate;
  }
  return out;
}

/**
 * Current rates against BASE_CURRENCY.
 * Always resolves — never throws, never returns an empty object.
 * @returns {Promise<{rates: Record<string,number>, live: boolean, fetchedAt: number, source: string}>}
 */
export async function getRates() {
  const fresh = cache.rates && Date.now() - cache.at < TTL_MS;
  if (fresh) {
    return { rates: cache.rates, live: cache.live, fetchedAt: cache.at, source: 'cache' };
  }

  try {
    const res = await fetch(RATES_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`FX provider returned ${res.status}`);
    const rates = extract(await res.json());
    if (!rates) throw new Error('FX payload missing or out of sane range');

    cache = { at: Date.now(), rates, live: true };
    return { rates, live: true, fetchedAt: cache.at, source: 'live' };
  } catch (err) {
    // Serve the last good rate if we have one; otherwise the static fallback.
    if (cache.rates) {
      console.warn(`[fx] refresh failed (${err.message}) — serving cached rate`);
      return { rates: cache.rates, live: cache.live, fetchedAt: cache.at, source: 'stale-cache' };
    }
    console.warn(`[fx] refresh failed (${err.message}) — serving static fallback`);
    return { rates: fallbackRates, live: false, fetchedAt: 0, source: 'fallback' };
  }
}

// Rate for a single currency, for server-side conversion at checkout.
export async function getRate(code) {
  const { rates } = await getRates();
  return rates[code] ?? fallbackRates[code] ?? 1;
}

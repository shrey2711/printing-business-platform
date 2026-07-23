import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_CURRENCY, currencies } from '../config/brand';
import { formatMoney, loadCurrency, saveCurrency } from '../lib/money';

// Display currency (USD/CAD) plus the live FX rates behind it.
//
// Rates come from our own /api/rates rather than the browser calling an FX
// provider directly: it keeps the provider off the critical path, avoids a
// third-party request from every visitor, and — most importantly — means the
// rate shown to the customer is the same cached rate the server charges at.
const CurrencyContext = createContext({
  currency: BASE_CURRENCY,
  setCurrency: () => {},
  rates: {},
  ratesLive: false
});

// Static fallbacks, used until /api/rates responds (and if it never does).
const fallbackRates = Object.fromEntries(
  Object.values(currencies).map((c) => [c.code, c.fallbackRate])
);

export function CurrencyProvider({ children }) {
  // Always start on the base currency so server-prerendered HTML and the first
  // client render agree; the stored/detected preference lands after hydration.
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);
  const [rates, setRates] = useState(fallbackRates);
  const [ratesLive, setRatesLive] = useState(false);

  useEffect(() => {
    setCurrencyState(loadCurrency());
  }, []);

  useEffect(() => {
    let alive = true;
    fetch('/api/rates')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.rates) return;
        setRates({ ...fallbackRates, ...data.rates });
        setRatesLive(Boolean(data.live));
      })
      .catch(() => {
        /* keep the fallback rates — prices still render, just not live */
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      currency,
      rates,
      ratesLive,
      rate: rates[currency] ?? 1,
      setCurrency: (code) => {
        setCurrencyState(code);
        saveCurrency(code);
      }
    }),
    [currency, rates, ratesLive]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

// Convenience: a formatter already bound to the active currency and live rate.
// const money = useMoney();  ->  money(1049) === "CA$1,438.39"
export function useMoney() {
  const { currency, rates } = useCurrency();
  const rate = rates[currency];
  return useMemo(
    () => (amount, opts = {}) => formatMoney(amount, currency, { ...opts, rate }),
    [currency, rate]
  );
}

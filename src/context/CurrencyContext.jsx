import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_CURRENCY } from '../config/brand';
import { formatMoney, loadCurrency, saveCurrency } from '../lib/money';

// Display currency (USD/CAD). Catalog prices are stored in the base currency
// and converted at render time — see src/lib/money.js.
const CurrencyContext = createContext({
  currency: BASE_CURRENCY,
  setCurrency: () => {}
});

export function CurrencyProvider({ children }) {
  // Always start on the base currency so server-prerendered HTML and the first
  // client render agree; the stored/detected preference lands after hydration.
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);

  useEffect(() => {
    setCurrencyState(loadCurrency());
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency: (code) => {
        setCurrencyState(code);
        saveCurrency(code);
      }
    }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

// Convenience: a formatter already bound to the active currency.
// const money = useMoney();  ->  money(1049) === "CA$1,447.62"
export function useMoney() {
  const { currency } = useCurrency();
  return useMemo(() => (amount, opts) => formatMoney(amount, currency, opts), [currency]);
}

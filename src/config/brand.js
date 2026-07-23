// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH FOR BRAND IDENTITY + CURRENCY.
//
// ⚠ THE BRAND NAME BELOW IS A PLACEHOLDER. Before launch, replace `name`,
//   `shortName`, `domain` and `email`, set `placeholder: false`, and re-run
//   `npm run build`. Run a trademark/domain check on the real name first.
//
// Nothing else in the codebase should hardcode the brand — import from here.
// Plain ESM with no React imports, so scripts/prerender.mjs can import it too
// (same pattern as src/data/states.js).
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  placeholder: true,

  name: 'Canopy Tent Co.',
  shortName: 'Canopy Tent Co.',
  // Rendered in the header logo as two-tone text: <first><accent>
  logoText: { first: 'Canopy', accent: 'Tent Co.' },

  tagline: 'Custom printed canopy tents, priced instantly',
  description:
    'Custom printed pop-up canopy tents in 8x8, 10x10, 10x15 and 10x20. Choose your frame ' +
    'grade, print coverage, walls and accessories and see the price update live. Free artwork ' +
    'proof on every order, shipped across the US and Canada.',

  origin: 'https://printing-business-platform-frontend.vercel.app',

  email: 'sales@example.com',
  phone: '1 (800) 555-0148',
  phoneHref: '+18005550148',
  hours: 'Mon – Fri: 8:00am – 6:00pm ET',

  // Both markets are served; used for shipping copy and location SEO.
  markets: ['US', 'CA'],
  shippingBlurb: 'Ships across the United States and Canada'
};

// ─── Currency ────────────────────────────────────────────────────────────────
// All catalog prices are stored in BASE_CURRENCY (USD). Display and checkout
// convert using a LIVE rate fetched by backend/lib/fx.js and served at
// /api/rates. `fallbackRate` below is only used if the FX provider has never
// responded successfully — it is a floor, not the working rate.

export const BASE_CURRENCY = 'USD';

export const currencies = {
  USD: { code: 'USD', label: 'USD', symbol: '$', fallbackRate: 1, locale: 'en-US', stripe: 'usd' },
  CAD: { code: 'CAD', label: 'CAD', symbol: '$', fallbackRate: 1.38, locale: 'en-CA', stripe: 'cad' }
};

export const currencyCodes = Object.keys(currencies);

export function getCurrency(code) {
  return currencies[code] || currencies[BASE_CURRENCY];
}

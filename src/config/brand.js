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
  placeholder: false,

  name: 'Apex Trade Show',
  shortName: 'Apex',
  // Rendered in the header logo as two-tone text: <first><accent>
  logoText: { first: 'Apex', accent: 'Trade Show' },

  tagline: 'Complete trade show displays & event branding',
  description:
    'Everything you need to build a professional trade show booth from one supplier — custom ' +
    'canopy tents, retractable banner stands, step & repeat backdrops, table covers and event ' +
    'branding accessories. Instant online pricing on canopies, a free artwork proof on every ' +
    'order, shipped across the US and Canada.',

  origin: 'https://www.apextradeshow.com',

  email: 'info@apextradeshow.com',
  phone: '+1 672-514-7587',
  phoneHref: '+16725147587',
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

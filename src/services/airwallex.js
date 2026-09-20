// Airwallex checkout, client side.
//
// Stripe hands the server a hosted URL and the browser navigates to it. Airwallex
// does not: the server gets { id, client_secret } and the BROWSER performs the
// redirect through Airwallex.js. So unlike every other payment call in this
// codebase, this one needs a script in the page.
//
// The script is loaded on demand rather than in index.html. Nobody browsing
// products should pay for a payment SDK they will not use, and while this path
// is sandbox-only most visitors never reach it at all.

import { authHeader } from '../lib/supabase';

const SDK = {
  // Pinned rather than floating. A payment SDK that silently changes under a
  // live checkout is not a trade worth making for automatic patches.
  url: 'https://checkout.airwallex.com/assets/elements.bundle.min.js',
  global: 'Airwallex'
};

let loading = null;

/** Load Airwallex.js once, reusing the same promise for concurrent callers. */
function loadSdk() {
  if (window[SDK.global]) return Promise.resolve(window[SDK.global]);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SDK.url;
    el.async = true;
    el.onload = () => (window[SDK.global]
      ? resolve(window[SDK.global])
      : reject(new Error('Airwallex.js loaded but exposed no global')));
    el.onerror = () => {
      // Let a later attempt retry rather than caching the failure forever — an
      // ad blocker or a flaky network should not disable checkout for the session.
      loading = null;
      reject(new Error('Could not load the Airwallex payment library.'));
    };
    document.head.appendChild(el);
  });
  return loading;
}

/**
 * Create the orders and the payment intent, then hand off to Airwallex.
 *
 * Returns only on failure: success navigates away from the page.
 */
export async function startAirwallexCheckout({ lines, coupon, currency, contact, countryCode = 'US' }) {
  const res = await fetch('/api/checkout/airwallex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ lines, coupon, currency, contact })
  });
  if (res.status === 401) throw new Error('Please sign in to check out.');

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Could not start checkout.');
  if (!body.clientSecret || !body.intentId) {
    throw new Error('Airwallex did not return a payment intent.');
  }

  const Airwallex = await loadSdk();
  await Airwallex.init({
    // The SDK's environment has to match the keys the server used, or the
    // redirect lands on a page that cannot find the intent. The server reports
    // which it used rather than the client assuming.
    env: body.env === 'live' ? 'prod' : 'demo',
    origin: window.location.origin
  });

  // Navigates away. The orders already exist and stay "submitted" until the
  // webhook settles them, so an abandoned payment loses nothing.
  await Airwallex.redirectToCheckout({
    intent_id: body.intentId,
    client_secret: body.clientSecret,
    currency: body.currency,
    country_code: countryCode
  });

  return body;
}

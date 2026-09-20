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

  // WHERE FALLBACK IS SAFE, AND WHERE IT IS NOT.
  //
  // Everything up to the redirect happens before the customer has seen a
  // payment form, so no money can have moved and another processor can be
  // tried. After redirectToCheckout the customer may be entering a card on
  // Airwallex's page, and retrying on Stripe from there is how a double charge
  // happens. So `canFallBack` is set here and cleared the moment we hand off.
  //
  // A business error (an item needing a quote, an empty cart) is NOT a fallback
  // case either: Stripe would refuse it for the same reason, and swallowing the
  // message would leave the customer staring at a failure with no explanation.
  if (!res.ok) {
    const err = new Error(body.error || 'Could not start checkout.');
    // 502/503 are ours: Airwallex refused or is not configured. 4xx is the
    // customer's cart being wrong, which changing processor cannot fix.
    err.canFallBack = res.status >= 500;
    throw err;
  }
  if (!body.clientSecret || !body.intentId) {
    const err = new Error('Airwallex did not return a payment intent.');
    err.canFallBack = true;
    throw err;
  }

  let Airwallex;
  try {
    Airwallex = await loadSdk();
  } catch (e) {
    // The script was blocked or the network failed. Nothing has been charged,
    // but the orders already exist — so discard them before Stripe writes its
    // own, or one basket becomes two sets of orders.
    await fetch('/api/checkout/airwallex/abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ cartId: body.cartId })
    }).catch(() => { /* best effort — never block the fallback on cleanup */ });
    e.canFallBack = true;
    throw e;
  }
  await Airwallex.init({
    // The SDK's environment has to match the keys the server used, or the
    // redirect lands on a page that cannot find the intent. The server reports
    // which it used rather than the client assuming.
    env: body.env === 'live' ? 'prod' : 'demo',
    origin: window.location.origin
  });

  // The point of no return. From here the customer may be on Airwallex's
  // payment page, so a failure after this must NOT be retried on Stripe: the
  // first payment may yet succeed, and the second would be a double charge.
  // Anything thrown below is surfaced as-is, without canFallBack.
  await Airwallex.redirectToCheckout({
    intent_id: body.intentId,
    client_secret: body.clientSecret,
    currency: body.currency,
    country_code: countryCode
  });

  return body;
}

/**
 * Hand an already-created intent to Airwallex.
 *
 * Split out of startAirwallexCheckout so the single-order path can reuse the
 * redirect without going through the cart route. Same point of no return: once
 * this is called the customer may be on Airwallex's page.
 */
export async function redirectToAirwallex({ intentId, clientSecret, currency, env, countryCode = 'US' }) {
  const Airwallex = await loadSdk();
  await Airwallex.init({ env: env === 'live' ? 'prod' : 'demo', origin: window.location.origin });
  await Airwallex.redirectToCheckout({
    intent_id: intentId,
    client_secret: clientSecret,
    currency,
    country_code: countryCode
  });
}

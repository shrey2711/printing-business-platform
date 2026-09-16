// Thin wrapper around GA4's gtag ecommerce events (see index.html for the tag
// itself). Every call is a no-op if gtag hasn't loaded yet (ad blockers,
// consent declined, or a dev environment with no Measurement ID) so tracking
// can never throw and break the checkout flow it's watching.
const send = (name, params) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
};

const toItem = (line) => ({
  item_id: line.slug,
  item_name: line.name,
  price: Number.isFinite(line.unitPrice) ? line.unitPrice : undefined,
  quantity: Math.max(1, Number(line.quantity) || 1)
});

export const trackViewItem = ({ slug, name, price, currency = 'USD' }) => {
  send('view_item', {
    currency,
    value: Number.isFinite(price) ? price : undefined,
    items: [{ item_id: slug, item_name: name, price: Number.isFinite(price) ? price : undefined }]
  });
};

export const trackAddToCart = (line) => {
  send('add_to_cart', {
    currency: line.currency || 'USD',
    value: Number.isFinite(line.unitPrice) ? line.unitPrice * (Number(line.quantity) || 1) : undefined,
    items: [toItem(line)]
  });
};

export const trackBeginCheckout = ({ lines, value, currency = 'USD' }) => {
  send('begin_checkout', {
    currency,
    value,
    items: lines.map(toItem)
  });
};

// Fire only from a server-confirmed payment (real amount_total/currency from
// Stripe), never from the client's own cart total — a GA4 purchase event with
// a client-guessed value is exactly the kind of broken setup this is meant to
// avoid.
export const trackPurchase = ({ transactionId, value, currency, items }) => {
  send('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items: items?.map(toItem)
  });
};

export const trackGenerateLead = ({ value, currency = 'USD', leadType } = {}) => {
  send('generate_lead', { value, currency, lead_type: leadType });
};

export const trackRemoveFromCart = (line) => {
  send('remove_from_cart', {
    currency: line.currency || 'USD',
    value: Number.isFinite(line.unitPrice) ? line.unitPrice * (Number(line.quantity) || 1) : undefined,
    items: [toItem(line)]
  });
};

export const trackSignUp = (method = 'email') => send('sign_up', { method });

export const trackLogin = (method = 'email') => send('login', { method });

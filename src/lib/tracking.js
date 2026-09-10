// Carrier tracking links.
//
// A tracking number on its own asks the customer to work out who is carrying
// their parcel and find the right website. A link does that for them, so this
// maps a carrier to its public tracking URL.
//
// The admin can choose the carrier explicitly. Where it was never recorded —
// every order placed before the selector existed — the number's own shape is a
// reliable enough signal for the majors, and when it is not we send the number
// without a link rather than guessing wrong and sending someone to a carrier
// that has never heard of their parcel.

export const CARRIERS = [
  { id: 'ups', name: 'UPS', url: (n) => `https://www.ups.com/track?loc=en_US&tracknum=${n}` },
  { id: 'fedex', name: 'FedEx', url: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  { id: 'usps', name: 'USPS', url: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` },
  { id: 'dhl', name: 'DHL', url: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${n}` },
  { id: 'canada-post', name: 'Canada Post', url: (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=${n}` },
  { id: 'purolator', name: 'Purolator', url: (n) => `https://www.purolator.com/en/shipping/tracker?pin=${n}` }
];

const byId = Object.fromEntries(CARRIERS.map((c) => [c.id, c]));

const clean = (n) => String(n || '').replace(/[\s-]/g, '').toUpperCase();

// Shape-based identification, used only when no carrier was recorded. Each
// pattern is distinctive enough to be worth acting on; anything ambiguous
// returns null so the caller sends the number without a link.
export function guessCarrier(number) {
  const n = clean(number);
  if (!n) return null;
  if (/^1Z[0-9A-Z]{16}$/.test(n)) return 'ups';
  if (/^(94|93|92|95|82)\d{18,20}$/.test(n)) return 'usps';
  if (/^\d{16}$/.test(n)) return 'canada-post';
  if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n)) return 'fedex';
  return null;
}

export function carrierName(carrier, number) {
  const id = carrier || guessCarrier(number);
  return byId[id]?.name || null;
}

// Returns a public tracking URL, or null when the carrier cannot be identified.
export function trackingUrl(carrier, number) {
  const n = clean(number);
  if (!n) return null;
  const id = carrier || guessCarrier(n);
  const c = byId[id];
  return c ? c.url(encodeURIComponent(n)) : null;
}

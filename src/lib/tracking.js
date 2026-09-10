// Carrier tracking links.
//
// Orders ship from China direct to the customer in the US, so the list leads
// with the carriers that actually handle that lane. The North American carriers
// stay because a China-origin parcel is usually handed to USPS or a domestic
// courier for the final mile, and that handoff number is often what the
// customer is given.
//
// A tracking number on its own asks the customer to work out who is carrying
// their parcel and find the right website, which is worse on a cross-border
// shipment where the answer is genuinely not obvious. So the carrier is chosen
// in the dashboard, inferred from the number's shape where it was never
// recorded, and failing both, linked to an aggregator that resolves it.

// 17TRACK carries essentially every China-origin carrier and resolves the
// handoff to the domestic courier, which is exactly the ambiguity a customer
// cannot resolve on their own.
const universal = (n) => `https://t.17track.net/en#nums=${n}`;

export const CARRIERS = [
  // --- China origin -------------------------------------------------------
  { id: 'china-post', name: 'China Post', url: universal },
  { id: 'ems', name: 'China EMS', url: (n) => `https://www.ems.com.cn/english/queryList?mailNum=${n}` },
  { id: 'sf-express', name: 'SF Express', url: (n) => `https://www.sf-international.com/us/en/dynamic_function/waybill/#search/bill-number/${n}` },
  { id: 'yunexpress', name: 'YunExpress', url: (n) => `https://www.yuntrack.com/parcelTracking?id=${n}` },
  { id: '4px', name: '4PX', url: (n) => `https://track.4px.com/#/result/0/${n}` },
  { id: 'yanwen', name: 'Yanwen', url: (n) => `https://track.yw56.com.cn/en-US?nums=${n}` },
  { id: 'cainiao', name: 'Cainiao', url: (n) => `https://global.cainiao.com/detail.htm?mailNoList=${n}` },
  { id: 'jcex', name: 'JCEX', url: universal },
  // --- International express ----------------------------------------------
  { id: 'dhl', name: 'DHL', url: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${n}` },
  { id: 'fedex', name: 'FedEx', url: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  { id: 'ups', name: 'UPS', url: (n) => `https://www.ups.com/track?loc=en_US&tracknum=${n}` },
  // --- Final mile in North America ----------------------------------------
  { id: 'usps', name: 'USPS', url: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` },
  { id: 'canada-post', name: 'Canada Post', url: (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=${n}` },
  { id: 'purolator', name: 'Purolator', url: (n) => `https://www.purolator.com/en/shipping/tracker?pin=${n}` },
  // --- Anything else ------------------------------------------------------
  { id: '17track', name: '17TRACK', url: universal }
];

const byId = Object.fromEntries(CARRIERS.map((c) => [c.id, c]));

const clean = (n) => String(n || '').replace(/[\s-]/g, '').toUpperCase();

// Shape-based identification, used only when no carrier was recorded.
export function guessCarrier(number) {
  const n = clean(number);
  if (!n) return null;
  // UPU S10 format: two letters, nine digits, origin country. A CN suffix is a
  // China Post or EMS item — the single most common shape on this lane.
  if (/^[A-Z]{2}\d{9}CN$/.test(n)) return n.startsWith('E') ? 'ems' : 'china-post';
  if (/^1Z[0-9A-Z]{16}$/.test(n)) return 'ups';
  if (/^(94|93|92|95|82)\d{18,20}$/.test(n)) return 'usps';
  if (/^SF\d{10,}$/.test(n)) return 'sf-express';
  if (/^YT\d{10,}$/.test(n)) return 'yunexpress';
  if (/^\d{16}$/.test(n)) return 'canada-post';
  if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n)) return 'fedex';
  return null;
}

export function carrierName(carrier, number) {
  const id = carrier || guessCarrier(number);
  return byId[id]?.name || null;
}

// A tracking URL for every number. Where the carrier is unknown the aggregator
// still resolves it, which beats handing a cross-border customer a bare number
// and leaving them to guess who has their parcel.
export function trackingUrl(carrier, number) {
  const n = clean(number);
  if (!n) return null;
  const id = carrier || guessCarrier(n);
  const c = byId[id];
  return (c ? c.url : universal)(encodeURIComponent(n));
}

// True when the link is the aggregator rather than a named carrier, so the
// email can word itself honestly instead of naming a carrier we do not know.
export function isAggregateLink(carrier, number) {
  const id = carrier || guessCarrier(number);
  return !id || id === '17track' || id === 'china-post' || id === 'jcex';
}

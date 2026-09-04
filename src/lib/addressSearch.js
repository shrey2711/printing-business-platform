// Address lookup for the order and quote forms.
//
// Provider-agnostic on purpose. Photon (OpenStreetMap data, run by Komoot) is
// the default because it needs no key and no billing account, which means
// address search works the moment this deploys. If VITE_GOOGLE_PLACES_KEY is
// set, Google is used instead — better coverage of new-build and rural
// addresses, at a cost per request.
//
// Two rules this follows, because a lookup that fails must never cost an order:
//
//   1. Every field stays typeable. The suggestions fill them in; they do not
//      own them. A customer whose address the provider has never heard of can
//      still enter it by hand.
//   2. A failed or slow request is silent. No error banner, no blocked submit —
//      the form simply behaves as it did before this existed.
//
// A note on what leaves the browser: the partial address someone types is sent
// to the provider to get suggestions. That is how any address lookup works, and
// worth knowing before enabling it in a privacy notice.

const GOOGLE_KEY = import.meta.env?.VITE_GOOGLE_PLACES_KEY || '';

export const provider = GOOGLE_KEY ? 'google' : 'photon';

/** Map a Photon feature onto the fields the form holds. */
function fromPhoton(feature) {
  const p = feature.properties || {};
  const street = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
  return {
    label: [street, p.city || p.town || p.village, p.state, p.postcode, p.country]
      .filter(Boolean)
      .join(', '),
    street,
    city: p.city || p.town || p.village || p.county || '',
    state: p.state || '',
    postal: p.postcode || '',
    country: (p.countrycode || '').toUpperCase()
  };
}

async function searchPhoton(query, { country, signal, limit }) {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('lang', 'en');

  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const body = await res.json();

  return (body.features || [])
    .map(fromPhoton)
    // A suggestion with no street is a city or a region, which cannot be
    // delivered to. Keeping them would let someone "pick" an address that is
    // really just a place name.
    .filter((a) => a.street)
    // When a country is already chosen, suggestions from elsewhere are noise.
    .filter((a) => !country || !a.country || a.country === country);
}

async function searchGoogle(query, { country, signal, limit }) {
  // Places Autocomplete (New). Called directly from the browser, so the key must
  // be restricted by HTTP referrer in the Google console — an unrestricted key
  // is billable by anyone who finds it.
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': 'suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
    },
    body: JSON.stringify({
      input: query,
      ...(country ? { includedRegionCodes: [country] } : {})
    })
  });
  if (!res.ok) return [];
  const body = await res.json();

  // Autocomplete returns formatted text, not components; the components arrive
  // from a details call. Rather than spend a second billed request per keystroke,
  // the main line fills the street and the rest stays editable.
  return (body.suggestions || [])
    .slice(0, limit)
    .map((s) => {
      const pred = s.placePrediction || {};
      const main = pred.structuredFormat?.mainText?.text || '';
      const secondary = pred.structuredFormat?.secondaryText?.text || '';
      return {
        label: pred.text?.text || [main, secondary].filter(Boolean).join(', '),
        street: main,
        city: secondary.split(',')[0]?.trim() || '',
        state: '',
        postal: '',
        country: country || ''
      };
    })
    .filter((a) => a.street);
}

/**
 * Look up addresses matching a partial string.
 * Never throws: on any failure it returns nothing and the form carries on.
 *
 * @param {string} query
 * @param {{ country?: string, signal?: AbortSignal, limit?: number }} opts
 * @returns {Promise<Array<{label,street,city,state,postal,country}>>}
 */
export async function searchAddresses(query, { country = '', signal, limit = 6 } = {}) {
  const q = String(query || '').trim();
  // Below three characters every provider returns noise, and it is a request per
  // keystroke for nothing.
  if (q.length < 3) return [];

  try {
    return provider === 'google'
      ? await searchGoogle(q, { country, signal, limit })
      : await searchPhoton(q, { country, signal, limit });
  } catch (e) {
    // AbortError is the normal case: a newer keystroke replaced this request.
    if (e?.name !== 'AbortError') {
      console.warn('Address lookup unavailable, falling back to manual entry:', e?.message);
    }
    return [];
  }
}

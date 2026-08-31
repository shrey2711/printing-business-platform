// Brevo (formerly Sendinblue) contact subscription.
//
// Brevo is the list host and the data controller for marketing contacts, so we
// do NOT keep a shadow copy of subscriber emails locally — no local list means
// no local unsubscribe obligation to get wrong. Unsubscribes are handled by
// Brevo's own link in every campaign.
//
// Configure with:
//   BREVO_API_KEY   — v3 API key (Brevo dashboard → SMTP & API → API keys)
//   BREVO_LIST_ID   — numeric id of the list to add contacts to
// Both unset = the endpoint reports "not configured" instead of failing loudly,
// so a local dev environment without keys still runs.

const API = 'https://api.brevo.com/v3/contacts';

export const brevoConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID);

// RFC-ish, deliberately permissive: Brevo does the authoritative validation.
export const isEmail = (v) => typeof v === 'string'
  && v.length <= 254
  && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Add (or update) a contact on the configured list.
 * Returns { ok, status } — `status` is 'created' | 'existing' | 'skipped' | 'error'.
 * An already-subscribed address is a SUCCESS from the visitor's point of view,
 * so a duplicate is never surfaced as a failure.
 */
export async function subscribeContact({ email, attributes = {}, source = 'site' }) {
  if (!isEmail(email)) return { ok: false, status: 'error', error: 'Invalid email' };
  if (!brevoConfigured()) return { ok: true, status: 'skipped' };

  const listId = Number(process.env.BREVO_LIST_ID);
  const body = {
    email: email.trim().toLowerCase(),
    listIds: [listId],
    updateEnabled: true, // re-subscribing an existing contact updates, never errors
    attributes: {
      SOURCE: source,
      ...Object.fromEntries(Object.entries(attributes).filter(([, v]) => v != null && v !== ''))
    }
  };

  let resp;
  try {
    resp = await fetch(API, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    return { ok: false, status: 'error', error: `Brevo unreachable: ${e.message}` };
  }

  if (resp.status === 201 || resp.status === 204) return { ok: true, status: 'created' };

  let detail = {};
  try { detail = await resp.json(); } catch { /* Brevo sends an empty body on some 2xx/4xx */ }

  // Contact already on the list — treat as success, not an error.
  if (resp.status === 400 && /duplicate_parameter|already/i.test(detail.code || detail.message || '')) {
    return { ok: true, status: 'existing' };
  }
  return { ok: false, status: 'error', error: detail.message || `Brevo responded ${resp.status}` };
}

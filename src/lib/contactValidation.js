// Validation for the details we need in order to print and ship something.
//
// What this can and cannot do is worth being precise about, because "stop fake
// addresses" is not fully solvable with rules:
//
//   It catches   empty fields, malformed emails, throwaway inboxes, phone
//                numbers with the wrong number of digits for their country,
//                postal codes in the wrong format for their country, obviously
//                fake filler ("asdf", "test", "1234 street"), and a postal code
//                that does not belong to the country selected.
//
//   It cannot    tell you the address exists or that someone lives there. That
//                needs an address-verification service (Google Address
//                Validation, Loqate, Smarty) checking against postal authority
//                data. The hooks here are shaped so one can be added later
//                without touching the form.
//
// Everything is checked again on the server: a browser check is a courtesy to
// the customer, not a control.

import { DIAL, POSTAL, NO_POSTAL, countryName } from '../data/countries.js';

// Inboxes that exist to be thrown away. Not exhaustive — it never can be — but
// it turns the laziest fakes into a visible error.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'getnada.com', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'mailnesia.com',
  'spamgourmet.com', 'mytemp.email', 'emailondeck.com', 'moakt.com', 'tempr.email'
]);

// Strings people type to get past a required field.
const FILLER = /^(?:test|testing|asdf+|qwerty|abc+|xxx+|none|na|n\/a|nil|null|undefined|\.|-|1234?5?6?)$/i;

const clean = (v) => String(v ?? '').trim();

export function validateName(value) {
  const v = clean(value);
  if (!v) return 'Please give us a name we can address you by.';
  if (v.length < 2) return 'That name looks too short.';
  if (FILLER.test(v)) return 'Please enter your real name — we use it on the proof and the invoice.';
  // A name with no letters at all is not a name.
  if (!/\p{L}/u.test(v)) return 'That does not look like a name.';
  return null;
}

export function validateEmail(value) {
  const v = clean(value).toLowerCase();
  if (!v) return 'We need an email address to send your proof to.';
  // Deliberately not the RFC grammar: this rejects what is unusable in practice
  // without rejecting valid-but-unusual addresses.
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v)) return 'That email address is not valid.';
  const domain = v.split('@')[1];
  if (DISPOSABLE.has(domain)) {
    return 'That is a temporary email service. Please use an address you can receive your proof at.';
  }
  if (/^(test|fake|asdf|noreply|no-reply)@/.test(v)) return 'Please use a real email address.';
  return null;
}

/**
 * Phone, checked against the country's dial code and plausible length.
 * Rejects repeated digits and sequences, which is what a fake usually is.
 */
export function validatePhone(value, country) {
  const raw = clean(value);
  if (!raw) return 'We need a phone number in case there is a problem with your artwork.';

  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) return 'That phone number is too short.';
  if (digits.length > 15) return 'That phone number is too long.';   // E.164 maximum
  if (/^(\d)\1+$/.test(digits)) return 'That phone number does not look real.';
  if (/^(?:0123456789|1234567890|9876543210)/.test(digits)) return 'That phone number does not look real.';

  const dial = country && DIAL[country];
  if (dial) {
    // A national number typed without the country code is fine; one typed WITH a
    // different country's code usually means the wrong country is selected.
    const withCode = digits.startsWith(dial);
    const national = withCode ? digits.slice(dial.length) : digits;
    if (national.length < 6) return 'That phone number is too short for the country selected.';
    if (!withCode && digits.length > 11 && !digits.startsWith('0')) {
      return `That number does not look like a ${countryName(country)} number. Check the country, or include the country code.`;
    }
  }
  return null;
}

export function validatePostal(value, country) {
  const v = clean(value);
  if (country && NO_POSTAL.has(country)) return null;   // no postal system to check against
  if (!v) return 'Please include the postal or ZIP code.';

  const rule = country && POSTAL[country];
  if (rule && !rule.re.test(v)) {
    return `That postal code is not a valid format for ${countryName(country)} (e.g. ${rule.hint}).`;
  }
  if (!rule && v.length < 3) return 'That postal code looks too short.';
  return null;
}

export function validateStreet(value) {
  const v = clean(value);
  if (!v) return 'Please give the street address.';
  if (v.length < 5) return 'That street address looks too short.';
  if (FILLER.test(v)) return 'Please enter your real street address.';
  // A deliverable street line has a number and a name.
  if (!/\d/.test(v)) return 'Please include the building or street number.';
  if (!/\p{L}{2,}/u.test(v)) return 'Please include the street name.';
  return null;
}

export function validateCity(value) {
  const v = clean(value);
  if (!v) return 'Please give the city or town.';
  if (v.length < 2) return 'That city name looks too short.';
  if (FILLER.test(v)) return 'Please enter the real city or town.';
  if (!/\p{L}/u.test(v)) return 'That does not look like a place name.';
  return null;
}

export function validateCountry(value) {
  const v = clean(value);
  if (!v) return 'Please choose a country — it decides shipping cost and transit time.';
  if (!/^[A-Z]{2}$/.test(v)) return 'Please choose a country from the list.';
  return null;
}

/**
 * Validate a whole contact block.
 * @returns {{ ok: boolean, errors: Record<string,string> }}
 */
export function validateContact(c = {}) {
  const errors = {};
  const put = (k, e) => { if (e) errors[k] = e; };

  put('name', validateName(c.name));
  put('email', c.email !== undefined ? validateEmail(c.email) : null);
  put('country', validateCountry(c.country));
  put('phone', validatePhone(c.phone, c.country));
  put('street', validateStreet(c.street));
  put('city', validateCity(c.city));
  put('state', c.state !== undefined && !clean(c.state) && ['US', 'CA', 'AU', 'IN', 'BR', 'MX'].includes(c.country)
    ? 'Please give the state or province.'
    : null);
  put('postal', validatePostal(c.postal, c.country));

  return { ok: Object.keys(errors).length === 0, errors };
}

/** One address line, for storing and for the emails. */
export function formatAddress(c = {}) {
  return [c.street, c.city, [c.state, c.postal].filter(Boolean).join(' '), countryName(c.country)]
    .map((p) => clean(p))
    .filter(Boolean)
    .join(', ');
}

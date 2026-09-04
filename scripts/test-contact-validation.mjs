// Tests for the contact and address rules on the quote form.
//
// The goal is to stop unusable submissions — a proof that cannot be emailed, a
// parcel that cannot be delivered, a phone nobody answers — without rejecting
// real customers. Both directions are tested, because a false rejection loses an
// order silently and is far harder to notice than a fake getting through.
//
// Run: node scripts/test-contact-validation.mjs

import { readFileSync } from 'fs';
import {
  validateContact, validateEmail, validatePhone, validatePostal, formatAddress
} from '../src/lib/contactValidation.js';
import { countryOptions, POSTAL, NO_POSTAL } from '../src/data/countries.js';

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

const VALID = {
  name: 'Jane Doe', email: 'jane@company.com', phone: '604 555 0134', country: 'CA',
  street: '12 Example Street', city: 'Vancouver', state: 'BC', postal: 'V6B 1A1'
};

check('a complete, real-looking submission is accepted', () => {
  const r = validateContact(VALID);
  return r.ok ? null : JSON.stringify(r.errors);
});

check('real addresses from several countries are accepted', () => {
  const cases = [
    { ...VALID, country: 'US', phone: '212 555 0147', street: '350 Fifth Avenue', city: 'New York', state: 'NY', postal: '10118' },
    { ...VALID, country: 'GB', phone: '020 7946 0958', street: '10 Downing Street', city: 'London', state: '', postal: 'SW1A 2AA' },
    { ...VALID, country: 'IN', phone: '98200 12345', street: '24 Marine Drive', city: 'Mumbai', state: 'Maharashtra', postal: '400020' },
    { ...VALID, country: 'DE', phone: '030 12345678', street: '5 Unter den Linden', city: 'Berlin', state: '', postal: '10117' },
    { ...VALID, country: 'AE', phone: '04 555 0123', street: '1 Sheikh Zayed Road', city: 'Dubai', state: '', postal: '' }
  ];
  for (const c of cases) {
    const r = validateContact(c);
    if (!r.ok) return `${c.country} rejected: ${JSON.stringify(r.errors)}`;
  }
  return null;
});

check('a postal code from the wrong country is caught', () => {
  // The most common sign of a made-up address.
  if (validatePostal('90210', 'CA') === null) return 'a US ZIP passed as Canadian';
  if (validatePostal('V6B 1A1', 'US') === null) return 'a Canadian code passed as US';
  if (validatePostal('SW1A 1AA', 'DE') === null) return 'a UK code passed as German';
  return null;
});

check('countries without postal codes are not asked for one', () => {
  for (const country of [...NO_POSTAL].slice(0, 5)) {
    if (validatePostal('', country) !== null) return `${country} was asked for a postal code it does not use`;
  }
  return null;
});

check('throwaway email services are refused', () => {
  for (const e of ['x@mailinator.com', 'x@yopmail.com', 'x@10minutemail.com']) {
    if (validateEmail(e) === null) return `${e} was accepted`;
  }
  return null;
});

check('normal email addresses are accepted, including unusual ones', () => {
  for (const e of ['jane@company.com', 'jane.doe+quotes@sub.company.co.uk', 'o.brien@example.ie']) {
    const err = validateEmail(e);
    if (err !== null) return `${e} was rejected: ${err}`;
  }
  return null;
});

check('malformed email addresses are refused', () => {
  for (const e of ['jane', 'jane@', '@company.com', 'jane@company', 'jane @company.com']) {
    if (validateEmail(e) === null) return `${e} was accepted`;
  }
  return null;
});

check('obviously fake phone numbers are refused', () => {
  for (const p of ['1111111111', '0000000000', '1234567890', '123']) {
    if (validatePhone(p, 'US') === null) return `${p} was accepted`;
  }
  return null;
});

check('real phone numbers are accepted, with or without a country code', () => {
  const cases = [['604 555 0134', 'CA'], ['+1 604 555 0134', 'CA'], ['020 7946 0958', 'GB'], ['+44 20 7946 0958', 'GB'], ['98200 12345', 'IN']];
  for (const [p, c] of cases) {
    const err = validatePhone(p, c);
    if (err) return `${p} (${c}) rejected: ${err}`;
  }
  return null;
});

check('filler text is refused in the fields people type it into', () => {
  const cases = [['name', 'asdf'], ['name', 'test'], ['city', 'n/a'], ['street', 'test']];
  for (const [field, value] of cases) {
    const r = validateContact({ ...VALID, [field]: value });
    if (r.ok) return `${field}="${value}" was accepted`;
  }
  return null;
});

check('a street address needs both a number and a name', () => {
  if (validateContact({ ...VALID, street: 'Example Street' }).ok) return 'accepted a street with no number';
  if (validateContact({ ...VALID, street: '12' }).ok) return 'accepted a number with no street';
  return null;
});

check('a state is required where addresses depend on one, and not elsewhere', () => {
  for (const country of ['US', 'CA', 'AU', 'IN']) {
    const r = validateContact({
      ...VALID, country, state: '',
      postal: country === 'US' ? '10118' : country === 'AU' ? '2000' : country === 'IN' ? '400020' : VALID.postal,
      phone: '2125550147'
    });
    if (r.ok) return `${country} accepted an address with no state or province`;
  }
  const gb = validateContact({ ...VALID, country: 'GB', state: '', postal: 'SW1A 2AA', phone: '020 7946 0958' });
  return gb.ok ? null : `GB wrongly required a state: ${JSON.stringify(gb.errors)}`;
});

check('every country in the dropdown has a usable name', () => {
  const list = countryOptions();
  if (list.length < 200) return `only ${list.length} countries listed`;
  const unnamed = list.filter((c) => !c.name || c.name === c.code);
  if (unnamed.length > 5) return `${unnamed.length} countries show a raw code instead of a name`;
  const dupes = list.length - new Set(list.map((c) => c.code)).size;
  return dupes ? `${dupes} duplicate country codes` : null;
});

check('every postal rule accepts its own example', () => {
  // A rule whose own hint fails it would reject every real customer there.
  for (const [country, rule] of Object.entries(POSTAL)) {
    const example = rule.hint.split(' or ')[0];
    if (!rule.re.test(example)) return `${country}: the hint "${example}" fails its own rule`;
  }
  return null;
});

check('the address is formatted into one readable line', () => {
  const line = formatAddress(VALID);
  for (const part of ['12 Example Street', 'Vancouver', 'BC', 'V6B 1A1', 'Canada']) {
    if (!line.includes(part)) return `"${part}" missing from "${line}"`;
  }
  return null;
});

check('the server validates with the same module the form uses', () => {
  const app = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
  if (!/contactValidation\.js/.test(app)) return 'the server does not import the shared rules';
  if (!/validateQuoteContact\(b\)/.test(app)) return 'the quote endpoint does not call it';
  return null;
});

check('address search never blocks a manual entry', () => {
  // The lookup is an enhancement. If it fails, is slow, or has never heard of
  // an address, the customer must still be able to type one and submit.
  const cmp = readFileSync(new URL('../src/components/AddressAutocomplete.jsx', import.meta.url), 'utf8');
  if (!cmp.includes('onChange(e.target.value)')) return 'the field is not freely typeable';
  if (cmp.includes('disabled')) return 'the input can be disabled by the lookup';
  const lib = readFileSync(new URL('../src/lib/addressSearch.js', import.meta.url), 'utf8');
  if (!lib.includes('catch (e)')) return 'a failed lookup is not caught';
  if (!lib.includes('return [];')) return 'a failure does not degrade to no suggestions';
  return null;
});

check('a suggestion never blanks a field it has no value for', () => {
  // A partial result must not wipe a city or postal code already typed.
  for (const page of ['QuotePage.jsx', 'PlaceOrderPage.jsx']) {
    const src = readFileSync(new URL('../src/pages/' + page, import.meta.url), 'utf8');
    const i = src.indexOf('applyAddress');
    if (i === -1) return page + ' does not apply a chosen address';
    const block = src.slice(i, i + 500);
    if (!block.includes('a.city ||')) return page + ' overwrites city with an empty value';
    if (!block.includes('a.postal ||')) return page + ' overwrites the postal code with an empty value';
  }
  return null;
});

if (fails.length) {
  console.error(`\n✗ CONTACT VALIDATION FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CONTACT VALIDATION OK — ${ran} assertions: real customers get through, and unusable details do not.`);

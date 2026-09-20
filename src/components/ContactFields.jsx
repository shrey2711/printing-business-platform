import AddressAutocomplete from './AddressAutocomplete';
import { validateContact } from '../lib/contactValidation';
import { countryOptions, POSTAL, NO_POSTAL } from '../data/countries';

const COUNTRIES = countryOptions();

// The contact and delivery address block, shared by the single-order page and
// the cart.
//
// Extracted rather than copied. The cart used to collect none of this: it sent
// no contact at all, so a cart order reached the workshop with an email address
// and nothing to ship to, while an identical single-item order arrived complete.
// Two copies of the form would have drifted the same way again — one place to
// add a field is the point.
//
// `value` / `onChange` keep the state in the page, because each page decides
// when the form is complete enough to act on.
export default function ContactFields({ value, onChange, idPrefix = 'c' }) {
  const setField = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  // A chosen suggestion fills the rest; anything it does not supply keeps what
  // was already typed rather than being blanked.
  const applyAddress = (a) => onChange({
    ...value,
    street: a.street || value.street,
    city: a.city || value.city,
    state: a.state || value.state,
    postal: a.postal || value.postal,
    country: a.country || value.country
  });

  const check = validateContact(value);
  const id = (k) => `${idPrefix}${k}`;

  return (
    <>
      <div className="field-row">
        <div className="field">
          <label htmlFor={id('name')}>Contact name *</label>
          <input id={id('name')} value={value.name} onChange={setField('name')} required />
        </div>
        <div className="field">
          <label htmlFor={id('phone')}>Phone *</label>
          <input id={id('phone')} type="tel" value={value.phone} onChange={setField('phone')} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor={id('country')}>Country *</label>
        <select id={id('country')} value={value.country} onChange={setField('country')} required>
          <option value="">Select a country…</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <small className="muted">Shipping cost and transit time depend on where this is going.</small>
      </div>

      <div className="field">
        <label htmlFor={id('street')}>Street address *</label>
        <AddressAutocomplete
          id={id('street')}
          name="street"
          value={value.street}
          country={value.country}
          onChange={(v) => onChange({ ...value, street: v })}
          onSelect={applyAddress}
          required
        />
      </div>

      <div className="three-col">
        <div className="field">
          <label htmlFor={id('city')}>City *</label>
          <input id={id('city')} value={value.city} onChange={setField('city')} required />
        </div>
        <div className="field">
          <label htmlFor={id('state')}>State / province</label>
          <input id={id('state')} value={value.state} onChange={setField('state')} />
        </div>
        <div className="field">
          <label htmlFor={id('postal')}>
            {NO_POSTAL.has(value.country) ? 'Postal code (not used here)' : 'Postal code *'}
          </label>
          <input
            id={id('postal')}
            value={value.postal}
            onChange={setField('postal')}
            placeholder={POSTAL[value.country] ? `e.g. ${POSTAL[value.country].hint}` : ''}
          />
        </div>
      </div>

      {/* Only once they have started filling it in. Showing "name is required"
          against an untouched form is nagging, not help. */}
      {!check.ok && (value.name || value.street) ? (
        <p className="field-error">{Object.values(check.errors)[0]}</p>
      ) : null}
    </>
  );
}

/** The empty shape, so both pages start from the same fields. */
export const emptyContact = {
  name: '', phone: '', street: '', city: '', state: '', postal: '', country: ''
};

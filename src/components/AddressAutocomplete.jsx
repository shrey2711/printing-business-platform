import { useEffect, useRef, useState } from 'react';
import { searchAddresses } from '../lib/addressSearch';

// Street field with address suggestions.
//
// It is an enhancement over a plain text input, never a replacement for one:
// the field stays fully typeable, suggestions can be ignored, and if the lookup
// service is slow or down the input behaves exactly as it did before. An
// address the provider has never heard of — a new build, a rural lot, a unit
// behind another unit — must still be enterable, or the form loses the order.
//
// Choosing a suggestion fills city, state, postal code and country as well, so
// the postal-code check downstream is comparing values that came from the same
// record rather than four things typed separately.

const DEBOUNCE_MS = 280;

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  country,
  id = 'street',
  name = 'street',
  placeholder = 'Start typing your address…',
  required = false
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);

  const boxRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  // Set while applying a suggestion, so the resulting value change does not
  // immediately trigger a fresh search for the text we just inserted.
  const justPicked = useRef(false);

  useEffect(() => {
    if (justPicked.current) { justPicked.current = false; return; }

    clearTimeout(timerRef.current);
    abortRef.current?.abort();

    const q = String(value || '');
    if (q.trim().length < 3) { setSuggestions([]); setOpen(false); return; }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      const found = await searchAddresses(q, { country, signal: controller.signal });
      setBusy(false);
      setSuggestions(found);
      setActive(-1);
      setOpen(found.length > 0);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [value, country]);

  // Close when focus or a click goes elsewhere.
  useEffect(() => {
    const away = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const pick = (address) => {
    justPicked.current = true;
    setOpen(false);
    setSuggestions([]);
    onSelect?.(address);
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className="address-autocomplete" ref={boxRef}>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length && setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-suggestions`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
      />
      {busy ? <span className="address-busy" aria-hidden="true">…</span> : null}

      {open && suggestions.length > 0 ? (
        <ul className="address-suggestions" id={`${id}-suggestions`} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : undefined}
              // mousedown, not click: click fires after blur, by which point the
              // list has closed and the selection is lost.
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setActive(i)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}

      <small className="muted">
        Start typing and pick your address, or just type it in full — both work.
      </small>
    </div>
  );
}

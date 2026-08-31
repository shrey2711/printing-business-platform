import { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeEmail } from '../services/api';

// Email capture, used in two places with different framing:
//   variant="proof"  — inside the configurator, where the visitor is already
//                      building a product and a free artwork proof is the
//                      natural next step. Highest intent, so it leads.
//   variant="footer" — site-wide fallback for people not mid-configuration.
//
// Deliberately not a popup: interrupting someone mid-configuration to ask for
// the address you are about to ask for anyway costs more than it captures.
export default function EmailCapture({ variant = 'footer', source, city }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  const proof = variant === 'proof';

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState('error');
      setMessage('Enter a valid email address.');
      return;
    }
    setState('sending');
    try {
      await subscribeEmail({ email: value, source: source || variant, city });
      setState('done');
      setMessage(proof
        ? 'Thanks — we’ll send artwork guidance and your proof details to that address.'
        : 'Thanks — you’re on the list.');
      setEmail('');
    } catch {
      // The endpoint answers 200 even when Brevo is down, so reaching here means
      // the request itself failed. Say so plainly rather than pretending.
      setState('error');
      setMessage('That didn’t go through. Please try again.');
    }
  };

  return (
    <form className={`email-capture email-capture--${variant}`} onSubmit={submit} noValidate>
      <h4 className="ec-title">
        {proof ? 'Get a free artwork proof' : 'Setup tips and new products'}
      </h4>
      <p className="ec-blurb">
        {proof
          ? 'Send your address and we’ll follow up with artwork specs, sizing guidance and a free proof before anything prints.'
          : 'Occasional email on booth setup, sizing and new products. No more than a couple a month.'}
      </p>

      <div className="ec-row">
        <label className="visually-hidden" htmlFor={`ec-${variant}`}>Email address</label>
        <input
          id={`ec-${variant}`}
          type="email"
          className="ec-input"
          placeholder="you@company.com"
          value={email}
          autoComplete="email"
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
          disabled={state === 'sending' || state === 'done'}
          required
        />
        <button className="btn btn-primary ec-submit" type="submit" disabled={state === 'sending' || state === 'done'}>
          {state === 'sending' ? 'Sending…' : state === 'done' ? 'Done' : proof ? 'Send me the details' : 'Subscribe'}
        </button>
      </div>

      {message && (
        <p className={`ec-msg ${state === 'error' ? 'ec-msg--error' : 'ec-msg--ok'}`} role="status">{message}</p>
      )}

      <p className="ec-consent">
        We use your address to send the emails described above and nothing else. Unsubscribe from any
        email. See our <Link to="/privacy">privacy policy</Link>.
      </p>
    </form>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import {
  TENT_RULES_META,
  TENT_RULES_FINDINGS,
  TENT_RULES_BANDS,
  TENT_RULES,
  TENT_CHECKLIST,
  PLANNER_EVENT_TYPES,
  PLANNER_TENT_SIZES,
  TENT_RULES_FAQ
} from '../data/tentRules';
import '../styles/tent-rules.css';

const SANDBAG_LB = 25;

// Vendor-neutral reference: what events actually require for tent weights.
// The checklist section prints on its own (see tent-rules.css @media print).
export default function TentRulesPage() {
  useDocumentMeta(TENT_RULES_META.title, TENT_RULES_META.description);

  const [eventKey, setEventKey] = useState('craft');
  const [sizeKey, setSizeKey] = useState('10x10');
  const [walls, setWalls] = useState(false);
  const [ruleLb, setRuleLb] = useState('');

  const evt = PLANNER_EVENT_TYPES.find((e) => e.key === eventKey);
  const size = PLANNER_TENT_SIZES.find((s) => s.key === sizeKey);
  const known = Number(ruleLb) > 0 ? Number(ruleLb) : null;
  // The event's own rule wins. Otherwise use the typical rule for the event
  // type, and step up to at least 40 lb when walls are up.
  const perLeg = known ?? Math.max(evt.perLeg, walls ? 40 : 0);
  const total = perLeg * size.legs;
  const bags = Math.ceil(perLeg / SANDBAG_LB) * size.legs;

  return (
    <main className="page tent-rules">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/">Home</Link> / <Link to="/resources">Learning Center</Link> / <span>Tent weight rules</span>
      </nav>

      <header className="section-head">
        <h1>{TENT_RULES_META.h1}</h1>
        <p className="tr-updated">Updated {TENT_RULES_META.updated}</p>
        <p>{TENT_RULES_META.intro}</p>
      </header>

      <section className="tr-block">
        <h2>Key findings</h2>
        <ul className="tr-findings">
          {TENT_RULES_FINDINGS.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>

      <section className="tr-block">
        <h2>Typical weight per leg by event type</h2>
        <div className="tr-table-wrap">
          <table className="tr-table">
            <thead><tr><th>Event type</th><th>Weight per leg</th><th>Notes</th></tr></thead>
            <tbody>
              {TENT_RULES_BANDS.map((b) => (
                <tr key={b.type}><td>{b.type}</td><td><strong>{b.perLeg}</strong></td><td>{b.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tr-block tr-planner" aria-labelledby="planner-h">
        <h2 id="planner-h">Tent weight planner</h2>
        <p>A quick planning aid, not an engineering rating. Your event’s published rule always comes first.</p>
        <div className="tr-planner-grid">
          <label>Event type
            <select value={eventKey} onChange={(e) => setEventKey(e.target.value)}>
              {PLANNER_EVENT_TYPES.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </label>
          <label>Tent size
            <select value={sizeKey} onChange={(e) => setSizeKey(e.target.value)}>
              {PLANNER_TENT_SIZES.map((s) => <option key={s.key} value={s.key}>{s.label} ({s.legs} legs)</option>)}
            </select>
          </label>
          <label className="tr-check">
            <input type="checkbox" checked={walls} onChange={(e) => setWalls(e.target.checked)} /> Using side walls
          </label>
          <label>Your event’s rule (lb per leg, optional)
            <input type="number" min="0" inputMode="numeric" value={ruleLb} onChange={(e) => setRuleLb(e.target.value)} placeholder="e.g. 40" />
          </label>
        </div>
        <div className="tr-result" role="status" aria-live="polite">
          <div><span>Per leg</span><strong>{perLeg} lb</strong></div>
          <div><span>Total</span><strong>{total} lb</strong></div>
          <div><span>{SANDBAG_LB} lb sandbags</span><strong>{bags}</strong></div>
        </div>
      </section>

      <section className="tr-block">
        <h2>The rules, event by event</h2>
        <p>Rules as published by each organizer for the season shown. Check the source before your event, because rules change.</p>
        <div className="tr-table-wrap">
          <table className="tr-table tr-rules">
            <thead><tr><th>Event</th><th>Type</th><th>Season</th><th>Tent rule</th></tr></thead>
            <tbody>
              {TENT_RULES.map((r) => (
                <tr key={r.event}>
                  <td><a href={r.url} target="_blank" rel="noopener">{r.event}</a><span className="tr-place">{r.place}</span></td>
                  <td data-label="Type">{r.type}</td>
                  <td data-label="Season">{r.season}</td>
                  <td data-label="Rule">{r.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="tr-block tr-checklist" id="checklist">
        <div className="tr-checklist-head">
          <h2>Vendor tent checklist</h2>
          <button type="button" className="btn btn-outline tr-print" onClick={() => window.print()}>Print checklist</button>
        </div>
        <ul>
          {TENT_CHECKLIST.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <p className="tr-print-foot">From the Canopy Tent Weight Rules for Vendors guide · apextradeshow.com{'/resources/tent-weight-rules'}</p>
      </section>

      <section className="tr-block">
        <h2>Frequently asked questions</h2>
        {TENT_RULES_FAQ.map((f) => (
          <div className="tr-faq" key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
        ))}
      </section>

      <section className="tr-block tr-note">
        <h2>Organizers: use or correct this guide</h2>
        <p>You’re welcome to link to this page or the checklist from your vendor information. If your event is listed and a rule has changed, email <a href="mailto:marketing@apextradeshow.com">marketing@apextradeshow.com</a> and we’ll update it.</p>
      </section>

      <aside className="resource-cta">
        <p>Need a tent that meets your event’s rules? See our <Link to="/custom-canopies">custom canopy tents</Link>, side walls and weight bags.</p>
      </aside>
    </main>
  );
}

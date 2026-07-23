import { useEffect, useState } from 'react';
import { listPricing, savePricing, revertPricing } from '../../services/adminCms';
import { useMoney } from '../../context/CurrencyContext';

// Guarded pricing editor (admin only). Edits base prices, multipliers and
// add-on costs. The server re-validates every change (must price positive on all
// choices), audits it, and rebuilds the site. A typo here charges real
// customers — hence the confirm step and the "this is live money" banner.
export default function PricingTab({ onError, onFlash }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null); // slug being edited
  const [draft, setDraft] = useState(null); // deep copy of pricing being edited
  const [saving, setSaving] = useState(false);
  const money = useMoney();

  const load = () =>
    listPricing()
      .then((p) => setProducts(p))
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (p) => {
    setSel(p.slug);
    setDraft(JSON.parse(JSON.stringify(p.pricing))); // deep copy so edits are cancellable
  };

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const save = async () => {
    const product = products.find((p) => p.slug === sel);
    if (!window.confirm(
      `Update live pricing for "${product.name}"?\n\nThis changes what customers are charged at checkout and rebuilds the site.`
    )) return;
    setSaving(true);
    try {
      const { rebuild } = await savePricing(sel, draft, true);
      onFlash(rebuild?.triggered ? '✓ Pricing updated — site rebuilding (~2 min)' : '✓ Pricing updated');
      setSel(null);
      setDraft(null);
      load();
    } catch (e) {
      onError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const revert = async (p) => {
    if (!window.confirm(`Revert "${p.name}" to the built-in default pricing?`)) return;
    try {
      const { rebuild } = await revertPricing(p.slug);
      onFlash(rebuild?.triggered ? '✓ Reverted — site rebuilding' : '✓ Reverted');
      load();
    } catch (e) {
      onError(e.message);
    }
  };

  if (loading) return <p className="muted">Loading pricing…</p>;

  // Editor view for one product.
  if (sel && draft) {
    return (
      <div className="pricing-editor">
        <button className="back-link" onClick={() => { setSel(null); setDraft(null); }}>← All products</button>
        <div className="pricing-warning">
          ⚠ These numbers are what customers are charged. Every change is validated, logged, and
          rebuilds the site.
        </div>
        <PricingFields draft={draft} setDraft={setDraft} num={num} money={money} />
        <div className="proof-actions" style={{ marginTop: '1rem' }}>
          <button className="btn btn-red" disabled={saving} onClick={save}>Save &amp; charge this price</button>
          <button className="btn btn-outline" onClick={() => { setSel(null); setDraft(null); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pricing-warning">
        ⚠ Editing here changes what customers are charged at checkout. Admin only. Every change is
        validated and recorded.
      </div>
      <div className="admin-table card">
        <div className="cms-row blog-row cms-row-head">
          <span>Product</span><span>Model</span><span>Pricing</span><span></span>
        </div>
        {products.map((p) => (
          <div className="cms-row blog-row" key={p.slug}>
            <span className="wrap"><strong>{p.name}</strong>{!p.active && <small className="muted"> (hidden)</small>}</span>
            <span className="muted">{p.pricing.model}</span>
            <span>{p.overridden ? <em className="cms-tag-custom">customised</em> : <span className="muted">default</span>}</span>
            <span style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => open(p)}>Edit</button>
              {p.overridden && <button className="btn btn-ghost-danger btn-sm" onClick={() => revert(p)}>Reset</button>}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// Renders editable number inputs for whichever pricing model the product uses.
function PricingFields({ draft, setDraft, num }) {
  const update = (mutator) => {
    const next = JSON.parse(JSON.stringify(draft));
    mutator(next);
    setDraft(next);
  };

  if (draft.model === 'configured') {
    return (
      <>
        {(draft.optionGroups || []).map((g, gi) => (
          <div className="card pricing-group" key={g.id}>
            <h3>{g.label} <small className="muted">({g.pricing})</small></h3>
            {(g.choices || []).map((c, ci) => (
              <div className="pricing-choice" key={c.id}>
                <label>{c.label}</label>
                {g.pricing === 'multiplier' ? (
                  <div className="pricing-input">
                    <span>×</span>
                    <input type="number" step="0.01" value={c.mult ?? 1}
                      onChange={(e) => update((d) => { d.optionGroups[gi].choices[ci].mult = num(e.target.value); })} />
                  </div>
                ) : (
                  <div className="pricing-input">
                    <span>$</span>
                    <input type="number" step="1" value={c.price ?? 0}
                      onChange={(e) => update((d) => { d.optionGroups[gi].choices[ci].price = num(e.target.value); })} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  }

  if (draft.model === 'unit') {
    return (
      <div className="card pricing-group">
        <h3>Unit prices</h3>
        {(draft.variants || []).map((v, i) => (
          <div className="pricing-choice" key={v.id}>
            <label>{v.name}</label>
            <div className="pricing-input">
              <span>$</span>
              <input type="number" step="1" value={v.unitPrice ?? 0}
                onChange={(e) => update((d) => { d.variants[i].unitPrice = num(e.target.value); })} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // area
  return (
    <div className="card pricing-group">
      <h3>Area pricing</h3>
      <div className="pricing-choice">
        <label>Price per square foot</label>
        <div className="pricing-input">
          <span>$</span>
          <input type="number" step="0.05" value={draft.pricePerSqFt ?? 0}
            onChange={(e) => update((d) => { d.pricePerSqFt = num(e.target.value); })} />
        </div>
      </div>
      {(draft.materials || []).map((m, i) => (
        <div className="pricing-choice" key={m.id}>
          <label>{m.name} (multiplier)</label>
          <div className="pricing-input">
            <span>×</span>
            <input type="number" step="0.01" value={m.multiplier ?? 1}
              onChange={(e) => update((d) => { d.materials[i].multiplier = num(e.target.value); })} />
          </div>
        </div>
      ))}
    </div>
  );
}

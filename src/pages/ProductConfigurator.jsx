import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getPrice } from '../services/api';
import ProductArt from '../components/ProductArt';
import TentPhoto from '../components/TentPhoto';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { useCurrency, useMoney } from '../context/CurrencyContext';

export default function ProductConfigurator() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const money = useMoney();
  const { currency } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [config, setConfig] = useState(null);
  const [price, setPrice] = useState(null);
  const [pricing, setPricing] = useState(false);
  const debounceRef = useRef(null);

  useDocumentMeta(
    product ? `${product.name} — Custom Printing & Instant Pricing` : 'Product',
    product?.tagline
  );

  // Load the product and seed default configuration.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    getProduct(slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setConfig(buildDefaultConfig(p));
      })
      .catch(() => alive && setNotFound(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  // Recompute price whenever the configuration changes (debounced).
  useEffect(() => {
    if (!product || !config) return;
    setPricing(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getPrice({ slug, ...config });
        setPrice(result);
      } catch {
        setPrice(null);
      } finally {
        setPricing(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [slug, product, config]);

  const model = product?.pricing?.model;
  const isArea = model === 'area';
  const isConfigured = model === 'configured';

  const toggleOption = (id) => {
    setConfig((prev) => {
      const has = prev.options.includes(id);
      return { ...prev, options: has ? prev.options.filter((o) => o !== id) : [...prev.options, id] };
    });
  };

  // --- `configured` model handlers -----------------------------------------
  const setSelect = (groupId, choiceId) =>
    setConfig((prev) => ({ ...prev, selections: { ...prev.selections, [groupId]: choiceId } }));

  const setMultiCount = (groupId, choiceId, count) =>
    setConfig((prev) => {
      const group = { ...(prev.selections[groupId] || {}) };
      if (count > 0) group[choiceId] = count;
      else delete group[choiceId];
      return { ...prev, selections: { ...prev.selections, [groupId]: group } };
    });

  const orderState = () => ({
    product: product.name,
    quantity: config.quantity,
    specs: describeConfig(product, config),
    estimatedPrice: price ? money(price.total) : '',
    currency,
    notes: config.notes || '',
    // Raw pricing config so the server can re-price authoritatively at checkout.
    config: { slug, ...config }
  });

  const requestOrder = () => navigate('/order', { state: orderState() });

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;
  if (notFound || !product)
    return (
      <main className="page">
        <p className="muted">We couldn't find that product.</p>
        <Link className="btn btn-outline" to="/products">← Back to products</Link>
      </main>
    );

  const p = product.pricing;
  const sel = config?.selections || {};

  // Volume pricing brackets from quantityTiers, e.g. "1-2 units $835/unit",
  // "3+ units $799/unit", with the row matching the current quantity marked.
  const qtyNow = Number(config?.quantity) || 1;
  const tierRows = [...(p?.quantityTiers || [])]
    .sort((a, b) => a.min - b.min)
    .map((t, i, arr) => {
      const next = arr[i + 1];
      return {
        label: next ? `${t.min}-${next.min - 1} units` : `${t.min}+ units`,
        price: t.price,
        active: qtyNow >= t.min && (!next || qtyNow < next.min)
      };
    });

  // Pre-multiplier subtotal, so a whole-order multiplier (rush) can show its
  // real dollar value instead of a bare percentage.
  const totalMultGroup = (p?.optionGroups || []).find((g) => g.pricing === 'multiplyTotal');
  const curTotalMult = (() => {
    if (!totalMultGroup) return 1;
    const c = totalMultGroup.choices.find((x) => x.id === sel[totalMultGroup.id]) ||
      totalMultGroup.choices.find((x) => x.default);
    return Number(c?.mult) || 1;
  })();
  const preMultTotal = price && curTotalMult ? price.subtotal / curTotalMult : 0;

  return (
    <main className="page">
      <Link className="back-link" to="/products">← All products</Link>

      <div className="config-layout">
        {/* Left: product visual + info */}
        <div className="config-visual">
          <div className="config-hero-thumb">
            {isConfigured && hasCanopyShape(p) ? (
              <TentPhoto
                size={product.slug.startsWith('canopy-tent-') ? product.slug.replace('canopy-tent-', '') : (sel.size || sel.length)}
                walls={countWalls(sel.wallsFull) + countWalls(sel.wallsHalf) + countWalls(sel.walls)}
                label={`${product.name} preview`}
              />
            ) : (
              <ProductArt slug={product.slug} />
            )}
          </div>
          <div className="config-info">
            <span className="eyebrow">{product.badge}</span>
            <h1>{product.name}</h1>
            <p className="lead">{product.description}</p>
            <ul className="feature-list">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="turnaround">🕒 {product.turnaround}</p>
          </div>
        </div>

        {/* Middle: configuration form */}
        <div className="config-form card">
          <h2>Build your order</h2>

          {isConfigured ? (
            (p.optionGroups || []).map((group) => (
              <div className="field opt-group" key={group.id}>
                <label>{group.label}</label>
                {group.help && <small className="opt-help">{group.help}</small>}

                {group.type === 'multi' ? (
                  <div className="option-list">
                    {group.choices.map((choice) => {
                      const count = Number(sel[group.id]?.[choice.id]) || 0;
                      const max = choice.max || 1;
                      return (
                        <div className={`opt-row ${count ? 'opt-row-on' : ''}`} key={choice.id}>
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              checked={count > 0}
                              onChange={() => setMultiCount(group.id, choice.id, count > 0 ? 0 : 1)}
                            />
                            <span>{choice.label}</span>
                          </label>
                          <div className="opt-right">
                            {max > 1 && count > 0 && (
                              <div className="stepper">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${choice.label}`}
                                  onClick={() => setMultiCount(group.id, choice.id, count - 1)}
                                >
                                  −
                                </button>
                                <span>{count}</span>
                                <button
                                  type="button"
                                  aria-label={`Increase ${choice.label}`}
                                  disabled={count >= max}
                                  onClick={() => setMultiCount(group.id, choice.id, count + 1)}
                                >
                                  +
                                </button>
                              </div>
                            )}
                            <span className="opt-price">+{money(choice.price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="choice-grid">
                    {group.choices.map((choice) => {
                      const activeChoice =
                        (sel[group.id] || defaultChoiceId(group)) === choice.id;
                      // Combined cap (e.g. full + half walls <= 3): disable a
                      // choice that would push the group total over the limit.
                      const allowed = allowedForGroup(p.constraints, sel, group.id);
                      const disabled = allowed != null && (Number(choice.id) || 0) > allowed;
                      return (
                        <button
                          type="button"
                          key={choice.id}
                          className={`choice-card ${activeChoice ? 'choice-active' : ''}`}
                          aria-pressed={activeChoice}
                          disabled={disabled}
                          title={disabled ? 'Max 3 walls total (full + half)' : undefined}
                          onClick={() => !disabled && setSelect(group.id, choice.id)}
                        >
                          <span className="choice-label">{choice.label}</span>
                          <span className="choice-meta">
                            {group.pricing === 'base'
                              ? money(choice.price)
                              : group.pricing === 'add'
                                ? (Number(choice.price) ? `+${money(choice.price)}` : 'Included')
                                : group.pricing === 'multiplyTotal'
                                  ? (Number(choice.mult) === 1 || !Number.isFinite(Number(choice.mult))
                                      ? 'Included'
                                      : preMultTotal
                                        ? `+${money(preMultTotal * (Number(choice.mult) - 1))}`
                                        : multiplierHint(choice.mult))
                                  : multiplierHint(choice.mult)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : isArea ? (
            <div className="size-row">
              <div className="field">
                <label>Width (inches)</label>
                <input
                  type="number"
                  min={p.minWidthIn}
                  max={p.maxWidthIn}
                  value={config.width}
                  onChange={(e) => setConfig({ ...config, width: numberOr(e.target.value, config.width) })}
                />
                <small>{p.minWidthIn}"–{p.maxWidthIn}"</small>
              </div>
              <span className="times">×</span>
              <div className="field">
                <label>Height (inches)</label>
                <input
                  type="number"
                  min={p.minHeightIn}
                  max={p.maxHeightIn}
                  value={config.height}
                  onChange={(e) => setConfig({ ...config, height: numberOr(e.target.value, config.height) })}
                />
                <small>{p.minHeightIn}"–{p.maxHeightIn}"</small>
              </div>
            </div>
          ) : (
            <div className="field">
              <label>Size</label>
              <select
                value={config.variantId}
                onChange={(e) => setConfig({ ...config, variantId: e.target.value })}
              >
                {p.variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {!isConfigured && p.materials?.length > 1 && (
            <div className="field">
              <label>{isArea ? 'Material' : 'Option'}</label>
              <select
                value={config.materialId}
                onChange={(e) => setConfig({ ...config, materialId: e.target.value })}
              >
                {p.materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {!isConfigured && p.finishing?.length > 0 && (
            <div className="field">
              <label>Finishing options</label>
              <div className="option-list">
                {p.finishing.map((opt) => (
                  <label className="checkbox" key={opt.id}>
                    <input
                      type="checkbox"
                      checked={config.options.includes(opt.id)}
                      onChange={() => toggleOption(opt.id)}
                    />
                    <span>{opt.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="field qty-field">
            <label>Quantity</label>
            <div className="qty-block">
              <div className="qty-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setConfig({ ...config, quantity: Math.max(1, Number(config.quantity) - 1) })}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={config.quantity}
                  onChange={(e) => setConfig({ ...config, quantity: Math.max(1, numberOr(e.target.value, config.quantity)) })}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setConfig({ ...config, quantity: Number(config.quantity) + 1 })}
                >
                  +
                </button>
              </div>

              {tierRows.length > 1 && (
                <div className="bulk-brackets">
                  <div className="bulk-brackets-head">Bulk discount brackets</div>
                  {tierRows.map((r) => (
                    <div className={`bulk-row ${r.active ? 'bulk-active' : ''}`} key={r.label}>
                      <span>{r.label}</span>
                      <span>{money(r.price)}/unit</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label>Specific instructions (optional)</label>
            <textarea
              className="notes-input"
              placeholder="Anything we should know? Colours to match, deadline, artwork notes…"
              value={config.notes || ''}
              onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Right: live price panel */}
        <aside className="price-panel card">
          <h3>Instant price</h3>
          <div className={`price-big ${pricing ? 'is-updating' : ''}`}>
            {price ? money(price.total) : '—'}
          </div>
          {price && (
            <>
              <p className="price-sub">
                {price.quantity} {price.quantity > 1 ? 'pieces' : 'piece'} ·{' '}
                {money(price.perPieceAfterDiscount)} each
              </p>

              <div className="breakdown">
                {price.breakdown.map((line, i) => (
                  <div className="breakdown-row" key={i}>
                    <span>{line.label}</span>
                    <span>{money(line.amount)}</span>
                  </div>
                ))}
                <div className="breakdown-row subtle">
                  <span>× {price.quantity} qty</span>
                  <span>{money(price.subtotal)}</span>
                </div>
                {price.quantityDiscountPct > 0 && (
                  <div className="breakdown-row discount">
                    <span>Volume discount ({price.quantityDiscountPct}%)</span>
                    <span>−{money(price.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="price-total-row">
                <span>Total</span>
                <span>{money(price.total)}</span>
              </div>

              <div className="ship-note">
                {price.freeShipping
                  ? '✅ Qualifies for free shipping'
                  : `Add ${money(99 - price.total)} for free shipping`}
              </div>
            </>
          )}

          <button className="btn btn-red btn-block" onClick={requestOrder} disabled={!price}>
            Order &amp; upload artwork
          </button>
          <p className="panel-foot">
            We send a free artwork proof for your approval before anything goes to production.
          </p>
        </aside>
      </div>

      {product.faqs?.length > 0 && (
        <section className="faq-section">
          <h2>{product.name} — Frequently Asked Questions</h2>
          <div className="faq-list">
            {product.faqs.map((f, i) => (
              <details className="faq-item" key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function defaultChoiceId(group) {
  const def = group.choices?.find((c) => c.default) || group.choices?.[0];
  return def?.id;
}

// Render a multiplier as a human hint rather than a raw factor.
function multiplierHint(mult) {
  const m = Number(mult);
  if (!Number.isFinite(m) || m === 1) return 'Included';
  const pct = Math.round((m - 1) * 100);
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

// Max count this group may take given a combined-cap constraint and the other
// groups' current selections. Returns null if the group isn't constrained.
function allowedForGroup(constraints, sel, groupId) {
  if (!Array.isArray(constraints)) return null;
  const con = constraints.find((c) => c.groups.includes(groupId));
  if (!con) return null;
  const others = con.groups
    .filter((g) => g !== groupId)
    .reduce((n, g) => n + (Number(sel[g]) || 0), 0);
  return Math.max(0, con.max - others);
}

function hasCanopyShape(pricing) {
  const ids = (pricing.optionGroups || []).map((g) => g.id);
  return ids.includes('wallsFull') || ids.includes('walls') || (ids.includes('print') && (ids.includes('size') || ids.includes('length')));
}

// Walls may be a select ('none'/'1'/'2'/'3') or a multi ({id: count}).
function countWalls(wallSelection) {
  if (wallSelection == null) return 0;
  if (typeof wallSelection === 'string') return Number(wallSelection) || 0;
  if (typeof wallSelection === 'object') return Object.values(wallSelection).reduce((n, v) => n + (Number(v) || 0), 0);
  return Number(wallSelection) || 0;
}

function buildDefaultConfig(product) {
  const p = product.pricing;

  if (p.model === 'configured') {
    const selections = {};
    for (const group of p.optionGroups || []) {
      if (group.type === 'multi') {
        const picked = {};
        for (const c of group.choices) if (c.default) picked[c.id] = 1;
        selections[group.id] = picked;
      } else {
        selections[group.id] = defaultChoiceId(group);
      }
    }
    return { selections, quantity: 1 };
  }

  const defaultOptions = (p.finishing || []).filter((o) => o.default).map((o) => o.id);
  if (p.model === 'area') {
    return {
      width: p.defaultWidthIn,
      height: p.defaultHeightIn,
      materialId: p.materials?.[0]?.id,
      quantity: 1,
      options: defaultOptions
    };
  }
  return {
    variantId: p.variants?.[0]?.id,
    materialId: p.materials?.[0]?.id,
    quantity: 1,
    options: defaultOptions
  };
}

function describeConfig(product, config) {
  const p = product.pricing;
  const parts = [];

  if (p.model === 'configured') {
    for (const group of p.optionGroups || []) {
      const value = config.selections?.[group.id];
      if (group.type === 'multi') {
        const picked = Object.entries(value || {})
          .map(([id, count]) => {
            const choice = group.choices.find((c) => c.id === id);
            if (!choice) return null;
            return count > 1 ? `${choice.label} ×${count}` : choice.label;
          })
          .filter(Boolean);
        if (picked.length) parts.push(`${group.label}: ${picked.join(', ')}`);
      } else {
        const choice = group.choices.find((c) => c.id === value) || group.choices.find((c) => c.default);
        if (choice) parts.push(`${group.label}: ${choice.label}`);
      }
    }
    parts.push(`Qty ${config.quantity}`);
    return parts.join(' • ');
  }

  if (p.model === 'area') {
    parts.push(`${config.width}" × ${config.height}"`);
  } else {
    const v = p.variants.find((x) => x.id === config.variantId);
    if (v) parts.push(v.name);
  }
  const m = p.materials?.find((x) => x.id === config.materialId);
  if (m) parts.push(m.name);
  const opts = (p.finishing || []).filter((o) => config.options.includes(o.id)).map((o) => o.name);
  if (opts.length) parts.push(opts.join(', '));
  parts.push(`Qty ${config.quantity}`);
  return parts.join(' • ');
}

function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

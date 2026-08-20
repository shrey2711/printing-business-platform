import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getPrice, getProducts } from '../services/api';
import ProductArt from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import ProductTabs from '../components/ProductTabs';
import TentGallery from '../components/TentGallery';
import TableCoverPhoto from '../components/TableCoverPhoto';
import DisplayPhoto from '../components/DisplayPhoto';
import ProductGallery from '../components/ProductGallery';
import AccessoriesSection, { BANNER_ACCESSORIES } from '../components/AccessoriesSection';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { getCategoryForProduct } from '../data/categoryPages';
import ColorwayStrip from '../components/ColorwayStrip';
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
  const [sizeTouched, setSizeTouched] = useState(false); // show size error on blur/submit
  const debounceRef = useRef(null);

  // Commercial-intent title for canopy sizes (matches the prerendered title).
  const canopySize = product?.slug?.match(/canopy-tent-(\d+x\d+)/)?.[1];
  useDocumentMeta(
    product
      ? product.seoTitle
        ? product.seoTitle
        : canopySize
          ? `${canopySize} Custom Canopy Tent With Logo`
          : `${product.name} — Custom Printing & Instant Pricing`
      : 'Product',
    product?.seoDescription || product?.tagline
  );

  // Related products (by slug) for the detail page.
  const [related, setRelated] = useState([]);
  useEffect(() => {
    const slugs = product?.related;
    if (!slugs?.length) { setRelated([]); return; }
    let alive = true;
    getProducts()
      .then((all) => {
        if (!alive) return;
        const bySlug = new Map(all.map((p) => [p.slug, p]));
        setRelated(slugs.map((s) => bySlug.get(s)).filter(Boolean));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [product]);

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
        // A quote-only / unpriced result (ok:false) is treated as "no price".
        setPrice(result && result.ok !== false ? result : null);
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
  // quoteOnly = a CONFIGURED product (size/plug/mockup selectors) sold by custom
  // quote — the selectors render but no price is shown; the CTA is "Request a
  // Custom Quote" and the selection is sent to the quote form.
  const isQuoteOnly = !!product?.pricing?.quoteOnly;
  const isQuoteModel = model === 'quote' || model === 'competitive' || isQuoteOnly;

  // Made-to-size validation (banners): sorted, orientation-independent caps,
  // mirrored from the server. The numbers come from the same product config so
  // the message can't drift from the rule; the server re-validates and rejects
  // independently — this only gives instant feedback and blocks the CTA.
  const sizeCaps =
    isArea && product?.pricing?.sizeSmallCapIn != null
      ? { small: product.pricing.sizeSmallCapIn, large: product.pricing.sizeLargeCapIn }
      : null;
  const sizeError = (() => {
    if (!sizeCaps || !config) return null;
    const w = Number(config.width);
    const h = Number(config.height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
      return 'Enter a width and height greater than 0.';
    const small = Math.min(w, h);
    const large = Math.max(w, h);
    if (small > sizeCaps.small || large > sizeCaps.large)
      return `Size not available. This banner can be up to ${sizeCaps.small}" on one side and ${sizeCaps.large}" on the other. Please adjust your dimensions or contact us for oversized orders.`;
    return null;
  })();

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

  const requestOrder = () => {
    // Never let an out-of-range made-to-size order through (server rejects it too).
    if (sizeError) {
      setSizeTouched(true);
      return;
    }
    navigate('/order', { state: orderState() });
  };

  // Quote-only / unpriced products route to the existing quote + artwork flow.
  const requestQuote = () =>
    navigate('/quote', {
      state: {
        product: product.name,
        // Quote-only configured products (SEG kits) carry the full selection —
        // size, plug, mockup, quantity — into the quote form.
        specs: isConfigured ? describeConfig(product, config) : (product.sizeLabel || product.size || ''),
        quantity: config?.quantity || 1
      }
    });

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
  // Up-link to the product's category (Home > Category > Product), not the flat list.
  const cat = getCategoryForProduct(product.category);

  // Volume pricing brackets from quantityTiers, e.g. "1-2 units $835/unit",
  // "3+ units $799/unit", with the row matching the current quantity marked.
  const qtyNow = Number(config?.quantity) || 1;
  // Canopy tiers carry per-kit columns (prices:{full,canopy}) rather than a flat
  // `price`, so read the column for the selected kit (falling back to the first).
  const kitGroupId = p?.kitGroupId;
  const kitId = kitGroupId ? sel[kitGroupId] : null;
  const tierUnitPrice = (t) => {
    if (t && t.prices) {
      const id = kitId && t.prices[kitId] != null ? kitId : Object.keys(t.prices)[0];
      return Number(t.prices[id]);
    }
    return Number(t?.price) || 0;
  };
  const tierRows = [...(p?.quantityTiers || [])]
    .sort((a, b) => a.min - b.min)
    .map((t, i, arr) => {
      const next = arr[i + 1];
      return {
        label: next ? `${t.min}-${next.min - 1} units` : `${t.min}+ units`,
        price: tierUnitPrice(t),
        active: qtyNow >= t.min && (!next || qtyNow < next.min)
      };
    });

  // Server-computed subtotal before rush/whole-order multipliers, so the rush
  // card can show its exact $ value without dividing a lagging total (no flicker).
  const preMultTotal = price?.preMultipliedSubtotal || 0;

  // Meta on banner pill choices: "Included", or the DOLLAR rush surcharge for a
  // production-speed multiplier choice (never a percentage).
  const bannerFinishMeta = (choice) => {
    const mult = Number(choice.mult);
    if (!mult || mult === 1) return 'Included';
    return preMultTotal ? `+${money(preMultTotal * (mult - 1))}` : '';
  };

  // For priceMatrix products, an option dimension (size/package/sides/production)
  // has no standalone price — its cost is baked into the combined lookup. Show
  // each choice's price DELTA vs that group's default, given the current other
  // selections (e.g. "2–3 days rush → +$50"), so buyers see what an option adds.
  const matrixMeta = (group, choice) => {
    const pm = p?.priceMatrix;
    const groups = p?.matrixGroups;
    if (!pm || !Array.isArray(groups) || !groups.includes(group.id)) return 'Included';
    const idOf = (gid, override) => {
      if (gid === group.id) return override;
      const v = sel[gid];
      if (v != null) return v;
      const g = (p.optionGroups || []).find((x) => x.id === gid);
      const d = (g?.choices || []).find((c) => c.default) || (g?.choices || [])[0];
      return d?.id;
    };
    const keyFor = (override) => groups.map((gid) => idOf(gid, override)).join('|');
    const def = (group.choices.find((c) => c.default) || group.choices[0])?.id;
    const a = Number(pm[keyFor(choice.id)]);
    const b = Number(pm[keyFor(def)]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return '';
    const d = a - b;
    if (d > 0) return `+${money(d)}`;
    if (d < 0) return `−${money(-d)}`;
    return 'Included';
  };

  // Quantity field — reused in the configured grid (next to Artwork) and below
  // the size/material controls for the other pricing models.
  const qtyField = (
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
  );

  return (
    <main className="page">
      <Link className="back-link" to={cat ? `/${cat.slug}` : '/products'}>← All {cat ? cat.nav : 'products'}</Link>

      <div className="config-layout">
        {/* Left: product visual + info */}
        <div className="config-visual">
          <div className="config-hero-thumb">
            {product.gallery?.length ? (
              <ProductGallery images={product.gallery} label={product.name} />
            ) : isConfigured && hasCanopyShape(p) ? (
              <TentGallery
                size={product.slug.startsWith('canopy-tent-') ? product.slug.replace('canopy-tent-', '') : (sel.size || sel.length)}
                fullWalls={countWalls(sel.wallsFull)}
                halfWalls={countWalls(sel.wallsHalf) + countWalls(sel.walls)}
                walls={countWalls(sel.wallsFull) + countWalls(sel.wallsHalf) + countWalls(sel.walls)}
                sandbags={sel.sandbags === 'set4'}
                label={`${product.name} preview`}
              />
            ) : product.category === 'table-covers' ? (
              <TableCoverPhoto style={product.slug.includes('stretch') ? 'stretch' : 'pleated'} label={product.name} />
            ) : (
              <DisplayPhoto slug={product.slug} label={product.name} />
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
            <ColorwayStrip slug={product.slug} />
          </div>
        </div>

        {/* Middle: configuration form */}
        <div className="config-form card">
          <h2>Build your order</h2>

          {isConfigured ? (
            <div className="opt-groups">
            {(p.optionGroups || []).map((group) => (
              <div className={`field opt-group ${groupSpanClass(group)}`} key={group.id}>
                <label className="opt-label">
                  <span>{group.label}</span>
                  {group.help && (
                    <span className="opt-info" title={group.help} aria-label={group.help} role="img" tabIndex={0}>&#9432;</span>
                  )}
                </label>

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
                  <div className={`choice-grid ${group.choices.length >= 4 ? 'cg-grid' : ''}`}>
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
                          <span className="choice-label">{shortChoiceLabel(group.id, choice)}</span>
                          {!isQuoteOnly && (
                          <span className="choice-meta">
                            {group.pricing === 'baseKit'
                              ? ''
                              : group.pricing === 'base'
                              ? money(choice.price)
                              : group.pricing === 'add' || group.pricing === 'addFlat'
                                ? (Number(choice.price) ? `+${money(choice.price)}` : 'Included')
                                : group.pricing === 'multiplyTotal'
                                  ? (Number(choice.mult) === 1 || !Number.isFinite(Number(choice.mult))
                                      ? 'Included'
                                      : preMultTotal
                                        ? `+${money(preMultTotal * (Number(choice.mult) - 1))}`
                                        : multiplierHint(choice.mult))
                                  : group.pricing === 'matrix'
                                    ? matrixMeta(group, choice)
                                    : multiplierHint(choice.mult)}
                          </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {qtyField}
            </div>
          ) : isArea ? (
            <div className="field size-field">
              <div className={`size-row ${sizeTouched && sizeError ? 'has-error' : ''}`}>
                <div className="field">
                  <label>Width (inches)</label>
                  <input
                    type="number"
                    min={sizeCaps ? 1 : p.minWidthIn}
                    max={sizeCaps ? sizeCaps.large : p.maxWidthIn}
                    step="any"
                    value={config.width}
                    aria-invalid={!!(sizeTouched && sizeError)}
                    onChange={(e) => setConfig({ ...config, width: numberOr(e.target.value, config.width) })}
                    onBlur={() => setSizeTouched(true)}
                  />
                  <small>{sizeCaps ? `up to ${sizeCaps.large}"` : `${p.minWidthIn}"–${p.maxWidthIn}"`}</small>
                </div>
                <span className="times">×</span>
                <div className="field">
                  <label>Height (inches)</label>
                  <input
                    type="number"
                    min={sizeCaps ? 1 : p.minHeightIn}
                    max={sizeCaps ? sizeCaps.large : p.maxHeightIn}
                    step="any"
                    value={config.height}
                    aria-invalid={!!(sizeTouched && sizeError)}
                    onChange={(e) => setConfig({ ...config, height: numberOr(e.target.value, config.height) })}
                    onBlur={() => setSizeTouched(true)}
                  />
                  <small>{sizeCaps ? `up to ${sizeCaps.large}"` : `${p.minHeightIn}"–${p.maxHeightIn}"`}</small>
                </div>
              </div>
              {sizeCaps && (
                <p className="size-caps-note">
                  Any size up to {sizeCaps.small}" on one side and {sizeCaps.large}" on the other. Orientation doesn't matter.
                </p>
              )}
              {sizeTouched && sizeError && (
                <p className="size-error" role="alert">{sizeError}</p>
              )}
            </div>
          ) : p.variants?.length ? (
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
          ) : (
            // Quote-only product with no size variants — show the fixed size.
            <div className="field">
              <label>Size</label>
              <p className="muted">{product.sizeLabel || product.size || 'One size'}</p>
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

          {/* Banner finishing: sides + production render as segmented pills (like
              flags); pole pocket / hem / grommets stay dropdowns. */}
          {!isConfigured && Array.isArray(p.finishingGroups) && (
            <>
              {p.finishingGroups.some((g) => g.ui === 'pills') && (
                <div className="opt-groups">
                  {p.finishingGroups.filter((g) => g.ui === 'pills').map((g) => (
                    <div className="field opt-group" key={g.id}>
                      <label className="opt-label"><span>{g.label}</span></label>
                      <div className="choice-grid">
                        {g.choices.map((c) => {
                          const active = (config.finishing?.[g.id] ?? g.choices[0]?.id) === c.id;
                          return (
                            <button
                              type="button"
                              key={c.id}
                              className={`choice-card ${active ? 'choice-active' : ''}`}
                              aria-pressed={active}
                              onClick={() => setConfig({ ...config, finishing: { ...config.finishing, [g.id]: c.id } })}
                            >
                              <span className="choice-label">{c.name}</span>
                              <span className="choice-meta">{bannerFinishMeta(c)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {p.finishingGroups.filter((g) => g.ui !== 'pills').map((g) => (
                <div className="field" key={g.id}>
                  <label>{g.label}</label>
                  <select
                    value={config.finishing?.[g.id] ?? g.choices[0]?.id}
                    onChange={(e) => setConfig({ ...config, finishing: { ...config.finishing, [g.id]: e.target.value } })}
                  >
                    {g.choices.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </>
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

          {!isConfigured && qtyField}

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

        {/* Right: live price panel (or quote CTA when unpriced) */}
        <aside className="price-panel card">
          {isQuoteModel && !price ? (
            <>
              <span className="eyebrow">{isQuoteOnly ? 'Custom quote' : 'Pricing'}</span>
              <div className="price-big price-quote">Custom Quote</div>
              <p className="price-sub">
                {isQuoteOnly
                  ? "Pricing is customised to your kit, size, quantity and project. Send your configuration and our team will prepare pricing and details — production and delivery timing are confirmed with your quote."
                  : "This product is quoted per order. Tell us your size, quantity and artwork and we'll send pricing and a free proof."}
              </p>
              <button className="btn btn-red btn-block" onClick={requestQuote}>
                {isQuoteOnly ? 'Request a Custom Quote' : 'Request a Quote'}
              </button>
              <p className="panel-foot">
                Upload your artwork on the quote form, or send it later — no finished artwork needed to get pricing.
              </p>
            </>
          ) : (
          <>
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
                {(price.flatAddons || []).map((a, i) => (
                  <div className="breakdown-row" key={`flat-${i}`}>
                    <span>{a.label} <em className="flat-tag">one-time</em></span>
                    <span>{money(a.amount)}</span>
                  </div>
                ))}
              </div>

              {price.minChargeApplied && (
                <p className="price-note">
                  Minimum order charge applied: {money(price.minChargeUsd)} each
                </p>
              )}

              <div className="price-total-row">
                <span>Total</span>
                <span>{money(price.total)}</span>
              </div>

              <div className="ship-note">
                Ships across the US &amp; Canada after proof approval — see the{' '}
                <Link to="/shipping">Shipping page</Link> for details.
              </div>
            </>
          )}

          {sizeError && (
            <p className="price-note is-error" role="alert">{sizeError}</p>
          )}
          <button className="btn btn-red btn-block" onClick={requestOrder} disabled={!price || !!sizeError}>
            Order &amp; upload artwork
          </button>
          <p className="panel-foot">
            We send a free artwork proof for your approval before anything goes to production.
          </p>
          </>
          )}
        </aside>
      </div>

      <ProductTabs product={product} />

      {(product.category === 'banner-stands' || product.category === 'backdrops') && (
        <AccessoriesSection
          items={BANNER_ACCESSORIES}
          title="Banner Stand Accessories"
          subtitle="Lighting, replacement graphics and carry bags to complete your stand."
        />
      )}

      {related.length > 0 && (
        <section className="related-section">
          <div className="section-head">
            <h2>Related products</h2>
          </div>
          <div className="pcard-grid">
            {related.map((r) => (
              <ProductCard key={r.slug} product={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// Compact, display-only labels for the pill selectors. The full `choice.label`
// is still used for order specs (describeConfig) and the prerendered HTML — this
// only shortens what the customer sees in the configurator pills.
const SHORT_LABELS = {
  days: { '6-8': '6–8 days', '2-3': '2–3 days', '6to8': '6–8 days', rush: '2–3 days rush' },
  design: { self: 'Upload my own', service: 'We design it' },
  sandbags: { none: 'No sandbags', set4: 'Sandbag set (4)' }
};
function shortChoiceLabel(groupId, choice) {
  return (SHORT_LABELS[groupId] && SHORT_LABELS[groupId][choice.id]) || choice.label;
}

// Two-column configurator layout: the product-type (kit) and multi-select groups
// span the full row; everything else flows two-per-row to cut vertical height.
function groupSpanClass(group) {
  if (group.pricing === 'baseKit') return 'og-2 og-kit';
  if (group.type === 'multi' || group.fullRow) return 'og-2';
  return 'og-1';
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
      options: defaultOptions,
      // Default each finishing dropdown (sides/pole/hem/grommets) to its first choice.
      finishing: Object.fromEntries((p.finishingGroups || []).map((g) => [g.id, g.choices[0]?.id]))
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
  // Banner finishing dropdowns (sides/pole/hem/grommets) so the order records them.
  if (Array.isArray(p.finishingGroups) && config.finishing) {
    for (const g of p.finishingGroups) {
      const c = g.choices.find((x) => x.id === config.finishing[g.id]) || g.choices[0];
      if (c) parts.push(`${g.label}: ${c.name}`);
    }
  }
  const opts = (p.finishing || []).filter((o) => config.options.includes(o.id)).map((o) => o.name);
  if (opts.length) parts.push(opts.join(', '));
  parts.push(`Qty ${config.quantity}`);
  return parts.join(' • ');
}

function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

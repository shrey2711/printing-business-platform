import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getPrice } from '../services/api';
import ProductArt from '../components/ProductArt';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function ProductConfigurator() {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  const isArea = product?.pricing?.model === 'area';

  const toggleOption = (id) => {
    setConfig((prev) => {
      const has = prev.options.includes(id);
      return { ...prev, options: has ? prev.options.filter((o) => o !== id) : [...prev.options, id] };
    });
  };

  const orderState = () => ({
    product: product.name,
    quantity: config.quantity,
    specs: describeConfig(product, config, price),
    estimatedPrice: price ? `$${price.total.toFixed(2)}` : '',
    // Raw pricing config so the server can re-price authoritatively at checkout.
    config: { slug, ...config }
  });

  const requestOrder = () => navigate('/order', { state: orderState() });
  const designIt = () =>
    navigate(`/design?product=${encodeURIComponent(product.name)}`, { state: orderState() });

  if (loading) return <main className="page"><p className="muted">Loading…</p></main>;
  if (notFound || !product)
    return (
      <main className="page">
        <p className="muted">We couldn't find that product.</p>
        <Link className="btn btn-secondary" to="/products">← Back to products</Link>
      </main>
    );

  const p = product.pricing;

  return (
    <main className="page">
      <Link className="back-link" to="/products">← All products</Link>

      <div className="config-layout">
        {/* Left: product visual + info */}
        <div className="config-visual">
          <div className="config-hero-thumb">
            <ProductArt slug={product.slug} />
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

          {isArea ? (
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

          {p.materials?.length > 1 && (
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

          {p.finishing?.length > 0 && (
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

          <div className="field">
            <label>Quantity</label>
            <div className="qty-row">
              {[1, 5, 10, 25, 50, 100].map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`qty-chip ${Number(config.quantity) === q ? 'qty-active' : ''}`}
                  onClick={() => setConfig({ ...config, quantity: q })}
                >
                  {q}
                </button>
              ))}
              <input
                type="number"
                min="1"
                className="qty-input"
                value={config.quantity}
                onChange={(e) => setConfig({ ...config, quantity: numberOr(e.target.value, config.quantity) })}
              />
            </div>
          </div>
        </div>

        {/* Right: live price panel */}
        <aside className="price-panel card">
          <h3>Instant price</h3>
          <div className={`price-big ${pricing ? 'is-updating' : ''}`}>
            {price ? `$${price.total.toFixed(2)}` : '—'}
          </div>
          {price && (
            <>
              <p className="price-sub">
                {price.quantity} {price.quantity > 1 ? 'pieces' : 'piece'} · $
                {price.perPieceAfterDiscount.toFixed(2)} each
              </p>

              <div className="breakdown">
                {price.breakdown.map((line, i) => (
                  <div className="breakdown-row" key={i}>
                    <span>{line.label}</span>
                    <span>${line.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="breakdown-row subtle">
                  <span>× {price.quantity} qty</span>
                  <span>${price.subtotal.toFixed(2)}</span>
                </div>
                {price.quantityDiscountPct > 0 && (
                  <div className="breakdown-row discount">
                    <span>Volume discount ({price.quantityDiscountPct}%)</span>
                    <span>−${price.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="price-total-row">
                <span>Total</span>
                <span>${price.total.toFixed(2)}</span>
              </div>

              <div className="ship-note">
                {price.freeShipping ? '✅ Qualifies for free shipping' : `Add $${(99 - price.total).toFixed(2)} for free shipping`}
              </div>
            </>
          )}

          <button className="btn btn-red btn-block" onClick={requestOrder} disabled={!price}>
            Order &amp; upload artwork
          </button>
          <button className="btn btn-outline btn-block" onClick={designIt} disabled={!price} style={{ marginTop: '0.5rem' }}>
            🎨 Design it online
          </button>
          <p className="panel-foot">Upload a print-ready file or draw your own on the next step.</p>
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

function buildDefaultConfig(product) {
  const p = product.pricing;
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

function describeConfig(product, config, price) {
  const p = product.pricing;
  const parts = [];
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

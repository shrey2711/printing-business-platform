import { useState } from 'react';
import { Link } from 'react-router-dom';

// Tabbed detail block under the configurator: Description, Product
// Specifications, Template (downloadable PDF dielines) and FAQs.
//
// `catalog` is an optional Map of slug -> product, used only to turn an FAQ's
// `linkSlugs` into links. Answers themselves stay plain text (they are carried
// verbatim into FAQPage schema, which does not take markup), so the links are
// built from slugs rather than embedded in the copy. Mirrors faqLinksHtml in
// scripts/prerender.mjs so the crawled HTML and the app agree.
export default function ProductTabs({ product, catalog }) {
  const sizeKey = product.slug.startsWith('canopy-tent-')
    ? product.slug.replace('canopy-tent-', '')
    : null;
  const faqs = product.faqs || [];
  const cmp = product.comparison && Array.isArray(product.comparison.distinctSpecs) ? product.comparison : null;

  const tabs = [
    { id: 'desc', label: 'Description' },
    { id: 'specs', label: 'Product Specifications' },
    { id: 'template', label: 'Template' },
    ...(faqs.length ? [{ id: 'faq', label: 'FAQs' }] : [])
  ];
  const [tab, setTab] = useState('desc');

  // Templates the customer can download to set up artwork. Files live in
  // public/templates/. Until a file is uploaded the link 404s, so each is
  // gated by product data (see templatesFor).
  const templates = templatesFor(sizeKey);

  return (
    <section className="ptabs">
      <nav className="ptabs-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`ptab ${tab === t.id ? 'ptab-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="ptabs-body">
        {tab === 'desc' && (
          <div className="ptab-panel">
            <h2>{product.name} — Overview</h2>
            <p>{product.description}</p>
            {/* Optional product-specific sections (owner-supplied), mirrored in scripts/prerender.mjs. */}
            {(Array.isArray(product.productSections) ? product.productSections : [])
              .filter((x) => x && x.h2 && x.p)
              .map((x) => (
                <div key={x.h2}><h3>{x.h2}</h3><p>{x.p}</p></div>
              ))}
            <h3>Key features</h3>
            <ul className="ptab-list">
              {(product.features || []).map((f) => <li key={f}>{f}</li>)}
            </ul>
            {Array.isArray(product.whatsIncluded) && product.whatsIncluded.length > 0 && (
              <>
                <h3>What&apos;s in the box</h3>
                <ul className="ptab-list">
                  {product.whatsIncluded.map((w) => <li key={w}>{w}</li>)}
                </ul>
              </>
            )}
            {Array.isArray(product.applications) && product.applications.length > 0 && (
              <>
                <h3>Applications &amp; best uses</h3>
                <ul className="ptab-list">
                  {product.applications.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </>
            )}
          </div>
        )}

        {tab === 'specs' && (
          <div className="ptab-panel">
            {cmp ? (
              <>
                {/* Comparison group (backend/lib/productCompare.js): this product's
                    own key specs first, then the rows shared with its siblings. */}
                <h2>{product.name} key specifications</h2>
                <SpecTable rows={cmp.distinctSpecs} />
                {cmp.sharedSpecs.length > 0 && (
                  <>
                    <h2>Specifications shared with <SiblingLinks siblings={cmp.siblings} /></h2>
                    <SpecTable rows={cmp.sharedSpecs} />
                  </>
                )}
              </>
            ) : (
              <>
                <h2>Product specifications</h2>
                <SpecTable rows={specsFor(product, sizeKey)} />
              </>
            )}
          </div>
        )}

        {tab === 'template' && (
          <div className="ptab-panel">
            <h2>Artwork templates</h2>
            <p>
              Download the print-ready template for your size, design inside the dielines, then
              upload it when you order. Files are full-scale PDFs at the correct bleed.
            </p>
            {templates.length ? (
              <ul className="template-list">
                {templates.map((t) => (
                  <li key={t.file}>
                    <a href={`/templates/${t.file}`} download>
                      ⬇ {t.label} <span className="muted">(PDF)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Templates for this product are coming soon.</p>
            )}
          </div>
        )}

        {tab === 'faq' && (
          <div className="ptab-panel">
            <h2>Frequently asked questions</h2>
            <div className="faq-list">
              {faqs.map((f, i) => {
                const links = (f.linkSlugs || [])
                  .map((s) => catalog?.get(s))
                  .filter(Boolean);
                return (
                  <details className="faq-item" key={i} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                    {links.length > 0 && (
                      <p className="faq-links">
                        {links.map((p, n) => (
                          <span key={p.slug}>
                            {n > 0 ? ' · ' : ''}
                            <Link to={`/products/${p.slug}`}>{p.name}</Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function specsFor(product, sizeKey) {
  // A product's own spec table always wins (table covers, trade-show displays…).
  if (Array.isArray(product.specs) && product.specs.length) return product.specs;
  // The canopy default spec sheet applies ONLY to real canopy products (which
  // have a size key). Any other product without its own specs gets none, rather
  // than accidentally inheriting canopy hardware (frame / legs / walls).
  if (!sizeKey) return [];
  return [
    ['Size', sizeKey.replace('x', "' × ") + "'"],
    ['Frame', 'Heavy-duty aluminum hex, telescopic legs'],
    ['Fabric', '600D polyester, dye-sublimated full-bleed'],
    ['Print', 'Full color, edge to edge — does not crack, peel or fade'],
    ['Walls', 'Full and half printed walls (up to 3 combined)'],
    ['Included', 'Printed canopy + frame + carry bag'],
    ['Turnaround', product.turnaround || '6-8 business days']
  ];
}

// Official artwork templates uploaded to public/templates/, per canopy size.
// Only sizes with real files appear; others show "coming soon".
const TEMPLATE_SETS = {
  '10x10': [
    { file: 'canopy-10x10-canopy.pdf', label: '10×10 canopy top template' },
    { file: 'canopy-10x10-fullwall.pdf', label: '10×10 full wall template' },
    { file: 'canopy-10x10-halfwall.pdf', label: '10×10 half wall template' }
  ]
};

function templatesFor(sizeKey) {
  return (sizeKey && TEMPLATE_SETS[sizeKey]) || [];
}

function SpecTable({ rows }) {
  return (
    <table className="spec-table">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}><th>{k}</th><td>{v}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

// "A", "A and B", "A, B and C" as product links.
function SiblingLinks({ siblings }) {
  return siblings.map((s, i) => (
    <span key={s.slug}>
      {i > 0 && (i === siblings.length - 1 ? ' and ' : ', ')}
      <Link to={`/products/${s.slug}`}>{s.name}</Link>
    </span>
  ));
}

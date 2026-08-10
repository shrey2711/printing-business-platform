import { useState } from 'react';

// Tabbed detail block under the configurator: Description, Product
// Specifications, Template (downloadable PDF dielines) and FAQs.
export default function ProductTabs({ product }) {
  const sizeKey = product.slug.startsWith('canopy-tent-')
    ? product.slug.replace('canopy-tent-', '')
    : null;
  const faqs = product.faqs || [];

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
            <h3>Key features</h3>
            <ul className="ptab-list">
              {(product.features || []).map((f) => <li key={f}>{f}</li>)}
            </ul>
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
            <h2>Product specifications</h2>
            <table className="spec-table">
              <tbody>
                {specsFor(product, sizeKey).map(([k, v]) => (
                  <tr key={k}><th>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
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
              {faqs.map((f, i) => (
                <details className="faq-item" key={i} open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function specsFor(product, sizeKey) {
  // Products may carry their own spec table (e.g. trade-show displays).
  if (Array.isArray(product.specs) && product.specs.length) return product.specs;
  const rows = [];
  if (sizeKey) rows.push(['Size', sizeKey.replace('x', "' × ") + "'"]);
  rows.push(['Frame', 'Heavy-duty aluminium hex, telescopic legs']);
  rows.push(['Fabric', '600D polyester, dye-sublimated full-bleed']);
  rows.push(['Print', 'Full colour, edge to edge — does not crack, peel or fade']);
  rows.push(['Walls', 'Full and half printed walls (up to 3 combined)']);
  rows.push(['Included', 'Printed canopy + frame + carry bag']);
  rows.push(['Turnaround', product.turnaround || '6-8 business days']);
  return rows;
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

import { useEffect, useState } from 'react';
import { listSeo, saveSeo, listRedirects, saveRedirect, deleteRedirect } from '../../services/adminCms';

// The routes an editor can override. Keep in step with the app's real routes.
const ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'All products' },
  { path: '/products/canopy-tents', label: 'Custom canopy tent' },
  { path: '/products/canopy-packages', label: 'Packages' },
  { path: '/products/canopy-sidewalls', label: 'Sidewalls' },
  { path: '/products/canopy-replacement-tops', label: 'Replacement tops' },
  { path: '/products/canopy-accessories', label: 'Accessories' },
  { path: '/sizes/10x10', label: 'Size — 10×10' },
  { path: '/sizes/10x20', label: 'Size — 10×20' },
  { path: '/blog', label: 'Blog index' },
  { path: '/locations', label: 'Locations hub' },
  { path: '/contact', label: 'Contact' },
  { path: '/quote', label: 'Quote' }
];

const BLANK = { title: '', description: '', canonical: '', robots: '', sitemap_priority: '' };

export default function SeoTab({ onError, onFlash }) {
  const [sub, setSub] = useState('meta'); // 'meta' | 'redirects'
  const [seo, setSeo] = useState({});
  const [sel, setSel] = useState(ROUTES[0].path);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listSeo()
      .then((rows) => {
        const map = {};
        for (const r of rows) map[r.path] = r;
        setSeo(map);
      })
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the selected route's override into the form.
  useEffect(() => {
    const o = seo[sel];
    setForm(
      o
        ? {
            title: o.title || '',
            description: o.description || '',
            canonical: o.canonical || '',
            robots: o.robots || '',
            sitemap_priority: o.sitemap_priority ?? ''
          }
        : { ...BLANK }
    );
  }, [sel, seo]);

  const save = async () => {
    setSaving(true);
    try {
      const fields = { ...form };
      if (fields.sitemap_priority === '') delete fields.sitemap_priority;
      else fields.sitemap_priority = Number(fields.sitemap_priority);
      const { rebuild } = await saveSeo(sel, fields);
      setSeo((prev) => ({ ...prev, [sel]: { path: sel, ...fields } }));
      onFlash(rebuild?.triggered ? '✓ Saved — site rebuilding (~2 min)' : '✓ Saved');
    } catch (e) {
      onError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-subtabs">
        <button className={`admin-subtab ${sub === 'meta' ? 'on' : ''}`} onClick={() => setSub('meta')}>Page meta</button>
        <button className={`admin-subtab ${sub === 'redirects' ? 'on' : ''}`} onClick={() => setSub('redirects')}>Redirects</button>
      </div>

      {sub === 'meta' ? (
        loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="seo-editor">
            <div className="field">
              <label>Route</label>
              <select value={sel} onChange={(e) => setSel(e.target.value)}>
                {ROUTES.map((r) => (
                  <option key={r.path} value={r.path}>
                    {r.label} ({r.path}){seo[r.path] ? ' •' : ''}
                  </option>
                ))}
              </select>
              <small>Routes with a customised SEO entry are marked •. Changes rebuild the site.</small>
            </div>
            <div className="field">
              <label>Title tag</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Leave blank to keep the page default" />
            </div>
            <div className="field">
              <label>Meta description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Leave blank to keep the page default" />
            </div>
            <div className="field">
              <label>Canonical URL</label>
              <input value={form.canonical} onChange={(e) => setForm({ ...form, canonical: e.target.value })} placeholder="Defaults to the page's own URL" />
            </div>
            <div className="two-col">
              <div className="field">
                <label>Robots</label>
                <select value={form.robots} onChange={(e) => setForm({ ...form, robots: e.target.value })}>
                  <option value="">Default (index, follow)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
                <small>noindex removes the page from the sitemap.</small>
              </div>
              <div className="field">
                <label>Sitemap priority</label>
                <input type="number" min="0" max="1" step="0.1" value={form.sitemap_priority} onChange={(e) => setForm({ ...form, sitemap_priority: e.target.value })} placeholder="0.0–1.0" />
              </div>
            </div>
            <button className="btn btn-red" disabled={saving} onClick={save}>Save &amp; rebuild</button>
          </div>
        )
      ) : (
        <RedirectsManager onError={onError} onFlash={onFlash} />
      )}
    </>
  );
}

function RedirectsManager({ onError, onFlash }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source: '', destination: '', code: 301 });
  const [busy, setBusy] = useState(false);

  const load = () =>
    listRedirects()
      .then(setRows)
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { redirect, rebuild } = await saveRedirect(form);
      setRows((prev) => [redirect, ...prev.filter((r) => r.source !== redirect.source)]);
      setForm({ source: '', destination: '', code: 301 });
      onFlash(rebuild?.triggered ? '✓ Added — site rebuilding (~2 min)' : '✓ Added');
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete redirect ${r.source} → ${r.destination}?`)) return;
    try {
      await deleteRedirect(r.id);
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      onFlash('✓ Deleted — site rebuilding');
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <>
      <form className="cms-inline-form card" onSubmit={add}>
        <div className="field">
          <label>From (path)</label>
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="/old-page" />
        </div>
        <div className="field">
          <label>To (path or URL)</label>
          <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="/products/canopy-tents" />
        </div>
        <div className="field" style={{ flex: '0 0 120px' }}>
          <label>Type</label>
          <select value={form.code} onChange={(e) => setForm({ ...form, code: Number(e.target.value) })}>
            <option value={301}>301 permanent</option>
            <option value={302}>302 temporary</option>
            <option value={308}>308 permanent</option>
          </select>
        </div>
        <button className="btn btn-blue" disabled={busy}>Add</button>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="empty-state card"><p>No redirects yet.</p></div>
      ) : (
        <div className="admin-table card">
          <div className="cms-row blog-row cms-row-head">
            <span>From</span><span>To</span><span>Type</span><span></span>
          </div>
          {rows.map((r) => (
            <div className="cms-row blog-row" key={r.id}>
              <span className="mono wrap">{r.source}</span>
              <span className="mono wrap">{r.destination}</span>
              <span>{r.code}</span>
              <span><button className="btn btn-ghost-danger btn-sm" onClick={() => remove(r)}>✕</button></span>
            </div>
          ))}
        </div>
      )}
      <p className="rebuild-note">Redirects take effect after the site rebuilds (~2 min).</p>
    </>
  );
}

import { useEffect, useState } from 'react';
import { CONTENT_FIELDS } from '../../data/content';
import { listContent, saveContent } from '../../services/adminCms';

// Edit site copy. Each field shows its current value (override or the built-in
// default) and saves an override; clearing a field reverts to the default.
// Text-content changes show on the site within ~60s — no rebuild needed.
export default function ContentTab({ onError, onFlash }) {
  const [overrides, setOverrides] = useState({});
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    listContent()
      .then((rows) => {
        const map = {};
        for (const r of rows) map[r.key] = r.value;
        setOverrides(map);
        // Seed inputs with override-or-default.
        const seed = {};
        for (const f of CONTENT_FIELDS) seed[f.key] = map[f.key] ?? f.default;
        setValues(seed);
      })
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (field) => {
    const value = values[field.key];
    setSavingKey(field.key);
    try {
      // Saving the exact default clears the override (keeps the DB clean).
      const toSave = value === field.default ? '' : value;
      await saveContent(field.key, toSave);
      setOverrides((prev) => {
        const next = { ...prev };
        if (toSave === '') delete next[field.key];
        else next[field.key] = toSave;
        return next;
      });
      onFlash(toSave === '' ? '✓ Reverted to default' : '✓ Saved — live within a minute');
    } catch (e) {
      onError(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const revert = (field) => setValues((v) => ({ ...v, [field.key]: field.default }));

  if (loading) return <p className="muted">Loading content…</p>;

  return (
    <>
      <p className="muted" style={{ marginBottom: '1.2rem' }}>
        Edit site copy. Blank a field and save to restore the default. Changes appear on the site
        within about a minute.
      </p>
      <div className="cms-fields">
        {CONTENT_FIELDS.map((field) => {
          const overridden = overrides[field.key] !== undefined;
          const dirty = values[field.key] !== (overrides[field.key] ?? field.default);
          return (
            <div className="cms-field card" key={field.key}>
              <div className="cms-field-head">
                <label>{field.label}</label>
                {overridden && <span className="cms-tag-custom">customised</span>}
              </div>
              {field.multiline ? (
                <textarea
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              ) : (
                <input
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                />
              )}
              <div className="cms-field-actions">
                <button className="btn btn-red btn-sm" disabled={!dirty || savingKey === field.key} onClick={() => save(field)}>
                  Save
                </button>
                {overridden && (
                  <button className="btn btn-outline btn-sm" onClick={() => revert(field)}>Reset to default</button>
                )}
                <code className="cms-key">{field.key}</code>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

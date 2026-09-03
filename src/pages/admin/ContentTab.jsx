import { useEffect, useState } from 'react';
import { CONTENT_FIELDS } from '../../data/content';
import { listContent, saveContent } from '../../services/adminCms';

// Edit site copy. Each field shows its current value (override or the built-in
// default) and saves an override; clearing a field reverts to the default.
// Text-content changes show on the site within ~60s — no rebuild needed.
// List fields (category cards, why-us cards, reviews) hold an array. They are
// edited here as JSON text and parsed back on save; anything that is not a
// valid array is refused rather than written, since a malformed value would
// otherwise reach the live homepage.
const isList = (field) => field.type === 'list';
const asText = (field, value) =>
  isList(field) ? JSON.stringify(value ?? [], null, 2) : value ?? '';

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
        for (const f of CONTENT_FIELDS) seed[f.key] = asText(f, map[f.key] ?? f.default);
        setValues(seed);
      })
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (field) => {
    const raw = values[field.key];
    let value = raw;
    if (isList(field)) {
      if (String(raw).trim() === '') value = [];
      else {
        try {
          value = JSON.parse(raw);
        } catch {
          onError(`${field.label}: that is not valid JSON — the change was not saved.`);
          return;
        }
        if (!Array.isArray(value)) {
          onError(`${field.label}: expected a list (a JSON array) — the change was not saved.`);
          return;
        }
      }
    }
    setSavingKey(field.key);
    try {
      // Saving the exact default clears the override (keeps the DB clean).
      const isDefault = isList(field)
        ? JSON.stringify(value) === JSON.stringify(field.default)
        : value === field.default;
      const toSave = isDefault ? '' : value;
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

  const revert = (field) => setValues((v) => ({ ...v, [field.key]: asText(field, field.default) }));

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
                {overridden && <span className="cms-tag-custom">customized</span>}
              </div>
              {field.multiline || isList(field) ? (
                <textarea
                  rows={isList(field) ? 10 : undefined}
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

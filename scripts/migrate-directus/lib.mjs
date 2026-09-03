// Shared machinery for the Directus migrations.
//
// The governing rule is that these are REPEATABLE, and repeatable has to mean
// safe to run again — not "resets the CMS to whatever the code says". Once an
// editor changes a description in Directus, a re-run that overwrites it makes
// the CMS untrustworthy and the editor's work disposable.
//
// So the default is FILL, not REPLACE:
//
//   - A record that does not exist is created.
//   - A record that exists has only its EMPTY fields filled in.
//   - A field an editor has already written is left alone.
//   - --force overwrites, for when the code really is the source of truth.
//
// Nothing here deletes. A product removed from the code stays in Directus,
// where a person can archive it deliberately.

const RAW_URL = process.env.DIRECTUS_URL || '';
export const URL_BASE = RAW_URL.replace(/\/$/, '');
export const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
export const DRY = process.argv.includes('--dry-run');
export const FORCE = process.argv.includes('--force');

export function requireConfig() {
  const haveCreds = process.env.DIRECTUS_ADMIN_EMAIL && process.env.DIRECTUS_ADMIN_PASSWORD;
  if (!URL_BASE || (!TOKEN && !haveCreds)) {
    console.error('✗ DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN are required.');
    console.error('  The admin token is needed because migrations create collections content;');
    console.error('  do not use the read-only build token here.');
    process.exit(1);
  }
}

// A Directus session token expires in about fifteen minutes, and a full
// migration takes longer than that. Rather than fail halfway — leaving a
// half-populated CMS and an operator guessing which step to rerun — the client
// logs in again when credentials are available and retries the request once.
let token = TOKEN;
const EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || '';
const PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || '';

async function login() {
  if (!EMAIL || !PASSWORD) return false;
  const res = await fetch(`${URL_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (!res.ok) return false;
  const body = await res.json();
  token = body?.data?.access_token || token;
  return Boolean(body?.data?.access_token);
}

async function once(path, options) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { ok: res.ok, status: res.status, body };
}

// Retry on anything that a fresh session would fix. With NO token Directus
// answers 403 as the public role — not 401 — so keying only on TOKEN_EXPIRED
// left a credentials-only run failing with a permissions message that pointed
// at the schema instead of at the missing login.
const needsAuth = (r) => r.status === 401 || r.status === 403;

let triedLogin = false;

export async function api(path, options = {}) {
  // Credentials but no token: sign in before the first request rather than
  // spending a guaranteed failure to discover that.
  if (!token && !triedLogin) { triedLogin = true; await login(); }

  const res = await once(path, options);
  if (!needsAuth(res)) return res;
  if (!(await login())) {
    console.error('  ! the admin token expired. Set DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD');
    console.error('    so the migration can sign in again, or use a static token from the user page.');
    return res;
  }
  return once(path, options);
}

/**
 * Every row of a collection, keyed by one field.
 *
 * Reads whole rows rather than a named list. Naming fields meant guessing at
 * each collection's shape — asking for "h1" on a collection without one fails
 * the whole read — and the fill-only rule needs the real current values anyway:
 * a field fetched as undefined looks empty and would be overwritten.
 */
export async function indexBy(collection, field) {
  const res = await api(`/items/${collection}?limit=-1&fields=*`);
  if (!res.ok) throw new Error(`read ${collection}: ${JSON.stringify(res.body?.errors || res.body).slice(0, 200)}`);
  const map = new Map();
  for (const row of res.body?.data || []) if (row[field] != null) map.set(String(row[field]), row);
  return map;
}

const isEmpty = (v) =>
  v === null || v === undefined || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

/**
 * Which fields of `desired` should actually be written to `existing`.
 * Exported for testing: this is the rule that protects editors' work.
 */
export function fieldsToWrite(existing, desired, { force = false } = {}) {
  if (!existing) return { ...desired };
  const out = {};
  for (const [k, v] of Object.entries(desired)) {
    if (isEmpty(v)) continue;                 // never write a blank over anything
    if (force || isEmpty(existing[k])) out[k] = v;
  }
  return out;
}

/**
 * The fields a collection actually has.
 *
 * Directus accepts a payload containing unknown fields and quietly drops them.
 * That broke repeatability: a field the collection does not have reads back as
 * empty forever, so every run "filled" it again and no run was ever a no-op.
 */
const fieldCache = new Map();
export async function collectionFields(collection) {
  if (fieldCache.has(collection)) return fieldCache.get(collection);
  const res = await api(`/fields/${collection}`);
  const set = new Set((res.body?.data || []).map((f) => f.field));
  fieldCache.set(collection, set);
  return set;
}

const warned = new Set();

/**
 * Create or fill one record.
 * @returns {'created'|'filled'|'unchanged'|'failed'}
 */
export async function upsert(collection, keyField, desired, existingMap, counters, { idField = 'id' } = {}) {
  const key = String(desired[keyField]);
  const existing = existingMap.get(key);

  const known = await collectionFields(collection);
  if (known.size) {
    const unknown = Object.keys(desired).filter((k) => !known.has(k));
    if (unknown.length && !warned.has(collection)) {
      warned.add(collection);
      console.warn(`  ! ${collection}: ignoring field(s) the collection does not have — ${unknown.join(', ')}`);
    }
    for (const k of unknown) delete desired[k];
  }

  const payload = fieldsToWrite(existing, desired, { force: FORCE });

  if (existing && !Object.keys(payload).length) { counters.unchanged++; return 'unchanged'; }

  if (DRY) {
    if (existing) { counters.filled++; console.log(`  ~ ${collection}/${key}: would fill ${Object.keys(payload).join(', ')}`); }
    else { counters.created++; console.log(`  + ${collection}/${key}: would create`); }
    return existing ? 'filled' : 'created';
  }

  const res = existing
    ? await api(`/items/${collection}/${encodeURIComponent(existing[idField])}`, { method: 'PATCH', body: JSON.stringify(payload) })
    : await api(`/items/${collection}`, { method: 'POST', body: JSON.stringify(payload) });

  if (!res.ok) {
    counters.failed++;
    console.error(`  ! ${collection}/${key}: ${JSON.stringify(res.body?.errors || res.body).slice(0, 180)}`);
    return 'failed';
  }
  if (existing) { counters.filled++; console.log(`  ~ ${collection}/${key}: filled ${Object.keys(payload).join(', ')}`); }
  else { counters.created++; console.log(`  + ${collection}/${key}`); }
  if (!existing && res.body?.data) existingMap.set(key, res.body.data);
  return existing ? 'filled' : 'created';
}

export const newCounters = () => ({ created: 0, filled: 0, unchanged: 0, failed: 0, skipped: 0 });

export function report(label, c) {
  const parts = [`${c.created} created`, `${c.filled} filled`, `${c.unchanged} already set`];
  if (c.skipped) parts.push(`${c.skipped} skipped`);
  if (c.failed) parts.push(`${c.failed} FAILED`);
  console.log(`${c.failed ? '✗' : '✓'} ${label}: ${parts.join(', ')}${DRY ? '  (dry run)' : ''}`);
  return c.failed === 0;
}

/** Truncate to a column's limit without cutting mid-word. */
export function clamp(text, max) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:\s]+$/, '');
}

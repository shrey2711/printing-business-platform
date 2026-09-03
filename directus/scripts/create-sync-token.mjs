// Create the READ-ONLY identity the storefront build uses to pull content.
//
// The build must never hold an admin token: it only reads published content,
// and a leaked admin token would let anyone rewrite prices and pages. This
// creates a policy with read-only permissions, a role holding it, and a user
// with a static token — no app login, no admin access.
//
//   cd directus
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_ADMIN_TOKEN=xxx node scripts/create-sync-token.mjs
//
// Idempotent: re-running reuses the existing policy/role/user and rotates the
// token. The token is printed ONCE — put it in the storefront environment as
// DIRECTUS_TOKEN and do not commit it.

import { randomBytes } from 'crypto';

const URL_BASE = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN = process.env.DIRECTUS_ADMIN_TOKEN || '';

if (!ADMIN) {
  console.error('✗ DIRECTUS_ADMIN_TOKEN is required.');
  process.exit(1);
}

// Only what the build actually reads. Adding a collection here widens what a
// leaked build token can see, so keep the list tight.
const READABLE = [
  'categories', 'products', 'product_pricing', 'pages',
  'home_hero', 'home_featured_categories', 'home_why_choose_us',
  'testimonials', 'home_cta_banner', 'navigation', 'blogs',
  'redirects', 'coupons', 'seo_overrides', 'promo_banners', 'site_settings',
  'directus_files'
];

const POLICY_NAME = 'Build sync (read-only)';
const ROLE_NAME = 'Build Sync';
const USER_EMAIL = 'build-sync@apextradeshow.com';

async function api(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ADMIN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    const msg = body?.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(`${options.method || 'GET'} ${path}: ${msg}`);
  }
  return body?.data;
}

const findByField = async (collection, field, value) => {
  const rows = await api(`/${collection}?filter[${field}][_eq]=${encodeURIComponent(value)}&limit=1`);
  return rows?.[0] || null;
};

// ---- policy -----------------------------------------------------------------
let policy = await findByField('policies', 'name', POLICY_NAME);
if (policy) {
  console.log(`policy "${POLICY_NAME}" already exists`);
} else {
  policy = await api('/policies', {
    method: 'POST',
    body: JSON.stringify({
      name: POLICY_NAME,
      icon: 'sync',
      description: 'Read-only access for the storefront build. Never grant write access to this policy.',
      app_access: false,   // cannot open the admin app
      admin_access: false, // cannot change settings or schema
      enforce_tfa: false
    })
  });
  console.log(`✓ created policy "${POLICY_NAME}"`);
}

// ---- permissions ------------------------------------------------------------
const existing = await api(`/permissions?filter[policy][_eq]=${policy.id}&limit=-1`);
const havePerm = new Set((existing || []).map((p) => `${p.collection}:${p.action}`));
let added = 0;
for (const collection of READABLE) {
  if (havePerm.has(`${collection}:read`)) continue;
  await api('/permissions', {
    method: 'POST',
    body: JSON.stringify({
      policy: policy.id,
      collection,
      action: 'read',
      fields: ['*'],
      permissions: {},  // no row filter — the build decides what is published
      validation: {}
    })
  });
  added++;
}
console.log(`✓ read permissions: ${added} added, ${havePerm.size} already present (${READABLE.length} collections)`);

// A read-only identity must have no write permission anywhere. Verify rather
// than assume — this is the whole point of the separate token.
const allPerms = await api(`/permissions?filter[policy][_eq]=${policy.id}&limit=-1`);
const writes = (allPerms || []).filter((p) => p.action !== 'read');
if (writes.length) {
  console.error(`✗ this policy has ${writes.length} non-read permission(s): ${writes.map((w) => `${w.collection}:${w.action}`).join(', ')}`);
  console.error('  Remove them in Settings -> Access Policies before using this token.');
  process.exit(1);
}
console.log('✓ verified: the policy grants read and nothing else');

// ---- role -------------------------------------------------------------------
let role = await findByField('roles', 'name', ROLE_NAME);
if (role) {
  console.log(`role "${ROLE_NAME}" already exists`);
} else {
  role = await api('/roles', {
    method: 'POST',
    body: JSON.stringify({ name: ROLE_NAME, icon: 'sync', description: 'Storefront build. Read-only.', policies: [{ policy: policy.id }] })
  });
  console.log(`✓ created role "${ROLE_NAME}"`);
}

// ---- user + static token ----------------------------------------------------
const token = randomBytes(32).toString('hex');
let user = await findByField('users', 'email', USER_EMAIL);
if (user) {
  await api(`/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ token, status: 'active', role: role.id }) });
  console.log('✓ rotated the token on the existing build-sync user');
} else {
  user = await api('/users', {
    method: 'POST',
    body: JSON.stringify({
      email: USER_EMAIL,
      first_name: 'Build',
      last_name: 'Sync',
      role: role.id,
      token,
      status: 'active',
      description: 'Machine account for the storefront build. Not a person; do not give it a password.'
    })
  });
  console.log('✓ created the build-sync user');
}

console.log('\nPut this in the storefront environment (Vercel and .env.local):\n');
console.log(`  DIRECTUS_URL=${URL_BASE}`);
console.log(`  DIRECTUS_TOKEN=${token}`);
console.log('\nShown once. It is a credential: do not commit it. Re-run this script to rotate.');

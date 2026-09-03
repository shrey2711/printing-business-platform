// Tests for the role boundaries.
//
// These are read from the source rather than exercised over HTTP: the point is
// that a route cannot be added to the wrong side of the boundary without a gate
// failing, and that check has to run without a server or a database.
//
// The boundary being defended: order records carry customer names, addresses and
// payment references. Someone who edits site copy should not see them by virtue
// of being able to edit copy, and someone who handles orders should not be able
// to change what customers are charged.
//
// Run: node scripts/test-roles.mjs

import { readFileSync } from 'fs';

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

const app = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
const roles = readFileSync(new URL('../directus/scripts/configure-roles.mjs', import.meta.url), 'utf8');

/** The guard used by a route, by scanning forward from its declaration. */
function guardFor(routePattern) {
  const i = app.indexOf(routePattern);
  if (i === -1) return null;
  const block = app.slice(i, i + 400);
  const m = block.match(/require(Admin|OrderAccess|Role)\(req, res(?:, ('[a-z]+'))?\)/);
  return m ? `${m[1]}${m[2] ? ` ${m[2]}` : ''}` : null;
}

check('every order route is behind the order guard', () => {
  const routes = [...app.matchAll(/app\.\w+\('(\/api\/admin\/orders[^']*)'/g)].map((m) => m[1]);
  if (!routes.length) return 'no order routes found — this test is not testing anything';
  const wrong = routes
    .map((r) => [r, guardFor(`'${r}'`)])
    .filter(([, g]) => g !== 'OrderAccess' && g !== 'Admin');
  return wrong.length ? wrong.map(([r, g]) => `${r} uses ${g}`).join('; ') : null;
});

check('pricing stays admin-only, so staff cannot change what customers pay', () => {
  const routes = [...app.matchAll(/app\.\w+\('(\/api\/admin\/pricing[^']*)'/g)].map((m) => m[1]);
  if (!routes.length) return 'no pricing routes found';
  const leaky = routes.map((r) => [r, guardFor(`'${r}'`)]).filter(([, g]) => g !== "Role 'admin'");
  return leaky.length ? leaky.map(([r, g]) => `${r} uses ${g}`).join('; ') : null;
});

check('user administration stays admin-only', () => {
  const routes = [...app.matchAll(/app\.\w+\('(\/api\/admin\/users[^']*)'/g)].map((m) => m[1]);
  const leaky = routes.map((r) => [r, guardFor(`'${r}'`)]).filter(([, g]) => g !== "Role 'admin'");
  return leaky.length ? leaky.map(([r, g]) => `${r} uses ${g}`).join('; ') : null;
});

check('content routes do not admit the staff role', () => {
  // A staff account is for orders. Content editing is a different job.
  for (const path of ['/api/admin/blog', '/api/admin/content', '/api/admin/seo', '/api/admin/redirects']) {
    const g = guardFor(`'${path}'`);
    if (g && g.includes('staff')) return `${path} admits staff`;
    if (g === 'OrderAccess') return `${path} is behind the order guard`;
  }
  return null;
});

check('the order guard is separate from the admin guard', () => {
  if (!/async function requireOrderAccess/.test(app)) return 'requireOrderAccess does not exist';
  if (!/requireRole\(req, res, 'staff'\)/.test(app)) return 'it does not admit staff';
  return null;
});

// ---------------------------------------------------------------- Directus --
check('the CMS roles withhold settings, users and the data model', () => {
  const m = roles.match(/const FORBIDDEN = \[([\s\S]*?)\];/);
  if (!m) return 'no forbidden list';
  for (const c of ['directus_settings', 'directus_users', 'directus_roles', 'directus_permissions', 'directus_fields', 'directus_collections']) {
    if (!m[1].includes(c)) return `${c} is not restricted`;
  }
  return null;
});

check('the CMS content role cannot reach pricing', () => {
  const forbidden = roles.match(/const FORBIDDEN = \[([\s\S]*?)\];/)[1];
  if (!forbidden.includes('product_pricing')) return 'product_pricing is not restricted';
  const granted = roles.match(/const CONTENT_COLLECTIONS = \[([\s\S]*?)\];/)[1];
  if (granted.includes('product_pricing')) return 'product_pricing is granted to Content Manager';
  return null;
});

check('only Super Admin has admin access', () => {
  // admin_access in Directus bypasses every permission check.
  const grants = [...roles.matchAll(/admin_access: (true|false)/g)].map((m) => m[1]);
  return grants.every((g) => g === 'false') ? null : 'a created policy grants admin access';
});

check('the roles script verifies its own restrictions', () => {
  // Omitting a permission and asserting it is absent are different things: the
  // second still holds after someone adds one by hand in the UI.
  if (!/can reach restricted collections/.test(roles)) return 'it does not check what was granted';
  if (!/process\.exit\(clean \? 0 : 1\)/.test(roles)) return 'it does not fail when a restriction is breached';
  return null;
});

if (fails.length) {
  console.error(`\n✗ ROLES FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ ROLES OK — ${ran} assertions: orders, content and pricing are separated, and only Super Admin reaches settings, users or prices.`);

// Tests for the CMS service layer's caching behaviour.
//
// The services themselves are thin wrappers; the cache is where a mistake shows
// up as a stuck error page or a request storm, so that is what is tested.
//
// Run: node scripts/test-cms-services.mjs

import { cached, invalidate, __setClock, __stats } from '../src/services/cms/cache.js';
import { readFileSync, readdirSync } from 'fs';

const fails = [];
let ran = 0;
const check = async (name, fn) => {
  ran++;
  try {
    const problem = await fn();
    if (problem) fails.push(`${name}: ${problem}`);
  } catch (e) {
    fails.push(`${name}: threw ${e.message}`);
  } finally {
    invalidate();
  }
};

await check('a second read is served from cache', async () => {
  let calls = 0;
  const load = async () => { calls++; return 'v'; };
  await cached('k', load);
  await cached('k', load);
  return calls === 1 ? null : `loaded ${calls} times`;
});

await check('concurrent reads share one request', async () => {
  let calls = 0;
  const load = async () => { calls++; await new Promise((r) => setTimeout(r, 20)); return 'v'; };
  const [a, b, c] = await Promise.all([cached('k', load), cached('k', load), cached('k', load)]);
  if (calls !== 1) return `${calls} requests for 3 concurrent reads`;
  return a === b && b === c ? null : 'callers got different values';
});

await check('a failed read is NOT cached', async () => {
  let calls = 0;
  const load = async () => { calls++; if (calls === 1) throw new Error('network'); return 'ok'; };
  try { await cached('k', load); } catch { /* expected */ }
  const value = await cached('k', load);
  if (value !== 'ok') return `retry returned ${value}`;
  return calls === 2 ? null : `loaded ${calls} times`;
});

await check('a failure does not leave the key stuck in flight', async () => {
  const load = async () => { throw new Error('network'); };
  try { await cached('k', load); } catch { /* expected */ }
  return __stats().inflight === 0 ? null : 'the in-flight entry leaked';
});

await check('an entry expires after its TTL', async () => {
  let t = 1000;
  const restore = __setClock(() => t);
  try {
    let calls = 0;
    const load = async () => { calls++; return calls; };
    await cached('k', load, { ttl: 100 });
    t += 50;
    await cached('k', load, { ttl: 100 });
    if (calls !== 1) return 'expired early';
    t += 200;
    await cached('k', load, { ttl: 100 });
    return calls === 2 ? null : `loaded ${calls} times`;
  } finally { restore(); }
});

await check('invalidate clears one key, a family, or everything', async () => {
  const load = async () => 'v';
  await cached('a:1', load); await cached('a:2', load); await cached('b:1', load);
  invalidate('a:');
  if (__stats().entries !== 1) return `prefix clear left ${__stats().entries} entries`;
  await cached('a:1', load);
  invalidate('a:1');
  if (__stats().entries !== 1) return 'single-key clear removed the wrong entry';
  invalidate();
  return __stats().entries === 0 ? null : 'full clear left entries behind';
});

// ---- the architectural rule the services exist to hold -------------------
await check('no service fetches the CMS directly from the browser', async () => {
  const dir = new URL('../src/services/cms/', import.meta.url);
  const offenders = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(new URL(f, dir), 'utf8');
    // A Directus URL or token in client code would ship the credential to every
    // visitor and make the site depend on the CMS being up.
    if (/DIRECTUS_TOKEN|VITE_DIRECTUS|directus\.[a-z]|\/items\//i.test(src)) offenders.push(f);
  }
  return offenders.length ? `${offenders.join(', ')} reach for Directus in client code` : null;
});

await check('every service named in the brief exists and exposes a usable API', async () => {
  // Checked by reading the source rather than importing: these modules use
  // extensionless imports, which Vite resolves and bare node does not.
  const dir = new URL('../src/services/cms/', import.meta.url);
  const required = {
    productService: ['list', 'bySlug'],
    pageService: ['get', 'all'],
    seoService: ['current', 'structuredData'],
    navigationService: ['tree', 'categories'],
    homepageService: ['hero', 'promo', 'featuredCategories', 'bestSellers', 'whyChooseUs', 'reviews', 'ctaBanner', 'footer'],
    blogService: ['list', 'bySlug']
  };
  const problems = [];
  for (const [name, fns] of Object.entries(required)) {
    let src;
    try { src = readFileSync(new URL(name + '.js', dir), 'utf8'); }
    catch { problems.push(name + ' is missing'); continue; }
    for (const fn of fns) {
      const declared = src.includes('export function ' + fn + '(') || src.includes('export async function ' + fn + '(');
      if (!declared) problems.push(name + '.' + fn);
    }
  }
  return problems.length ? 'missing: ' + problems.join(', ') : null;
});

await check('reviews ship empty, so nothing invented can reach a page', async () => {
  // The rule lives in src/data/socialProof.js: no fabricated testimonials, and
  // the section renders only once real ones are published.
  const content = readFileSync(new URL('../src/data/content.js', import.meta.url), 'utf8');
  const m = content.match(/home.reviews.items[^}]*default: ([[^]]*])/);
  if (!m) return 'could not find the reviews default';
  return m[1].trim() === '[]' ? null : 'the shipped reviews default is not empty: ' + m[1];
});

if (fails.length) {
  console.error(`\n✗ CMS SERVICES FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CMS SERVICES OK — ${ran} assertions: reads are de-duplicated and expire, failures are never cached, and no service reaches the CMS from the browser.`);

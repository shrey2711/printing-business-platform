// Live check: a configured URL must behave like the clean one.
//
// The static audit (scripts/audit-seo.mjs) proves the built HTML and the source
// are right. It cannot prove what a crawler sees AFTER hydration, because the
// client hook rewrites the canonical once React mounts — and that is the value
// that decides whether ?size=10x10 is a duplicate or a view of the clean page.
//
// So this drives a real browser against the deploy and compares the two URLs on
// the two things that matter: the canonical they settle on, and whether the
// configurator still works on the parameterised one. A canonical fix that
// quietly broke Add to Cart would be a worse outcome than the duplicate.
//
// Network-dependent, so it is NOT part of `npm test`.
//   node scripts/live-check-params.mjs [origin]
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'https://www.apextradeshow.com';
const PATH = '/custom-canopy-tents-los-angeles';
const PARAMS = '?size=10x10&color=blue&quantity=2&utm_source=google&gclid=abc123';

const browser = await chromium.launch();
const look = async (url) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const r = {
    canonical: await page.$eval('link[rel=canonical]', (el) => el.href).catch(() => '(none)'),
    tags: await page.$$eval('link[rel=canonical]', (els) => els.length),
    configure: await page.locator('#configure').count(),
    addToCart: await page.getByRole('button', { name: /add to cart/i }).count(),
    price: (await page.locator('[class*=price]').first().innerText().catch(() => '(none)')).replace(/\s+/g, ' ').trim()
  };
  await page.close();
  return r;
};

const clean = await look(BASE + PATH);
const configured = await look(BASE + PATH + PARAMS);
await browser.close();

const fails = [];
if (clean.canonical !== `${BASE}${PATH}`) fails.push(`the clean URL canonicalises to ${clean.canonical}`);
if (configured.canonical !== clean.canonical) fails.push(`the parameterised URL canonicalises to ${configured.canonical}, not ${clean.canonical}`);
if (configured.tags !== 1) fails.push(`${configured.tags} canonical tags after hydration`);
if (!configured.addToCart) fails.push('the parameterised URL has no Add to cart — the configurator is broken on it');
if (!configured.configure) fails.push('the parameterised URL has no #configure section');
if (configured.price !== clean.price) fails.push(`price differs: "${clean.price}" vs "${configured.price}"`);

console.log(`clean       ${clean.canonical}  addToCart=${clean.addToCart}  price="${clean.price}"`);
console.log(`configured  ${configured.canonical}  addToCart=${configured.addToCart}  price="${configured.price}"`);
if (fails.length) {
  console.error(`\n✗ LIVE PARAMETER CHECK FAILED — ${fails.length}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('\n✓ LIVE PARAMETERS OK — a configured, UTM-tagged URL settles on the clean canonical after hydration and still configures, prices and adds to cart.');

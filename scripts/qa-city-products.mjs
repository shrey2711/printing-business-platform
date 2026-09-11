// End-to-end QA for the twelve product + city pages (brief section 28).
//
// Everything the static gates check is checked in the built artifact, which is
// the right place for it. This is the other half: a real browser against a real
// deploy, exercising the things only a browser can answer — does the
// configurator mount, does a price come back from the pricing API, does
// changing an option change it, does Add to Cart put a line in the cart, does
// the page work at 390px wide.
//
// It stops short of completing a payment. Every step up to that point is
// exercised, including the price the customer would be charged; going further
// would create real orders and real charges in production, which is a decision
// for the owner rather than for a test script.
//
//   node scripts/qa-city-products.mjs [origin] [--mobile-only] [--slug=x]
import { chromium, devices } from 'playwright';
import { CITY_PRODUCT_PAGES } from '../src/data/cityProductPages.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const BASE = (process.argv.find((a) => /^https?:/.test(a)) || 'https://www.apextradeshow.com').replace(/\/$/, '');
const only = (process.argv.find((a) => a.startsWith('--slug=')) || '').split('=')[1];
const PAGES = only ? CITY_PRODUCT_PAGES.filter((p) => p.slug === only) : CITY_PRODUCT_PAGES;

const fails = [];
const notes = [];
const rows = [];
const F = (slug, msg) => fails.push(`${slug}: ${msg}`);

const browser = await chromium.launch();

// ---------------------------------------------------------------- desktop run
const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const p of PAGES) {
  const url = `${BASE}/${p.slug}`;
  const page = await desktop.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  const row = { slug: p.slug };

  // --- URL, head, indexability -------------------------------------------
  row.status = res ? res.status() : 0;
  if (row.status !== 200) F(p.slug, `HTTP ${row.status}`);

  const title = await page.title();
  if (title !== `${p.h1} | Apex Trade Show`) F(p.slug, `title after hydration is "${title}"`);

  const canonical = await page.$eval('link[rel=canonical]', (el) => el.href).catch(() => '');
  if (canonical !== url) F(p.slug, `canonical after hydration is "${canonical}"`);

  const desc = await page.$eval('meta[name=description]', (el) => el.content).catch(() => '');
  if (desc !== p.description) F(p.slug, 'meta description after hydration does not match the page data');

  const robots = await page.$eval('meta[name=robots]', (el) => el.content).catch(() => null);
  if (robots && /noindex/i.test(robots)) F(p.slug, `robots is "${robots}"`);

  // --- one H1, right product, right city ---------------------------------
  const h1s = await page.$$eval('h1', (els) => els.map((e) => e.textContent.trim()));
  if (h1s.length !== 1) F(p.slug, `${h1s.length} H1s`);
  else if (h1s[0] !== p.h1) F(p.slug, `H1 is "${h1s[0]}", expected "${p.h1}"`);
  const city = SEO_CITIES.find((c) => c.slug === p.citySlug);
  const text = await page.$eval('main', (el) => el.innerText).catch(() => '');
  if (city && !text.includes(city.city)) F(p.slug, `the rendered page never names ${city.city}`);

  // --- no fake local claims (section 22) ---------------------------------
  const FAKE = /\b(our|apex[a-z' ]{0,12})\s+(warehouse|showroom|office|facility|team)\s+in\s/i;
  const LOCATED = /\b(located|based)\s+in\s+(Los Angeles|Chicago)\b/i;
  if (FAKE.test(text) || LOCATED.test(text)) F(p.slug, 'the page implies a local presence');
  if (/same.day (local )?delivery/i.test(text)) F(p.slug, 'claims same-day local delivery');

  // --- the configurator ---------------------------------------------------
  const configure = await page.locator('#configure').count();
  if (!configure) F(p.slug, 'no #configure section');

  // Price must come from the API, not be baked in.
  // .price-big is the configurator's live figure. Not [class*="price"] — that
  // also matches the .chip-price "from $X" labels on the product switcher,
  // which are static starting prices and would never move.
  const priceEl = page.locator('.price-big').first();
  const price1 = (await priceEl.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  row.price = price1;
  if (!/\$|quote/i.test(price1)) F(p.slug, `no price rendered (got "${price1}")`);

  // Options: change the quantity and the price must move.
  const qty = page.locator('input[type=number]').first();
  if (await qty.count()) {
    await qty.fill('25');
    await qty.dispatchEvent('change');
    await page.waitForTimeout(2500);
    const price2 = (await priceEl.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    row.price25 = price2;
    if (price2 === price1) F(p.slug, `quantity 25 did not change the price (still ${price1}) — pricing may not be live`);
    await qty.fill('1');
    await qty.dispatchEvent('change');
    await page.waitForTimeout(2000);
  } else {
    notes.push(`${p.slug}: no quantity input found to exercise`);
  }

  // Product switcher, where the page carries more than one product.
  const chips = await page.locator('.city-product-picker button').count();
  row.products = chips || 1;
  if (p.products.length > 1 && chips !== p.products.length) {
    F(p.slug, `${chips} product chips for ${p.products.length} products`);
  }

  // --- Add to Cart --------------------------------------------------------
  const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
  if (!(await addBtn.count())) {
    F(p.slug, 'no Add to cart button');
  } else {
    await addBtn.click();
    await page.waitForTimeout(1200);
    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('apex.cart.v1') || '[]'); } catch { return []; }
    });
    row.cart = stored.length;
    if (!stored.length) F(p.slug, 'Add to cart did not create a cart line');
    else {
      const line = stored[stored.length - 1];
      if (!p.products.includes(line.slug)) F(p.slug, `cart line is "${line.slug}", not one of this page's products`);
      if (!line.config) F(p.slug, 'cart line has no configuration to re-price');
      if (!Number.isFinite(line.unitPrice)) notes.push(`${p.slug}: cart line has no display price (quote-only product?)`);
    }
    // The cart page must show it and offer a way forward.
    await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle', timeout: 60000 });
    const rowsInCart = await page.locator('.cart-row').count();
    if (!rowsInCart) F(p.slug, 'the cart page shows no line after adding');
    const checkoutCta = await page.getByRole('button', { name: /check out|sign in to check out/i }).count();
    if (!checkoutCta) F(p.slug, 'the cart offers no route to checkout');
    await page.evaluate(() => { try { localStorage.removeItem('apex.cart.v1'); } catch { /* private mode */ } });
  }

  // --- Buy Now path -------------------------------------------------------
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const buyNow = page.getByRole('button', { name: /order .*upload artwork/i }).first();
  if (!(await buyNow.count())) {
    F(p.slug, 'no "Order & upload artwork" button');
  } else {
    await buyNow.click();
    await page.waitForTimeout(2500);
    const dest = new URL(page.url()).pathname;
    row.buyNow = dest;
    // Either the order/artwork page, or the sign-in gate in front of it.
    if (!/^\/(order|login|checkout)/.test(dest)) F(p.slug, `Buy Now went to ${dest}`);
    // Signed out, /order shows the sign-in gate and the upload appears behind
    // it. Both are correct; an order page that offered neither would not be.
    const artwork = await page.locator('input[type=file]').count();
    const gate = await page.getByRole('heading', { name: /sign in to place your order/i }).count();
    row.artworkInput = artwork ? 'upload' : (gate ? 'sign-in gate' : 'neither');
    if (dest.startsWith('/order') && !artwork && !gate) {
      F(p.slug, 'the order page offers neither an artwork upload nor a sign-in gate');
    }
  }

  // --- images -------------------------------------------------------------
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const imgs = await page.$$eval('main img', (els) => els.map((e) => ({
    src: e.getAttribute('src') || '', alt: e.getAttribute('alt') || '', w: e.naturalWidth
  })));
  row.images = imgs.length;
  if (!imgs.length) F(p.slug, 'no images rendered in main');
  for (const im of imgs) {
    if (!im.w) F(p.slug, `image failed to load: ${im.src}`);
    if (!im.alt.trim()) F(p.slug, `image has no alt: ${im.src}`);
  }

  // --- internal links resolve --------------------------------------------
  const hrefs = await page.$$eval('main a[href^="/"]', (els) => [...new Set(els.map((e) => e.getAttribute('href')))]);
  row.links = hrefs.length;
  for (const href of hrefs) {
    const r = await page.request.get(BASE + href, { maxRedirects: 0 }).catch(() => null);
    if (!r) { F(p.slug, `link request failed: ${href}`); continue; }
    if (r.status() !== 200) F(p.slug, `link ${href} returns ${r.status()}`);
  }

  if (consoleErrors.length) {
    // Third-party noise (analytics blockers, favicons) is not a page defect.
    const real = consoleErrors.filter((e) => !/favicon|analytics|gtag|Failed to load resource: the server responded with a status of 4/i.test(e));
    if (real.length) F(p.slug, `console error: ${real[0].slice(0, 160)}`);
  }

  rows.push(row);
  await page.close();
}
await desktop.close();

// ----------------------------------------------------------------- mobile run
// Section 25: the purchasing controls are the ones that have to work at 390px.
const mobile = await browser.newContext({ ...devices['iPhone 13'] });
for (const p of PAGES) {
  const url = `${BASE}/${p.slug}`;
  const page = await mobile.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });

  // Nothing may push the page sideways.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) F(p.slug, `[mobile] the page scrolls horizontally by ${overflow}px`);

  // Every buying control must be reachable and big enough to tap.
  for (const [label, locator] of [
    ['Add to cart', page.getByRole('button', { name: /add to cart/i }).first()],
    ['Order & upload artwork', page.getByRole('button', { name: /order .*upload artwork/i }).first()]
  ]) {
    if (!(await locator.count())) { F(p.slug, `[mobile] no ${label} button`); continue; }
    const box = await locator.boundingBox();
    if (!box) { F(p.slug, `[mobile] ${label} is not visible`); continue; }
    if (box.height < 40) F(p.slug, `[mobile] ${label} is ${Math.round(box.height)}px tall — under the 40px tap target`);
    if (box.x < 0 || box.x + box.width > 400) F(p.slug, `[mobile] ${label} sits outside the viewport`);
  }

  // The price has to be visible without hunting for it.
  const price = await page.locator('.price-big').first().innerText().catch(() => '');
  if (!/\$|quote/i.test(price)) F(p.slug, `[mobile] no price rendered`);

  // And the transaction must not be buried: the configurator should start
  // within roughly two screens of the top.
  const top = await page.locator('#configure').boundingBox();
  if (!top) F(p.slug, '[mobile] no #configure section');
  else if (top.y > 1800) F(p.slug, `[mobile] the configurator starts ${Math.round(top.y)}px down the page`);

  await page.close();
}
await mobile.close();
await browser.close();

// --------------------------------------------------------------------- report
console.log(`\nQA — ${PAGES.length} product+city pages against ${BASE}\n`);
console.log('page'.padEnd(38) + 'status  price        qty25        prods  cart  images  links  buy-now');
for (const r of rows) {
  console.log(
    r.slug.padEnd(38) +
    String(r.status).padEnd(8) +
    String(r.price || '-').padEnd(13) +
    String(r.price25 || '-').padEnd(13) +
    String(r.products).padEnd(7) +
    String(r.cart ?? '-').padEnd(6) +
    String(r.images).padEnd(8) +
    String(r.links).padEnd(7) +
    String(r.buyNow || '-') + '  ' + String(r.artworkInput || '-')
  );
}
if (notes.length) {
  console.log('\nNotes:');
  notes.forEach((n) => console.log(`  · ${n}`));
}
if (fails.length) {
  console.error(`\n✗ QA FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `\n✓ QA PASSED — ${PAGES.length} pages: 200, one correct H1, self-canonical, indexable, live pricing that responds to ` +
  'options, Add to Cart writing a real cart line, the artwork/order path reachable, every image and internal link resolving, ' +
  'and the buying controls usable at 390px.'
);
console.log('Not covered here: completing a payment. That creates real orders and charges in production.');

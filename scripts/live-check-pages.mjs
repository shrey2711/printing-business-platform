// Smoke test: do the key pages actually render, in a browser, without throwing?
//
// Written after shipping `ReferenceError: contact is not defined` to the live
// cart. Every static gate passed and the build succeeded, because referencing
// an undefined variable is legal JavaScript until the line runs. It only runs
// when the cart HAS items — and the check I did at the time loaded an empty
// cart, which renders a different branch entirely.
//
// So the rule this encodes: a page is not verified until it has been rendered
// in the state that exercises its code, not the state that is easiest to load.
// The cart is therefore checked twice, empty and full.
//
//   node scripts/live-check-pages.mjs [origin]

import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://www.apextradeshow.com').replace(/\/$/, '');

// A line shaped like the real thing, so the cart renders its full branch:
// rows, totals, the contact form and the checkout button.
const CART_LINE = [{
  lineId: 'smoke-1',
  slug: 'canopy-tent-10x10',
  name: "10' x 10' Canopy Tent",
  specs: 'Smoke test line',
  image: null,
  config: { slug: 'canopy-tent-10x10', quantity: 1 },
  quantity: 1,
  unitPrice: 835,
  currency: 'USD',
  addedAt: new Date().toISOString()
}];

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/products', name: 'all products' },
  { path: '/products/canopy-tent-10x10', name: 'product' },
  { path: '/custom-canopies', name: 'category' },
  { path: '/trade-show-displays/los-angeles', name: 'city' },
  { path: '/custom-canopy-tents-los-angeles', name: 'product+city' },
  { path: '/cart', name: 'cart (empty)' },
  { path: '/cart', name: 'cart (with an item)', seedCart: true },
  { path: '/quote', name: 'quote' },
  { path: '/blog', name: 'blog' },
  { path: '/contact', name: 'contact' }
];

// Noise a page is not responsible for: blocked third parties, favicons, and
// the analytics calls that fail wherever a tracker is blocked.
const IGNORE = /favicon|gtag|googletagmanager|analytics|clarity|doubleclick|ERR_BLOCKED|net::ERR_FAILED.*(google|facebook)/i;

const browser = await chromium.launch();
const fails = [];
const rows = [];

for (const page of PAGES) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push(`PAGEERROR: ${e.message}`));

  if (page.seedCart) {
    // localStorage is per-origin, so it has to be set from a page on the site.
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.evaluate((line) => localStorage.setItem('apex.cart.v1', JSON.stringify(line)), CART_LINE);
  }

  let status = 0;
  try {
    const res = await p.goto(BASE + page.path, { waitUntil: 'networkidle', timeout: 90000 });
    status = res ? res.status() : 0;
  } catch (e) {
    fails.push(`${page.name} (${page.path}): navigation failed — ${e.message}`);
  }

  const body = await p.locator('body').innerText().catch(() => '');
  // The app's error boundary. A crash renders this instead of the page, and
  // still returns HTTP 200 — so status alone proves nothing.
  const crashed = /Something went wrong loading this page/i.test(body);
  const empty = body.trim().length < 40;

  rows.push({ name: page.name, path: page.path, status, crashed, errs: errs.length });

  if (status !== 200) fails.push(`${page.name} (${page.path}): HTTP ${status}`);
  if (crashed) fails.push(`${page.name} (${page.path}): rendered the error boundary`);
  if (empty && !crashed) fails.push(`${page.name} (${page.path}): rendered almost nothing`);
  for (const e of [...new Set(errs)].slice(0, 2)) {
    fails.push(`${page.name} (${page.path}): ${e.slice(0, 180)}`);
  }

  await ctx.close();
}

await browser.close();

console.log(`\nPage smoke test — ${BASE}\n`);
console.log('page'.padEnd(24) + 'status  crashed  js errors');
for (const r of rows) {
  console.log(
    r.name.padEnd(24) +
    String(r.status).padEnd(8) +
    (r.crashed ? 'YES' : 'no').padEnd(9) +
    String(r.errs)
  );
}

if (fails.length) {
  console.error(`\n✗ PAGE SMOKE FAILED — ${fails.length}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\n✓ PAGES OK — ${PAGES.length} pages render with no uncaught errors, including a cart with an item in it.`);

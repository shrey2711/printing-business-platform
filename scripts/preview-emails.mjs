// Render every transactional email to a file, and screenshot it.
//
// Email templates are the one thing in this codebase nobody looks at before it
// reaches a customer: the send path needs SMTP credentials, a real order and a
// real inbox, so in practice they shipped unseen. This renders them from the
// same functions the send path uses — not a copy — at desktop and phone width.
//
//   node scripts/preview-emails.mjs          # write HTML + PNGs
//   node scripts/preview-emails.mjs --html   # HTML only, no browser
//
// Output lands in .preview/emails/ (gitignored).

import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { adminAlertHtml, customerEmailHtml, trackingEmailHtml } from '../backend/lib/mailer.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.preview', 'emails');
mkdirSync(OUT, { recursive: true });

// A real order shape, taken from the one in the staff alert screenshot so the
// preview shows the same content the owner was looking at.
const ORDER = {
  id: '2eb5ad09-7c1e-4f0a-9b33-0d5f6a1e8c42',
  product: 'Feather Angled Flag',
  quantity: 1,
  created_at: '2026-09-20T15:04:00Z',
  estimated_price: '$230.86',
  specs: "What you get: With hardware (pole + base) • Size: Small — 9 ft • Printing: Single-sided "
    + "• Production: 6–8 business days • Base: Spike base — included • Artwork: I'll upload my artwork • Qty 1",
  status: 'submitted',
  payment_choice: 'invoice_later',
  artwork_choice: 'email_later',
  customer_name: 'Manish Bhatia',
  customer_phone: '6725148309',
  shipping_address: '2088 Madison Avenue, Greater Sudbury, Ontario P3A 4G5, Canada',
  shipping_country: 'CA',
  currency: 'USD'
};

const PAID = {
  ...ORDER, status: 'paid', amount_total: 230.86, payment_choice: 'pay_now', artwork_choice: 'uploaded',
  design_path: 'designs/x.pdf'
};
const SHIPPED = { ...PAID, status: 'shipped', tracking_number: 'YT2340921266099304', carrier: 'yunexpress' };

const APP = 'https://www.apextradeshow.com';

const PAGES = [
  ['staff-new-order', adminAlertHtml(ORDER, 'apextradeshow@gmail.com', APP)],
  ['staff-new-order-paid', adminAlertHtml(PAID, 'apextradeshow@gmail.com', APP)],
  ['customer-received', customerEmailHtml(ORDER, 'submitted', APP)],
  ['customer-received-invoice', customerEmailHtml(ORDER, 'submitted', APP, `${APP}/pay/abc`)],
  ['customer-paid', customerEmailHtml(PAID, 'paid', APP)],
  ['customer-proof-ready', customerEmailHtml(PAID, 'proof_ready', APP)],
  ['customer-in-production', customerEmailHtml(PAID, 'in_production', APP)],
  ['customer-shipped', customerEmailHtml(SHIPPED, 'shipped', APP)],
  ['customer-canceled', customerEmailHtml(ORDER, 'canceled', APP)],
  ['customer-tracking', trackingEmailHtml(SHIPPED, APP)]
];

for (const [name, html] of PAGES) {
  // The logo is sent as an inline CID attachment so it survives image blocking.
  // A file:// preview has no attachment to resolve, so point it at the live URL
  // — otherwise every screenshot shows a broken image where the brand goes.
  writeFileSync(join(OUT, `${name}.html`), html.replace(/cid:apexlogo/g, `${APP}/images/logo.png`), 'utf8');
}
console.log(`Wrote ${PAGES.length} templates to ${OUT}`);

if (process.argv.includes('--html')) process.exit(0);

const { chromium } = await import('playwright');
const browser = await chromium.launch();

for (const [name] of PAGES) {
  for (const [label, width] of [['desktop', 700], ['phone', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`file://${join(OUT, `${name}.html`).replace(/\\/g, '/')}`);
    await page.screenshot({ path: join(OUT, `${name}.${label}.png`), fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log(`Screenshotted ${PAGES.length} templates at desktop and phone width.`);

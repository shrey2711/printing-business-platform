// Transactional email templates.
//
// These are the one surface nobody looks at before it reaches a customer: the
// send path needs SMTP credentials, a real order and a real inbox, so in
// practice they shipped unseen. What this pins is the part that breaks
// silently — a missing field rendering as "undefined" in someone's inbox,
// customer-supplied text interpolated raw into HTML, or a layout primitive
// Outlook cannot draw.
//
// Looking at them is a separate job: `node scripts/preview-emails.mjs`.
//
// Run: node scripts/test-emails.mjs

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { adminAlertHtml, customerEmailHtml, trackingEmailHtml } from '../backend/lib/mailer.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, 'backend/lib/mailer.js'), 'utf8');

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

const APP = 'https://www.apextradeshow.com';
const FULL = {
  id: '2eb5ad09-7c1e-4f0a-9b33-0d5f6a1e8c42',
  product: 'Feather Angled Flag',
  quantity: 2,
  created_at: '2026-09-20T15:04:00Z',
  estimated_price: '$230.86',
  specs: "Size: Small — 9 ft • Printing: Single-sided • Artwork: I'll upload my artwork • Qty 1",
  status: 'submitted',
  payment_choice: 'invoice_later',
  artwork_choice: 'email_later',
  customer_name: 'Manish Bhatia',
  customer_phone: '6725148309',
  shipping_address: '2088 Madison Avenue, Greater Sudbury, Ontario P3A 4G5, Canada',
  shipping_country: 'CA',
  currency: 'USD'
};
const PAID = { ...FULL, status: 'paid', amount_total: 230.86, currency: 'CAD' };
const SHIPPED = { ...PAID, status: 'shipped', tracking_number: 'YT2340921266099304', carrier: 'yunexpress' };
// Everything optional missing. Orders placed before a column existed look like
// this, and so does anything the configurator failed to record.
const BARE = { id: 'abc12345-0000-0000-0000-000000000000' };

const every = () => [
  ['staff alert', adminAlertHtml(FULL, 'a@b.com', APP)],
  ['staff alert (paid)', adminAlertHtml(PAID, 'a@b.com', APP)],
  ['staff alert (bare)', adminAlertHtml(BARE, '', APP)],
  ['customer submitted', customerEmailHtml(FULL, 'submitted', APP)],
  ['customer with invoice', customerEmailHtml(FULL, 'submitted', APP, `${APP}/pay/x`)],
  ['customer paid', customerEmailHtml(PAID, 'paid', APP)],
  ['customer shipped', customerEmailHtml(SHIPPED, 'shipped', APP)],
  ['customer canceled', customerEmailHtml(FULL, 'canceled', APP)],
  ['customer bare', customerEmailHtml(BARE, 'submitted', APP)],
  ['tracking', trackingEmailHtml(SHIPPED, APP)]
];

// --------------------------------------------------------- nothing leaks out
check('no template leaks a missing value into the inbox', () => {
  for (const [name, html] of every()) {
    for (const bad of ['undefined', 'NaN', '[object Object]', 'null']) {
      // Guard against the word appearing inside real content.
      const re = new RegExp(`>\\s*[^<]*\\b${bad.replace(/[[\]]/g, '\\$&')}\\b`, 'i');
      if (re.test(html)) return `${name} renders "${bad}"`;
    }
  }
  return null;
});

check('every template renders with no order fields at all', () => {
  for (const [name, html] of every()) {
    if (!html || html.length < 800) return `${name} rendered almost nothing`;
    if (!/<\/html>/.test(html)) return `${name} is not a complete document`;
  }
  return null;
});

// ------------------------------------------------------------------ escaping
check('customer-supplied text cannot inject markup', () => {
  // Product names, specs and addresses come from a configurator and a checkout
  // form and are interpolated straight into HTML.
  const evil = {
    ...FULL,
    product: '<script>alert(1)</script>',
    customer_name: '<img src=x onerror=alert(1)>',
    specs: 'Size: <b>huge</b> • Printing: "quoted"',
    shipping_address: '<svg onload=alert(1)>, Toronto'
  };
  for (const [name, html] of [
    ['staff alert', adminAlertHtml(evil, 'a@b.com', APP)],
    ['customer', customerEmailHtml(evil, 'submitted', APP)]
  ]) {
    // Tag openers only. An escaped value still contains the words "onerror="
    // and "alert(1)" as inert text, so matching those tests nothing — what
    // matters is whether a new element can be opened.
    const tag = html.match(/<\s*(script|svg|img|iframe|style|object|embed)\b/gi) || [];
    const injected = tag.filter((t) => !/^<\s*(style|img)$/i.test(t.trim()));
    if (injected.length) return `${name} emits raw ${injected[0]} from order data`;
    // <img> cannot simply be excused: the template has exactly one, the logo,
    // and an injected <img onerror=…> is the classic way in. Count it.
    const imgs = (html.match(/<\s*img\b/gi) || []).length;
    if (imgs !== 1) return `${name} has ${imgs} <img> tags — the template has one, the logo`;
    const styles = (html.match(/<\s*style\b/gi) || []).length;
    if (styles !== 1) return `${name} has ${styles} <style> blocks — the template has one`;
    if (!html.includes('&lt;script&gt;')) return `${name} does not escape the product name`;
  }
  return null;
});

// -------------------------------------------------------------- email safety
check('layout uses only what Outlook can draw', () => {
  // Outlook renders with Word, which has no flexbox, no grid and no position.
  for (const [name, html] of every()) {
    const m = html.match(/display:\s*(flex|grid|inline-flex)|position:\s*(absolute|fixed)/i);
    if (m) return `${name} uses ${m[0]}, which Outlook cannot lay out`;
  }
  return null;
});

check('the logo survives image blocking', () => {
  const [, html] = every()[0];
  if (!html.includes('cid:apexlogo')) return 'the logo is not the inline CID attachment';
  return /<img[^>]+alt="[^"]+"/.test(html) ? null : 'the logo has no alt text for clients that block it';
});

check('every template carries preheader text', () => {
  for (const [name, html] of every()) {
    const m = html.match(/data-preheader[^>]*>([^<]*)</);
    if (!m || m[1].trim().length < 8) return `${name} has no preheader, so the inbox preview shows raw markup`;
  }
  return null;
});

check('the base layout works without the <style> block', () => {
  // Gmail strips <style> in some contexts, so the media query is enhancement
  // only. Padding has to be inline as well.
  const [, html] = every()[0];
  return /class="gutter" style="[^"]*padding:/.test(html)
    ? null : 'gutter padding exists only in the stylesheet';
});

// ------------------------------------------------------- the two type voices
check('data and prose are set in different voices', () => {
  const [, html] = every()[0];
  if (!/font-family:-apple-system/.test(html)) return 'the sans stack is missing';
  if (!/font-family:ui-monospace/.test(html)) return 'the mono stack is missing — data reads as prose';
  // Not enough that mono appears somewhere: the whole design rests on the
  // specification's VALUES being the mono voice while their labels stay sans.
  // Checking only for the stack's presence passed while every spec value had
  // been switched back to sans.
  const row = html.slice(html.indexOf('>Size</td>'));
  const valueCell = row.slice(row.indexOf('</td>') + 5, row.indexOf('</tr>'));
  if (!/ui-monospace/.test(valueCell)) return 'spec values are not set in mono';
  const labelCell = row.slice(0, row.indexOf('</td>'));
  return /ui-monospace/.test(labelCell) ? 'spec labels are mono too — the two voices collapse' : null;
});

check('the brand colours are the official ones', () => {
  if (!/navy: '#0b1f4d'/.test(src)) return 'brand navy changed';
  return /red: '#ED1C24'/.test(src) ? null : 'brand red changed';
});

// -------------------------------------------------------------- the content
check('the specification is split into labelled rows', () => {
  const html = adminAlertHtml(FULL, 'a@b.com', APP);
  for (const label of ['Size', 'Printing']) {
    if (!html.includes(`>${label}</td>`)) return `"${label}" is not its own spec row`;
  }
  return null;
});

check('the quantity is stated once, not twice', () => {
  // It is the docket head's job. Left in the spec it arrives unlabelled and
  // orphans as a full-width line.
  const html = adminAlertHtml(FULL, 'a@b.com', APP);
  const specSection = html.slice(html.indexOf('Specification') === -1 ? 0 : html.indexOf('Specification'));
  return /Qty 1</.test(specSection) ? 'the spec still repeats the quantity' : null;
});

check('an unpaid order says so, and a paid one shows what was collected', () => {
  const unpaid = adminAlertHtml(FULL, 'a@b.com', APP);
  if (!/Awaiting payment/i.test(unpaid)) return 'the staff alert does not flag an unpaid order';
  if (!/Estimated, before any discount/.test(unpaid)) {
    return 'the estimate is not labelled as a pre-discount quote — it reads as the amount owed';
  }
  // The customer's copy of the same number needs the same caveat, and it is a
  // separate template — labelling only the staff one leaves the customer
  // reading a pre-discount quote as the amount they owe.
  const theirs = customerEmailHtml(FULL, 'submitted', APP);
  if (!/Estimated, before any discount/.test(theirs)) {
    return 'the customer email does not label the estimate as a pre-discount quote';
  }
  const paid = adminAlertHtml(PAID, 'a@b.com', APP);
  // amount_total is stored in the currency charged, and CA$ and US$ both
  // render as "$" — so the code has to be spelled out.
  return /CAD 230\.86/.test(paid) ? null : 'the collected amount is not labelled with its currency';
});

check('the address is linked deliberately, not left to be auto-linked', () => {
  const html = adminAlertHtml(FULL, 'a@b.com', APP);
  for (const [what, re] of [
    ['the address', /maps\.google\.com/],
    ['the phone', /href="tel:\+?\d/],
    ['the email', /href="mailto:a@b\.com"/]
  ]) {
    if (!re.test(html)) return `${what} is not linked, so iOS and Gmail will restyle it as blue underline`;
  }
  return /a\[x-apple-data-detectors\]/.test(html)
    ? null : 'nothing overrides the client auto-detector styling';
});

check('the plaintext alternative does not repeat the preheader', () => {
  // htmlToText strips tags, so the hidden preheader span used to come through
  // as a duplicate first line above the heading it duplicates.
  return /data-preheader[\s\S]{0,80}?remove|replace\(\/<span data-preheader/.test(src)
    ? null : 'htmlToText does not strip the preheader span';
});

if (fails.length) {
  console.error(`\n✗ EMAIL TEMPLATES FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ EMAIL TEMPLATES OK — ${ran} assertions across 10 rendered emails: nothing leaks an ` +
  'empty field into an inbox, order data cannot inject markup, the layout is drawable by ' +
  'Outlook, and money is always labelled with the currency it was charged in.'
);

// Policy consistency for the 36 catalog products.
// Run after build: `node scripts/test-product-policy.mjs`
//
// Priced offers must not claim a 30-day refund window, a free return, or $0
// shipping. Visible prerender copy and the configurator share productPolicyNote.
// Quote-only products stay without an Offer. The tabletop banner lead time is
// left as published and is asserted unchanged.

import { readFileSync, existsSync } from 'fs';
import { listProducts } from '../backend/data/products.js';
import { productPolicyNote } from '../src/data/warranty.js';
import { offerMerchantPolicy, MERCHANT_RETURN_NOT_PERMITTED } from './lib/offerPolicy.mjs';
import { brand } from '../src/config/brand.js';

const DIST = 'dist';
const fails = [];
const fail = (msg) => fails.push(msg);

const policy = offerMerchantPolicy();
if (policy.shippingDetails) fail('offerMerchantPolicy() includes shippingDetails');
if (policy.hasMerchantReturnPolicy?.returnPolicyCategory !== MERCHANT_RETURN_NOT_PERMITTED) {
  fail('offerMerchantPolicy() is not MerchantReturnNotPermitted');
}
if (policy.hasMerchantReturnPolicy?.merchantReturnDays != null) fail('offerMerchantPolicy() sets merchantReturnDays');
if (policy.hasMerchantReturnPolicy?.returnFees) fail('offerMerchantPolicy() sets returnFees');
if (policy.hasMerchantReturnPolicy?.returnMethod) fail('offerMerchantPolicy() sets returnMethod');
if (policy.hasMerchantReturnPolicy?.merchantReturnLink !== `${brand.origin}/returns`) {
  fail('offerMerchantPolicy() does not link the published /returns page');
}
const countries = policy.hasMerchantReturnPolicy?.applicableCountry;
if (!Array.isArray(countries) || countries.join(',') !== 'US,CA') {
  fail(`offerMerchantPolicy() applicableCountry is ${JSON.stringify(countries)}, expected US and CA`);
}

const products = listProducts();
const priced = products.filter((p) => p.startingPrice != null);
const quote = products.filter((p) => p.startingPrice == null);

const fabric = products.find((p) => p.slug === 'fabric-banner-9oz-wrinkle-free');
if (!fabric) fail('fabric-banner-9oz-wrinkle-free missing from catalog');
else if (/ships in/i.test(fabric.turnaround)) fail(`fabric turnaround still claims a ship window: ${fabric.turnaround}`);
else if (!/6-8 business days standard, 2-3 day rush/.test(fabric.turnaround)) {
  fail(`fabric turnaround does not restate its own production spec: ${fabric.turnaround}`);
} else if (!/calculated separately/i.test(fabric.turnaround)) {
  fail('fabric turnaround does not say shipping is calculated separately');
}

const tabletop = products.find((p) => p.slug === 'table-top-banner-stand');
if (!tabletop) fail('table-top-banner-stand missing from catalog');
else if (tabletop.turnaround !== 'Ships in 2–4 business days') {
  fail(`tabletop lead time was changed: ${tabletop.turnaround}`);
}

if (!existsSync(`${DIST}/products/canopy-tent-10x10/index.html`)) {
  fail('dist product HTML missing — run npm run build first');
}

const bannedInOffer = [
  [/MerchantReturnFiniteReturnWindow/, 'finite return window'],
  [/merchantReturnDays/, 'merchantReturnDays'],
  [/FreeReturn/, 'FreeReturn'],
  [/OfferShippingDetails/, 'OfferShippingDetails'],
  [/"shippingRate"/, 'shippingRate'],
  [/ReturnByMail/, 'ReturnByMail'],
  [/"value":"0"/, '$0 monetary amount'],
  [/"value":0[,}]/, '$0 monetary amount']
];

let pricedWithPolicy = 0;
let quoteWithOffer = 0;

for (const p of products) {
  const file = `${DIST}/products/${p.slug}/index.html`;
  if (!existsSync(file)) { fail(`${p.slug}: no prerendered page`); continue; }
  const html = readFileSync(file, 'utf8');
  const note = productPolicyNote(p);
  if (!html.includes(note)) fail(`${p.slug}: visible policy note missing`);
  if (!html.includes('href="/returns"') || !html.includes('href="/warranty"')) {
    fail(`${p.slug}: missing crawlable /returns or /warranty link in the product body`);
  }
  if (/free shipping/i.test(html)) fail(`${p.slug}: visible or schema text says free shipping`);
  if (/30[-\s]?day/i.test(html)) fail(`${p.slug}: page still says 30-day`);
  if (p.slug === 'fabric-banner-9oz-wrinkle-free' && /Ships in 3[–-]5 business days/.test(html)) {
    fail(`${p.slug}: still contains the 3–5 day ship window`);
  }

  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { nodes.push(...[].concat(JSON.parse(m[1]))); }
    catch (err) { fail(`${p.slug}: invalid JSON-LD (${err.message})`); }
  }
  const prod = nodes.find((n) => n && n['@type'] === 'Product');
  if (!prod) { fail(`${p.slug}: missing Product JSON-LD`); continue; }
  const ld = JSON.stringify(prod.offers || {});
  for (const [re, label] of bannedInOffer) {
    if (re.test(ld)) fail(`${p.slug}: JSON-LD still contains ${label}`);
  }

  if (p.startingPrice != null) {
    const cat = prod.offers?.hasMerchantReturnPolicy?.returnPolicyCategory;
    if (cat !== MERCHANT_RETURN_NOT_PERMITTED) fail(`${p.slug}: priced offer return category ${cat}`);
    else pricedWithPolicy++;
    if (prod.offers?.shippingDetails) fail(`${p.slug}: priced offer still has shippingDetails`);
    if (prod.offers?.hasMerchantReturnPolicy?.merchantReturnLink !== `${brand.origin}/returns`) {
      fail(`${p.slug}: priced offer does not link /returns`);
    }
  } else if (prod.offers) {
    quoteWithOffer++;
    fail(`${p.slug}: quote-only product has an Offer`);
  }
}

if (products.length !== 36) fail(`expected 36 active products, found ${products.length}`);
if (priced.length !== 17) fail(`expected 17 priced products, found ${priced.length}`);
if (quote.length !== 19) fail(`expected 19 quote-only products, found ${quote.length}`);
if (pricedWithPolicy !== priced.length) fail(`NotPermitted on ${pricedWithPolicy}/${priced.length} priced products`);
if (quoteWithOffer) fail(`${quoteWithOffer} quote-only products emitted an Offer`);

if (fails.length) {
  console.error(`\n✗ PRODUCT POLICY FAILED — ${fails.length}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ PRODUCT POLICY OK — ${priced.length} priced offers are MerchantReturnNotPermitted with no shipping rate; ${quote.length} quote-only offers omitted; visible policy note matches /returns and /warranty.`);

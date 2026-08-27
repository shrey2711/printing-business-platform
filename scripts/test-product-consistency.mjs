// Fails when a product's price disagrees across the four surfaces that must
// always match: the CARD/engine starting price (listProducts), the PDP Product
// schema Offer, the visible "Starting at $X" on the page, and the Merchant feed.
// Quote-only SKUs must be consistently price-less (no Offer, not in feed, shown
// as "Request a quote"). Run after build: `node scripts/test-product-consistency.mjs`.

import { readFileSync, existsSync } from 'fs';
import { listProducts } from '../backend/data/products.js';

const DIST = 'dist';
const fails = [];
const feed = existsSync(`${DIST}/feed.xml`) ? readFileSync(`${DIST}/feed.xml`, 'utf8') : '';
const feedItems = feed.match(/<item>[\s\S]*?<\/item>/g) || [];
const feedPrice = (slug) => {
  const item = feedItems.find((it) => it.includes(`<g:id>${slug}</g:id>`));
  if (!item) return null;
  const m = item.match(/<g:price>(\d+)\.\d{2} USD<\/g:price>/);
  return m ? Number(m[1]) : null;
};

for (const p of listProducts()) {
  const file = `${DIST}/products/${p.slug}/index.html`;
  if (!existsSync(file)) { fails.push(`${p.slug}: no prerendered page`); continue; }
  const h = readFileSync(file, 'utf8');
  const prod = (() => {
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { const n = [].concat(JSON.parse(m[1])).find((x) => x && x['@type'] === 'Product'); if (n) return n; } catch { /* ignore */ }
    }
    return null;
  })();
  const schemaPrice = prod && prod.offers ? Number(prod.offers.lowPrice ?? prod.offers.price) : null;
  const fp = feedPrice(p.slug);

  if (p.startingPrice != null) {
    // Priced product: engine == schema == visible == feed.
    if (schemaPrice == null) fails.push(`${p.slug}: priced ($${p.startingPrice}) but Product schema has no Offer`);
    else if (schemaPrice !== p.startingPrice) fails.push(`${p.slug}: schema Offer ${schemaPrice} != engine startingPrice ${p.startingPrice}`);
    const money = `$${Number(p.startingPrice).toLocaleString('en-US')}`;
    if (!h.includes(money) && !h.includes(`$${p.startingPrice}`)) fails.push(`${p.slug}: startingPrice ${p.startingPrice} not visible on page`);
    if (fp != null && fp !== p.startingPrice) fails.push(`${p.slug}: feed price ${fp} != engine startingPrice ${p.startingPrice}`);
    if (prod && prod.offers && prod.offers.priceCurrency && prod.offers.priceCurrency !== 'USD') fails.push(`${p.slug}: schema currency ${prod.offers.priceCurrency} (expected USD)`);
  } else {
    // Quote-only: no Offer price anywhere, not in feed.
    if (schemaPrice != null) fails.push(`${p.slug}: quote-only but schema advertises Offer price ${schemaPrice}`);
    if (fp != null) fails.push(`${p.slug}: quote-only but appears in Merchant feed at ${fp}`);
  }
}

if (fails.length) {
  console.error(`\n✗ PRODUCT CONSISTENCY FAILED — ${fails.length} mismatch(es):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ PRODUCT CONSISTENCY OK — ${listProducts().length} products: card/engine == Product schema Offer == visible price == Merchant feed (quote-only consistently price-less).`);

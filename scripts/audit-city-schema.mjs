// §23 structured data + §24 breadcrumbs, audited at source level against the
// rendered page rather than against the data that was meant to produce it.
//
//   * required types present: WebSite/Organization, WebPage, BreadcrumbList,
//     FAQPage (Service where the page offers one)
//   * every JSON-LD block parses, and no two blocks conflict (same @type
//     asserted twice with different content, duplicate @id)
//   * FAQPage matches the VISIBLE FAQs exactly — same count, same order, same
//     question text, same answer text
//   * BreadcrumbList matches the VISIBLE breadcrumb trail — same names, same
//     order, same URLs, positions 1..n
//   * no Review, AggregateRating or rating properties anywhere
//   * no misleading Offer: an Offer may only appear with a real price and
//     currency, and never on a city landing page
//
// Usage: node scripts/audit-city-schema.mjs [--list]

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const ORIGIN = 'https://www.apextradeshow.com';
const list = process.argv.includes('--list');
const fails = [];

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&rsquo;/g, '’')
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const strip = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const REQUIRED = ['WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage'];
const BANNED_TYPES = ['Review', 'AggregateRating', 'LocalBusiness'];
const BANNED_PROPS = ['ratingValue', 'reviewCount', 'bestRating', 'reviewBody'];

const rolled = SEO_CITIES.filter((c) => Array.isArray(CITY_DETAIL[c.slug]?.productSections));

for (const city of rolled) {
  const file = `${DIST}/${CAT}/${city.slug}/index.html`;
  if (!existsSync(file)) { fails.push(`${city.slug}: not built`); continue; }
  const html = readFileSync(file, 'utf8');
  const F = (m) => fails.push(`${city.slug}: ${m}`);

  // ---- parse every JSON-LD block ----
  const blocks = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(m[1]);
      blocks.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (e) {
      F(`JSON-LD block does not parse: ${e.message}`);
    }
  }
  if (!blocks.length) { F('no JSON-LD at all'); continue; }

  const types = blocks.map((b) => b['@type']).flat();
  for (const t of REQUIRED) if (!types.includes(t)) F(`missing ${t} schema`);
  for (const t of BANNED_TYPES) if (types.includes(t)) F(`contains ${t} schema, which this page has no basis for`);

  // duplicate / conflicting nodes
  const counts = types.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
  for (const [t, n] of counts) {
    if (n > 1 && t !== 'ListItem' && t !== 'Question') F(`${t} declared ${n}x — duplicate or conflicting schema`);
  }
  const ids = blocks.map((b) => b['@id']).filter(Boolean);
  if (new Set(ids).size !== ids.length) F('two schema nodes share an @id');

  // banned properties anywhere in the tree
  const raw = JSON.stringify(blocks);
  for (const p of BANNED_PROPS) if (raw.includes(`"${p}"`)) F(`schema contains ${p} — fabricated rating/review data`);
  if (raw.includes('"Offer"') || raw.includes('"offers"')) {
    F('city landing page declares an Offer — pricing belongs on the product pages');
  }

  // ---- §23 FAQPage must match the visible FAQs exactly ----
  const faqNode = blocks.find((b) => b['@type'] === 'FAQPage');
  const visibleQ = [...html.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)]
    .map((m) => [strip(m[1]), strip(m[2])]);
  if (faqNode) {
    const schemaQ = (faqNode.mainEntity || []).map((q) => [strip(q.name || ''), strip((q.acceptedAnswer || {}).text || '')]);
    if (schemaQ.length !== visibleQ.length) {
      F(`FAQ schema has ${schemaQ.length} questions but ${visibleQ.length} are visible`);
    } else {
      schemaQ.forEach(([q, a], i) => {
        if (q !== visibleQ[i][0]) F(`FAQ #${i + 1} question differs — schema "${q}" vs visible "${visibleQ[i][0]}"`);
        if (a !== visibleQ[i][1]) F(`FAQ #${i + 1} answer differs from the visible answer`);
      });
    }
  }

  // ---- §24 BreadcrumbList must match the visible trail ----
  const bcNode = blocks.find((b) => b['@type'] === 'BreadcrumbList');
  const nav = (html.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/) || [])[1] || '';
  const visibleCrumbs = [...nav.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<span>([\s\S]*?)<\/span>/g)]
    .map((m) => ({ url: m[1] || null, name: strip(m[2] || m[3] || '') }))
    .filter((c) => c.name);
  if (!visibleCrumbs.length) F('no visible breadcrumb trail');
  if (bcNode) {
    const items = (bcNode.itemListElement || []);
    if (items.length !== visibleCrumbs.length) {
      F(`BreadcrumbList has ${items.length} items but ${visibleCrumbs.length} crumbs are visible`);
    } else {
      items.forEach((it, i) => {
        if (it.position !== i + 1) F(`breadcrumb item ${i + 1} has position ${it.position}`);
        if (strip(String(it.name)) !== visibleCrumbs[i].name) F(`breadcrumb ${i + 1} name differs — schema "${it.name}" vs visible "${visibleCrumbs[i].name}"`);
        const schemaUrl = String(it.item || '').replace(ORIGIN, '').replace(/\/$/, '');
        const visUrl = (visibleCrumbs[i].url || '').replace(/\/$/, '');
        if (visUrl && schemaUrl !== visUrl) F(`breadcrumb ${i + 1} URL differs — schema "${schemaUrl}" vs visible "${visUrl}"`);
      });
    }
    // the trail must end on this page
    const last = items[items.length - 1];
    if (last && String(last.item || '').replace(ORIGIN, '').replace(/\/$/, '') !== `/${CAT}/${city.slug}`) {
      F(`breadcrumb trail does not end on this page (${last.item})`);
    }
  }

  if (list) console.log(`${city.city.padEnd(16)} ${[...counts.keys()].filter((t) => !['ListItem', 'Question', 'Answer'].includes(t)).join(', ')} · FAQ ${visibleQ.length} · crumbs ${visibleCrumbs.length}`);
}

if (fails.length) {
  console.error(`\n✗ SCHEMA AUDIT FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 30) console.error(`  … and ${fails.length - 30} more`);
  process.exit(1);
}
console.log(`✓ SCHEMA OK — ${rolled.length} city pages: required types present and non-conflicting, FAQ schema matches the visible FAQs word for word, BreadcrumbList matches the visible trail, and no review, rating or offer data is asserted.`);

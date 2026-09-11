// Uniqueness gate for the product + city pages.
//
// The requirement is 60%+ genuinely unique local content per page. The failure
// mode it exists to prevent is specific and named: writing one city's page and
// producing the other by find-replacing the city name. That produces text which
// looks different to a diff and identical to a reader.
//
// So this measures twice.
//
//   1. Raw overlap between every pair of pages.
//   2. Overlap again with every city, venue and state name normalised away. Two
//      pages that only differed by their city name score ~0% on the first test
//      and ~100% on this one, which is exactly the clone this gate is for.
//
// The purchasing interface and product specifications are deliberately NOT
// measured. They are the same physical products and the brief says that overlap
// is acceptable — only the editorial content around them has to differ.
//
// Run after the data changes: node scripts/audit-city-product-uniqueness.mjs

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CITY_PRODUCT_PAGES, nationalCategoryFor } from '../src/data/cityProductPages.js';
import { CATEGORY_PAGES } from '../src/data/categoryPages.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.apextradeshow.com';

const MAX_OVERLAP = 40;          // 60%+ unique, as specified
const MAX_NORMALISED_OVERLAP = 55; // same product, city names removed — still must read differently
const WORD_FLOOR = 250;

const fails = [];
const warn = [];

// Editorial content only: the copy a reader would recognise as "the page".
const editorial = (p) =>
  [p.productIntro, p.intro, ...p.local.map((l) => `${l.h2} ${l.p}`), ...p.faqs.map((f) => `${f.q} ${f.a}`)]
    .join(' ');

const words = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Strip every place name, so a find-replaced clone cannot hide behind it.
const PLACES = [
  ...SEO_CITIES.flatMap((c) => [c.city, c.abbr, c.venue].filter(Boolean)),
  'Los Angeles', 'LA', 'Chicago', 'California', 'Illinois', 'Southern California',
  'Anaheim', 'McCormick Place', 'Donald E. Stephens', 'Rosemont', 'Lake Michigan',
  'Michigan Avenue', 'Santa Monica', 'Century City', 'Westside', 'Coachella'
];
const deplace = (t) => {
  let out = t;
  for (const place of PLACES.sort((a, b) => b.length - a.length)) {
    out = out.replaceAll(place.toLowerCase(), ' ');
  }
  return out.replace(/\s+/g, ' ').trim();
};

const shingles = (t, n = 5) => {
  const w = t.split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};
const overlap = (a, b) => {
  let hits = 0;
  a.forEach((x) => { if (b.has(x)) hits++; });
  const union = a.size + b.size - hits;
  return union ? (hits / union) * 100 : 0;
};

const pages = CITY_PRODUCT_PAGES.map((p) => {
  const raw = words(editorial(p));
  return { slug: p.slug, group: p.group, citySlug: p.citySlug, raw, plain: deplace(raw), wordCount: raw.split(' ').length };
});

// 1. Every page carries real content and names its own city.
for (const p of pages) {
  if (p.wordCount < WORD_FLOOR) fails.push(`${p.slug}: ${p.wordCount} words of local content (floor ${WORD_FLOOR})`);
  const city = SEO_CITIES.find((c) => c.slug === p.citySlug);
  if (city && !p.raw.includes(city.city.toLowerCase())) {
    fails.push(`${p.slug}: never names ${city.city} in its own copy`);
  }
}

// 1b. One product + one city = one indexable URL, and every keyword variation
// lives on that URL rather than on a page of its own. Two pages targeting the
// same product in the same city would split the signal between them, which is
// the cannibalisation this pilot is supposed to avoid.
const seenPair = new Map();
for (const p of pages) {
  const key = `${p.group}|${p.citySlug}`;
  if (seenPair.has(key)) {
    fails.push(`${p.slug} and ${seenPair.get(key)} both target ${p.group} in ${p.citySlug} — one product and one city must be one URL`);
  } else {
    seenPair.set(key, p.slug);
  }
}

// 1c. Each page must actually carry its own keyword variations. A variation
// with no home on the page is a page waiting to be created for it, which is how
// a clean set of URLs turns into a cannibalising one.
const STOP = new Set(['los', 'angeles', 'chicago', 'the', 'a', 'in', 'for', 'and', 'of']);
for (const p of CITY_PRODUCT_PAGES) {
  const text = words(
    [p.title, p.description, p.h1, p.productIntro, p.intro,
     ...p.local.map((l) => `${l.h2} ${l.p}`), ...p.faqs.map((f) => `${f.q} ${f.a}`)].join(' ')
  ).replace(/[^a-z0-9 -]/g, ' ');
  const uncovered = (p.secondary || []).filter((kw) => !kw.toLowerCase().split(' ')
    .filter((w) => !STOP.has(w))
    .every((t) => text.includes(t) || text.includes(t.replace('up', '-up')) || text.includes(`${t}s`)));
  if (uncovered.length) {
    fails.push(`${p.slug}: ${uncovered.length} keyword variation(s) have no home on the page — ${uncovered.join('; ')}`);
  }
}

// 2. Pairwise, both raw and with place names removed.
let worstRaw = { v: 0 };
let worstPlain = { v: 0 };
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i];
    const b = pages[j];
    const raw = overlap(shingles(a.raw), shingles(b.raw));
    const plain = overlap(shingles(a.plain), shingles(b.plain));
    if (raw > worstRaw.v) worstRaw = { v: raw, pair: `${a.slug} / ${b.slug}` };
    if (plain > worstPlain.v) worstPlain = { v: plain, pair: `${a.slug} / ${b.slug}` };

    if (raw > MAX_OVERLAP) {
      fails.push(`${a.slug} and ${b.slug} share ${raw.toFixed(1)}% of their copy (max ${MAX_OVERLAP}%)`);
    }
    // The clone test. Same product in two cities is the pair most at risk.
    if (plain > MAX_NORMALISED_OVERLAP) {
      const sameProduct = a.group === b.group;
      fails.push(
        `${a.slug} and ${b.slug} are ${plain.toFixed(1)}% identical once city names are removed ` +
        `(max ${MAX_NORMALISED_OVERLAP}%)` +
        (sameProduct ? ' — this is the find-and-replace pattern the brief prohibits' : '')
      );
    } else if (a.group === b.group && plain > MAX_NORMALISED_OVERLAP - 15) {
      warn.push(`${a.slug} / ${b.slug}: ${plain.toFixed(1)}% alike with city names removed — drifting toward a clone`);
    }
  }
}

// 3. Canonical. Every one of these URLs must self-canonicalise.
//
// The named failure is consolidating a city page into the national product page
// (/custom-canopy-tents-los-angeles → /products/custom-canopy-tents). That is a
// plausible-looking "fix" for duplicate content, and it would be wrong here: the
// city page targets a different intent, and canonicalising it away deletes that
// intent from the index while leaving the page online.
//
// Checked in the built HTML, not in the source, because the canonical a crawler
// sees can come from three places — the route, a dashboard SEO override, or the
// template — and only the output knows which one won.
let canonChecked = 0;
if (!existsSync(DIST)) {
  warn.push('dist/ is missing — the canonical checks did not run. Build first: npm run build');
} else {
  // Each page appears in exactly one sitemap, exactly once. A canonical that
  // points at a URL the sitemap never lists is a page with no way in.
  const sitemapLocs = [];
  for (const sm of ['sitemap-pages', 'sitemap-categories', 'sitemap-products', 'sitemap-blog', 'sitemap-locations']) {
    const f = join(DIST, `${sm}.xml`);
    if (!existsSync(f)) continue;
    for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapLocs.push(m[1]);
  }

  for (const p of CITY_PRODUCT_PAGES) {
    const self = `${ORIGIN}/${p.slug}`;
    const file = join(DIST, p.slug, 'index.html');
    if (!existsSync(file)) {
      fails.push(`${p.slug}: no prerendered HTML — the URL would 404`);
      continue;
    }
    canonChecked++;
    const html = readFileSync(file, 'utf8');

    const tags = (html.match(/rel="canonical"/g) || []).length;
    if (tags !== 1) {
      fails.push(`${p.slug}: ${tags} canonical tag(s), expected exactly 1`);
      continue;
    }
    const href = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
    if (href !== self) {
      // Name the specific prohibited move when that is what happened, so the
      // message reads as a rule being broken rather than a string mismatch.
      const toNational = /^https?:\/\/[^/]+\/products\//.test(href);
      fails.push(
        `${p.slug}: canonical is ${href || '(empty)'}, not ${self}` +
        (toNational
          ? ' — this consolidates the city page into the national product page, which removes the local intent from the index'
          : '')
      );
    }
    if (/<meta name="robots"[^>]*noindex/i.test(html)) {
      fails.push(`${p.slug}: self-canonical but noindex — the canonical points at a page that cannot be indexed`);
    }
    const listed = sitemapLocs.filter((l) => l.replace(/\/$/, '') === self).length;
    if (listed !== 1) fails.push(`${p.slug}: appears ${listed} time(s) in the sitemaps, expected exactly 1`);
  }
}

// 4. Topical hierarchy: the generic city page is the hub, these pages sit under
// it, and the two link both ways. One-way linking is the failure worth catching
// — a hub that lists pages which never acknowledge it, or transactional pages
// orphaned from the city hub that should be passing authority to them.
//
// The generic city pages are load-bearing here and must keep existing: they are
// the broader "exhibiting in this city" pages, and these product pages are not
// a replacement for them.
if (existsSync(DIST)) {
  const linksIn = (file) => {
    if (!existsSync(file)) return null;
    return new Set([...readFileSync(file, 'utf8').matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, '')));
  };
  const byCity = new Map();
  for (const p of CITY_PRODUCT_PAGES) {
    if (!byCity.has(p.citySlug)) byCity.set(p.citySlug, []);
    byCity.get(p.citySlug).push(p);
  }

  for (const [citySlug, pagesForCity] of byCity) {
    const hubPath = `/trade-show-displays/${citySlug}`;
    const hubLinks = linksIn(join(DIST, 'trade-show-displays', citySlug, 'index.html'));
    if (!hubLinks) {
      fails.push(`${hubPath} does not exist — the generic city page is the hub these pages hang from and must remain`);
      continue;
    }
    for (const p of pagesForCity) {
      // Hub → product page.
      if (!hubLinks.has(`/${p.slug}`)) {
        fails.push(`${hubPath} does not link down to /${p.slug} — the hub must list the product pages beneath it`);
      }
      // Product page → hub.
      const own = linksIn(join(DIST, p.slug, 'index.html'));
      if (own && !own.has(hubPath)) {
        fails.push(`${p.slug} does not link back up to ${hubPath} — every product+city page needs its route back to the city hub`);
      }
    }
  }
}

// 5. The national catalog link — exactly one, and the right one.
//
// Two failures matter here and they pull in opposite directions. Linking to no
// national category strands the page at the bottom of the hierarchy with
// nowhere to send someone still choosing a model. Linking to all of them turns
// the page into a link dump: the brief's "do not overdo internal links", and
// the reason there is a budget below rather than only a minimum.
//
// Measured on the page body only — the site nav and footer link to every
// category on every page, and counting chrome would make every page look like
// a link dump and hide a real one.
const NATIONAL = new Set(CATEGORY_PAGES.map((c) => `/${c.slug}`));
const LINK_BUDGET = 14;
if (existsSync(DIST)) {
  for (const p of CITY_PRODUCT_PAGES) {
    const file = join(DIST, p.slug, 'index.html');
    if (!existsSync(file)) continue;
    // Everything before the primary nav is the page's own content.
    const body = readFileSync(file, 'utf8').split('<nav aria-label="Primary">')[0];
    // Unique destinations, not raw anchors: the breadcrumb and the cross-link
    // block legitimately point at the same hub twice, and "do not overdo
    // internal links" is about how many places a page sends you, not how many
    // times it offers the same one.
    const links = [...new Set(
      [...body.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, '') || '/')
    )];
    const want = nationalCategoryFor(p.group);
    if (!want) {
      fails.push(`${p.slug}: group "${p.group}" has no national category mapped — the page has nowhere to send a reader still choosing a model`);
      continue;
    }
    const toWanted = links.filter((l) => l === want.to).length;
    if (toWanted !== 1) {
      fails.push(`${p.slug}: links to ${want.to} ${toWanted} time(s), expected exactly 1`);
    }
    const strays = [...new Set(links.filter((l) => NATIONAL.has(l) && l !== want.to))];
    if (strays.length) {
      fails.push(`${p.slug}: also links to ${strays.join(', ')} — one product group, one national category, or the page is a link dump`);
    }
    if (links.length > LINK_BUDGET) {
      fails.push(`${p.slug}: ${links.length} internal links in the page body (budget ${LINK_BUDGET}) — "do not overdo internal links"`);
    }
  }
}

// 6. Title tags.
//
// The rule that keeps these honest is that the title must be the page's own H1
// plus the brand, nothing else. It makes every title unique for free (the H1
// already names a product and a city), it makes keyword stuffing structurally
// impossible — there is no room to append a second phrase — and it means the
// search result promises exactly what the page's heading delivers.
//
// The single-separator check is not cosmetic. useDocumentMeta treats a title
// that already contains " | " as complete and does NOT append the brand, so a
// title with its own pipe renders one way in the prerendered HTML and a
// different way after hydration. Two pages here used to do that.
const TITLE_MAX = 62; // beyond this Google truncates in the result
const seenTitle = new Map();
if (existsSync(DIST)) {
  for (const p of CITY_PRODUCT_PAGES) {
    const file = join(DIST, p.slug, 'index.html');
    if (!existsSync(file)) continue;
    const raw = (readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const title = raw.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const want = `${p.h1} | Apex Trade Show`;
    if (title !== want) fails.push(`${p.slug}: title "${title}" != "${want}" (the H1 plus the brand)`);
    if ((title.match(/ \| /g) || []).length !== 1) {
      fails.push(`${p.slug}: title has ${(title.match(/ \| /g) || []).length} " | " separators — the client hook skips the brand on a title that already contains one, so the prerendered and hydrated titles would differ`);
    }
    if (title.length > TITLE_MAX) fails.push(`${p.slug}: title is ${title.length} chars (max ${TITLE_MAX}) and would be truncated`);
    if (seenTitle.has(title)) fails.push(`${p.slug}: shares its title with ${seenTitle.get(title)}`);
    else seenTitle.set(title, p.slug);
  }
}

// 7. Meta descriptions.
//
// Uniqueness as a string is the easy half and not the interesting one: two
// descriptions identical apart from the city name are technically unique and
// are still the find-and-replace pattern this pilot is not allowed to use. So
// the pair check runs with city names stripped, the same way the body copy is
// measured.
//
// The rest is content: every description has to name its city, say something
// about buying (this is a transactional page, not an article), and carry a real
// Apex benefit. Before this, none of the twelve mentioned a benefit at all.
const DESC_MIN = 120;
const DESC_MAX = 165;   // hard cap — audit-seo fails the build past this
const DESC_MAX_ALIKE = 60; // %, with city names removed
const BENEFIT = /free (artwork )?proof|ships? to|shipped to|one supplier/i;
const COMMERCE = /pricing|priced|price|order online|ordered online|buy|checkout/i;
{
  const descs = CITY_PRODUCT_PAGES.map((p) => ({
    slug: p.slug,
    citySlug: p.citySlug,
    group: p.group,
    text: p.description,
    plain: new Set(deplace(words(p.description)).split(' ').filter(Boolean))
  }));

  const seenDesc = new Map();
  for (const d of descs) {
    const city = SEO_CITIES.find((c) => c.slug === d.citySlug);
    if (d.text.length < DESC_MIN || d.text.length > DESC_MAX) {
      fails.push(`${d.slug}: description is ${d.text.length} chars (want ${DESC_MIN}-${DESC_MAX})`);
    }
    if (city && !d.text.includes(city.city)) fails.push(`${d.slug}: description never names ${city.city}`);
    if (!COMMERCE.test(d.text)) fails.push(`${d.slug}: description says nothing about price or ordering — this is a transactional page`);
    if (!BENEFIT.test(d.text)) fails.push(`${d.slug}: description carries no Apex benefit (free proof, shipping)`);
    if (seenDesc.has(d.text)) fails.push(`${d.slug}: identical description to ${seenDesc.get(d.text)}`);
    else seenDesc.set(d.text, d.slug);
  }

  // Pairwise, city names removed — catches the twin written by find-replace.
  for (let i = 0; i < descs.length; i++) {
    for (let j = i + 1; j < descs.length; j++) {
      const a = descs[i];
      const b = descs[j];
      let hits = 0;
      a.plain.forEach((w) => { if (b.plain.has(w)) hits++; });
      const alike = (hits / (a.plain.size + b.plain.size - hits)) * 100;
      if (alike > DESC_MAX_ALIKE) {
        fails.push(
          `${a.slug} and ${b.slug}: descriptions are ${alike.toFixed(0)}% the same words once city names are removed ` +
          `(max ${DESC_MAX_ALIKE}%)${a.group === b.group ? ' — one city\'s description with the name swapped' : ''}`
        );
      }
    }
  }
}

// 8. Headings.
//
// The instruction is "do not force the exact keyword into every heading", which
// is a ratio, not a rule about any single heading. So it is measured as one: the
// product phrase may appear in a couple of headings (the buying section and the
// product description legitimately name it) and the city in at most half, which
// leaves the rest to say something. A page whose eight H2s all read "Custom
// Canopy Tents in Los Angeles ..." is the failure this catches.
//
// The shipping heading is required because a transactional page that never says
// how the thing reaches the buyer has left out the part they came to find.
const H2_MIN = 6;
const H2_MAX = 10;
const PRODUCT_IN_H2_MAX = 3;
let headingChecked = 0;
if (existsSync(DIST)) {
  const decode = (t) => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  for (const p of CITY_PRODUCT_PAGES) {
    const file = join(DIST, p.slug, 'index.html');
    if (!existsSync(file)) continue;
    headingChecked++;
    const body = readFileSync(file, 'utf8').split('<nav aria-label="Primary">')[0];
    const h1s = body.match(/<h1[\s>]/g) || [];
    if (h1s.length !== 1) fails.push(`${p.slug}: ${h1s.length} H1s, expected exactly 1`);

    const h2 = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim()));
    if (h2.length < H2_MIN || h2.length > H2_MAX) {
      fails.push(`${p.slug}: ${h2.length} H2s (want ${H2_MIN}-${H2_MAX})`);
    }
    const city = SEO_CITIES.find((c) => c.slug === p.citySlug);
    const product = city ? p.h1.replace(new RegExp(` in ${city.city}$`), '') : p.h1;

    const withProduct = h2.filter((t) => t.includes(product)).length;
    if (withProduct > PRODUCT_IN_H2_MAX) {
      fails.push(`${p.slug}: "${product}" appears in ${withProduct} of ${h2.length} H2s (max ${PRODUCT_IN_H2_MAX}) — the keyword is being forced into the headings`);
    }
    if (city) {
      const withCity = h2.filter((t) => t.includes(city.city)).length;
      if (withCity > Math.ceil(h2.length / 2)) {
        fails.push(`${p.slug}: ${city.city} appears in ${withCity} of ${h2.length} H2s — over half, which reads as optimisation rather than structure`);
      }
    }
    if (!h2.some((t) => /shipping|getting .* to|ship/i.test(t))) {
      fails.push(`${p.slug}: no heading covers shipping — a buying page has to say how the product reaches the customer`);
    }
  }
}

// 9. FAQs.
//
// "Do NOT duplicate the exact same FAQ set across all 12 pages" is checked as
// no question repeating anywhere across the twelve, which is the stricter and
// more useful reading: one shared question is how a set starts converging.
//
// Two of the required subjects were missing from every page before this —
// artwork and shipping — which on a page whose job is completing a purchase are
// the two questions most likely to stop someone ordering.
//
// The schema count is checked against the visible count because an FAQPage
// block that claims questions the page does not show is the structured-data
// failure that gets manual actions, not just a mismatch.
const FAQ_MIN = 5;
const FAQ_CITY_MIN = 2;
{
  const seenQ = new Map();
  for (const p of CITY_PRODUCT_PAGES) {
    const city = SEO_CITIES.find((c) => c.slug === p.citySlug);
    if (p.faqs.length < FAQ_MIN) fails.push(`${p.slug}: ${p.faqs.length} FAQs (want at least ${FAQ_MIN})`);

    for (const f of p.faqs) {
      if (seenQ.has(f.q)) fails.push(`${p.slug}: FAQ "${f.q}" also appears on ${seenQ.get(f.q)} — the sets must not converge`);
      else seenQ.set(f.q, p.slug);
    }

    const blob = p.faqs.map((f) => `${f.q} ${f.a}`).join(' ');
    if (city) {
      const named = p.faqs.filter((f) => `${f.q} ${f.a}`.includes(city.city)).length;
      if (named < FAQ_CITY_MIN) {
        fails.push(`${p.slug}: only ${named} FAQ(s) mention ${city.city} (want ${FAQ_CITY_MIN}) — the set is generic to the product, not to the city`);
      }
    }
    if (!/artwork|PDF|JPEG/i.test(blob)) fails.push(`${p.slug}: no FAQ covers artwork — a buying page has to answer "can I upload my own file?"`);
    if (!/ship|deliver/i.test(blob)) fails.push(`${p.slug}: no FAQ covers shipping to the city`);

    // Visible FAQs and FAQPage schema are generated from the same array, so a
    // mismatch means the rendering diverged. Checked in the built HTML.
    const file = existsSync(DIST) ? join(DIST, p.slug, 'index.html') : null;
    if (file && existsSync(file)) {
      const html = readFileSync(file, 'utf8');
      const schemaCount = (html.match(/"@type":"Question"/g) || []).length;
      if (schemaCount !== p.faqs.length) {
        fails.push(`${p.slug}: FAQPage schema has ${schemaCount} questions, the page shows ${p.faqs.length}`);
      }
    }
  }
}

// 10. Structured data and breadcrumbs.
//
// These pages deliberately do NOT emit Product or Offer schema. Every product
// they sell already has a Product entity on its own /products/{slug} page, with
// an AggregateOffer built from the live pricing engine. Emitting a second
// Product for the same sku at a different URL is the conflicting duplicate the
// brief rules out, and it would be worse than useless: two entities for one
// product, with the city page's copy unable to state a single price because the
// price depends on the configuration.
//
// What they carry instead is the honest description of what the page is — an
// ItemList of the products, a BreadcrumbList of where it sits, and the FAQPage
// for the questions actually visible on it.
let schemaChecked = 0;
if (existsSync(DIST)) {
  const ldBlocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => { try { const j = JSON.parse(m[1]); return Array.isArray(j) ? j : [j]; } catch { return []; } });

  for (const p of CITY_PRODUCT_PAGES) {
    const file = join(DIST, p.slug, 'index.html');
    if (!existsSync(file)) continue;
    schemaChecked++;
    const html = readFileSync(file, 'utf8');
    const nodes = ldBlocks(html);
    const types = nodes.map((n) => n['@type']);

    for (const need of ['BreadcrumbList', 'ItemList', 'FAQPage']) {
      if (!types.includes(need)) fails.push(`${p.slug}: no ${need} schema`);
    }
    // Nothing invented, and nothing that fights the product pages.
    for (const banned of ['Product', 'Offer', 'AggregateOffer', 'Review', 'AggregateRating', 'LocalBusiness']) {
      if (types.includes(banned)) {
        fails.push(`${p.slug}: emits ${banned} schema — the product pages own the Product/Offer entity, and this page has no rating or premises to describe`);
      }
    }
    if (/"aggregateRating"|"reviewCount"|"ratingValue"/.test(html)) {
      fails.push(`${p.slug}: rating or review data in the structured data, which is not something this page has`);
    }

    // ItemList must name this page's actual products, and each must resolve.
    const list = nodes.find((n) => n['@type'] === 'ItemList');
    if (list) {
      const urls = (list.itemListElement || []).map((e) => e.url || (e.item && e.item['@id']) || '');
      const slugs = urls.map((u) => String(u).replace(/.*\/products\//, '').replace(/\/$/, ''));
      for (const s of slugs) {
        if (!existsSync(join(DIST, 'products', s, 'index.html'))) {
          fails.push(`${p.slug}: ItemList points at /products/${s}, which has no built page`);
        }
      }
      const missing = p.products.filter((s) => !slugs.includes(s));
      if (missing.length) fails.push(`${p.slug}: ItemList omits ${missing.join(', ')} — the schema must describe what the page sells`);
    }

    // Breadcrumb: the visible trail and the schema must be the same trail, and
    // it must pass through the city hub this page sits under.
    const crumb = nodes.find((n) => n['@type'] === 'BreadcrumbList');
    const nav = (html.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/) || [])[1] || '';
    if (!crumb) continue;
    const names = (crumb.itemListElement || []).map((e) => e.name);
    const visible = [...nav.matchAll(/>([^<>]+)</g)].map((m) => m[1].trim()).filter((t) => t && t !== '/');
    const decodeT = (t) => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    if (names.map(decodeT).join(' > ') !== visible.map(decodeT).join(' > ')) {
      fails.push(`${p.slug}: breadcrumb schema "${names.join(' > ')}" does not match the visible trail "${visible.join(' > ')}"`);
    }
    if (names[names.length - 1] !== p.h1) {
      fails.push(`${p.slug}: breadcrumb does not end at this page ("${names[names.length - 1]}")`);
    }
    const hub = `${ORIGIN}/trade-show-displays/${p.citySlug}`;
    if (!(crumb.itemListElement || []).some((e) => e.item === hub)) {
      fails.push(`${p.slug}: breadcrumb never passes through ${hub} — the trail should state the hierarchy the links do`);
    }
  }

  // The existing architecture must be intact: each product page still owns
  // exactly one Product entity. A city page that started emitting one would show
  // up above; this catches the other direction, a product page losing its own.
  for (const slug of [...new Set(CITY_PRODUCT_PAGES.flatMap((p) => p.products))]) {
    const f = join(DIST, 'products', slug, 'index.html');
    if (!existsSync(f)) { fails.push(`/products/${slug} has no built page`); continue; }
    const n = ldBlocks(readFileSync(f, 'utf8')).filter((x) => x['@type'] === 'Product').length;
    if (n !== 1) fails.push(`/products/${slug}: ${n} Product schema blocks, expected exactly 1`);
  }
}

// The client mirror has to agree with the prerendered HTML. React rewrites the
// canonical on hydration, so a component that let it default to the browser's
// pathname would hand a rendering crawler a different answer for /slug/ than
// for /slug.
{
  const src = readFileSync(join(ROOT, 'src', 'pages', 'CityProductPage.jsx'), 'utf8');
  const call = (src.match(/useDocumentMeta\(([\s\S]{0,400}?)\);/) || [])[1] || '';
  if (!/page\.slug/.test(call)) {
    fails.push('CityProductPage.jsx does not pin its canonical to the page slug — hydration could overwrite the prerendered canonical');
  }
}

if (warn.length) {
  console.warn('\n! CITY PRODUCT UNIQUENESS — approaching the limit:');
  warn.forEach((w) => console.warn(`  ! ${w}`));
}
if (fails.length) {
  console.error(`\n✗ CITY PRODUCT UNIQUENESS FAILED — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(
  `✓ CITY PRODUCT UNIQUENESS OK — ${pages.length} pages, ${pages.length * (pages.length - 1) / 2} pairs: ` +
  `worst overlap ${worstRaw.v.toFixed(1)}% (${(100 - worstRaw.v).toFixed(1)}% unique), and ` +
  `${worstPlain.v.toFixed(1)}% with city names stripped — no page is another with the city swapped.`
);
console.log(
  canonChecked
    ? `✓ CITY PRODUCT CANONICALS OK — ${canonChecked}/${CITY_PRODUCT_PAGES.length} built pages self-canonicalise, ` +
      'are indexable, and are listed once in the sitemaps — none consolidates into a national product page.'
    : '! CITY PRODUCT CANONICALS SKIPPED — no dist/ to read.'
);
if (canonChecked) {
  const cities = [...new Set(CITY_PRODUCT_PAGES.map((p) => p.citySlug))];
  console.log(
    `✓ CITY PRODUCT HIERARCHY OK — ${cities.length} city hubs link down to all ${CITY_PRODUCT_PAGES.length} ` +
    'product+city pages, and every one of them links back up to its /trade-show-displays/{city} hub.'
  );
  console.log(
    `✓ CITY PRODUCT NATIONAL LINKS OK — each page carries exactly one link to its national category page and no other, ` +
    `within a ${LINK_BUDGET}-link body budget.`
  );
  console.log(
    `✓ CITY PRODUCT TITLES OK — ${seenTitle.size} unique titles, each its page's own H1 plus the brand, ` +
    `all within ${TITLE_MAX} characters and carrying one separator.`
  );
}
console.log(
  `✓ CITY PRODUCT DESCRIPTIONS OK — ${CITY_PRODUCT_PAGES.length} unique meta descriptions, each naming its city, ` +
  `its price/order path and a real Apex benefit, and none is another with the city swapped.`
);
if (schemaChecked) {
  console.log(
    `✓ CITY PRODUCT SCHEMA OK — ${schemaChecked} pages carry BreadcrumbList + ItemList + FAQPage and no Product, Offer, ` +
    'rating or review data; the breadcrumb matches the visible trail and passes through the city hub; the product pages still own one Product each.'
  );
}
console.log(
  `✓ CITY PRODUCT FAQS OK — ${CITY_PRODUCT_PAGES.reduce((n, p) => n + p.faqs.length, 0)} questions across ` +
  `${CITY_PRODUCT_PAGES.length} pages, none repeated anywhere, each page naming its city and answering artwork and shipping.`
);
if (headingChecked) {
  console.log(
    `✓ CITY PRODUCT HEADINGS OK — ${headingChecked} pages: one H1 each, ${H2_MIN}-${H2_MAX} H2s, the product phrase in at most ` +
    `${PRODUCT_IN_H2_MAX} of them and the city in no more than half, and every page covers shipping.`
  );
}

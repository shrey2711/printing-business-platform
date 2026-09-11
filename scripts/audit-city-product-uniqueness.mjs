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
    const links = [...body.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, '') || '/');
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
}

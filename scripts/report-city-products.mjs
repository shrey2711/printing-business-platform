// The section-29 report, generated from the data rather than transcribed.
//
// Every column here is read from the source of truth or the built artifact, so
// the report cannot drift from the site the way a hand-written one does.
//
//   node scripts/report-city-products.mjs [--json]
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CITY_PRODUCT_PAGES, nationalCategoryFor } from '../src/data/cityProductPages.js';
import { SEO_CITIES } from '../src/data/citySeo.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.apextradeshow.com';
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const body = (html) => {
  const i = html.indexOf('<div id="seo-prerender">');
  return html.slice(i === -1 ? 0 : i).split('<nav aria-label="Primary">')[0];
};

const report = CITY_PRODUCT_PAGES.map((p) => {
  const file = join(DIST, p.slug, 'index.html');
  const html = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const b = body(html);
  const nat = nationalCategoryFor(p.group);
  const city = SEO_CITIES.find((c) => c.slug === p.citySlug);

  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => { try { const j = JSON.parse(m[1]); return Array.isArray(j) ? j : [j]; } catch { return []; } })
    .map((n) => n['@type'])
    .filter((t) => !['WebSite', 'OnlineStore'].includes(t));

  const links = [...new Set([...b.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, '') || '/'))]
    .filter((l) => l !== '/');

  const editorialWords = [p.productIntro, p.intro, ...p.local.map((l) => `${l.h2} ${l.p}`), ...p.faqs.map((f) => `${f.q} ${f.a}`)]
    .join(' ').split(/\s+/).filter(Boolean).length;

  return {
    url: `${ORIGIN}/${p.slug}`,
    slug: p.slug,
    city: city ? `${city.city}, ${city.abbr}` : p.citySlug,
    primary: p.primary,
    secondary: p.secondary || [],
    products: p.products,
    nationalCategory: nat ? nat.to : null,
    cityHub: `/trade-show-displays/${p.citySlug}`,
    canonical: decode((html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || ''),
    title: decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''),
    description: p.description,
    h1: p.h1,
    h2s: [...b.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, '').trim())),
    links,
    schema,
    faqs: p.faqs.length,
    words: editorialWords,
    indexable: !/<meta name="robots"[^>]*noindex/i.test(html),
    inSitemap: existsSync(join(DIST, 'sitemap-categories.xml'))
      && readFileSync(join(DIST, 'sitemap-categories.xml'), 'utf8').includes(`${ORIGIN}/${p.slug}<`)
  };
});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const r of report) {
    console.log(`\n${'='.repeat(78)}\n${r.url}`);
    console.log(`  primary     ${r.primary}`);
    console.log(`  secondary   ${r.secondary.join(' | ')}`);
    console.log(`  products    ${r.products.join(', ')}`);
    console.log(`  canonical   ${r.canonical}`);
    console.log(`  title       ${r.title} (${r.title.length})`);
    console.log(`  description ${r.description} (${r.description.length})`);
    console.log(`  h1          ${r.h1}`);
    console.log(`  h2s         ${r.h2s.length}: ${r.h2s.join(' · ')}`);
    console.log(`  links       ${r.links.length}: ${r.links.join(' ')}`);
    console.log(`  schema      ${r.schema.join(', ')}`);
    console.log(`  faqs        ${r.faqs}   words ${r.words}`);
    console.log(`  indexable   ${r.indexable}   sitemap ${r.inSitemap}`);
  }
  console.log(`\n${report.length} pages reported.`);
}

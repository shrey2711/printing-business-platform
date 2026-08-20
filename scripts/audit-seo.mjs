// Offline SEO audit of the built dist/ output. Enumerates every sitemap URL,
// maps it to its prerendered HTML, and checks the invariants from the SEO
// acceptance criteria. Exits non-zero on CRITICAL defects; WARNINGS are reported
// but do not fail the build. Run after `npm run build`:  npm run audit:seo
//
// Network-dependent checks (live HTTP status, real 3xx redirects, unknown-route
// 404, Lighthouse) are intentionally out of scope here — this audits the static
// artifact deterministically. See the printed note for the live-crawl command.
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { KNOWN_ROUTES } from '../src/generated/routes.js';
import { redirects } from '../src/generated/redirects.js';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const ORIGIN = 'https://www.apextradeshow.com';
const PRIVATE = ['/login', '/register', '/account', '/cart', '/checkout', '/order', '/admin', '/forgot-password', '/reset-password'];
const redirectSources = new Set((redirects || []).map((r) => r.source));

const crit = [];
const warn = [];
const fail = (page, msg) => crit.push(`${page}  ✗ ${msg}`);
const warning = (page, msg) => warn.push(`${page}  ⚠ ${msg}`);

const fileFor = (path) => (path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html'));
// Decoded length — search engines count the rendered characters, so &amp; is one
// char, not five. Measuring the raw HTML would over-count titles/descriptions.
const decodeEntities = (s) =>
  String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const dlen = (s) => decodeEntities(s).length;
const count = (html, re) => (html.match(re) || []).length;
const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

// ---- Enumerate sitemap URLs -------------------------------------------------
const SM_FILES = ['sitemap-pages', 'sitemap-categories', 'sitemap-products', 'sitemap-blog', 'sitemap-locations'];
const sitemapPaths = [];
for (const sm of SM_FILES) {
  const f = join(DIST, `${sm}.xml`);
  if (!existsSync(f)) { fail(sm, 'sitemap file missing'); continue; }
  const xml = readFileSync(f, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapPaths.push({ sm, path: m[1].replace(ORIGIN, '') || '/', hasLastmod: false });
  }
  // lastmod presence per URL (paired with loc order).
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((u) => u[1]);
  urls.forEach((u) => {
    const loc = (u.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (loc) {
      const rec = sitemapPaths.find((p) => p.path === (loc.replace(ORIGIN, '') || '/'));
      if (rec && /<lastmod>\d{4}-\d{2}-\d{2}/.test(u)) rec.hasLastmod = true;
    }
  });
}

// ---- Per-page checks --------------------------------------------------------
const titles = new Map();
const descs = new Map();
// Specific known-bad brand/placeholder strings. (Generic words like "placeholder"
// are avoided — the template carries a legit dev comment "brand name is a
// placeholder"; comments are stripped before this test regardless.)
const BRAND_BAD = /Canopy Tent Co\b|Summit Ridge|\blorem ipsum\b|\bAcme\b/i;

for (const { path, hasLastmod } of sitemapPaths) {
  const file = fileFor(path);
  if (!existsSync(file)) { fail(path, 'sitemap URL has no prerendered HTML (would 404)'); continue; }
  const html = readFileSync(file, 'utf8');

  // Exactly one of each head tag.
  const one = [
    ['<title>', /<title>/g],
    ['meta description', /<meta name="description"/g],
    ['og:title', /<meta property="og:title"/g],
    ['og:description', /<meta property="og:description"/g],
    ['canonical', /<link rel="canonical"/g],
    ['<h1>', /<h1[\s>]/g]
  ];
  for (const [name, re] of one) {
    const n = count(html, re);
    if (n !== 1) fail(path, `expected exactly one ${name}, found ${n}`);
  }

  // Self-canonical.
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  if (canonical && canonical !== ORIGIN + path) fail(path, `canonical "${canonical}" != self "${ORIGIN + path}"`);

  // lang + indexability.
  if (!/<html[^>]*\slang="en"/.test(html)) fail(path, 'missing lang="en"');
  if (/<meta name="robots"[^>]*noindex/i.test(html)) fail(path, 'sitemap URL is noindex');

  // Malformed / nested meta (a tag opening inside an attribute value).
  if (/content="[^"]*<(meta|title|link|script|\/)/i.test(html)) fail(path, 'malformed/nested tag inside a content="" attribute');

  // JSON-LD parses.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(path, 'invalid JSON-LD block'); }
  }

  // Placeholder brand / stale strings (ignore HTML comments — the template has a
  // legitimate "brand name is a placeholder" dev note).
  if (BRAND_BAD.test(html.replace(/<!--[\s\S]*?-->/g, ''))) fail(path, 'placeholder/wrong brand string present');

  // OG image must be present + absolute https.
  const og = attr(html, /<meta property="og:image" content="([^"]*)"/);
  if (!og) fail(path, 'missing og:image');
  else {
    if (!/^https:\/\//.test(og)) fail(path, `og:image not absolute https: ${og}`);
    if (/\.svg(\?|$)/i.test(og)) warning(path, 'og:image is the generic SVG (Phase 11: needs route-specific raster)');
  }

  // lastmod present.
  if (!hasLastmod) warning(path, 'sitemap entry has no <lastmod>');

  // Title / description length + presence + uniqueness.
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!title) fail(path, 'empty <title>');
  else {
    if (dlen(title) > 62) warning(path, `title ${dlen(title)} chars (>60): ${title.slice(0, 70)}…`);
    if (titles.has(title)) warning(path, `duplicate title (also ${titles.get(title)})`); else titles.set(title, path);
  }
  if (!desc) fail(path, 'empty meta description');
  else {
    if (dlen(desc) > 165) warning(path, `description ${dlen(desc)} chars (>160)`);
    if (descs.has(desc)) warning(path, `duplicate description (also ${descs.get(desc)})`); else descs.set(desc, path);
  }

  // Repeated punctuation in prerendered body text (e.g. "additional..", "quote..").
  const body = (html.match(/<div id="seo-prerender">([\s\S]*?)<\/div>\s*<\/div>/) || [])[1] || html;
  const textOnly = body.replace(/<[^>]+>/g, ' ');
  if (/[a-z]\.\.(?!\.)/i.test(textOnly) || /,,/.test(textOnly) || /\s[,.]\s[,.]/.test(textOnly)) {
    warning(path, 'repeated punctuation in visible text (Phase 4 cleanup)');
  }

  // Internal links resolve (no broken links, no links through redirects). Static
  // assets (a path with a file extension, or /assets/*) are checked as files, not
  // routes; everything else must be a known route or a prerendered page.
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1].split('?')[0].replace(/\/$/, '') || '/';
    if (/\.[a-z0-9]{2,5}$/i.test(href) || href.startsWith('/assets')) {
      if (!existsSync(join(DIST, href))) fail(path, `internal link to missing asset: ${href}`);
      continue;
    }
    if (redirectSources.has(href)) fail(path, `internal link to a redirect source: ${href}`);
    if (!KNOWN_ROUTES.has(href) && !existsSync(fileFor(href))) fail(path, `internal link to unknown/broken route: ${href}`);
  }
}

// ---- Global checks ----------------------------------------------------------
for (const p of PRIVATE) {
  if (sitemapPaths.some((x) => x.path === p)) fail(p, 'private/transactional route present in a sitemap');
}

// ---- Report -----------------------------------------------------------------
console.log(`\nSEO audit — ${sitemapPaths.length} sitemap URLs, ${titles.size} unique titles, ${descs.size} unique descriptions.`);
if (warn.length) {
  console.log(`\n${warn.length} warning(s):`);
  // Collapse repetitive OG/lastmod warnings to a count so the report stays legible.
  const byKind = {};
  for (const w of warn) {
    let k = w.split('  ⚠ ')[1].split(':')[0].split('(')[0].trim();
    k = k.replace(/^title \d+ chars.*/, 'title too long (>60)').replace(/^description \d+ chars.*/, 'description too long (>160)');
    byKind[k] = (byKind[k] || 0) + 1;
  }
  for (const [k, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`  ⚠ ${n}× ${k}`);
}
if (crit.length) {
  console.error(`\n✗ SEO AUDIT FAILED — ${crit.length} critical defect(s):`);
  for (const c of crit.slice(0, 60)) console.error('  ' + c);
  if (crit.length > 60) console.error(`  …and ${crit.length - 60} more`);
  console.error('\nNote: live checks (HTTP status, real 3xx, unknown-route 404, Lighthouse) run against the deploy, not this static audit.');
  process.exit(1);
}
console.log('\n✓ SEO AUDIT PASSED — no critical defects (exactly one head tag each, self-canonical, lang, indexable, valid JSON-LD, no nested meta, no placeholder brand, no broken/redirected internal links, no private route in sitemaps).');
console.log('Live-only checks to run against the deploy: HTTP 200 per URL, single-hop redirects, unknown-route 404, Lighthouse.');

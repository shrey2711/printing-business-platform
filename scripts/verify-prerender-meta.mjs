// Regression test for the prerender metadata-corruption bug.
//
// Root cause: render() used `html.replace(re, `$1${value}$2`)`. A value such as
// "from $140." made String.replace read "$1" as capture-group 1 (the tag prefix)
// plus "40", producing `content="<meta name="description" content="40."`. The fix
// (scripts/lib/seo-meta.mjs) uses function replacers. This test proves dollar
// amounts can never corrupt the tags, and that exactly one of each head tag
// survives a replacement.
import { applyMeta } from './lib/seo-meta.mjs';

// Minimal head matching the real index.html tags applyMeta targets.
const TEMPLATE = `<!doctype html><html lang="en"><head>
<title>PLACEHOLDER</title>
<meta name="description" content="PLACEHOLDER" />
<link rel="canonical" href="https://x/" />
<meta property="og:title" content="PLACEHOLDER" />
<meta property="og:url" content="https://x/" />
<meta property="og:description" content="PLACEHOLDER" />
</head><body></body></html>`;

const AMOUNTS = ['$65', '$140', '$199', '$510', '$1,375', '$1,635'];
const count = (h, re) => (h.match(re) || []).length;
const errors = [];
let checked = 0;
const eq = (label, got, want) => { checked++; if (got !== want) errors.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };

for (const amt of AMOUNTS) {
  const description = `Custom feather flags from ${amt}. Single or double sided.`;
  const title = `Flags from ${amt} | Apex Trade Show`;
  const html = applyMeta(TEMPLATE, {
    title,
    description,
    canonical: 'https://www.apextradeshow.com/products/feather-angled-flag',
    url: 'https://www.apextradeshow.com/products/feather-angled-flag'
  });

  // 1. The dollar amount survives INTACT in both description tags.
  const descTag = html.match(/<meta name="description" content="([^"]*)"/);
  const ogDescTag = html.match(/<meta property="og:description" content="([^"]*)"/);
  eq(`${amt} description content`, descTag && descTag[1], description);
  eq(`${amt} og:description content`, ogDescTag && ogDescTag[1], description);
  eq(`${amt} title content`, (html.match(/<title>([^<]*)<\/title>/) || [])[1], title);

  // 2. No corruption: a nested tag must NEVER appear inside an attribute value.
  if (/content="[^"]*<meta/.test(html)) errors.push(`${amt}: nested <meta inside content=""`);
  if (/content="[^"]*<\/?(title|link)/.test(html)) errors.push(`${amt}: nested tag inside content=""`);

  // 3. Exactly one of each head tag remains (no duplication from the replace).
  eq(`${amt} one <title>`, count(html, /<title>/g), 1);
  eq(`${amt} one description`, count(html, /<meta name="description"/g), 1);
  eq(`${amt} one og:title`, count(html, /<meta property="og:title"/g), 1);
  eq(`${amt} one og:description`, count(html, /<meta property="og:description"/g), 1);
  eq(`${amt} one canonical`, count(html, /<link rel="canonical"/g), 1);
}

// HTML-special characters in a value are escaped, not injected.
const evil = applyMeta(TEMPLATE, { description: 'A & B <script> "quote" from $99' });
if (/content="[^"]*<script/.test(evil)) errors.push('unescaped <script> in description');
eq('escaped ampersand', /content="A &amp; B/.test(evil), true);

if (errors.length) {
  console.error(`✗ PRERENDER META FAILED (${errors.length}):\n  ` + errors.slice(0, 40).join('\n  '));
  process.exit(1);
}
console.log(`✓ PRERENDER META OK — ${checked} assertions across ${AMOUNTS.length} dollar amounts; no $-corruption, no nested tags, exactly one of each head tag, values escaped.`);

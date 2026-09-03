// Proves the prerenderer consumes every SEO field an editor can set.
//
// Section 5 lists eleven fields. A claim that "the prerenderer consumes these"
// is worth nothing unless each one is shown changing the emitted HTML, so this
// runs the real prerenderer against a seeded override and inspects the output.
//
// Run: node scripts/test-seo-manager.mjs
//
// It works by writing a fixture the prerenderer reads instead of Supabase, then
// building one page and asserting on the file. No network, no database.

import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURE = join(ROOT, '.seo-override-fixture.json');
const PAGE = join(ROOT, 'dist', 'custom-canopies', 'index.html');

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try {
    const problem = fn();
    if (problem) fails.push(`${name}: ${problem}`);
  } catch (e) {
    fails.push(`${name}: threw ${e.message}`);
  }
};

const OVERRIDE = {
  '/custom-canopies': {
    path: '/custom-canopies',
    title: 'FIXTURE SEO TITLE',
    description: 'FIXTURE META DESCRIPTION.',
    h1: 'FIXTURE H1',
    canonical: 'https://www.apextradeshow.com/fixture-canonical',
    og_title: 'FIXTURE OG TITLE',
    og_description: 'FIXTURE OG DESCRIPTION.',
    og_image_path: '/images/tents/10x10-1wall.webp',
    breadcrumb_title: 'FIXTURE CRUMB',
    schema_type: 'CollectionPage',
    robots: 'noindex, follow',
    faq_schema: [
      { question: 'FIXTURE QUESTION?', answer: 'FIXTURE ANSWER.' },
      // Attempts to close the JSON-LD block and start executable markup.
      { question: 'BREAKOUT</script><script>window.__pwned=1</script>', answer: 'and <!--' }
    ]
  }
};

writeFileSync(FIXTURE, JSON.stringify(OVERRIDE));
let html = '';
try {
  // vite build FIRST, then prerender. prerender reads dist/index.html as its
  // template, so running it against an already-prerendered file would make every
  // page inherit the home page's body. Both are invoked through node directly:
  // spawning npm.cmd fails with EINVAL on Windows.
  const env = { ...process.env, SEO_OVERRIDE_FIXTURE: FIXTURE };
  execFileSync('node', [join('node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: ROOT, env, stdio: 'pipe' });
  execFileSync('node', [join('scripts', 'prerender.mjs')], { cwd: ROOT, env, stdio: 'pipe' });
  if (!existsSync(PAGE)) throw new Error('the page was not written');
  html = readFileSync(PAGE, 'utf8');
} catch (e) {
  console.error(`✗ SEO MANAGER FAILED — could not prerender: ${e.message}`);
  rmSync(FIXTURE, { force: true });
  process.exit(1);
}

const has = (needle) => html.includes(needle);

check('SEO title reaches <title>', () =>
  /<title>FIXTURE SEO TITLE<\/title>/.test(html) ? null : 'title tag not overridden');

check('meta description reaches the description tag', () =>
  /<meta name="description" content="FIXTURE META DESCRIPTION\."/.test(html) ? null : 'description not overridden');

check('H1 reaches the rendered body', () => {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) return 'no h1 in the page';
  return m[1].includes('FIXTURE H1') ? null : `h1 is "${m[1].slice(0, 60)}"`;
});

check('the page still has exactly one H1', () => {
  const n = (html.match(/<h1[\s>]/g) || []).length;
  return n === 1 ? null : `${n} h1 tags`;
});

check('canonical reaches the link tag', () =>
  has('href="https://www.apextradeshow.com/fixture-canonical"') ? null : 'canonical not overridden');

check('OG title overrides independently of the SEO title', () =>
  /<meta property="og:title" content="FIXTURE OG TITLE"/.test(html) ? null : 'og:title not overridden');

check('OG description overrides independently of the meta description', () =>
  /<meta property="og:description" content="FIXTURE OG DESCRIPTION\."/.test(html) ? null : 'og:description not overridden');

check('OG image reaches og:image as an absolute URL', () =>
  /<meta property="og:image" content="https?:\/\/[^"]*10x10-1wall\.webp"/.test(html) ? null : 'og:image not overridden');

check('breadcrumb title replaces the last crumb only', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const crumbs = blocks
    .map((b) => { try { return JSON.parse(b); } catch { return null; } })
    .flatMap((j) => (Array.isArray(j) ? j : [j]))
    .filter((n) => n && n['@type'] === 'BreadcrumbList');
  if (!crumbs.length) return 'no BreadcrumbList in the page';
  const list = crumbs[0].itemListElement;
  const last = list[list.length - 1];
  if (last.name !== 'FIXTURE CRUMB') return `last crumb is "${last.name}"`;
  if (list.length > 1 && list[0].name === 'FIXTURE CRUMB') return 'it overwrote an ancestor crumb too';
  return null;
});

check('JSON-LD type is relabelled without discarding the rest of the node', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const parsed = blocks.map((b) => { try { return JSON.parse(b); } catch { return null; } }).filter(Boolean);
  const flat = parsed.flatMap((j) => (Array.isArray(j) ? j : [j]));
  const page = flat.find((n) => n && n['@type'] === 'CollectionPage');
  if (!page) return `schema_type not applied; types present: ${flat.map((n) => n && n['@type']).join(', ')}`;
  if (Object.keys(page).length < 3) return 'the node was replaced rather than relabelled';
  return null;
});

check('FAQ schema is emitted as FAQPage', () => {
  if (!has('"FAQPage"')) return 'no FAQPage block';
  if (!has('FIXTURE QUESTION?')) return 'the question is missing';
  if (!has('FIXTURE ANSWER.')) return 'the answer is missing';
  return null;
});

check('noindex reaches the robots tag', () =>
  /<meta name="robots" content="noindex, follow">/.test(html) ? null : 'robots not overridden');

check('every JSON-LD block on the page is still valid JSON', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) return 'no structured data at all';
  for (const b of blocks) {
    try { JSON.parse(b); } catch (e) { return `invalid JSON-LD: ${e.message}`; }
  }
  return null;
});

check('editor text cannot break out of the JSON-LD block', () => {
  // The payload must survive as DATA, never as markup. If "</script>" reached
  // the output literally, the HTML parser would end the block there and treat
  // the rest as executable.
  if (/<script>window\.__pwned/.test(html)) return 'the payload became a real script element';
  if (html.includes('BREAKOUT</script>')) return 'an unescaped </script> reached the page';
  if (!html.includes('BREAKOUT')) return 'the payload vanished; the test is no longer exercising this';

  // Exactly the script elements the page is supposed to have.
  const opens = (html.match(/<script/g) || []).length;
  const closes = (html.match(/<\/script>/g) || []).length;
  if (opens !== closes) return `unbalanced script tags: ${opens} open, ${closes} close`;
  return null;
});

check('the escaped payload is still valid JSON-LD carrying the original text', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const faq = blocks
    .map((b) => { try { return JSON.parse(b); } catch { return null; } })
    .find((j) => j && j['@type'] === 'FAQPage');
  if (!faq) return 'no parseable FAQPage block';
  const q = faq.mainEntity.map((e) => e.name).join(' ');
  // Escaping must be reversible: a consumer parsing the JSON sees the real text.
  return q.includes('BREAKOUT</script>') ? null : 'the escaped text did not decode back to the original';
});

rmSync(FIXTURE, { force: true });

// Rebuild without the fixture. This test is the only thing that writes fixture
// values into dist/, and leaving them there means the next person to look at a
// built page — or to upload dist/ by hand — sees test data.
try {
  execFileSync('node', [join('node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: ROOT, stdio: 'pipe' });
  execFileSync('node', [join('scripts', 'prerender.mjs')], { cwd: ROOT, stdio: 'pipe' });
} catch (e) {
  console.error('! could not restore dist/ after the test — run \"npm run build\".');
}

if (fails.length) {
  console.error(`\n✗ SEO MANAGER FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\nRe-run "npm run build" to restore the pages without the fixture.');
  process.exit(1);
}
console.log(`✓ SEO MANAGER OK — ${ran} assertions: all 11 editable SEO fields reach the prerendered HTML, and the page keeps one H1 with valid structured data.`);

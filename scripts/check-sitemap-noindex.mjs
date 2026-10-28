// Asserts that no URL listed in the sitemaps is noindexed.
//
//   npm run build && npm run check:sitemap-noindex                 (static + headless)
//   npm run check:sitemap-noindex -- --static                       (static only)
//   npm run check:sitemap-noindex -- --require-browser              (fail if no browser)
//   npm run check:sitemap-noindex -- --only=^/trade-show-displays/  (subset, regex on path)
//
// For every <loc> in dist/sitemap-*.xml:
//   1. static  - the prerendered dist/<path>/index.html has no robots/googlebot
//                meta containing "noindex"; vercel.json sends no X-Robots-Tag
//                noindex header for it; and, for location pages, the shared rule
//                in src/data/indexability.js (what the React page will set on
//                hydration) says indexable.
//   2. headless - serves dist/ the way Vercel does (scripts/serve-dist.mjs
//                semantics), opens the URL in headless Chromium (Playwright),
//                waits for the React app to hydrate, and reads the robots meta
//                the client actually ends up with. Skipped with a notice if no
//                browser can be launched (unless --require-browser).
//
// Standalone on purpose: it is NOT part of `npm test` or any CI workflow.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { locationRobotsFor } from '../src/data/indexability.js';

const DIST = join(process.cwd(), 'dist');
const args = new Set(process.argv.slice(2));
const STATIC_ONLY = args.has('--static');
const REQUIRE_BROWSER = args.has('--require-browser');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);

if (!existsSync(join(DIST, 'sitemap.xml'))) {
  console.error('✗ dist/sitemap.xml not found. Run `npm run build` first.');
  process.exit(1);
}
const urls = [];
for (const f of readdirSync(DIST).filter((n) => /^sitemap-.*\.xml$/.test(n)).sort()) {
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(new URL(m[1]).pathname);
}
if (ONLY) urls.splice(0, urls.length, ...urls.filter((u) => new RegExp(ONLY).test(u)));
const fails = [];
const NOINDEX = /noindex/i;

// ---- 1. static ----
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const headerRules = (vercel.headers || []).filter((h) => (h.headers || []).some((x) => /^x-robots-tag$/i.test(x.key) && NOINDEX.test(x.value)));
const toRe = (src) => new RegExp(`^${src.replace(/\(\.\*\)/g, '.*').replace(/:\w+\*/g, '.*').replace(/:\w+/g, '[^/]+')}$`);
for (const u of urls) {
  const file = u === '/' ? join(DIST, 'index.html') : join(DIST, u, 'index.html');
  if (!existsSync(file)) { fails.push(`${u}: no prerendered file ${file}`); continue; }
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<meta\s+name="(robots|googlebot)"\s+content="([^"]*)"/gi)) {
    if (NOINDEX.test(m[2])) fails.push(`${u}: prerendered <meta name="${m[1]}" content="${m[2]}">`);
  }
  for (const h of headerRules) if (toRe(h.source).test(u)) fails.push(`${u}: vercel.json X-Robots-Tag noindex header (${h.source})`);
  const rule = locationRobotsFor(u);
  if (rule && NOINDEX.test(rule)) fails.push(`${u}: src/data/indexability.js would set robots "${rule}" on hydration`);
}
console.log(`static: ${urls.length} sitemap URLs checked (prerendered meta, vercel.json headers, shared location rule).`);

// ---- 2. headless ----
let headless = 'skipped (--static)';
if (!STATIC_ONLY) {
  let chromium = null;
  try { ({ chromium } = await import('playwright')); } catch { chromium = null; }
  let browser = null;
  const launchErrors = [];
  if (chromium) {
    for (const opts of [{}, { channel: 'chrome' }, { channel: 'chromium' }]) {
      try { browser = await chromium.launch(opts); break; } catch (e) { launchErrors.push(String(e.message || e).split('\n')[0]); }
    }
  } else launchErrors.push('playwright is not installed');
  if (!browser) {
    headless = `skipped — no browser could be launched (${launchErrors.join('; ')}). Install one with \`npx playwright install chromium\`.`;
    if (REQUIRE_BROWSER) fails.push(`headless: ${headless}`);
  } else {
    const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
    const isFile = (p) => stat(p).then((s) => s.isFile()).catch(() => false);
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
      let file = join(DIST, safe);
      if (!(await isFile(file))) file = join(DIST, safe, 'index.html');
      if (!(await isFile(file))) {
        if (path.startsWith('/api/')) { res.writeHead(503); return res.end('no api'); }
        file = join(DIST, 'index.html');
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const ctx = await browser.newContext();
    // Images, fonts and third-party scripts do not affect robots; skip them for speed.
    await ctx.route('**/*', (route) => {
      const r = route.request();
      if (!r.url().startsWith(base) || ['image', 'font', 'media'].includes(r.resourceType())) return route.abort();
      return route.continue();
    });
    const page = await ctx.newPage();
    let hydrated = 0;
    for (const u of urls) {
      try {
        await page.goto(base + u, { waitUntil: 'load', timeout: 30000 });
        // React replaces #seo-prerender on hydration; wait for that, then a beat
        // for effects (useDocumentMeta) to run.
        const ok = await page.waitForFunction(() => !document.getElementById('seo-prerender'), null, { timeout: 15000 }).then(() => true).catch(() => false);
        if (ok) hydrated++;
        await page.waitForTimeout(300);
        const metas = await page.$$eval('meta[name="robots"], meta[name="googlebot"]', (els) => els.map((e) => `${e.getAttribute('name')}=${e.getAttribute('content')}`));
        for (const m of metas) if (NOINDEX.test(m)) fails.push(`${u}: after hydration ${m}`);
        if (!ok) fails.push(`${u}: did not hydrate within 15s (client robots not verified)`);
      } catch (e) {
        fails.push(`${u}: headless load failed: ${String(e.message || e).split('\n')[0]}`);
      }
    }
    await browser.close();
    server.close();
    headless = `${urls.length} URLs rendered in headless Chromium, ${hydrated} hydrated.`;
  }
}
console.log(`headless: ${headless}`);

if (fails.length) {
  console.error(`\n✗ SITEMAP NOINDEX CHECK FAILED — ${fails.length} issue(s):`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\n✓ SITEMAP NOINDEX OK — none of the ${urls.length} sitemap URLs is noindexed.`);

// Performance budget for the homepage's first load. Follows dist/index.html's
// entry <script>/<link> and every chunk they import statically (what the
// browser must fetch before first render), gzips each, and fails above budget.
// Lazy route chunks are not counted here; they are reported against their
// own per-chunk limit. See docs/UI_REVAMP_PLAN.md §2.
//
//   node scripts/check-budget.mjs [distDir]
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = process.argv[2] || 'dist';
const BUDGET = { total: 100 * 1024, css: 15 * 1024, chunk: 30 * 1024 };
// Lazy chunks allowed past the per-chunk limit, with why. Shrinking these is
// tracked in the revamp plan; the list must only get shorter.
const CHUNK_EXEMPT = /^(supabase|cityProductPages|CityCategoryPage|CityPage|InfoPage|AdminPage)-/;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`check-budget: ${DIST}/index.html not found — run the build first.`);
  process.exit(1);
}

const gz = (file) => gzipSync(readFileSync(join(DIST, file)), { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const queue = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
const seen = new Set();
let total = 0;
let css = 0;
const rows = [];
while (queue.length) {
  const file = queue.shift();
  if (seen.has(file)) continue;
  seen.add(file);
  const size = gz(file);
  total += size;
  if (file.endsWith('.css')) css += size;
  rows.push([file, size]);
  if (file.endsWith('.js')) {
    const src = readFileSync(join(DIST, file), 'utf8');
    // Static imports only: `import{..}from"./x.js"` and `import"./x.js"`.
    for (const m of src.matchAll(/\bimport\s*(?:[\w$*{}\s,]+from\s*)?["']\.\/([^"']+\.js)["']/g)) queue.push(`assets/${m[1]}`);
  }
}

// Preloaded fonts are fetched on the critical path too. woff2 is already
// compressed, so it is counted at its file size, not gzipped again.
let fonts = 0;
for (const tag of html.match(/<link\b[^>]*>/g) || []) {
  if (!/rel="preload"/.test(tag) || !/as="font"/.test(tag)) continue;
  const href = (tag.match(/href="\/([^"]+)"/) || [])[1];
  if (!href) continue;
  const size = statSync(join(DIST, href)).size;
  fonts += size;
  total += size;
  rows.push([href, size]);
}

console.log('Homepage critical path (gzip):');
for (const [f, s] of rows) console.log(`  ${kb(s).padStart(9)}  ${f}`);
console.log(`  ${kb(total).padStart(9)}  TOTAL (budget ${kb(BUDGET.total)}), CSS ${kb(css)} (budget ${kb(BUDGET.css)}), fonts ${kb(fonts)}`);

const failures = [];
if (total > BUDGET.total) failures.push(`first load ${kb(total)} > ${kb(BUDGET.total)}`);
if (css > BUDGET.css) failures.push(`CSS ${kb(css)} > ${kb(BUDGET.css)}`);

for (const f of readdirSync(join(DIST, 'assets'))) {
  if (!/\.(js|css)$/.test(f) || seen.has(`assets/${f}`) || CHUNK_EXEMPT.test(f)) continue;
  const size = gz(`assets/${f}`);
  if (size > BUDGET.chunk) failures.push(`lazy chunk ${f} ${kb(size)} > ${kb(BUDGET.chunk)}`);
}

if (failures.length) {
  console.error('\nBudget exceeded:\n  ' + failures.join('\n  '));
  process.exit(1);
}
console.log('Budget OK');

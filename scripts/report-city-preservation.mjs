// §24 preservation report — how much of a city page's existing copy survived an
// editing pass, so a rollout can be checked for unnecessary rewriting.
//
// Not a gate: rewriting is sometimes required (a false claim, a duplicated
// paragraph, a discontinued event). This reports the ratio so the rewriting
// that did happen can be justified case by case.
//
// Usage: node scripts/report-city-preservation.mjs [baseline-git-ref]
//        (default baseline: the commit before the city rollout began)

import { execFileSync } from 'child_process';
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { pathToFileURL } from 'url';

const ref = process.argv[2] || '07df2f7';
const FILE = 'src/data/cityDetail.js';

const baselineSource = execFileSync('git', ['show', `${ref}:${FILE}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const dir = mkdtempSync(join(tmpdir(), 'city-baseline-'));
const baselinePath = join(dir, 'cityDetail.baseline.mjs');
writeFileSync(baselinePath, baselineSource);

const [now, base] = await Promise.all([
  import(pathToFileURL('src/data/cityDetail.js').href),
  import(pathToFileURL(baselinePath).href)
]);

// The prose blocks that existed before the rollout. productSections are excluded
// because they did not exist in the baseline at all — they are additions, not
// rewrites, and counting them would flatter the number.
const prose = (d) => [
  d.answer, ...(d.overview || []), d.whyExhibit, d.climate, d.planning, d.bestDisplays,
  ...(d.conventionCenters || []).map((v) => v.desc),
  ...(d.industries || []).map((i) => i[1]),
  ...(d.faqs || []).map((f) => f.a)
].filter(Boolean).join(' ');

const sentences = (t) => t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 25);

let keptTotal = 0;
let baseTotal = 0;
const rows = [];
for (const [slug, d] of Object.entries(now.CITY_DETAIL)) {
  const b = base.CITY_DETAIL[slug];
  if (!b || !Array.isArray(d.productSections)) continue;
  const before = sentences(prose(b));
  const after = prose(d);
  const kept = before.filter((s) => after.includes(s)).length;
  keptTotal += kept;
  baseTotal += before.length;
  rows.push({ slug, before: before.length, kept, changed: before.length - kept, added: (d.productSections || []).length });
}

console.log(`preservation vs ${ref}\n`);
console.log('city              existing  kept   %   rewritten  sections added');
for (const r of rows.sort((a, b) => (a.kept / a.before) - (b.kept / b.before))) {
  const pct = Math.round((r.kept / r.before) * 100);
  console.log(`${r.slug.padEnd(16)} ${String(r.before).padStart(8)} ${String(r.kept).padStart(5)} ${String(pct + '%').padStart(5)} ${String(r.changed).padStart(10)} ${String(r.added).padStart(14)}`);
}
console.log(`\n${keptTotal}/${baseTotal} existing sentences preserved verbatim (${Math.round((keptTotal / baseTotal) * 100)}%), ${rows.length * 5} new product sections added.`);

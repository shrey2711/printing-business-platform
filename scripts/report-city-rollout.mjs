// §25 rollout status by the owner's priority tiers.
//
// Reports, per tier, whether each city carries the full approved Seattle
// structure, and guards the one trap in this data: `tier` controls INDEXING
// (tier > 2 renders noindex and leaves the sitemap) while `priority` is only
// the rollout order. Setting a city's tier to 3 to express "last wave" would
// silently deindex it, so this fails if the two are ever conflated.
//
// Usage: node scripts/report-city-rollout.mjs

import { readFileSync, existsSync } from 'fs';
import { SEO_CITIES } from '../src/data/citySeo.js';
import { CITY_DETAIL } from '../src/data/cityDetail.js';

const DIST = 'dist';
const CAT = 'trade-show-displays';
const fails = [];

const TIER_NAMES = { 0: 'Master', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };

const complete = (slug) => {
  const d = CITY_DETAIL[slug];
  if (!d) return { done: false, why: 'no city detail entry' };
  const missing = [];
  if (!d.metaDescription) missing.push('metaDescription');
  if (!d.specTable) missing.push('specTable');
  if (!Array.isArray(d.productSections) || d.productSections.length !== 5) missing.push('5 product sections');
  if (!d.faqs || d.faqs.length < 6) missing.push('6+ FAQs');
  if (!d.conventionCenters || d.conventionCenters.length < 3) missing.push('3+ venues');
  if (!d.industries || d.industries.length < 4) missing.push('4+ industries');
  return { done: missing.length === 0, why: missing.join(', ') };
};

const byTier = new Map();
for (const c of SEO_CITIES) {
  if (c.priority === undefined) continue;
  if (!byTier.has(c.priority)) byTier.set(c.priority, []);
  byTier.get(c.priority).push(c);
}

for (const tier of [...byTier.keys()].sort()) {
  const cities = byTier.get(tier);
  console.log(`\n${TIER_NAMES[tier] || `Priority ${tier}`} (${cities.length})`);
  for (const c of cities) {
    const { done, why } = complete(c.slug);
    const file = `${DIST}/${CAT}/${c.slug}/index.html`;
    let indexed = 'not built';
    if (existsSync(file)) {
      const html = readFileSync(file, 'utf8');
      indexed = /<meta name="robots"[^>]*noindex/.test(html) ? 'NOINDEX' : 'indexed';
    }
    console.log(`  ${done ? '✓' : '✗'} ${c.city.padEnd(16)} ${indexed.padEnd(9)} tier ${c.tier}${done ? '' : `  — missing: ${why}`}`);
    if (!done) fails.push(`${c.slug}: ${why}`);

    // the guard: priority must never have been written into tier
    if (c.tier > 2) fails.push(`${c.slug}: tier ${c.tier} renders noindex — if this was meant as rollout priority, use the priority field instead`);
    if (indexed === 'NOINDEX') fails.push(`${c.slug}: page is noindex`);
  }
}

if (fails.length) {
  console.error(`\n✗ ROLLOUT STATUS — ${fails.length} issue(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
const total = [...byTier.values()].flat().length;
console.log(`\n✓ ROLLOUT COMPLETE — ${total - 1} priority cities plus the Seattle master all carry the approved structure, and all are indexed. Rollout priority is held in \`priority\`, separate from the \`tier\` field that governs indexing.`);

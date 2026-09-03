// Export CMS redirects into the format the Vercel edge middleware already
// consumes (src/generated/redirects.js).
//
// The prerenderer writes that file from the Supabase `redirects` table. This
// script merges in anything published in Directus, validates every rule, and
// rewrites the module — so a redirect created by a non-technical editor reaches
// the edge on the next deploy without anyone editing code.
//
//   node scripts/export-redirects.mjs            # merge CMS rules into the module
//   node scripts/export-redirects.mjs --check    # validate only, change nothing
//
// Validation matters more than the export: a bad redirect is worse than none.
// Rules are rejected for pointing at themselves, forming a loop, using a
// non-relative path, or duplicating an existing source.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'generated', 'redirects.js');
const CHECK_ONLY = process.argv.includes('--check');

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

const normalise = (p) => {
  if (typeof p !== 'string') return null;
  const t = p.trim();
  if (!t.startsWith('/')) return null;         // must be site-relative
  if (t.includes('://')) return null;          // no absolute URLs
  return t.replace(/\/+$/, '') || '/';
};

/** Validate a rule set, returning { rules, problems }. */
export function validateRules(raw) {
  const problems = [];
  const bySource = new Map();

  for (const r of raw) {
    const source = normalise(r.source);
    const destination = normalise(r.destination);
    const code = Number(r.code) === 302 ? 302 : 301;

    if (!source) { problems.push(`bad source: ${JSON.stringify(r.source)} (must start with /)`); continue; }
    if (!destination) { problems.push(`bad destination for ${source}: ${JSON.stringify(r.destination)}`); continue; }
    if (source === destination) { problems.push(`${source} redirects to itself`); continue; }
    if (bySource.has(source)) { problems.push(`duplicate rule for ${source}`); continue; }
    bySource.set(source, { source, destination, code });
  }

  // Loop detection: follow each chain, refusing anything that cycles or runs deep.
  for (const [source, rule] of bySource) {
    const seen = new Set([source]);
    let hop = rule;
    let depth = 0;
    while (hop && bySource.has(hop.destination)) {
      if (seen.has(hop.destination)) { problems.push(`redirect loop starting at ${source}`); break; }
      seen.add(hop.destination);
      hop = bySource.get(hop.destination);
      if (++depth > 5) { problems.push(`redirect chain from ${source} is more than 5 hops`); break; }
    }
  }

  return { rules: [...bySource.values()], problems };
}

/** Rules currently baked into the module (from the Supabase table via prerender). */
function existingRules() {
  if (!existsSync(OUT)) return [];
  const src = readFileSync(OUT, 'utf8');
  const m = src.match(/export const redirects = ([\s\S]*?);\s*$/);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch { return []; }
}

async function cmsRules() {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) return { rules: [], reachable: false };
  try {
    const res = await fetch(
      `${DIRECTUS_URL}/items/redirects?filter[status][_eq]=published&limit=-1&fields=old_url,new_url,code`,
      { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
    );
    if (!res.ok) return { rules: [], reachable: false, error: `HTTP ${res.status}` };
    const body = await res.json();
    return {
      reachable: true,
      rules: (body.data || []).map((r) => ({ source: r.old_url, destination: r.new_url, code: Number(r.code) || 301 }))
    };
  } catch (e) {
    return { rules: [], reachable: false, error: e.message };
  }
}

const main = async () => {
  const existing = existingRules();
  const cms = await cmsRules();

  if (!cms.reachable) {
    // A CMS outage must never drop redirects that are already live.
    console.log(`Directus not reachable${cms.error ? ` (${cms.error})` : ''} — keeping the ${existing.length} existing rule(s) unchanged.`);
    const { problems } = validateRules(existing);
    if (problems.length) {
      console.error(`\n✗ existing redirects have ${problems.length} problem(s):`);
      problems.forEach((p) => console.error(`  ✗ ${p}`));
      process.exit(1);
    }
    console.log('✓ existing redirects valid.');
    return;
  }

  // CMS rules win on conflict — the editor's intent is the newer one.
  const merged = [...existing.filter((e) => !cms.rules.some((c) => normalise(c.source) === normalise(e.source))), ...cms.rules];
  const { rules, problems } = validateRules(merged);

  if (problems.length) {
    console.error(`\n✗ REDIRECT EXPORT FAILED — ${problems.length} problem(s):`);
    problems.forEach((p) => console.error(`  ✗ ${p}`));
    process.exit(1);
  }

  console.log(`${existing.length} existing + ${cms.rules.length} from the CMS = ${rules.length} valid rule(s).`);
  if (CHECK_ONLY) { console.log('--check: nothing written.'); return; }

  writeFileSync(
    OUT,
    '// AUTO-GENERATED by scripts/prerender.mjs and scripts/export-redirects.mjs. Do not edit.\n' +
    `export const redirects = ${JSON.stringify(rules, null, 2)};\n`
  );
  console.log(`✓ wrote ${rules.length} rule(s) to src/generated/redirects.js — the edge middleware picks these up on deploy.`);
};

// Only run when invoked directly, so validateRules() can be imported by tests
// without the exporter firing.
if (process.argv[1] && process.argv[1].endsWith('export-redirects.mjs')) main();

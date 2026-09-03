// Tests for the migration's write rule.
//
// "Repeatable" is the whole requirement, and the rule that delivers it is
// fieldsToWrite: create what is missing, fill what is blank, never touch what an
// editor has written. If that rule is wrong, a re-run silently destroys work —
// so it is tested directly rather than inferred from a successful run.
//
// Run: node scripts/test-migrate-directus.mjs

import { fieldsToWrite, clamp } from './migrate-directus/lib.mjs';
import { readdirSync, readFileSync } from 'fs';

const fails = [];
let ran = 0;
const check = (name, fn) => {
  ran++;
  try { const p = fn(); if (p) fails.push(`${name}: ${p}`); }
  catch (e) { fails.push(`${name}: threw ${e.message}`); }
};

check('a missing record is created with everything', () => {
  const out = fieldsToWrite(null, { slug: 'a', title: 'T', description: 'D' });
  return Object.keys(out).length === 3 ? null : `wrote ${Object.keys(out).join(', ')}`;
});

check("an editor's value is never overwritten", () => {
  const out = fieldsToWrite({ title: 'Editor wrote this' }, { title: 'Code says this' });
  return 'title' in out ? 'it overwrote the edit' : null;
});

check('a blank field is filled', () => {
  for (const blank of [null, undefined, '', [], {}]) {
    const out = fieldsToWrite({ title: blank }, { title: 'From code' });
    if (out.title !== 'From code') return `${JSON.stringify(blank)} was treated as set`;
  }
  return null;
});

check('a blank value from code never overwrites anything', () => {
  const out = fieldsToWrite({ title: 'Editor wrote this' }, { title: '', description: null, faqs: [] });
  return Object.keys(out).length === 0 ? null : `wrote ${Object.keys(out).join(', ')}`;
});

check('--force overwrites, since that is what it is for', () => {
  const out = fieldsToWrite({ title: 'Editor wrote this' }, { title: 'Code says this' }, { force: true });
  return out.title === 'Code says this' ? null : 'force did not overwrite';
});

check('force still refuses to write a blank over a value', () => {
  const out = fieldsToWrite({ title: 'Editor wrote this' }, { title: '' }, { force: true });
  return 'title' in out ? 'force blanked a real value' : null;
});

check('a false or zero value counts as set, not blank', () => {
  // active:false and sort:0 are meaningful. Treating them as empty would make
  // every run rewrite them and mask an editor unpublishing something.
  const out = fieldsToWrite({ active: false, sort: 0 }, { active: true, sort: 5 });
  return Object.keys(out).length === 0 ? null : `rewrote ${Object.keys(out).join(', ')}`;
});

check('clamp trims to a limit on a word boundary', () => {
  const s = clamp('The quick brown fox jumps over the lazy dog', 20);
  if (s.length > 20) return `returned ${s.length} chars`;
  if (/\s$/.test(s)) return 'left trailing whitespace';
  if (s.endsWith(',') || s.endsWith(';')) return 'left dangling punctuation';
  return null;
});

check('clamp leaves short text alone', () =>
  clamp('Short', 20) === 'Short' ? null : 'it altered text that fit');

check('no migration step deletes anything', () => {
  // A destructive migration is the one mistake that cannot be undone by
  // re-running it. Removal stays a human decision made in the CMS.
  const dir = new URL('./migrate-directus/', import.meta.url);
  const offenders = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.mjs')) continue;
    const src = readFileSync(new URL(f, dir), 'utf8');
    if (/method: 'DELETE'/.test(src)) offenders.push(f);
  }
  return offenders.length ? `${offenders.join(', ')} issue DELETE requests` : null;
});

check('prices are not migrated into the CMS', () => {
  // The pricing engine computes from tiers, matrices and per-square-foot rates.
  // A flat price copied into a CMS field would disagree with checkout.
  const src = readFileSync(new URL('./migrate-directus/migrate-products.mjs', import.meta.url), 'utf8');
  const writes = /regular_price:|sale_price:|compare_price:|cost_price:/.test(src);
  return writes ? 'it writes a price field' : null;
});

if (fails.length) {
  console.error(`\n✗ DIRECTUS MIGRATION FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ DIRECTUS MIGRATION OK — ${ran} assertions: re-running fills blanks and creates what is missing, never overwriting an editor's work or deleting anything.`);

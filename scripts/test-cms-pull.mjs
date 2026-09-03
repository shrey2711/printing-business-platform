// Tests for the Directus -> content_overrides mapper.
//
// This is the path by which a non-technical edit reaches the live homepage, so
// it is tested mostly for what it REFUSES to publish: invented social proof,
// unknown keys, and empty values that would leave a blank page.
//
// Run: node scripts/test-cms-pull.mjs

import { mapToContentKeys, planWrites } from './cms-pull.mjs';
import { CONTENT_FIELDS, resolveContent, resolveList } from '../src/data/content.js';

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

const FULL = {
  hero: { headline: 'New headline', subheadline: '  padded sub  ', button_text: 'Go', button_link: '/products' },
  featured: [
    { title: 'Canopies', link: '/custom-canopies', image: 'abc' },
    { title: '', link: '/broken' },
    { title: 'No link', link: '' }
  ],
  why: [{ icon: 'star', title: 'Fast', description: 'Ships quickly.' }, { title: 'No copy', description: '' }],
  testimonials: [
    { name: 'Dana Reyes', company: 'Northwind', review: 'Great booth.' },
    { name: '', review: 'anonymous praise' },
    { name: 'Nameless', review: '' }
  ],
  cta: { headline: 'Ready?', description: 'Start your booth.' },
  promos: [{ placement: 'site_wide', message: '10% off', link: '/sale', cta_label: 'Shop' }],
  settings: { brand_phone: '555-0100', brand_email: 'hi@example.com', footer_blurb: '' }
};

check('hero values map across and are trimmed', () => {
  const m = mapToContentKeys(FULL);
  if (m['home.hero.title'] !== 'New headline') return `title: ${m['home.hero.title']}`;
  if (m['home.hero.subtitle'] !== 'padded sub') return `not trimmed: ${JSON.stringify(m['home.hero.subtitle'])}`;
  return null;
});

check('rows missing a title or link are dropped, not rendered broken', () => {
  const m = mapToContentKeys(FULL);
  if (m['home.featured.items'].length !== 1) return `expected 1 card, got ${m['home.featured.items'].length}`;
  if (m['home.why.items'].length !== 1) return `expected 1 why card, got ${m['home.why.items'].length}`;
  return null;
});

check('a review without a name or without text never publishes', () => {
  const m = mapToContentKeys(FULL);
  const r = m['home.reviews.items'];
  if (r.length !== 1) return `expected 1 review, got ${r.length}: ${JSON.stringify(r)}`;
  if (r[0].name !== 'Dana Reyes') return `wrong review kept: ${JSON.stringify(r[0])}`;
  return null;
});

check('no testimonials means the reviews section stays absent', () => {
  const m = mapToContentKeys({ ...FULL, testimonials: [] });
  const { writes, deletes } = planWrites(m);
  if (writes.some((w) => w.key === 'home.reviews.items')) return 'an empty review list was written as an override';
  if (!deletes.includes('home.reviews.items')) return 'the reviews key was not cleared';
  if (resolveList({}, 'home.reviews.items').length !== 0) return 'the shipped default is not an empty review list';
  return null;
});

check('an empty CMS field restores the shipped default instead of blanking', () => {
  const m = mapToContentKeys({ ...FULL, settings: { footer_blurb: '', brand_phone: '', brand_email: '' } });
  const { writes, deletes } = planWrites(m);
  for (const key of ['footer.blurb', 'footer.phone', 'footer.email']) {
    if (writes.some((w) => w.key === key)) return `${key} was written as an empty string`;
    if (!deletes.includes(key)) return `${key} was not cleared`;
  }
  return null;
});

check('a blank hero headline clears rather than emptying the H1', () => {
  const m = mapToContentKeys({ ...FULL, hero: { headline: '   ' } });
  const { writes, deletes } = planWrites(m);
  if (writes.some((w) => w.key === 'home.hero.title')) return 'a blank H1 was published';
  if (!deletes.includes('home.hero.title')) return 'the H1 key was not cleared';
  if (!resolveContent({}, 'home.hero.title')) return 'the shipped H1 default is empty';
  return null;
});

check('every key the mapper emits is declared in content.js', () => {
  const declared = new Set(CONTENT_FIELDS.map((f) => f.key));
  const undeclared = Object.keys(mapToContentKeys(FULL)).filter((k) => !declared.has(k));
  return undeclared.length ? `undeclared: ${undeclared.join(', ')}` : null;
});

check('an unknown key from a future Directus field is ignored', () => {
  const { writes } = planWrites({ 'home.hero.title': 'ok', 'evil.injected.key': 'nope' });
  return writes.some((w) => w.key === 'evil.injected.key') ? 'an undeclared key was written' : null;
});

check('a promo outside its date window does not publish', () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  const m = mapToContentKeys({ ...FULL, promos: [{ placement: 'site_wide', message: 'expired', ends_at: past }] });
  return m['home.promo.message'] === '' ? null : `expired banner published: ${m['home.promo.message']}`;
});

check('a promo scheduled for the future does not publish early', () => {
  const soon = new Date(Date.now() + 86400000).toISOString();
  const m = mapToContentKeys({ ...FULL, promos: [{ placement: 'site_wide', message: 'early', starts_at: soon }] });
  return m['home.promo.message'] === '' ? null : `future banner published: ${m['home.promo.message']}`;
});

check('a banner placed on product pages does not become the home promo strip', () => {
  const m = mapToContentKeys({ ...FULL, promos: [{ placement: 'product', message: 'product only' }] });
  return m['home.promo.message'] === '' ? null : 'a product banner leaked onto the homepage';
});

check('an empty featured list keeps the shipped categories', () => {
  const m = mapToContentKeys({ ...FULL, featured: [] });
  if ('home.featured.items' in m) return 'an empty category list was emitted';
  if (resolveList({}, 'home.featured.items').length < 5) return 'the shipped category default is thin';
  return null;
});

if (fails.length) {
  console.error(`\n✗ CMS CONTENT PULL FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CMS CONTENT PULL OK — ${ran} assertions: edits map onto declared keys, empty fields fall back to shipped defaults, and unverified reviews and out-of-window banners never publish.`);

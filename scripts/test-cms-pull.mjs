// Tests for the Directus -> content_overrides mapper.
//
// This is the path by which a non-technical edit reaches the live homepage, so
// it is tested mostly for what it REFUSES to publish: invented social proof,
// unknown keys, and empty values that would leave a blank page.
//
// Run: node scripts/test-cms-pull.mjs

import { mapToContentKeys, planWrites } from './cms-pull.mjs';
import { normaliseSeoRow, buildSeoMap } from './lib/seoRow.mjs';
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
  hero: {
    headline: 'New headline', subheadline: '  padded sub  ', button_text: 'Go', button_link: '/products',
    background_image: 'file-id', background_image_alt: 'A printed booth'
  },
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
  cta: { headline: 'Ready?', description: 'Start your booth.', button_text: 'Shop now', button_link: '/products' },
  promos: [{ placement: 'site_wide', message: '10% off', link: '/sale', cta_label: 'Shop' }],
  settings: {
    brand_phone: '555-0100', brand_email: 'hi@example.com', footer_blurb: '',
    social_links: [{ label: 'Instagram', url: 'https://example.com/ig' }, { label: 'No URL', url: '' }]
  }
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

check('an uploaded hero image maps to a full asset URL with its alt text', () => {
  const m = mapToContentKeys(FULL);
  if (!/\/assets\/file-id$/.test(m['home.hero.image'])) return `not an asset URL: ${m['home.hero.image']}`;
  if (m['home.hero.imageAlt'] !== 'A printed booth') return `alt not carried: ${m['home.hero.imageAlt']}`;
  return null;
});

check('no hero image means the product collage stays', () => {
  const m = mapToContentKeys({ ...FULL, hero: { headline: 'x' } });
  const { writes, deletes } = planWrites(m);
  if (writes.some((w) => w.key === 'home.hero.image')) return 'an empty image URL was published';
  if (!deletes.includes('home.hero.image')) return 'the hero image key was not cleared';
  return null;
});

check('the closing CTA button maps across', () => {
  const m = mapToContentKeys(FULL);
  if (m['home.cta.label'] !== 'Shop now') return `label: ${m['home.cta.label']}`;
  if (m['home.cta.href'] !== '/products') return `href: ${m['home.cta.href']}`;
  return null;
});

check('a social link without a URL is dropped', () => {
  const m = mapToContentKeys(FULL);
  const social = m['footer.social'];
  if (social.length !== 1) return `expected 1 link, got ${JSON.stringify(social)}`;
  if (social[0].label !== 'Instagram') return `wrong link kept: ${JSON.stringify(social[0])}`;
  return null;
});

check('no social links means no social row', () => {
  const m = mapToContentKeys({ ...FULL, settings: {} });
  const { writes, deletes } = planWrites(m);
  if (writes.some((w) => w.key === 'footer.social')) return 'an empty social list was written';
  if (!deletes.includes('footer.social')) return 'the social key was not cleared';
  if (resolveList({}, 'footer.social').length !== 0) return 'the shipped default is not an empty list';
  return null;
});

check('every editable item in the brief has a content key', () => {
  const declared = new Set(CONTENT_FIELDS.map((f) => f.key));
  const required = [
    'home.hero.title', 'home.hero.image', 'home.hero.cta.label', 'home.promo.message',
    'home.featured.items', 'home.bestsellers.items', 'home.why.items', 'home.reviews.items',
    'home.cta.main', 'home.cta.label', 'footer.blurb', 'footer.phone', 'footer.email'
  ];
  const missing = required.filter((k) => !declared.has(k));
  return missing.length ? `missing: ${missing.join(', ')}` : null;
});


// ------------------------------------------------------- per-URL SEO rows --
// public.seo_overrides is written by TWO editors: the admin dashboard (title,
// description, canonical, robots) and Directus (seo_title, seo_description,
// canonical_url, robots_index). The prerenderer reads both.

const DASHBOARD_ROW = { path: '/a', title: 'Dashboard title', description: 'Dashboard description.' };
const DIRECTUS_ROW = {
  path: '/trade-show-displays/denver', status: 'published',
  seo_title: 'Denver title', seo_description: 'Denver description.',
  h1: 'Trade Show Displays in Denver, CO', canonical_url: '', og_title: 'Denver OG',
  og_description: 'Denver OG desc.', breadcrumb_title: 'Denver', schema_type: 'CollectionPage',
  robots_index: true, og_image: 'file-uuid',
  faq_schema: [{ q: 'Do you ship to Denver?', a: 'Yes.' }, { q: '', a: 'orphan answer' }]
};

check('a Directus row maps every SEO field across', () => {
  const r = normaliseSeoRow(DIRECTUS_ROW, 'https://cms.example.com');
  const expect = {
    title: 'Denver title', description: 'Denver description.', h1: 'Trade Show Displays in Denver, CO',
    og_title: 'Denver OG', og_description: 'Denver OG desc.', breadcrumb_title: 'Denver', schema_type: 'CollectionPage'
  };
  for (const [k, v] of Object.entries(expect)) if (r[k] !== v) return `${k} is ${JSON.stringify(r[k])}, expected ${JSON.stringify(v)}`;
  if (r.og_image_path !== 'https://cms.example.com/assets/file-uuid') return `og image is ${r.og_image_path}`;
  return null;
});

check('a dashboard row still works untouched', () => {
  const r = normaliseSeoRow(DASHBOARD_ROW);
  return r && r.title === 'Dashboard title' && r.description === 'Dashboard description.' ? null : JSON.stringify(r);
});

check('a blank Directus field never blanks the dashboard value in the same row', () => {
  // Both editors share one row. An empty seo_title must leave title standing.
  const r = normaliseSeoRow({ path: '/a', title: 'Dashboard title', seo_title: '', seo_description: '   ' });
  if (r.title !== 'Dashboard title') return `title became ${JSON.stringify(r.title)}`;
  return null;
});

check('an incomplete FAQ pair is dropped rather than emitted half-formed', () => {
  const r = normaliseSeoRow(DIRECTUS_ROW);
  if (r.faq_schema.length !== 1) return `kept ${r.faq_schema.length} entries, expected 1`;
  if (r.faq_schema[0].question !== 'Do you ship to Denver?') return 'wrong entry kept';
  return null;
});

check('a draft override never reaches the build', () => {
  for (const status of ['draft', 'archived']) {
    if (normaliseSeoRow({ ...DIRECTUS_ROW, status }) !== null) return `a ${status} row was applied`;
  }
  return null;
});

check('a row with nothing filled in is ignored', () =>
  normaliseSeoRow({ path: '/blank', status: 'published' }) === null ? null : 'an empty override was applied');

check('a page only leaves the index when someone asks', () => {
  if (normaliseSeoRow(DIRECTUS_ROW).robots !== null) return 'an indexed page was given a robots value';
  const off = normaliseSeoRow({ ...DIRECTUS_ROW, robots_index: false });
  if (off.robots !== 'noindex, follow') return `robots is ${JSON.stringify(off.robots)}`;
  const legacy = normaliseSeoRow({ path: '/x', seo_noindex: true });
  if (legacy.robots !== 'noindex, follow') return 'the dashboard noindex flag was ignored';
  return null;
});

check('a blank canonical stays null rather than pinning the page to an empty URL', () =>
  normaliseSeoRow(DIRECTUS_ROW).canonical === null ? null : 'blank canonical was applied');

check('a trailing slash is normalised so the path matches a route', () =>
  normaliseSeoRow({ path: '/banner-stands/', seo_title: 'x' }).path === '/banner-stands' ? null : 'path not normalised');

check('buildSeoMap keys by path and drops the rows it should', () => {
  const map = buildSeoMap([DASHBOARD_ROW, DIRECTUS_ROW, { path: '/d', status: 'draft', seo_title: 'x' }, { path: '/e' }]);
  const keys = Object.keys(map).sort();
  return keys.join(',') === '/a,/trade-show-displays/denver' ? null : `kept ${keys.join(', ')}`;
});


if (fails.length) {
  console.error(`\n✗ CMS CONTENT PULL FAILED — ${fails.length}/${ran}:`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ CMS CONTENT PULL OK — ${ran} assertions: edits map onto declared keys, empty fields fall back to shipped defaults, and unverified reviews and out-of-window banners never publish.`);

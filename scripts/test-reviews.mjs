// Product reviews: validation, invite lifecycle, public shape, the review email,
// and the rule that rating markup only ever comes from approved reviews.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateReviewInput, inviteState, newReviewToken, slugForProductName,
  displayName, ratingSummary, toPublicReview
} from '../backend/lib/reviews.js';
import { reviewRequestEmailHtml } from '../backend/lib/mailer.js';

let n = 0;
const t = (name, fn) => { fn(); n++; };

t('valid review passes and is normalised', () => {
  const { errors, value } = validateReviewInput({ rating: '5', title: '  Great  tent ', body: 'Print was sharp and setup took ten minutes.', authorName: ' Jane  S. ', authorLocation: '' });
  assert.deepEqual(errors, []);
  assert.equal(value.rating, 5);
  assert.equal(value.title, 'Great tent');
  assert.equal(value.author_name, 'Jane S.');
  assert.equal(value.author_location, null);
});

t('rejects bad rating, short body, missing name', () => {
  assert.equal(validateReviewInput({ rating: 0, body: 'x'.repeat(30), authorName: 'A' }).errors.length, 1);
  assert.equal(validateReviewInput({ rating: 6, body: 'x'.repeat(30), authorName: 'A' }).errors.length, 1);
  assert.equal(validateReviewInput({ rating: 4.5, body: 'x'.repeat(30), authorName: 'A' }).errors.length, 1);
  assert.equal(validateReviewInput({ rating: 5, body: 'too short', authorName: 'A' }).errors.length, 1);
  assert.equal(validateReviewInput({ rating: 5, body: 'x'.repeat(30), authorName: '  ' }).errors.length, 1);
  assert.equal(validateReviewInput({ rating: 5, body: 'x'.repeat(2001), authorName: 'A' }).errors.length, 1);
});

t('invite states', () => {
  assert.equal(inviteState(null), 'missing');
  assert.equal(inviteState({ used_at: '2026-01-01' }), 'used');
  assert.equal(inviteState({ expires_at: '2020-01-01' }), 'expired');
  assert.equal(inviteState({ expires_at: '2999-01-01' }), 'ok');
});

t('tokens are long and unique', () => {
  const a = newReviewToken(), b = newReviewToken();
  assert.ok(a.length >= 30 && a !== b && /^[A-Za-z0-9_-]+$/.test(a));
});

t('order product name maps to slug', () => {
  const products = [{ name: '10x10 Canopy Tent', slug: 'canopy-tent-10x10' }];
  assert.equal(slugForProductName(' 10x10 canopy tent ', products), 'canopy-tent-10x10');
  assert.equal(slugForProductName('Unknown', products), null);
});

t('display name shortens surnames', () => {
  assert.equal(displayName('Jane Smith'), 'Jane S.');
  assert.equal(displayName('Jane Mary smith'), 'Jane S.');
  assert.equal(displayName('Jane'), 'Jane');
  assert.equal(displayName(''), '');
});

t('rating summary', () => {
  assert.deepEqual(ratingSummary([]), { count: 0, average: null });
  assert.deepEqual(ratingSummary([{ rating: 5 }, { rating: 4 }, { rating: 4 }]), { count: 3, average: 4.3 });
});

t('public review shape leaks no order data', () => {
  const pub = toPublicReview({ id: '1', rating: 5, title: null, body: 'b', author_name: 'Jane S.', author_location: null, verified_purchase: true, order_id: 'secret', source_note: 'x', created_at: '2026-09-01T00:00:00Z', approved_at: '2026-09-02T00:00:00Z' });
  assert.equal(pub.date, '2026-09-02');
  assert.ok(!('order_id' in pub) && !('orderId' in pub) && !('source_note' in pub));
});

t('review email escapes and links', () => {
  const html = reviewRequestEmailHtml({ id: 'abcdef12-0000', product: '10x10 Canopy <Tent>', customer_name: 'Jane Smith', specs: '' }, 'https://www.apextradeshow.com/review?token=abc');
  assert.ok(html.includes('href="https://www.apextradeshow.com/review?token=abc"'));
  assert.ok(html.includes('10x10 Canopy &lt;Tent&gt;') && !html.includes('<Tent>'));
  assert.ok(html.includes('Jane'));
});

t('rating markup only from approved reviews', () => {
  const pre = readFileSync(new URL('./prerender.mjs', import.meta.url), 'utf8');
  const data = readFileSync(new URL('./buildData.mjs', import.meta.url), 'utf8');
  assert.ok(/aggregateRating[\s\S]{0,40}reviewSummary\.count|reviewSummary\.count[\s\S]{0,40}aggregateRating/.test(pre), 'aggregateRating must be gated on real reviews');
  assert.ok(/from\('product_reviews'\)[\s\S]{0,60}\.eq\('status', 'approved'\)/.test(data), 'build must load approved reviews only');
  const app = readFileSync(new URL('../backend/app.js', import.meta.url), 'utf8');
  assert.ok(/app\.get\('\/api\/reviews\/:slug'[\s\S]{0,400}\.eq\('status', 'approved'\)/.test(app), 'public API must return approved reviews only');
  assert.ok(/permission !== true/.test(app), 'imported reviews must require recorded permission');
});

console.log(`✓ REVIEWS OK — ${n} checks: validation, invite states, tokens, name/slug mapping, summaries, public shape, email, and approved-only rating markup.`);

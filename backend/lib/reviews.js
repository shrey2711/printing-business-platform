// Pure helpers for product reviews: validation, invite state, summaries.
// No I/O, so scripts/test-reviews.mjs can exercise them without a database.

import crypto from 'crypto';

export const REVIEW_LIMITS = { title: 120, body: 2000, bodyMin: 20, name: 60, location: 60 };

export const newReviewToken = () => crypto.randomBytes(24).toString('base64url');

const clean = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

// Validates customer or admin input. Returns { errors, value }; value is only
// safe to insert when errors is empty.
export function validateReviewInput(input = {}) {
  const errors = [];
  const rating = Number(input.rating);
  const title = clean(input.title);
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  const authorName = clean(input.authorName);
  const authorLocation = clean(input.authorLocation);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Choose a rating from 1 to 5 stars.');
  if (body.length < REVIEW_LIMITS.bodyMin) errors.push(`Please write at least ${REVIEW_LIMITS.bodyMin} characters.`);
  if (body.length > REVIEW_LIMITS.body) errors.push(`Reviews are limited to ${REVIEW_LIMITS.body} characters.`);
  if (title.length > REVIEW_LIMITS.title) errors.push(`Titles are limited to ${REVIEW_LIMITS.title} characters.`);
  if (!authorName) errors.push('Add the name to show with your review.');
  if (authorName.length > REVIEW_LIMITS.name) errors.push(`Names are limited to ${REVIEW_LIMITS.name} characters.`);
  if (authorLocation.length > REVIEW_LIMITS.location) errors.push(`Locations are limited to ${REVIEW_LIMITS.location} characters.`);

  return {
    errors,
    value: {
      rating,
      title: title || null,
      body,
      author_name: authorName,
      author_location: authorLocation || null
    }
  };
}

export function inviteState(invite, now = new Date()) {
  if (!invite) return 'missing';
  if (invite.used_at) return 'used';
  if (invite.expires_at && new Date(invite.expires_at) < now) return 'expired';
  return 'ok';
}

// Orders store the product's display name; invites need its slug.
export function slugForProductName(name, products) {
  const n = clean(name).toLowerCase();
  const hit = products.find((p) => p.name.toLowerCase() === n);
  return hit ? hit.slug : null;
}

// "Jane Smith" -> "Jane S." — enough to be a real person without publishing a
// customer's full name.
export function displayName(name) {
  const parts = clean(name).split(' ').filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function ratingSummary(reviews) {
  const count = reviews.length;
  if (!count) return { count: 0, average: null };
  const avg = reviews.reduce((n, r) => n + r.rating, 0) / count;
  return { count, average: Math.round(avg * 10) / 10 };
}

export function toPublicReview(row) {
  return {
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    authorLocation: row.author_location,
    verifiedPurchase: row.verified_purchase,
    date: (row.approved_at || row.created_at || '').slice(0, 10)
  };
}

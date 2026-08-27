// Social-proof data models — EMPTY until real, verified data exists.
//
// RULE (do not violate): never fabricate reviews, ratings, testimonials, review
// counts, customer photos, case studies, logos, awards or certifications. These
// arrays stay empty until the owner supplies genuine, permissioned content.
// Consuming UI MUST render a section only when its array is non-empty, and MUST
// NOT emit Review/AggregateRating JSON-LD until REVIEWS holds real reviews.
//
// When real data arrives, populate these and wire the (already-conditional) UI.

/** @type {{author:string, rating:number, text:string, product?:string, date?:string, verified:boolean}[]} */
export const REVIEWS = [];

/** @type {{title:string, summary:string, image?:string, url?:string}[]} */
export const CASE_STUDIES = [];

/** @type {{src:string, alt:string, product?:string, credit?:string}[]} */
export const CUSTOMER_PHOTOS = [];

/** @type {{name:string, logo:string, permission:boolean}[]} */
export const CUSTOMER_LOGOS = [];

/** @type {{title:string, image:string, product?:string}[]} */
export const PROJECT_GALLERY = [];

export const hasReviews = () => REVIEWS.length > 0;
export const hasCaseStudies = () => CASE_STUDIES.length > 0;
export const hasCustomerPhotos = () => CUSTOMER_PHOTOS.length > 0;
// Only real reviews permit rating aggregation; guards against premature schema.
export const aggregateRating = () => {
  if (!REVIEWS.length) return null;
  const rated = REVIEWS.filter((r) => typeof r.rating === 'number');
  if (!rated.length) return null;
  return { ratingValue: (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1), reviewCount: rated.length };
};

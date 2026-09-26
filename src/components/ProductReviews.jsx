import { useEffect, useState } from 'react';
import { getReviews } from '../services/api';

export function Stars({ rating, size }) {
  const full = Math.round(rating);
  return (
    <span className="stars" style={size ? { fontSize: size } : undefined} role="img" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}<span className="stars-off">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

// Approved customer reviews for one product. Renders nothing until there is at
// least one, so a product never shows an empty "0 reviews" block.
export default function ProductReviews({ slug }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    getReviews(slug).then((d) => alive && setData(d));
    return () => { alive = false; };
  }, [slug]);

  if (!data || !data.reviews.length) return null;
  const { reviews, summary } = data;

  return (
    <section className="reviews-section" id="reviews">
      <div className="section-head">
        <h2>Customer reviews</h2>
        <p className="reviews-summary">
          <Stars rating={summary.average} /> <strong>{summary.average.toFixed(1)}</strong> out of 5
          · {summary.count} review{summary.count === 1 ? '' : 's'}
        </p>
      </div>
      <ul className="reviews-list">
        {reviews.map((r) => (
          <li className="review" key={r.id}>
            <Stars rating={r.rating} />
            {r.title && <h3 className="review-title">{r.title}</h3>}
            <p className="review-body">{r.body}</p>
            <p className="review-meta">
              {r.authorName}{r.authorLocation ? `, ${r.authorLocation}` : ''}
              {r.verifiedPurchase && <span className="review-verified"> · Verified purchase</span>}
              {r.date && <span> · {r.date}</span>}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

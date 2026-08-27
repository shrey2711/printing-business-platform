import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blog';
import useDocumentMeta from '../hooks/useDocumentMeta';

const TOPICS = [
  { to: '/trade-show-displays', label: 'All trade show displays' },
  { to: '/custom-canopies', label: 'Custom canopy tents' },
  { to: '/banner-stands', label: 'Retractable & X-stand banners' },
  { to: '/table-covers', label: 'Table covers' },
  { to: '/backdrops', label: 'Backdrops' },
  { to: '/artwork-guidelines', label: 'Artwork preparation' }
];

export default function BlogIndex() {
  useDocumentMeta(
    'Trade Show Resources & Buying Guides',
    'Buying guides, size charts and setup tips for trade show displays — canopy tents, banner stands, table covers, backdrops, booth planning and artwork prep.'
  );
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let alive = true;
    getBlogPosts().then((p) => alive && setPosts(p)).catch(() => alive && setPosts([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="page">
      <section className="section-head" style={{ marginTop: '1rem' }}>
        <span className="eyebrow">Resources</span>
        <h1>Trade Show Resources &amp; Buying Guides</h1>
        <p>Practical guides to help you choose, print and set up a professional trade show booth — from
        custom canopy tents and banner stands to table covers, backdrops, artwork prep and booth planning.</p>
      </section>

      <nav className="filter-bar" aria-label="Browse by topic">
        {TOPICS.map((t) => (
          <Link className="chip" to={t.to} key={t.to}>{t.label}</Link>
        ))}
      </nav>

      {posts === null ? (
        <p className="muted">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="empty-state card"><p>No posts yet — check back soon.</p></div>
      ) : (
        <div className="blog-grid">
          {posts.map((p) => (
            <Link className="blog-card" to={`/blog/${p.slug}`} key={p.slug}>
              {p.coverUrl ? (
                <div className="blog-card-cover"><img src={p.coverUrl} alt="" loading="lazy" /></div>
              ) : (
                <div className="blog-card-cover blog-card-cover-blank" aria-hidden="true">📋</div>
              )}
              <div className="blog-card-body">
                {p.tags?.[0] && <span className="blog-card-tag">{p.tags[0]}</span>}
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
                {p.publishedAt && (
                  <span className="blog-card-date">
                    {new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

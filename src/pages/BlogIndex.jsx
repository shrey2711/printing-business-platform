import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blog';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function BlogIndex() {
  useDocumentMeta(
    'Blog — canopy tips, buying guides & event ideas',
    'Guides, tips and ideas for custom printed canopy tents — sizing, print coverage, event setup and more.'
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
        <span className="eyebrow">Blog</span>
        <h1>Canopy guides &amp; ideas</h1>
        <p>Sizing, print coverage, event setup and everything else worth knowing before you order.</p>
      </section>

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
                <div className="blog-card-cover blog-card-cover-blank" aria-hidden="true">⛺</div>
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

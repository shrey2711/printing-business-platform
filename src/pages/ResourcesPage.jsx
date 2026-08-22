import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/blog';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { RESOURCES_META, RESOURCE_CATEGORIES } from '../data/resources';

// Learning Center hub — organises the guide articles into topic categories.
// Article titles/excerpts come from the live blog list so they never drift.
export default function ResourcesPage() {
  useDocumentMeta(RESOURCES_META.title, RESOURCES_META.description);
  const [bySlug, setBySlug] = useState(null);

  useEffect(() => {
    let alive = true;
    getBlogPosts()
      .then((posts) => alive && setBySlug(new Map((posts || []).map((p) => [p.slug, p]))))
      .catch(() => alive && setBySlug(new Map()));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="page">
      <nav aria-label="Breadcrumb" className="crumbs"><Link to="/">Home</Link> / <span>Learning Center</span></nav>
      <div className="section-head">
        <h1>{RESOURCES_META.h1}</h1>
        <p>{RESOURCES_META.intro}</p>
      </div>

      {RESOURCE_CATEGORIES.map((cat) => (
        <section className="resource-cat" key={cat.key}>
          <div className="resource-cat-head">
            <h2>{cat.title}</h2>
            <p>{cat.blurb}</p>
          </div>
          <div className="resource-grid">
            {cat.slugs.map((slug) => {
              const post = bySlug && bySlug.get(slug);
              const title = post ? post.title : slug.replace(/-/g, ' ');
              const excerpt = post ? post.excerpt : '';
              return (
                <Link className="resource-card" to={`/blog/${slug}`} key={slug}>
                  <strong>{title}</strong>
                  {excerpt ? <span>{excerpt}</span> : null}
                  <span className="resource-arrow" aria-hidden="true">Read the guide →</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="resource-cta">
        <p>Ready to build your booth? <Link to="/products">Shop all trade show displays</Link> or <Link to="/quote">request a quote</Link>.</p>
      </section>
    </main>
  );
}

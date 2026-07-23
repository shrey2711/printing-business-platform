import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogPost } from '../services/blog';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    let alive = true;
    setPost(undefined);
    getBlogPost(slug).then((p) => alive && setPost(p)).catch(() => alive && setPost(null));
    return () => {
      alive = false;
    };
  }, [slug]);

  useDocumentMeta(
    post ? post.seo?.title || post.title : 'Blog',
    post ? post.seo?.description || post.excerpt : undefined,
    post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          image: post.coverUrl || undefined,
          articleBody: undefined
        }
      : undefined
  );

  if (post === undefined) return <main className="page"><p className="muted">Loading…</p></main>;
  if (post === null) {
    return (
      <main className="page">
        <p className="muted">That post doesn't exist.</p>
        <Link className="btn btn-outline" to="/blog">← Back to the blog</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <article className="blog-article">
        <Link className="back-link" to="/blog">← All posts</Link>
        {post.tags?.[0] && <span className="blog-card-tag">{post.tags[0]}</span>}
        <h1>{post.title}</h1>
        {post.publishedAt && (
          <p className="blog-article-meta">
            {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        {post.coverUrl && <img className="blog-article-cover" src={post.coverUrl} alt="" />}
        {/* html is sanitized server-side in backend/lib/markdown.js */}
        <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="blog-article-cta card">
          <h3>Ready to build your canopy?</h3>
          <p>Configure size, frame and print coverage and see the price instantly.</p>
          <Link className="btn btn-red" to="/products/canopy-tents">Build your canopy</Link>
        </div>
      </article>
    </main>
  );
}

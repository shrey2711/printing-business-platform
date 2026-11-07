import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { list as getBlogPosts } from '../services/cms/blogService';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { brand } from '../config/brand';
import {
  postsForBlogIndex,
  blogPageCount,
  sliceBlogPage,
  resolveBlogListingQuery,
  blogCanonicalPath,
  blogListingTitle,
  blogListingDescription,
  blogListingLead,
  paginationLinks,
  blogListingJsonLd,
  applyBlogListingDocumentMeta,
  clearBlogListingDocumentMeta
} from '../lib/blogPagination';
import '../styles/blog.css';

function readBlogIndexSeed() {
  if (typeof document === 'undefined') return null;
  try {
    const el = document.getElementById('seo-seed');
    if (!el) return null;
    const parsed = JSON.parse(el.textContent);
    if (!parsed || parsed.kind !== 'blog-index' || !parsed.data) return null;
    if ((window.location.pathname.replace(/\/$/, '') || '/') !== '/blog') return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function BlogPagination({ page, pageCount }) {
  if (pageCount < 2) return null;
  const { prev, next, pages } = paginationLinks(page, pageCount);
  return (
    <nav className="blog-pagination" aria-label="Blog pages">
      {prev && <Link to={prev.href}>Previous</Link>}
      {pages.map((p) => (
        <Link key={p.n} to={p.href} aria-current={p.current ? 'page' : undefined}>{p.n}</Link>
      ))}
      {next && <Link to={next.href}>Next</Link>}
    </nav>
  );
}

export default function BlogIndex() {
  const [params, setSearchParams] = useSearchParams();
  const [seed] = useState(readBlogIndexSeed);
  const [allPosts, setAllPosts] = useState(null);

  useEffect(() => {
    let alive = true;
    getBlogPosts()
      .then((p) => alive && setAllPosts(Array.isArray(p) ? p : []))
      .catch(() => alive && !seed?.posts?.length && setAllPosts([]));
    return () => {
      alive = false;
    };
  }, [seed]);

  const indexPosts = useMemo(
    () => (allPosts ? postsForBlogIndex(allPosts) : null),
    [allPosts]
  );
  const pageCount = indexPosts
    ? blogPageCount(indexPosts.length)
    : (seed?.pageCount || null);
  // Until the total is known, only structurally invalid queries are rejected.
  // Out-of-range is decided once pageCount is known so a slow API can't flash a 404.
  const decision = resolveBlogListingQuery(
    params,
    pageCount || Number.MAX_SAFE_INTEGER
  );

  useEffect(() => {
    if (decision.action !== 'redirect-bare') return;
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [decision.action, setSearchParams]);

  const notFound = decision.action === 'not-found';
  const page = decision.action === 'serve' ? decision.page : 1;
  const slice = useMemo(() => {
    if (notFound) return [];
    if (indexPosts) return sliceBlogPage(indexPosts, page);
    if (seed && seed.page === page && Array.isArray(seed.posts)) return seed.posts;
    return null;
  }, [notFound, indexPosts, page, seed]);

  const title = notFound ? 'Blog page not found' : blogListingTitle(page, brand.name);
  const description = notFound
    ? 'That blog listing page does not exist.'
    : blogListingDescription(page);
  const canonical = notFound ? undefined : blogCanonicalPath(page);
  const jsonLd = useMemo(() => (
    !notFound && pageCount && Array.isArray(slice)
      ? blogListingJsonLd({
          origin: brand.origin,
          brandName: brand.name,
          page,
          pageCount,
          posts: slice,
          title: blogListingTitle(page, brand.name),
          description: blogListingDescription(page)
        })
      : undefined
  ), [notFound, pageCount, slice, page]);

  useDocumentMeta(
    title,
    description,
    jsonLd,
    notFound ? 'noindex, follow' : undefined,
    canonical
  );

  useEffect(() => {
    // page=1 is mid-redirect to /blog; don't publish a ?page=1 canonical first.
    if (decision.action === 'redirect-bare') return;
    applyBlogListingDocumentMeta({
      origin: window.location.origin,
      brandName: brand.name,
      page,
      pageCount,
      posts: Array.isArray(slice) ? slice : null,
      notFound
    });
    return clearBlogListingDocumentMeta;
  }, [decision.action, page, pageCount, notFound, slice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, notFound]);

  const lead = blogListingLead(page, pageCount || 1);

  return (
    <main className="page" data-blog-page={notFound ? undefined : page}>
      <section className="section-head" style={{ marginTop: '1rem' }}>
        <span className="eyebrow">Blog</span>
        <h1>{notFound ? 'Blog page not found' : 'Apex Trade Show Blog'}</h1>
        {notFound ? (
          <p>That blog page doesn't exist. The archive starts on the first page.</p>
        ) : (
          <p>
            {lead.before}
            <Link to="/resources">{lead.link}</Link>
            {lead.after}
          </p>
        )}
      </section>

      {notFound ? (
        <p><Link to="/blog">Back to the blog</Link></p>
      ) : slice === null ? (
        <p className="muted">Loading…</p>
      ) : slice.length === 0 ? (
        <div className="empty-state card"><p>No posts yet — check back soon.</p></div>
      ) : (
        <>
          <BlogPagination page={page} pageCount={pageCount || 1} />
          <div className="blog-grid">
            {slice.map((p) => (
              <Link className="blog-card" to={`/blog/${p.slug}`} key={p.slug}>
                {p.coverUrl ? (
                  <div className="blog-card-cover"><img src={p.coverUrl} alt="" loading="lazy" /></div>
                ) : (
                  <div className="blog-card-cover blog-card-cover-blank" aria-hidden="true">📋</div>
                )}
                <div className="blog-card-body">
                  {p.tags?.[0] && <span className="blog-card-tag">{p.tags[0]}</span>}
                  <h2>{p.title}</h2>
                  {p.publishedAt && (
                    <span className="blog-card-date">
                      {new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <BlogPagination page={page} pageCount={pageCount || 1} />
        </>
      )}
    </main>
  );
}

// Blog LISTING pagination (/blog, /blog?page=2, …). Article URLs stay /blog/:slug.
//
// Canonical policy (one URL per distinct slice):
//   /blog            page 1, self-canonical, indexable
//   /blog?page=1     same slice as /blog → 301 to /blog (no second canonical)
//   /blog?page=N     N >= 2 and in range, self-canonical to /blog?page=N, indexable
//   anything else    not a listing page (404, noindex) — never an empty 200
//
// Page 2+ must NOT canonicalise to /blog. That would collapse every slice into
// the first page and is the bug this module exists to prevent.
//
// rel=prev/next and the visible controls (numbered pages, Previous, Next) all
// use the canonical URL of the neighbour. Page 1 is /blog. Linking it as
// /blog?page=1 would send crawlers through the 301.

export const BLOG_PAGE_SIZE = 12;

export const BLOG_INDEX_DESCRIPTION =
  'The Apex Trade Show blog, newest first: new articles on trade show displays, canopy tents, banner stands and booth planning. Topic guides: Learning Center.';

const PAGE_RE = /^[1-9]\d*$/;

export function postsForBlogIndex(posts) {
  return (Array.isArray(posts) ? posts : [])
    .filter((p) => p && p.slug && !p.canonical)
    .sort((a, b) => {
      const delta = new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      if (delta) return delta;
      return String(a.slug).localeCompare(String(b.slug));
    });
}

export function blogPageCount(total) {
  const n = Number(total) || 0;
  return Math.max(1, Math.ceil(n / BLOG_PAGE_SIZE));
}

export function sliceBlogPage(posts, page) {
  const start = (page - 1) * BLOG_PAGE_SIZE;
  return posts.slice(start, start + BLOG_PAGE_SIZE);
}

/** Public path crawlers should treat as canonical for this listing page. */
export function blogCanonicalPath(page) {
  return page <= 1 ? '/blog' : `/blog?page=${page}`;
}

/** Href for a numbered / previous / next control. Page 1 is the bare /blog. */
export function blogPageHref(page) {
  return page <= 1 ? '/blog' : `/blog?page=${page}`;
}

/**
 * Decide what a request for /blog with this query string is.
 * `pageCount` is the number of real slices (at least 1).
 *
 * action:
 *   bare           no page param — render page 1 at /blog
 *   redirect-bare  page=1 — same document as /blog
 *   serve          page N in 2..pageCount
 *   not-found      missing, non-integer, zero, negative, or past the last page
 */
export function resolveBlogListingQuery(params, pageCount) {
  const values = typeof params?.getAll === 'function' ? params.getAll('page') : [];
  if (values.length === 0) return { action: 'bare', page: 1 };
  if (values.length !== 1 || !PAGE_RE.test(values[0])) return { action: 'not-found', page: 1 };
  const page = Number(values[0]);
  if (!Number.isSafeInteger(page)) return { action: 'not-found', page: 1 };
  if (page === 1) return { action: 'redirect-bare', page: 1 };
  const last = Math.max(1, pageCount | 0);
  if (page > last) return { action: 'not-found', page };
  return { action: 'serve', page };
}

export function blogListingTitle(page, brandName = 'Apex Trade Show') {
  const main = page <= 1 ? 'Blog: Latest Articles' : `Blog: Articles, Page ${page}`;
  const full = `${main} | ${brandName}`;
  return full.length <= 60 ? full : main;
}

export function blogListingDescription(page) {
  if (page <= 1) return BLOG_INDEX_DESCRIPTION;
  return `Blog archive page ${page}, newest first: further Apex Trade Show articles on displays, canopy tents, banner stands and booth planning.`;
}

function listingPosts(posts) {
  return Array.isArray(posts) ? posts.filter((p) => p && p.title) : [];
}

function topicLabels(posts) {
  const labels = [];
  const seen = new Set();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      const label = String(tag).replace(/\s+/g, ' ').trim();
      const key = label.toLowerCase();
      if (!label || seen.has(key)) continue;
      seen.add(key);
      labels.push(label);
    }
  }
  return labels;
}

function publishedSpan(posts) {
  const days = posts
    .map((p) => String(p.publishedAt || '').slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (!days.length) return '';
  const newest = days[0];
  const oldest = days[days.length - 1];
  return newest === oldest ? newest : `${newest} back to ${oldest}`;
}

function titleSpan(posts, lastPage) {
  const first = posts[0]?.title;
  const last = posts.length > 1 ? posts[posts.length - 1].title : '';
  if (lastPage) {
    if (first && last) return ` First post on this final page: “${first}”. Last post on this final page: “${last}”.`;
    if (first) return ` The only post on this final page is “${first}”.`;
    return '';
  }
  if (first && last) return ` Newest title on this page: “${first}”. Oldest title on this page: “${last}”.`;
  if (first) return ` The article on this page is “${first}”.`;
  return '';
}

/**
 * Visible lead. Page 1 keeps the historical sentence. Later pages name the
 * actual titles on that slice so two archive pages do not share a template.
 */
export function blogListingLead(page, pageCount, posts) {
  if (page <= 1) {
    return {
      before: 'Every article we publish, newest first. Looking for a guide by topic? Use the ',
      link: 'Learning Center',
      after: '.'
    };
  }
  const list = listingPosts(posts);
  const total = pageCount > 1 ? pageCount : 0;
  const lastPage = Boolean(total && page >= total);
  const range = titleSpan(list, lastPage);
  if (lastPage) {
    return {
      before: `Final page of the blog, page ${page} of ${total}.${range} These posts are older than every article on the earlier pages. The topic index is the `,
      link: 'Learning Center',
      after: '.'
    };
  }
  return {
    before: `Continuing the archive on page ${page}${total ? ` of ${total}` : ''}.${range} Newer posts are on the previous page. Subject guides grouped by topic are in the `,
    link: 'Learning Center',
    after: '.'
  };
}

/**
 * Plain-text summary of the posts actually on this listing page.
 * Titles and excerpts are the articles' own fields — nothing invented.
 * Rendered outside links so each slice has its own prose.
 */
export function blogListingDigest(page, pageCount, posts) {
  const list = listingPosts(posts);
  if (!list.length) return null;
  const topics = topicLabels(list);
  const span = publishedSpan(list);
  const n = list.length;
  const topicText = topics.length ? topics.join(', ') : 'the subjects named in the titles';
  const dated = span ? `, dated ${span}` : '';
  let heading;
  let intro;
  if (page <= 1) {
    heading = 'Newest articles, and what each one is about';
    intro = `Opening page of the blog: ${n} articles${dated}. The subjects gathered here are ${topicText}. The note under each title is that article's own summary.`;
  } else if (pageCount && page >= pageCount) {
    heading = 'Oldest articles still in the archive';
    intro = `Last page, ${page} of ${pageCount}: ${n} article${n === 1 ? '' : 's'} left${dated}. Nothing from the newer pages is repeated here. Subjects on this short page: ${topicText}.`;
  } else {
    heading = `Articles on archive page ${page}`;
    intro = `Middle of the archive, page ${page}${pageCount ? ` of ${pageCount}` : ''}: ${n} articles${dated}. Subjects on this slice only: ${topicText}.`;
  }
  return {
    heading,
    intro,
    items: list.map((p) => ({
      slug: p.slug || '',
      title: String(p.title).replace(/\s+/g, ' ').trim(),
      detail: String(p.excerpt || '').replace(/\s+/g, ' ').trim()
    }))
  };
}

export function paginationLinks(page, pageCount) {
  const pages = [];
  for (let n = 1; n <= pageCount; n++) {
    pages.push({ n, href: blogPageHref(n), current: n === page });
  }
  return {
    prev: page > 1 ? { href: blogPageHref(page - 1), page: page - 1 } : null,
    next: page < pageCount ? { href: blogPageHref(page + 1), page: page + 1 } : null,
    pages
  };
}

/** rel=prev/next targets. Neighbour page 1 is the bare canonical /blog. */
export function blogRelLinks(origin, page, pageCount) {
  const rels = [];
  if (page > 1) rels.push({ rel: 'prev', href: origin + blogCanonicalPath(page - 1) });
  if (page < pageCount) rels.push({ rel: 'next', href: origin + blogCanonicalPath(page + 1) });
  return rels;
}

/** Filesystem path of a prerendered listing. Public /blog?page=N lives at /blog/page/N. */
export function blogListingDistPath(publicPath) {
  const raw = String(publicPath || '/');
  const q = raw.indexOf('?');
  const pathname = (q === -1 ? raw : raw.slice(0, q)).replace(/\/$/, '') || '/';
  if (q === -1 || pathname !== '/blog') return pathname;
  const page = new URLSearchParams(raw.slice(q + 1)).get('page');
  if (page && PAGE_RE.test(page) && Number(page) >= 2) return `/blog/page/${Number(page)}`;
  return pathname;
}

export function blogListingJsonLd({ origin, brandName, page, pageCount, posts, title, description }) {
  const url = origin + blogCanonicalPath(page);
  const list = Array.isArray(posts) ? posts : [];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url,
      isPartOf: {
        '@type': 'Blog',
        name: `${brandName} Blog`,
        url: `${origin}/blog`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: list.length,
      itemListElement: list.map((p, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * BLOG_PAGE_SIZE + i + 1,
        name: p.title,
        url: `${origin}/blog/${p.slug}`
      }))
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${origin}/blog` },
        ...(page > 1
          ? [{ '@type': 'ListItem', position: 3, name: `Page ${page}`, item: url }]
          : [])
      ]
    }
  ];
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertBlogJsonLd(data) {
  let el = document.getElementById('blog-listing-jsonld');
  if (!el) {
    el = [...document.querySelectorAll('script[type="application/ld+json"]')].find((s) =>
      s.textContent.includes('"CollectionPage"')
    );
    if (el) el.id = 'blog-listing-jsonld';
  }
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'blog-listing-jsonld';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Head tags for the listing the visitor is actually on. useDocumentMeta keys
 * off the pathname only and deliberately ignores ?page=, so a query change on
 * /blog would otherwise keep page 1's canonical. Called by BlogIndex.
 */
export function applyBlogListingDocumentMeta({ origin, brandName, page, pageCount, posts, notFound }) {
  if (typeof document === 'undefined') return;
  if (notFound) {
    const title = `Blog page not found | ${brandName}`;
    document.title = title;
    upsertMeta('name', 'description', 'That blog listing page does not exist.');
    upsertMeta('property', 'og:title', 'Blog page not found');
    upsertMeta('name', 'twitter:title', 'Blog page not found');
    upsertMeta('property', 'og:description', 'That blog listing page does not exist.');
    upsertMeta('name', 'twitter:description', 'That blog listing page does not exist.');
    upsertMeta('name', 'robots', 'noindex, follow');
    upsertLink('canonical', null);
    upsertLink('prev', null);
    upsertLink('next', null);
    upsertMeta('property', 'og:url', null);
    upsertBlogJsonLd(null);
    return;
  }
  const title = blogListingTitle(page, brandName);
  const description = blogListingDescription(page);
  const canonical = origin + blogCanonicalPath(page);
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title.replace(new RegExp(`\\s*\\|\\s*${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), ''));
  upsertMeta('name', 'twitter:title', title.replace(new RegExp(`\\s*\\|\\s*${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), ''));
  upsertMeta('property', 'og:description', description);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('name', 'robots', null);
  upsertLink('canonical', canonical);
  const rels = pageCount ? blogRelLinks(origin, page, pageCount) : [];
  upsertLink('prev', rels.find((r) => r.rel === 'prev')?.href || null);
  upsertLink('next', rels.find((r) => r.rel === 'next')?.href || null);
  if (pageCount && Array.isArray(posts)) {
    upsertBlogJsonLd(blogListingJsonLd({
      origin,
      brandName,
      page,
      pageCount,
      posts,
      title,
      description
    }));
  }
}

export function clearBlogListingDocumentMeta() {
  if (typeof document === 'undefined') return;
  document.head.querySelector('link[rel="prev"]')?.remove();
  document.head.querySelector('link[rel="next"]')?.remove();
  document.getElementById('blog-listing-jsonld')?.remove();
}

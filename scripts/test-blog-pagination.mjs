// Blog listing pagination: /blog?page=N is a distinct indexable slice.
// Article URLs (/blog/:slug) are not part of this. Run after the build.
//
//   node scripts/test-blog-pagination.mjs
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import middleware from '../middleware.js';
import { KNOWN_ROUTES } from '../src/generated/routes.js';
import { redirects } from '../src/generated/redirects.js';
import { BLOG_LISTING_PAGE_COUNT } from '../src/generated/blogListing.js';
import { STATIC_ARTICLES } from '../backend/data/staticArticles.js';
import {
  BLOG_PAGE_SIZE,
  postsForBlogIndex,
  blogPageCount,
  sliceBlogPage,
  resolveBlogListingQuery,
  blogCanonicalPath,
  blogPageHref,
  blogListingTitle,
  blogListingDescription,
  blogRelLinks,
  paginationLinks
} from '../src/lib/blogPagination.js';

const ORIGIN = 'https://www.apextradeshow.com';
const fails = [];
const check = (name, fn) => {
  try {
    const problem = fn();
    if (problem) fails.push(`${name}: ${problem}`);
  } catch (e) {
    fails.push(`${name}: threw ${e.message}`);
  }
};

const params = (q) => new URLSearchParams(q);
const canonicalised = new Set(STATIC_ARTICLES.filter((p) => p.canonical).map((p) => p.slug));

// --- pure rules -------------------------------------------------------------
check('page size slices are disjoint and cover the list', () => {
  const posts = Array.from({ length: 25 }, (_, i) => ({
    slug: `p${String(i).padStart(2, '0')}`,
    title: `Post ${i}`,
    publishedAt: new Date(Date.UTC(2024, 0, 25 - i)).toISOString()
  }));
  // One canonicalised-away post must not consume a slot.
  posts.push({ slug: 'gone', title: 'Gone', canonical: '/blog/p00', publishedAt: '2024-12-01' });
  const indexable = postsForBlogIndex(posts);
  if (indexable.some((p) => p.slug === 'gone')) return 'canonicalised post stayed on the index';
  const pages = blogPageCount(indexable.length);
  const seen = new Set();
  for (let n = 1; n <= pages; n++) {
    const slice = sliceBlogPage(indexable, n);
    if (n < pages && slice.length !== BLOG_PAGE_SIZE) return `page ${n} has ${slice.length} posts`;
    for (const p of slice) {
      if (seen.has(p.slug)) return `duplicate slug ${p.slug}`;
      seen.add(p.slug);
    }
  }
  if (seen.size !== indexable.length) return `covered ${seen.size} of ${indexable.length}`;
  return null;
});

check('resolver: bare, page=1, in-range, invalid, out of range', () => {
  const count = 3;
  const cases = [
    [params(''), 'bare', 1],
    [params('utm=x'), 'bare', 1],
    [params('page=1'), 'redirect-bare', 1],
    [params('page=1&utm=x'), 'redirect-bare', 1],
    [params('page=2'), 'serve', 2],
    [params('page=3'), 'serve', 3],
    [params('page=2&utm=x'), 'serve', 2],
    [params('page=4'), 'not-found', 4],
    [params('page=0'), 'not-found', 1],
    [params('page=01'), 'not-found', 1],
    [params('page=-1'), 'not-found', 1],
    [params('page=1.5'), 'not-found', 1],
    [params('page=abc'), 'not-found', 1],
    [params('page='), 'not-found', 1],
    [params('page=2&page=3'), 'not-found', 1]
  ];
  for (const [q, action, page] of cases) {
    const got = resolveBlogListingQuery(q, count);
    if (got.action !== action || got.page !== page) {
      return `${q.toString() || '(none)'} → ${got.action} ${got.page}, expected ${action} ${page}`;
    }
  }
  return null;
});

check('canonicals do not collapse later pages onto /blog', () => {
  if (blogCanonicalPath(1) !== '/blog') return `page 1 canonical ${blogCanonicalPath(1)}`;
  if (blogCanonicalPath(2) !== '/blog?page=2') return `page 2 canonical ${blogCanonicalPath(2)}`;
  if (blogPageHref(1) !== '/blog?page=1') return `page 1 href ${blogPageHref(1)}`;
  if (blogPageHref(2) !== '/blog?page=2') return `page 2 href ${blogPageHref(2)}`;
  const rels = blogRelLinks(ORIGIN, 2, 3);
  const prev = rels.find((r) => r.rel === 'prev');
  const next = rels.find((r) => r.rel === 'next');
  if (!prev || prev.href !== `${ORIGIN}/blog`) return `page 2 prev should be the bare /blog, got ${prev && prev.href}`;
  if (!next || next.href !== `${ORIGIN}/blog?page=3`) return `page 2 next ${next && next.href}`;
  const buttons = paginationLinks(2, 3);
  if (buttons.pages.map((p) => p.href).join(' ') !== '/blog?page=1 /blog?page=2 /blog?page=3') {
    return `button hrefs ${buttons.pages.map((p) => p.href).join(' ')}`;
  }
  return null;
});

check('titles and descriptions stay unique and within the SEO caps', () => {
  const titles = new Set();
  const descs = new Set();
  for (let n = 1; n <= 12; n++) {
    const title = blogListingTitle(n);
    const desc = blogListingDescription(n);
    if (title.length > 60) return `title page ${n} is ${title.length} chars`;
    if (desc.length > 165) return `description page ${n} is ${desc.length} chars`;
    if (titles.has(title)) return `duplicate title ${title}`;
    if (descs.has(desc)) return `duplicate description ${desc}`;
    titles.add(title);
    descs.add(desc);
  }
  if (!blogListingTitle(1).startsWith('Blog: Latest Articles')) return 'page 1 title changed';
  return null;
});

// --- edge middleware --------------------------------------------------------
const call = (path, origin = ORIGIN) => middleware(new Request(origin + path));

check('/blog with no page param still passes through', () => {
  const res = call('/blog');
  return res === undefined ? null : `/blog was intercepted with ${res.status}`;
});

check('/blog?page=1 redirects to /blog', () => {
  const res = call('/blog?page=1&utm=newsletter');
  if (!res || res.status !== 301) return `status ${res && res.status}`;
  const loc = res.headers.get('location') || '';
  if (loc !== `${ORIGIN}/blog`) return `location ${loc}`;
  return null;
});

check('/blog?page=2 rewrites to the internal file and keeps no public path', () => {
  if (BLOG_LISTING_PAGE_COUNT < 2) return `only ${BLOG_LISTING_PAGE_COUNT} listing page was prerendered`;
  const res = call('/blog?page=2');
  if (!res) return 'passed through — the crawler would receive page 1 HTML';
  const rewrite = res.headers.get('x-middleware-rewrite') || '';
  let pathname = '';
  try { pathname = new URL(rewrite).pathname; } catch { /* keep empty */ }
  if (pathname !== '/blog/page/2') return `rewrite ${rewrite}`;
  if (KNOWN_ROUTES.has('/blog/page/2')) return '/blog/page/2 is a known route, so it is a second public URL';
  const direct = call('/blog/page/2');
  if (!direct || direct.status !== 404) return `direct /blog/page/2 status ${direct && direct.status}`;
  return null;
});

check('out-of-range and garbage page params 404 noindex', () => {
  for (const q of ['page=9999', 'page=0', 'page=abc', 'page=01', `page=${BLOG_LISTING_PAGE_COUNT + 1}`]) {
    const res = call(`/blog?${q}`);
    if (!res || res.status !== 404) return `${q} status ${res && res.status}`;
    if (!/noindex/i.test(res.headers.get('x-robots-tag') || '')) return `${q} 404 without noindex`;
  }
  return null;
});

check('uppercase /Blog?page=2 still case-folds before pagination', () => {
  const res = call('/Blog?page=2');
  if (!res || res.status !== 301) return `status ${res && res.status}`;
  const loc = res.headers.get('location') || '';
  if (!loc.endsWith('/blog?page=2')) return `location ${loc}`;
  return null;
});

// --- prerendered HTML + sitemap --------------------------------------------
check('prerendered listing pages exist with self-canonicals and distinct slices', () => {
  if (!existsSync('dist/blog/index.html')) return 'dist/blog/index.html missing — run the build';
  const slugsOf = (html) => [...html.matchAll(/<ul class="blog-index-list">([\s\S]*?)<\/ul>/g)]
    .flatMap((block) => [...block[1].matchAll(/href="\/blog\/([^"]+)"/g)].map((m) => m[1]));
  const attr = (html, re) => (html.match(re) || [])[1] || '';
  const seen = new Map();
  for (let n = 1; n <= BLOG_LISTING_PAGE_COUNT; n++) {
    const file = n === 1 ? 'dist/blog/index.html' : `dist/blog/page/${n}/index.html`;
    if (!existsSync(file)) return `${file} missing`;
    const html = readFileSync(file, 'utf8');
    const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
    const expect = `${ORIGIN}${blogCanonicalPath(n)}`;
    if (canon !== expect) return `${file} canonical ${canon}, expected ${expect}`;
    if (/<meta name="robots"[^>]*noindex/i.test(html)) return `${file} is noindex`;
    const h1 = html.match(/<h1[\s>]/g) || [];
    if (h1.length !== 1) return `${file} has ${h1.length} h1`;
    const title = attr(html, /<title>([^<]*)<\/title>/);
    if (title !== blogListingTitle(n)) return `${file} title ${title}`;
    const og = attr(html, /<meta property="og:url" content="([^"]*)"/);
    if (og !== expect) return `${file} og:url ${og}`;
    if (attr(html, /data-blog-page="(\d+)"/) !== String(n)) return `${file} data-blog-page mismatch`;
    const slugs = slugsOf(html);
    if (slugs.length === 0) return `${file} lists no articles`;
    if (slugs.length > BLOG_PAGE_SIZE) return `${file} lists ${slugs.length} articles`;
    for (const slug of slugs) {
      if (canonicalised.has(slug)) return `${file} links to canonicalised-away /blog/${slug}`;
      if (seen.has(slug)) return `${slug} appears on page ${seen.get(slug)} and page ${n}`;
      seen.set(slug, n);
    }
    const relPrev = attr(html, /<link rel="prev" href="([^"]*)"/);
    const relNext = attr(html, /<link rel="next" href="([^"]*)"/);
    if (n === 1 && relPrev) return 'page 1 has rel=prev';
    if (n > 1 && relPrev !== `${ORIGIN}${blogCanonicalPath(n - 1)}`) return `page ${n} rel=prev ${relPrev}`;
    if (n < BLOG_LISTING_PAGE_COUNT && relNext !== `${ORIGIN}${blogCanonicalPath(n + 1)}`) return `page ${n} rel=next ${relNext}`;
    if (n === BLOG_LISTING_PAGE_COUNT && relNext) return `last page has rel=next ${relNext}`;
    if (BLOG_LISTING_PAGE_COUNT > 1 && !html.includes('href="/blog?page=')) return `${file} pagination is not a real ?page= link`;
  }
  const indexableStatic = postsForBlogIndex(STATIC_ARTICLES).length;
  if (seen.size < Math.min(indexableStatic, BLOG_PAGE_SIZE)) return `only ${seen.size} articles across listing pages`;
  return null;
});

check('sitemap lists /blog and ?page=N for N>=2, not ?page=1', () => {
  const xml = readFileSync('dist/sitemap-blog.xml', 'utf8');
  if (!xml.includes(`<loc>${ORIGIN}/blog</loc>`)) return '/blog missing from sitemap';
  if (xml.includes(`${ORIGIN}/blog?page=1`)) return 'sitemap lists /blog?page=1';
  for (let n = 2; n <= BLOG_LISTING_PAGE_COUNT; n++) {
    if (!xml.includes(`<loc>${ORIGIN}/blog?page=${n}</loc>`)) return `sitemap missing /blog?page=${n}`;
  }
  if (xml.includes(`${ORIGIN}/blog/page/`)) return 'sitemap lists the internal /blog/page/ path';
  return null;
});

check('robots.txt does not block /blog or query strings', () => {
  const robots = readFileSync('dist/robots.txt', 'utf8');
  if (/Disallow:\s*\/blog/i.test(robots)) return 'robots.txt disallows /blog';
  if (/Disallow:\s*\/\*/.test(robots)) return 'robots.txt disallows a query pattern';
  return null;
});

check('CMS-generated blog routes and redirects survived a no-CMS build', () => {
  for (const slug of [
    'coroplast-vs-pvc-vs-aluminum-signs',
    'how-to-choose-canopy-tent-size',
    'step-and-repeat-vs-tension-fabric-backdrop'
  ]) {
    if (!KNOWN_ROUTES.has(`/blog/${slug}`)) return `/blog/${slug} was dropped from known routes`;
  }
  if (!redirects.some((r) => r.source === '/tents')) return 'CMS redirect /tents was dropped';
  if (!redirects.some((r) => r.source === '/sizes/8x8')) return 'CMS redirect /sizes/8x8 was dropped';
  return null;
});

// --- direct loads through the local static server --------------------------
async function withServer(fn) {
  const child = spawn(process.execPath, ['scripts/serve-dist.mjs', '4187'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let log = '';
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('serve-dist did not start')), 8000);
      child.stdout.on('data', (d) => {
        log += d;
        if (log.includes('serving dist')) {
          clearTimeout(timer);
          resolve();
        }
      });
      child.stderr.on('data', (d) => { log += d; });
      child.on('exit', (code) => reject(new Error(`serve-dist exited ${code}: ${log}`)));
    });
    return await fn();
  } finally {
    child.kill();
  }
}

const serverProblems = await withServer(async () => {
  const problems = [];
  const get = async (path) => {
    const res = await fetch(`http://127.0.0.1:4187${path}`, { redirect: 'manual' });
    const text = await res.text();
    return { status: res.status, location: res.headers.get('location'), text, robots: res.headers.get('x-robots-tag') };
  };
  const page1 = await get('/blog');
  const page1q = await get('/blog?page=1');
  const page2 = await get('/blog?page=2');
  const bad = await get('/blog?page=9999');
  const internal = await get('/blog/page/2');
  if (page1.status !== 200) problems.push(`/blog status ${page1.status}`);
  const canon = (html) => (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  if (canon(page1.text) !== `${ORIGIN}/blog`) problems.push(`direct /blog canonical ${canon(page1.text)}`);
  if (/noindex/i.test(page1.text)) problems.push('/blog HTML is noindex');
  if (page1q.status !== 301) problems.push(`?page=1 status ${page1q.status}`);
  else {
    const loc = new URL(page1q.location, 'http://127.0.0.1');
    if (loc.pathname !== '/blog' || loc.search) problems.push(`?page=1 location ${page1q.location}`);
  }
  if (page2.status !== 200) problems.push(`?page=2 status ${page2.status}`);
  if (canon(page2.text) !== `${ORIGIN}/blog?page=2`) problems.push(`?page=2 canonical ${canon(page2.text)}`);
  if (page1.text === page2.text) problems.push('?page=2 served the same HTML as /blog');
  const slugs = (html) => new Set([...html.matchAll(/href="\/blog\/([^"]+)"/g)].map((m) => m[1]));
  const a = slugs(page1.text);
  const b = slugs(page2.text);
  if ([...b].every((s) => a.has(s))) problems.push('?page=2 article links are not a distinct slice');
  if (![...page2.text.matchAll(/<a [^>]*href="(\/blog\?page=\d+)"/g)].length) {
    problems.push('?page=2 pagination anchors missing ?page=');
  }
  if (bad.status !== 404 || !/noindex/i.test(bad.robots || '') && !/noindex/i.test(bad.text)) {
    problems.push(`?page=9999 → ${bad.status} robots ${bad.robots}`);
  }
  if (internal.status !== 404) problems.push(`/blog/page/2 status ${internal.status} (must not be a public URL)`);
  return problems;
}).catch((e) => [`direct-load server: ${e.message}`]);

fails.push(...serverProblems);

if (fails.length) {
  console.error(`\n✗ BLOG PAGINATION FAILED — ${fails.length} problem(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ BLOG PAGINATION OK — ${BLOG_LISTING_PAGE_COUNT} indexable listing page(s), ?page=1 → /blog, later pages self-canonical, invalid pages 404.`);

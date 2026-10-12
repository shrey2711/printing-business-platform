// Every prerendered product and blog page must embed its own data
// (`<script id="seo-seed">`, read by src/lib/seed.js). Without it the page
// renders "Loading…" until /api answers, and a crawler that snapshots earlier
// sees the same empty shell on many URLs — Search Console then reports them as
// "Duplicate, Google chose a different canonical". Runs after the build.
import { readFileSync, existsSync } from 'node:fs';
import { listProducts } from '../backend/data/products.js';

const fails = [];
const check = (path, kind, slug, want) => {
  const file = `dist${path}/index.html`;
  if (!existsSync(file)) return fails.push(`${path}: no prerendered page`);
  const m = readFileSync(file, 'utf8').match(/<script type="application\/json" id="seo-seed">([\s\S]*?)<\/script>/);
  if (!m) return fails.push(`${path}: no seo-seed`);
  let seed;
  try {
    seed = JSON.parse(m[1]);
  } catch {
    return fails.push(`${path}: seo-seed is not valid JSON`);
  }
  if (seed.kind !== kind || seed.slug !== slug || seed.path !== path) fails.push(`${path}: seed is for ${seed.kind} ${seed.slug} ${seed.path}`);
  if (!seed.data?.[want]) fails.push(`${path}: seed has no ${want}`);
};

const products = listProducts();
for (const p of products) check(`/products/${p.slug}`, 'product', p.slug, 'name');

// Blog posts: every prerendered article page (canonicalised-away posts have none).
const blog = readFileSync('dist/sitemap-blog.xml', 'utf8');
const posts = [...blog.matchAll(/<loc>[^<]*\/blog\/([^<\/]+)<\/loc>/g)].map((m) => m[1]);
for (const slug of posts) check(`/blog/${slug}`, 'post', slug, 'title');

if (fails.length) {
  console.error(`\n✗ SEED CHECK FAILED — ${fails.length} problem(s):`);
  fails.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ SEED OK — ${products.length} product pages and ${posts.length} blog posts embed their own data for first paint.`);

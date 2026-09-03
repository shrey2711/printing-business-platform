// Blog posts, from the Supabase table the site already publishes from.
//
// Post bodies are stored as HTML that the backend sanitised on the way in. They
// are copied across unchanged: re-sanitising here would either be a second,
// differently-behaving pass, or a false reassurance if it silently agreed.

import { createClient } from '@supabase/supabase-js';
import { requireConfig, indexBy, upsert, newCounters, report, clamp, DRY } from './lib.mjs';

const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export async function migrateBlog() {
  if (!SUPA_URL || !SUPA_KEY) {
    console.warn('! blog: Supabase credentials not set — skipping. Posts live in Supabase, not in the repo.');
    return true;
  }
  const supabase = createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('blog_posts').select('*');
  if (error) { console.error(`✗ blog: ${error.message}`); return false; }

  const existing = await indexBy('blogs', 'slug');
  const c = newCounters();

  for (const post of data || []) {
    if (!post.slug) { c.skipped++; continue; }
    await upsert('blogs', 'slug', {
      // A post that is not published on the site must not arrive published here.
      status: post.published ? 'published' : 'draft',
      slug: post.slug,
      title: post.title || post.slug,
      excerpt: clamp(post.excerpt || '', 300),
      content: post.content || post.body || '',
      published_date: post.published_at || post.created_at || null,
      author: post.author || '',
      seo_title: clamp(post.seo_title || post.title || '', 62),
      seo_description: clamp(post.meta_description || post.excerpt || '', 165),
      canonical_url: post.canonical || '',
      robots_index: true
    }, existing, c);
  }
  return report(`blog posts (${(data || []).length} in Supabase)`, c);
}

if (process.argv[1] && /migrate-blog\.mjs$/.test(process.argv[1])) {
  requireConfig();
  console.log(DRY ? 'Blog (dry run)' : 'Blog');
  process.exit((await migrateBlog()) ? 0 : 1);
}

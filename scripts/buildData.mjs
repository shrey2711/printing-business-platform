// Build-time reader for dashboard-authored content (blog, and later CMS/SEO
// overrides). Runs inside `npm run build` before prerender. Reads Supabase with
// whatever key is available; degrades to empty so a build never fails just
// because the DB is unreachable or unconfigured.
//
// Requires SUPABASE_URL + a key (service role preferred, anon works for the
// public-readable tables) as BUILD env vars in Vercel.

import { createClient } from '@supabase/supabase-js';
import { renderMarkdown, excerptFromMarkdown } from '../backend/lib/markdown.js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

function mediaUrl(path) {
  if (!path || !client) return null;
  return client.storage.from('media').getPublicUrl(path).data?.publicUrl || null;
}

// Published blog posts, shaped for prerendering (rendered HTML + cover URL).
export async function loadPublishedPosts() {
  if (!client) {
    console.warn('[build] Supabase not configured — blog will prerender empty.');
    return [];
  }
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) {
    console.warn(`[build] could not load blog posts: ${error.message}`);
    return [];
  }
  return (data || []).map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || excerptFromMarkdown(row.body_md),
    html: renderMarkdown(row.body_md),
    coverUrl: mediaUrl(row.cover_path),
    tags: row.tags || [],
    seo: row.seo || {},
    publishedAt: row.published_at,
    updatedAt: row.updated_at
  }));
}

// Content overrides as { key: value }, for baking edited copy into prerendered
// HTML. Empty if the DB is unconfigured/unreachable — the code defaults apply.
export async function loadContentMap() {
  if (!client) return {};
  const { data, error } = await client.from('content_overrides').select('key, value');
  if (error) {
    console.warn(`[build] could not load content overrides: ${error.message}`);
    return {};
  }
  const map = {};
  for (const row of data || []) map[row.key] = row.value;
  return map;
}

// Per-route SEO overrides as { path: overrideRow }.
export async function loadSeoMap() {
  if (!client) return {};
  const { data, error } = await client.from('seo_overrides').select('*');
  if (error) {
    console.warn(`[build] could not load SEO overrides: ${error.message}`);
    return {};
  }
  const map = {};
  for (const row of data || []) map[row.path] = row;
  return map;
}

// Pricing overrides as { slug: pricingBlock }, for baking overridden starting
// prices into prerendered listing badges.
export async function loadPricingOverrides() {
  if (!client) return {};
  const { data, error } = await client.from('pricing_overrides').select('slug, pricing');
  if (error) {
    console.warn(`[build] could not load pricing overrides: ${error.message}`);
    return {};
  }
  const map = {};
  for (const row of data || []) map[row.slug] = row.pricing;
  return map;
}

// Redirects, for baking into the edge middleware module.
export async function loadRedirects() {
  if (!client) return [];
  const { data, error } = await client.from('redirects').select('source, destination, code');
  if (error) {
    console.warn(`[build] could not load redirects: ${error.message}`);
    return [];
  }
  return data || [];
}

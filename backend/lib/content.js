// CMS resolver: content overrides + per-route SEO overrides, cached in memory.
//
// Content lives in Supabase (dashboard-authored); code keeps hardcoded defaults.
// A row here WINS over the default when present, so the site works fully before
// anything is edited and never breaks if the DB is briefly unreachable.
//
// Cached ~60s (same shape as backend/lib/fx.js) and invalidated on write, so an
// edit shows within a minute without a rebuild for runtime reads. (SEO baked
// into static HTML still needs a rebuild — that's what the deploy hook is for.)

import { supabaseAdmin } from './clients.js';

const TTL_MS = 60 * 1000;

const cache = {
  content: { at: 0, map: null },
  seo: { at: 0, map: null }
};

function fresh(entry) {
  return entry.map && Date.now() - entry.at < TTL_MS;
}

// { key: value } map of all content overrides. Values are arbitrary JSON.
export async function getContentMap() {
  if (fresh(cache.content)) return cache.content.map;
  if (!supabaseAdmin) return cache.content.map || {};
  const { data, error } = await supabaseAdmin.from('content_overrides').select('key, value');
  if (error) return cache.content.map || {};
  const map = {};
  for (const row of data || []) map[row.key] = row.value;
  cache.content = { at: Date.now(), map };
  return map;
}

// { path: overrideObject } map of all SEO overrides.
export async function getSeoMap() {
  if (fresh(cache.seo)) return cache.seo.map;
  if (!supabaseAdmin) return cache.seo.map || {};
  const { data, error } = await supabaseAdmin.from('seo_overrides').select('*');
  if (error) return cache.seo.map || {};
  const map = {};
  for (const row of data || []) map[row.path] = row;
  cache.seo = { at: Date.now(), map };
  return map;
}

// Force a refresh on next read (called after a dashboard write).
export function invalidateContentCache() {
  cache.content = { at: 0, map: cache.content.map };
  cache.seo = { at: 0, map: cache.seo.map };
}

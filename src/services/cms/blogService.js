// Blog posts. The API returns HTML that the server has already sanitised, so
// nothing here re-processes it — sanitising twice invites a bypass, and doing
// it in the browser would trust the client.

import { getBlogPosts, getBlogPost } from '../blog';
import { cached, invalidate } from './cache';

const KEY = 'blog:';
const TTL = 5 * 60_000;   // posts change rarely; a longer hold is safe

export async function list() {
  return cached(`${KEY}list`, getBlogPosts, { ttl: TTL });
}

export async function bySlug(slug) {
  if (!slug) return null;
  return cached(`${KEY}one:${slug}`, () => getBlogPost(slug), { ttl: TTL });
}

/** Recent posts for a sidebar or footer rail. */
export async function recent(limit = 3) {
  const posts = await list();
  return posts.slice(0, limit);
}

export function clear() {
  invalidate(KEY);
}

export default { list, bySlug, recent, clear };

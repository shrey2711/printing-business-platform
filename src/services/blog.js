// Public blog reads. Returns posts with server-rendered, sanitized HTML.
export async function getBlogPosts() {
  const res = await fetch('/api/blog');
  if (!res.ok) return [];
  return (await res.json()).posts || [];
}

export async function getBlogPost(slug) {
  const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return (await res.json()).post || null;
}

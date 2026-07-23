import { authHeader } from '../lib/supabase';

// Shared fetch helper for the dashboard: attaches the bearer token, and turns
// non-2xx responses into thrown Errors carrying the server's message.
async function req(path, { method = 'GET', body, isForm } = {}) {
  const headers = { ...(await authHeader()) };
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) throw new Error('Please sign in.');
  if (res.status === 403) throw new Error('You are not authorized for that.');
  if (res.status === 503) throw new Error("The dashboard isn't configured yet (see DEPLOY.md).");
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'Request failed.');
  }
  return res.status === 204 ? null : res.json();
}

// ── Users / roles ────────────────────────────────────────────────────────────
export const listStaff = () => req('/api/admin/users').then((r) => r.users);
export const setStaffRole = (email, role) => req('/api/admin/users', { method: 'POST', body: { email, role } });
export const removeStaff = (userId) => req(`/api/admin/users/${userId}`, { method: 'DELETE' });

// ── Blog ─────────────────────────────────────────────────────────────────────
export const listPosts = () => req('/api/admin/blog').then((r) => r.posts);
export const getPost = (id) => req(`/api/admin/blog/${id}`).then((r) => r.post);
// create/update return { post, rebuild } so the editor can report the rebuild.
export const createPost = (post) => req('/api/admin/blog', { method: 'POST', body: post });
export const updatePost = (id, patch) => req(`/api/admin/blog/${id}`, { method: 'PUT', body: patch });
export const deletePost = (id) => req(`/api/admin/blog/${id}`, { method: 'DELETE' });
export const requestRebuild = () => req('/api/admin/rebuild', { method: 'POST' });

export async function uploadMedia(file) {
  const form = new FormData();
  form.append('file', file);
  return req('/api/admin/media', { method: 'POST', body: form, isForm: true });
}

// ── Content overrides ────────────────────────────────────────────────────────
export const listContent = () => req('/api/admin/content').then((r) => r.content);
export const saveContent = (key, value) =>
  req(`/api/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', body: { value } });

// ── SEO overrides ────────────────────────────────────────────────────────────
export const listSeo = () => req('/api/admin/seo').then((r) => r.seo);
export const saveSeo = (path, fields) =>
  req(`/api/admin/seo/${path.replace(/^\//, '')}`, { method: 'PUT', body: fields });

// ── Redirects ────────────────────────────────────────────────────────────────
export const listRedirects = () => req('/api/admin/redirects').then((r) => r.redirects);
export const saveRedirect = (redirect) => req('/api/admin/redirects', { method: 'POST', body: redirect });
export const deleteRedirect = (id) => req(`/api/admin/redirects/${id}`, { method: 'DELETE' });

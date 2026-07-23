import { useEffect, useState } from 'react';
import {
  listPosts, getPost, createPost, updatePost, deletePost, uploadMedia, requestRebuild
} from '../../services/adminCms';

const BLANK = { title: '', slug: '', excerpt: '', body_md: '', cover_path: '', coverUrl: '', tags: [], status: 'draft', seo: {} };

// Blog manager: list ↔ editor. Publishing triggers a site rebuild server-side.
export default function BlogTab({ onError, onFlash }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view; object = editing

  const load = () =>
    listPosts()
      .then(setPosts)
      .catch((e) => onError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => setEditing({ ...BLANK });
  const openEdit = async (p) => {
    try {
      setEditing(await getPost(p.id));
    } catch (e) {
      onError(e.message);
    }
  };

  const afterSave = (rebuild) => {
    if (rebuild?.triggered) onFlash('✓ Saved — site rebuilding, live in ~2 min');
    else onFlash('✓ Saved');
    setEditing(null);
    load();
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      const { rebuild } = await deletePost(p.id);
      setPosts((prev) => prev.filter((x) => x.id !== p.id));
      onFlash(rebuild?.triggered ? '✓ Deleted — site rebuilding' : '✓ Deleted');
    } catch (e) {
      onError(e.message);
    }
  };

  const rebuildNow = async () => {
    try {
      const r = await requestRebuild();
      onFlash(r?.triggered ? '✓ Rebuild started — live in ~2 min' : `Rebuild not triggered (${r?.reason || 'unknown'})`);
    } catch (e) {
      onError(e.message);
    }
  };

  if (editing) {
    return <BlogEditor initial={editing} onCancel={() => setEditing(null)} onSaved={afterSave} onError={onError} />;
  }

  return (
    <>
      <div className="tab-head" style={{ justifyContent: 'space-between' }}>
        <button className="btn btn-outline btn-sm" onClick={rebuildNow} title="Rebuild the static site now">↻ Rebuild site</button>
        <button className="btn btn-red btn-sm" onClick={openNew}>+ New post</button>
      </div>

      {loading ? (
        <p className="muted">Loading posts…</p>
      ) : posts.length === 0 ? (
        <div className="empty-state card"><p>No posts yet. Create your first one.</p></div>
      ) : (
        <div className="admin-table card">
          <div className="cms-row blog-row cms-row-head">
            <span>Title</span><span>Status</span><span>Updated</span><span></span>
          </div>
          {posts.map((p) => (
            <div className="cms-row blog-row" key={p.id}>
              <span className="wrap">
                <strong>{p.title}</strong>
                <br /><small className="muted mono">/blog/{p.slug}</small>
              </span>
              <span><em className={`blog-status-pill ${p.status}`}>{p.status}</em></span>
              <span className="muted">{new Date(p.updated_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-ghost-danger btn-sm" onClick={() => remove(p)}>✕</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function BlogEditor({ initial, onCancel, onSaved, onError }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (status) => {
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        body_md: form.body_md,
        cover_path: form.cover_path || null,
        tags: form.tags,
        seo: form.seo || {},
        status: status ?? form.status
      };
      const saved = form.id
        ? await updatePost(form.id, payload)
        : await createPost(payload);
      // createPost/updatePost return the post; the rebuild flag rides on the
      // service response — re-read via a fresh save call isn't needed here.
      onSaved(saved?.rebuild);
    } catch (e) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { path, url } = await uploadMedia(file);
      setForm((f) => ({ ...f, cover_path: path, coverUrl: url }));
    } catch (err) {
      onError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="blog-editor">
      <div className="blog-editor-main">
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Post title" />
        </div>
        <div className="field">
          <label>Slug</label>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated from title if blank" />
          <small>URL: /blog/{form.slug || '…'}</small>
        </div>
        <div className="field">
          <label>Body (Markdown)</label>
          <textarea
            className="body-md"
            value={form.body_md}
            onChange={(e) => set('body_md', e.target.value)}
            placeholder="Write in Markdown — # headings, **bold**, [links](url), ![images](url)…"
          />
        </div>
      </div>

      <aside className="blog-editor-side">
        <div className="card">
          <span className={`blog-status-pill ${form.status}`}>{form.status}</span>
          <div className="proof-actions" style={{ marginTop: '0.8rem' }}>
            <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => save('draft')}>Save draft</button>
            <button className="btn btn-red btn-sm" disabled={busy} onClick={() => save('published')}>Publish</button>
          </div>
          <p className="rebuild-note">Publishing rebuilds the site — the post is live in about 2 minutes.</p>
          <button className="btn btn-ghost-danger btn-sm btn-block" style={{ marginTop: '0.6rem' }} onClick={onCancel}>Cancel</button>
        </div>

        <div className="card">
          <div className="field">
            <label>Excerpt</label>
            <textarea
              style={{ minHeight: '70px' }}
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="Short summary (auto-generated if blank)"
            />
          </div>
          <div className="field">
            <label>Cover image</label>
            <input type="file" accept="image/*" onChange={onCover} disabled={uploading} />
            {uploading && <small>Uploading…</small>}
            {form.coverUrl && <img className="cover-preview" src={form.coverUrl} alt="cover preview" />}
          </div>
          <div className="field">
            <label>Tags (comma separated)</label>
            <input
              value={(form.tags || []).join(', ')}
              onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              placeholder="canopy tips, events"
            />
          </div>
        </div>

        <div className="card">
          <div className="field">
            <label>SEO title (optional)</label>
            <input
              value={form.seo?.title || ''}
              onChange={(e) => set('seo', { ...form.seo, title: e.target.value })}
              placeholder="Overrides the post title in search results"
            />
          </div>
          <div className="field">
            <label>SEO description (optional)</label>
            <textarea
              style={{ minHeight: '60px' }}
              value={form.seo?.description || ''}
              onChange={(e) => set('seo', { ...form.seo, description: e.target.value })}
              placeholder="Overrides the excerpt in search results"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

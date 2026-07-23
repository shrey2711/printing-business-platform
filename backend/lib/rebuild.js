// Trigger a production rebuild so newly published/edited content gets baked into
// the prerendered static HTML and sitemap. Fires a Vercel Deploy Hook.
//
// IMPORTANT: only ever called from explicit publish/edit/rebuild actions —
// never from the build itself — so there is no publish→build→publish loop.

const HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL;

// Coalesce bursts: several edits in a row should cause ONE rebuild, not ten.
let pending = null;

export function rebuildConfigured() {
  return Boolean(HOOK_URL);
}

// Returns { triggered, reason }. Never throws — a failed rebuild must not fail
// the content save that requested it.
export async function triggerRebuild() {
  if (!HOOK_URL) return { triggered: false, reason: 'no-hook-configured' };
  if (pending) return { triggered: true, reason: 'already-queued' };

  // Debounce ~10s so a save-then-publish is a single deploy.
  pending = setTimeout(() => {
    pending = null;
  }, 10000);

  try {
    const res = await fetch(HOOK_URL, { method: 'POST' });
    if (!res.ok) return { triggered: false, reason: `hook-${res.status}` };
    return { triggered: true, reason: 'deploy-hook-fired' };
  } catch (err) {
    return { triggered: false, reason: err.message };
  }
}

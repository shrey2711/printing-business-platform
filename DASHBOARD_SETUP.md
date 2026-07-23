# Dashboard setup (Phases A + B)

Do these once. Until they're done, the dashboard degrades safely: the site
runs, but blog/roles won't work.

## 1. Run the migration
Supabase → SQL Editor → New query → paste **`supabase/admin-dashboard.sql`** → Run.
Creates the roles, blog, CMS, SEO and pricing tables plus the public `media`
bucket. Safe to re-run.

## 2. Make yourself an admin
In the SQL editor (find your id under Authentication → Users):
```sql
insert into public.admin_users (user_id, role) values ('<your-user-uuid>', 'admin');
```
Until you do this, the `ADMIN_EMAILS` env allowlist still grants you admin as a
fallback, so you're never locked out.

## 3. Build env vars (Vercel → Settings → Environment Variables)
The build now reads the blog from Supabase, so these must be present for the
**Build** environment (not just Runtime). If they already exist, just tick
"Build" as well:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (preferred) — or `SUPABASE_ANON_KEY` works, since
  published posts are public-readable.

Without these the build still succeeds — the blog just prerenders empty.

## 4. Deploy hook (enables rebuild-on-publish)
Vercel → Settings → Git → Deploy Hooks → create one on branch `main`
(name it e.g. "content-rebuild"). Copy the URL into an env var:
- `VERCEL_DEPLOY_HOOK_URL = https://api.vercel.com/v1/integrations/deploy/...`

Without it, publishing still saves the post; it just won't auto-rebuild — you'd
use the manual **↻ Rebuild site** button or a normal deploy.

## How publishing works
Draft → saved to DB, not public, not in the sitemap. Publish → fires the deploy
hook → the build bakes the post into static HTML + sitemap → live in ~2 min.
This keeps every page static and fast; there's no per-request rendering.

## Verify it end-to-end
1. Open `/admin` on the deployed site → **Blog** tab → New post → Publish.
2. Watch a deploy start in Vercel (~2 min).
3. Load `/blog` and `/blog/<slug>` — the post should be there.
4. `view-source` on the post: the article HTML + `BlogPosting` JSON-LD should be
   in the initial HTML (not just after JS runs).
5. Roles: add someone as `editor` in the Users tab → they see Blog/Content/SEO
   but not Orders/Users.

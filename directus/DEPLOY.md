# Deploying Directus

Directus is a long-running server. It **cannot** run on Vercel serverless
functions, so the storefront stays on Vercel and Directus goes somewhere that
runs a container. Both talk to the same Supabase database.

```
  Editor ──► Directus (Railway/Render/Cloud) ──┐
                                               ├──► Supabase Postgres
  Vercel build ──► cms-pull.mjs ───────────────┘         │
        │                                                │
        └──► content_overrides ◄──────────────────────────┘
                    │
                    ├──► prerender.mjs   (crawlers see edited copy)
                    └──► /api/content    (visitors, ~60s, no rebuild)
```

Until Directus has a public URL, `cms-pull` fails the deploy rather than
shipping silently — editors would otherwise believe their changes are live.

---

## Choose a host

| Host | Cost | Notes |
| --- | --- | --- |
| **Railway** (recommended) | ~$5/mo | Deploys this folder directly. Simplest path. |
| **Render** | ~$7/mo | `render.yaml` in this folder. Free tier sleeps — the CMS is slow to wake and a sleeping instance fails the build. |
| **Directus Cloud** | from ~$15/mo | Managed upgrades and backups. You do not manage the container. |

Any Docker host works; these three are just the least setup.

---

## 1. Storage must move off local disk

`STORAGE_LOCATIONS=local` writes uploads into the container. **Every redeploy
wipes them**, so images an editor uploaded vanish while the pages referencing
them stay. Switch to Supabase Storage, which is S3-compatible.

Create a bucket named `directus` in Supabase → Storage, then in Supabase →
Project Settings → Storage → S3 access keys, create one. Set:

```
STORAGE_LOCATIONS=s3
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=<access key id>
STORAGE_S3_SECRET=<secret access key>
STORAGE_S3_BUCKET=directus
STORAGE_S3_REGION=us-east-2
STORAGE_S3_ENDPOINT=https://yahqnzvpuikqbwmlwlux.supabase.co/storage/v1/s3
STORAGE_S3_FORCE_PATH_STYLE=true
```

Do this **before** editors start uploading, or you will lose their work.

---

## 1b. Pin the database certificate

Locally, `DB_SSL__REJECT_UNAUTHORIZED=false` is tolerable. In production it is
not: the connection carries the Postgres superuser password, and without
verification an active man-in-the-middle can read it. Supabase's pooler presents
a self-signed chain, so plain verification fails — the CA has to be pinned.

Supabase -> Settings -> Database -> SSL Configuration -> Download certificate.
Then set BOTH, together:

```
DB_SSL__REJECT_UNAUTHORIZED=true
DB_SSL__CA=<the full PEM, ----BEGIN CERTIFICATE---- through ----END CERTIFICATE---->
```

Setting `true` without the CA breaks the connection; setting `false` is what you
are trying to get away from. Verify after deploying:

```bash
node scripts/check-directus-db.mjs directus/.env.production
```

---

## 2. Deploy

### Railway

**Railway ignores `docker-compose.yml`.** Pointed at this repo without a root
directory it finds the root `package.json`, builds the *storefront*, and fails:

```
✗ DIRECTUS_URL / DIRECTUS_TOKEN are not set in this deployment environment.
process "npm run build" did not complete successfully: exit code 1
```

That message means Railway is building the wrong application. `directus/Dockerfile`
and `directus/railway.json` exist so it builds the CMS instead.

1. New Project → Deploy from GitHub repo → pick this repo.
2. **Settings → Source → Root Directory: `directus`.** This is the step that
   matters; without it Railway builds the storefront.
   Confirm Builder is **Dockerfile** (railway.json sets this).
3. **Settings → Networking → Generate Domain.** Railway does not expose a
   service publicly by default, and an unreachable CMS fails the Vercel build.
4. Variables → add everything from your local `directus/.env`, **except**:
   - `PUBLIC_URL` → the Railway domain from step 3
   - `CORS_ORIGIN` → `https://www.apextradeshow.com`
   - the storage block from step 1 and the TLS pair from step 1b
   - do **not** set `PORT`; Railway supplies it
5. `KEY` and `SECRET` must be the **same values** as local. Changing `SECRET`
   invalidates every session and the read-only build token.

### Render

`render.yaml` is in this folder. Render → New → Blueprint → point at the repo.
It creates the service with the right image and health check; fill the secrets
in the dashboard (they are marked `sync: false` so they are never in git).

### Directus Cloud

Create a project, choose "connect existing database", give it the same Supabase
session-pooler credentials from `directus/.env`. Then skip to step 3 — the
schema and your admin user are already in the database.

---

## 3. Point the storefront at it

In Vercel → Settings → Environment Variables:

```
DIRECTUS_URL=https://<your directus host>
DIRECTUS_TOKEN=<the read-only token>
```

The token is the one from `create-sync-token.mjs`. It must be the **read-only**
build token, never an admin token — it lives in a build environment and only
needs to read published content.

Lost it? Re-run to rotate:

```bash
cd directus
DIRECTUS_URL=https://<host> DIRECTUS_ADMIN_TOKEN=<admin> node scripts/create-sync-token.mjs
```

---

## 4. Verify before trusting it

```bash
node scripts/check-directus-remote.mjs https://<your directus host>
```

Checks that the instance is reachable, the collections exist, the token is
read-only, and the storefront origin is allowed by CORS. Then:

```bash
DIRECTUS_URL=https://<host> DIRECTUS_TOKEN=<token> node scripts/cms-pull.mjs --dry-run
```

Nothing is written by either command.

---

## 5. Publishing an edit

An edit in Directus reaches the site on the next build. To publish immediately,
redeploy from Vercel, or add a Directus flow (Settings → Flows) with a
**Webhook** operation pointing at your Vercel deploy hook, triggered on save of
the collections you care about.

---

## Notes

- **Back up before you rely on it.** Supabase backs up the database nightly,
  which covers content. It does not cover uploaded files once they live in
  Storage — those follow the bucket's own retention.
- **Upgrading:** change the pinned tag, redeploy, watch the logs for migrations.
  Take a database snapshot first; Directus migrations are not reversible.
- **The admin app is public** at `https://<host>/admin`. Anyone with the URL sees
  a login page. Use a strong admin password and turn on 2FA
  (Settings → Users → your user → Two-Factor Authentication).

# Deployment

Two services, one database.

```
  ┌─ Vercel ───────────────┐        ┌─ Railway ──────────────┐
  │ storefront (React SPA) │        │ Directus 12.3.1        │
  │ prerendered HTML       │        │ admin UI + REST API    │
  │ /api/* serverless      │        └───────────┬────────────┘
  └───────────┬────────────┘                    │
              │                                 │
              └──────── Supabase Postgres ──────┘
                        (public + directus schemas)
                                │
                        Supabase Storage (S3)
                        uploaded media
```

The storefront stays on Vercel. Directus needs a long-running process, which
Vercel's serverless functions are not, so it runs as a container elsewhere. Both
talk to the same Supabase project, in separate schemas.

Content flows **one way at build time**: `scripts/cms-pull.mjs` reads published
Directus records and writes them into the tables the site already reads. The
browser never talks to Directus — see [src/services/cms/index.js](src/services/cms/index.js)
for why.

---

## 1. Storefront — Vercel

Nothing about hosting changed. Build command is unchanged:

```
npm run build
```

which runs media and pricing checks, pulls CMS content, exports redirects, builds
with Vite, then prerenders every route.

### Environment variables

| Variable | Value | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` | Public; the browser uses it |
| `VITE_SUPABASE_ANON_KEY` | anon key | Public by design |
| `SUPABASE_URL` | same URL | Server side |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **Secret.** Never prefix with `VITE_` |
| `DIRECTUS_URL` | `https://<your-directus>.up.railway.app` | No trailing slash |
| `DIRECTUS_TOKEN` | read-only build token | From `create-sync-token.mjs`. **Not** an admin token |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | existing | Unchanged |
| `BREVO_API_KEY`, `BREVO_LIST_ID` | existing | Unchanged |

`DIRECTUS_TOKEN` must be the value alone — 64 hex characters, no
`DIRECTUS_TOKEN=` prefix, no trailing newline. Pasting the whole line is the
most common cause of a build that succeeds while publishing nothing.

### What the build does when Directus is unavailable

| Situation | Build | Site |
| --- | --- | --- |
| Directus down or unreachable | succeeds | serves the last synced content |
| Token rejected (401/403) | **fails** | — a wrong token never fixes itself |
| Only one of URL/TOKEN set | **fails** | — always a mistake |
| `DIRECTUS_URL` is localhost | **fails** | — a deploy host cannot reach it |
| Neither set, no CMS content yet | succeeds | shipped defaults |
| Neither set, but CMS content exists | **fails** | — would freeze content silently |

An outage is survivable and must not break a deploy. A misconfiguration is not
survivable, because it publishes nothing while looking healthy.

---

## 2. Directus — Railway

Full walkthrough in [directus/DEPLOY.md](directus/DEPLOY.md). The essentials:

### Docker

`directus/Dockerfile` is the pinned official image and nothing else — no npm
install, no compilation, since the image already ships `isolated-vm` and `sharp`
prebuilt. `directus/railway.json` selects the Dockerfile builder and the
`/server/ping` health check.

`directus/docker-compose.yml` is for running locally. **Railway ignores compose
files**, which is why the Dockerfile exists: pointed at this repo without a root
directory, Railway finds the root `package.json` and builds the storefront.

### Service settings that are easy to miss

| Setting | Value | If wrong |
| --- | --- | --- |
| Root Directory | `directus` | Railway builds the storefront instead |
| Builder | Dockerfile | — |
| Public domain | Generate one | Vercel cannot reach the CMS |
| Domain target port | must match the app's port | `Application failed to respond` |

The deploy log states the port it bound: `Server started at http://0.0.0.0:8055`.
The domain's target port must be that number.

### Environment variables

Database — Supabase **session pooler**, port 5432:

```
DB_CLIENT=pg
DB_HOST=aws-<n>-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres.<project-ref>
DB_PASSWORD=<database password>
DB_SEARCH_PATH=directus,public
DB_SSL__REJECT_UNAUTHORIZED=true
DB_SSL__CA=<the project's CA certificate, PEM>
```

Security and identity — `KEY` and `SECRET` must match any other instance sharing
this database. Changing `SECRET` invalidates every session and token:

```
KEY=<32-byte hex>
SECRET=<32-byte hex>
ADMIN_EMAIL=<first admin>
ADMIN_PASSWORD=<used once, at first boot>
```

Public URL and CORS:

```
PUBLIC_URL=https://<your-directus>.up.railway.app
HOST=0.0.0.0
CORS_ENABLED=true
CORS_ORIGIN=https://www.apextradeshow.com
```

Storage — Supabase Storage over S3. **`STORAGE_LOCATIONS` and
`STORAGE_S3_DRIVER` are both the literal word `s3`**; only `_KEY` and `_SECRET`
hold credentials:

```
STORAGE_LOCATIONS=s3
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=<access key id>
STORAGE_S3_SECRET=<secret access key>
STORAGE_S3_BUCKET=<bucket name, case-sensitive>
STORAGE_S3_REGION=<project region>
STORAGE_S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
STORAGE_S3_FORCE_PATH_STYLE=true
```

Rest:

```
FILES_MAX_UPLOAD_SIZE=25mb
RATE_LIMITER_ENABLED=true
RATE_LIMITER_POINTS=50
RATE_LIMITER_DURATION=1
TELEMETRY=false
```

Do **not** set `PORT` unless the domain's target port is set to match.

---

## 3. First-time setup, in order

```bash
# 1. Database schema — once, in the Supabase SQL editor
#    supabase/directus-schema.sql   (creates the directus schema)
#    supabase/seo-manager.sql       (adds the SEO override columns)

# 2. Check the connection BEFORE starting the container
node scripts/check-directus-db.mjs

# 3. Deploy Directus on Railway, then apply the content model
cd directus
DIRECTUS_URL=https://<host> DIRECTUS_ADMIN_TOKEN=<admin> node scripts/apply-schema.mjs
node scripts/configure-products.mjs      # archive, uniqueness, per-image alt
node scripts/configure-media.mjs         # WebP presets, restrict transforms
node scripts/configure-roles.mjs         # Content Manager and Staff
node scripts/create-sync-token.mjs       # prints the read-only build token, once

# 4. Move existing content in (repeatable)
cd ..
node scripts/migrate-directus/index.mjs --dry-run
node scripts/migrate-directus/index.mjs

# 5. Point Vercel at the CMS, then redeploy
#    DIRECTUS_URL and DIRECTUS_TOKEN
```

---

## 4. Verify a deployment

```bash
npm run verify:deploy
```

Checks the database connection, the CMS over HTTPS, that all 16 collections are
readable through the endpoints the build uses, that the build token is read-only
(by attempting a write and requiring a refusal), CORS, and durable storage. Then
runs the content sync in dry-run so you can see what a build would publish.

Nothing is written by any of it.

---

## 5. When something is wrong

Every one of these was hit while setting this up, and each reports as something
that points elsewhere.

| Symptom | Cause |
| --- | --- |
| `npm run build` fails on `verify-media` etc. during a **Railway** deploy | Root Directory is not `directus`; Railway is building the storefront |
| `Application failed to respond`, `x-railway-fallback: true` | The domain's target port does not match the port in the deploy log |
| `tenant/user postgres.<ref> not found` | Wrong instance number in the pooler host — it is not always `aws-0` |
| `no tenant identifier provided` | `DB_USER` is plain `postgres`; it must be `postgres.<ref>` |
| Auth fails with a password you know is right | The env file was saved with CRLF; the trailing CR goes into the value |
| `Driver "<hex>" doesn't exist` | A credential was pasted into `STORAGE_S3_DRIVER`; it is the literal `s3` |
| `Service "files" is unavailable. Couldn't save file` | Bucket name mismatch — S3 bucket names are case-sensitive |
| Build green, CMS edits not on the site | `DIRECTUS_TOKEN` wrong, or pasted with its prefix |
| `prerender: dist/index.html has already been prerendered` | `prerender.mjs` run without `vite build` first; use `npm run build` |
| Uploaded images vanish after a redeploy | Storage is still container-local; switch to S3 |

---

## 6. Ongoing

**Costs.** Railway bills by usage — roughly $5/month for a container this size.
Supabase and Vercel are unchanged. If Railway stops, the CMS goes offline, the
site keeps serving the last synced content, and editing stops working.

**Upgrading Directus.** Change the pinned tag in `directus/Dockerfile`, take a
database snapshot, redeploy, and watch the logs. Migrations are not reversible.

**Backups.** Supabase backs up the database nightly, which covers content and
schema. Uploaded files follow the storage bucket's own retention.

**The admin app is public** at `https://<host>/admin`. Use a strong admin
password and turn on 2FA under Settings → Users.

# Directus setup

Everything needed to install, host, connect, back up and update the CMS.

Directus is the **authoring layer**. It does not serve the storefront and is
deliberately kept away from anything that takes money:

| Stays where it is | Managed in Directus |
| --- | --- |
| Stripe checkout, orders, invoices | Products, categories, pages |
| The pricing engine (`backend/data/pricing.js`) | Blog posts and Learning Center articles |
| Prerendering and the SEO audits | Homepage blocks, banners, navigation |
| Supabase Auth and the customer account area | Per-URL SEO overrides |
| | Media library |

Content is pulled into the build by `scripts/cms-pull.mjs`. The browser never
talks to Directus, so a CMS outage cannot take the site down.

For the two-service picture (Vercel + Railway), see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 1. Installation

Docker is the supported path. The official image ships the native modules
(`isolated-vm`, `sharp`) prebuilt; installing via npm on Windows or macOS needs a
full C++ toolchain to compile `isolated-vm`.

### Locally

```bash
cp directus/.env.example directus/.env      # then fill it in — section 2
node scripts/check-directus-db.mjs          # verify the database first
cd directus && docker compose up -d
docker compose logs -f directus             # watch the first-run migrations
```

Open <http://localhost:8055>.

Save `directus/.env` with **LF** line endings. Docker's `env_file` parser carries
a trailing CR into the value on a CRLF file, so authentication fails with a
password that is actually correct.

### Hosted

`directus/Dockerfile` is the pinned official image and nothing else — no build
step. See section 3.

---

## 2. Environment variables

Full template with commentary: [directus/.env.example](directus/.env.example).

### Database

Supabase → Project Settings → Database → Connection string → **Session pooler**.
Copy the host and user verbatim.

```
DB_CLIENT=pg
DB_HOST=aws-<n>-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres.<project-ref>
DB_PASSWORD=<database password>
DB_SEARCH_PATH=directus,public
```

Three things that are easy to get wrong, each of which reports as something else:

- **Use the session pooler on 5432**, not the transaction pooler on 6543.
  Directus runs migrations and needs prepared statements, which the transaction
  pooler does not support.
- **Do not use the direct connection** (`db.<ref>.supabase.co`). It is IPv6-only
  on current projects and does not resolve from most container networks.
- **The instance number is not always `aws-0`.** Wrong number gives
  `tenant/user postgres.<ref> not found`, which reads like a credentials problem.
  And `DB_USER` must be `postgres.<project-ref>`; plain `postgres` gives
  `no tenant identifier provided`.

### TLS

Supabase presents a self-signed chain, so verification needs its CA pinned.
Supabase → Settings → Database → SSL configuration → Download certificate.

```
DB_SSL__REJECT_UNAUTHORIZED=true
DB_SSL__CA=<the PEM contents>
```

Both together: `true` without the CA breaks the connection, and `false` sends the
database superuser password over a connection open to an active
man-in-the-middle. `false` is tolerable locally and not in production.

### Security

```
KEY=<32-byte hex>       # openssl rand -hex 32
SECRET=<32-byte hex>    # a DIFFERENT value
```

Every instance sharing a database must use the same pair. Changing `SECRET`
invalidates every session and every token, including the build token.

### First admin

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<strong password>
```

Used once, at first boot. See section 5.

### Public URL and CORS

```
PUBLIC_URL=https://<your-directus-host>
HOST=0.0.0.0
CORS_ENABLED=true
CORS_ORIGIN=https://www.apextradeshow.com
```

`PUBLIC_URL` must be exact — asset URLs and the admin app's own API calls are
built from it.

### Storage

Container-local disk does not survive a redeploy: files vanish while the records
pointing at them remain. Use Supabase Storage, which is S3-compatible.

Create a bucket in Supabase → Storage (private; Directus signs its own URLs),
then Settings → Storage → S3 access keys.

```
STORAGE_LOCATIONS=s3
STORAGE_S3_DRIVER=s3
STORAGE_S3_KEY=<access key id>
STORAGE_S3_SECRET=<secret access key>
STORAGE_S3_BUCKET=<bucket name>
STORAGE_S3_REGION=<project region>
STORAGE_S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
STORAGE_S3_FORCE_PATH_STYLE=true
```

`STORAGE_LOCATIONS` and `STORAGE_S3_DRIVER` are **both the literal word `s3`** —
a label and a driver type. Only `_KEY` and `_SECRET` hold credentials; a key
pasted into `STORAGE_S3_DRIVER` gives `Driver "<hex>" doesn't exist`.

**Bucket names are case-sensitive.** A bucket called `DIRECTUS` with
`STORAGE_S3_BUCKET=directus` fails with
`Service "files" is unavailable. Couldn't save file`.

---

## 3. Railway deployment

Railway **ignores `docker-compose.yml`** and builds from a Dockerfile.

1. New Project → Deploy from GitHub repo → this repo.
2. **Settings → Source → Root Directory: `directus`.** Without it Railway finds
   the root `package.json` and builds the storefront, which fails on the CMS
   guard in `npm run build`.
3. **Settings → Networking → Generate Domain.** Railway does not expose a
   service publicly by default.
4. Variables → everything from section 2.
5. Check the deploy log for `Server started at http://0.0.0.0:<port>` and set the
   domain's **target port** to that number. A mismatch gives
   `Application failed to respond` with `x-railway-fallback: true`.

Render works the same way via `directus/render.yaml`; Directus Cloud can connect
to the existing database instead, in which case skip to section 6.

---

## 4. Connecting Supabase

Directus keeps its ~30 tables in a dedicated `directus` schema
(`DB_SEARCH_PATH=directus,public`), so they cannot collide with the storefront's
tables or their RLS policies.

Run once, in the Supabase SQL editor:

| Script | What it does |
| --- | --- |
| [supabase/directus-schema.sql](supabase/directus-schema.sql) | Creates the `directus` schema |
| [supabase/seo-manager.sql](supabase/seo-manager.sql) | Adds the SEO override columns |

Then verify before starting anything:

```bash
node scripts/check-directus-db.mjs
```

It reports the connection, whether prepared statements work (proving the session
pooler), that the schema exists, and that the user can create tables there.

**One thing worth knowing:** because `public` is in the search path, Directus
manages `public.seo_overrides` — the storefront's own table — directly. Both the
CMS and the existing admin dashboard write to that one table, in different
columns. `scripts/lib/seoRow.mjs` reads both and prefers the dashboard's value,
so neither editor overwrites the other.

---

## 5. Creating the first admin

The first boot reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` and creates that account.
It happens once; changing the variables later does nothing.

Sign in at `https://<host>/admin`.

**Then:** Settings → Users → your account → enable Two-Factor Authentication. The
admin app is public to anyone with the URL.

### Later accounts

Directus → User Directory → Invite. Assign a role from
`directus/scripts/configure-roles.mjs`:

| Role | Access |
| --- | --- |
| Administrator | Everything, including settings and the data model |
| Content Manager | Products, pages, blogs, SEO, media. No settings, users or pricing |
| Staff | No CMS access — order staff work in the storefront admin |

### The build token

The storefront build needs a **read-only** token, never an admin one:

```bash
cd directus
DIRECTUS_URL=https://<host> DIRECTUS_ADMIN_TOKEN=<admin token> node scripts/create-sync-token.mjs
```

It creates a machine account with read permission and nothing else, verifies the
policy grants no writes, and prints the token once. Put it in Vercel as
`DIRECTUS_TOKEN` — the value alone, no prefix, no trailing newline. Re-running
rotates it.

Get a temporary admin token from Directus → your user → Token → Generate → Save.
Clear that field afterwards.

---

## 6. Backup procedure

Three things to back up, in decreasing order of how hard they are to recreate.

### Content and schema — the database

Supabase takes a nightly backup covering both the `public` and `directus`
schemas. Dashboard → Database → Backups. That is the safety net.

Before anything irreversible — a Directus version upgrade, a `--force`
migration, a large bulk edit — take your own snapshot first:

```bash
pg_dump "postgresql://postgres.<ref>:<password>@aws-<n>-<region>.pooler.supabase.com:5432/postgres" \
  --schema=directus --no-owner --no-privileges -f directus-backup-$(date +%F).sql
```

Restore with `psql` against the same connection string.

### Uploaded media

Files live in the Supabase storage bucket and follow that bucket's retention,
**not** the database backup. Copy them out periodically with any S3 client
pointed at `https://<ref>.supabase.co/storage/v1/s3`.

### The content model

Commit a snapshot so collections are reproducible without a database restore:

```bash
docker compose exec directus npx directus schema snapshot --yes ./schema/snapshot.yaml
```

`directus/scripts/apply-schema.mjs` is itself version-controlled and idempotent,
so the model can also be rebuilt from scratch by running it.

---

## 7. Updating the schema

The content model is code. Edit `directus/scripts/apply-schema.mjs`, then:

```bash
cd directus
DIRECTUS_URL=... DIRECTUS_ADMIN_TOKEN=... node scripts/apply-schema.mjs --dry-run
DIRECTUS_ADMIN_TOKEN=... node scripts/apply-schema.mjs
```

It creates only what is missing and **never deletes**, so it is safe to re-run
after edits. Removing a field is a deliberate act, done in the UI, because it
takes that column's data with it.

Companion scripts, all idempotent:

| Script | Purpose |
| --- | --- |
| `configure-products.mjs` | Archive round trip, unique slug/SKU, per-image alt text |
| `configure-media.mjs` | WebP presets; restricts transforms to those presets |
| `configure-roles.mjs` | Content Manager and Staff, and verifies the restrictions |

### Upgrading Directus itself

Change the pinned tag in `directus/Dockerfile`, **take a database snapshot**,
redeploy, and watch the logs for the migration run. Directus migrations are not
reversible.

---

## 8. Running migrations

`scripts/migrate-directus/` moves the site's existing content into the CMS.
Detail: [scripts/migrate-directus/README.md](scripts/migrate-directus/README.md).

```bash
export DIRECTUS_URL=https://<host>
export DIRECTUS_ADMIN_EMAIL=you@example.com
export DIRECTUS_ADMIN_PASSWORD=...

node scripts/migrate-directus/index.mjs --dry-run
node scripts/migrate-directus/index.mjs
```

Credentials rather than a token: a session token expires in about fifteen
minutes and a full migration takes longer, so the scripts sign in again mid-run.

Order matters and the runner handles it — categories before products, products
before images.

### Running it again is safe

- A missing record is **created**.
- An existing record has only its **blank** fields filled.
- A field an editor changed is **left alone**.
- Nothing is ever **deleted**.

`--force` overwrites editor changes. It exists for when the code is deliberately
the source of truth again; it is not the normal path.

### Blog and images

Blog posts need Supabase credentials in the environment:

```bash
export SUPABASE_URL=https://<ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=...
node scripts/migrate-directus/migrate-blog.mjs --dry-run
```

Images refuse to import into container-local storage, because a redeploy would
delete them while products keep referencing them. Configure S3 first (section 2),
then:

```bash
node scripts/migrate-directus/migrate-images.mjs --dry-run
```

---

## 9. Verifying

```bash
npm run verify:deploy
```

Checks the database connection, the CMS over HTTPS, that every collection is
readable through the endpoints the build actually uses, that the build token is
read-only (by attempting a write and requiring a refusal), CORS, and durable
storage — then shows what a build would publish. Nothing is written.

---

## 10. Backing out

Directus can be removed without touching the storefront: it is an authoring
layer, and the site reads from Supabase tables either way.

1. Remove `DIRECTUS_URL` and `DIRECTUS_TOKEN` from Vercel. `cms-pull` then skips
   and the site keeps the content already synced.
2. Stop the Railway service.
3. The `directus` schema can stay — it costs nothing and holds the content.

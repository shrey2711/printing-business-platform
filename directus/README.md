# Directus — Apex Trade Show CMS

Directus is the **authoring layer**. It does not serve the storefront, and it is
deliberately kept away from anything that takes money:

| Stays exactly where it is | Moves into Directus |
| --- | --- |
| Stripe checkout, orders, invoices | Blog posts and Learning Center articles |
| The pricing engine (`backend/data/pricing.js`) | Homepage text, banners, header/footer |
| Prerender (`scripts/prerender.mjs`) and the 31 SEO gates | Navigation menus |
| Supabase Auth and the customer account area | Per-page SEO fields |
| | Product content: copy, images, variants, specs |
| | Coupons and promotional banners |

Content authored here is pulled at **build time** into the existing data shape,
so `prerender.mjs` and every SEO audit keep working unchanged, and a CMS outage
can never break a deploy.

---

## Why Docker

The official image ships Directus's native modules (`isolated-vm`, `sharp`)
prebuilt. Installing via `npm` on Windows or macOS requires a full C++ toolchain
(Visual Studio Build Tools) to compile `isolated-vm`, which is why the compose
file below is the supported path. `package.json` is kept for Linux hosts
(Railway, Render, Fly) whose build images already have a toolchain, and for
running the Directus CLI inside the container.

---

## First-time setup

**1. Create the database schema** — once, before the first start.

Run [`supabase/directus-schema.sql`](../supabase/directus-schema.sql) in the
Supabase SQL Editor. It creates a dedicated `directus` schema so the CMS's ~30
tables can never collide with the storefront's tables or their RLS policies.

**2. Configure the environment.**

```bash
cp .env.example .env
```

Fill in:

- `DB_HOST` / `DB_USER` / `DB_PASSWORD` — Supabase → Project Settings →
  Database → Connection string → **Session pooler**. Copy the host and user
  verbatim; do not assemble them by hand.

  **Use the session pooler on port 5432**, not the transaction pooler on 6543:
  Directus runs migrations and needs prepared statements, which the transaction
  pooler does not support. Do not use the direct connection
  (`db.<ref>.supabase.co`) — it is IPv6-only on current projects and does not
  resolve from most Docker networks.

  Two failure modes worth recognising:

  | Error | Cause |
  | --- | --- |
  | `tenant/user postgres.<ref> not found` | Wrong instance number or region in the host. Ours is `aws-1-us-east-2`, not `aws-0`. |
  | `no tenant identifier provided` | `DB_USER` is plain `postgres`. It must be `postgres.<project-ref>`. |
  | Auth fails with a password you know is right | The file was saved with CRLF endings. Docker's `env_file` parser carries the trailing CR into the value. Save as LF. |

  Verify before starting Docker:

  ```bash
  node scripts/check-directus-db.mjs
  ```
- `KEY` and `SECRET` — two separate random values:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used once, by bootstrap. Change the
  password after first login.

None of these touch the storefront's existing Stripe or Supabase credentials.
Directus gets its own.

**3. Start it.**

```bash
docker compose up -d
docker compose logs -f directus     # watch the first-run migrations
```

Then open <http://localhost:8055> and sign in with `ADMIN_EMAIL`.

**4. Create the read-only sync token.**

In Directus: Settings → Access Tokens → create a token for a **read-only** role.
Put it in the storefront's environment as `DIRECTUS_TOKEN` (and `DIRECTUS_URL`).
The build uses it to pull published content. It must never be an admin token.

---

## Running without Docker (Linux hosts)

```bash
npm install
npm run bootstrap    # creates tables + the first admin user
npm start
```

On Windows this fails while compiling `isolated-vm` unless Visual Studio Build
Tools are installed. Use Docker instead.

---

## Everyday commands

```bash
docker compose up -d                 # start
docker compose down                  # stop
docker compose pull && docker compose up -d   # upgrade to a newer image tag

# schema as code — commit schema/snapshot.yaml so collections are reproducible
docker compose exec directus npx directus schema snapshot --yes ./schema/snapshot.yaml
docker compose exec directus npx directus schema apply --yes ./schema/snapshot.yaml
```

---

## Deploying

Directus is a long-running server and **cannot run on Vercel serverless
functions** — the storefront stays on Vercel, Directus goes elsewhere:

- **Directus Cloud** — no ops, automatic upgrades.
- **Railway / Render / Fly.io** — deploy this folder's compose file or image.
- **Any Docker host** — same compose file, behind a reverse proxy with TLS.

Whichever you choose, set `PUBLIC_URL` to the real external URL and add the
storefront's domain to `CORS_ORIGIN`.

---

## Backing out

Directus owns nothing the storefront depends on at runtime. To remove it:
stop the container, drop the schema (`DROP SCHEMA directus CASCADE;`), and
delete this folder. The committed content snapshots keep the site building.

# Deploying PrintUSA (Supabase + Vercel)

The app has two parts, both deployed together on Vercel:

- **Frontend** — React (Vite) → served as static files by Vercel
- **API** — Express (products + instant pricing) → Vercel Serverless Function at `/api/*`
- **Auth, orders, and design storage** — handled by **Supabase** directly from the browser

---

## 1. Set up Supabase (database + auth + storage)

1. Create a free project at <https://supabase.com>.
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   This creates the `orders` table, row-level security, and the private `designs`
   storage bucket.
3. Open **Authentication → Providers** and make sure **Email** is enabled.
   - For quick testing you can turn **"Confirm email"** OFF (Authentication →
     Providers → Email) so new sign-ups are logged in immediately.
4. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

> The `anon` key is safe to expose in the browser — row-level security is what
> protects the data. Never put the **service_role** key in the frontend.

---

## 2. Run locally

```bash
npm install

# create your local env file for the frontend
cp frontend/.env.example frontend/.env
# then edit frontend/.env and paste your Supabase URL + anon key

npm run dev
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:5000> (the frontend proxies `/api` to it automatically)

Without Supabase keys the storefront and instant pricing still work; login/orders
show a "connect Supabase" message.

---

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. At <https://vercel.com> → **Add New → Project** → import the repo.
3. Vercel reads [`vercel.json`](vercel.json) automatically:
   - Build command: `npm run build --workspace frontend`
   - Output: `frontend/dist`
   - `/api/*` → the serverless function in [`api/`](api/index.js)
   - all other routes → `index.html` (SPA routing)
4. In **Project → Settings → Environment Variables**, add the variables below.
5. Click **Deploy**.

> **If the import screen shows "multiple services" / a "Services" preset:** it's
> using a cached scan. Remove the half-created project and **re-import the repo
> fresh**, and set **Root Directory = repo root** (not `frontend`) and
> **Framework Preset = Other**. The repo is a single project (only the frontend
> is a workspace; `backend/` is just source imported by the `/api` function).

### Environment variables

**Frontend (browser-safe):**
| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_ADMIN_EMAILS` | comma-separated staff emails (shows the Admin link) |

**Server (API — keep secret):**
| Name | Value |
|------|-------|
| `SUPABASE_URL` | same Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key (Settings → API) |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_...`) — enables payments |
| `ADMIN_EMAILS` | comma-separated staff emails (enforced by the API) |

Payments and admin activate only once their keys are set — without them the store
still runs and shows "not enabled yet" messages. See `.env.example` files for a template.
6. After the first deploy, add your Vercel URL to Supabase under
   **Authentication → URL Configuration → Site URL / Redirect URLs**
   (e.g. `https://your-app.vercel.app`).

---

## Architecture at a glance

```
Browser (React on Vercel)
 ├── /api/products, /api/price   → Vercel Serverless (Express)  [no DB]
 ├── Supabase Auth               → login / register / session
 ├── Supabase Postgres (orders)  → protected by row-level security
 └── Supabase Storage (designs)  → uploaded & drawn artwork (private)
```

## What still needs a real business decision later
- **Payments** (Stripe) — currently orders are submitted as requests, not paid.
- **Admin dashboard** — staff view of all orders (add an `is_staff` policy).
- **Email notifications** on new orders (Supabase Edge Function or a service).

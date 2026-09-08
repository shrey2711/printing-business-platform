# Developer onboarding — environment setup

Hand this document to the developer. **Do not hand them the production `.env`.**

---

## What to send, and what not to

| Give them | Do not give them |
| --- | --- |
| This document and `.env.example` | The production `.env.local` or `directus/.env` |
| Their own Supabase project, or the anon key for a dev project | `SUPABASE_SERVICE_ROLE_KEY` for production — it bypasses every Row Level Security policy |
| Stripe **test** keys (`sk_test_…`) | Stripe **live** keys (`sk_live_…`) |
| Their own Directus user with the Content Manager role | The Directus admin email and password |
| A read-only Directus static token | An admin token |

The site takes real card payments and holds real customer orders. A developer
needs none of that to build features. Give production access only when there is
a specific reason, and give it to a named account you can revoke.

**Never send secrets over email, chat or a shared document.** Use a password
manager's share link, or add the developer to Vercel and Railway and let them
read the values from those dashboards.

---

## Getting running locally

Nothing below requires a production credential.

```bash
git clone <repo>
cd printing-business-platform
npm install
cp .env.example .env.local     # then fill in the values described below
npm run dev
```

### The minimum to see the site

The site builds and runs with **no environment file at all**. Products, pricing,
categories and content are in the repo. You only need variables to switch on
specific features:

| To work on | You need |
| --- | --- |
| Pages, products, pricing, SEO | nothing |
| Sign-in, orders, account pages | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Checkout | the two above plus `STRIPE_SECRET_KEY` (test) |
| Order and quote emails | `RESEND_API_KEY` or the `SMTP_*` set |
| Pulling content from the CMS | `DIRECTUS_URL`, `DIRECTUS_TOKEN` (read-only) |

### Running the checks

```bash
npm test
```

That runs the build plus 41 gates: SEO invariants, pricing consistency, payment
guards, artwork validation, media integrity, internal links and the location
page audits. **It must be green before anything is pushed.** It is the same
command that protects production, and it catches most mistakes long before a
deploy does.

---

## How the variables are grouped

Full descriptions are inline in [.env.example](../.env.example). The important
distinctions:

**`VITE_` variables are public.** Vite compiles them into the JavaScript bundle
that ships to the browser. Anyone can read them with devtools. A secret in a
`VITE_` variable is a published secret. This is why there are two Supabase
entries: `VITE_SUPABASE_ANON_KEY` (public, safe, guarded by Row Level Security)
and `SUPABASE_SERVICE_ROLE_KEY` (server only, bypasses all of it).

**Stripe needs both keys to work correctly.** Without
`STRIPE_WEBHOOK_SECRET` the webhook signature cannot be verified, so an order
can never be confirmed as paid. Do not work around that by marking orders paid
some other way — the payment guards exist because that bug reached production
once already.

**Directus is optional at build time.** With `DIRECTUS_URL` unset the build uses
the committed snapshots in `src/data/*.generated.js`, so a CMS outage cannot
break a deploy. Keep it that way.

**`DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` are only for migrations.**
They are not needed to run or build the site. Leave them blank.

---

## Where production values actually live

Nothing production is stored in the repo.

| Service | Where its variables are set |
| --- | --- |
| Storefront (Vercel) | Vercel -> Project -> Settings -> Environment Variables |
| Directus (Railway) | Railway -> service -> Variables |
| Database, auth, storage | Supabase dashboard |
| Payments | Stripe dashboard |

`directus/.env` is the local Docker configuration for running Directus on your
own machine. It is gitignored. See `directus/.env.example` and
`DIRECTUS_SETUP.md`.

---

## Rules that are enforced, not suggested

1. `.env`, `.env.local` and `directus/.env` are gitignored. Do not force-add
   them. If a real key ever lands in a commit, rotate the key — removing the
   commit is not enough, it is already in every clone.
2. `.env.example` is committed and must contain placeholders only.
3. Never put a secret in a `VITE_` variable.
4. `npm test` green before every push.
5. Do not change prices in the product data by hand. Pricing flows through
   `backend/lib/pricingFromCms.js`, which re-prices every configuration before
   saving, so what is quoted and what is charged cannot drift apart.

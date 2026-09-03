# Directus migrations

Move the site's existing content into the CMS. Written to be run more than once.

```bash
# from the repo root
export DIRECTUS_URL=https://your-directus-host
export DIRECTUS_ADMIN_EMAIL=you@example.com
export DIRECTUS_ADMIN_PASSWORD=...            # or DIRECTUS_ADMIN_TOKEN

node scripts/migrate-directus/index.mjs --dry-run   # show the plan, write nothing
node scripts/migrate-directus/index.mjs             # run it
```

Credentials rather than a token is the easier path: a Directus session token
expires in about fifteen minutes and a full migration takes longer, so the
scripts sign in again mid-run when they need to.

## What runs, in order

| Step | Source | Into |
| --- | --- | --- |
| Categories | `src/data/categoryPages.js` + every category a product uses | `categories` |
| Products | `backend/data/products.js` (61) | `products` |
| Navigation | `navGroups` from the product data | `navigation` |
| Blog posts | Supabase `blog_posts` | `blogs` |
| SEO | city + category URLs | `seo_overrides` |
| Images | product galleries, imported by URL | `directus_files` + product gallery |

Order matters: products link to categories, images attach to products.

## Running it again is safe

- A record that does not exist is **created**.
- A record that exists has only its **blank** fields filled.
- A field an editor has changed is **left alone**.
- Nothing is ever **deleted**.

Verified against the live instance: a title edited in Directus survived a
re-run, and a fourth consecutive run reported `0 created, 0 filled` for every
step.

`--force` overwrites editor changes. It exists for the case where the code is
deliberately the source of truth again — it is not the normal path.

## Deliberate omissions

**Prices.** The pricing engine computes from quantity tiers, size × turnaround
matrices, per-square-foot rates and option multipliers. Flattening that into a
single CMS field would put a number on screen that disagrees with checkout.
Editors change prices through the validated path instead
(`backend/lib/pricingFromCms.js`), which re-prices every selection before saving.

**Generated SEO values.** `migrate-seo.mjs` creates override rows that are empty
apart from the path. An override *pins* a page: copy today's generated title in
and improving it in code later changes nothing, because the override wins. The
empty row gives an editor somewhere to type while every field still falls back
to what the page generates. `--with-values` copies them in, for when freezing is
what you actually want.

**Images into container-local storage.** `migrate-images.mjs` refuses to run
when the instance stores files on container disk, because a redeploy deletes
them while the product records keep pointing at them — broken images across the
catalogue and an import to do again. Set up S3 storage first
(`DIRECTUS_SETUP.md` step 1), or pass `--allow-local-storage` for a throwaway
instance.

## Flags

| Flag | Effect |
| --- | --- |
| `--dry-run` | Print the plan, write nothing |
| `--force` | Overwrite fields an editor has changed |
| `--skip-images` | Leave the file library alone |
| `--allow-local-storage` | Import images even into ephemeral storage |
| `--with-values` | Copy generated SEO values in, pinning those pages |

Each step also runs on its own, e.g. `node scripts/migrate-directus/migrate-products.mjs --dry-run`.

-- Directus schema isolation.
--
-- Run ONCE against the Supabase Postgres database before starting Directus for
-- the first time (Supabase Dashboard -> SQL Editor, or psql).
--
-- Why a separate schema:
--   Directus creates roughly 30 tables of its own (directus_users, directus_files,
--   directus_permissions, …) plus a table per collection you define. The
--   storefront already owns tables in `public` — orders, blog_posts,
--   pricing_overrides, seo_overrides, redirects, media, admin_users, designs —
--   several of them with RLS policies. Putting Directus in its own schema means:
--     * no chance of a name collision now or when Directus adds tables
--     * Supabase RLS on public.* is untouched
--     * `DROP SCHEMA directus CASCADE` cleanly removes the CMS if you back out
--
-- The matching setting in directus/.env is:
--   DB_SEARCH_PATH=directus,public

CREATE SCHEMA IF NOT EXISTS directus;

-- Directus connects as the same Postgres role given in DB_USER (postgres by
-- default on Supabase), which already owns the database. These grants are
-- explicit so a lower-privilege role can be swapped in later without surprises.
GRANT USAGE, CREATE ON SCHEMA directus TO postgres;

-- Optional but recommended: a dedicated role for Directus instead of `postgres`.
-- Uncomment, set a strong password, and use it as DB_USER/DB_PASSWORD.
--
-- CREATE ROLE directus_app LOGIN PASSWORD 'set-a-strong-password';
-- GRANT USAGE, CREATE ON SCHEMA directus TO directus_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA directus TO directus_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA directus TO directus_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA directus
--   GRANT ALL PRIVILEGES ON TABLES TO directus_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA directus
--   GRANT ALL PRIVILEGES ON SEQUENCES TO directus_app;
-- -- read-only visibility of the storefront's tables, if a Directus collection
-- -- ever needs to display them (it does not by default):
-- -- GRANT USAGE ON SCHEMA public TO directus_app;

-- Verify afterwards:
--   SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'directus';

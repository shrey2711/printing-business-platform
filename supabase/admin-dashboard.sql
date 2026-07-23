-- ============================================================================
-- Canopy Tent Co. — Admin dashboard schema (blog, CMS, SEO, roles, pricing)
-- Run AFTER schema.sql. Idempotent — safe to re-run.
-- SQL Editor → New query → paste → Run.
-- ============================================================================

-- ── Roles ────────────────────────────────────────────────────────────────────
-- Source of truth for who can access the dashboard and at what level.
-- 'admin' = everything; 'editor' = blog, content and SEO but NOT orders,
-- pricing or customer data. The ADMIN_EMAILS env allowlist still works as a
-- bootstrap so you are never locked out before this table is populated.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ── Blog ─────────────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body_md      text not null default '',
  cover_path   text,                       -- path in the public 'media' bucket
  tags         text[] not null default '{}',
  seo          jsonb not null default '{}'::jsonb,  -- { title, description, og_image_path, jsonld }
  status       text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  author_id    uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

-- ── CMS: content + SEO overrides + redirects ────────────────────────────────
-- Key-value overrides. Code keeps its hardcoded defaults; a row here wins when
-- present. Keys are stable ids like 'home.hero.title' or 'product.canopy-tents.tagline'.
create table if not exists public.content_overrides (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- Per-route SEO. path is the route, e.g. '/', '/products/canopy-tents', '/sizes/10x20'.
create table if not exists public.seo_overrides (
  path             text primary key,
  title            text,
  description      text,
  canonical        text,
  robots           text,                   -- e.g. 'noindex, follow'
  og_image_path    text,                   -- path in the 'media' bucket
  jsonld           jsonb,                  -- replaces/extends the page's structured data
  sitemap_priority numeric,                -- 0.0–1.0; null = default
  updated_at       timestamptz not null default now()
);

create table if not exists public.redirects (
  id         uuid primary key default gen_random_uuid(),
  source     text not null unique,         -- path, e.g. '/old-tent'
  destination text not null,               -- path or absolute URL
  code       integer not null default 301 check (code in (301,302,308)),
  created_at timestamptz not null default now()
);

-- ── Pricing overrides + audit (money — admin only) ──────────────────────────
-- Replaces a product's entire `pricing` block. Read by the backend at request
-- time so checkout charges the edited price, not just the display.
create table if not exists public.pricing_overrides (
  slug       text primary key,
  pricing    jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- Every pricing change is recorded — a typo here mis-charges real customers.
create table if not exists public.pricing_audit (
  id     uuid primary key default gen_random_uuid(),
  actor  uuid references auth.users (id) on delete set null,
  slug   text not null,
  before jsonb,
  after  jsonb,
  at     timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- The backend uses the service-role key (bypasses RLS) for all writes, so these
-- policies exist to (a) allow the public/anon read paths the site needs and
-- (b) keep the tables locked down if ever queried with the anon key.

alter table public.admin_users       enable row level security;
alter table public.blog_posts        enable row level security;
alter table public.content_overrides enable row level security;
alter table public.seo_overrides     enable row level security;
alter table public.redirects         enable row level security;
alter table public.pricing_overrides enable row level security;
alter table public.pricing_audit     enable row level security;

-- Helper: is the current auth uid an admin_users row of a given role (or any)?
create or replace function public.is_admin_user()
returns boolean language sql stable as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Published blog posts are world-readable; drafts are not.
drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts
  for select using (status = 'published');

-- Content, SEO and redirects must be readable at build (anon) and by the site.
drop policy if exists "content_public_read" on public.content_overrides;
create policy "content_public_read" on public.content_overrides for select using (true);
drop policy if exists "seo_public_read" on public.seo_overrides;
create policy "seo_public_read" on public.seo_overrides for select using (true);
drop policy if exists "redirects_public_read" on public.redirects;
create policy "redirects_public_read" on public.redirects for select using (true);

-- admin_users: a signed-in user may read their OWN role (to render the right
-- dashboard tabs). No public read of the whole table.
drop policy if exists "admin_users_read_self" on public.admin_users;
create policy "admin_users_read_self" on public.admin_users
  for select using (auth.uid() = user_id);

-- pricing_overrides is read by the backend (service role). Also allow public
-- read so the build can bake starting prices. Audit is service-role only (no policy).
drop policy if exists "pricing_public_read" on public.pricing_overrides;
create policy "pricing_public_read" on public.pricing_overrides for select using (true);

-- ── Public media bucket (blog covers, OG images) ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone can read media (public bucket); writes go through the service role.
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- ============================================================================
-- SEED YOUR FIRST ADMIN (required once):
--   Find your user id in Authentication → Users, then:
--   insert into public.admin_users (user_id, role) values ('<your-uuid>', 'admin');
-- Until then, the ADMIN_EMAILS env allowlist keeps you in.
-- ============================================================================

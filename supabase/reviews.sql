-- Product reviews: collected from real customers via a one-time link emailed
-- after their order ships, or entered by an admin from a review the customer
-- gave elsewhere (with their permission). Nothing is public until approved.
--
-- Run in the Supabase SQL editor. Idempotent.

-- When the order was marked shipped, so the dashboard can wait for delivery
-- before asking for a review.
alter table public.orders add column if not exists shipped_at timestamptz;

-- One review link per order. Orders are one product per row.
create table if not exists public.review_invites (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique,
  order_id      uuid not null unique references public.orders (id) on delete cascade,
  product_slug  text not null,
  customer_name text,
  email         text,
  sent_at       timestamptz,
  used_at       timestamptz,
  expires_at    timestamptz not null default (now() + interval '120 days'),
  created_at    timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id                uuid primary key default gen_random_uuid(),
  product_slug      text not null,
  order_id          uuid references public.orders (id) on delete set null,
  rating            smallint not null check (rating between 1 and 5),
  title             text,
  body              text not null,
  author_name       text not null,
  author_location   text,
  -- true only when the review came through an order's review link
  verified_purchase boolean not null default false,
  source            text not null default 'order' check (source in ('order', 'imported')),
  -- for imported reviews: where it came from and how permission was given
  source_note       text,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists product_reviews_slug_status_idx on public.product_reviews (product_slug, status);

alter table public.review_invites enable row level security;
alter table public.product_reviews enable row level security;

-- Approved reviews are public (the site and the build read them). Every write,
-- and every invite, goes through the service role only.
drop policy if exists "product_reviews_public_read" on public.product_reviews;
create policy "product_reviews_public_read" on public.product_reviews
  for select using (status = 'approved');

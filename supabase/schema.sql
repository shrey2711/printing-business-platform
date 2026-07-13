-- ============================================================================
-- PrintUSA — Supabase schema, security policies, and storage setup
-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- ============================================================================

-- 1) Orders table --------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  product           text not null,
  specs             text,
  quantity          integer not null default 1,
  estimated_price   text,
  notes             text,
  design_path       text,              -- path in the 'designs' storage bucket
  config            jsonb,             -- raw pricing config (for authoritative re-pricing)
  amount_total      numeric,           -- charged amount in dollars (set at checkout)
  stripe_session_id text,
  coupon_code       text,
  discount          numeric,
  tracking_number   text,
  carrier           text,
  idempotency_key   text,              -- prevents duplicate orders on retry/double-submit
  status            text not null default 'submitted'
                      check (status in ('submitted','paid','in_production','shipped','cancelled')),
  created_at        timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

-- If you created the table before these features were added, run these once
-- (safe to run repeatedly):
alter table public.orders add column if not exists config jsonb;
alter table public.orders add column if not exists amount_total numeric;
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount numeric;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists idempotency_key text;
create unique index if not exists orders_idempotency_key_uidx
  on public.orders (idempotency_key) where idempotency_key is not null;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('submitted','paid','in_production','shipped','cancelled'));

-- 2) Row Level Security: users only see/manage their own orders -----------------
alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own" on public.orders
  for update using (auth.uid() = user_id);

drop policy if exists "orders_delete_own" on public.orders;
create policy "orders_delete_own" on public.orders
  for delete using (auth.uid() = user_id);

-- 3) Storage bucket for submitted / drawn artwork ------------------------------
insert into storage.buckets (id, name, public)
values ('designs', 'designs', false)
on conflict (id) do nothing;

-- Users can upload into a folder named after their own user id, e.g. "<uid>/file.png"
drop policy if exists "designs_insert_own" on storage.objects;
create policy "designs_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "designs_select_own" on storage.objects;
create policy "designs_select_own" on storage.objects
  for select using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "designs_delete_own" on storage.objects;
create policy "designs_delete_own" on storage.objects
  for delete using (
    bucket_id = 'designs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Optional: give admins/staff read access to all orders later by adding a
-- role check policy. Left out here to keep the starter simple.
-- ============================================================================

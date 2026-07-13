-- ============================================================================
-- PrintUSA — Supabase schema, security policies, and storage setup
-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- ============================================================================

-- 1) Orders table --------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  product          text not null,
  specs            text,
  quantity         integer not null default 1,
  estimated_price  text,
  notes            text,
  design_path      text,               -- path in the 'designs' storage bucket
  status           text not null default 'submitted'
                     check (status in ('submitted','in_production','shipped','cancelled')),
  created_at       timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

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

-- ============================================================================
-- Optional: give admins/staff read access to all orders later by adding a
-- role check policy. Left out here to keep the starter simple.
-- ============================================================================

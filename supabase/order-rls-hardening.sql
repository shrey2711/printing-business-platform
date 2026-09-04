-- Close the ways a customer could mark their own order paid.
--
-- Found while auditing how an order could show as paid with no money taken.
-- Two policies on public.orders were far wider than anything the site uses:
--
--   orders_update_own   USING (auth.uid() = user_id), WITH CHECK null
--       A signed-in customer could update their own order row directly with the
--       public anon key — including status = 'paid', amount_total, tracking
--       numbers, or the Stripe fields. With no WITH CHECK they could also move
--       the row to another user_id. The browser code never updates orders at
--       all; every legitimate change goes through the backend on the service
--       role, so this granted only attack surface.
--
--   orders_insert_own   WITH CHECK (auth.uid() = user_id)
--       Ownership was checked, but nothing else. A crafted insert could create
--       an order already carrying status 'paid', an amount_total, or invented
--       Stripe identifiers.
--
--   orders_delete_own   USING (auth.uid() = user_id)
--       Let a customer delete any of their orders, including paid ones. An
--       order is the record of a sale; cancelling an unpaid one is reasonable,
--       erasing a paid one is not.
--
-- Run once in the Supabase SQL editor.

-- ---------------------------------------------------------------- UPDATE --
-- Removed outright. The service role bypasses RLS, so the backend is unaffected.
drop policy if exists "orders_update_own" on public.orders;

-- ---------------------------------------------------------------- INSERT --
-- Own the row, and start it in the state an unpaid order starts in.
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert
  with check (
    auth.uid() = user_id
    and status = 'submitted'
    and coalesce(amount_total, 0) = 0
    and stripe_session_id is null
    and stripe_invoice_id is null
    and invoice_status is null
    and tracking_number is null
  );

-- ---------------------------------------------------------------- DELETE --
-- Cancelling an order that was never paid is fine. Deleting one that was is not.
drop policy if exists "orders_delete_own" on public.orders;
create policy "orders_delete_own" on public.orders
  for delete
  using (
    auth.uid() = user_id
    and status = 'submitted'
    and coalesce(amount_total, 0) = 0
  );

-- ---------------------------------------------------------------- SELECT --
-- Unchanged: a customer reads their own orders.
-- orders_select_own  USING (auth.uid() = user_id)

-- Belt and braces: even if a policy is loosened again by accident, the
-- authenticated role has no column-level UPDATE grant to fall back on.
revoke update on public.orders from authenticated;
revoke update on public.orders from anon;

comment on table public.orders is
  'Customer orders. Clients may INSERT their own unpaid order, SELECT their own, and DELETE their own only while unpaid. Every other change — status, amounts, Stripe identifiers, tracking — goes through the backend on the service role.';

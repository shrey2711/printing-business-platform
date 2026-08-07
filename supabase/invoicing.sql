-- ============================================================================
-- Stripe Invoicing — order columns. Run in Supabase SQL Editor. Idempotent.
-- ============================================================================
alter table public.orders add column if not exists stripe_invoice_id text;
alter table public.orders add column if not exists invoice_url text;   -- hosted invoice page
alter table public.orders add column if not exists invoice_status text; -- open | paid | void

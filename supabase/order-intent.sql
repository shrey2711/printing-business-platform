-- Record what the customer chose to do about artwork and payment.
--
-- Without this, an order that arrives with no artwork and no payment is
-- indistinguishable from one where the customer deliberately asked to be
-- invoiced and to send artwork by email. The first needs chasing; the second is
-- a normal order waiting on us.
--
-- Run once in the Supabase SQL editor.

alter table public.orders add column if not exists artwork_choice text;
alter table public.orders add column if not exists payment_choice text;

comment on column public.orders.artwork_choice is
  'uploaded | email_later | design_service — what the customer said they would do about artwork.';
comment on column public.orders.payment_choice is
  'pay_now | invoice_later — whether they went to checkout or asked to be invoiced.';

-- Only values the app sets. A null is fine: orders placed before this existed.
alter table public.orders drop constraint if exists orders_artwork_choice_check;
alter table public.orders add constraint orders_artwork_choice_check
  check (artwork_choice is null or artwork_choice in ('uploaded', 'email_later', 'design_service'));

alter table public.orders drop constraint if exists orders_payment_choice_check;
alter table public.orders add constraint orders_payment_choice_check
  check (payment_choice is null or payment_choice in ('pay_now', 'invoice_later'));

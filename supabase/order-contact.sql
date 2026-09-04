-- Contact and delivery details on the order itself.
--
-- The staff notification carried only the customer's email, because that is all
-- an order ever captured — the form asked for notes and artwork. Everything
-- else had to be chased by replying to the customer, and for an unpaid order
-- there was no shipping address anywhere at all (Stripe collects one only when
-- someone reaches checkout).
--
-- Run once in the Supabase SQL editor.

alter table public.orders add column if not exists customer_name    text;
alter table public.orders add column if not exists customer_phone   text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists shipping_country text;

comment on column public.orders.customer_name is 'Contact name given at order time.';
comment on column public.orders.customer_phone is 'Contact phone given at order time.';
comment on column public.orders.shipping_address is 'Delivery address given at order time, before checkout.';
comment on column public.orders.shipping_country is 'Delivery country — decides shipping cost and lead time.';

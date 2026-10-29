-- Furniture found in each redesign, for Shop this look.
alter table public.generations add column if not exists shop_items jsonb;

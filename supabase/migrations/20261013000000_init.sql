-- Roomorph backend: profiles + credits, credit ledger, generations, image storage.
-- Users can READ their own rows. Every write that touches credits goes through
-- the security-definer functions below, which only the server (service role) may call.

-- ---------------------------------------------------------------- tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  founding boolean not null default false,
  created_at timestamptz not null default now()
);

-- Every credit change, with the reason. `external_ref` makes grants idempotent
-- (e.g. a store transaction id in Phase 2, or 'refund:<generation id>').
create table public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('signup_bonus', 'founding_bonus', 'generation', 'refund', 'purchase', 'admin')),
  generation_id uuid,
  external_ref text unique,
  created_at timestamptz not null default now()
);
create index credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null, -- the app's own id for this redesign
  style_id text not null,
  user_prompt text,
  quality text not null check (quality in ('standard', 'hd')),
  credits_spent integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  error text,
  width integer,
  height integer,
  before_path text,
  after_path text,
  latency_ms integer,
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);
create index generations_user_idx on public.generations (user_id, created_at desc);

-- Waitlist emails that get the founding offer (10 free credits instead of 2).
-- Import the Netlify waitlist here before launch.
create table public.founding_emails (
  email text primary key check (email = lower(email))
);

-- ---------------------------------------------------------------- row level security

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.generations enable row level security;
alter table public.founding_emails enable row level security; -- no policies: server only

create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "read own ledger" on public.credit_ledger
  for select to authenticated using (user_id = (select auth.uid()));

create policy "read own generations" on public.generations
  for select to authenticated using (user_id = (select auth.uid()));

create policy "delete own generations" on public.generations
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- new user bonus

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_founding boolean;
  bonus integer;
begin
  is_founding := exists (
    select 1 from public.founding_emails f where f.email = lower(coalesce(new.email, ''))
  );
  bonus := case when is_founding then 10 else 2 end;

  insert into public.profiles (id, credits, founding) values (new.id, bonus, is_founding);
  insert into public.credit_ledger (user_id, delta, reason)
    values (new.id, bonus, case when is_founding then 'founding_bonus' else 'signup_bonus' end);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- credit functions (server only)

-- Atomically take credits for a generation. Raises 'insufficient_credits' if the balance is too low.
create function public.spend_credits(p_user uuid, p_amount integer, p_generation uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  balance integer;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  update public.profiles
    set credits = credits - p_amount
    where id = p_user and credits >= p_amount
    returning credits into balance;

  if balance is null then
    raise exception 'insufficient_credits';
  end if;

  insert into public.credit_ledger (user_id, delta, reason, generation_id)
    values (p_user, -p_amount, 'generation', p_generation);
  return balance;
end;
$$;

-- Add credits once per external_ref (refunds, purchases, admin grants). Returns the new balance.
create function public.grant_credits(p_user uuid, p_amount integer, p_reason text, p_ref text, p_generation uuid default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  balance integer;
  inserted integer;
begin
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  insert into public.credit_ledger (user_id, delta, reason, generation_id, external_ref)
    values (p_user, p_amount, p_reason, p_generation, p_ref)
    on conflict (external_ref) do nothing;
  get diagnostics inserted = row_count;

  if inserted = 1 then
    update public.profiles set credits = credits + p_amount where id = p_user returning credits into balance;
  else
    select credits into balance from public.profiles where id = p_user;
  end if;
  return balance;
end;
$$;

revoke execute on function public.spend_credits(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.grant_credits(uuid, integer, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.spend_credits(uuid, integer, uuid) to service_role;
grant execute on function public.grant_credits(uuid, integer, text, text, uuid) to service_role;

-- ---------------------------------------------------------------- image storage

-- Private bucket. Files live at <user id>/<generation id>-before.jpg / -after.jpg.
insert into storage.buckets (id, name, public) values ('redesigns', 'redesigns', false)
  on conflict (id) do nothing;

create policy "read own redesign images" on storage.objects
  for select to authenticated
  using (bucket_id = 'redesigns' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "delete own redesign images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'redesigns' and (storage.foldername(name))[1] = (select auth.uid())::text);

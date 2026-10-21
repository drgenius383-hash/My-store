-- =====================================================================
-- MY BRAND STORE - Supabase schema
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- Safe to re-run.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------

-- Passwords are NOT stored here. Supabase Auth stores them hashed (bcrypt)
-- in auth.users, which is not exposed to the API.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_phone_key on public.profiles (phone);
create unique index if not exists profiles_email_key on public.profiles (lower(email));

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price int not null check (price >= 0),
  quantity int not null default 0 check (quantity >= 0),
  image_url text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  products jsonb not null,
  total int not null check (total >= 0),
  receipt_url text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'disapproved')),
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- Tiny "doorbell" table. It holds NO customer data (only an order id and
-- "INSERT"/"UPDATE"). The admin panel listens to it with Realtime and then
-- re-loads the real orders through the password-protected admin API.
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null,
  kind text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TRIGGERS
-- ---------------------------------------------------------------------

-- Create the profile row automatically when someone signs up.
-- Works even when email confirmation is ON (no session needed).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '[^0-9+]', '', 'g'),
    new.email,
    coalesce(new.raw_user_meta_data->>'address', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.notify_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_events (order_id, kind) values (new.id, tg_op);
  delete from public.order_events where created_at < now() - interval '1 day';
  return new;
end;
$$;

drop trigger if exists orders_notify_insert on public.orders;
create trigger orders_notify_insert
  after insert on public.orders
  for each row execute function public.notify_order_event();

drop trigger if exists orders_notify_update on public.orders;
create trigger orders_notify_update
  after update on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.notify_order_event();

-- ---------------------------------------------------------------------
-- LOGIN WITH PHONE: look up the email that belongs to a phone number.
-- Matches on the last 10 digits so 0803..., +234803... and 234803... all work.
-- ---------------------------------------------------------------------
create or replace function public.email_for_phone(p_phone text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where length(regexp_replace(p_phone, '\D', '', 'g')) >= 7
    and right(regexp_replace(p.phone, '\D', '', 'g'), 10)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  limit 1;
$$;

revoke all on function public.email_for_phone(text) from public;
grant execute on function public.email_for_phone(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Admin actions go through server routes that use the service-role key
-- (which bypasses RLS) after checking ADMIN_PASSWORD.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "order_events_read" on public.order_events;
create policy "order_events_read" on public.order_events
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------
-- REALTIME
-- ---------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.order_events;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------
-- STORAGE BUCKETS (both public, 5 MB limit, restricted file types)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('receipts', 'receipts', true, 5242880,
    array['image/jpeg', 'image/png', 'application/pdf']),
  ('products', 'products', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Logged-in customers may upload receipts only into their own folder: <user-id>/...
drop policy if exists "receipts_insert_own_folder" on storage.objects;
create policy "receipts_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Product images are uploaded by the admin API with signed upload URLs,
-- so no public write policy exists for the `products` bucket.

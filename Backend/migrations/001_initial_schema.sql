-- CRYPTOVA Supabase initial database schema
-- Run this migration in the Supabase SQL Editor or through Supabase CLI.
-- Encryption keys and plaintext file contents must never be stored here.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'google',
  provider_subject text not null unique,
  email text not null,
  display_name text,
  profile_image_url text,
  role text not null default 'Business User'
    check (role in ('Security Administrator', 'Business User', 'Compliance Reviewer')),
  created_at timestamptz not null default timezone('utc', now()),
  last_login_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  original_filename text not null,
  stored_filename text not null unique,
  file_size bigint not null check (file_size >= 0 and file_size <= 104857600),
  mime_type text not null,
  algorithm text not null default 'AES-256-GCM',
  package_version integer not null default 1,
  verification_status text not null default 'PROTECTED'
    check (verification_status in ('PROTECTED', 'VERIFIED', 'FAILED')),
  storage_path text not null,
  -- Wrapped per-file data-encryption key. Never store the plaintext key.
  wrapped_key text not null,
  key_nonce text not null,
  key_version text not null default 'v1',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null check (action in (
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'FILE_ENCRYPTED',
    'INTEGRITY_VERIFIED',
    'INTEGRITY_VERIFICATION_FAILED',
    'FILE_DECRYPTED',
    'FILE_DOWNLOADED',
    'FILE_DELETED'
  )),
  resource_id uuid references public.files(id) on delete set null,
  resource_name text,
  status text not null check (status in ('SUCCESS', 'FAILED', 'WARNING')),
  details text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists files_user_id_created_at_idx
  on public.files (user_id, created_at desc);

create index if not exists activity_logs_user_id_created_at_idx
  on public.activity_logs (user_id, created_at desc);

create index if not exists activity_logs_user_id_action_idx
  on public.activity_logs (user_id, action);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
before update on public.files
for each row execute function public.set_updated_at();

-- Keep application profiles synchronized with Supabase Auth users.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, provider_subject, email, display_name, profile_image_url)
  values (
    new.id,
    new.id::text,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.users.display_name),
    profile_image_url = coalesce(excluded.profile_image_url, public.users.profile_image_url),
    last_login_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.files enable row level security;
alter table public.activity_logs enable row level security;

-- Users can view and update only their own application profile.
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Files are isolated by authenticated owner.
drop policy if exists files_select_own on public.files;
create policy files_select_own on public.files
for select using (auth.uid() = user_id);

drop policy if exists files_insert_own on public.files;
create policy files_insert_own on public.files
for insert with check (auth.uid() = user_id);

drop policy if exists files_update_own on public.files;
create policy files_update_own on public.files
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists files_delete_own on public.files;
create policy files_delete_own on public.files
for delete using (auth.uid() = user_id);

-- Audit logs are readable by their owner. Inserts should normally come from the backend service role.
drop policy if exists activity_logs_select_own on public.activity_logs;
create policy activity_logs_select_own on public.activity_logs
for select using (auth.uid() = user_id);

drop policy if exists activity_logs_insert_own on public.activity_logs;
create policy activity_logs_insert_own on public.activity_logs
for insert with check (auth.uid() = user_id);

-- Optional private Supabase Storage bucket for a future storage adapter.
-- The current FastAPI prototype uses Backend/storage/encrypted_files instead.
insert into storage.buckets (id, name, public)
values ('encrypted-files', 'encrypted-files', false)
on conflict (id) do nothing;

 drop policy if exists encrypted_files_select_own on storage.objects;
create policy encrypted_files_select_own on storage.objects
for select to authenticated
using (bucket_id = 'encrypted-files' and (storage.foldername(name))[1] = auth.uid()::text);

 drop policy if exists encrypted_files_insert_own on storage.objects;
create policy encrypted_files_insert_own on storage.objects
for insert to authenticated
with check (bucket_id = 'encrypted-files' and (storage.foldername(name))[1] = auth.uid()::text);

 drop policy if exists encrypted_files_delete_own on storage.objects;
create policy encrypted_files_delete_own on storage.objects
for delete to authenticated
using (bucket_id = 'encrypted-files' and (storage.foldername(name))[1] = auth.uid()::text);

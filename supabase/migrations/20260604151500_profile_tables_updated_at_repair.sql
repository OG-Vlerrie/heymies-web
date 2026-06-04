alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.buyers
  add column if not exists updated_at timestamptz not null default now();

alter table public.agents
  add column if not exists updated_at timestamptz not null default now();

alter table public.private_sellers
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set updated_at = coalesce(updated_at, created_at, now());

update public.buyers
set updated_at = coalesce(updated_at, created_at, now());

update public.agents
set updated_at = coalesce(updated_at, created_at, now());

update public.private_sellers
set updated_at = coalesce(updated_at, created_at, now());

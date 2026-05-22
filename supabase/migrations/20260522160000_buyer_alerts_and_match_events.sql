create table if not exists public.buyer_alerts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Buyer match alert',
  areas text[] not null default '{}',
  property_types text[] not null default '{}',
  max_price numeric,
  bedrooms_min integer,
  bathrooms_min integer,
  enabled boolean not null default true,
  delivery_channel text not null default 'email',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buyer_alerts_buyer_id_idx on public.buyer_alerts (buyer_id);
create index if not exists buyer_alerts_enabled_idx on public.buyer_alerts (enabled);

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  buyer_alert_id uuid references public.buyer_alerts(id) on delete cascade,
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  score integer not null,
  reasons text[] not null default '{}',
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (buyer_alert_id, listing_id)
);

create index if not exists match_events_buyer_id_idx on public.match_events (buyer_id);
create index if not exists match_events_listing_id_idx on public.match_events (listing_id);
create index if not exists match_events_status_idx on public.match_events (status);

alter table public.buyer_alerts enable row level security;
alter table public.match_events enable row level security;

drop policy if exists "buyers can read own alerts" on public.buyer_alerts;
create policy "buyers can read own alerts"
on public.buyer_alerts for select
using (auth.uid() = user_id);

drop policy if exists "buyers can insert own alerts" on public.buyer_alerts;
create policy "buyers can insert own alerts"
on public.buyer_alerts for insert
with check (auth.uid() = user_id);

drop policy if exists "buyers can update own alerts" on public.buyer_alerts;
create policy "buyers can update own alerts"
on public.buyer_alerts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "buyers can delete own alerts" on public.buyer_alerts;
create policy "buyers can delete own alerts"
on public.buyer_alerts for delete
using (auth.uid() = user_id);

drop policy if exists "buyers can read own match events" on public.match_events;
create policy "buyers can read own match events"
on public.match_events for select
using (auth.uid() = user_id);

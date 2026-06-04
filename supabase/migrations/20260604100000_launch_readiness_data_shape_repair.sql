create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'buyer',
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.buyers
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists budget_min numeric,
  add column if not exists budget_max numeric,
  add column if not exists property_types text[] not null default '{}'::text[],
  add column if not exists areas text[] not null default '{}'::text[],
  add column if not exists areas_multi text[] not null default '{}'::text[],
  add column if not exists bedrooms_min integer,
  add column if not exists bathrooms_min integer,
  add column if not exists preapproved text,
  add column if not exists timeline text,
  add column if not exists selling_property text,
  add column if not exists lead_score integer not null default 0,
  add column if not exists popia_consent boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists buyers_user_id_unique_idx
  on public.buyers (user_id)
  where user_id is not null;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  full_name text,
  phone text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.agents
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists email text,
  add column if not exists contact_email text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists status text not null default 'pending',
  add column if not exists preferred_contact text,
  add column if not exists preferred_contact_time text,
  add column if not exists agency_name text,
  add column if not exists agency text,
  add column if not exists position_title text,
  add column if not exists ffc_number text,
  add column if not exists years_experience integer,
  add column if not exists office_city text,
  add column if not exists office_suburb text,
  add column if not exists service_areas text,
  add column if not exists areas text,
  add column if not exists specialties text,
  add column if not exists property_types text,
  add column if not exists avg_deals_per_month numeric,
  add column if not exists avg_commission_percent numeric,
  add column if not exists avg_commission_band text,
  add column if not exists current_lead_sources text,
  add column if not exists crm_tool text,
  add column if not exists team_size integer,
  add column if not exists onboarding_goal text,
  add column if not exists max_leads_per_week integer,
  add column if not exists popia_consent boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists agents_user_id_unique_idx
  on public.agents (user_id)
  where user_id is not null;

create unique index if not exists agents_email_unique_idx
  on public.agents (email)
  where email is not null;

create table if not exists public.private_sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.private_sellers
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists preferred_contact text,
  add column if not exists intent text,
  add column if not exists property_type text,
  add column if not exists province text,
  add column if not exists city text,
  add column if not exists suburb text,
  add column if not exists street_address text,
  add column if not exists bedrooms integer,
  add column if not exists bathrooms integer,
  add column if not exists parking integer,
  add column if not exists floor_size_m2 numeric,
  add column if not exists erf_size_m2 numeric,
  add column if not exists asking_price numeric,
  add column if not exists price_flexibility text,
  add column if not exists target_timeframe text,
  add column if not exists bond_status text,
  add column if not exists rates_taxes_known boolean not null default false,
  add column if not exists rates_taxes_amount numeric,
  add column if not exists levies_known boolean not null default false,
  add column if not exists levies_amount numeric,
  add column if not exists reason_for_selling text,
  add column if not exists access_for_viewings text,
  add column if not exists occupancy text,
  add column if not exists available_from date,
  add column if not exists special_features text,
  add column if not exists notes text,
  add column if not exists popia_consent boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists private_sellers_user_id_unique_idx
  on public.private_sellers (user_id)
  where user_id is not null;

create table if not exists public.email_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  token text not null default replace(gen_random_uuid()::text, '-'::text, ''::text),
  marketing_emails boolean not null default true,
  nurture_emails boolean not null default true,
  match_alert_emails boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_preferences
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists email text,
  add column if not exists token text not null default replace(gen_random_uuid()::text, '-'::text, ''::text),
  add column if not exists marketing_emails boolean not null default true,
  add column if not exists nurture_emails boolean not null default true,
  add column if not exists match_alert_emails boolean not null default true,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists email_preferences_user_id_idx
  on public.email_preferences (user_id)
  where user_id is not null;

create unique index if not exists email_preferences_email_lower_idx
  on public.email_preferences (lower(email))
  where email is not null;

create unique index if not exists email_preferences_token_idx
  on public.email_preferences (token);

create table if not exists public.buyer_alerts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Buyer match alert',
  areas text[] not null default '{}'::text[],
  property_types text[] not null default '{}'::text[],
  max_price numeric,
  bedrooms_min integer,
  bathrooms_min integer,
  enabled boolean not null default true,
  delivery_channel text not null default 'email',
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.buyer_alerts
  add column if not exists buyer_id uuid references public.buyers(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text not null default 'Buyer match alert',
  add column if not exists areas text[] not null default '{}'::text[],
  add column if not exists property_types text[] not null default '{}'::text[],
  add column if not exists max_price numeric,
  add column if not exists bedrooms_min integer,
  add column if not exists bathrooms_min integer,
  add column if not exists enabled boolean not null default true,
  add column if not exists delivery_channel text not null default 'email',
  add column if not exists last_checked_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists buyer_alerts_buyer_id_idx
  on public.buyer_alerts (buyer_id);

create index if not exists buyer_alerts_enabled_idx
  on public.buyer_alerts (enabled);

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  buyer_alert_id uuid references public.buyer_alerts(id) on delete cascade,
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null,
  score integer not null,
  reasons text[] not null default '{}'::text[],
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.match_events
  add column if not exists buyer_alert_id uuid references public.buyer_alerts(id) on delete cascade,
  add column if not exists buyer_id uuid references public.buyers(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists listing_id uuid,
  add column if not exists score integer not null default 0,
  add column if not exists reasons text[] not null default '{}'::text[],
  add column if not exists status text not null default 'pending',
  add column if not exists sent_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists match_events_alert_listing_unique_idx
  on public.match_events (buyer_alert_id, listing_id);

create index if not exists match_events_buyer_id_idx
  on public.match_events (buyer_id);

create index if not exists match_events_listing_id_idx
  on public.match_events (listing_id);

create index if not exists match_events_status_idx
  on public.match_events (status);

alter table public.profiles enable row level security;
alter table public.buyers enable row level security;
alter table public.agents enable row level security;
alter table public.private_sellers enable row level security;
alter table public.email_preferences enable row level security;
alter table public.buyer_alerts enable row level security;
alter table public.match_events enable row level security;

drop policy if exists "users can read own email preferences" on public.email_preferences;
create policy "users can read own email preferences"
  on public.email_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "users can update own email preferences" on public.email_preferences;
create policy "users can update own email preferences"
  on public.email_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

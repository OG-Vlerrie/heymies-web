create table if not exists public.api_error_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  route text not null,
  method text not null,
  status integer,
  error_message text not null,
  error_code text,
  user_id uuid references auth.users(id) on delete set null,
  request_id text,
  user_agent text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists api_error_events_created_at_idx
  on public.api_error_events (created_at desc);

create index if not exists api_error_events_route_idx
  on public.api_error_events (route);

create index if not exists api_error_events_status_idx
  on public.api_error_events (status);

alter table public.api_error_events enable row level security;

drop policy if exists "Service role can manage api error events" on public.api_error_events;
create policy "Service role can manage api error events"
  on public.api_error_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

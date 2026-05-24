create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_created_at_idx
on public.admin_activity (created_at desc);

create index if not exists admin_activity_entity_idx
on public.admin_activity (entity_type, entity_id);

create index if not exists admin_activity_action_idx
on public.admin_activity (action);

alter table public.admin_activity enable row level security;

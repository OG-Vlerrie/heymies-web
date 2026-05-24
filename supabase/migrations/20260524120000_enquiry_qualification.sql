alter table public.enquiries
  add column if not exists property_fit_score integer,
  add column if not exists readiness_score integer,
  add column if not exists qualification_status text not null default 'needs_confirmation',
  add column if not exists qualification_summary text,
  add column if not exists next_action text,
  add column if not exists nurture_status text not null default 'pending',
  add column if not exists agent_ready_at timestamptz,
  add column if not exists last_nurtured_at timestamptz,
  add column if not exists next_nurture_at timestamptz,
  add column if not exists buyer_response_token text,
  add column if not exists buyer_response_token_created_at timestamptz,
  add column if not exists last_buyer_response text,
  add column if not exists last_buyer_responded_at timestamptz;

create index if not exists enquiries_qualification_status_idx
on public.enquiries (qualification_status);

create index if not exists enquiries_agent_ready_at_idx
on public.enquiries (agent_ready_at);

create index if not exists enquiries_next_nurture_at_idx
on public.enquiries (next_nurture_at);

create unique index if not exists enquiries_buyer_response_token_idx
on public.enquiries (buyer_response_token)
where buyer_response_token is not null;

alter table public.enquiry_events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

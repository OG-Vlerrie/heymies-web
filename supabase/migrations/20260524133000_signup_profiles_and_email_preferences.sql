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

create unique index if not exists email_preferences_user_id_idx
on public.email_preferences (user_id)
where user_id is not null;

create unique index if not exists email_preferences_email_lower_idx
on public.email_preferences (lower(email))
where email is not null;

create unique index if not exists email_preferences_token_idx
on public.email_preferences (token);

alter table public.email_preferences enable row level security;

drop policy if exists "users can read own email preferences" on public.email_preferences;
create policy "users can read own email preferences"
on public.email_preferences for select
using (auth.uid() = user_id);

drop policy if exists "users can update own email preferences" on public.email_preferences;
create policy "users can update own email preferences"
on public.email_preferences for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_heymies_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  user_role text := coalesce(meta->>'role', 'buyer');
  normalized_role text := case
    when user_role in ('agent', 'buyer', 'seller') then user_role
    when user_role = 'private_seller' then 'seller'
    else 'buyer'
  end;
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    normalized_role,
    nullif(meta->>'full_name', ''),
    nullif(meta->>'phone', '')
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone);

  insert into public.email_preferences (user_id, email)
  values (new.id, new.email)
  on conflict do nothing;

  if normalized_role = 'buyer' then
    insert into public.buyers (
      user_id,
      full_name,
      phone,
      budget_min,
      budget_max,
      property_types,
      areas,
      areas_multi,
      bedrooms_min,
      bathrooms_min,
      preapproved,
      timeline,
      selling_property,
      lead_score,
      popia_consent
    )
    values (
      new.id,
      nullif(meta->>'full_name', ''),
      nullif(meta->>'phone', ''),
      nullif(meta->>'budget_min', '')::numeric,
      nullif(meta->>'budget_max', '')::numeric,
      coalesce(array(select jsonb_array_elements_text(meta->'property_types')), '{}'::text[]),
      coalesce(array(select jsonb_array_elements_text(meta->'areas')), '{}'::text[]),
      coalesce(array(select jsonb_array_elements_text(meta->'areas')), '{}'::text[]),
      nullif(meta->>'bedrooms_min', '')::integer,
      nullif(meta->>'bathrooms_min', '')::integer,
      nullif(meta->>'preapproved', ''),
      nullif(meta->>'timeline', ''),
      nullif(meta->>'selling_property', ''),
      nullif(meta->>'lead_score_estimate', '')::integer,
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict do nothing;
  elsif normalized_role = 'agent' then
    insert into public.agents (
      user_id,
      full_name,
      phone,
      preferred_contact,
      agency_name,
      position_title,
      ffc_number,
      years_experience,
      office_city,
      office_suburb,
      service_areas,
      specialties,
      avg_deals_per_month,
      avg_commission_band,
      current_lead_sources,
      crm_tool,
      team_size,
      onboarding_goal,
      popia_consent
    )
    values (
      new.id,
      nullif(meta->>'full_name', ''),
      nullif(meta->>'phone', ''),
      coalesce(nullif(meta->>'preferred_contact', ''), 'WhatsApp'),
      nullif(meta->>'agency_name', ''),
      nullif(meta->>'position_title', ''),
      nullif(meta->>'ffc_number', ''),
      nullif(meta->>'years_experience', '')::integer,
      nullif(meta->>'office_city', ''),
      nullif(meta->>'office_suburb', ''),
      nullif(meta->>'service_areas', ''),
      nullif(meta->>'specialties', ''),
      nullif(meta->>'avg_deals_per_month', '')::numeric,
      nullif(meta->>'avg_commission_band', ''),
      nullif(meta->>'current_lead_sources', ''),
      nullif(meta->>'crm_tool', ''),
      nullif(meta->>'team_size', '')::integer,
      nullif(meta->>'onboarding_goal', ''),
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict do nothing;
  elsif normalized_role = 'seller' then
    insert into public.private_sellers (
      user_id,
      full_name,
      phone,
      preferred_contact,
      intent,
      property_type,
      province,
      city,
      suburb,
      street_address,
      bedrooms,
      bathrooms,
      parking,
      floor_size_m2,
      erf_size_m2,
      asking_price,
      price_flexibility,
      target_timeframe,
      bond_status,
      rates_taxes_known,
      rates_taxes_amount,
      levies_known,
      levies_amount,
      reason_for_selling,
      access_for_viewings,
      occupancy,
      available_from,
      special_features,
      notes,
      popia_consent
    )
    values (
      new.id,
      nullif(meta->>'full_name', ''),
      nullif(meta->>'phone', ''),
      coalesce(nullif(meta->>'preferred_contact', ''), 'WhatsApp'),
      coalesce(nullif(meta->>'intent', ''), 'Sell'),
      nullif(meta->>'property_type', ''),
      nullif(meta->>'province', ''),
      nullif(meta->>'city', ''),
      nullif(meta->>'suburb', ''),
      nullif(meta->>'street_address', ''),
      nullif(meta->>'bedrooms', '')::integer,
      nullif(meta->>'bathrooms', '')::integer,
      nullif(meta->>'parking', '')::integer,
      nullif(meta->>'floor_size_m2', '')::numeric,
      nullif(meta->>'erf_size_m2', '')::numeric,
      nullif(meta->>'asking_price', '')::numeric,
      nullif(meta->>'price_flexibility', ''),
      nullif(meta->>'target_timeframe', ''),
      nullif(meta->>'bond_status', ''),
      coalesce((meta->>'rates_taxes_known')::boolean, false),
      nullif(meta->>'rates_taxes_amount', '')::numeric,
      coalesce((meta->>'levies_known')::boolean, false),
      nullif(meta->>'levies_amount', '')::numeric,
      nullif(meta->>'reason_for_selling', ''),
      nullif(meta->>'access_for_viewings', ''),
      nullif(meta->>'occupancy', ''),
      nullif(meta->>'available_from', '')::date,
      nullif(meta->>'special_features', ''),
      nullif(meta->>'notes', ''),
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_heymies_profile on auth.users;
create trigger on_auth_user_created_heymies_profile
after insert on auth.users
for each row execute function public.handle_heymies_new_user();

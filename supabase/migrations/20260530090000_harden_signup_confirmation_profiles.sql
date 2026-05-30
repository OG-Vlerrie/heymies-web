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
  add column if not exists avg_commission_band text,
  add column if not exists current_lead_sources text,
  add column if not exists crm_tool text,
  add column if not exists team_size integer,
  add column if not exists onboarding_goal text,
  add column if not exists max_leads_per_week integer,
  add column if not exists popia_consent boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

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
      email,
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
      new.email,
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
      coalesce(nullif(meta->>'lead_score_estimate', '')::integer, 0),
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict do nothing;
  elsif normalized_role = 'agent' then
    insert into public.agents (
      user_id,
      email,
      contact_email,
      full_name,
      phone,
      status,
      preferred_contact,
      preferred_contact_time,
      agency_name,
      agency,
      position_title,
      ffc_number,
      years_experience,
      office_city,
      office_suburb,
      service_areas,
      areas,
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
      new.email,
      new.email,
      nullif(meta->>'full_name', ''),
      nullif(meta->>'phone', ''),
      'pending',
      coalesce(nullif(meta->>'preferred_contact', ''), 'WhatsApp'),
      coalesce(nullif(meta->>'preferred_contact', ''), 'WhatsApp'),
      nullif(meta->>'agency_name', ''),
      nullif(meta->>'agency_name', ''),
      nullif(meta->>'position_title', ''),
      nullif(meta->>'ffc_number', ''),
      nullif(meta->>'years_experience', '')::integer,
      nullif(meta->>'office_city', ''),
      nullif(meta->>'office_suburb', ''),
      nullif(meta->>'service_areas', ''),
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
      email,
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
      new.email,
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

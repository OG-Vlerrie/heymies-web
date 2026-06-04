create or replace function public.handle_heymies_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $heymies_new_user$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  user_role text := lower(nullif(meta->>'role', ''));
  normalized_role text := case
    when user_role in ('agent', 'buyer', 'seller') then user_role
    when user_role = 'private_seller' then 'seller'
    else null
  end;
  preferred_areas text[] := coalesce(
    nullif(public.heymies_meta_text_array(meta, 'areas'), '{}'::text[]),
    public.heymies_meta_text_array(meta, 'areas_multi'),
    '{}'::text[]
  );
begin
  if normalized_role is null then
    raise warning 'HeyMies signup role missing or invalid for %. Auth user was created without a profile repair.', new.email;
    return new;
  end if;

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

  update public.email_preferences
  set
    user_id = new.id,
    updated_at = now()
  where user_id is null
    and email is not null
    and lower(email) = lower(new.email);

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
      public.heymies_meta_text_array(meta, 'property_types'),
      preferred_areas,
      preferred_areas,
      nullif(meta->>'bedrooms_min', '')::integer,
      nullif(meta->>'bathrooms_min', '')::integer,
      nullif(meta->>'preapproved', ''),
      nullif(meta->>'timeline', ''),
      nullif(meta->>'selling_property', ''),
      coalesce(nullif(meta->>'lead_score_estimate', '')::integer, 0),
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict (user_id) where user_id is not null do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.buyers.full_name),
      phone = coalesce(excluded.phone, public.buyers.phone),
      budget_min = excluded.budget_min,
      budget_max = excluded.budget_max,
      property_types = excluded.property_types,
      areas = excluded.areas,
      areas_multi = excluded.areas_multi,
      bedrooms_min = excluded.bedrooms_min,
      bathrooms_min = excluded.bathrooms_min,
      preapproved = excluded.preapproved,
      timeline = excluded.timeline,
      selling_property = excluded.selling_property,
      lead_score = excluded.lead_score,
      popia_consent = excluded.popia_consent;
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
      avg_commission_percent,
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
      coalesce(nullif(meta->>'preferred_contact_time', ''), nullif(meta->>'preferred_contact', ''), 'WhatsApp'),
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
      nullif(meta->>'avg_commission_percent', '')::numeric,
      nullif(meta->>'avg_commission_band', ''),
      nullif(meta->>'current_lead_sources', ''),
      nullif(meta->>'crm_tool', ''),
      nullif(meta->>'team_size', '')::integer,
      nullif(meta->>'onboarding_goal', ''),
      coalesce((meta->>'popia_consent')::boolean, false)
    )
    on conflict (user_id) where user_id is not null do update set
      email = excluded.email,
      contact_email = excluded.contact_email,
      full_name = coalesce(excluded.full_name, public.agents.full_name),
      phone = coalesce(excluded.phone, public.agents.phone),
      preferred_contact = excluded.preferred_contact,
      preferred_contact_time = excluded.preferred_contact_time,
      agency_name = excluded.agency_name,
      agency = excluded.agency,
      position_title = excluded.position_title,
      ffc_number = excluded.ffc_number,
      years_experience = excluded.years_experience,
      office_city = excluded.office_city,
      office_suburb = excluded.office_suburb,
      service_areas = excluded.service_areas,
      areas = excluded.areas,
      specialties = excluded.specialties,
      avg_deals_per_month = excluded.avg_deals_per_month,
      avg_commission_percent = excluded.avg_commission_percent,
      avg_commission_band = excluded.avg_commission_band,
      current_lead_sources = excluded.current_lead_sources,
      crm_tool = excluded.crm_tool,
      team_size = excluded.team_size,
      onboarding_goal = excluded.onboarding_goal,
      popia_consent = excluded.popia_consent;
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
    on conflict (user_id) where user_id is not null do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.private_sellers.full_name),
      phone = coalesce(excluded.phone, public.private_sellers.phone),
      preferred_contact = excluded.preferred_contact,
      intent = excluded.intent,
      property_type = excluded.property_type,
      province = excluded.province,
      city = excluded.city,
      suburb = excluded.suburb,
      street_address = excluded.street_address,
      bedrooms = excluded.bedrooms,
      bathrooms = excluded.bathrooms,
      parking = excluded.parking,
      floor_size_m2 = excluded.floor_size_m2,
      erf_size_m2 = excluded.erf_size_m2,
      asking_price = excluded.asking_price,
      price_flexibility = excluded.price_flexibility,
      target_timeframe = excluded.target_timeframe,
      bond_status = excluded.bond_status,
      rates_taxes_known = excluded.rates_taxes_known,
      rates_taxes_amount = excluded.rates_taxes_amount,
      levies_known = excluded.levies_known,
      levies_amount = excluded.levies_amount,
      reason_for_selling = excluded.reason_for_selling,
      access_for_viewings = excluded.access_for_viewings,
      occupancy = excluded.occupancy,
      available_from = excluded.available_from,
      special_features = excluded.special_features,
      notes = excluded.notes,
      popia_consent = excluded.popia_consent;
  end if;

  return new;
exception
  when others then
    raise warning 'HeyMies signup profile trigger failed for %. Auth user was kept. Error: %', new.email, SQLERRM;
    return new;
end;
$heymies_new_user$;

drop trigger if exists on_auth_user_created_heymies_profile on auth.users;

create trigger on_auth_user_created_heymies_profile
after insert on auth.users
for each row execute function public.handle_heymies_new_user();

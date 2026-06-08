update public.listings
set status = case
  when lower(coalesce(status, '')) in ('active', 'published', 'publish', 'live', 'approved', 'available') then 'active'
  when lower(coalesce(status, '')) in ('inactive', 'archived', 'archive', 'disabled', 'hidden', 'sold', 'rented', 'closed') then 'inactive'
  else 'draft'
end
where status is null
  or lower(status) not in ('active', 'draft', 'inactive');

alter table public.listings
  alter column status set default 'draft';

alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status in ('draft', 'active', 'inactive'));

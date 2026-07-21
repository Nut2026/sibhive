create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  phone text,
  role text not null default 'parent' check (role in ('parent', 'teen')),
  sibling_profile_id uuid,
  consent_version text,
  consent_accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_consent_fields_match check (
    (consent_version is null and consent_accepted_at is null)
    or (consent_version is not null and consent_accepted_at is not null)
  )
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  consent_version text not null,
  consent_text text not null,
  accepted_at timestamptz not null default timezone('utc', now()),
  privacy_policy_accepted_at timestamptz not null,
  relationship_to_child text not null,
  withdrawn_at timestamptz,
  withdrawal_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint consent_withdrawal_reason_required check (
    withdrawn_at is null or withdrawal_reason is not null
  )
);

alter table public.profiles enable row level security;
alter table public.consent_records enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can view their own consent records"
  on public.consent_records for select
  using ((select auth.uid()) = parent_id);

create policy "Users can create their own consent records"
  on public.consent_records for insert
  with check ((select auth.uid()) = parent_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role, sibling_profile_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'parent'),
    nullif(new.raw_user_meta_data ->> 'sibling_profile_id', '')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

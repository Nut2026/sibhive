create table public.pin_credentials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique,
  hive_id uuid not null,
  pin_hash text not null,
  credential_version integer not null default 1 check (credential_version > 0),
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  locked_until timestamptz,
  last_reset_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pin_credentials_lockout_matches_attempts check (
    locked_until is null or failed_attempts = 5
  )
);

comment on column public.pin_credentials.profile_id is
  'References sibling_profiles.id after the sibling profile migration is applied.';

comment on column public.pin_credentials.hive_id is
  'References hives.id after the hive migration is applied.';

alter table public.pin_credentials enable row level security;

create policy "Parents cannot access PIN hashes from the client"
  on public.pin_credentials for select
  using (false);

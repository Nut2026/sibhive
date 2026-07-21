create table public.hives (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete restrict,
  hive_name text not null check (char_length(trim(hive_name)) between 1 and 80),
  sweetness_score smallint not null default 0 check (sweetness_score between 0 and 100),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sibling_profiles (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 80),
  birth_date date not null,
  grade smallint check (grade between 1 and 12),
  interests text[] not null default '{}',
  avatar_url text,
  total_nectar integer not null default 0 check (total_nectar >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add constraint profiles_sibling_profile_id_fkey
  foreign key (sibling_profile_id)
  references public.sibling_profiles (id)
  on delete set null;

alter table public.pin_credentials
  add constraint pin_credentials_profile_id_fkey
  foreign key (profile_id)
  references public.sibling_profiles (id)
  on delete cascade,
  add constraint pin_credentials_hive_id_fkey
  foreign key (hive_id)
  references public.hives (id)
  on delete cascade;

create table public.sibling_pairs (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  child1_id uuid not null references public.sibling_profiles (id) on delete cascade,
  child2_id uuid not null references public.sibling_profiles (id) on delete cascade,
  relationship_type text not null check (relationship_type in ('biological', 'step', 'half', 'foster')),
  sweetness_score smallint not null default 0 check (sweetness_score between 0 and 100),
  total_nectar integer not null default 0 check (total_nectar >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sibling_pairs_distinct_children check (child1_id <> child2_id)
);

create unique index sibling_pairs_unique_unordered_children
  on public.sibling_pairs (hive_id, least(child1_id, child2_id), greatest(child1_id, child2_id));

create or replace function public.validate_sibling_pair_hive()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  child1_hive_id uuid;
  child2_hive_id uuid;
begin
  select hive_id into child1_hive_id from public.sibling_profiles where id = new.child1_id;
  select hive_id into child2_hive_id from public.sibling_profiles where id = new.child2_id;

  if child1_hive_id is distinct from new.hive_id or child2_hive_id is distinct from new.hive_id then
    raise exception 'Sibling pairs must contain two children from the specified hive';
  end if;

  return new;
end;
$$;

create trigger sibling_pairs_validate_hive
  before insert or update of hive_id, child1_id, child2_id on public.sibling_pairs
  for each row execute procedure public.validate_sibling_pair_hive();

create table public.activity_templates (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('honey_making', 'pollen_gathering', 'pollination', 'hive_heart', 'honeycomb_treasure')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null,
  instructions text not null,
  difficulty smallint not null check (difficulty between 1 and 3),
  duration_minutes smallint not null check (duration_minutes between 5 and 120),
  nectar_reward integer not null check (nectar_reward between 1 and 500),
  min_age smallint not null check (min_age between 8 and 16),
  max_age smallint not null check (max_age between 8 and 16 and max_age >= min_age),
  parent_tip text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  pair_id uuid not null references public.sibling_pairs (id) on delete cascade,
  template_id uuid references public.activity_templates (id) on delete set null,
  title text not null,
  description text not null,
  instructions text not null,
  generated_by_ai boolean not null default false,
  is_fallback boolean not null default false,
  approved boolean not null default false,
  scheduled_for timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint activities_schedule_window check (expires_at is null or scheduled_for is null or expires_at > scheduled_for)
);

create or replace function public.validate_activity_pair_hive()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  pair_hive_id uuid;
begin
  select hive_id into pair_hive_id from public.sibling_pairs where id = new.pair_id;

  if pair_hive_id is distinct from new.hive_id then
    raise exception 'Activities must use a sibling pair from the same hive';
  end if;

  return new;
end;
$$;

create trigger activities_validate_pair_hive
  before insert or update of hive_id, pair_id on public.activities
  for each row execute procedure public.validate_activity_pair_hive();

create table public.activity_completions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  child_id uuid not null references public.sibling_profiles (id) on delete cascade,
  response_type text not null check (response_type in ('text', 'image', 'audio', 'video', 'multi')),
  response_data jsonb not null default '{}'::jsonb,
  ai_confidence numeric(5, 2) check (ai_confidence between 0 and 100),
  status text not null default 'pending' check (status in ('pending', 'auto_approved', 'parent_review', 'approved', 'rejected', 'failed', 'skipped')),
  parent_decision text check (parent_decision in ('approved', 'rejected')),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (activity_id, child_id),
  constraint activity_completions_parent_decision_matches_status check (
    (parent_decision is null) or (parent_decision = 'approved' and status = 'approved') or (parent_decision = 'rejected' and status = 'rejected')
  )
);

create or replace function public.validate_completion_child_pair()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  assigned_pair public.sibling_pairs%rowtype;
begin
  select pair.* into assigned_pair
  from public.activities activity
  join public.sibling_pairs pair on pair.id = activity.pair_id
  where activity.id = new.activity_id;

  if new.child_id <> assigned_pair.child1_id and new.child_id <> assigned_pair.child2_id then
    raise exception 'Only a child assigned to the activity pair can submit completion evidence';
  end if;

  return new;
end;
$$;

create trigger activity_completions_validate_child_pair
  before insert or update of activity_id, child_id on public.activity_completions
  for each row execute procedure public.validate_completion_child_pair();

create table public.daily_prompts (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  pair_id uuid not null references public.sibling_pairs (id) on delete cascade,
  category text not null check (category in ('fun', 'deep', 'gratitude', 'sibling', 'future')),
  question_text text not null,
  nectar_reward integer not null check (nectar_reward between 1 and 100),
  generated_by_ai boolean not null default false,
  scheduled_for date not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (pair_id, scheduled_for)
);

create table public.prompt_responses (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.daily_prompts (id) on delete cascade,
  child_id uuid not null references public.sibling_profiles (id) on delete cascade,
  response_text text,
  response_data jsonb not null default '{}'::jsonb,
  is_shared_with_sibling boolean not null default false,
  is_shared_with_parent boolean not null default true,
  teen_private boolean not null default false,
  nectar_earned integer not null default 0 check (nectar_earned >= 0),
  responded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (prompt_id, child_id),
  constraint prompt_responses_teen_privacy_matches_parent_sharing check (
    not teen_private or not is_shared_with_parent
  )
);

create or replace function public.validate_prompt_response_privacy()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  child_birth_date date;
  child_hive_id uuid;
  prompt_hive_id uuid;
  prompt_pair_id uuid;
  prompt_pair public.sibling_pairs%rowtype;
  child_age integer;
begin
  select birth_date, hive_id into child_birth_date, child_hive_id
  from public.sibling_profiles where id = new.child_id;
  select hive_id, pair_id into prompt_hive_id, prompt_pair_id
  from public.daily_prompts where id = new.prompt_id;
  select * into prompt_pair from public.sibling_pairs where id = prompt_pair_id;

  if child_hive_id is distinct from prompt_hive_id
    or (new.child_id <> prompt_pair.child1_id and new.child_id <> prompt_pair.child2_id) then
    raise exception 'Prompt responses must be submitted by a child in the assigned sibling pair';
  end if;

  child_age := extract(year from age(current_date, child_birth_date));
  if child_age < 13 and (new.teen_private or not new.is_shared_with_parent) then
    raise exception 'Under-13 prompt responses must remain visible to the parent';
  end if;

  return new;
end;
$$;

create trigger prompt_responses_validate_privacy
  before insert or update of prompt_id, child_id, teen_private, is_shared_with_parent on public.prompt_responses
  for each row execute procedure public.validate_prompt_response_privacy();

create index hives_parent_id_idx on public.hives (parent_id);
create index sibling_profiles_hive_id_idx on public.sibling_profiles (hive_id);
create index activities_pair_schedule_idx on public.activities (pair_id, scheduled_for desc);
create index activity_completions_activity_id_idx on public.activity_completions (activity_id);
create index daily_prompts_pair_schedule_idx on public.daily_prompts (pair_id, scheduled_for desc);
create index prompt_responses_child_id_idx on public.prompt_responses (child_id);

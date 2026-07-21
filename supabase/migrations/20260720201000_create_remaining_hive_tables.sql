create table public.memory_artifacts (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  pair_id uuid references public.sibling_pairs (id) on delete set null,
  creator_id uuid not null references public.sibling_profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '',
  artifact_type text not null check (artifact_type in ('story', 'drawing', 'playlist', 'video', 'photo', 'audio')),
  media_urls text[] not null default '{}',
  categories text[] not null default '{}',
  nectar_reward integer not null default 0 check (nectar_reward >= 0),
  is_shared_with_sibling boolean not null default false,
  is_shared_with_parent boolean not null default true,
  teen_private boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  last_edited_at timestamptz not null default timezone('utc', now()),
  constraint memory_artifacts_teen_privacy_matches_parent_sharing check (
    not teen_private or not is_shared_with_parent
  )
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  sender_id uuid not null references public.sibling_profiles (id) on delete cascade,
  recipient_id uuid not null references public.sibling_profiles (id) on delete cascade,
  message_type text not null check (message_type in ('text', 'voice', 'image', 'system')),
  content text,
  media_url text,
  metadata jsonb not null default '{}'::jsonb,
  flagged_by_ai boolean not null default false,
  moderation_status text not null default 'approved' check (moderation_status in ('approved', 'flagged', 'blocked')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint chat_messages_content_present check (content is not null or media_url is not null)
);

create table public.conflict_logs (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  pair_id uuid not null references public.sibling_pairs (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete restrict,
  conflict_description text not null,
  conflict_type text not null check (conflict_type in ('resource', 'accusation', 'hurt', 'rivalry')),
  severity smallint not null check (severity between 1 and 5),
  activation_time timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.validate_conflict_log_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_role text;
  parent_hive_id uuid;
  pair_hive_id uuid;
begin
  select role into parent_role from public.profiles where id = new.parent_id;
  select id into parent_hive_id from public.hives where id = new.hive_id and parent_id = new.parent_id;
  select hive_id into pair_hive_id from public.sibling_pairs where id = new.pair_id;

  if parent_role <> 'parent' or parent_hive_id is null or pair_hive_id is distinct from new.hive_id then
    raise exception 'Conflict logs must be submitted by the owning parent for a pair in that hive';
  end if;

  return new;
end;
$$;

create trigger conflict_logs_validate_parent
  before insert or update of hive_id, pair_id, parent_id on public.conflict_logs
  for each row execute procedure public.validate_conflict_log_parent();

create table public.conflict_resolutions (
  id uuid primary key default gen_random_uuid(),
  conflict_log_id uuid not null unique references public.conflict_logs (id) on delete cascade,
  child1_statement text,
  child2_statement text,
  child1_perspective_story text,
  child2_perspective_story text,
  resolution_outcome text,
  honey_promise_child1 text,
  honey_promise_child2 text,
  resolution_status text not null default 'pending' check (resolution_status in ('pending', 'resolved', 'escalated')),
  resolved_at timestamptz,
  followed_up_at timestamptz,
  healing_badge_awarded boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.hive_treasures (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  name text not null,
  description text not null,
  icon_url text,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (hive_id, name)
);

create table public.child_treasures (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.sibling_profiles (id) on delete cascade,
  treasure_id uuid not null references public.hive_treasures (id) on delete cascade,
  earned_at timestamptz not null default timezone('utc', now()),
  viewed_at timestamptz,
  unique (child_id, treasure_id)
);

create table public.nectar_transactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.sibling_profiles (id) on delete cascade,
  source_type text not null check (source_type in ('activity', 'prompt', 'memory', 'healing', 'bonus')),
  source_id uuid,
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index memory_artifacts_hive_created_idx on public.memory_artifacts (hive_id, created_at desc);
create index chat_messages_hive_created_idx on public.chat_messages (hive_id, created_at desc);
create index conflict_logs_hive_created_idx on public.conflict_logs (hive_id, created_at desc);
create index activity_completions_child_created_idx on public.activity_completions (child_id, created_at desc);
create index prompt_responses_child_created_idx on public.prompt_responses (child_id, created_at desc);
create index child_treasures_child_created_idx on public.child_treasures (child_id, earned_at desc);
create index nectar_transactions_child_created_idx on public.nectar_transactions (child_id, created_at desc);
create index conflict_resolutions_created_idx on public.conflict_resolutions (created_at desc);
create index hive_treasures_created_idx on public.hive_treasures (created_at desc);

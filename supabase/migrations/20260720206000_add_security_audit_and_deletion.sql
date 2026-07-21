create table public.sensitive_action_audits (
  id uuid primary key default gen_random_uuid(), hive_id uuid references public.hives (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null, action text not null, target_id uuid,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default timezone('utc', now())
);
create index sensitive_action_audits_hive_created_idx on public.sensitive_action_audits (hive_id, created_at desc);
alter table public.sensitive_action_audits enable row level security;
create policy "Parents view own sensitive audits" on public.sensitive_action_audits for select using (public.is_hive_parent(hive_id));

create table public.hive_deletion_requests (
  id uuid primary key default gen_random_uuid(), hive_id uuid not null unique references public.hives (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete cascade, confirmation_token_hash text not null,
  requested_at timestamptz not null default timezone('utc', now()), confirmed_at timestamptz, scheduled_for timestamptz not null default timezone('utc', now()) + interval '30 days', status text not null default 'pending_email' check (status in ('pending_email','scheduled','completed','cancelled'))
);
alter table public.hive_deletion_requests enable row level security;
create policy "Parents view own deletion request" on public.hive_deletion_requests for select using (parent_id = auth.uid());

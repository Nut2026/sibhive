create or replace function public.is_parent()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent'
  );
$$;

create or replace function public.is_hive_parent(target_hive_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.hives
    where id = target_hive_id and parent_id = auth.uid()
  );
$$;

create or replace function public.current_teen_sibling_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select sibling_profile_id from public.profiles
  where id = auth.uid() and role = 'teen';
$$;

create or replace function public.is_under_13(target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select extract(year from age(current_date, birth_date)) < 13
  from public.sibling_profiles where id = target_child_id;
$$;

alter table public.hives enable row level security;
alter table public.sibling_profiles enable row level security;
alter table public.sibling_pairs enable row level security;
alter table public.activity_templates enable row level security;
alter table public.activities enable row level security;
alter table public.activity_completions enable row level security;
alter table public.nectar_transactions enable row level security;
alter table public.daily_prompts enable row level security;
alter table public.prompt_responses enable row level security;
alter table public.memory_artifacts enable row level security;
alter table public.chat_messages enable row level security;
alter table public.conflict_logs enable row level security;
alter table public.conflict_resolutions enable row level security;
alter table public.hive_treasures enable row level security;
alter table public.child_treasures enable row level security;

create policy "Parents manage own hives"
  on public.hives for all
  using (public.is_hive_parent(id))
  with check (parent_id = auth.uid() and public.is_parent());

create policy "Parents manage sibling profiles in own hive"
  on public.sibling_profiles for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id));

create policy "Teens view and update own sibling profile"
  on public.sibling_profiles for select
  using (id = public.current_teen_sibling_profile_id());

create policy "Teens update own sibling profile"
  on public.sibling_profiles for update
  using (id = public.current_teen_sibling_profile_id())
  with check (id = public.current_teen_sibling_profile_id());

create policy "Parents manage pairs in own hive"
  on public.sibling_pairs for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id));

create policy "Teens view their sibling pairs"
  on public.sibling_pairs for select
  using (child1_id = public.current_teen_sibling_profile_id() or child2_id = public.current_teen_sibling_profile_id());

create policy "Authenticated family members view activity templates"
  on public.activity_templates for select
  using (auth.uid() is not null);

create policy "Parents manage activity templates"
  on public.activity_templates for all
  using (public.is_parent())
  with check (public.is_parent());

create policy "Parents manage activities in own hive"
  on public.activities for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id));

create policy "Teens view assigned activities"
  on public.activities for select
  using (exists (
    select 1 from public.sibling_pairs
    where id = activities.pair_id
      and (child1_id = public.current_teen_sibling_profile_id() or child2_id = public.current_teen_sibling_profile_id())
  ));

create policy "Parents manage activity completions in own hive"
  on public.activity_completions for all
  using (exists (
    select 1 from public.activities
    where id = activity_completions.activity_id and public.is_hive_parent(hive_id)
  ))
  with check (exists (
    select 1 from public.activities
    where id = activity_completions.activity_id and public.is_hive_parent(hive_id)
  ));

create policy "Teens view and submit own completions"
  on public.activity_completions for select
  using (child_id = public.current_teen_sibling_profile_id());

create policy "Teens submit own completions"
  on public.activity_completions for insert
  with check (child_id = public.current_teen_sibling_profile_id());

create policy "Parents view Nectar in own hive"
  on public.nectar_transactions for select
  using (exists (
    select 1 from public.sibling_profiles
    where id = nectar_transactions.child_id and public.is_hive_parent(hive_id)
  ));

create policy "Teens view own Nectar"
  on public.nectar_transactions for select
  using (child_id = public.current_teen_sibling_profile_id());

create policy "Parents manage prompts in own hive"
  on public.daily_prompts for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id));

create policy "Teens view assigned prompts"
  on public.daily_prompts for select
  using (exists (
    select 1 from public.sibling_pairs
    where id = daily_prompts.pair_id
      and (child1_id = public.current_teen_sibling_profile_id() or child2_id = public.current_teen_sibling_profile_id())
  ));

create policy "Parents view permitted prompt responses"
  on public.prompt_responses for select
  using (exists (
    select 1 from public.daily_prompts
    where id = prompt_responses.prompt_id
      and public.is_hive_parent(hive_id)
      and (not prompt_responses.teen_private or public.is_under_13(prompt_responses.child_id))
  ));

create policy "Teens manage own prompt responses"
  on public.prompt_responses for all
  using (child_id = public.current_teen_sibling_profile_id())
  with check (child_id = public.current_teen_sibling_profile_id());

create policy "Parents view permitted memory artifacts"
  on public.memory_artifacts for select
  using (public.is_hive_parent(hive_id) and (not teen_private or public.is_under_13(creator_id)));

create policy "Parents manage non-private artifacts in own hive"
  on public.memory_artifacts for insert
  with check (public.is_hive_parent(hive_id) and not teen_private);

create policy "Teens manage own memory artifacts"
  on public.memory_artifacts for all
  using (creator_id = public.current_teen_sibling_profile_id())
  with check (creator_id = public.current_teen_sibling_profile_id());

create policy "Teens read shared memory artifacts"
  on public.memory_artifacts for select
  using (is_shared_with_sibling and exists (
    select 1 from public.sibling_pairs
    where id = memory_artifacts.pair_id
      and (child1_id = public.current_teen_sibling_profile_id() or child2_id = public.current_teen_sibling_profile_id())
  ));

create policy "Teens read messages they participate in"
  on public.chat_messages for select
  using (sender_id = public.current_teen_sibling_profile_id() or recipient_id = public.current_teen_sibling_profile_id());

create policy "Teens send messages as themselves"
  on public.chat_messages for insert
  with check (sender_id = public.current_teen_sibling_profile_id() and exists (
    select 1 from public.sibling_profiles recipient
    where recipient.id = chat_messages.recipient_id and recipient.hive_id = chat_messages.hive_id
  ));

create policy "Parents manage conflict logs in own hive"
  on public.conflict_logs for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id) and parent_id = auth.uid());

create policy "Parents manage conflict resolutions in own hive"
  on public.conflict_resolutions for all
  using (exists (
    select 1 from public.conflict_logs
    where id = conflict_resolutions.conflict_log_id and public.is_hive_parent(hive_id)
  ))
  with check (exists (
    select 1 from public.conflict_logs
    where id = conflict_resolutions.conflict_log_id and public.is_hive_parent(hive_id)
  ));

create policy "Parents manage hive treasures in own hive"
  on public.hive_treasures for all
  using (public.is_hive_parent(hive_id))
  with check (public.is_hive_parent(hive_id));

create policy "Teens view hive treasures in own hive"
  on public.hive_treasures for select
  using (exists (
    select 1 from public.sibling_profiles
    where id = public.current_teen_sibling_profile_id() and hive_id = hive_treasures.hive_id
  ));

create policy "Parents view child treasures in own hive"
  on public.child_treasures for select
  using (exists (
    select 1 from public.sibling_profiles
    where id = child_treasures.child_id and public.is_hive_parent(hive_id)
  ));

create policy "Teens view own child treasures"
  on public.child_treasures for select
  using (child_id = public.current_teen_sibling_profile_id());

create or replace function public.create_hive_onboarding(
  p_hive_name text,
  p_settings jsonb,
  p_children jsonb,
  p_pairs jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hive_id uuid;
  v_child jsonb;
  v_pair jsonb;
  v_child_ids uuid[] := '{}';
  v_child_id uuid;
  v_child1_index integer;
  v_child2_index integer;
begin
  if not public.is_parent() then
    raise exception 'Only a verified parent can create a hive';
  end if;

  if jsonb_typeof(p_children) <> 'array' or jsonb_array_length(p_children) not between 1 and 4 then
    raise exception 'A hive must contain between one and four children';
  end if;

  if jsonb_typeof(p_pairs) <> 'array' then
    raise exception 'Sibling pairs must be an array';
  end if;

  insert into public.hives (parent_id, hive_name, settings)
  values (auth.uid(), trim(p_hive_name), coalesce(p_settings, '{}'::jsonb))
  returning id into v_hive_id;

  for v_child in select value from jsonb_array_elements(p_children) loop
    if coalesce(trim(v_child ->> 'name'), '') = '' or (v_child ->> 'birth_date') is null then
      raise exception 'Every child requires a name and birth date';
    end if;

    insert into public.sibling_profiles (hive_id, name, birth_date, grade, interests, avatar_url)
    values (
      v_hive_id,
      trim(v_child ->> 'name'),
      (v_child ->> 'birth_date')::date,
      nullif(v_child ->> 'grade', '')::smallint,
      coalesce(array(select jsonb_array_elements_text(coalesce(v_child -> 'interests', '[]'::jsonb))), '{}'),
      nullif(v_child ->> 'avatar_url', '')
    )
    returning id into v_child_id;

    v_child_ids := array_append(v_child_ids, v_child_id);
  end loop;

  for v_pair in select value from jsonb_array_elements(p_pairs) loop
    v_child1_index := (v_pair ->> 'child1_index')::integer;
    v_child2_index := (v_pair ->> 'child2_index')::integer;

    if v_child1_index is null or v_child2_index is null
      or v_child1_index < 0 or v_child2_index < 0
      or v_child1_index >= cardinality(v_child_ids) or v_child2_index >= cardinality(v_child_ids) then
      raise exception 'Sibling pair indices are invalid';
    end if;

    insert into public.sibling_pairs (hive_id, child1_id, child2_id, relationship_type)
    values (
      v_hive_id,
      v_child_ids[v_child1_index + 1],
      v_child_ids[v_child2_index + 1],
      coalesce(v_pair ->> 'relationship_type', 'biological')
    );
  end loop;

  return jsonb_build_object('hive_id', v_hive_id, 'child_ids', to_jsonb(v_child_ids));
end;
$$;

grant execute on function public.create_hive_onboarding(text, jsonb, jsonb, jsonb) to authenticated;

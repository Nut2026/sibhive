alter table public.hives
  add column score_calculated_at timestamptz,
  add column score_version text not null default 'v1',
  add column onboarding_completed_at timestamptz,
  add column baseline_assessment jsonb not null default '{}'::jsonb;

create table public.hive_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  score numeric(5, 2) not null check (score between 0 and 100),
  calculation_version text not null,
  inputs jsonb not null,
  calculated_at timestamptz not null default timezone('utc', now())
);
create index hive_score_snapshots_hive_calculated_idx on public.hive_score_snapshots (hive_id, calculated_at desc);
alter table public.hive_score_snapshots enable row level security;
create policy "Parents view own hive score history" on public.hive_score_snapshots for select using (public.is_hive_parent(hive_id));

create or replace function public.recalculate_hive_sweetness(p_hive_id uuid, p_trigger text default 'event')
returns numeric
language plpgsql security definer set search_path = '' as $$
declare v_activity numeric := 0; v_prompt numeric := 0; v_positive numeric := 0; v_conflict numeric := 0; v_nectar numeric := 0; v_score numeric;
begin
  select coalesce(avg(case when c.status in ('approved', 'auto_approved') then 1 else 0 end), 0) into v_activity from public.activity_completions c join public.activities a on a.id = c.activity_id where a.hive_id = p_hive_id and c.created_at >= timezone('utc', now()) - interval '30 days';
  select coalesce(avg(case when response_text is not null or response_data <> '{}'::jsonb then 1 else 0 end), 0) into v_prompt from public.prompt_responses r join public.daily_prompts p on p.id = r.prompt_id where p.hive_id = p_hive_id and r.created_at >= timezone('utc', now()) - interval '30 days';
  select coalesce(avg(case when moderation_status = 'approved' then 1 else 0 end), 0) into v_positive from public.chat_messages where hive_id = p_hive_id and created_at >= timezone('utc', now()) - interval '30 days';
  select coalesce(avg(case when resolution_status = 'resolved' then 1 else 0 end), 0) into v_conflict from public.conflict_resolutions r join public.conflict_logs l on l.id = r.conflict_log_id where l.hive_id = p_hive_id and r.created_at >= timezone('utc', now()) - interval '30 days';
  select least(1, coalesce(sum(amount), 0)::numeric / greatest(1, (select count(*) from public.sibling_profiles where hive_id = p_hive_id) * 200)) into v_nectar from public.nectar_transactions n join public.sibling_profiles s on s.id = n.child_id where s.hive_id = p_hive_id and n.created_at >= timezone('utc', now()) - interval '30 days';
  v_score := round(least(100, greatest(0, v_activity * 35 + v_prompt * 25 + v_positive * 20 + v_conflict * 15 + v_nectar * 5)), 2);
  update public.hives set sweetness_score = v_score::smallint, score_calculated_at = timezone('utc', now()), score_version = 'v1', updated_at = timezone('utc', now()) where id = p_hive_id;
  insert into public.hive_score_snapshots (hive_id, score, calculation_version, inputs) values (p_hive_id, v_score, 'v1', jsonb_build_object('window_days', 30, 'trigger', p_trigger, 'activity_completion', v_activity, 'prompt_engagement', v_prompt, 'positive_interactions', v_positive, 'conflict_resolution', v_conflict, 'nectar', v_nectar));
  return v_score;
end; $$;
revoke all on function public.recalculate_hive_sweetness(uuid, text) from public;

create or replace function public.complete_hive_onboarding(p_hive_name text, p_settings jsonb, p_children jsonb, p_pairs jsonb, p_assessment jsonb)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_result jsonb; v_hive_id uuid; v_child_id uuid; v_pair_id uuid; v_balance integer;
begin
  v_result := public.create_hive_onboarding(p_hive_name, p_settings, p_children, p_pairs);
  v_hive_id := (v_result ->> 'hive_id')::uuid;
  update public.hives set baseline_assessment = coalesce(p_assessment, '{}'::jsonb), onboarding_completed_at = timezone('utc', now()) where id = v_hive_id;
  for v_child_id in select value::uuid from jsonb_array_elements_text(v_result -> 'child_ids') loop
    update public.sibling_profiles set total_nectar = total_nectar + 50, updated_at = timezone('utc', now()) where id = v_child_id returning total_nectar into v_balance;
    insert into public.nectar_transactions (child_id, source_type, amount, balance_after) values (v_child_id, 'bonus', 50, v_balance);
  end loop;
  select id into v_pair_id from public.sibling_pairs where hive_id = v_hive_id order by created_at limit 1;
  if v_pair_id is not null then
    insert into public.activities (hive_id, pair_id, title, description, instructions, nectar_reward, generated_by_ai, is_fallback, approved, scheduled_for)
    values (v_hive_id, v_pair_id, 'Kindness Crew', 'Create a small kindness plan together.', 'Each sibling names one helpful action. Choose one action and do it together.', 20, false, true, true, timezone('utc', now()));
    insert into public.daily_prompts (hive_id, pair_id, category, question_text, nectar_reward, generated_by_ai, scheduled_for)
    values (v_hive_id, v_pair_id, 'gratitude', 'What is one small thing your sibling did recently that you appreciated?', 5, false, current_date);
  end if;
  perform public.recalculate_hive_sweetness(v_hive_id, 'baseline');
  return v_result || jsonb_build_object('welcome_nectar_per_child', 50, 'onboarding_complete', true);
end; $$;
grant execute on function public.complete_hive_onboarding(text, jsonb, jsonb, jsonb, jsonb) to authenticated;

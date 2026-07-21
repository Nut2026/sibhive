alter table public.activities
  add column nectar_reward integer not null default 0 check (nectar_reward between 0 and 500),
  add column generation_metadata jsonb not null default '{}'::jsonb;

alter table public.activity_completions
  add column verified_at timestamptz,
  add column reviewed_by uuid references public.profiles (id) on delete set null,
  add column review_reason text;

create unique index nectar_transactions_one_activity_award_per_child_idx
  on public.nectar_transactions (child_id, source_type, source_id)
  where source_type = 'activity' and source_id is not null;

create or replace function public.award_activity_pair(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_pair public.sibling_pairs%rowtype;
  v_reward integer;
  v_child_id uuid;
  v_balance integer;
  v_awarded integer := 0;
begin
  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found then
    raise exception 'Activity not found';
  end if;

  select * into v_pair from public.sibling_pairs where id = v_activity.pair_id for update;
  v_reward := coalesce(nullif(v_activity.nectar_reward, 0), (
    select nectar_reward from public.activity_templates where id = v_activity.template_id
  ), 0);
  if v_reward <= 0 then
    raise exception 'Activity reward must be positive before awarding Nectar';
  end if;

  foreach v_child_id in array array[v_pair.child1_id, v_pair.child2_id] loop
    if not exists (
      select 1 from public.nectar_transactions
      where child_id = v_child_id and source_type = 'activity' and source_id = v_activity.id
    ) then
      update public.sibling_profiles
      set total_nectar = total_nectar + v_reward, updated_at = timezone('utc', now())
      where id = v_child_id
      returning total_nectar into v_balance;

      insert into public.nectar_transactions (child_id, source_type, source_id, amount, balance_after)
      values (v_child_id, 'activity', v_activity.id, v_reward, v_balance);
      v_awarded := v_awarded + 1;
    end if;
  end loop;

  update public.sibling_pairs
  set total_nectar = total_nectar + (v_reward * v_awarded), updated_at = timezone('utc', now())
  where id = v_pair.id;

  return jsonb_build_object('activity_id', v_activity.id, 'members_awarded', v_awarded, 'nectar_each', v_reward);
end;
$$;

revoke all on function public.award_activity_pair(uuid) from public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('activity-proofs', 'activity-proofs', false, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/webm', 'audio/wav'])
on conflict (id) do nothing;

create policy "Family members upload own activity proof"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'activity-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Family members view own activity proof"
  on storage.objects for select to authenticated
  using (bucket_id = 'activity-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

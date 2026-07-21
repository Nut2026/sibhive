-- Deterministic demo family for local/staging reset only. Never use these IDs or credentials in production.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'demo.parent@sibhive.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOa60HwzU2KD1FwjcJY8Kph4u5cQvQLCq', '2026-07-20T00:00:00Z', '{"provider":"email","providers":["email"]}', '{"display_name":"Demo Parent"}', '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z');

update public.profiles
set consent_version = '2026-07-20', consent_accepted_at = '2026-07-20T00:00:00Z'
where id = '00000000-0000-0000-0000-000000000001';

insert into public.hives (id, parent_id, hive_name, sweetness_score, settings, created_at, updated_at)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'The Demo Hive', 56, '{"notifications":true}'::jsonb, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z');

insert into public.sibling_profiles (id, hive_id, name, birth_date, grade, interests, avatar_url, total_nectar, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Ari', '2018-07-20', 3, array['drawing', 'animals'], null, 95, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Bea', '2014-07-20', 7, array['music', 'puzzles'], null, 110, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Casey', '2012-07-20', 9, array['gaming', 'stories'], null, 125, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z');

insert into public.sibling_pairs (id, hive_id, child1_id, child2_id, relationship_type, sweetness_score, total_nectar, created_at, updated_at)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'biological', 58, 205, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'biological', 54, 220, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'biological', 56, 235, '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z');

insert into public.activities (id, hive_id, pair_id, template_id, title, description, instructions, generated_by_ai, is_fallback, approved, scheduled_for, created_at, updated_at)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', (select id from public.activity_templates where title = 'Pillow Fort Challenge'), 'Pillow Fort Challenge', 'Build a cozy fort together.', 'Plan, build, and name your fort together.', false, false, true, '2026-07-20T16:00:00Z', '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', null, 'AI Story Weave', 'An AI-personalized story activity.', 'Take turns adding one chapter to a shared adventure.', true, false, true, '2026-07-21T16:00:00Z', '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', (select id from public.activity_templates where title = 'Puzzle Partners'), 'Puzzle Partners', 'A safe fallback when AI generation is unavailable.', 'Sort pieces, take turns, and finish together.', false, true, true, '2026-07-22T16:00:00Z', '2026-07-20T00:00:00Z', '2026-07-20T00:00:00Z');

insert into public.activity_completions (id, activity_id, child_id, response_type, response_data, ai_confidence, status, parent_decision, completed_at, created_at, updated_at)
values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'text', '{"text":"We built a fort."}'::jsonb, 92, 'approved', 'approved', '2026-07-20T17:00:00Z', '2026-07-20T17:00:00Z', '2026-07-20T17:00:00Z'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'text', '{"text":"We named it Golden Hive."}'::jsonb, 92, 'approved', 'approved', '2026-07-20T17:00:00Z', '2026-07-20T17:00:00Z', '2026-07-20T17:00:00Z');

insert into public.daily_prompts (id, hive_id, pair_id, category, question_text, nectar_reward, generated_by_ai, scheduled_for, created_at)
values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'fun', 'What should you build together this week?', 15, true, '2026-07-20', '2026-07-20T00:00:00Z'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'deep', 'What do you appreciate about your sibling?', 20, true, '2026-07-20', '2026-07-20T00:00:00Z');

insert into public.prompt_responses (id, prompt_id, child_id, response_text, is_shared_with_sibling, is_shared_with_parent, teen_private, nectar_earned, responded_at, created_at)
values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'A big fort with a secret door.', true, true, false, 15, '2026-07-20T08:00:00Z', '2026-07-20T08:00:00Z'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'A reading corner in the fort.', true, true, false, 15, '2026-07-20T08:05:00Z', '2026-07-20T08:05:00Z'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'They always make me laugh.', false, false, true, 20, '2026-07-20T08:10:00Z', '2026-07-20T08:10:00Z');

insert into public.memory_artifacts (id, hive_id, pair_id, creator_id, title, description, artifact_type, categories, nectar_reward, is_shared_with_sibling, created_at, last_edited_at)
values ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Golden Hive Fort', 'Our first fort memory.', 'photo', array['joy'], 10, true, '2026-07-20T17:05:00Z', '2026-07-20T17:05:00Z');

insert into public.nectar_transactions (id, child_id, source_type, source_id, amount, balance_after, created_at)
values
  ('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'activity', '40000000-0000-0000-0000-000000000001', 40, 80, '2026-07-20T17:00:00Z'),
  ('90000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'activity', '40000000-0000-0000-0000-000000000001', 40, 95, '2026-07-20T17:00:00Z'),
  ('90000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'prompt', '60000000-0000-0000-0000-000000000002', 20, 125, '2026-07-20T08:10:00Z');

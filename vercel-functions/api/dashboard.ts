import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

const getPairIdsForProfile = async (profileId: string, hiveId: string) => {
  const client = createAdminClient()
  const { data, error } = await client
    .from('sibling_pairs')
    .select('id, child1_id, child2_id, sweetness_score, total_nectar')
    .eq('hive_id', hiveId)
    .or(`child1_id.eq.${profileId},child2_id.eq.${profileId}`)

  if (error) {
    throw error
  }

  return data ?? []
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const context = await resolveContext(request)
    const client = createAdminClient()

    if (context.role === 'parent') {
      const [{ data: hive }, { data: children }, { data: pairs }, { data: activities }, { data: promptResponses }, { count: pendingReviews }, { count: privatePromptCount }, { count: privateArtifactCount }] =
        await Promise.all([
          client.from('hives').select('id, hive_name, sweetness_score, settings').eq('id', context.hiveId).single(),
          client
            .from('sibling_profiles')
            .select('id, name, birth_date, avatar_url, total_nectar')
            .eq('hive_id', context.hiveId),
          client
            .from('sibling_pairs')
            .select('id, child1_id, child2_id, sweetness_score, total_nectar')
            .eq('hive_id', context.hiveId),
          client
            .from('activities')
            .select('id, pair_id, title, approved, scheduled_for')
            .eq('hive_id', context.hiveId)
            .eq('approved', true)
            .order('scheduled_for', { ascending: true })
            .limit(10),
          client
            .from('prompt_responses')
            .select('id, prompt_id, child_id, is_shared_with_sibling, is_shared_with_parent, teen_private, responded_at, daily_prompts!inner(hive_id)')
            .eq('daily_prompts.hive_id', context.hiveId)
            .eq('is_shared_with_parent', true)
            .order('responded_at', { ascending: false })
            .limit(10),
          client.from('activity_completions').select('id, activities!inner(hive_id)', { count: 'exact', head: true }).eq('activities.hive_id', context.hiveId).eq('status', 'parent_review'),
          client.from('prompt_responses').select('id, daily_prompts!inner(hive_id)', { count: 'exact', head: true }).eq('daily_prompts.hive_id', context.hiveId).eq('teen_private', true),
          client.from('memory_artifacts').select('id', { count: 'exact', head: true }).eq('hive_id', context.hiveId).eq('teen_private', true),
        ])

      return Response.json({
        activities: activities ?? [],
        children: children ?? [],
        hive,
        pairs: pairs ?? [],
        promptResponses: (promptResponses ?? []).filter((response) => !response.teen_private),
        privateIndicators: { artifacts: privateArtifactCount ?? 0, prompts: privatePromptCount ?? 0 },
        pendingReviews: pendingReviews ?? 0,
        role: 'parent',
      })
    }

    const pairs = await getPairIdsForProfile(context.profileId, context.hiveId)
    const pairIds = pairs.map((pair) => pair.id)
    const [{ data: profile }, { data: activities }, { data: prompts }, { data: nectar }] = await Promise.all([
      client
        .from('sibling_profiles')
        .select('id, name, avatar_url, total_nectar')
        .eq('id', context.profileId)
        .eq('hive_id', context.hiveId)
        .single(),
      client
        .from('activities')
        .select('id, pair_id, title, description, instructions, approved, scheduled_for')
        .in('pair_id', pairIds)
        .eq('approved', true)
        .order('scheduled_for', { ascending: true })
        .limit(10),
      client
        .from('prompt_responses')
        .select('id, prompt_id, response_text, is_shared_with_sibling, is_shared_with_parent, teen_private, responded_at')
        .eq('child_id', context.profileId)
        .order('responded_at', { ascending: false })
        .limit(10),
      client
        .from('nectar_transactions')
        .select('id, source_type, amount, balance_after, created_at')
        .eq('child_id', context.profileId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const safePairs = pairs.map((pair) => ({ id: pair.id, sweetness_score: pair.sweetness_score, total_nectar: pair.total_nectar }))
    return Response.json({
      activities: activities ?? [],
      nectar: nectar ?? [],
      pairs: safePairs,
      profile,
      promptResponses: prompts ?? [],
      role: context.role,
    })
  } catch (error) {
    return unauthorized(error)
  }
}

import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'
import { fallbackActivity, generateActivity } from '../lib/ai-workflows.js'

type Payload = { pairId?: string; regenerateActivityId?: string; scheduledFor?: string }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role !== 'parent') return Response.json({ error: 'Only a parent can generate activities.' }, { status: 403 })
    const payload = (await request.json()) as Payload
    const db = createAdminClient()
    const existing = payload.regenerateActivityId
      ? await db.from('activities').select('id, pair_id, title').eq('id', payload.regenerateActivityId).eq('hive_id', context.hiveId).maybeSingle()
      : { data: null, error: null }
    if (existing.error || (payload.regenerateActivityId && !existing.data)) return Response.json({ error: 'Activity was not found in this hive.' }, { status: 404 })
    const pairId = payload.pairId ?? existing.data?.pair_id
    if (!pairId) return Response.json({ error: 'A sibling pair is required.' }, { status: 400 })
    const { data: pair } = await db.from('sibling_pairs').select('child1_id, child2_id').eq('id', pairId).eq('hive_id', context.hiveId).maybeSingle()
    if (!pair) return Response.json({ error: 'Sibling pair was not found in this hive.' }, { status: 404 })
    const { data: siblings } = await db.from('sibling_profiles').select('birth_date, interests').in('id', [pair.child1_id, pair.child2_id])
    const ages = (siblings ?? []).map((s) => new Date().getFullYear() - new Date(s.birth_date).getFullYear())
    const interests = (siblings ?? []).flatMap((s) => s.interests ?? [])
    let draft = fallbackActivity
    let generatedByAi = false
    try { draft = await generateActivity({ ages, interests, previousTitle: existing.data?.title }); generatedByAi = true } catch { /* curated fallback is intentional */ }
    const { data: activity, error } = await db.from('activities').insert({
      hive_id: context.hiveId, pair_id: pairId, title: draft.title, description: draft.description, instructions: draft.instructions,
      nectar_reward: draft.nectarReward, generated_by_ai: generatedByAi, is_fallback: !generatedByAi, approved: true,
      scheduled_for: payload.scheduledFor ?? null, generation_metadata: { model: generatedByAi ? (process.env.OPENAI_TERRA_MODEL ?? 'gpt-5.6-terra') : 'curated-fallback' },
    }).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(activity, { status: 201 })
  } catch (error) { return unauthorized(error) }
}

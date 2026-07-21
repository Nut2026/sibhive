import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role !== 'parent') return Response.json({ error: 'Only a parent can review a completion.' }, { status: 403 })
    const { completionId, decision, reason } = await request.json() as { completionId?: string; decision?: 'approved' | 'rejected'; reason?: string }
    if (!completionId || !['approved', 'rejected'].includes(decision ?? '')) return Response.json({ error: 'Completion and decision are required.' }, { status: 400 })
    const db = createAdminClient()
    const { data: completion } = await db.from('activity_completions').select('id, activity_id, activities!inner(hive_id)').eq('id', completionId).eq('activities.hive_id', context.hiveId).maybeSingle()
    if (!completion) return Response.json({ error: 'Completion was not found in this hive.' }, { status: 404 })
    const { data, error } = await db.from('activity_completions').update({ status: decision, parent_decision: decision, reviewed_by: context.profileId, review_reason: reason?.trim() || null, verified_at: new Date().toISOString() }).eq('id', completion.id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    const reward = decision === 'approved' ? await db.rpc('award_activity_pair', { p_activity_id: completion.activity_id }) : { data: null, error: null }
    if (reward.error) return Response.json({ error: reward.error.message }, { status: 400 })
    await db.rpc('recalculate_hive_sweetness', { p_hive_id: context.hiveId, p_trigger: 'completion_review' })
    return Response.json({ completion: data, reward: reward.data })
  } catch (error) { return unauthorized(error) }
}

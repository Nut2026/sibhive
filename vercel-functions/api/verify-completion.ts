import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'
import { shouldAutoApprove, verifyImageCompletion } from '../lib/ai-workflows.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role === 'child') return Response.json({ error: 'Child sessions cannot trigger verification.' }, { status: 403 })
    const { completionId } = await request.json() as { completionId?: string }
    if (!completionId) return Response.json({ error: 'Completion ID is required.' }, { status: 400 })
    const db = createAdminClient()
    const { data: completion } = await db.from('activity_completions').select('id, child_id, response_type, response_data, activities!inner(id, hive_id, instructions)').eq('id', completionId).eq('activities.hive_id', context.hiveId).maybeSingle()
    if (!completion || completion.response_type !== 'image') return Response.json({ error: 'Image completion was not found in this hive.' }, { status: 404 })
    const mediaUrl = completion.response_data.mediaUrl
    if (typeof mediaUrl !== 'string') return Response.json({ error: 'Image proof URL is required.' }, { status: 400 })
    const activity = Array.isArray(completion.activities) ? completion.activities[0] : completion.activities
    if (!activity) return Response.json({ error: 'Activity instructions are unavailable.' }, { status: 400 })
    let confidence = 0
    try { confidence = await verifyImageCompletion(mediaUrl, activity.instructions) } catch { /* no automatic approval when Vision is unavailable */ }
    const autoApproved = shouldAutoApprove(confidence)
    const { data, error } = await db.from('activity_completions').update({ ai_confidence: confidence, status: autoApproved ? 'auto_approved' : 'parent_review', verified_at: new Date().toISOString() }).eq('id', completion.id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    const reward = autoApproved ? await db.rpc('award_activity_pair', { p_activity_id: activity.id }) : { data: null, error: null }
    if (reward.error) return Response.json({ error: reward.error.message }, { status: 400 })
    if (autoApproved) await db.rpc('recalculate_hive_sweetness', { p_hive_id: context.hiveId, p_trigger: 'completion_auto_approval' })
    return Response.json({ autoApproved, completion: data, reward: reward.data })
  } catch (error) { return unauthorized(error) }
}

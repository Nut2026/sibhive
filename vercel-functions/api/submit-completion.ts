import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role === 'parent') return Response.json({ error: 'Only an assigned sibling can submit a completion.' }, { status: 403 })
    const { activityId, responseType, responseData } = await request.json() as { activityId?: string; responseType?: 'text' | 'image' | 'audio'; responseData?: Record<string, unknown> }
    if (!activityId || !responseType || !responseData) return Response.json({ error: 'Activity, proof type, and proof are required.' }, { status: 400 })
    const db = createAdminClient()
    const { data: activity } = await db.from('activities').select('id, hive_id').eq('id', activityId).eq('hive_id', context.hiveId).maybeSingle()
    if (!activity) return Response.json({ error: 'Activity was not found in this hive.' }, { status: 404 })
    const { data, error } = await db.from('activity_completions').upsert({ activity_id: activityId, child_id: context.profileId, response_type: responseType, response_data: responseData, status: responseType === 'image' ? 'parent_review' : 'parent_review', completed_at: new Date().toISOString() }, { onConflict: 'activity_id,child_id' }).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data, { status: 201 })
  } catch (error) { return unauthorized(error) }
}

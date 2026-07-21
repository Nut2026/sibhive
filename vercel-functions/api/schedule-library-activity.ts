import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role !== 'parent') return Response.json({ error: 'Only a parent can schedule activities.' }, { status: 403 })
    const { pairId, templateId, scheduledFor } = await request.json() as { pairId?: string; templateId?: string; scheduledFor?: string }
    if (!pairId || !templateId) return Response.json({ error: 'A sibling pair and template are required.' }, { status: 400 })
    const db = createAdminClient()
    const [{ data: pair }, { data: template }] = await Promise.all([
      db.from('sibling_pairs').select('id').eq('id', pairId).eq('hive_id', context.hiveId).maybeSingle(),
      db.from('activity_templates').select('id, title, description, instructions, nectar_reward').eq('id', templateId).maybeSingle(),
    ])
    if (!pair || !template) return Response.json({ error: 'The pair or template is unavailable.' }, { status: 404 })
    const { data, error } = await db.from('activities').insert({ hive_id: context.hiveId, pair_id: pairId, template_id: template.id, title: template.title, description: template.description, instructions: template.instructions, nectar_reward: template.nectar_reward, approved: true, scheduled_for: scheduledFor ?? null }).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data, { status: 201 })
  } catch (error) { return unauthorized(error) }
}

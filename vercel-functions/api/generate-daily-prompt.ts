import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'
import { fallbackPrompt, generatePrompt } from '../lib/ai-workflows.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role !== 'parent') return Response.json({ error: 'Only a parent can generate prompts.' }, { status: 403 })
    const { pairId, scheduledFor } = (await request.json()) as { pairId?: string; scheduledFor?: string }
    if (!pairId || !scheduledFor) return Response.json({ error: 'A pair and scheduled date are required.' }, { status: 400 })
    const db = createAdminClient()
    const { data: pair } = await db.from('sibling_pairs').select('child1_id, child2_id').eq('id', pairId).eq('hive_id', context.hiveId).maybeSingle()
    if (!pair) return Response.json({ error: 'Sibling pair was not found in this hive.' }, { status: 404 })
    const { data: siblings } = await db.from('sibling_profiles').select('birth_date, interests').in('id', [pair.child1_id, pair.child2_id])
    const ages = (siblings ?? []).map((s) => new Date().getFullYear() - new Date(s.birth_date).getFullYear())
    const interests = (siblings ?? []).flatMap((s) => s.interests ?? [])
    let draft = fallbackPrompt; let generatedByAi = false
    try { draft = await generatePrompt({ ages, interests }); generatedByAi = true } catch { /* curated fallback is intentional */ }
    const { data, error } = await db.from('daily_prompts').insert({ hive_id: context.hiveId, pair_id: pairId, category: draft.category, question_text: draft.questionText, nectar_reward: 5, generated_by_ai: generatedByAi, scheduled_for: scheduledFor }).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json(data, { status: 201 })
  } catch (error) { return unauthorized(error) }
}

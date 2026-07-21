import { createAdminClient, resolveContext, unauthorized } from '../lib/auth-helpers.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  try {
    const context = await resolveContext(request)
    if (context.role === 'parent') return Response.json({ error: 'Only a sibling can answer a prompt.' }, { status: 403 })
    const { promptId, responseText, shareWithSibling = false, teenPrivate = false } = await request.json() as { promptId?: string; responseText?: string; shareWithSibling?: boolean; teenPrivate?: boolean }
    if (!promptId || !responseText?.trim()) return Response.json({ error: 'A prompt and response are required.' }, { status: 400 })
    if (context.role !== 'teen' && teenPrivate) return Response.json({ error: 'Only teens can make a prompt response private.' }, { status: 403 })
    const { data, error } = await createAdminClient().from('prompt_responses').upsert({ prompt_id: promptId, child_id: context.profileId, response_text: responseText.trim(), is_shared_with_sibling: shareWithSibling, is_shared_with_parent: !teenPrivate, teen_private: teenPrivate }, { onConflict: 'prompt_id,child_id' }).select().single()
    if (error) return Response.json({ error: error.message }, { status: 400 })
    const { data: prompt } = await createAdminClient().from('daily_prompts').select('hive_id').eq('id', promptId).single()
    if (prompt) await createAdminClient().rpc('recalculate_hive_sweetness', { p_hive_id: prompt.hive_id, p_trigger: 'prompt_response' })
    return Response.json(data, { status: 201 })
  } catch (error) { return unauthorized(error) }
}

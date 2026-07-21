import { createAdminClient } from '../lib/auth-helpers.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  const db = createAdminClient(); const { data: hives, error } = await db.from('hives').select('id')
  if (error) return Response.json({ error: error.message }, { status: 400 })
  await Promise.all((hives ?? []).map((hive) => db.rpc('recalculate_hive_sweetness', { p_hive_id: hive.id, p_trigger: 'daily' })))
  return Response.json({ recalculated: hives?.length ?? 0 })
}

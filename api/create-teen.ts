import { createClient } from '@supabase/supabase-js'

type CreateTeenRequest = {
  email?: string
  siblingProfileId?: string
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authorization = request.headers.get('authorization')

  if (!supabaseUrl || !serviceRoleKey || !authorization) {
    return Response.json({ error: 'Teen account setup is not configured.' }, { status: 503 })
  }

  const requesterClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY ?? '', {
    global: { headers: { Authorization: authorization } },
  })
  const {
    data: { user: parent },
  } = await requesterClient.auth.getUser()

  const { email, siblingProfileId } = (await request.json()) as CreateTeenRequest
  if (!parent || !email || !siblingProfileId) {
    return Response.json({ error: 'A parent, teen email, and sibling profile are required.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: parentProfile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', parent.id)
    .eq('role', 'parent')
    .maybeSingle()

  if (!parentProfile) {
    return Response.json({ error: 'Only the hive parent can create teen accounts.' }, { status: 403 })
  }

  const [{ data: siblingProfile }, { data: parentHive }] = await Promise.all([
    adminClient.from('sibling_profiles').select('hive_id').eq('id', siblingProfileId).maybeSingle(),
    adminClient.from('hives').select('id').eq('parent_id', parent.id).maybeSingle(),
  ])

  if (!siblingProfile || !parentHive || siblingProfile.hive_id !== parentHive.id) {
    return Response.json({ error: 'The selected sibling profile is not in your hive.' }, { status: 403 })
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { role: 'teen', sibling_profile_id: siblingProfileId },
    redirectTo: `${new URL(request.url).origin}/teen/activate`,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ userId: data.user.id }, { status: 201 })
}

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { decode, verify } from 'jsonwebtoken'

export type RequestContext =
  | { hiveId: string; profileId: string; role: 'child' }
  | { hiveId: string; profileId: string; role: 'parent' | 'teen'; user: User }

type ChildTokenPayload = {
  credential_version: number
  hive_id: string
  profile_id: string
  role: 'child'
}

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization')
  return authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null
}

export const createAdminClient = () => {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server credentials are not configured.')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const createUserClient = (token: string) => {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase public server credentials are not configured.')
  }

  return createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
}

export const validateJWT = async (token: string, client = createAdminClient()): Promise<User> => {
  const {
    data: { user },
    error,
  } = await client.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid authenticated session.')
  }

  return user
}

export const validateChildSession = async (
  token: string,
  client = createAdminClient(),
): Promise<RequestContext & { role: 'child' }> => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Child session validation is not configured.')
  }

  const payload = verify(token, secret, {
    algorithms: ['HS256'],
    audience: 'sibhive-child',
    issuer: 'sibhive',
  }) as ChildTokenPayload

  if (payload.role !== 'child') {
    throw new Error('Invalid child session role.')
  }

  const { data: credential, error } = await client
    .from('pin_credentials')
    .select('profile_id, hive_id, credential_version')
    .eq('profile_id', payload.profile_id)
    .eq('hive_id', payload.hive_id)
    .maybeSingle()

  if (error || !credential || credential.credential_version !== payload.credential_version) {
    throw new Error('Child session is no longer valid.')
  }

  return { hiveId: credential.hive_id, profileId: credential.profile_id, role: 'child' }
}

export const resolveContext = async (request: Request): Promise<RequestContext> => {
  const token = getBearerToken(request)
  if (!token) {
    throw new Error('Missing authorization token.')
  }

  const decodedToken = decode(token) as { aud?: string } | null
  if (decodedToken?.aud === 'sibhive-child') {
    return validateChildSession(token)
  }

  const user = await validateJWT(token)
  const adminClient = createAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, role, sibling_profile_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    throw new Error('Application profile is unavailable.')
  }

  if (profile.role === 'parent') {
    const { data: hive } = await adminClient
      .from('hives')
      .select('id')
      .eq('parent_id', profile.id)
      .maybeSingle()

    return { hiveId: hive?.id ?? '', profileId: profile.id, role: 'parent', user }
  }

  if (!profile.sibling_profile_id) {
    throw new Error('Teen sibling profile is unavailable.')
  }

  const { data: siblingProfile } = await adminClient
    .from('sibling_profiles')
    .select('id, hive_id')
    .eq('id', profile.sibling_profile_id)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!siblingProfile) {
    throw new Error('Teen account is not linked to a hive.')
  }

  return { hiveId: siblingProfile.hive_id, profileId: siblingProfile.id, role: 'teen', user }
}

export const unauthorized = (error: unknown) =>
  Response.json(
    { error: error instanceof Error ? error.message : 'Unauthorized request.' },
    { status: 401 },
  )

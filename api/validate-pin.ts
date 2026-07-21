import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

type PinValidationRequest = {
  pin?: string
  profileId?: string
}

const genericFailure = () =>
  Response.json({ error: 'The PIN or child profile is not available.' }, { status: 401 })

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const jwtSecret = process.env.JWT_SECRET

  if (!supabaseUrl || !serviceRoleKey || !jwtSecret) {
    return Response.json({ error: 'PIN access is not configured.' }, { status: 503 })
  }

  const { pin, profileId } = (await request.json()) as PinValidationRequest

  if (!profileId || !/^\d{4}$/.test(pin ?? '')) {
    return genericFailure()
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: credential, error } = await supabase
    .from('pin_credentials')
    .select('profile_id, hive_id, pin_hash, credential_version, failed_attempts, locked_until')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error || !credential) {
    return genericFailure()
  }

  const now = new Date()
  if (credential.locked_until && new Date(credential.locked_until) > now) {
    return genericFailure()
  }

  const matches = await compare(pin, credential.pin_hash)

  if (!matches) {
    const failedAttempts = credential.failed_attempts + 1
    const lockout = failedAttempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : null

    await supabase
      .from('pin_credentials')
      .update({
        failed_attempts: Math.min(failedAttempts, 5),
        locked_until: lockout,
        updated_at: now.toISOString(),
      })
      .eq('profile_id', credential.profile_id)

    return genericFailure()
  }

  await supabase
    .from('pin_credentials')
    .update({ failed_attempts: 0, locked_until: null, updated_at: now.toISOString() })
    .eq('profile_id', credential.profile_id)

  const expiresInSeconds = 24 * 60 * 60
  const token = sign(
    {
      credential_version: credential.credential_version,
      hive_id: credential.hive_id,
      profile_id: credential.profile_id,
      role: 'child',
    },
    jwtSecret,
    { algorithm: 'HS256', audience: 'sibhive-child', expiresIn: expiresInSeconds, issuer: 'sibhive' },
  )

  return Response.json({
    expiresAt: now.getTime() + expiresInSeconds * 1000,
    hiveId: credential.hive_id,
    profileId: credential.profile_id,
    role: 'child',
    token,
  })
}

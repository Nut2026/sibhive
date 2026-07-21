import type { Session } from '@supabase/supabase-js'
import { getChildSession } from './child-session'
import { supabase } from './supabase'

export type ProfileAccess = {
  id: string
  consent_version: string | null
  consent_accepted_at: string | null
  role: 'parent' | 'teen'
}

export type AuthAccessState = 'loading' | 'signed-out' | 'needs-consent' | 'authorized'

export const getAuthAccessState = (
  session: Session | null,
  profile: ProfileAccess | null,
): AuthAccessState => {
  if (!session) {
    return 'signed-out'
  }

  if (profile?.role === 'teen') {
    return 'authorized'
  }

  if (!profile?.consent_version || !profile.consent_accepted_at) {
    return 'needs-consent'
  }

  return 'authorized'
}

export const getCurrentAuthAccess = async (): Promise<AuthAccessState> => {
  if (getChildSession()) {
    return 'authorized'
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return 'signed-out'
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, consent_version, consent_accepted_at, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return getAuthAccessState(session, profile)
}

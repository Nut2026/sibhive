import type { Session } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getAuthAccessState } from './auth-guard'

const session = { user: { id: 'parent-id' } } as Session

describe('getAuthAccessState', () => {
  it('requires sign-in when there is no session', () => {
    expect(getAuthAccessState(null, null)).toBe('signed-out')
  })

  it('sends signed-in users without consent to the consent flow', () => {
    expect(
      getAuthAccessState(session, {
        id: 'parent-id',
        consent_version: null,
        consent_accepted_at: null,
        role: 'parent',
      }),
    ).toBe('needs-consent')
  })

  it('authorizes a signed-in user with an accepted consent record', () => {
    expect(
      getAuthAccessState(session, {
        id: 'parent-id',
        consent_version: '2026-07-20',
        consent_accepted_at: '2026-07-20T00:00:00.000Z',
        role: 'parent',
      }),
    ).toBe('authorized')
  })

  it('authorizes an authenticated teen profile without requiring a separate consent action', () => {
    expect(
      getAuthAccessState(session, {
        id: 'teen-id',
        consent_version: null,
        consent_accepted_at: null,
        role: 'teen',
      }),
    ).toBe('authorized')
  })
})

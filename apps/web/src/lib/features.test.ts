import { describe, expect, it } from 'vitest'
import { getFeatureFlags } from './features'

describe('feature flags', () => {
  it('uses the confirmed defaults', () => {
    expect(getFeatureFlags({})).toMatchObject({
      AI_GENERATION: true,
      DAILY_PROMPTS: true,
      POLLEN_GARDEN: false,
      CHAT: false,
      NOTIFICATIONS: false,
      WEEKLY_EMAIL: false,
      HEALING_CHAMBER: false,
      AUDIO_RECORDING: false,
    })
  })

  it('allows an environment flag to enable Pollen Garden', () => {
    expect(getFeatureFlags({ VITE_FEATURE_POLLEN_GARDEN: 'true' }).POLLEN_GARDEN).toBe(true)
  })
})

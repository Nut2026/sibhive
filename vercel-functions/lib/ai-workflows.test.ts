import { describe, expect, it } from 'vitest'
import { fallbackActivity, fallbackPrompt, shouldAutoApprove } from './ai-workflows.js'

describe('AI workflow safety fallbacks', () => {
  it('uses a valid fallback activity when AI is unavailable', () => {
    expect(fallbackActivity.nectarReward).toBeGreaterThan(0)
    expect(fallbackActivity.durationMinutes).toBeGreaterThanOrEqual(5)
  })

  it('has a safe daily prompt fallback', () => expect(fallbackPrompt.questionText.length).toBeGreaterThan(10))

  it('only auto-approves confidence above 80 percent', () => {
    expect(shouldAutoApprove(80)).toBe(false)
    expect(shouldAutoApprove(80.01)).toBe(true)
  })
})

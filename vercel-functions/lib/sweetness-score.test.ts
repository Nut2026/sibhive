import { describe, expect, it } from 'vitest'
import { calculateSweetnessScore } from './sweetness-score.js'

describe('calculateSweetnessScore', () => {
  it('returns 100 when every weighted input is complete', () => expect(calculateSweetnessScore({ activityCompletion: 1, promptEngagement: 1, positiveInteractions: 1, conflictResolution: 1, nectar: 1 }).score).toBe(100))
  it('returns zero and identifies unavailable metrics when no inputs exist', () => expect(calculateSweetnessScore({}).score).toBe(0))
  it('caps out-of-range inputs and keeps unavailable inputs explicit', () => {
    const result = calculateSweetnessScore({ activityCompletion: 2, promptEngagement: -1, nectar: 0.5 })
    expect(result.score).toBe(37.5); expect(result.unavailable).toEqual(['positive_interactions', 'conflict_resolution'])
  })
})

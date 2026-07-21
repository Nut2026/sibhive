import { describe, expect, it } from 'vitest'
import { evaluateEmergencyOverride } from './privacy-override'

const request = {
  actorHiveId: 'hive-a',
  actorIsHiveParent: true,
  itemId: 'private-prompt-a',
  itemIsTeenPrivate: true,
  itemHiveId: 'hive-a',
  reason: 'Immediate safety concern',
}

describe('evaluateEmergencyOverride', () => {
  it('requires parent ownership', () => {
    expect(
      evaluateEmergencyOverride({ ...request, actorIsHiveParent: false }),
    ).toEqual({ allowed: false, reason: 'not-hive-parent' })
  })

  it('requires a non-empty emergency reason', () => {
    expect(evaluateEmergencyOverride({ ...request, reason: '   ' })).toEqual({
      allowed: false,
      reason: 'missing-reason',
    })
  })

  it('denies a cross-hive override attempt', () => {
    expect(evaluateEmergencyOverride({ ...request, itemHiveId: 'hive-b' })).toEqual({
      allowed: false,
      reason: 'cross-hive',
    })
  })

  it('reveals only the selected private item and records that exact item for audit', () => {
    expect(evaluateEmergencyOverride(request)).toEqual({
      allowed: true,
      audit: { itemId: 'private-prompt-a', reason: 'Immediate safety concern' },
      revealedItemId: 'private-prompt-a',
    })
  })
})

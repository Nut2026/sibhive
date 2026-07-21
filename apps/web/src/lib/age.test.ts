import { describe, expect, it } from 'vitest'
import { getAgeGroup } from './age'

describe('getAgeGroup', () => {
  it.each([
    [7, null],
    [8, 'child'],
    [12, 'child'],
    [13, 'teen'],
    [16, 'teen'],
    [17, null],
  ] as const)('classifies age %i as %s', (age, expectedGroup) => {
    expect(getAgeGroup(age)).toBe(expectedGroup)
  })
})

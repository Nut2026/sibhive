import { expect, it } from 'vitest'
import { generateAllSiblingPairs } from './onboarding'

it('creates six non-duplicate pairs for four children', () => {
  const pairs = generateAllSiblingPairs([{ name: 'A', birthDate: '2016-01-01' }, { name: 'B', birthDate: '2015-01-01' }, { name: 'C', birthDate: '2014-01-01' }, { name: 'D', birthDate: '2013-01-01' }])
  expect(pairs).toHaveLength(6); expect(pairs.every((pair) => pair.child1_index !== pair.child2_index)).toBe(true)
})

import { expect, it } from 'vitest'
import { toDashboardState } from './dashboard-view-model'
it('models empty and populated dashboard data', () => { expect(toDashboardState(null).kind).toBe('empty'); expect(toDashboardState({ score: 40 }).kind).toBe('populated') })

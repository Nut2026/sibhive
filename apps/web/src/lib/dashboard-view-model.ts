export type DashboardState<T> = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'empty'; message: string } | { kind: 'populated'; data: T }
export const toDashboardState = <T>(data: T | null, message = 'Nothing is ready yet.'): DashboardState<T> => data === null ? { kind: 'empty', message } : { kind: 'populated', data }

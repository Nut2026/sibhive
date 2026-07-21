export type ChildSession = {
  expiresAt: number
  hiveId: string
  profileId: string
  role: 'child'
  token: string
}

const storageKey = 'sibhive.child-session'

export const saveChildSession = (session: ChildSession) => {
  sessionStorage.setItem(storageKey, JSON.stringify(session))
}

export const getChildSession = (): ChildSession | null => {
  const serializedSession = sessionStorage.getItem(storageKey)

  if (!serializedSession) {
    return null
  }

  try {
    const session = JSON.parse(serializedSession) as ChildSession

    if (session.role !== 'child' || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(storageKey)
      return null
    }

    return session
  } catch {
    sessionStorage.removeItem(storageKey)
    return null
  }
}

export const clearChildSession = () => sessionStorage.removeItem(storageKey)

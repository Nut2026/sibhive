import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentAuthAccess, type AuthAccessState } from '../lib/auth-guard'

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthAccessState>('loading')
  const location = useLocation()

  useEffect(() => {
    let active = true

    getCurrentAuthAccess()
      .then((nextState) => {
        if (active) {
          setState(nextState)
        }
      })
      .catch(() => {
        if (active) {
          setState('signed-out')
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (state === 'loading') {
    return <main className="page-shell">Checking your hive access…</main>
  }

  if (state === 'signed-out') {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (state === 'needs-consent') {
    return <Navigate replace state={{ from: location.pathname }} to="/consent" />
  }

  return <>{children}</>
}

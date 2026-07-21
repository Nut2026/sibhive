import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const returnPath = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setMessage('Authentication is not configured for this environment yet.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsSubmitting(false)

    if (error) {
      setMessage('We could not sign you in. Check your email and password, then try again.')
      return
    }

    navigate(returnPath, { replace: true })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Welcome back</p>
      <h1>Log In</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email address
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p>
        New to Sibhive? <Link to="/signup">Create a parent account.</Link>
      </p>
    </main>
  )
}

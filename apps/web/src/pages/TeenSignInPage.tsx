import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const TeenSignInPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setMessage('Teen sign-in is not configured for this environment yet.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('We could not sign you in. Ask your parent for help if you need a password reset.')
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Teen access</p>
      <h1>Log In to your hive</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email address
          <input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label>
          Password
          <input
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" type="submit">
          Log In
        </button>
      </form>
      <p>
        <Link to="/teen/reset-password">Need a new password?</Link>
      </p>
    </main>
  )
}

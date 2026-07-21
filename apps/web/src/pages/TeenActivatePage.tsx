import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const TeenActivatePage = () => {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setMessage('Teen activation is not configured for this environment yet.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Teen access</p>
      <h1>Choose your password</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          New password
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" type="submit">
          Activate account
        </button>
      </form>
    </main>
  )
}

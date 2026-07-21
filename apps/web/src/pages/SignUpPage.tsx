import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const SignUpPage = () => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setMessage('Authentication is not configured for this environment yet.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    })

    setIsSubmitting(false)

    if (error) {
      setMessage(error.message)
      return
    }

    navigate('/verify-email', { state: { email } })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Create a parent account</p>
      <h1>Create your hive</h1>
      <p>Parents must verify their email before creating child profiles.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Your name
          <input
            autoComplete="name"
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <p className="legal-copy">
          By continuing, you agree to the <Link to="/terms">Terms of Service</Link> and
          acknowledge the <Link to="/privacy">Privacy Policy</Link>.
        </p>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}

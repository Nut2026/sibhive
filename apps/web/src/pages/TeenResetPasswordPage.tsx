import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const TeenResetPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSupabaseConfigured) {
      setMessage('Teen password reset is not configured for this environment yet.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/teen/activate`,
    })
    setMessage(error ? 'We could not start the reset. Ask your parent for help.' : 'Check your email for reset instructions.')
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Teen access</p>
      <h1>Reset your password</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email address
          <input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" type="submit">
          Send reset instructions
        </button>
      </form>
      <p>
        <Link to="/teen/sign-in">Return to teen Log In</Link>
      </p>
    </main>
  )
}

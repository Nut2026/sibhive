import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { saveChildSession, type ChildSession } from '../lib/child-session'

export const PinEntryPage = () => {
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileId = (location.state as { profileId?: string } | null)?.profileId

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!profileId) {
      navigate('/child', { replace: true })
      return
    }

    setIsSubmitting(true)
    setMessage('')
    const response = await fetch('/api/validate-pin', {
      body: JSON.stringify({ pin, profileId }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as ChildSession & { error?: string }
    setIsSubmitting(false)

    if (!response.ok) {
      setMessage(result.error ?? 'We could not open this hive. Ask your parent for help.')
      return
    }

    saveChildSession(result)
    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Child access</p>
      <h1>Enter your PIN</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Four-digit PIN
          <input
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
            pattern="[0-9]{4}"
            required
            type="password"
            value={pin}
          />
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" disabled={isSubmitting || pin.length !== 4} type="submit">
          {isSubmitting ? 'Opening hive…' : 'Open my hive'}
        </button>
      </form>
      <p>
        <Link to="/child">Choose a different bee</Link>
      </p>
    </main>
  )
}

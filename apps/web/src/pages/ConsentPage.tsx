import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const consentVersion = '2026-07-20'
const consentText =
  'I am the parent or legal guardian and consent to Sibhive collecting and using family data as described in the Privacy Policy.'

export const ConsentPage = () => {
  const [relationship, setRelationship] = useState('parent')
  const [hasAccepted, setHasAccepted] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!hasAccepted) {
      setMessage('You must accept the consent statement to continue.')
      return
    }

    if (!isSupabaseConfigured) {
      setMessage('Authentication is not configured for this environment yet.')
      return
    }

    setIsSubmitting(true)
    setMessage('')
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsSubmitting(false)
      navigate('/login', { replace: true })
      return
    }

    const acceptedAt = new Date().toISOString()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ consent_version: consentVersion, consent_accepted_at: acceptedAt })
      .eq('id', user.id)

    const { error: consentError } = profileError
      ? { error: profileError }
      : await supabase.from('consent_records').insert({
          parent_id: user.id,
          consent_version: consentVersion,
          consent_text: consentText,
          accepted_at: acceptedAt,
          privacy_policy_accepted_at: acceptedAt,
          relationship_to_child: relationship,
        })

    setIsSubmitting(false)

    if (consentError) {
      setMessage(consentError.message)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Parental consent</p>
      <h1>Help us keep the hive safe</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <p>{consentText}</p>
        <label>
          Your relationship to the child
          <select onChange={(event) => setRelationship(event.target.value)} value={relationship}>
            <option value="parent">Parent</option>
            <option value="legal_guardian">Legal guardian</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            checked={hasAccepted}
            onChange={(event) => setHasAccepted(event.target.checked)}
            type="checkbox"
          />
          I accept this consent statement and have reviewed the <Link to="/privacy">Privacy Policy</Link>.
        </label>
        {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving consent…' : 'Continue'}
        </button>
      </form>
    </main>
  )
}

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const ParentDashboardPage = () => {
  const [email, setEmail] = useState('')
  const [siblingProfileId, setSiblingProfileId] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTeen = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch('/api/create-teen', {
      body: JSON.stringify({ email, siblingProfileId }),
      headers: {
        authorization: `Bearer ${session?.access_token ?? ''}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    })
    const result = (await response.json()) as { error?: string }
    setIsSubmitting(false)

    if (!response.ok) {
      setMessage(result.error ?? 'We could not create the teen account.')
      return
    }

    setMessage('Teen invitation created. Ask them to check their email to activate their account.')
    setEmail('')
    setSiblingProfileId('')
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Parent dashboard</p>
      <h1>Your Hive Dashboard</h1>
      <div className="action-row"><Link className="button button-secondary" to="/activities">Browse activity library</Link><Link className="button button-secondary" to="/prompts/respond">Answer a daily prompt</Link></div>
      <section aria-labelledby="add-teen-heading">
        <h2 id="add-teen-heading">Add Teen</h2>
        <p>Create a teen’s email/password account and link it to their sibling profile.</p>
        <form className="form-stack" onSubmit={handleAddTeen}>
          <label>
            Teen email address
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Sibling profile ID
            <input
              onChange={(event) => setSiblingProfileId(event.target.value)}
              required
              value={siblingProfileId}
            />
          </label>
          {message ? <p aria-live="polite" className="form-message">{message}</p> : null}
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating invitation…' : 'Invite teen'}
          </button>
        </form>
      </section>
    </main>
  )
}

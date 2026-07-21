import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export const PromptResponsePage = () => {
  const [promptId, setPromptId] = useState(''); const [responseText, setResponseText] = useState(''); const [teenPrivate, setTeenPrivate] = useState(false); const [message, setMessage] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const { data: { session } } = await supabase.auth.getSession(); const response = await fetch('/api/submit-prompt-response', { method: 'POST', headers: { authorization: `Bearer ${session?.access_token ?? ''}`, 'content-type': 'application/json' }, body: JSON.stringify({ promptId, responseText, teenPrivate }) }); setMessage(response.ok ? 'Your response was saved.' : 'Your response could not be saved.') }
  return <main className="page-shell"><p className="eyebrow">Daily prompt</p><h1>Your reflection</h1><form className="form-stack" onSubmit={submit}><label>Prompt ID<input required value={promptId} onChange={(event) => setPromptId(event.target.value)} /></label><label>Your answer<textarea required value={responseText} onChange={(event) => setResponseText(event.target.value)} /></label><label className="checkbox-label"><input checked={teenPrivate} onChange={(event) => setTeenPrivate(event.target.checked)} type="checkbox" />Keep this response private from my parent (teens only)</label><button className="button button-primary" type="submit">Save response</button>{message ? <p aria-live="polite" className="form-message">{message}</p> : null}</form></main>
}

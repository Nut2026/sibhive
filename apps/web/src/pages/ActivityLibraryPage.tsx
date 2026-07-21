import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Template = { id: string; title: string; description: string; category: string; difficulty: number; duration_minutes: number }

export const ActivityLibraryPage = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [category, setCategory] = useState('')
  const [pairId, setPairId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { void supabase.from('activity_templates').select('id, title, description, category, difficulty, duration_minutes').order('title').then(({ data }) => setTemplates(data ?? [])) }, [])
  const schedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const templateId = new FormData(event.currentTarget).get('templateId')
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/schedule-library-activity', { method: 'POST', headers: { authorization: `Bearer ${session?.access_token ?? ''}`, 'content-type': 'application/json' }, body: JSON.stringify({ pairId, templateId, scheduledFor: new Date().toISOString() }) })
    setMessage(response.ok ? 'Activity scheduled for this sibling pair.' : 'We could not schedule that activity.')
  }
  const visible = templates.filter((template) => !category || template.category === category)
  return <main className="page-shell"><p className="eyebrow">Activity library</p><h1>Find something sweet to do together</h1><label>Filter by category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option><option value="honey_making">Honey making</option><option value="pollen_gathering">Pollen gathering</option><option value="pollination">Pollination</option><option value="hive_heart">Hive heart</option><option value="honeycomb_treasure">Honeycomb treasure</option></select></label><form className="form-stack" onSubmit={schedule}><label>Sibling pair ID<input required value={pairId} onChange={(event) => setPairId(event.target.value)} /></label><label>Activity<select name="templateId" required>{visible.map((template) => <option key={template.id} value={template.id}>{template.title} · {template.duration_minutes} minutes</option>)}</select></label><button className="button button-primary" type="submit">Schedule activity</button>{message ? <p aria-live="polite" className="form-message">{message}</p> : null}</form><ul>{visible.map((template) => <li key={template.id}><strong>{template.title}</strong><br />{template.description}</li>)}</ul></main>
}

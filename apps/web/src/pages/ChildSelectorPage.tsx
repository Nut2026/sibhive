import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export const ChildSelectorPage = () => {
  const [profileId, setProfileId] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/child/pin', { state: { profileId } })
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Child access</p>
      <h1>Choose your bee</h1>
      <p>A parent will select a child profile from the family hive here.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Child profile ID
          <input
            aria-describedby="child-profile-help"
            onChange={(event) => setProfileId(event.target.value)}
            required
            value={profileId}
          />
        </label>
        <p id="child-profile-help">This temporary field will become the parent-managed child selector.</p>
        <button className="button button-primary" type="submit">
          Continue
        </button>
      </form>
    </main>
  )
}

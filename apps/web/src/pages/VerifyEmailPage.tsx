import { Link, useLocation } from 'react-router-dom'

export const VerifyEmailPage = () => {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email

  return (
    <main className="page-shell">
      <p className="eyebrow">One more step</p>
      <h1>Verify your email</h1>
      <p>
        {email
          ? `We sent a verification link to ${email}.`
          : 'We sent a verification link to your email address.'}
      </p>
      <p>Open the link to continue to your parental-consent step.</p>
      <Link className="button button-secondary" to="/login">
        Return to Log In
      </Link>
    </main>
  )
}

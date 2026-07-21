import { Link } from 'react-router-dom'

export const PrivacyPolicyPage = () => (
  <main className="page-shell legal-page">
    <h1>Privacy Policy</h1>
    <p>
      Sibhive is a US-only family application. We collect only the information needed to provide
      family activities, prompts, rewards, and safety controls.
    </p>
    <h2>Children’s information</h2>
    <p>
      A verified parent or legal guardian must provide consent before a child profile is created.
      Sibhive has no public profiles or stranger interaction and does not sell children’s data.
    </p>
    <h2>Your choices</h2>
    <p>
      Parents can review applicable family data, request correction, withdraw consent, and request
      hive deletion. See the in-app account controls when they become available.
    </p>
    <p>
      <Link to="/signup">Return to sign up</Link>
    </p>
  </main>
)

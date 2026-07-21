import { Link } from 'react-router-dom'

export const TermsPage = () => (
  <main className="page-shell legal-page">
    <h1>Terms of Service</h1>
    <p>
      Sibhive provides family-only tools for shared activities and communication. A parent or legal
      guardian is responsible for creating and supervising each family hive.
    </p>
    <h2>Safe use</h2>
    <p>
      Do not use Sibhive for public sharing, stranger contact, or emergencies. Parents can manage
      family access and request deletion of their hive data.
    </p>
    <p>
      <Link to="/signup">Return to sign up</Link>
    </p>
  </main>
)

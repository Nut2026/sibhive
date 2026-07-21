import { Link, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { useFeature } from './lib/features'
import { ConsentPage } from './pages/ConsentPage'
import { ChildSelectorPage } from './pages/ChildSelectorPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { SignUpPage } from './pages/SignUpPage'
import { TermsPage } from './pages/TermsPage'
import { TeenActivatePage } from './pages/TeenActivatePage'
import { TeenResetPasswordPage } from './pages/TeenResetPasswordPage'
import { TeenSignInPage } from './pages/TeenSignInPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { PinEntryPage } from './pages/PinEntryPage'
import { ActivityLibraryPage } from './pages/ActivityLibraryPage'
import { CompletionPage } from './pages/CompletionPage'
import { PromptResponsePage } from './pages/PromptResponsePage'
import { OnboardingPage } from './pages/OnboardingPage'

const PlaceholderPage = ({ title }: { title: string }) => (
  <main className="page-shell">
    <h1>{title}</h1>
    <p>This Sibhive experience is being prepared.</p>
  </main>
)

const HomePage = () => (
  <main className="page-shell">
    <p className="eyebrow">A warmer way to grow together</p>
    <h1>Sibhive</h1>
    <p>Welcome to your family hive.</p>
    <div className="action-row">
      <Link className="button button-primary" to="/signup">
        Create your hive
      </Link>
      <Link className="button button-secondary" to="/login">
        Sign in
      </Link>
    </div>
  </main>
)

export const HiveNavigation = ({ pollenGardenEnabled, chatEnabled = false, healingEnabled = false }: { pollenGardenEnabled: boolean; chatEnabled?: boolean; healingEnabled?: boolean }) => (
  <nav aria-label="Main navigation">
    <Link to="/signup">Sign up</Link>
    <Link to="/login">Log in</Link>
    <Link to="/dashboard">Dashboard</Link>
    {pollenGardenEnabled ? <Link to="/hive/garden">Pollen Garden</Link> : null}
    {chatEnabled ? <Link to="/hive/chat">Family chat</Link> : null}
    {healingEnabled ? <Link to="/hive/healing">Healing Chamber</Link> : null}
  </nav>
)

export default function App() {
  const pollenGardenEnabled = useFeature('POLLEN_GARDEN')
  const chatEnabled = useFeature('CHAT')
  const healingEnabled = useFeature('HEALING_CHAMBER')

  return (
    <div className="app-background">
      <header className="site-header">
        <Link aria-label="Sibhive home" className="brand" to="/">
          Sibhive
        </Link>
        <HiveNavigation chatEnabled={chatEnabled} healingEnabled={healingEnabled} pollenGardenEnabled={pollenGardenEnabled} />
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/child" element={<ChildSelectorPage />} />
        <Route path="/child/pin" element={<PinEntryPage />} />
        <Route path="/teen/sign-in" element={<TeenSignInPage />} />
        <Route path="/teen/activate" element={<TeenActivatePage />} />
        <Route path="/teen/reset-password" element={<TeenResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/hive/*"
          element={
            <AuthGuard>
              <PlaceholderPage title="Your Hive" />
            </AuthGuard>
          }
        />
        <Route path="/activities" element={<AuthGuard><ActivityLibraryPage /></AuthGuard>} />
        <Route path="/prompts/respond" element={<AuthGuard><PromptResponsePage /></AuthGuard>} />
        <Route path="/activities/complete" element={<AuthGuard><CompletionPage /></AuthGuard>} />
        <Route
          path="/children/*"
          element={
            <AuthGuard>
              <PlaceholderPage title="Your Children" />
            </AuthGuard>
          }
        />
      </Routes>
    </div>
  )
}

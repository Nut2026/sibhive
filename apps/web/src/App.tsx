import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
import { getChildSession } from './lib/child-session'
import { supabase } from './lib/supabase'
import { BrandLogo } from './components/BrandLogo'
import { ThemeToggle } from './components/ThemeToggle'

const PlaceholderPage = ({ title }: { title: string }) => (
  <main className="page-shell">
    <h1>{title}</h1>
    <p>This Sibhive experience is being prepared.</p>
  </main>
)

const HomePage = ({ authenticated }: { authenticated: boolean }) => authenticated ? <Navigate replace to="/dashboard" /> : <main className="landing-page"><section className="hero"><img alt="Sibhive bee mascot" className="hero-logo" src="/sibhive_logo.png" /><div><p className="eyebrow">A warmer way to grow together</p><h1>Welcome to Sibhive</h1><p className="hero-copy">A nurturing digital hive where siblings grow together through shared moments, kind choices, and gentle support.</p><div className="action-row"><Link className="button button-primary" to="/signup">Get Started</Link><Link className="button button-secondary" to="/login">Log In</Link></div></div></section><section className="value-grid" aria-label="How Sibhive helps"><article><h2>Sibling connection</h2><p>Build a shared history of positive experiences, one sweet moment at a time.</p></article><article><h2>AI activities</h2><p>Discover safe, personalized activities and prompts designed for your family.</p></article><article><h2>Your family hive</h2><p>Keep every conversation, reward, and memory inside a private family space.</p></article></section><footer><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms</Link><a href="mailto:hello@sibhive.com">Contact</a></footer></main>

export const HiveNavigation = ({ authenticated = false, pollenGardenEnabled, chatEnabled = false, healingEnabled = false }: { authenticated?: boolean; pollenGardenEnabled: boolean; chatEnabled?: boolean; healingEnabled?: boolean }) => (
  <nav aria-label="Main navigation">
    {!authenticated ? <><Link className="nav-link" to="/login">Log In</Link><Link className="nav-link" to="/signup">Sign Up</Link></> : <Link className="nav-link" to="/dashboard">Dashboard</Link>}
    {pollenGardenEnabled ? <Link to="/hive/garden">Pollen Garden</Link> : null}
    {chatEnabled ? <Link to="/hive/chat">Family chat</Link> : null}
    {healingEnabled ? <Link to="/hive/healing">Healing Chamber</Link> : null}
  </nav>
)

export default function App() {
  const pollenGardenEnabled = useFeature('POLLEN_GARDEN')
  const chatEnabled = useFeature('CHAT')
  const healingEnabled = useFeature('HEALING_CHAMBER')
  const [authenticated, setAuthenticated] = useState(Boolean(getChildSession()))
  useEffect(() => { let active = true; void supabase.auth.getSession().then(({ data }) => { if (active) setAuthenticated(Boolean(data.session) || Boolean(getChildSession())) }); const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session) || Boolean(getChildSession()))); return () => { active = false; subscription.subscription.unsubscribe() } }, [])

  return (
    <div className="app-background">
      <header className="site-header">
        <BrandLogo />
        <div className="header-actions"><HiveNavigation authenticated={authenticated} chatEnabled={chatEnabled} healingEnabled={healingEnabled} pollenGardenEnabled={pollenGardenEnabled} /><ThemeToggle /></div>
      </header>
      <Routes>
        <Route path="/" element={<HomePage authenticated={authenticated} />} />
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

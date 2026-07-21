# Tech Stack: Sibhive

## Complete Technology Documentation

---

## 1. Overview

Sibhive is a full-stack web application built with modern, scalable technologies. The stack prioritizes rapid development, real-time capabilities, AI integration, and a warm, engaging user experience.

**Architecture Pattern:** Serverless-first with real-time subscriptions

**Deployment Strategy:** Continuous deployment via Vercel with staging/production environments

**Key Requirements:**
- Real-time data synchronization
- AI-powered content generation (GPT-5.6)
- Voice recording and playback
- Image upload and analysis
- Secure authentication with parental controls
- COPPA compliance
- Mobile-responsive design

---

## 2. Frontend Stack

### 2.1 Core Framework

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 19.x | UI Framework | Component-based architecture, huge ecosystem, excellent performance |
| **TypeScript** | 5.x | Language | Type safety, better developer experience, self-documenting code |
| **Vite** | 6.x | Build Tool | Fast development server, instant HMR, optimized production builds |

### 2.2 Styling & Design

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Tailwind CSS** | 4.x | Utility-first CSS | Rapid UI development, consistent design system, minimal CSS bundle |
| **Framer Motion** | 11.x | Animations | Smooth, declarative animations for bee/hive effects |
| **@headlessui/react** | 2.x | UI Components | Accessible, unstyled components for modals, menus, tabs |
| **Heroicons** | 2.x | Icons | Clean, customizable icon set matching the hive aesthetic |
| **React Hook Form** | 7.x | Form Management | Performant form handling with validation |
| **Zod** | 3.x | Schema Validation | Type-safe form and API validation |

### 2.3 State Management

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Zustand** | 5.x | Global State | Simple, lightweight, scalable, minimal boilerplate |
| **TanStack Query** | 5.x | Server State | Caching, background updates, optimistic updates |
| **Supabase Realtime** | 2.x | Real-time Subscriptions | Live updates for nectar, activities, chat |

### 2.4 Routing

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React Router DOM** | 7.x | Client-side Routing | Nested routes, route protection, excellent DX |

### 2.5 Audio Recording & Playback

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **MediaRecorder API** | Native | Audio Recording | Native browser API, no additional dependency |
| **WaveSurfer.js** | 7.x | Audio Visualization | Beautiful waveform display for conversation playback |
| **Howler.js** | 2.x | Audio Playback | Cross-browser audio handling, volume control, speed control |

---

## 3. Backend Stack

### 3.1 Core Framework

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Node.js** | 22.x | Runtime | JavaScript full-stack consistency, excellent performance |
| **Express.js** | 5.x | API Framework | Minimal, flexible, extensive middleware ecosystem |
| **TypeScript** | 5.x | Language | Type safety, better maintainability |

### 3.2 Database & Storage

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Supabase** | Latest | Backend-as-a-Service | PostgreSQL database, real-time subscriptions, built-in auth, file storage |
| **PostgreSQL** | 16.x | Relational Database | ACID compliance, JSON support, robust querying |
| **Supabase Storage** | Latest | File Storage | Secure file uploads for photos, audio, videos |

### 3.3 Authentication

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **Supabase Auth** | Latest | Authentication | Email/password, OAuth, JWT, COPPA compliance features |
| **Supabase Row Level Security** | Latest | Authorization | Fine-grained access control per table |

---

## 4. AI & Machine Learning

### 4.1 OpenAI Integration

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **GPT-5.6 Sol** | Complex reasoning, activity generation, perspective stories | Advanced emotional intelligence, nuanced understanding |
| **GPT-5.6 Terra** | Daily prompts, memory enrichment | Balanced speed and quality for lighter tasks |
| **GPT-5.6 Luna** | Simple analysis, score calculation | Fast, cost-effective for routine analysis |
| **OpenAI Realtime API** | Voice-to-text, text-to-voice | Accessibility for younger children, voice input |
| **OpenAI Vision API** | Image analysis | Activity completion verification, drawing analysis |

### 4.2 Prompt Templates

**Folder Structure:**
```
src/lib/ai/prompts/
├── activity-generation/
│   ├── collaborative.md
│   ├── story-weaving.md
│   ├── teaching.md
│   ├── emotional.md
│   └── memory.md
├── perspective-stories/
│   ├── resource-conflict.md
│   ├── accusation.md
│   ├── hurt-feelings.md
│   └── rivalry.md
├── daily-prompts/
│   ├── fun.md
│   ├── deep.md
│   ├── gratitude.md
│   ├── sibling-specific.md
│   └── future.md
├── insights/
│   └── parent-insights.md
└── memory-bloomers/
    └── questions.md
```

---

## 5. DevOps & Deployment

### 5.1 Hosting & CI/CD

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Vercel** | Frontend Hosting | Automatic deployments, preview deployments, serverless functions |
| **Supabase** | Backend Hosting | Managed PostgreSQL, auto-scaling, built-in CDN |
| **GitHub** | Version Control | Code hosting, collaboration, issue tracking |

### 5.2 Monitoring & Logging

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Sentry** | Error Tracking | Real-time error monitoring, performance insights |
| **Supabase Logs** | Database Logging | Built-in query logging, audit trails |
| **Vercel Analytics** | Performance Monitoring | Web vitals, user engagement metrics |

### 5.3 Environment Variables

**Required Environment Variables:**
```
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...

# Email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@sibhive.com

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...

# Vercel (Auto-injected)
VERCEL_URL=...
VERCEL_ENV=production|preview|development

# Feature Flags
ENABLE_HEALING_CHAMBER=true
ENABLE_VOICE_RECORDING=true
```

---

## 6. Testing Strategy

### 6.1 Testing Tools

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Vitest** | Unit Testing | Fast, Vite-native testing |
| **React Testing Library** | Component Testing | User-centric testing approach |
| **Playwright** | E2E Testing | Cross-browser testing, visual regression |
| **MSW** | API Mocking | Mock API responses during testing |

### 6.2 Test Coverage Targets

| Layer | Coverage Target |
|-------|-----------------|
| Unit Tests | >80% |
| Component Tests | >70% |
| Integration Tests | >60% |
| E2E Tests | Critical paths only |

---

## 7. Project Structure

```
sibhive/
├── apps/
│   ├── web/                          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/          # Reusable components
│   │   │   │   ├── child/           # Child interface components
│   │   │   │   ├── teen/            # Teen interface components
│   │   │   │   └── parent/          # Parent dashboard components
│   │   │   ├── pages/               # Route pages
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── lib/                 # Utilities and helpers
│   │   │   │   ├── ai/              # AI service integration
│   │   │   │   ├── supabase/        # Supabase client
│   │   │   │   └── utils/           # Helper functions
│   │   │   ├── store/               # Zustand stores
│   │   │   ├── types/               # TypeScript types
│   │   │   └── styles/              # Global styles
│   │   ├── public/                  # Static assets
│   │   └── package.json
│   │
│   └── api/                          # Express backend (if needed)
│       ├── src/
│       │   ├── routes/              # API routes
│       │   ├── controllers/         # Request handlers
│       │   ├── services/            # Business logic
│       │   ├── middleware/          # Express middleware
│       │   ├── models/              # Data models
│       │   └── lib/                 # Utilities
│       └── package.json
│
├── packages/
│   ├── shared-types/                # Shared TypeScript types
│   └── ai-prompts/                  # Shared AI prompt templates
│
├── supabase/
│   ├── migrations/                  # Database migrations
│   ├── seeds/                       # Seed data
│   └── functions/                   # Supabase Edge Functions
│
├── memory-bank/                     # Project documentation
│   ├── product-blueprint.md
│   ├── tech-stack.md
│   ├── implementation-plan.md
│   ├── progress.md
│   └── architecture.md
│
├── .env.example
├── docker-compose.yml               # Local development
├── package.json
├── turbo.json                       # Turborepo configuration
└── README.md
```

---

## 8. Dependencies

### 8.1 Frontend Dependencies

**Production:**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/realtime-js": "^2.9.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "framer-motion": "^11.0.0",
    "@headlessui/react": "^2.0.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.23.0",
    "wavesurfer.js": "^7.0.0",
    "howler": "^2.2.0",
    "react-dropzone": "^14.0.0",
    "date-fns": "^3.0.0"
  }
}
```

**Development:**
```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.3.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.45.0",
    "msw": "^2.0.0"
  }
}
```

### 8.2 Backend Dependencies

**Production:**
```json
{
  "dependencies": {
    "express": "^5.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "cors": "^2.8.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "dotenv": "^16.0.0",
    "openai": "^4.50.0",
    "zod": "^3.23.0",
    "winston": "^3.13.0"
  }
}
```

**Development:**
```json
{
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/express": "^5.0.0",
    "@types/cors": "^2.8.0",
    "ts-node": "^10.0.0",
    "nodemon": "^3.0.0"
  }
}
```

---

## 9. Performance & Scalability

### 9.1 Performance Targets

| Metric | Target |
|--------|--------|
| **Largest Contentful Paint (LCP)** | <2.5s |
| **First Input Delay (FID)** | <100ms |
| **Cumulative Layout Shift (CLS)** | <0.1 |
| **Time to Interactive (TTI)** | <3.5s |
| **API Response Time (p95)** | <500ms |
| **Database Query Time** | <100ms |

### 9.2 Optimization Strategies

**Frontend:**
- Code splitting (React.lazy)
- Image optimization (WebP, lazy loading)
- Static asset caching (CDN)
- Route-based chunking
- Tree shaking

**Backend:**
- Database connection pooling
- Query optimization (indexes, caching)
- Rate limiting (prevent abuse)
- Edge caching (Vercel Edge)
- Serverless function optimization

### 9.3 Scaling Considerations

| Aspect | Strategy |
|--------|----------|
| **Database** | Supabase auto-scaling, read replicas if needed |
| **AI Requests** | Rate limiting, queuing, caching frequent requests |
| **File Storage** | Supabase CDN, automatic optimization |
| **Concurrent Users** | Vercel auto-scaling, serverless functions |

---

## 10. Security

### 10.1 Security Layers

| Layer | Strategy |
|-------|----------|
| **Network** | TLS 1.3, HTTPS only, CORS configuration |
| **Application** | JWT authentication, Row Level Security (RLS) |
| **Database** | Supabase RLS, encrypted at rest |
| **AI** | Content filtering, prompt injection prevention |
| **User Data** | AES-256 encryption for sensitive data |

### 10.2 COPPA Compliance Features

| Feature | Implementation |
|---------|----------------|
| Parental Consent | Verifiable consent flow with email verification |
| Data Collection | Minimal collection, clear disclosure |
| Data Sharing | No third-party sharing, explicit consent required |
| Data Deletion | Right to erasure within 30 days |
| Child Access | No public profiles, no stranger interaction |

### 10.3 Security Headers

```typescript
// helmet configuration
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://api.openai.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})
```

---

## 11. Development Workflow

### 11.1 Local Setup

```bash
# Clone repository
git clone https://github.com/your-org/sibhive.git
cd sibhive

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up Supabase
npx supabase start

# Run development server
npm run dev

# Run tests
npm run test

# Run AI prompt generation test
npm run test:ai
```

### 11.2 Commit Convention

```
<type>(<scope>): <subject>

<type>:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactoring
- perf: Performance improvement
- test: Test addition/update
- chore: Maintenance

<scope>:
- frontend
- backend
- ai
- db
- auth

Example:
feat(ai): add daily prompt generation with GPT-5.6
fix(frontend): fix nectar counter animation glitch
```

### 11.3 Git Workflow

1. Create feature branch from `main`
2. Implement feature with tests
3. Open Pull Request
4. Code review by at least one team member
5. Merge to `main` (squash commits)
6. Deploy to staging (Vercel preview)
7. Deploy to production after approval

---

## 12. Monitoring & Analytics

### 12.1 Key Metrics to Track

| Metric Category | Specific Metrics |
|-----------------|------------------|
| **Performance** | LCP, FID, CLS, TTI, API response times |
| **Engagement** | DAU, MAU, session duration, retention rate |
| **Features** | Activity completion rate, prompt response rate, nectar earned |
| **AI** | Prompt generation time, token usage, cost |
| **Errors** | Error rates, crash reports, API failures |

### 12.2 Monitoring Tools

| Tool | Purpose |
|------|---------|
| **Vercel Analytics** | Frontend performance, web vitals |
| **Sentry** | Error tracking, performance monitoring |
| **Supabase Logs** | Database performance, query analysis |
| **OpenAI Dashboard** | API usage, token consumption, cost |

---

## 13. Cost Estimates (MVP)

| Service | Monthly Estimate | Notes |
|---------|------------------|-------|
| **Vercel Hosting** | $0 | Hobby plan sufficient for MVP |
| **Supabase** | $25 | Pro plan for production |
| **OpenAI API** | $50-100 | GPT-5.6 (Terra) for MVP |
| **SendGrid** | $15 | 10,000 emails/month |
| **Sentry** | $0 | Developer plan |
| **Total** | **$90-140/month** | Scales with users |

---

## 14. Quick Start Commands

```bash
# Initialize Supabase
npx supabase login
npx supabase init
npx supabase db push

# Run development
npm run dev:frontend
npm run dev:backend
npm run dev:supabase

# Build for production
npm run build

# Run AI prompt tests
npm run test:ai -- --prompt=activity-generation

# Deploy to Vercel
vercel --prod
```

---

**End of Tech Stack Documentation**

Read all the documents in /memory-bank, is implementation-plan.md clear? What are your questions to make it 100% clear for you? Ask a list of questions to clarify everything ambiguous. I will send you my answers, after which please update the IMPLEMENTATION_PLAN.md accordingly.
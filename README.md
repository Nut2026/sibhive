# Sibhive: GitHub README

---

# 🐝 Sibhive

### *Your sibling is your longest friend. Let's make that friendship sweeter.*

---

## Overview

Sibhive is an AI-powered web application that transforms sibling relationships—turning rivalry into collaboration, distance into connection. Built for the OpenAI Build Week, it uses GPT-5.6 Terra to generate personalized activities and conversation prompts that bring siblings closer together.

**Live Demo:** [sibhive.vercel.app](https://sibhive.vercel.app) *(coming soon)*

---

## The Problem

Sibling relationships are the longest relationships most people will ever have—longer than parents, longer than spouses. Yet we have no tools to nurture them.

In a world where siblings drift into parallel digital universes, the person who shares your childhood becomes a stranger with the same last name.

**Sibhive changes that.**

---

## What It Does

| Feature | Description |
|---------|-------------|
| **🍯 AI Activities** | GPT-5.6 Terra generates weekly quests siblings complete together |
| **🐝 Daily Prompts** | Deep conversation starters that reveal siblings' inner worlds |
| **📷 Memory Garden** | A growing collection of photos, stories, and shared artifacts |
| **🌡️ Sweetness Score** | Real-time relationship health tracking (transparent formula) |
| **⭐ Nectar Rewards** | Gamified experience points—both siblings earn equal rewards |
| **🔐 Privacy First** | COPPA-compliant, tiered visibility, teen privacy controls |
| **👨‍👩‍👧‍👦 Family Support** | Up to 4 children with all sibling-pair combinations |

---

## The Hive Metaphor

Just like a beehive:

- **Bees work together** — siblings collaborate on activities
- **The atmosphere is warm and sweet** — fostering connection and positivity
- **Sometimes it stings** — conflict happens, but the hive provides structure to heal
- **The heart always outlasts the conflict** — the relationship matters more than any disagreement
- **Every bee has a role** — each sibling contributes uniquely
- **Nectar is collected** — experiences and positive interactions are gathered like precious nectar

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| **Serverless** | Vercel Functions |
| **AI/ML** | OpenAI GPT-5.6 Terra, OpenAI Vision API, OpenAI Realtime API |
| **Deployment** | Vercel + Supabase |
| **Testing** | Vitest, React Testing Library, Playwright, MSW |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Hosting)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React + TypeScript + Vite               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     Child Interface    Teen Interface          │  │  │
│  │  │     Parent Dashboard    Buz Mascot             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Vercel Serverless Functions             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Activity Gen  │  Prompt Gen  │  Completion   │  │  │
│  │  │  Onboarding    │  Dashboard   │  AI Verify    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
│                           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Supabase                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │  │
│  │  │   Auth   │  │PostgreSQL│  │     Storage        │ │  │
│  │  │Parent/Teen│  │   RLS    │  │  Photos/Audio     │ │  │
│  │  │   PIN    │  │ Real-time│  │                    │ │  │
│  │  └──────────┘  └──────────┘  └────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  OpenAI GPT-5.6 Terra                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Activity Gen  │  Prompt Gen  │  Insight Gen   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| **hives** | Family units (parent-owned) |
| **sibling_profiles** | Child/teen profiles (8-16 years) |
| **sibling_pairs** | All valid sibling combinations |
| **activity_templates** | Curated activity library (20+) |
| **activities** | Generated/scheduled activities |
| **activity_completions** | Submissions with AI confidence |
| **daily_prompts** | Conversation prompts (generated daily) |
| **prompt_responses** | Individual responses with privacy flags |
| **memory_artifacts** | Shared memories (photos, stories, audio) |
| **conflict_logs** | Parent-started conflict records |
| **conflict_resolutions** | Mediation outcomes |
| **chat_messages** | Family-only text communication |
| **hive_treasures** | Achievement badges |
| **child_treasures** | Earned badges per child |
| **nectar_transactions** | Immutable ledger of all Nectar earned |

### Row Level Security

All tables have RLS policies enforcing:

- Parents can only access their hive
- Children can only access their own profiles
- Siblings can only access shared content
- Teens can hide specific responses from parents
- Emergency privacy overrides require reason + audit

---

## Privacy & Compliance

| Feature | Implementation |
|---------|----------------|
| **Parental Consent** | Verified email + explicit consent + child DOB |
| **COPPA Compliance** | Children under 13 use PIN (no email) |
| **Teen Privacy** | Can hide individual prompt responses and artifacts |
| **Parent Visibility** | Tiered: activity/Nectar full, conversations metadata only |
| **Data Deletion** | Automated "Delete My Hive" workflow |
| **Audit Trails** | Consent changes, overrides, approvals, awards |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |

---

## Sweetness Score Formula

```
Sweetness Score = (ActivityCompletionRate × 35%) +
                  (PromptEngagementRate × 25%) +
                  (PositiveInteractions × 20%) +
                  (ConflictResolutionRate × 15%) +
                  (NectarEarnedScaled × 5%)

Where:
- ActivityCompletionRate: % of activities completed (0-100)
- PromptEngagementRate: % of daily prompts responded to (0-100)
- PositiveInteractions: AI-analyzed positive sentiment (0-100)
- ConflictResolutionRate: % of conflicts resolved successfully (0-100)
- NectarEarnedScaled: Nectar earned / 20 (capped at 100)
```

**Sweetness Levels:**
- 🍯 Honey Drop: 0-20
- 🧩 Honeycomb: 21-40
- 🫙 Honey Pot: 41-60
- 🌾 Honey Harvest: 61-80
- 👑 Golden Hive: 81-100

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm or pnpm
- Supabase CLI
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sibhive.git
   cd sibhive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and OpenAI credentials.

4. **Start Supabase locally**
   ```bash
   supabase start
   supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Seed the demo data**
   ```bash
   supabase db seed
   ```

7. **Open the app**
   Navigate to `http://localhost:5173`

---

## Testing

```bash
# Unit tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# End-to-end tests
npm run test:e2e

# All checks
npm run check
```

---

## Project Structure

```
sibhive/
├── apps/
│   └── web/                          # React frontend
│       ├── src/
│       │   ├── components/           # UI components
│       │   │   ├── common/           # Reusable components
│       │   │   ├── child/            # Child interface
│       │   │   ├── teen/             # Teen interface
│       │   │   └── parent/           # Parent dashboard
│       │   ├── pages/                # Route pages
│       │   ├── hooks/                # Custom React hooks
│       │   ├── lib/                  # Utilities
│       │   │   ├── ai/               # OpenAI integration
│       │   │   ├── supabase/         # Supabase client
│       │   │   └── features.ts       # Feature flags
│       │   ├── store/                # Zustand state
│       │   └── types/                # TypeScript types
│       └── package.json
│
├── supabase/
│   ├── migrations/                   # Database schema
│   ├── seeds/                        # Demo data
│   └── functions/                    # Edge functions
│
├── vercel-functions/                 # Serverless functions
│   ├── api/
│   │   ├── onboarding.ts
│   │   ├── dashboard.ts
│   │   └── validate-pin.ts
│   └── lib/
│       └── auth-helpers.ts
│
├── packages/
│   └── shared-types/                 # Shared TypeScript types
│
├── memory-bank/                      # Project documentation
│   ├── product-blueprint.md
│   ├── tech-stack.md
│   ├── implementation-plan.md
│   ├── progress.md
│   └── architecture.md
│
├── .env.example
├── package.json
├── turbo.json
└── README.md
```

---

## How Codex and GPT-5.6 Were Used

### Codex as AI Pair Programmer

Codex served as the primary development tool, generating the entire codebase through spec-driven development:

- **Implementation Plan:** I provided a detailed 77-step implementation plan to Codex
- **Iterative Execution:** Each step was executed, tested, and committed before proceeding
- **Context Management:** Memory bank files (`product-blueprint.md`, `tech-stack.md`, `architecture.md`) provided continuous context
- **Error Resolution:** Codex debugged TypeScript errors, database migration issues, and RLS policy bugs

### GPT-5.6 for Core Features

| Feature | GPT-5.6 Role | Model |
|---------|--------------|-------|
| **Activity Generation** | Creates personalized weekly quests based on ages, interests, history | Terra |
| **Daily Prompts** | Generates age-appropriate conversation starters across 5 categories | Terra |
| **Activity Verification** | Analyzes completion submissions (text, photos) for confidence scoring | Vision API + Terra |
| **Sentiment Analysis** | Analyzes conversation tone for positive interactions metric | Terra |
| **Perspective Stories** | Generates empathetic conflict mediation narratives (future) | Terra/Sol |
| **Memory Bloomers** | Creates questions to enrich memory artifacts | Terra |

### Prompt Engineering Approach

All AI prompts include:
- Age-appropriateness guardrails
- Hive metaphor consistency
- Family-only context (no public data leakage)
- Structured output requirements (JSON schemas)
- Fallback behavior (curated templates if AI fails)

**Example Activity Generation Prompt:**
```
You are a warm, nurturing AI that creates activities for siblings. 
The activities should be fun, collaborative, and developmentally appropriate. 
Use the hive metaphor naturally. 
Generate 3-5 activity options with title, description, instructions, materials, 
estimated duration, and nectar reward.
```

---

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `AI_GENERATION` | true | Enable GPT-5.6 activity generation |
| `DAILY_PROMPTS` | true | Enable daily conversation prompts |
| `POLLEN_GARDEN` | false | P1 feature (memory artifacts) |
| `CHAT` | false | P1 feature (text chat) |
| `NOTIFICATIONS` | false | P1 feature (push + in-app) |
| `WEEKLY_EMAIL` | false | P2 stretch (parent summary) |
| `HEALING_CHAMBER` | false | P2 stretch (conflict mediation) |
| `AUDIO_RECORDING` | false | P2 stretch (voice input) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **OpenAI Build Week** - For the inspiration, GPT-5.6 access, and hackathon platform
- **Supabase** - For the incredible real-time backend
- **Vercel** - For seamless deployment
- **My family** - For reminding me why sibling connections matter

---

## Contact

**Sibhive Team** - [team@sibhive.com](mailto:team@sibhive.com)

Project Link: [https://github.com/your-org/sibhive](https://github.com/your-org/sibhive)

---

## Built With

```
react
typescript
tailwind-css
supabase
postgresql
vercel
openai
gpt-5-6
node-js
vite
real-time
serverless
gpt-5-6-terra
openai-vision
openai-realtime
coppa
education
gamification
```

---

**🐝 Sibhive: Your sibling is your longest friend. Let's make that friendship sweeter.**
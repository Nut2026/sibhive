# Sibhive Architecture

## Security, Export, and Deletion

Server-side credentials, OpenAI keys, service keys, and cron secrets are never exposed to the browser. Vercel applies anti-framing, nosniff, restrictive referrer, and permissions headers; server handlers use generic errors and rate limits for sensitive requests. Parent-only export produces a no-store JSON download for one owned hive. Delete My Hive requires a request plus email-token confirmation, records a scheduled 30-day deletion, and a protected daily cron permanently removes due hives. Sensitive action audits record consent changes, PIN resets, privacy overrides, approvals, awards, and deletion events; audit rows remain parent-readable only within their hive.

## Feature-flagged P1/P2 Services

Pollen Garden, chat, notifications, weekly email, and Healing Chamber are disabled by default in both browser and server configuration. A disabled server endpoint returns no feature data. When enabled, Pollen Garden respects teen-private artifacts; chat accepts only text between siblings in one hive and parents receive metadata only; push subscriptions are bound to the authenticated profile; weekly summaries address only hive-owning parents; and Healing Chamber accepts parent-submitted conflicts only. Scheduled notification jobs run at 08:00 and 16:00, and the weekly summary job runs Monday at 09:00; deployment supplies the time zone and `CRON_SECRET`.

## Sweetness Score and Onboarding

The transparent Sweetness Score uses a rolling 30-day window. It combines activity completion (35%), prompt engagement (25%), approved positive interactions (20%), resolved conflicts (15%), and Nectar earned against a 200-Nectar-per-child cap (5%). Every input is normalized to 0–1, each contribution is capped, and the total is bounded from 0–100. Each score snapshot stores the version, timestamp, input values, and triggering event.

Chat and conflict features are disabled at MVP launch. Their inputs are explicitly recorded as unavailable in the client calculation and contribute zero rather than silently altering the remaining weights. The database calculation uses zero when no eligible event exists. The score recalculates once daily and after a completion, prompt response, approved interaction, conflict resolution, or Nectar event.

Onboarding is a single authenticated parent transaction: validate a 1–4 child family, create all non-self/non-duplicate pairs, persist family-only privacy and notification preferences, retain the baseline assessment, award 50 welcome Nectar to every child, create one fallback first activity and daily prompt for the first pair, calculate the baseline score, then mark onboarding complete. The dashboard redirect occurs only after that transaction succeeds. Incomplete hives continue at `/onboarding`.

## AI Activity, Prompt, and Completion Specification

All OpenAI requests run only in Vercel serverless functions. The browser never receives an API key or chooses the model. `OPENAI_TERRA_MODEL` selects the activity and prompt model; `OPENAI_VISION_MODEL` selects the image-verification model.

### Structured generation and fallback

- Activity output is strict structured data: title, description, instructions, category, difficulty, duration, and Nectar reward. Daily prompts have a category and question text.
- Generation sends only pair ages and interests. It never sends names, email addresses, raw child responses, or other identifying data.
- Instructions prohibit unsafe challenges, mature content, medical advice, requests for secrets or identifying information, and exclusionary sibling content.
- Requests set `store: false`. If credentials are absent, output is invalid, the model fails, or safety validation fails, the server saves a curated safe fallback marked `is_fallback = true`. Parents can regenerate it.

### Prompt privacy and completion review

- Under-13 responses remain visible to the owning parent. A teen may set an individual response private from the parent; the server and RLS enforce that choice.
- Completion proof is text, a private image URL, or a private audio URL. Image verification receives only the image and activity instructions and must not identify people or infer sensitive traits.
- Only confidence strictly greater than 80 auto-approves an image. Confidence of 80 or lower, invalid output, or an AI failure goes to parent review.
- A parent can approve or reject only a completion in their own hive. Reviews record the parent, timestamp, decision, and an optional reason.

### Immutable equal rewards

Approval calls one transactional database function. It awards the same positive Nectar amount to both pair members, updates their totals, and creates one immutable ledger row per member. A unique source index makes repeating approval idempotent, and browser roles cannot call the award function.

## Identity Map

Sibhive is a family-only application. A hive is owned by one verified parent, and every sibling profile belongs to exactly one hive. Supabase Auth manages email/password identities; the application database maps those identities to the family data and enforces access with Row Level Security (RLS).

### Identity relationships

- **Parent Supabase Auth user** — Authenticates with verified email/password and maps to one parent profile. The parent profile owns one or more hives and is responsible for consent, child setup, PIN resets, and teen account recovery.
- **Parent profile** — Stores application-specific parent metadata, consent state, and the Supabase Auth user reference. It is the authoritative actor for parent-only actions.
- **Hive** — The private family boundary. It belongs to one parent profile and contains sibling profiles, pairs, activities, rewards, and all family-only content.
- **Sibling profile** — Represents a child or teen in exactly one hive. It stores age-related profile data, preferences, Nectar totals, and an optional Supabase Auth user reference for teens.
- **Child PIN credential (ages 8–12)** — A parent-issued, four-digit credential tied to one sibling profile. A server-side workflow verifies a hashed PIN and grants a narrowly scoped child session on shared devices. Raw PINs are never stored or logged.
- **Teen Supabase Auth user (ages 13–16)** — Authenticates with email/password and maps to its sibling profile. The parent can initiate setup and reset the password, while teen privacy controls govern eligible prompt and artifact content.
- **Sibling pair** — Connects exactly two sibling profiles in the same hive. It scopes pair activities, pair-level Sweetness Scores, and shared relationship data.

### Access table

| Actor | Authentication | Can access | Cannot access |
| --- | --- | --- | --- |
| Parent | Verified Supabase Auth email/password session with active consent | All data in their own hive; setup, pair management, activity review, consent, deletion, and permitted emergency privacy overrides | Any other hive; public or stranger data |
| Child (8–12) | Parent-issued PIN and scoped child session | Own profile, assigned activities, own submissions, own Nectar, and explicitly shared sibling content | Parent controls, direct ledger updates, other hives, teen-private content, public/stranger features |
| Teen (13–16) | Supabase Auth email/password session linked to own sibling profile | Child access plus eligible privacy controls for their own prompts and artifacts | Other hives, direct ledger updates, other teen-private content, public/stranger features |
| Server-side workflow | Supabase service role held only in Vercel/Supabase server environment | Validated operation-specific data needed for PIN verification, AI workflows, rewards, and scheduled tasks | Client-side execution or broad unvalidated reads/writes |

## Parental Consent Requirements

Before a child profile can be created or used, the owning parent must complete and retain a verifiable consent record. The record must include:

- A verified parent email address associated with the Supabase Auth user.
- The exact consent text and version accepted by the parent.
- The acceptance timestamp and consenting parent identity.
- Each child’s date of birth for age verification.
- The parent’s stated relationship to each child.
- Confirmation that the parent reviewed the Privacy Policy before sign-up.
- A withdrawal mechanism that records the withdrawal timestamp and prevents new child data processing until consent is renewed or deletion is completed.

Consent is required before child PIN creation, teen account activation, child data collection, or any family-only sharing feature. The initial launch is US-only and follows the project’s COPPA requirements: no public profiles, no stranger interaction, and no third-party data sharing.

## Child PIN Security

Child access is intentionally limited to a shared-device PIN flow for ages 8–12. A child PIN is not an alternative parent credential and cannot grant parent or cross-hive access.

- Parent-issued four-digit PINs are hashed with bcrypt before storage. Raw PIN values are never stored, returned, or logged.
- A credential allows five consecutive failed attempts. The fifth failure locks that credential for 15 minutes; successful verification resets the failed-attempt count.
- A successful verification issues a server-signed child JWT with only the `child` role, the selected `profile_id`, the associated `hive_id`, a credential version, and a 24-hour expiration.
- The Vercel function verifies the child profile, lock status, bcrypt hash, and credential version before issuing a token. It returns generic failure messages so an attacker cannot identify valid profiles or PINs.
- Parent PIN reset increments the credential version and clears failed attempts/lockout, invalidating all earlier child JWTs.
- Child JWTs are accepted only by family-scoped server-side operations. Row Level Security and later sibling-profile/hive foreign keys prevent requests from accessing another hive.

## Visibility Matrix

Visibility is evaluated within one hive only. The matrix is the source for database RLS policies, dashboard queries, API response shaping, and feature UI. A parent never gains access to another hive, and no item is public.

| Data type | Parent visibility | Under-13 control | Teen control (13–16) | Sibling visibility |
| --- | --- | --- | --- | --- |
| Activity completion | Full status and submitted proof | Cannot hide | Cannot hide | Assigned pair only, according to activity sharing rules |
| Nectar and rewards | Full totals and transaction history | Cannot hide | Cannot hide | Own totals and eligible pair rewards only |
| Daily prompt responses | Full content | Cannot hide from parent | May mark each response private from parent | Only when the responder explicitly shares it |
| Memory artifacts | Full content | Cannot hide from parent | May mark each artifact private from parent | Only when the creator explicitly shares it |
| Mood check-ins | Trends only; no individual mood entries | Cannot hide the trend | Cannot hide the trend | Never visible unless a future explicit sharing feature permits it |
| Chat and audio conversations | Metadata only: duration, tags, frequency, moderation status | Cannot hide metadata | Cannot hide metadata | Participants only; no public or stranger access |
| Conflict logs and Healing Chamber records | Full visibility, including statements and resolution | Cannot hide | Cannot hide | Only involved siblings receive their permitted flow content |

## Emergency Privacy Override

Teen-private prompt responses and memory artifacts remain private by default. An emergency override is a narrow, auditable exception—not a permanent visibility setting or a way to browse all private teen data.

An override is permitted only when all of the following are true:

- The requester is an authenticated parent who owns the target item’s hive.
- The target is exactly one eligible teen-private prompt response or memory artifact in that hive.
- The parent supplies a non-empty emergency reason.
- The server-side workflow validates ownership before revealing the item; client input alone is never trusted.

When approved, the system reveals only the selected item to that parent. In the same transaction it must create an immutable audit record containing the parent actor, item type and ID, hive ID, reason, and timestamp, then create a teen notification explaining that the item was accessed under an emergency override. The teen cannot suppress this notification. The override must not change sibling sharing, unlock other private items, or grant access to another hive.

## Row Level Security Policy Matrix

All listed tables have RLS enabled. Direct browser access is restricted to the policies below; child PIN sessions and sensitive operations run through validated server-side functions. A dash means no direct client operation is allowed.

| Table group | Parent SELECT | Parent INSERT/UPDATE/DELETE | Teen SELECT | Teen INSERT/UPDATE/DELETE | Child direct access |
| --- | --- | --- | --- | --- | --- |
| `profiles`, `consent_records` | Own parent record and consent records | Own parent record; own consent record | Own linked profile | Own linked profile only where permitted | — |
| `hives`, `sibling_profiles`, `sibling_pairs` | Own hive and all members/pairs | Own hive only | Own linked sibling profile and pairs containing it | Own linked sibling profile only | — |
| `activity_templates` | All approved templates | Parent-managed templates | Approved templates | — | — |
| `activities`, `activity_completions` | All records in own hive | Manage/review own hive records | Assigned-pair activities and own completions | Submit own completion only | — |
| `nectar_transactions` | All transactions for own hive | —; server awards only | Own transactions only | — | — |
| `daily_prompts`, `prompt_responses` | Own hive prompts; non-private teen responses and all under-13 responses | Manage prompts; server-managed rewards | Assigned prompts and own responses | Create/update own response only | — |
| `memory_artifacts` | Own hive artifacts except teen-private items | Server-managed or own permitted records | Own artifacts and explicitly shared pair artifacts | Own artifacts only | — |
| `chat_messages` | —; dashboard server returns metadata only | — | Messages where teen is sender or recipient | Send as self to a hive sibling | — |
| `conflict_logs`, `conflict_resolutions` | Own hive records | Parent-created/managed own hive records | — | — | — |
| `hive_treasures`, `child_treasures` | Own hive treasures and awards | Manage own hive treasures | Hive treasures and own awards | — | — |
| `pin_credentials` | —; hashes are never client-readable | —; reset uses server workflow | — | — | — |

The server-side service role bypasses RLS only after `validateJWT` or `validateChildSession` resolves the caller’s role, profile, and hive. Dashboard functions shape results by role and never return private teen prompt/artifact content, raw chat content to parents, or any cross-hive data.

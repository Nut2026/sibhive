# Sibhive MVP Implementation Plan

## Confirmed delivery decisions

Sibhive will be a seven-day hackathon MVP, deployed to staging on Vercel and Supabase, with production-ready privacy and authorization foundations. It serves US families with up to four children (ages 8–16) and every valid sibling-pair combination. The P0 release demonstrates parent onboarding, child and teen access, personalized AI activities and prompts with curated fallbacks, Nectar, a transparent Hive Sweetness Score, and role-appropriate dashboards.

The architecture is React, TypeScript, Vite, Tailwind CSS, Supabase Auth/PostgreSQL/Storage/Realtime, and Vercel Serverless Functions. Do not create an Express service for the MVP. Parents use email/password. Children aged 8–12 use parent-issued four-digit PINs on shared devices; teens aged 13–16 use their own email/password accounts. All features are family-only; no public profiles, OAuth, or third-party data sharing are in scope.

The database will include every table specified in the blueprint in the initial migration. Feature flags will keep unbuilt feature UI and write paths disabled. P0 is mandatory. P1 is added only after P0 is demonstrable. Weekly email is treated as an MVP stretch goal because the decisions identify it as MVP but the priority table classifies it as P2.

## Priority and release boundary

### P0 — Must ship for the demo

- Parent authentication, verified consent, and family setup.
- Child PIN and teen account access.
- Up to four children and all sibling pairs.
- Curated activity templates plus GPT-5.6 Terra activity generation and regeneration.
- GPT-5.6 Terra daily-prompt generation.
- Activity completion submission, AI confidence handling, parent review, and equal pair rewards.
- Ledger-backed Nectar, transparent Sweetness Score, and parent/child/teen dashboards.
- Row Level Security, tiered parent visibility, teen privacy controls, seed demo family, tests, and staging deployment.

### P1 — Add only if P0 is complete and stable

- Pollen Garden, text chat, in-app/web-push notifications, and activity/prompt reminders.

### P2 — MVP stretch goals

- Weekly parent summary email, Healing Chamber, and audio recording.

### Deferred

- Native applications, advanced relationship analytics, advanced AI coaching, video/audio analysis, and production-scale load testing.

## Phase 0 — Seven-day execution setup

1. **Record the confirmed scope and priorities.** Add this P0/P1/P2 boundary, the US-only launch decision, and the seven-day constraint to the project README.
   - **Test:** Review the scope against the hackathon demo flow and confirm every P0 item has an owner and no P1/P2 item blocks it.

2. **Create the monorepo structure.** Establish the web app, shared types, Supabase migrations/seeds/functions, Vercel functions, and memory-bank directories; omit the Express API application.
   - **Test:** Install workspace dependencies and run the root validation command with no missing-workspace errors.

3. **Initialize the React application.** Configure React 19, TypeScript, Vite, and the application entry point.
   - **Test:** Start the development server and confirm the application shell loads without browser-console or TypeScript errors.

4. **Configure the design and routing foundation.** Add Tailwind, Playfair Display and Inter, the honey/cream/brown palette, responsive global styles, React Router, and accessible focus states.
   - **Test:** Verify the shell at desktop and mobile widths has no horizontal scrolling and all visible controls receive keyboard focus.

5. **Configure quality gates.** Add formatting, linting, type checking, Vitest, React Testing Library, Playwright, and MSW.
   - **Test:** Run each quality command successfully with a passing baseline test suite.

6. **Create safe environment templates.** Document local, staging, and production variables for Supabase, OpenAI, Vercel functions, email, web push, and feature flags; ignore secrets from version control.
   - **Test:** Start the app from template-derived local variables and verify a missing required secret produces a clear startup failure.

7. **Configure local and staging Supabase projects.** Initialize local Supabase and document separate staging and production project configuration.
   - **Test:** Connect the application to local Supabase and staging credentials separately, confirming no data is shared between environments.

8. **Create feature flags.** Define flags for AI generation, prompts, Pollen Garden, chat, notifications, weekly email, Healing Chamber, and audio recording, defaulting unbuilt features to off.
   - **Test:** Toggle each flag in a local environment and confirm disabled features expose neither UI entry points nor writable actions.

## Phase 1 — Identity, consent, and privacy model

9. **Define the identity map.** Document the relationship among Supabase Auth identities, parent profiles, child PIN identities, teen identities, hives, and sibling profiles.
   - **Test:** Review the map against parent email/password, child PIN, teen email/password, and cross-hive isolation scenarios.

10. **Define age classification.** Use a child birth date as the authoritative age source and derive 8–12 child versus 13–16 teen behavior without storing a conflicting static age.
   - **Test:** Unit-test the classifications at ages 8, 12, 13, and 16 and reject profiles outside the supported MVP range.

11. **Define verifiable parental consent.** Capture verified parent email, explicit consent text/version, acceptance time, child birth-date verification, relationship-to-child confirmation, privacy-policy acknowledgement, and withdrawal status.
   - **Test:** Review the record requirements against the stated COPPA rules and verify each child profile can be associated with an active consent record.

12. **Create parent profiles and consent records.** Add the database entities and audit fields that extend Supabase Auth for parent identity and consent management.
   - **Test:** Apply the migration to an empty database and verify consent records require a verified parent identity and valid version/timestamps.

13. **Configure parent Supabase Auth.** Enable email/password registration, email verification, session handling, sign-out, and password reset; do not enable OAuth.
   - **Test:** Register, verify, sign in, reset a password, and sign out using test accounts; confirm OAuth sign-in is unavailable.

14. **Build parent registration and legal screens.** Create accessible sign-up, verification, consent, privacy policy, and terms-of-service routes with clear blocking states.
   - **Test:** Component-test invalid credentials, unchecked consent, unavailable legal acknowledgement, and valid verified registration.

15. **Build the parent session guard.** Require a verified, consenting parent session before hive creation, parent dashboard access, or child-account management.
   - **Test:** Test signed-out, unverified, consent-withdrawn, and verified-parent navigation to protected routes.

16. **Design child PIN security.** Define PIN hashing, rate limits, lockout/recovery behavior, parent reset, session duration, and shared-device sign-out; never store or log a raw PIN.
   - **Test:** Review the threat model and verify tests cover valid PIN, invalid PIN, rate limit, lockout, parent reset, and sign-out.

17. **Create child PIN credentials.** Add a credential record linked to one child profile with hashed PIN, failed-attempt, lockout, reset, and audit fields.
   - **Test:** Verify only one active PIN credential exists per child and raw PIN values cannot be retrieved through database or API reads.

18. **Build child PIN access.** Create the child selector/PIN entry screen and a Vercel function that validates the PIN and issues a tightly scoped child session.
   - **Test:** Run an end-to-end test for valid child access and verify invalid/locked PINs never enter a child dashboard.

19. **Create teen Auth identities.** Link teen Supabase Auth users to their sibling profiles, including parent-initiated invite/setup and parent password-reset authority.
   - **Test:** Verify a parent can create/reset the linked teen account and a teen can sign in only to their own hive/profile.

20. **Build teen sign-in and account activation.** Provide teen email/password activation, sign-in, password reset, and a parent-mediated recovery path.
   - **Test:** Test activation, login, recovery, and a cross-hive login attempt with separate teen test accounts.

21. **Define tiered content visibility.** Record the parent, child, teen, and sibling visibility matrix: parents see activity/Nectar/conflict data and under-13 prompt/memory content; parents see only conversation metadata; teens may hide individual prompts and artifacts; mood data is trend-only for parents.
   - **Test:** Approve the matrix before RLS policies are implemented and confirm it covers every initial database table.

22. **Define emergency privacy override.** Specify an auditable parent emergency override for teen-private prompt responses/artifacts, including mandatory teen notification and the required reason field.
   - **Test:** Test that an override requires parent ownership and a reason, reveals only the selected item, and creates both audit and teen-notification records.

## Phase 2 — Initial database and data integrity

23. **Create the `hives` table.** Store hive name, owning parent, privacy and notification settings, current Sweetness Score, calculation version, timestamps, and deletion-request state.
   - **Test:** Insert a valid hive and verify owner, valid score range, and required timestamps are enforced.

24. **Create the `sibling_profiles` table.** Store hive membership, authenticated identity link where applicable, name, birth date, grade, interests, avatar, voice preference, and cached Nectar total.
   - **Test:** Verify profiles require an owning hive, accept valid supported ages, and reject cross-hive or invalid age data.

25. **Create the `sibling_pairs` table.** Store pair membership, relationship type, pair Sweetness Score, and combined Nectar; support up to four children and at most six unique pairs per hive.
   - **Test:** Create all six pairs for a four-child seed family, then verify self-pairs, duplicate pairs, and cross-hive pairs are rejected.

26. **Create activity templates.** Add a curated template entity with category, age range, title, instructions, materials, difficulty, duration, Nectar reward, and parent tip.
   - **Test:** Seed at least 20 valid templates across all five categories and verify each category and supported age range is represented.

27. **Create generated and selected activity records.** Add `activities` with template reference, AI generation metadata, generation fallback marker, pair assignment, parent approval, scheduling, expiry, and all presentation fields.
   - **Test:** Create one library-selected and one AI-generated activity, then verify both return the same required dashboard fields and preserve their origin.

28. **Create activity completion records.** Add submission type/data, AI confidence score, AI analysis, review status, parent decision, award status, and timestamps.
   - **Test:** Verify an activity completion belongs to an assigned child/activity and rejects invalid confidence, status, or cross-pair submission data.

29. **Create daily prompt and response records.** Add prompt category, scheduling, generation metadata, individual response content, earned Nectar, sibling sharing, parent sharing, and teen-private state.
   - **Test:** Insert under-13 and teen responses and verify the default sharing states match the visibility decision.

30. **Create memory, chat, conflict, reward, and ledger tables.** Add every remaining blueprint table: memory artifacts, chat messages, conflict logs/resolutions, treasures, child treasures, and Nectar transactions.
   - **Test:** Apply the complete initial migration to a clean database and verify each foreign key, enum/check constraint, and required relation with seed data.

31. **Correct the conflict-log actor relationship.** Model conflict submitter as a parent identity/profile rather than a sibling profile, while retaining the involved sibling pair.
   - **Test:** Verify only the hive’s parent can create a conflict log and the submitted actor cannot be a child profile.

32. **Add dashboard and retention indexes.** Index all hive, profile, pair, schedule, response, transaction, notification, and deletion-query paths; define safe deletion behavior for related data.
   - **Test:** Inspect representative dashboard query plans and confirm no orphaned records can be introduced.

33. **Create deterministic seed data.** Seed a demo hive with a verified parent, three siblings across child/teen age bands, all valid pairs, templates, AI/fallback examples, prompt responses, activities, completions, and Nectar history.
   - **Test:** Reset and reseed twice, confirming identical demo totals, score inputs, and visible dashboard fixtures.

## Phase 3 — Row Level Security and serverless workflows

34. **Write the RLS policy matrix.** Translate the tiered visibility decision into table-by-table select, insert, update, delete, and emergency-override permissions.
   - **Test:** Review the matrix against profiles, activities, prompts, memories, chat metadata, conflicts, rewards, and ledger data before enabling RLS.

35. **Enable RLS for hives, profiles, and pairs.** Restrict parents to their hive, children/teens to their own profile, and sibling data to valid shared pair contexts.
   - **Test:** Use distinct parent, child, teen, and cross-hive identities to verify unauthorized reads/writes are denied.

36. **Enable RLS for activities, completions, and Nectar.** Allow parents to manage activities/reviews; allow assigned siblings to read activities and submit only their own completion; disallow direct child balance or ledger changes.
   - **Test:** Verify a child cannot see another pair’s activity, submit for a sibling, approve a completion, or modify any ledger transaction.

37. **Enable RLS for prompts and artifacts.** Enforce parent visibility for under-13 records, teen-private visibility rules, explicit sibling sharing, and auditable parent emergency override.
   - **Test:** Verify a teen-private item is hidden from the parent until a valid override and a private item is never visible to an unrelated sibling.

38. **Enable RLS for deferred tables.** Apply restrictive parent-owned and family-only policies to chat, conflict, treasures, and child-treasure tables while their feature flags remain disabled.
   - **Test:** Verify deferred-table data cannot be read or created by a cross-hive identity.

39. **Create the parent onboarding serverless workflow.** Atomically create a hive, child profiles, PIN/teen-account setup data, and all valid sibling pairs after verified consent.
   - **Test:** Complete a three-child onboarding flow and force a validation failure mid-request; verify a failed request leaves no partial family configuration.

40. **Create authenticated serverless helpers.** Validate Supabase JWTs or child sessions, resolve role/hive context, validate input with schemas, and return safe error responses.
   - **Test:** Integration-test missing, invalid, expired, child, teen, parent, and cross-hive credentials against protected functions.

41. **Create dashboard query functions.** Return minimal role-appropriate summary data: scores, Nectar, next activity, recent activity, allowed prompt/memory items, and visibility indicators.
   - **Test:** Assert parent, child, and teen responses have correct fields and never include protected sibling/teen-private content.

## Phase 4 — AI activities, prompts, and rewards

42. **Create safe AI prompt specifications.** Define structured output requirements, age appropriateness, family-only context, safety restrictions, fallback behavior, and prompt-injection defenses for activities and daily prompts.
   - **Test:** Review fixtures for every activity/prompt category and verify malformed or unsafe AI output is rejected before reaching users.

43. **Build the curated activity-library flow.** Let parents browse, filter by age/pair/category/difficulty, select a template, and schedule it for a sibling pair.
   - **Test:** Schedule one template for each category and verify only the assigned pair sees it in dashboard data.

44. **Build GPT-5.6 Terra activity generation.** Use Vercel Serverless Functions to generate personalized activities from ages, interests, relationship type, history, difficulty, and desired learning outcome.
   - **Test:** Mock a valid Terra response and confirm it is saved as a valid generated activity with all required fields.

45. **Add activity-generation fallback and regeneration.** If AI times out, fails validation, or is unavailable, choose an appropriate curated template; let parents regenerate an alternative without exposing raw model output.
   - **Test:** Simulate AI failure and parent regeneration, verifying a fallback is shown and no failed draft becomes child-visible.

46. **Build daily-prompt generation and fallback.** Generate age-appropriate daily prompts with Terra using the five categories, then fall back to curated prompts if generation fails.
   - **Test:** Generate prompts for child and teen profiles and simulate a provider failure; verify exactly one valid scheduled prompt per recipient/day.

47. **Build prompt response and teen privacy controls.** Let children respond; allow teens to mark individual responses private from parents and decide sibling sharing; prevent under-13 privacy bypasses.
   - **Test:** End-to-end-test an under-13 response, a teen shared response, and a teen-private response against parent and sibling dashboards.

48. **Build completion submission.** Let each assigned sibling submit text, photo, or audio proof; store media in private Supabase Storage paths and completion metadata in the database.
   - **Test:** Submit each supported proof type and verify only authorized family members can obtain the corresponding signed media URL.

49. **Build AI completion verification.** Send permitted completion evidence to Terra/Vision as applicable, store the decision and confidence, and automatically approve only confidence above 80 percent.
   - **Test:** Mock scores of 81 and 80 and confirm only 81 auto-approves; verify failures and low confidence create a parent-review state.

50. **Build parent completion review.** Provide parent approve/reject actions for pending or low-confidence completions and preserve the decision reason/audit record.
   - **Test:** Approve and reject pending submissions; verify only the owning parent can decide and duplicate decisions are blocked.

51. **Create the equal-activity-reward ledger workflow.** On approval, create one immutable equal Nectar award for every member of the activity’s sibling pair, exactly once; preserve individual rewards for prompts and healing.
   - **Test:** Approve the same activity twice and verify each pair member receives one equal award with no duplicate transaction.

## Phase 5 — Sweetness Score and onboarding experience

52. **Define score input windows and unavailable-input behavior.** Record the measurement period, required denominators, daily recalculation timing, and how unavailable conversation/conflict data is treated until P1/P2 features are enabled.
   - **Test:** Test score calculations with all inputs, no conversation/conflict inputs, and zero eligible activity/prompt records; verify the result is always bounded and explainable.

53. **Implement the transparent score calculation.** Calculate activity completion at 35 percent, prompt engagement at 25 percent, positive interactions at 20 percent, conflict resolution at 15 percent, and scaled Nectar at 5 percent; AI may supply only positive-sentiment input.
   - **Test:** Unit-test each weighted contribution, cap, and boundary from 0 through 100 against independently calculated fixtures.

54. **Schedule and trigger score recalculation.** Recalculate daily at midnight and after activity completion, prompt response, positive-interaction, or conflict-resolution events; save score and calculation version.
   - **Test:** Trigger each qualifying event and verify a single updated score is persisted with correct timestamp/version.

55. **Build hive setup.** Collect hive name, privacy preferences, notification preferences, and required parent settings after consent.
   - **Test:** Submit and reload hive settings; confirm invalid names and missing required settings are blocked.

56. **Build dynamic child and pair setup.** Allow up to four children, child PIN or teen account setup by age, avatar/interests capture, and all non-duplicate sibling-pair choices.
   - **Test:** Complete the flow with four children/six pairs and verify the UI prevents self-pairs, duplicate pairs, and a fifth child.

57. **Build initial assessment and initial data generation.** Capture parent assessment and optional private child/teen assessment, calculate the baseline score, award welcome Nectar, generate/schedule the first AI activity and daily prompt with fallbacks.
   - **Test:** Complete onboarding with the seed family and verify exactly one baseline score, welcome reward per child, first activity, and prompt are created.

58. **Finish onboarding safely.** Redirect parents to their dashboard and children/teens to their age-appropriate dashboard only after required setup is complete.
   - **Test:** Verify incomplete hives resume onboarding and completed users reach only their authorized dashboard.

## Phase 6 — Role-appropriate dashboards

59. **Create shared dashboard view models.** Define typed loading, error, empty, and populated views for scores, Nectar, activities, prompts, artifacts, and privacy indicators.
   - **Test:** Unit-test each view model with complete, empty, partial, and forbidden data fixtures.

60. **Build the parent dashboard.** Show hive score, pair overview, children’s Nectar/activity status, recent activity, pending completion reviews, scheduled activity, parent-visible prompts/artifacts, and private-item indicators.
   - **Test:** Render seeded data and verify private teen items display only the required locked indicator, while under-13 content is visible to the parent.

61. **Build the child dashboard.** Create the simple icon-led, mobile-first child view with Buz guidance, Nectar, honey-jar score, current activity, daily prompt, and permitted shared memories.
   - **Test:** Run keyboard, screen-reader, contrast, and narrow-viewport checks; verify it never exposes private sibling/teen data.

62. **Build the teen dashboard.** Provide a more detailed dashboard with pair score, featured activity, daily prompt, recent shared items, and controls for prompt/artifact privacy.
   - **Test:** Verify the route selects the teen view at age 13 and private controls are absent from child accounts.

63. **Build the accessible Honey Jar score component.** Render the five named score bands and a non-color textual score equivalent.
   - **Test:** Component-test score boundaries at 0, 20, 21, 40, 41, 60, 61, 80, 81, and 100, including screen-reader output.

64. **Connect real-time core updates.** Subscribe authorized dashboards to activity approvals, prompt responses, score changes, and Nectar awards, with a secure refetch fallback.
   - **Test:** Complete an activity in one authorized session and verify relevant dashboards update while an unrelated hive receives no event data.

## Phase 7 — P1/P2 engagement features

65. **Build Pollen Garden behind its flag.** Allow authorized family members to create and view artifacts with the defined teen privacy and under-13 parent visibility rules.
   - **Test:** Verify artifact visibility for parent, creator, sibling, and unrelated hive identities.

66. **Build family-only text chat behind its flag.** Enforce pair/hive recipient rules, basic moderation status, and parent metadata visibility without introducing public discovery.
   - **Test:** Verify a child cannot message outside the hive and a parent sees only the approved metadata view.

67. **Add in-app and web-push notification preferences.** Support the 8:00 AM daily prompt and 4:00 PM incomplete-activity reminder, with parent-controlled child settings and parent opt-outs.
   - **Test:** Use scheduled test events to verify correct recipients, times, preferences, and no send after opt-out.

68. **Add the Monday weekly email as a P2 stretch goal.** Generate a parent-only 9:00 AM summary from permitted aggregates, without including teen-private content.
   - **Test:** Send a staging email to a test parent and verify its totals, timing, opt-out behavior, and privacy filtering.

69. **Add the Healing Chamber as a P2 stretch goal.** Enable parent-started conflict logging, private sibling statements, parent-visible resolution, promises, and repair activity suggestions only after its moderation/safety review is complete.
   - **Test:** Run the full parent/child conflict flow and verify both sibling records, parent access, award rules, and audit events.

## Phase 8 — security, deletion, deployment, and demo

70. **Harden browser and serverless security.** Configure CORS allowlists, security headers, rate limits, input validation, secure storage paths, safe logging, and server-only secrets.
   - **Test:** Test disallowed origins, malformed/oversized requests, repeated PIN/API attempts, and confirm secrets do not appear in browser bundles or logs.

71. **Build export and Delete My Hive requests.** Let only the owning parent request export/deletion, require email confirmation, notify affected teen accounts as appropriate, and keep a pending-deletion status.
   - **Test:** Verify non-owners cannot request deletion and a confirmed test request includes only the requested hive’s data.

72. **Automate the 30-day deletion workflow.** Purge hive data, private storage objects, credentials, and related records after confirmation within the required window; preserve only legally required minimal audit evidence.
   - **Test:** Execute the workflow in staging with a shortened test window and verify every hive record/storage object is removed while another hive remains intact.

73. **Add sensitive-action audits.** Record consent changes, PIN resets, teen privacy overrides, activity approval, Nectar awards, export/deletion requests, and parent decisions without retaining unnecessary private content.
   - **Test:** Perform every sensitive action and verify actor, scope, timestamp, and required reason are recorded.

74. **Establish regression coverage.** Meet the stated coverage targets where feasible and prioritize critical tests for consent, PIN/teen auth, RLS isolation, AI fallback, approval/reward idempotency, privacy, and dashboard access.
   - **Test:** Generate a coverage report and run the critical Playwright suite successfully before staging deployment.

75. **Deploy the staging environment.** Configure a separate Vercel staging project and Supabase staging project, automatic deployment from `main`, migrations, error monitoring, and seeded demo data.
   - **Test:** Deploy to staging, run migrations/seeding, complete the end-to-end P0 suite, and verify a controlled monitoring event arrives.

76. **Prepare the three-minute demo.** Create a reproducible walkthrough using the seeded three-sibling family: parent signup/setup, AI activity or fallback, child/teen views, completion review, equal Nectar, and score/dashboard update.
   - **Test:** Time the complete demonstration on staging, confirm it finishes within three minutes, and rehearse from a clean browser session.

77. **Run the hackathon release checklist.** Verify all P0 flows, consent/US-only messaging, child and teen privacy, family-only RLS, AI fallback, data deletion request, dashboard correctness, staging deployment, README, and demo video.
   - **Test:** Have an independent reviewer execute the checklist using fresh parent, child, teen, and cross-hive accounts; address all P0 failures before submission.

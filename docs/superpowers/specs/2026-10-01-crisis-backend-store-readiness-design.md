# Crisis, Backend, and Store Readiness Design

## Context

Primeros Auxilios Emocionales is currently an Expo/React Native MVP for emotional first aid. It provides consent, urgent help, a short assessment, exercise recommendations, local tracking, a brief safety plan, privacy/data screens, and thesis-friendly summaries.

The next target is a Mexico-only thesis app that is as close as practical to store readiness. The app should remain clear that it is not therapy, diagnosis, or emergency care, while reducing friction for people in acute distress and preparing the system for user accounts and secure backend storage.

## Goals

- Make the app safer and simpler for a person in psychological crisis in Mexico.
- Preserve thesis usefulness: before/after distress, perceived helpfulness, exercise use, and exportable summaries.
- Prepare the product for app-store publication quality without overbuilding enterprise features.
- Add backend accounts through an API; the mobile app must never connect directly to the database.
- Use Azure SQL Database / SQL Server as the primary data store for the first backend version.
- Keep offline-first behavior for immediate crisis flows, because urgent help must not depend on network availability.

## Non-Goals

- No AI diagnosis or clinical decision automation.
- No replacement for professional psychological, medical, or emergency services.
- No multi-country emergency directory in the first backend version.
- No clinician dashboard in the first implementation cycle unless added later as a separate spec.
- No real-time chat with professionals in this phase.

## Users and Core Scenarios

### Person in Acute Crisis

The person may be anxious, dissociated, scared, ashamed, or cognitively overloaded. They need immediate, low-effort access to:

- 911.
- Linea de la Vida: 800 911 2000.
- A trusted contact.
- A short safety plan.
- One stabilizing exercise only after immediate safety is addressed.

### Person Using the App for Self-Regulation

The person is not in immediate danger and can complete an assessment, choose a need, do an exercise, and record before/after distress.

### Thesis Reviewer or Advisor

The reviewer needs evidence that the app:

- States its scope clearly.
- Prioritizes safety.
- Uses non-diagnostic screening language.
- Collects useful but limited data.
- Allows export/deletion.
- Can be clinically reviewed through centralized crisis criteria and copy.

## Product Design

### Crisis Mode

Add a dedicated crisis mode as a first-class route and product state. It should be reachable from:

- Home.
- Consent.
- Survey risk answer.
- Severe result.
- Safety plan.
- Exercise follow-up when distress increases.

The crisis screen must be minimal:

1. Primary danger action: call 911.
2. Secondary action: call Linea de la Vida.
3. Trusted contact action: call or WhatsApp saved contact.
4. Brief safety checklist: "move to a safer place", "stay with someone or in a visible place", "move away from means of harm", "call for help".
5. Optional grounding action after the contact/help actions.

The screen should avoid thesis metrics, graphs, long explanations, and optional educational links.

### Assessment Flow

Keep the existing safety-first assessment, but change severe/high-risk behavior:

- If safety answer is `unsafe` or `unsure`, route immediately to crisis mode.
- If distress is 9 or 10, show crisis support before exercise recommendations.
- If PHQ-4 result is severe, show urgent support before exercise recommendations.
- Results must keep non-diagnostic language.
- Exercise recommendations should remain available but secondary when severity is high.

### Exercises

Exercises remain useful, but the follow-up form should not block care:

- A person may finish an exercise without saving follow-up.
- Helpful rating should be optional in crisis/severe context.
- If distress after exercise is higher than before, the next screen should promote crisis mode and trusted contact.
- Audio playback errors should degrade gracefully with visible step instructions.

### Trusted Contact

Trusted contact should be part of crisis setup:

- Store name and phone.
- Normalize Mexico phone numbers for `tel:` and WhatsApp.
- Allow calling without forcing confirmation in crisis mode, or use a very lightweight confirmation if required by platform UX.
- Keep contact local for immediate access even after backend sync is added.

### Privacy and Consent

Consent should become versioned:

- App scope consent.
- Local storage notice.
- Backend account and sync consent.
- Sensitive mental health data notice.
- Emergency limitation notice.

Users must be able to:

- Export their own data.
- Delete local data.
- Request backend account/data deletion.
- Use crisis mode even without an account.

## Architecture

### Mobile App

Keep Expo/React Native and Expo Router.

Recommended app organization:

```text
app/
  crisis/
  assessment/
  exercises/
  account/
  privacy/
  thesis/
features/
  crisis/
  assessment/
  exercises/
  tracking/
  trusted-contact/
  privacy/
services/
  api/
  storage/
  sync/
  auth/
```

The current `(tabs)` grouping can remain temporarily, but the app should not rely on it as the domain boundary. Domain behavior should move from screens into `features/*` and `services/*`.

### Backend API

Use a backend API as the only server-side entry point. The app must never send database credentials or connect directly to SQL Server.

Recommended stack:

- Node.js with TypeScript.
- API framework: Express, Fastify, or NestJS. Prefer Fastify or NestJS if the backend will grow.
- Authentication: managed identity provider if available, otherwise email/password through a proven auth service. Do not build password hashing and account recovery from scratch unless necessary.
- Database: Azure SQL Database / SQL Server.
- ORM/query layer: Prisma or a small repository layer with parameterized SQL. Prefer Prisma for schema/migration clarity in thesis context.

### Database Choice

Use Azure SQL Database / SQL Server for the first production-oriented backend.

Rationale:

- The data is structured and relational: users, consents, assessments, exercises, follow-ups, contacts, safety plan state, deletion requests.
- Thesis reporting benefits from relational queries.
- SQL constraints help protect data consistency.
- Azure SQL has mature security controls: TLS, firewall rules, private endpoints, encryption at rest, backup/restore, and monitoring.

MongoDB Atlas is a viable alternative, especially for flexible documents, but it gives less schema enforcement by default. Cosmos DB is not recommended for this phase because global distribution and NoSQL scaling are not first-order needs for a Mexico-only thesis app.

## Data Model

Initial relational tables:

- `users`
  - `id`
  - `email`
  - `display_name`
  - `created_at`
  - `deleted_at`
- `consent_versions`
  - `id`
  - `version`
  - `body_hash`
  - `published_at`
- `user_consents`
  - `id`
  - `user_id`
  - `consent_version_id`
  - `accepted_at`
  - `scope`
- `trusted_contacts`
  - `id`
  - `user_id`
  - `name`
  - `phone_e164`
  - `created_at`
  - `updated_at`
- `survey_assessments`
  - `id`
  - `user_id`
  - `safety_answer`
  - `distress_before`
  - `phq4_score`
  - `anxiety_score`
  - `depression_score`
  - `primary_need`
  - `level`
  - `emergency`
  - `created_at`
- `exercise_follow_ups`
  - `id`
  - `user_id`
  - `exercise_id`
  - `assessment_id`
  - `distress_before`
  - `distress_after`
  - `delta`
  - `helpful_rating`
  - `helpful_comment`
  - `created_at`
- `emotion_logs`
  - `id`
  - `user_id`
  - `log_date`
  - `emotion`
  - `created_at`
- `safety_plan_statuses`
  - `id`
  - `user_id`
  - `safe_place`
  - `can_contact`
  - `trusted_contact`
  - `urgent_help`
  - `updated_at`
- `data_export_events`
  - `id`
  - `user_id`
  - `created_at`
- `data_deletion_requests`
  - `id`
  - `user_id`
  - `status`
  - `requested_at`
  - `completed_at`

Avoid storing unnecessary free text. If comments remain, limit length and warn users not to include third-party sensitive details.

## Sync Model

The app should remain local-first:

- Crisis resources are bundled in the app.
- Trusted contact is cached locally.
- Assessments and follow-ups are saved locally first.
- Backend sync happens after account login and network availability.
- Failed sync should not block exercises, emergency actions, or local export.

Each locally generated record should have a stable client ID so retrying sync does not create duplicates.

## Security and Privacy

Minimum requirements:

- HTTPS only.
- Short-lived access tokens.
- Refresh token storage through platform-secure storage, not AsyncStorage.
- Azure SQL firewall restrictions.
- Private endpoints for production if backend and database are in Azure.
- Encryption at rest through Azure SQL defaults.
- No sensitive data in logs.
- No database credentials in the mobile app.
- Rate limiting on auth and write endpoints.
- Server-side validation for all PHQ-4, distress, phone, and enum values.
- Account deletion process.

For the mobile app:

- Keep emergency resources available without login.
- Move sensitive auth tokens out of AsyncStorage.
- Add defensive parsing and schema validation for local stored data.
- Keep a clear "delete local data" action.

## Clinical Review Points

The advisor should review:

- Crisis-mode copy.
- Safety question wording.
- When the app routes to crisis mode.
- Result messages by severity.
- Exercise list and contraindications.
- Consent text.
- Data collection language.
- Store listing disclaimers.

Clinical review decisions should be centralized in constants or content files so they can be audited without hunting through screen code.

## Testing Strategy

### Unit Tests

- Assessment severity classification.
- Crisis routing rules.
- Exercise recommendations.
- Follow-up delta calculation.
- Phone normalization for Mexico.
- Storage parsing and corrupt-data fallback.

### Integration Tests

- Safe user completes assessment and opens exercise.
- Unsafe/unsure user goes to crisis mode.
- Severe result prioritizes crisis mode.
- Distress increases after exercise and crisis option appears.
- Local record sync retries without duplicates.

### Backend Tests

- Auth-required endpoints reject anonymous access.
- User can read only their own records.
- Server validates enum/range inputs.
- Consent version is required before sync.
- Deletion request marks data according to policy.

### Manual Store-Readiness Checks

- Android physical-device test.
- iOS simulator or physical-device test if publishing iOS.
- No broken deep links.
- No English template leftovers.
- Accessibility labels on crisis actions.
- Offline crisis mode works.
- Privacy policy matches actual data behavior.

## Implementation Phases

### Phase 1: Stabilize Current MVP

- Install dependencies and verify `npm run test:assessment`, `npx tsc --noEmit`, `npm run lint`, and Expo start/export.
- Add safe local storage parsing.
- Remove or connect orphan screens.
- Translate template leftovers.
- Fix stale exercise IDs in profile.
- Add tests for corrupt storage and crisis routing.

### Phase 2: Crisis Mode for Mexico

- Add the crisis route.
- Centralize Mexico emergency resources.
- Route unsafe, unsure, distress 9-10, severe PHQ-4, and increased post-exercise distress to crisis support.
- Simplify severe result UX.
- Review copy with advisor.

### Phase 3: Store-Ready UX and Privacy

- Reduce home overload.
- Make follow-up saving optional where clinically appropriate.
- Add account/sync consent copy.
- Add privacy policy draft content.
- Add offline/error states.

### Phase 4: Backend Foundation

- Create backend API.
- Add auth.
- Add Azure SQL schema and migrations.
- Implement consent, profile, assessments, follow-ups, emotion logs, safety plan, export, and deletion endpoints.
- Add backend tests.

### Phase 5: Mobile Sync

- Add API client.
- Add secure token storage.
- Add local-to-backend sync queue.
- Add conflict/duplicate handling.
- Keep crisis mode local-first.

### Phase 6: Thesis Reporting

- Add anonymized or pseudonymized export.
- Add backend report endpoints if advisor approves.
- Document metrics and limitations.

### Phase 7: Store Preparation

- Prepare builds.
- Validate permissions.
- Finalize privacy policy and disclaimers.
- Run device QA checklist.
- Freeze clinical copy version for first release candidate.

## Acceptance Criteria

- A user in Mexico can reach 911, Linea de la Vida, and trusted contact within two taps from home.
- A user who reports being unsafe or unsure never has to complete PHQ-4 before seeing crisis help.
- Crisis mode works offline except for phone/network-dependent actions.
- Severe results prioritize support before exercises.
- The app can still be used without an account for crisis and local self-regulation.
- Logged-in users can sync assessments, follow-ups, emotion logs, safety plan status, and trusted contact.
- Users can export and delete local data.
- Backend data is only reachable through authenticated API endpoints.
- SQL schema enforces ownership and valid value ranges.
- Advisor-reviewed crisis criteria and copy are centralized and versioned.

## Open Decisions

- Which authentication provider to use.
- Whether trusted contact should sync by default or require separate consent.
- Whether thesis exports should be fully anonymous or pseudonymous.
- Whether backend hosting should be Azure App Service, Azure Container Apps, or another provider.
- Whether iOS publication is in scope for the first store-ready target or Android only.

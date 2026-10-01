# Crisis Backend Store Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Mexico-focused crisis mode, stabilize the current MVP, and add the backend/account architecture needed for thesis use and store readiness.

**Architecture:** Keep the Expo app local-first for crisis and self-regulation, then add a TypeScript backend API as the only server-side entry point. Use Azure SQL Database / SQL Server as the relational source of truth for synced user data, while emergency resources and trusted-contact access remain available offline.

**Tech Stack:** Expo, React Native, Expo Router, AsyncStorage plus secure token storage, TypeScript, Node.js backend API, Fastify, Prisma, Azure SQL Database / SQL Server, Node test runner for backend tests.

**Spec:** `docs/superpowers/specs/2026-10-01-crisis-backend-store-readiness-design.md`

## Global Constraints

- Mexico only for this implementation cycle.
- Crisis resources must work without account login.
- The mobile app must never connect directly to SQL Server.
- Azure SQL Database / SQL Server is the primary backend data store.
- Crisis mode is local-first and must not depend on network availability except for phone/network actions.
- Results and assessment copy must remain non-diagnostic.
- Advisor-reviewed crisis criteria and copy must live in centralized constants/content files.
- Backend sync starts only after account login and consent.
- Sensitive auth tokens must not be stored in AsyncStorage.
- Keep thesis metrics: before/after distress, perceived helpfulness, exercise use, and exportable summaries.

## Review Focus

- Corrupt local JSON should not crash home, profile, privacy, or summary screens; Task 1 adds storage parser tests.
- Unsafe, unsure, distress 9-10, severe PHQ-4, and increased post-exercise distress should all lead to crisis support; Tasks 2 and 4 add routing tests.
- Crisis mode must remain usable offline and without login; Task 3 adds component/route behavior checks.
- Backend endpoints must enforce user ownership so one user cannot read or mutate another user's data; Task 7 adds API authorization tests.
- Sync retry must not duplicate records after a network failure; Task 8 adds client ID/idempotency tests.

---

## File Structure

- Modify `package.json` to add verification scripts only if existing scripts are insufficient.
- Modify `utils/storage.ts` and `utils/emotionUtils.ts` to use safe parsing helpers.
- Create `utils/localJson.ts` for defensive JSON parsing and schema fallback.
- Create `features/crisis/crisisResources.ts` for Mexico emergency resources.
- Create `features/crisis/crisisRouting.ts` for all risk-routing decisions.
- Create `features/crisis/crisisCopy.ts` for advisor-reviewable Spanish crisis copy.
- Create `app/crisis/index.tsx` for the crisis mode screen.
- Modify `app/(tabs)/index.tsx`, `app/(tabs)/consent.tsx`, `app/(tabs)/survey.tsx`, `app/(tabs)/results.tsx`, `app/(tabs)/safety-plan.tsx`, and `app/(tabs)/exercises/[id].tsx` to route into crisis mode.
- Modify `app/+not-found.tsx` and `app/(tabs)/profile.tsx` for template/stale-copy cleanup.
- Create `services/auth/secureTokenStore.ts` for mobile secure token storage.
- Create `services/api/client.ts` for the mobile API client.
- Create `services/sync/syncQueue.ts` for local-to-backend retry/idempotency.
- Create `backend/` as a TypeScript API project.
- Create `backend/prisma/schema.prisma` for Azure SQL-compatible relational models.
- Create `backend/src/modules/*` for auth, consent, assessments, follow-ups, emotion logs, safety plan, export, and deletion.
- Create `docs/store-readiness/privacy-policy-draft.md` and `docs/store-readiness/qa-checklist.md`.

## Scope Check

The approved spec contains several subsystems. This plan keeps them in one sequenced implementation plan because each phase builds toward a single release candidate, but task boundaries deliberately separate mobile stabilization, crisis UX, backend foundation, sync, and store-readiness documentation. If execution cost becomes too high, split after Task 4: Tasks 1-4 ship the safer offline MVP, while Tasks 5-9 ship account/backend readiness.

### Task 1: Stabilize Current MVP and Local Storage

**Files:**
- Create: `utils/localJson.ts`
- Modify: `utils/storage.ts`
- Modify: `utils/emotionUtils.ts`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/+not-found.tsx`
- Test: `tests/localStorage.test.cjs`
- Test: `tests/assessment.test.cjs`

**Interfaces:**
- Consumes: Existing AsyncStorage keys from `utils/storage.ts` and `utils/emotionUtils.ts`.
- Produces: `parseJsonArray<T>(stored: string | null): T[]`, `parseJsonObject<T>(stored: string | null, fallback: T): T`, and safe storage reads for later sync work.

- [ ] **Step 1: Install project dependencies**

Run: `npm install`

Expected: `node_modules` exists and `package-lock.json` remains consistent with `package.json`.

- [ ] **Step 2: Write failing local storage parser tests**

Add `tests/localStorage.test.cjs` with assertions that invalid JSON returns safe fallbacks:

```js
assert.deepEqual(localJson.parseJsonArray('[bad'), []);
assert.deepEqual(localJson.parseJsonArray('{"not":"array"}'), []);
assert.deepEqual(localJson.parseJsonObject('[bad', { ok: true }), { ok: true });
```

- [ ] **Step 3: Run the failing parser test**

Run: `node --test tests/localStorage.test.cjs`

Expected: FAIL because `utils/localJson.ts` does not exist.

- [ ] **Step 4: Implement `parseJsonArray<T>` and `parseJsonObject<T>` in `utils/localJson.ts`**

Both functions must catch `JSON.parse` failures and return the provided fallback.

- [ ] **Step 5: Replace direct local `JSON.parse` calls in app storage paths**

Use `parseJsonArray` in `utils/storage.ts`, `utils/emotionUtils.ts`, and `app/(tabs)/index.tsx`. Keep direct `JSON.parse` only where input is controlled route params and already caught.

- [ ] **Step 6: Clean visible template/stale copy**

Translate `app/+not-found.tsx` to Spanish. Update `app/(tabs)/profile.tsx` exercise ID labels to match current IDs: `respiracion`, `grounding`, `afirmaciones`, `escritura`, `escucha`, `ayuda`, `afirmacionesAnsiedad`.

- [ ] **Step 7: Verify local tests and static checks**

Run:

```bash
node --test tests/localStorage.test.cjs
npm run test:assessment
npx tsc --noEmit
npm run lint
```

Expected: all commands pass.

- [ ] **Step 8: Commit**

```bash
git add utils/localJson.ts utils/storage.ts utils/emotionUtils.ts app/(tabs)/index.tsx app/(tabs)/profile.tsx app/+not-found.tsx tests/localStorage.test.cjs tests/assessment.test.cjs
git commit -m "fix: harden local storage and cleanup mvp copy"
```

### Task 2: Centralize Mexico Crisis Resources and Routing Rules

**Files:**
- Create: `features/crisis/crisisResources.ts`
- Create: `features/crisis/crisisRouting.ts`
- Create: `features/crisis/crisisCopy.ts`
- Modify: `utils/assessment.ts`
- Test: `tests/crisisRouting.test.cjs`

**Interfaces:**
- Consumes: `SafetyAnswer`, `DistressLevel`, `ExerciseFollowUpInput`, and PHQ-4 result data from `utils/assessment.ts`.
- Produces: `MEXICO_CRISIS_RESOURCES`, `shouldRouteToCrisis(input: CrisisRoutingInput): boolean`, `getCrisisReasons(input: CrisisRoutingInput): CrisisReason[]`.

- [ ] **Step 1: Write failing crisis routing tests**

Create tests for:

```js
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'unsafe' }), true);
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'unsure' }), true);
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 9 }), true);
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'safe', level: 'severo' }), true);
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 6, distressAfter: 8 }), true);
assert.equal(shouldRouteToCrisis({ safetyAnswer: 'safe', distressBefore: 4, level: 'leve' }), false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/crisisRouting.test.cjs`

Expected: FAIL because crisis routing files do not exist.

- [ ] **Step 3: Implement `features/crisis/crisisResources.ts`**

Export Mexico resources with exact values:

- Emergency phone: `911`.
- Linea de la Vida phone: `8009112000`.
- Linea de la Vida display: `800 911 2000`.
- Official URL: `https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000`.

- [ ] **Step 4: Implement `features/crisis/crisisRouting.ts`**

`shouldRouteToCrisis` returns true for unsafe/unsure, distress 9-10, `level === 'severo'`, or post-exercise distress increase.

- [ ] **Step 5: Move advisor-reviewable crisis strings into `features/crisis/crisisCopy.ts`**

Include labels for 911, Linea de la Vida, trusted contact, safety checklist, and non-replacement disclaimer.

- [ ] **Step 6: Verify tests**

Run:

```bash
node --test tests/crisisRouting.test.cjs
npm run test:assessment
npx tsc --noEmit
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add features/crisis utils/assessment.ts tests/crisisRouting.test.cjs
git commit -m "feat: centralize mexico crisis routing"
```

### Task 3: Add Offline Crisis Mode Screen

**Files:**
- Create: `app/crisis/index.tsx`
- Modify: `app/(tabs)/emergency.tsx`
- Modify: `app/(tabs)/trusted-contact.tsx`
- Test: `tests/crisisScreen.test.cjs`

**Interfaces:**
- Consumes: `MEXICO_CRISIS_RESOURCES` and crisis copy from Task 2.
- Produces: Route `/crisis` with call 911, call Linea de la Vida, trusted contact, safety checklist, and optional grounding action.

- [ ] **Step 1: Write crisis screen content checks**

Add `tests/crisisScreen.test.cjs` to compile and inspect exported crisis copy/resources, asserting the crisis screen source data includes:

```js
['Llamar al 911', 'Llamar a Linea de la Vida', 'Contacto de confianza', 'Estoy en un lugar mas seguro']
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/crisisScreen.test.cjs`

Expected: FAIL because `app/crisis/index.tsx` does not exist.

- [ ] **Step 3: Implement `app/crisis/index.tsx`**

Use a minimal `ScrollView`, large danger/primary buttons, `Linking.openURL('tel:911')`, `Linking.openURL('tel:+528009112000')`, trusted contact actions, and safety checklist text.

- [ ] **Step 4: Keep `/emergency` as a richer resource page**

Modify `app/(tabs)/emergency.tsx` to either redirect primary crisis actions to `/crisis` or clearly present `/crisis` first. Keep official resource links secondary.

- [ ] **Step 5: Improve trusted-contact crisis behavior**

Allow trusted-contact call/WhatsApp paths to be reused from crisis mode. If no contact exists, show a short setup action without blocking 911 or Linea de la Vida.

- [ ] **Step 6: Manual offline check**

Run Expo, disable network on a device/simulator, open `/crisis`, and verify the screen renders. Phone actions may depend on device network but must remain visible.

- [ ] **Step 7: Verify**

Run:

```bash
node --test tests/crisisScreen.test.cjs
npx tsc --noEmit
npm run lint
```

Expected: pass.

- [ ] **Step 8: Commit**

```bash
git add app/crisis app/(tabs)/emergency.tsx app/(tabs)/trusted-contact.tsx tests/crisisScreen.test.cjs
git commit -m "feat: add offline crisis mode"
```

### Task 4: Route High-Risk Mobile Flows to Crisis Mode

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/consent.tsx`
- Modify: `app/(tabs)/survey.tsx`
- Modify: `app/(tabs)/results.tsx`
- Modify: `app/(tabs)/safety-plan.tsx`
- Modify: `app/(tabs)/exercises/[id].tsx`
- Test: `tests/crisisRouting.test.cjs`

**Interfaces:**
- Consumes: `/crisis` route and `shouldRouteToCrisis` from Tasks 2-3.
- Produces: Consistent crisis-first navigation for unsafe/unsure, distress 9-10, severe level, and increased post-exercise distress.

- [ ] **Step 1: Extend routing tests for screen-level route choices**

Add assertions for route target values:

```js
assert.equal(getCrisisRouteForSurvey({ safetyAnswer: 'unsure' }), '/crisis');
assert.equal(getCrisisRouteForResult({ level: 'severo', distressBefore: 8 }), '/crisis');
assert.equal(getCrisisRouteForExerciseFollowUp({ distressBefore: 5, distressAfter: 7 }), '/crisis');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/crisisRouting.test.cjs`

Expected: FAIL until route helper functions exist.

- [ ] **Step 3: Add route helper functions to `features/crisis/crisisRouting.ts`**

Export `getCrisisRouteForSurvey`, `getCrisisRouteForResult`, and `getCrisisRouteForExerciseFollowUp`, each returning `'/crisis'` or `null`.

- [ ] **Step 4: Update home and consent**

Change urgent buttons from `/emergency` to `/crisis`. Keep `/emergency` reachable as resource detail.

- [ ] **Step 5: Update survey**

Unsafe/unsure answers and submit handling must `router.replace('/crisis')` instead of `/emergency`.

- [ ] **Step 6: Update results**

For severe or distress 9-10, render crisis action before exercise recommendations. Exercise recommendations remain visible below.

- [ ] **Step 7: Update exercise follow-up**

If distress increased, show a crisis-mode button before "Ver mas ejercicios". Saving helpfulness remains optional in severe/crisis context.

- [ ] **Step 8: Verify**

Run:

```bash
node --test tests/crisisRouting.test.cjs
npm run test:assessment
npx tsc --noEmit
npm run lint
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add features/crisis app/(tabs)/index.tsx app/(tabs)/consent.tsx app/(tabs)/survey.tsx app/(tabs)/results.tsx app/(tabs)/safety-plan.tsx app/(tabs)/exercises/[id].tsx tests/crisisRouting.test.cjs
git commit -m "feat: route high risk flows to crisis mode"
```

### Task 5: Prepare Consent, Privacy, and Account UI for Sync

**Files:**
- Create: `features/privacy/consentContent.ts`
- Create: `app/account/index.tsx`
- Modify: `app/(tabs)/consent.tsx`
- Modify: `app/(tabs)/privacy-data.tsx`
- Modify: `utils/storage.ts`
- Test: `tests/consent.test.cjs`

**Interfaces:**
- Consumes: existing `acceptConsent`, `hasAcceptedConsent`, and privacy/export screens.
- Produces: versioned local consent metadata and account/sync consent copy before backend integration.

- [ ] **Step 1: Write consent tests**

Assert the current consent version has required scopes:

```js
assert.deepEqual(CONSENT_SCOPES, ['app_scope', 'local_storage', 'backend_sync', 'sensitive_data', 'emergency_limits']);
assert.match(CONSENT_VERSION, /^2026-/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/consent.test.cjs`

Expected: FAIL because `features/privacy/consentContent.ts` does not exist.

- [ ] **Step 3: Implement consent content**

Create `CONSENT_VERSION`, `CONSENT_SCOPES`, and Spanish copy blocks. Include backend sync as optional until account login exists.

- [ ] **Step 4: Store accepted consent version**

Modify `acceptConsent` to store `{ acceptedAt, version, scopes }` while preserving compatibility with the old timestamp value.

- [ ] **Step 5: Add account placeholder screen**

Create `app/account/index.tsx` with clear "cuenta y sincronizacion proximamente" status and no fake login.

- [ ] **Step 6: Update privacy screen**

Explain local data, future backend sync, export, local delete, and future account deletion request.

- [ ] **Step 7: Verify**

Run:

```bash
node --test tests/consent.test.cjs
npx tsc --noEmit
npm run lint
```

Expected: pass.

- [ ] **Step 8: Commit**

```bash
git add features/privacy app/account app/(tabs)/consent.tsx app/(tabs)/privacy-data.tsx utils/storage.ts tests/consent.test.cjs
git commit -m "feat: prepare consent and account sync copy"
```

### Task 6: Scaffold Backend API and Azure SQL Schema

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/server.ts`
- Create: `backend/src/config/env.ts`
- Create: `backend/src/modules/health/health.routes.ts`
- Test: `backend/tests/health.test.ts`

**Interfaces:**
- Consumes: approved relational data model from the spec.
- Produces: TypeScript backend project, `/health` endpoint, Prisma schema for Azure SQL-compatible models.

- [ ] **Step 1: Create backend package**

Use scripts:

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc -p tsconfig.json",
  "test": "node --test dist/tests/**/*.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev"
}
```

- [ ] **Step 2: Write failing health test**

Test that `GET /health` returns `{ ok: true }`.

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
cd backend
npm install
npm test
```

Expected: FAIL until server exists/build is configured.

- [ ] **Step 4: Implement Fastify server**

Use Fastify for the first API. Export `buildServer()` from `backend/src/server.ts` so tests can instantiate it without binding a port.

- [ ] **Step 5: Add Prisma schema**

Define models for `User`, `ConsentVersion`, `UserConsent`, `TrustedContact`, `SurveyAssessment`, `ExerciseFollowUp`, `EmotionLog`, `SafetyPlanStatus`, `DataExportEvent`, and `DataDeletionRequest`. Include `userId` relations and timestamps.

- [ ] **Step 6: Verify backend build and health test**

Run:

```bash
cd backend
npm run build
npm test
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add backend
git commit -m "feat: scaffold backend api and sql schema"
```

### Task 7: Implement Backend Auth Boundaries and Data Endpoints

**Files:**
- Create: `backend/src/modules/auth/*`
- Create: `backend/src/modules/consent/*`
- Create: `backend/src/modules/assessments/*`
- Create: `backend/src/modules/follow-ups/*`
- Create: `backend/src/modules/emotions/*`
- Create: `backend/src/modules/safety-plan/*`
- Create: `backend/src/modules/privacy/*`
- Test: `backend/tests/authorization.test.ts`
- Test: `backend/tests/validation.test.ts`

**Interfaces:**
- Consumes: Prisma models from Task 6.
- Produces: Authenticated CRUD/sync endpoints that only allow access to the current user's records.

- [ ] **Step 1: Implement the first auth boundary with Microsoft Entra External ID**

Use Microsoft Entra External ID as the production target. For local automated tests, add a test-only JWT verifier that is active only when `NODE_ENV === 'test'`; do not build password recovery or password storage in this backend.

- [ ] **Step 2: Write authorization tests**

Create tests asserting user A cannot read or update user B records for assessments, follow-ups, emotion logs, safety plan, trusted contact, export, or deletion request.

- [ ] **Step 3: Write validation tests**

Assert server rejects invalid enum values, distress outside 0-10, PHQ-4 outside 0-12, helpful rating outside 1-5, and malformed Mexico phone values.

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
cd backend
npm test
```

Expected: FAIL until modules exist.

- [ ] **Step 5: Implement auth middleware**

Expose `requireUser(request): AuthenticatedUser` and apply it to every user-data route.

- [ ] **Step 6: Implement consent endpoints**

Endpoints:

- `GET /consent/current`
- `POST /me/consents`

- [ ] **Step 7: Implement data endpoints**

Endpoints:

- `GET/POST /me/assessments`
- `GET/POST /me/exercise-follow-ups`
- `GET/POST /me/emotion-logs`
- `GET/PUT /me/safety-plan`
- `GET/PUT /me/trusted-contact`
- `POST /me/export-events`
- `POST /me/deletion-requests`

- [ ] **Step 8: Verify**

Run:

```bash
cd backend
npm run build
npm test
```

Expected: all backend tests pass.

- [ ] **Step 9: Commit**

```bash
git add backend/src backend/tests
git commit -m "feat: add authenticated wellness api endpoints"
```

### Task 8: Add Mobile API Client, Secure Token Storage, and Sync Queue

**Files:**
- Create: `services/api/client.ts`
- Create: `services/auth/secureTokenStore.ts`
- Create: `services/sync/syncQueue.ts`
- Modify: `utils/storage.ts`
- Modify: `app/account/index.tsx`
- Test: `tests/syncQueue.test.cjs`

**Interfaces:**
- Consumes: backend endpoints from Task 7 and safe storage from Task 1.
- Produces: local-first sync queue with stable client IDs and no duplicate records on retry.

- [ ] **Step 1: Add secure storage dependency**

Install `expo-secure-store` or the chosen platform-secure storage package.

- [ ] **Step 2: Write failing sync queue tests**

Assert:

```js
assert.equal(queueRecord.clientId.length > 0, true);
assert.equal(retrySameClientIdCreatesDuplicate(localQueue), false);
assert.equal(syncWithoutTokenReturnsSkipped(), 'skipped_no_auth');
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/syncQueue.test.cjs`

Expected: FAIL because sync queue does not exist.

- [ ] **Step 4: Implement `services/auth/secureTokenStore.ts`**

Expose `getAccessToken`, `setAccessToken`, `clearAccessToken`, and matching refresh-token functions. Do not use AsyncStorage.

- [ ] **Step 5: Implement `services/api/client.ts`**

Expose typed methods for consent, assessments, follow-ups, emotion logs, safety plan, trusted contact, export event, and deletion request.

- [ ] **Step 6: Implement `services/sync/syncQueue.ts`**

Use stable `clientId`, `recordType`, `payload`, `status`, `attemptCount`, `lastError`, `createdAt`, and `updatedAt`. Retry pending records after login/network availability.

- [ ] **Step 7: Integrate account screen with sync status**

Show local-only, signed-in/sync-enabled, pending records, and last sync error states.

- [ ] **Step 8: Verify**

Run:

```bash
node --test tests/syncQueue.test.cjs
npx tsc --noEmit
npm run lint
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add services app/account utils/storage.ts tests/syncQueue.test.cjs package.json package-lock.json
git commit -m "feat: add mobile api client and sync queue"
```

### Task 9: Add Thesis and Store-Readiness Documentation

**Files:**
- Create: `docs/store-readiness/privacy-policy-draft.md`
- Create: `docs/store-readiness/qa-checklist.md`
- Create: `docs/store-readiness/clinical-review-checklist.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: final product behavior from Tasks 1-8.
- Produces: reviewable documents for thesis advisor, privacy review, and store preparation.

- [ ] **Step 1: Draft privacy policy**

Include local data, backend sync, account deletion, crisis limitations, sensitive data notice, and Mexico-only emergency resources.

- [ ] **Step 2: Draft QA checklist**

Include Android physical device, iOS if in scope, offline crisis mode, no English template leftovers, deep links, phone links, accessibility labels, privacy/export/delete, and backend auth checks.

- [ ] **Step 3: Draft clinical review checklist**

Include safety wording, crisis criteria, severity result copy, exercise contraindications, consent, data collection, and store listing disclaimers.

- [ ] **Step 4: Update README**

Add backend architecture, crisis mode, Azure SQL choice, local-first behavior, verification commands, and store-readiness status.

- [ ] **Step 5: Verify documentation links**

Run: `rg -n "TODO|TBD|FIXME|This screen does not exist|Go to home screen" README.md docs app`

Expected: no unresolved placeholders or English template leftovers.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/store-readiness
git commit -m "docs: add thesis and store readiness checklists"
```

## Final Verification

- [ ] Run mobile verification:

```bash
npm run test:assessment
node --test tests/localStorage.test.cjs tests/crisisRouting.test.cjs tests/consent.test.cjs tests/syncQueue.test.cjs
npx tsc --noEmit
npm run lint
npx expo export --platform web --output-dir dist
```

- [ ] Run backend verification:

```bash
cd backend
npm run build
npm test
```

- [ ] Run manual crisis QA on a device or simulator:

Open home, tap urgent help, verify `/crisis`, 911 action, Linea de la Vida action, trusted contact state, safety checklist, and optional grounding.

- [ ] Run manual severe-flow QA:

Complete assessment with safe answer, distress 9, severe PHQ-4 values, and verify crisis support appears before exercise recommendations.

- [ ] Run manual sync QA:

Create records offline, log in, restore network, sync records, retry after simulated failure, and verify no duplicates.

- [ ] Final commit:

```bash
git status --short
git commit -m "chore: verify crisis backend store readiness"
```

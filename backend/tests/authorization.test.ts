import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { buildServer } from '../src/server.js';

Object.assign(process.env, { NODE_ENV: 'test' });

const server = buildServer({ logger: false });

const auth = (userId: string) => ({
  authorization: `Bearer ${userId}`
});

async function injectAs(userId: string, method: 'DELETE' | 'GET' | 'POST' | 'PUT', url: string, payload?: object) {
  const response = await server.inject({
    method,
    url,
    headers: auth(userId),
    payload
  });
  return response;
}

before(async () => {
  await server.ready();
});

after(async () => {
  await server.close();
});

test('user data endpoints reject anonymous access', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/me/assessments'
  });

  assert.equal(response.statusCode, 401);
});

test('users only read their own assessment, follow-up, emotion, export, and deletion records', async () => {
  await injectAs('user-b', 'POST', '/me/consents', {
    version: '2026-10-02-mx-local-sync-readiness',
    scope: 'backend_sync'
  });
  await injectAs('user-b', 'POST', '/me/assessments', {
    clientId: 'assessment-b',
    safetyAnswer: 'safe',
    distressBefore: 4,
    phq4Score: 3,
    anxietyScore: 2,
    depressionScore: 1,
    primaryNeed: 'calma',
    level: 'leve',
    emergency: false
  });
  await injectAs('user-b', 'POST', '/me/exercise-follow-ups', {
    clientId: 'follow-b',
    exerciseId: 'grounding',
    distressBefore: 5,
    distressAfter: 3,
    delta: -2,
    helpfulRating: 4
  });
  await injectAs('user-b', 'POST', '/me/custom-exercises', {
    clientId: 'custom-b',
    title: 'Respirar con calma',
    description: 'Una practica breve',
    steps: ['Inhala', 'Exhala'],
    createdAt: '2026-10-03T00:00:00.000Z'
  });
  await injectAs('user-b', 'POST', '/me/emotion-logs', {
    clientId: 'emotion-b',
    logDate: '2026-10-02T00:00:00.000Z',
    emotion: 'Calma'
  });
  await injectAs('user-b', 'POST', '/me/export-events');
  await injectAs('user-b', 'POST', '/me/deletion-requests');

  for (const url of [
    '/me/assessments',
    '/me/custom-exercises',
    '/me/exercise-follow-ups',
    '/me/emotion-logs',
    '/me/export-events',
    '/me/deletion-requests'
  ]) {
    const response = await injectAs('user-a', 'GET', url);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), []);
  }
});

test('users cannot read or update another user singleton resources', async () => {
  await injectAs('user-b', 'POST', '/me/consents', {
    version: '2026-10-02-mx-local-sync-readiness',
    scope: 'backend_sync'
  });
  await injectAs('user-b', 'PUT', '/me/safety-plan', {
    warningSigns: true,
    internalCoping: true,
    safePeoplePlaces: true,
    trustedContact: true,
    professionalHelp: true,
    saferEnvironment: false
  });
  await injectAs('user-b', 'PUT', '/me/trusted-contact', {
    name: 'Persona de confianza',
    phoneE164: '+528009112000'
  });

  assert.equal((await injectAs('user-a', 'GET', '/me/safety-plan')).statusCode, 404);
  assert.equal((await injectAs('user-a', 'GET', '/me/trusted-contact')).statusCode, 404);

  const ownerSafetyPlan = await injectAs('user-b', 'GET', '/me/safety-plan');
  const ownerTrustedContact = await injectAs('user-b', 'GET', '/me/trusted-contact');

  assert.equal(ownerSafetyPlan.statusCode, 200);
  assert.equal(ownerSafetyPlan.json().warningSigns, true);
  assert.equal(ownerSafetyPlan.json().professionalHelp, true);
  assert.equal(ownerSafetyPlan.json().saferEnvironment, false);
  assert.equal(ownerTrustedContact.statusCode, 200);
  assert.equal(ownerTrustedContact.json().phoneE164, '+528009112000');
});

test('users can delete only their own trusted contact', async () => {
  await injectAs('user-delete-contact', 'POST', '/me/consents', {
    version: '2026-10-02-mx-local-sync-readiness',
    scope: 'backend_sync'
  });
  await injectAs('other-user', 'POST', '/me/consents', {
    version: '2026-10-02-mx-local-sync-readiness',
    scope: 'backend_sync'
  });
  await injectAs('user-delete-contact', 'PUT', '/me/trusted-contact', {
    name: 'Persona de confianza',
    phoneE164: '+528009112000'
  });

  const ownerBeforeDelete = await injectAs('user-delete-contact', 'GET', '/me/trusted-contact');
  assert.equal(ownerBeforeDelete.statusCode, 200);

  const anotherUserDelete = await injectAs('other-user', 'DELETE', '/me/trusted-contact');
  assert.equal(anotherUserDelete.statusCode, 204);

  const ownerStillHasContact = await injectAs('user-delete-contact', 'GET', '/me/trusted-contact');
  assert.equal(ownerStillHasContact.statusCode, 200);

  const ownerDelete = await injectAs('user-delete-contact', 'DELETE', '/me/trusted-contact');
  assert.equal(ownerDelete.statusCode, 204);

  const ownerAfterDelete = await injectAs('user-delete-contact', 'GET', '/me/trusted-contact');
  assert.equal(ownerAfterDelete.statusCode, 404);
});

test('sensitive data writes require accepted backend sync consent', async () => {
  const denied = await injectAs('user-no-consent', 'POST', '/me/assessments', {
    clientId: 'assessment-no-consent',
    safetyAnswer: 'safe',
    distressBefore: 4,
    phq4Score: 3,
    anxietyScore: 2,
    depressionScore: 1,
    primaryNeed: 'calma',
    level: 'leve',
    emergency: false
  });

  assert.equal(denied.statusCode, 403);

  await injectAs('user-with-consent', 'POST', '/me/consents', {
    version: '2026-10-02-mx-local-sync-readiness',
    scope: 'backend_sync'
  });
  const allowed = await injectAs('user-with-consent', 'POST', '/me/assessments', {
    clientId: 'assessment-with-consent',
    safetyAnswer: 'safe',
    distressBefore: 4,
    phq4Score: 3,
    anxietyScore: 2,
    depressionScore: 1,
    primaryNeed: 'calma',
    level: 'leve',
    emergency: false
  });

  assert.equal(allowed.statusCode, 201);
});

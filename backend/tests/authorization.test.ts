import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { buildServer } from '../src/server.js';

process.env.NODE_ENV = 'test';

const server = buildServer({ logger: false });

const auth = (userId: string) => ({
  authorization: `Bearer ${userId}`
});

async function injectAs(userId: string, method: 'GET' | 'POST' | 'PUT', url: string, payload?: object) {
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
  await injectAs('user-b', 'POST', '/me/emotion-logs', {
    clientId: 'emotion-b',
    logDate: '2026-10-02T00:00:00.000Z',
    emotion: 'Calma'
  });
  await injectAs('user-b', 'POST', '/me/export-events');
  await injectAs('user-b', 'POST', '/me/deletion-requests');

  for (const url of [
    '/me/assessments',
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
    safePlace: true,
    canContact: true,
    trustedContact: true,
    urgentHelp: false
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
  assert.equal(ownerTrustedContact.statusCode, 200);
  assert.equal(ownerTrustedContact.json().phoneE164, '+528009112000');
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

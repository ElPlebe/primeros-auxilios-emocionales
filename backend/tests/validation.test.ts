import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { buildServer } from '../src/server.js';

Object.assign(process.env, { NODE_ENV: 'test' });

const server = buildServer({ logger: false });

const headers = {
  authorization: 'Bearer validation-user'
};

async function post(url: string, payload: object) {
  const response = await server.inject({
    method: 'POST',
    url,
    headers,
    payload
  });
  return response;
}

before(async () => {
  await server.ready();
  await server.inject({
    method: 'POST',
    url: '/me/consents',
    headers,
    payload: {
      version: '2026-10-02-mx-local-sync-readiness',
      scope: 'backend_sync'
    }
  });
});

after(async () => {
  await server.close();
});

test('rejects invalid assessment enum and range values', async () => {
  const invalidEnum = await post('/me/assessments', {
    clientId: 'bad-assessment-1',
    safetyAnswer: 'maybe',
    distressBefore: 4,
    phq4Score: 3,
    anxietyScore: 2,
    depressionScore: 1,
    primaryNeed: 'calma',
    level: 'leve',
    emergency: false
  });
  const invalidRange = await post('/me/assessments', {
    clientId: 'bad-assessment-2',
    safetyAnswer: 'safe',
    distressBefore: 11,
    phq4Score: 13,
    anxietyScore: 7,
    depressionScore: -1,
    primaryNeed: 'calma',
    level: 'leve',
    emergency: false
  });

  assert.equal(invalidEnum.statusCode, 400);
  assert.equal(invalidRange.statusCode, 400);
});

test('rejects invalid follow-up rating and distress values', async () => {
  const response = await post('/me/exercise-follow-ups', {
    clientId: 'bad-follow',
    exerciseId: 'grounding',
    distressBefore: -1,
    distressAfter: 12,
    delta: 13,
    helpfulRating: 6
  });

  assert.equal(response.statusCode, 400);
});

test('rejects malformed Mexico trusted-contact phone values', async () => {
  const response = await server.inject({
    method: 'PUT',
    url: '/me/trusted-contact',
    headers,
    payload: {
      name: 'Persona',
      phoneE164: '+12025550199'
    }
  });

  assert.equal(response.statusCode, 400);
});

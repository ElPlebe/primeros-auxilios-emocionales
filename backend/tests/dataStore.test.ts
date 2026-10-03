import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDataStore } from '../src/modules/data/dataStore.js';

const baseEnv = {
  authAudience: '',
  authIssuer: '',
  authJwksUrl: '',
  corsOrigins: [],
  port: 3000,
  rateLimitMax: 0,
  rateLimitWindowMs: 60_000
};

test('uses memory store only for test environment', () => {
  const store = createDataStore({
    ...baseEnv,
    databaseUrl: '',
    nodeEnv: 'test'
  });

  assert.equal(store.kind, 'memory');
});

test('uses Prisma store outside test when DATABASE_URL is configured', () => {
  const store = createDataStore({
    ...baseEnv,
    databaseUrl: 'sqlserver://localhost:1433;database=primeros_auxilios;user=sa;password=Pass;encrypt=true',
    nodeEnv: 'production'
  });

  assert.equal(store.kind, 'prisma');
});

test('requires DATABASE_URL outside test environment', () => {
  assert.throws(
    () =>
      createDataStore({
        ...baseEnv,
        databaseUrl: '',
        nodeEnv: 'production'
      }),
    /DATABASE_URL/
  );
});

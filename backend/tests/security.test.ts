import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';

process.env.NODE_ENV = 'test';

const servers: FastifyInstance[] = [];

function buildTestServer(options = {}) {
  const server = buildServer({
    logger: false,
    env: {
      authAudience: '',
      authIssuer: '',
      authJwksUrl: '',
      corsOrigins: ['https://app.example.test'],
      databaseUrl: '',
      nodeEnv: 'test',
      port: 3000,
      rateLimitMax: 0,
      rateLimitWindowMs: 60_000,
      ...options
    }
  });
  servers.push(server);
  return server;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

test('adds baseline security headers to responses', async () => {
  const server = buildTestServer();
  const response = await server.inject({ method: 'GET', url: '/health' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'DENY');
  assert.equal(response.headers['referrer-policy'], 'no-referrer');
});

test('allows configured CORS origins and rejects unknown preflight origins', async () => {
  const server = buildTestServer();

  const allowed = await server.inject({
    method: 'OPTIONS',
    url: '/me/assessments',
    headers: {
      origin: 'https://app.example.test',
      'access-control-request-method': 'POST'
    }
  });

  const rejected = await server.inject({
    method: 'OPTIONS',
    url: '/me/assessments',
    headers: {
      origin: 'https://evil.example.test',
      'access-control-request-method': 'POST'
    }
  });

  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://app.example.test');
  assert.equal(rejected.statusCode, 403);
});

test('rate limits authenticated data endpoints when configured', async () => {
  const server = buildTestServer({ rateLimitMax: 2 });

  const first = await server.inject({
    method: 'GET',
    url: '/me/assessments',
    headers: { authorization: 'Bearer rate-user' }
  });
  const second = await server.inject({
    method: 'GET',
    url: '/me/assessments',
    headers: { authorization: 'Bearer rate-user' }
  });
  const third = await server.inject({
    method: 'GET',
    url: '/me/assessments',
    headers: { authorization: 'Bearer rate-user' }
  });

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(third.statusCode, 429);
  assert.equal(third.headers['retry-after'], '60');
});

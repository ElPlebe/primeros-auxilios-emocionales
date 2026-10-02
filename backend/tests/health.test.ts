import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { buildServer } from '../src/server.js';

const server = buildServer({ logger: false });

after(async () => {
  await server.close();
});

test('GET /health returns ok', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/health'
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
});

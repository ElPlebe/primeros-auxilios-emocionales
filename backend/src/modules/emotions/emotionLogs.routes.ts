import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { createId, listForUser, memoryStore, upsertByClientId } from '../data/memoryStore.js';
import { asBody, optionalString, requireString } from '../validation/validators.js';

export async function registerEmotionLogRoutes(server: FastifyInstance) {
  server.get('/me/emotion-logs', async (request) => {
    const user = requireUser(request);
    return listForUser(memoryStore.emotionLogs, user.id);
  });

  server.post('/me/emotion-logs', async (request, reply) => {
    const user = requireUser(request);
    const body = asBody(request.body);
    const records = listForUser(memoryStore.emotionLogs, user.id);
    const record = upsertByClientId(records, {
      id: createId('emotion'),
      userId: user.id,
      clientId: requireString(body, 'clientId', 80),
      logDate: requireString(body, 'logDate', 40),
      emotion: requireString(body, 'emotion', 40),
      createdAt: optionalString(body, 'createdAt') ?? new Date().toISOString()
    });

    memoryStore.emotionLogs.set(user.id, records);
    return reply.code(201).send(record);
  });
}

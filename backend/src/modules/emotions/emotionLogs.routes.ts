import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { createId } from '../data/memoryStore.js';
import { asBody, optionalString, requireString } from '../validation/validators.js';

export async function registerEmotionLogRoutes(server: FastifyInstance) {
  server.get('/me/emotion-logs', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listEmotionLogs(user.id);
  });

  server.post('/me/emotion-logs', async (request, reply) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const record = await getDataStore().saveEmotionLog({
      id: createId('emotion'),
      userId: user.id,
      clientId: requireString(body, 'clientId', 80),
      logDate: requireString(body, 'logDate', 40),
      emotion: requireString(body, 'emotion', 40),
      createdAt: optionalString(body, 'createdAt') ?? new Date().toISOString()
    });
    return reply.code(201).send(record);
  });
}

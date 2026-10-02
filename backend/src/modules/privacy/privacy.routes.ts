import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { getDataStore } from '../data/dataStore.js';
import { createId } from '../data/memoryStore.js';

export async function registerPrivacyRoutes(server: FastifyInstance) {
  server.get('/me/export-events', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listExportEvents(user.id);
  });

  server.post('/me/export-events', async (request, reply) => {
    const user = await requireUser(request);
    const record = await getDataStore().saveExportEvent({
      id: createId('export'),
      userId: user.id,
      createdAt: new Date().toISOString()
    });
    return reply.code(201).send(record);
  });

  server.get('/me/deletion-requests', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listDeletionRequests(user.id);
  });

  server.post('/me/deletion-requests', async (request, reply) => {
    const user = await requireUser(request);
    const record = await getDataStore().saveDeletionRequest({
      id: createId('deletion'),
      userId: user.id,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      completedAt: null
    });
    return reply.code(201).send(record);
  });
}

import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { createId, listForUser, memoryStore } from '../data/memoryStore.js';

export async function registerPrivacyRoutes(server: FastifyInstance) {
  server.get('/me/export-events', async (request) => {
    const user = requireUser(request);
    return listForUser(memoryStore.exportEvents, user.id);
  });

  server.post('/me/export-events', async (request, reply) => {
    const user = requireUser(request);
    const records = listForUser(memoryStore.exportEvents, user.id);
    const record = {
      id: createId('export'),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    records.unshift(record);
    memoryStore.exportEvents.set(user.id, records);
    return reply.code(201).send(record);
  });

  server.get('/me/deletion-requests', async (request) => {
    const user = requireUser(request);
    return listForUser(memoryStore.deletionRequests, user.id);
  });

  server.post('/me/deletion-requests', async (request, reply) => {
    const user = requireUser(request);
    const records = listForUser(memoryStore.deletionRequests, user.id);
    const record = {
      id: createId('deletion'),
      userId: user.id,
      status: 'requested',
      requestedAt: new Date().toISOString(),
      completedAt: null
    };

    records.unshift(record);
    memoryStore.deletionRequests.set(user.id, records);
    return reply.code(201).send(record);
  });
}

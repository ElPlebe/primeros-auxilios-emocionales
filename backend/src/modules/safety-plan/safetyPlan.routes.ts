import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { memoryStore } from '../data/memoryStore.js';
import { asBody, requireBoolean } from '../validation/validators.js';

export async function registerSafetyPlanRoutes(server: FastifyInstance) {
  server.get('/me/safety-plan', async (request, reply) => {
    const user = requireUser(request);
    const record = memoryStore.safetyPlans.get(user.id);
    if (!record) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return record;
  });

  server.put('/me/safety-plan', async (request) => {
    const user = requireUser(request);
    const body = asBody(request.body);
    const record = {
      userId: user.id,
      safePlace: requireBoolean(body, 'safePlace'),
      canContact: requireBoolean(body, 'canContact'),
      trustedContact: requireBoolean(body, 'trustedContact'),
      urgentHelp: requireBoolean(body, 'urgentHelp'),
      updatedAt: new Date().toISOString()
    };

    memoryStore.safetyPlans.set(user.id, record);
    return record;
  });
}

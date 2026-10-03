import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { createId } from '../data/memoryStore.js';
import { asBody, optionalString, requireString, requireStringArray } from '../validation/validators.js';

export async function registerCustomExerciseRoutes(server: FastifyInstance) {
  server.get('/me/custom-exercises', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listCustomExercises(user.id);
  });

  server.post('/me/custom-exercises', async (request, reply) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const record = await getDataStore().saveCustomExercise({
      id: createId('custom_exercise'),
      userId: user.id,
      clientId: requireString(body, 'clientId', 80),
      title: requireString(body, 'title', 120),
      description: requireString(body, 'description', 500),
      steps: requireStringArray(body, 'steps', 12, 240),
      createdAt: optionalString(body, 'createdAt') ?? new Date().toISOString()
    });
    return reply.code(201).send(record);
  });
}

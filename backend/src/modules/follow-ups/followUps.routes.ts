import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { createId } from '../data/memoryStore.js';
import {
  asBody,
  optionalIntegerInRange,
  optionalString,
  requireIntegerInRange,
  requireString
} from '../validation/validators.js';

export async function registerFollowUpRoutes(server: FastifyInstance) {
  server.get('/me/exercise-follow-ups', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listFollowUps(user.id);
  });

  server.post('/me/exercise-follow-ups', async (request, reply) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const distressBefore = requireIntegerInRange(body, 'distressBefore', 0, 10);
    const distressAfter = requireIntegerInRange(body, 'distressAfter', 0, 10);
    const record = await getDataStore().saveFollowUp({
      id: createId('followup'),
      userId: user.id,
      clientId: requireString(body, 'clientId', 80),
      exerciseId: requireString(body, 'exerciseId', 80),
      assessmentId: optionalString(body, 'assessmentId', 80),
      distressBefore,
      distressAfter,
      delta: requireIntegerInRange(body, 'delta', -10, 10),
      helpfulRating: optionalIntegerInRange(body, 'helpfulRating', 1, 5),
      helpfulComment: optionalString(body, 'helpfulComment', 500),
      createdAt: optionalString(body, 'createdAt') ?? new Date().toISOString()
    });
    return reply.code(201).send(record);
  });
}

import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { createId } from '../data/memoryStore.js';
import {
  asBody,
  optionalString,
  requireBoolean,
  requireDistressLevel,
  requireIntegerInRange,
  requireSafetyAnswer,
  requireString,
  requireSupportNeed
} from '../validation/validators.js';

export async function registerAssessmentRoutes(server: FastifyInstance) {
  server.get('/me/assessments', async (request) => {
    const user = await requireUser(request);
    return getDataStore().listAssessments(user.id);
  });

  server.post('/me/assessments', async (request, reply) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const record = await getDataStore().saveAssessment({
      id: createId('assessment'),
      userId: user.id,
      clientId: requireString(body, 'clientId', 80),
      safetyAnswer: requireSafetyAnswer(body),
      distressBefore: requireIntegerInRange(body, 'distressBefore', 0, 10),
      phq4Score: requireIntegerInRange(body, 'phq4Score', 0, 12),
      anxietyScore: requireIntegerInRange(body, 'anxietyScore', 0, 6),
      depressionScore: requireIntegerInRange(body, 'depressionScore', 0, 6),
      primaryNeed: requireSupportNeed(body),
      level: requireDistressLevel(body),
      emergency: requireBoolean(body, 'emergency'),
      createdAt: optionalString(body, 'createdAt') ?? new Date().toISOString()
    });
    return reply.code(201).send(record);
  });
}

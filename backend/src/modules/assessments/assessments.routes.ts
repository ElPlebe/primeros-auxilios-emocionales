import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { createId, listForUser, memoryStore, upsertByClientId } from '../data/memoryStore.js';
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
    const user = requireUser(request);
    return listForUser(memoryStore.assessments, user.id);
  });

  server.post('/me/assessments', async (request, reply) => {
    const user = requireUser(request);
    const body = asBody(request.body);
    const records = listForUser(memoryStore.assessments, user.id);
    const record = upsertByClientId(records, {
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

    memoryStore.assessments.set(user.id, records);
    return reply.code(201).send(record);
  });
}

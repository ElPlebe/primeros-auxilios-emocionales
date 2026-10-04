import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { asBody, requireBoolean } from '../validation/validators.js';

export async function registerSafetyPlanRoutes(server: FastifyInstance) {
  server.get('/me/safety-plan', async (request, reply) => {
    const user = await requireUser(request);
    const record = await getDataStore().getSafetyPlan(user.id);
    if (!record) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return record;
  });

  server.put('/me/safety-plan', async (request) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const record = await getDataStore().saveSafetyPlan({
      userId: user.id,
      warningSigns: requireBoolean(body, 'warningSigns'),
      internalCoping: requireBoolean(body, 'internalCoping'),
      safePeoplePlaces: requireBoolean(body, 'safePeoplePlaces'),
      trustedContact: requireBoolean(body, 'trustedContact'),
      professionalHelp: requireBoolean(body, 'professionalHelp'),
      saferEnvironment: requireBoolean(body, 'saferEnvironment'),
      updatedAt: new Date().toISOString()
    });
    return record;
  });
}

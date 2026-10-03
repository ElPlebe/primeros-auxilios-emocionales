import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { requireBackendSyncConsent } from '../consent/consentStore.js';
import { getDataStore } from '../data/dataStore.js';
import { asBody, requireMexicoPhoneE164, requireString } from '../validation/validators.js';

export async function registerTrustedContactRoutes(server: FastifyInstance) {
  server.get('/me/trusted-contact', async (request, reply) => {
    const user = await requireUser(request);
    const record = await getDataStore().getTrustedContact(user.id);
    if (!record) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return record;
  });

  server.put('/me/trusted-contact', async (request) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    const body = asBody(request.body);
    const existing = await getDataStore().getTrustedContact(user.id);
    const now = new Date().toISOString();
    const record = await getDataStore().saveTrustedContact({
      userId: user.id,
      name: requireString(body, 'name', 120),
      phoneE164: requireMexicoPhoneE164(body),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    });
    return record;
  });

  server.delete('/me/trusted-contact', async (request, reply) => {
    const user = await requireUser(request);
    await requireBackendSyncConsent(user.id);
    await getDataStore().deleteTrustedContact(user.id);
    return reply.code(204).send();
  });
}

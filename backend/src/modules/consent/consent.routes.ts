import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { asBody, requireString } from '../validation/validators.js';
import { recordUserConsent } from './consentStore.js';

const CURRENT_CONSENT = {
  version: '2026-10-02-mx-local-sync-readiness',
  scopes: ['app_scope', 'local_storage', 'backend_sync', 'sensitive_data', 'emergency_limits']
};

export async function registerConsentRoutes(server: FastifyInstance) {
  server.get('/consent/current', async () => CURRENT_CONSENT);

  server.post('/me/consents', async (request, reply) => {
    const user = await requireUser(request);
    const body = asBody(request.body);
    const version = requireString(body, 'version', 80);
    const scope = requireString(body, 'scope', 80);
    const record = {
      userId: user.id,
      version,
      scope,
      acceptedAt: new Date().toISOString()
    };

    await recordUserConsent(user.id, scope, version);
    return reply.code(201).send(record);
  });
}

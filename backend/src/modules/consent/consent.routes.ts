import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { asBody, requireString } from '../validation/validators.js';

const CURRENT_CONSENT = {
  version: '2026-10-02-mx-local-sync-readiness',
  scopes: ['app_scope', 'local_storage', 'backend_sync', 'sensitive_data', 'emergency_limits']
};

const acceptedConsents = new Map<string, unknown[]>();

export async function registerConsentRoutes(server: FastifyInstance) {
  server.get('/consent/current', async () => CURRENT_CONSENT);

  server.post('/me/consents', async (request, reply) => {
    const user = requireUser(request);
    const body = asBody(request.body);
    const version = requireString(body, 'version', 80);
    const scope = requireString(body, 'scope', 80);
    const records = acceptedConsents.get(user.id) ?? [];
    const record = {
      userId: user.id,
      version,
      scope,
      acceptedAt: new Date().toISOString()
    };

    records.push(record);
    acceptedConsents.set(user.id, records);
    return reply.code(201).send(record);
  });
}

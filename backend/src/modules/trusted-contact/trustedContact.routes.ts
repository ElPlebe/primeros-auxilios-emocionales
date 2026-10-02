import type { FastifyInstance } from 'fastify';
import { requireUser } from '../auth/auth.js';
import { memoryStore } from '../data/memoryStore.js';
import { asBody, requireMexicoPhoneE164, requireString } from '../validation/validators.js';

export async function registerTrustedContactRoutes(server: FastifyInstance) {
  server.get('/me/trusted-contact', async (request, reply) => {
    const user = requireUser(request);
    const record = memoryStore.trustedContacts.get(user.id);
    if (!record) {
      return reply.code(404).send({ error: 'Not found' });
    }
    return record;
  });

  server.put('/me/trusted-contact', async (request) => {
    const user = requireUser(request);
    const body = asBody(request.body);
    const existing = memoryStore.trustedContacts.get(user.id);
    const now = new Date().toISOString();
    const record = {
      userId: user.id,
      name: requireString(body, 'name', 120),
      phoneE164: requireMexicoPhoneE164(body),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    memoryStore.trustedContacts.set(user.id, record);
    return record;
  });
}

import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../../config/env.js';

interface RateBucket {
  count: number;
  resetAt: number;
}

export function registerSecurity(server: FastifyInstance, env: AppEnv) {
  const buckets = new Map<string, RateBucket>();

  server.addHook('onRequest', async (request, reply) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', 'no-referrer');

    const origin = request.headers.origin;
    if (typeof origin === 'string' && env.corsOrigins.includes(origin)) {
      reply.header('access-control-allow-origin', origin);
      reply.header('vary', 'Origin');
      reply.header('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
      reply.header('access-control-allow-headers', 'authorization,content-type');
    }

    if (request.method === 'OPTIONS') {
      if (typeof origin === 'string' && env.corsOrigins.length > 0 && !env.corsOrigins.includes(origin)) {
        return reply.code(403).send({ error: 'CORS origin not allowed' });
      }
      return reply.code(204).send();
    }

    if (env.rateLimitMax > 0 && request.url.startsWith('/me/')) {
      const key = `${request.ip}:${request.headers.authorization ?? 'anonymous'}`;
      const now = Date.now();
      const existing = buckets.get(key);
      const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + env.rateLimitWindowMs };
      bucket.count += 1;
      buckets.set(key, bucket);

      if (bucket.count > env.rateLimitMax) {
        const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        reply.header('retry-after', String(retryAfterSeconds));
        return reply.code(429).send({ error: 'Too many requests' });
      }
    }
  });
}

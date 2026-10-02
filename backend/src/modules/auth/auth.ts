import type { FastifyRequest } from 'fastify';
import { readEnv } from '../../config/env.js';

export interface AuthenticatedUser {
  email?: string;
  id: string;
}

export async function requireUser(request: FastifyRequest): Promise<AuthenticatedUser> {
  const header = request.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    const error = new Error('Unauthorized') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  if (process.env.NODE_ENV === 'test') {
    return { id: token };
  }

  const env = readEnv();
  if (!env.authAudience || !env.authIssuer || !env.authJwksUrl) {
    const error = new Error('Production auth verifier is not configured') as Error & { statusCode: number };
    error.statusCode = 500;
    throw error;
  }

  try {
    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    const jwks = createRemoteJWKSet(new URL(env.authJwksUrl));
    const { payload } = await jwtVerify(token, jwks, {
      audience: env.authAudience,
      issuer: env.authIssuer
    });
    const id = typeof payload.oid === 'string' ? payload.oid : payload.sub;
    if (!id) {
      throw new Error('Missing subject');
    }

    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload.preferred_username === 'string'
          ? payload.preferred_username
          : undefined;

    return { id, email };
  } catch {
    const error = new Error('Unauthorized') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
}

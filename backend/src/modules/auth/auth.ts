import type { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
}

export function requireUser(request: FastifyRequest): AuthenticatedUser {
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

  const error = new Error('Production auth verifier is not configured') as Error & { statusCode: number };
  error.statusCode = 401;
  throw error;
}

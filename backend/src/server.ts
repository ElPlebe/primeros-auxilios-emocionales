import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { readEnv } from './config/env.js';
import { registerHealthRoutes } from './modules/health/health.routes.js';

interface BuildServerOptions {
  logger?: boolean;
}

export function buildServer(options: BuildServerOptions = {}) {
  const env = readEnv();
  const server = Fastify({
    logger: options.logger ?? env.nodeEnv !== 'test'
  });

  server.register(registerHealthRoutes);

  return server;
}

async function start() {
  const env = readEnv();
  const server = buildServer();

  await server.listen({
    host: '0.0.0.0',
    port: env.port
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

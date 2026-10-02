import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { readEnv } from './config/env.js';
import { registerAssessmentRoutes } from './modules/assessments/assessments.routes.js';
import { registerConsentRoutes } from './modules/consent/consent.routes.js';
import { registerEmotionLogRoutes } from './modules/emotions/emotionLogs.routes.js';
import { registerFollowUpRoutes } from './modules/follow-ups/followUps.routes.js';
import { registerHealthRoutes } from './modules/health/health.routes.js';
import { registerPrivacyRoutes } from './modules/privacy/privacy.routes.js';
import { registerSafetyPlanRoutes } from './modules/safety-plan/safetyPlan.routes.js';
import { registerTrustedContactRoutes } from './modules/trusted-contact/trustedContact.routes.js';

interface BuildServerOptions {
  logger?: boolean;
}

export function buildServer(options: BuildServerOptions = {}) {
  const env = readEnv();
  const server = Fastify({
    logger: options.logger ?? env.nodeEnv !== 'test'
  });

  server.register(registerHealthRoutes);
  server.register(registerConsentRoutes);
  server.register(registerAssessmentRoutes);
  server.register(registerFollowUpRoutes);
  server.register(registerEmotionLogRoutes);
  server.register(registerSafetyPlanRoutes);
  server.register(registerTrustedContactRoutes);
  server.register(registerPrivacyRoutes);

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

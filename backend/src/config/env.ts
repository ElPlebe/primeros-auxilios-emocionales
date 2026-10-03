export interface AppEnv {
  authAudience: string;
  authIssuer: string;
  authJwksUrl: string;
  corsOrigins: string[];
  databaseUrl: string;
  nodeEnv: string;
  port: number;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

export function readEnv(source = process.env): AppEnv {
  const nodeEnv = source.NODE_ENV ?? 'development';
  return {
    authAudience: source.AUTH_AUDIENCE ?? source.ENTRA_CLIENT_ID ?? '',
    authIssuer: source.AUTH_ISSUER ?? '',
    authJwksUrl: source.AUTH_JWKS_URL ?? '',
    corsOrigins: parseList(source.CORS_ORIGINS),
    databaseUrl: source.DATABASE_URL ?? '',
    nodeEnv,
    port: Number(source.PORT ?? 3000),
    rateLimitMax: Number(source.RATE_LIMIT_MAX ?? (nodeEnv === 'test' ? 0 : 120)),
    rateLimitWindowMs: Number(source.RATE_LIMIT_WINDOW_MS ?? 60_000)
  };
}

function parseList(value: string | undefined) {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

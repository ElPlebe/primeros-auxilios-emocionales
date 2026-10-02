export interface AppEnv {
  authAudience: string;
  authIssuer: string;
  authJwksUrl: string;
  databaseUrl: string;
  nodeEnv: string;
  port: number;
}

export function readEnv(source = process.env): AppEnv {
  return {
    authAudience: source.AUTH_AUDIENCE ?? source.ENTRA_CLIENT_ID ?? '',
    authIssuer: source.AUTH_ISSUER ?? '',
    authJwksUrl: source.AUTH_JWKS_URL ?? '',
    databaseUrl: source.DATABASE_URL ?? '',
    nodeEnv: source.NODE_ENV ?? 'development',
    port: Number(source.PORT ?? 3000)
  };
}

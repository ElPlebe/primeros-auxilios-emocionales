export interface AppEnv {
  databaseUrl: string;
  nodeEnv: string;
  port: number;
}

export function readEnv(source = process.env): AppEnv {
  return {
    databaseUrl: source.DATABASE_URL ?? '',
    nodeEnv: source.NODE_ENV ?? 'development',
    port: Number(source.PORT ?? 3000)
  };
}

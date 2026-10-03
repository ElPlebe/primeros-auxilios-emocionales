export const AUTH0_DEFAULTS = {
  audience: 'https://primeros-auxilios-emocionales-api',
  clientId: 'bnx3HhBHBp0Jk0nzbZUrzamcWFnibVkh',
  domain: 'dev-hqmwn1jxx5kcopc4.us.auth0.com',
  redirectUri: 'primerosauxiliosemocionales://auth'
};

type Auth0Env = Partial<Record<string, string | undefined>>;
declare const process: { env?: Auth0Env } | undefined;

export interface Auth0Config {
  audience: string;
  clientId: string;
  discovery: {
    authorizationEndpoint: string;
    issuer: string;
    revocationEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint: string;
  };
  domain: string;
  issuer: string;
  jwksUrl: string;
  redirectUri: string;
}

export function buildAuth0Config(env: Auth0Env = getRuntimeEnv()): Auth0Config {
  const domain = normalizeDomain(env.EXPO_PUBLIC_AUTH0_DOMAIN ?? AUTH0_DEFAULTS.domain);
  const issuer = `https://${domain}/`;
  const audience = env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? AUTH0_DEFAULTS.audience;
  const clientId = env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? AUTH0_DEFAULTS.clientId;
  const redirectUri = env.EXPO_PUBLIC_AUTH0_REDIRECT_URI ?? AUTH0_DEFAULTS.redirectUri;

  return {
    audience,
    clientId,
    discovery: {
      authorizationEndpoint: `${issuer}authorize`,
      issuer,
      revocationEndpoint: `${issuer}oauth/revoke`,
      tokenEndpoint: `${issuer}oauth/token`,
      userInfoEndpoint: `${issuer}userinfo`
    },
    domain,
    issuer,
    jwksUrl: `${issuer}.well-known/jwks.json`,
    redirectUri
  };
}

export function buildBackendAuthEnv(config = buildAuth0Config()) {
  return {
    AUTH_AUDIENCE: config.audience,
    AUTH_ISSUER: config.issuer,
    AUTH_JWKS_URL: config.jwksUrl
  };
}

function normalizeDomain(value: string) {
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function getRuntimeEnv(): Auth0Env {
  return typeof process !== 'undefined' ? (process.env ?? {}) : {};
}

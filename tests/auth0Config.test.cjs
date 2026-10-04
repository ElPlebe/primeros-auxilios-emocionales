/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.auth0-config-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileAuth0Config() {
  rmSync(outDir, { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [
      tscBin,
      '--target',
      'es2020',
      '--module',
      'commonjs',
      '--moduleResolution',
      'node',
      '--esModuleInterop',
      '--skipLibCheck',
      '--outDir',
      outDir,
      'services/auth/auth0Config.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return require(path.join(outDir, 'auth0Config.js'));
}

test('builds Auth0 mobile and backend configuration from the project defaults', () => {
  const { AUTH0_DEFAULTS, buildAuth0Config, buildBackendAuthEnv } = compileAuth0Config();
  const config = buildAuth0Config();

  assert.equal(AUTH0_DEFAULTS.domain, 'dev-hqmwn1jxx5kcopc4.us.auth0.com');
  assert.equal(config.clientId, 'bnx3HhBHBp0Jk0nzbZUrzamcWFnibVkh');
  assert.equal(config.audience, 'https://primeros-auxilios-emocionales-api');
  assert.equal(config.redirectUri, 'primerosauxiliosemocionales:///auth');
  assert.equal(config.issuer, 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/');
  assert.equal(config.discovery.issuer, config.issuer);
  assert.equal(config.discovery.authorizationEndpoint, 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/authorize');
  assert.equal(config.discovery.tokenEndpoint, 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/oauth/token');
  assert.equal(config.discovery.revocationEndpoint, 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/oauth/revoke');
  assert.equal(config.discovery.userInfoEndpoint, 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/userinfo');

  assert.deepEqual(buildBackendAuthEnv(config), {
    AUTH_AUDIENCE: 'https://primeros-auxilios-emocionales-api',
    AUTH_ISSUER: 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/',
    AUTH_JWKS_URL: 'https://dev-hqmwn1jxx5kcopc4.us.auth0.com/.well-known/jwks.json'
  });
});

test('normalizes Auth0 domain and issuer when env values include protocol or missing slash', () => {
  const { buildAuth0Config } = compileAuth0Config();

  const config = buildAuth0Config({
    EXPO_PUBLIC_AUTH0_DOMAIN: 'https://example.us.auth0.com/',
    EXPO_PUBLIC_AUTH0_CLIENT_ID: 'client',
    EXPO_PUBLIC_AUTH0_AUDIENCE: 'api',
    EXPO_PUBLIC_AUTH0_REDIRECT_URI: 'myapp://auth'
  });

  assert.equal(config.domain, 'example.us.auth0.com');
  assert.equal(config.issuer, 'https://example.us.auth0.com/');
});

test('allows runtime redirect URI to override local env values for Expo Go', () => {
  const { buildAuth0Config } = compileAuth0Config();

  const config = buildAuth0Config(
    {
      EXPO_PUBLIC_AUTH0_REDIRECT_URI: 'primerosauxiliosemocionales:///auth'
    },
    'exp://192.168.68.53:8081/--/auth'
  );

  assert.equal(config.redirectUri, 'exp://192.168.68.53:8081/--/auth');
});

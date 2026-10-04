/* global __dirname */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');

test('Auth0 callback route exists and completes the mobile redirect flow', () => {
  const callbackRoute = readFileSync(path.join(rootDir, 'app', 'auth.tsx'), 'utf8');
  const accountScreen = readFileSync(path.join(rootDir, 'app', 'account', 'index.tsx'), 'utf8');
  const nativeIntent = readFileSync(path.join(rootDir, 'app', '+native-intent.tsx'), 'utf8');
  const notFoundRoute = readFileSync(path.join(rootDir, 'app', '+not-found.tsx'), 'utf8');

  assert.match(callbackRoute, /useLocalSearchParams/);
  assert.match(callbackRoute, /getPendingAuth0Request/);
  assert.match(callbackRoute, /exchangeCodeAsync/);
  assert.match(callbackRoute, /router\.replace\(['"]\/account['"]\)/);
  assert.match(callbackRoute, /callbackState !== pendingRequest\.state/);

  assert.match(accountScreen, /savePendingAuth0Request/);
  assert.match(accountScreen, /request\.codeVerifier/);

  assert.match(nativeIntent, /redirectSystemPath/);
  assert.match(nativeIntent, /normalizeAuthCallbackPath/);
  assert.match(nativeIntent, /\/auth/);
  assert.match(nativeIntent, /URLSearchParams/);

  assert.match(notFoundRoute, /getInitialURL/);
  assert.match(notFoundRoute, /normalizeAuthCallbackPath/);
  assert.match(notFoundRoute, /router\.replace/);
});

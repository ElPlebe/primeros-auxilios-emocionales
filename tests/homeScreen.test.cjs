/* global __dirname */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const homeScreenPath = path.join(rootDir, 'app', '(tabs)', 'index.tsx');

test('home screen exposes account login and sync entry point', () => {
  const screen = readFileSync(homeScreenPath, 'utf8');

  assert.match(screen, /Cuenta y sincronizaci[oó]n/);
  assert.match(screen, /router\.push\(['"]\/account['"]\)/);
});

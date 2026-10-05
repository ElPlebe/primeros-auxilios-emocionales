/* global __dirname */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const homeScreenPath = path.join(rootDir, 'app', '(tabs)', 'index.tsx');
const consentScreenPath = path.join(rootDir, 'app', '(tabs)', 'consent.tsx');
const privacyDataScreenPath = path.join(rootDir, 'app', '(tabs)', 'privacy-data.tsx');

test('home screen exposes a user-facing Google progress entry point near core actions', () => {
  const screen = readFileSync(homeScreenPath, 'utf8');

  assert.match(screen, /Guardar mi progreso con Google/);
  assert.match(screen, /router\.push\(['"]\/account['"]\)/);
});

test('home screen does not expose thesis or clinic summary to general users', () => {
  const screen = readFileSync(homeScreenPath, 'utf8');

  assert.doesNotMatch(screen, /Resumen para tesis\/cl[ií]nica/);
  assert.doesNotMatch(screen, /router\.push\(['"]\.\.\/summary['"]\)/);
});

test('first-run consent screen offers urgent help, Google login, and guest mode', () => {
  const screen = readFileSync(consentScreenPath, 'utf8');

  assert.match(screen, /Primeros Auxilios Emocionales/);
  assert.match(screen, /Iniciar sesi[oó]n con Google/);
  assert.match(screen, /Continuar sin cuenta/);
  assert.match(screen, /handleAccept\(['"]\/account['"]\)/);
  assert.match(screen, /router\.replace\(['"]\/crisis['"]\)/);
});

test('privacy screen gates thesis and clinic summary behind research tools flag', () => {
  const screen = readFileSync(privacyDataScreenPath, 'utf8');

  assert.match(screen, /isResearchToolsEnabled/);
  assert.match(screen, /Ver resumen para tesis\/cl[ií]nica/);
});

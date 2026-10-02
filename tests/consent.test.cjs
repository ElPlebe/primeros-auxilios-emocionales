const assert = require('node:assert/strict');
const { mkdirSync, rmSync } = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

const outDir = '.consent-test-dist';

function compileConsentContent() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const result = ts.transpileModule(
    require('node:fs').readFileSync('features/privacy/consentContent.ts', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020
      }
    }
  );

  require('node:fs').writeFileSync(`${outDir}/consentContent.cjs`, result.outputText);
  return require(`../${outDir}/consentContent.cjs`);
}

test('defines versioned consent scopes for local use and future sync', () => {
  const { CONSENT_SCOPES, CONSENT_VERSION } = compileConsentContent();

  assert.deepEqual(CONSENT_SCOPES, [
    'app_scope',
    'local_storage',
    'backend_sync',
    'sensitive_data',
    'emergency_limits'
  ]);
  assert.match(CONSENT_VERSION, /^2026-/);
});

test('explains that backend sync is optional until account login exists', () => {
  const { CONSENT_COPY } = compileConsentContent();

  assert.match(CONSENT_COPY.backendSync.body, /opcional/i);
  assert.match(CONSENT_COPY.backendSync.body, /cuenta/i);
  assert.match(CONSENT_COPY.emergencyLimits.body, /no reemplaza/i);
});

test('normalizes legacy timestamp consent into current metadata', () => {
  const { CONSENT_SCOPES, CONSENT_VERSION, normalizeConsentRecord } = compileConsentContent();
  const acceptedAt = '2026-10-02T12:00:00.000Z';

  assert.deepEqual(normalizeConsentRecord(acceptedAt), {
    acceptedAt,
    version: CONSENT_VERSION,
    scopes: CONSENT_SCOPES
  });
  assert.equal(normalizeConsentRecord(null), null);
});

test('does not treat malformed consent storage as accepted legacy consent', () => {
  const { normalizeConsentRecord } = compileConsentContent();

  assert.equal(normalizeConsentRecord('[bad'), null);
  assert.equal(normalizeConsentRecord('not-a-date'), null);
});

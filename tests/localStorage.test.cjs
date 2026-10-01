/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.local-json-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

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
    'utils/localJson.ts'
  ],
  { cwd: rootDir, stdio: 'inherit' }
);

const localJson = require(path.join(outDir, 'localJson.js'));

test('returns safe array fallbacks for missing, invalid, or non-array JSON', () => {
  assert.deepEqual(localJson.parseJsonArray(null), []);
  assert.deepEqual(localJson.parseJsonArray('[bad'), []);
  assert.deepEqual(localJson.parseJsonArray('{"not":"array"}'), []);
  assert.deepEqual(localJson.parseJsonArray('["ok"]'), ['ok']);
});

test('returns object fallback for missing, invalid, array, or primitive JSON', () => {
  const fallback = { ok: true };

  assert.deepEqual(localJson.parseJsonObject(null, fallback), fallback);
  assert.deepEqual(localJson.parseJsonObject('[bad', fallback), fallback);
  assert.deepEqual(localJson.parseJsonObject('["not-object"]', fallback), fallback);
  assert.deepEqual(localJson.parseJsonObject('"nope"', fallback), fallback);
  assert.deepEqual(localJson.parseJsonObject('{"ok":false}', fallback), { ok: false });
});

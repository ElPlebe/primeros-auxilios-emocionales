/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const Module = require('node:module');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.storage-consent-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileStorage() {
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
      'utils/storage.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return require(path.join(outDir, 'utils', 'storage.js'));
}

test('accepting consent stores local consent and queues backend sync consent', async () => {
  const items = new Map();
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === '@react-native-async-storage/async-storage') {
      return {
        getItem: async (key) => items.get(key) ?? null,
        multiRemove: async (keys) => {
          keys.forEach((key) => items.delete(key));
        },
        setItem: async (key, value) => {
          items.set(key, value);
        }
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const storage = compileStorage();

    await storage.acceptConsent();
    const consent = await storage.getConsentRecord();
    const queue = await storage.getSyncQueue();

    assert.equal(consent.version, '2026-10-02-mx-local-sync-readiness');
    assert.deepEqual(queue.map((record) => record.recordType), ['consent']);
    assert.equal(queue[0].payload.scope, 'backend_sync');
    assert.equal(queue[0].payload.version, consent.version);
  } finally {
    Module._load = originalLoad;
  }
});

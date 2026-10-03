/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.sync-service-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileSyncService() {
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
      'services/sync/syncService.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return require(path.join(outDir, 'sync', 'syncService.js'));
}

test('skips queue sync when the API base URL is not configured', async () => {
  const { syncPendingQueue } = compileSyncService();
  let saved = false;

  const result = await syncPendingQueue({
    baseUrl: '',
    getAccessToken: async () => 'token',
    getSyncQueue: async () => [{ status: 'pending' }],
    saveSyncQueue: async () => {
      saved = true;
    }
  });

  assert.equal(result, 'skipped_no_api');
  assert.equal(saved, false);
});

test('syncs pending records and persists their updated statuses', async () => {
  const { syncPendingQueue } = compileSyncService();
  const queue = [
    {
      clientId: 'client-1',
      recordType: 'assessment',
      payload: { distressBefore: 5 },
      status: 'pending',
      attemptCount: 0,
      lastError: null,
      createdAt: '2026-10-03T00:00:00.000Z',
      updatedAt: '2026-10-03T00:00:00.000Z'
    }
  ];
  let savedQueue;

  const result = await syncPendingQueue({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    getSyncQueue: async () => queue,
    saveSyncQueue: async (nextQueue) => {
      savedQueue = nextQueue;
    },
    createApiClient: () => ({
      postAssessment: async () => undefined,
      postCustomExercise: async () => undefined,
      postExerciseFollowUp: async () => undefined,
      postEmotionLog: async () => undefined,
      putSafetyPlan: async () => undefined,
      putTrustedContact: async () => undefined,
      deleteTrustedContact: async () => undefined,
      postConsent: async () => undefined,
      postExportEvent: async () => undefined,
      postDeletionRequest: async () => undefined
    })
  });

  assert.equal(result, 'synced');
  assert.equal(savedQueue[0].status, 'synced');
});

/* global __dirname */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, '.sync-queue-test-dist');
const tscBin = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');

function compileSyncQueue() {
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
      'services/sync/syncQueue.ts'
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );

  return require(path.join(outDir, 'syncQueue.js'));
}

test('creates queue records with stable client IDs', () => {
  const { createSyncQueueRecord } = compileSyncQueue();

  const queueRecord = createSyncQueueRecord('assessment', { distressBefore: 4 });

  assert.equal(queueRecord.clientId.length > 0, true);
  assert.equal(queueRecord.status, 'pending');
  assert.equal(queueRecord.attemptCount, 0);
});

test('retrying the same client ID does not create duplicates', () => {
  const { createSyncQueueRecord, enqueueOrUpdateRecord } = compileSyncQueue();
  const localQueue = [];
  const queueRecord = createSyncQueueRecord('assessment', { distressBefore: 4 }, 'client-1');

  enqueueOrUpdateRecord(localQueue, queueRecord);
  enqueueOrUpdateRecord(localQueue, { ...queueRecord, attemptCount: 1, lastError: 'network' });

  assert.equal(localQueue.length, 1);
  assert.equal(localQueue[0].clientId, 'client-1');
  assert.equal(localQueue[0].attemptCount, 1);
});

test('sync without an access token is skipped without mutating records', async () => {
  const { createSyncQueueRecord, syncPendingRecords } = compileSyncQueue();
  const queueRecord = createSyncQueueRecord('emotion_log', { emotion: 'Calma' }, 'client-2');

  const result = await syncPendingRecords([queueRecord], {
    getAccessToken: async () => null,
    sendRecord: async () => {
      throw new Error('sendRecord should not run without auth');
    }
  });

  assert.equal(result, 'skipped_no_auth');
  assert.equal(queueRecord.status, 'pending');
});

test('dispatches queued records to the matching API client method', async () => {
  const { createSyncQueueRecord, sendQueuedRecord } = compileSyncQueue();
  const calls = [];
  const apiClient = {
    postAssessment: async (payload) => calls.push(['assessment', payload]),
    postExerciseFollowUp: async (payload) => calls.push(['follow', payload]),
    postEmotionLog: async (payload) => calls.push(['emotion', payload]),
    putSafetyPlan: async (payload) => calls.push(['safety', payload]),
    putTrustedContact: async (payload) => calls.push(['contact', payload]),
    postConsent: async (payload) => calls.push(['consent', payload]),
    postExportEvent: async () => calls.push(['export']),
    postDeletionRequest: async () => calls.push(['deletion'])
  };

  await sendQueuedRecord(createSyncQueueRecord('assessment', { distressBefore: 4 }, 'client-3'), apiClient);
  await sendQueuedRecord(createSyncQueueRecord('trusted_contact', { phoneE164: '+528009112000' }, 'client-4'), apiClient);

  assert.deepEqual(calls, [
    ['assessment', { distressBefore: 4, clientId: 'client-3' }],
    ['contact', { phoneE164: '+528009112000', clientId: 'client-4' }]
  ]);
});

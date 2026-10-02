export type SyncRecordType =
  | 'assessment'
  | 'exercise_follow_up'
  | 'emotion_log'
  | 'safety_plan'
  | 'trusted_contact'
  | 'consent'
  | 'export_event'
  | 'deletion_request';

export type SyncQueueStatus = 'pending' | 'synced' | 'failed';

export type SyncResult = 'synced' | 'skipped_no_auth' | 'skipped_empty' | 'failed';

export interface SyncQueueRecord<TPayload = Record<string, unknown>> {
  clientId: string;
  recordType: SyncRecordType;
  payload: TPayload;
  status: SyncQueueStatus;
  attemptCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncDependencies {
  getAccessToken: () => Promise<string | null>;
  sendRecord: (record: SyncQueueRecord, token: string) => Promise<void>;
}

export function createClientId(prefix = 'client') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createSyncQueueRecord<TPayload = Record<string, unknown>>(
  recordType: SyncRecordType,
  payload: TPayload,
  clientId = createClientId(recordType)
): SyncQueueRecord<TPayload> {
  const now = new Date().toISOString();
  return {
    clientId,
    recordType,
    payload,
    status: 'pending',
    attemptCount: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now
  };
}

export function enqueueOrUpdateRecord(queue: SyncQueueRecord[], record: SyncQueueRecord) {
  const existingIndex = queue.findIndex((item) => item.clientId === record.clientId);
  const next = {
    ...record,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = {
      ...queue[existingIndex],
      ...next
    };
    return queue[existingIndex];
  }

  queue.push(next);
  return next;
}

export async function syncPendingRecords(queue: SyncQueueRecord[], dependencies: SyncDependencies): Promise<SyncResult> {
  const pending = queue.filter((record) => record.status === 'pending' || record.status === 'failed');
  if (pending.length === 0) {
    return 'skipped_empty';
  }

  const token = await dependencies.getAccessToken();
  if (!token) {
    return 'skipped_no_auth';
  }

  let failed = false;

  for (const record of pending) {
    try {
      await dependencies.sendRecord(record, token);
      record.status = 'synced';
      record.lastError = null;
      record.updatedAt = new Date().toISOString();
    } catch (error) {
      failed = true;
      record.status = 'failed';
      record.attemptCount += 1;
      record.lastError = error instanceof Error ? error.message : 'unknown_error';
      record.updatedAt = new Date().toISOString();
    }
  }

  return failed ? 'failed' : 'synced';
}

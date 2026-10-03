export type SyncRecordType =
  | 'assessment'
  | 'custom_exercise'
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

export interface SyncApiClient {
  postAssessment: (payload: Record<string, unknown>) => Promise<unknown>;
  postCustomExercise: (payload: Record<string, unknown>) => Promise<unknown>;
  postExerciseFollowUp: (payload: Record<string, unknown>) => Promise<unknown>;
  postEmotionLog: (payload: Record<string, unknown>) => Promise<unknown>;
  putSafetyPlan: (payload: Record<string, unknown>) => Promise<unknown>;
  putTrustedContact: (payload: Record<string, unknown>) => Promise<unknown>;
  deleteTrustedContact: () => Promise<unknown>;
  postConsent: (payload: Record<string, unknown>) => Promise<unknown>;
  postExportEvent: () => Promise<unknown>;
  postDeletionRequest: () => Promise<unknown>;
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

function withClientId(record: SyncQueueRecord) {
  return {
    ...(record.payload as Record<string, unknown>),
    clientId: record.clientId
  };
}

function normalizeEmotionPayload(payload: Record<string, unknown>) {
  if (typeof payload.logDate === 'string') {
    return payload;
  }

  const { date, ...rest } = payload;
  return typeof date === 'string' ? { ...rest, logDate: date } : payload;
}

export async function sendQueuedRecord(record: SyncQueueRecord, apiClient: SyncApiClient) {
  switch (record.recordType) {
    case 'assessment':
      return apiClient.postAssessment(withClientId(record));
    case 'custom_exercise':
      return apiClient.postCustomExercise(withClientId(record));
    case 'exercise_follow_up':
      return apiClient.postExerciseFollowUp(withClientId(record));
    case 'emotion_log':
      return apiClient.postEmotionLog(normalizeEmotionPayload(withClientId(record)));
    case 'safety_plan':
      return apiClient.putSafetyPlan(withClientId(record));
    case 'trusted_contact':
      if ((record.payload as Record<string, unknown>).deleted === true) {
        return apiClient.deleteTrustedContact();
      }
      return apiClient.putTrustedContact(withClientId(record));
    case 'consent':
      return apiClient.postConsent(withClientId(record));
    case 'export_event':
      return apiClient.postExportEvent();
    case 'deletion_request':
      return apiClient.postDeletionRequest();
    default:
      throw new Error(`Unsupported sync record type: ${record.recordType}`);
  }
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

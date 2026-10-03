import { createApiClient } from '../api/client';
import type { SyncApiClient, SyncQueueRecord, SyncResult } from './syncQueue';
import { sendQueuedRecord, syncPendingRecords } from './syncQueue';

export type QueueSyncResult = SyncResult | 'skipped_no_api';

interface SyncPendingQueueDependencies {
  baseUrl?: string;
  createApiClient?: (options: {
    baseUrl: string;
    getAccessToken: () => Promise<string | null>;
  }) => SyncApiClient;
  getAccessToken: () => Promise<string | null>;
  getSyncQueue: () => Promise<SyncQueueRecord[]>;
  saveSyncQueue: (queue: SyncQueueRecord[]) => Promise<void>;
}

export async function syncPendingQueue({
  baseUrl,
  createApiClient: makeApiClient = createApiClient as (options: {
    baseUrl: string;
    getAccessToken: () => Promise<string | null>;
  }) => SyncApiClient,
  getAccessToken,
  getSyncQueue,
  saveSyncQueue
}: SyncPendingQueueDependencies): Promise<QueueSyncResult> {
  if (!baseUrl) {
    return 'skipped_no_api';
  }

  const queue = await getSyncQueue();
  const apiClient = makeApiClient({ baseUrl, getAccessToken });
  const result = await syncPendingRecords(queue, {
    getAccessToken,
    sendRecord: async (record) => {
      await sendQueuedRecord(record, apiClient);
    }
  });

  await saveSyncQueue(queue);
  return result;
}

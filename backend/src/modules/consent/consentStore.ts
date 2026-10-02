import { getDataStore } from '../data/dataStore.js';

export function recordUserConsent(userId: string, scope: string, version: string) {
  return getDataStore().recordConsent(userId, scope, version);
}

export function hasUserConsent(userId: string, scope: string) {
  return getDataStore().hasConsent(userId, scope);
}

export async function requireBackendSyncConsent(userId: string) {
  if (!(await hasUserConsent(userId, 'backend_sync'))) {
    const error = new Error('Backend sync consent required') as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }
}

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getAccessToken } from '../services/auth/secureTokenStore';
import { syncPendingQueue } from '../services/sync/syncService';
import { getSyncQueue, saveSyncQueue } from '../utils/storage';

export function useAutoSyncPendingQueue() {
  const isRunning = useRef(false);

  useEffect(() => {
    const run = async () => {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!baseUrl || isRunning.current) {
        return;
      }

      isRunning.current = true;
      try {
        await syncPendingQueue({
          baseUrl,
          getAccessToken,
          getSyncQueue,
          saveSyncQueue
        });
      } catch (error) {
        console.warn('Auto sync failed', error);
      } finally {
        isRunning.current = false;
      }
    };

    run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        run();
      }
    });

    return () => subscription.remove();
  }, []);
}

/**
 * @module    useSyncStatus
 * @summary   React hook providing real-time storage sync status ('idle' | 'saving' | 'saved' | 'error'),
 *            active adapter metadata, and manual flush trigger.
 */

import { useState, useEffect } from 'react';
import type { SyncStatus, SyncStatusEvent } from '../services/storage/IStorageAdapter.ts';
import { storageService } from '../services/storage/StorageService.ts';

export interface UseSyncStatusResult {
  status: SyncStatus;
  adapterName: string;
  lastSyncedAt: Date | null;
  error: Error | null;
  flushPendingSaves: () => Promise<void>;
}

export function useSyncStatus(): UseSyncStatusResult {
  const [syncEvent, setSyncEvent] = useState<SyncStatusEvent>(() => ({
    status: 'idle',
    adapterName: storageService.getAdapter().name,
    lastSyncedAt: null,
    error: null,
  }));

  useEffect(() => {
    // Initial sync with active adapter
    setSyncEvent({
      status: 'idle',
      adapterName: storageService.getAdapter().name,
      lastSyncedAt: null,
      error: null,
    });

    const unsubscribe = storageService.onSyncStatusChange((event: SyncStatusEvent) => {
      setSyncEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const flushPendingSaves = async () => {
    await storageService.flushPendingSaves();
  };

  return {
    status: syncEvent.status,
    adapterName: syncEvent.adapterName,
    lastSyncedAt: syncEvent.lastSyncedAt || null,
    error: syncEvent.error || null,
    flushPendingSaves,
  };
}

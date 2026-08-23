/**
 * @module    LocalStorageAdapter
 * @summary   Implements IStorageAdapter for synchronous, offline-first localStorage persistence
 *            with safe in-memory fallback for headless or restricted environments.
 */

import type { IStorageAdapter, SyncStatus, SyncStatusEvent, SyncStatusListener } from './IStorageAdapter.ts';

export const LOCAL_STORAGE_KEY = 'dd_combatsheet_state';
export const CHARACTER_PREFIX = 'dd_character_';
export const CAMPAIGN_PREFIX = 'dd_campaign_';

export class LocalStorageAdapter implements IStorageAdapter {
  readonly name = 'local';
  private storageKey: string;
  private inMemoryFallback: Map<string, string> = new Map();
  private listeners: Set<SyncStatusListener> = new Set();
  private lastSyncedAt: Date | null = null;

  constructor(storageKey: string = LOCAL_STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  private getStorage(): {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  } {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage;
      }
    } catch {
      // Fallback to memory if localStorage is restricted
    }

    return {
      getItem: (key: string) => this.inMemoryFallback.get(key) ?? null,
      setItem: (key: string, value: string) => {
        this.inMemoryFallback.set(key, value);
      },
      removeItem: (key: string) => {
        this.inMemoryFallback.delete(key);
      },
    };
  }

  private notify(status: SyncStatus, error: Error | null = null) {
    if (status === 'saved') {
      this.lastSyncedAt = new Date();
    }
    const event: SyncStatusEvent = {
      status,
      adapterName: this.name,
      error,
      lastSyncedAt: this.lastSyncedAt,
    };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[LocalStorageAdapter] Listener error:', err);
      }
    });
  }

  saveState(state: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem(this.storageKey, JSON.stringify(state));
      this.notify('saved');
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to save state:', err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  loadState(): any | null {
    try {
      const storage = this.getStorage();
      const rawData = storage.getItem(this.storageKey);
      if (!rawData) return null;
      return JSON.parse(rawData);
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to load state:', err);
      return null;
    }
  }

  clearState(): void {
    try {
      const storage = this.getStorage();
      storage.removeItem(this.storageKey);
      this.notify('idle');
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to clear state:', err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  saveCharacter(characterId: string, characterData: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem(`${CHARACTER_PREFIX}${characterId}`, JSON.stringify(characterData));
      this.notify('saved');
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to save character ${characterId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  loadCharacter(characterId: string): any | null {
    try {
      const storage = this.getStorage();
      const raw = storage.getItem(`${CHARACTER_PREFIX}${characterId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to load character ${characterId}:`, err);
      return null;
    }
  }

  saveCampaign(campaignId: string, encounterState: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem(`${CAMPAIGN_PREFIX}${campaignId}`, JSON.stringify(encounterState));
      this.notify('saved');
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to save campaign ${campaignId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  loadCampaign(campaignId: string): any | null {
    try {
      const storage = this.getStorage();
      const raw = storage.getItem(`${CAMPAIGN_PREFIX}${campaignId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to load campaign ${campaignId}:`, err);
      return null;
    }
  }

  onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  flushPendingSaves(): Promise<void> {
    return Promise.resolve();
  }
}

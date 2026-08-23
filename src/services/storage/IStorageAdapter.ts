/**
 * @module    IStorageAdapter
 * @summary   Interface and type contracts for storage adapters (LocalStorage, Supabase, etc.)
 *            supporting full state persistence, entity-level hooks, and sync status events.
 */

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SyncStatusEvent {
  status: SyncStatus;
  adapterName: string;
  error?: Error | null;
  lastSyncedAt?: Date | null;
}

export type SyncStatusListener = (event: SyncStatusEvent) => void;

export interface IStorageAdapter {
  /**
   * Unique name of the adapter (e.g. 'local', 'supabase')
   */
  readonly name: string;

  /**
   * Saves the entire application / combat state.
   */
  saveState(state: any): Promise<void> | void;

  /**
   * Loads the combat state from storage.
   * Returns parsed state or null if empty / corrupted.
   */
  loadState(): Promise<any | null> | any | null;

  /**
   * Clears the stored state.
   */
  clearState(): Promise<void> | void;

  /**
   * Optional entity hook: Save an individual character (for multi-character roster).
   */
  saveCharacter?(characterId: string, characterData: any): Promise<void> | void;

  /**
   * Optional entity hook: Load an individual character.
   */
  loadCharacter?(characterId: string): Promise<any | null> | any | null;

  /**
   * Optional entity hook: Save an individual campaign / encounter state.
   */
  saveCampaign?(campaignId: string, encounterState: any): Promise<void> | void;

  /**
   * Optional entity hook: Load an individual campaign.
   */
  loadCampaign?(campaignId: string): Promise<any | null> | any | null;

  /**
   * Subscribes to sync status changes. Returns an unsubscribe function.
   */
  onSyncStatusChange?(listener: SyncStatusListener): () => void;

  /**
   * Flushes any pending / debounced save operations immediately.
   */
  flushPendingSaves?(): Promise<void>;
}

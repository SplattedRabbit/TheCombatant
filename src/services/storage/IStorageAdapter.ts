/**
 * @module    IStorageAdapter
 * @summary   Interface and type contracts for storage adapters (LocalStorage, Supabase, etc.)
 *            supporting full state persistence, entity-level hooks, multi-character/multi-campaign
 *            indexes, and sync status events.
 */

import type { CharacterSummary } from '../../types/character.ts';
import type { CampaignSummary } from '../../types/campaign.ts';

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
   * Optional entity hook: List all characters available in this storage adapter.
   */
  listCharacters?(): Promise<CharacterSummary[]> | CharacterSummary[];

  /**
   * Optional entity hook: Delete a character by ID.
   */
  deleteCharacter?(characterId: string): Promise<void> | void;

  /**
   * Optional active character ID tracking.
   */
  getActiveCharacterId?(): string | null;
  setActiveCharacterId?(characterId: string | null): void;

  /**
   * Optional entity hook: Save an individual campaign / encounter state.
   */
  saveCampaign?(
    campaignId: string,
    encounterState: any,
    metadata?: { name?: string; description?: string; inviteCode?: string }
  ): Promise<void> | void;

  /**
   * Optional entity hook: Load an individual campaign.
   */
  loadCampaign?(campaignId: string): Promise<any | null> | any | null;

  /**
   * Optional entity hook: List all campaigns available in this storage adapter.
   */
  listCampaigns?(): Promise<CampaignSummary[]> | CampaignSummary[];

  /**
   * Optional entity hook: Delete a campaign by ID.
   */
  deleteCampaign?(campaignId: string): Promise<void> | void;

  /**
   * Optional active campaign ID tracking.
   */
  getActiveCampaignId?(): string | null;
  setActiveCampaignId?(campaignId: string | null): void;

  /**
   * Subscribes to sync status changes. Returns an unsubscribe function.
   */
  onSyncStatusChange?(listener: SyncStatusListener): () => void;

  /**
   * Flushes any pending / debounced save operations immediately.
   */
  flushPendingSaves?(): Promise<void>;
}

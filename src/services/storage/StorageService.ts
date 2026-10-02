/**
 * @module    StorageService
 * @summary   Central storage dispatcher and adapter coordinator.
 *            Manages the active storage adapter (LocalStorage vs SupabaseStorage),
 *            switches adapters on auth state changes, and broadcasts global sync events.
 */

import type { User } from '@supabase/supabase-js';
import type { IStorageAdapter, SyncStatusEvent, SyncStatusListener } from './IStorageAdapter.ts';
import { LocalStorageAdapter } from './LocalStorageAdapter.ts';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter.ts';

export class StorageService {
  private static instance: StorageService | null = null;

  private activeAdapter: IStorageAdapter;
  private listeners: Set<SyncStatusListener> = new Set();
  private adapterUnsubscribe: (() => void) | null = null;
  private currentUserId: string | null = null;

  constructor(initialAdapter?: IStorageAdapter) {
    this.activeAdapter = initialAdapter || new LocalStorageAdapter();
    this.bindAdapterEvents();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private bindAdapterEvents(): void {
    if (this.adapterUnsubscribe) {
      this.adapterUnsubscribe();
      this.adapterUnsubscribe = null;
    }

    if (this.activeAdapter && typeof this.activeAdapter.onSyncStatusChange === 'function') {
      this.adapterUnsubscribe = this.activeAdapter.onSyncStatusChange((event: SyncStatusEvent) => {
        this.notify(event);
      });
    }
  }

  private notify(event: SyncStatusEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[StorageService] Error in sync status listener:', err);
      }
    });
  }

  public getAdapter(): IStorageAdapter {
    return this.activeAdapter;
  }

  public setAdapter(adapter: IStorageAdapter): void {
    this.activeAdapter = adapter;
    this.bindAdapterEvents();
  }

  public async initializeForUser(
    user: User | { id: string } | null,
    options?: {
      activeCharacterId?: string | null;
      activeCampaignId?: string | null;
      debounceMs?: number;
    }
  ): Promise<void> {
    // 1. Flush any pending saves on the existing adapter
    if (this.activeAdapter && typeof this.activeAdapter.flushPendingSaves === 'function') {
      try {
        await this.activeAdapter.flushPendingSaves();
      } catch (err) {
        console.warn('[StorageService] Error flushing pending saves during adapter transition:', err);
      }
    }

    // 2. Transition adapter based on auth user
    if (user && user.id) {
      this.currentUserId = user.id;
      const supabaseAdapter = new SupabaseStorageAdapter(user.id, {
        activeCharacterId: options?.activeCharacterId,
        activeCampaignId: options?.activeCampaignId,
        debounceMs: options?.debounceMs,
      });
      this.setAdapter(supabaseAdapter);
    } else {
      this.currentUserId = null;
      this.setAdapter(new LocalStorageAdapter());
    }
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  public get name(): string {
    return this.activeAdapter?.name || 'storage-service';
  }

  public saveState(state: any): Promise<void> | void {
    return this.activeAdapter.saveState(state);
  }

  public loadState(): Promise<any | null> | any | null {
    return this.activeAdapter.loadState();
  }

  public clearState(): Promise<void> | void {
    return this.activeAdapter.clearState();
  }

  public saveCharacter(characterId: string, characterData: any): Promise<void> | void {
    if (typeof this.activeAdapter.saveCharacter === 'function') {
      return this.activeAdapter.saveCharacter(characterId, characterData);
    }
  }

  public loadCharacter(characterId: string): Promise<any | null> | any | null {
    if (typeof this.activeAdapter.loadCharacter === 'function') {
      return this.activeAdapter.loadCharacter(characterId);
    }
    return null;
  }

  public listCharacters(): Promise<any[]> | any[] {
    if (typeof this.activeAdapter.listCharacters === 'function') {
      return this.activeAdapter.listCharacters();
    }
    return [];
  }

  public deleteCharacter(characterId: string): Promise<void> | void {
    if (typeof this.activeAdapter.deleteCharacter === 'function') {
      return this.activeAdapter.deleteCharacter(characterId);
    }
  }

  public getActiveCharacterId(): string | null {
    if (typeof this.activeAdapter.getActiveCharacterId === 'function') {
      return this.activeAdapter.getActiveCharacterId();
    }
    return null;
  }

  public setActiveCharacterId(characterId: string | null): void {
    if (typeof this.activeAdapter.setActiveCharacterId === 'function') {
      this.activeAdapter.setActiveCharacterId(characterId);
    }
  }

  public saveCampaign(
    campaignId: string,
    encounterState: any,
    metadata?: { name?: string; description?: string; inviteCode?: string }
  ): Promise<void> | void {
    if (typeof this.activeAdapter.saveCampaign === 'function') {
      return this.activeAdapter.saveCampaign(campaignId, encounterState, metadata);
    }
  }

  public loadCampaign(campaignId: string): Promise<any | null> | any | null {
    if (typeof this.activeAdapter.loadCampaign === 'function') {
      return this.activeAdapter.loadCampaign(campaignId);
    }
    return null;
  }

  public listCampaigns(): Promise<any[]> | any[] {
    if (typeof this.activeAdapter.listCampaigns === 'function') {
      return this.activeAdapter.listCampaigns();
    }
    return [];
  }

  public deleteCampaign(campaignId: string): Promise<void> | void {
    if (typeof this.activeAdapter.deleteCampaign === 'function') {
      return this.activeAdapter.deleteCampaign(campaignId);
    }
  }

  public getActiveCampaignId(): string | null {
    if (typeof this.activeAdapter.getActiveCampaignId === 'function') {
      return this.activeAdapter.getActiveCampaignId();
    }
    return null;
  }

  public setActiveCampaignId(campaignId: string | null): void {
    if (typeof this.activeAdapter.setActiveCampaignId === 'function') {
      this.activeAdapter.setActiveCampaignId(campaignId);
    }
  }

  public async flushPendingSaves(): Promise<void> {
    if (this.activeAdapter && typeof this.activeAdapter.flushPendingSaves === 'function') {
      await this.activeAdapter.flushPendingSaves();
    }
  }

  public onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Global default instance for convenience
export const storageService = StorageService.getInstance();

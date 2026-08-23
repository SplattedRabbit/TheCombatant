/**
 * @module    LocalStorageAdapter
 * @summary   Implements IStorageAdapter for synchronous, offline-first localStorage persistence
 *            with safe in-memory fallback for headless or restricted environments.
 *            Supports multi-character and multi-campaign index tracking and summary extraction.
 */

import type { IStorageAdapter, SyncStatus, SyncStatusEvent, SyncStatusListener } from './IStorageAdapter.ts';
import type { CharacterSummary } from '../../types/character.ts';
import type { CampaignSummary } from '../../types/campaign.ts';

export const LOCAL_STORAGE_KEY = 'dd_combatsheet_state';
export const CHARACTER_PREFIX = 'dd_character_';
export const CAMPAIGN_PREFIX = 'dd_campaign_';
export const CHARACTER_INDEX_KEY = 'dd_character_index';
export const ACTIVE_CHARACTER_KEY = 'dd_active_character_id';
export const CAMPAIGN_INDEX_KEY = 'dd_campaign_index';
export const ACTIVE_CAMPAIGN_KEY = 'dd_active_campaign_id';

export class LocalStorageAdapter implements IStorageAdapter {
  readonly name = 'local';
  private storageKey: string;
  private inMemoryFallback: Map<string, string> = new Map();
  private listeners: Set<SyncStatusListener> = new Set();
  private lastSyncedAt: Date | null = null;
  private activeCharacterId: string | null = null;
  private activeCampaignId: string | null = null;

  constructor(storageKey: string = LOCAL_STORAGE_KEY) {
    this.storageKey = storageKey;
    this.activeCharacterId = this.loadActiveCharacterId();
    this.activeCampaignId = this.loadActiveCampaignId();
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

  private loadActiveCharacterId(): string | null {
    try {
      const storage = this.getStorage();
      return storage.getItem(ACTIVE_CHARACTER_KEY) || null;
    } catch {
      return null;
    }
  }

  public getActiveCharacterId(): string | null {
    return this.activeCharacterId;
  }

  public setActiveCharacterId(characterId: string | null): void {
    this.activeCharacterId = characterId;
    try {
      const storage = this.getStorage();
      if (characterId) {
        storage.setItem(ACTIVE_CHARACTER_KEY, characterId);
      } else {
        storage.removeItem(ACTIVE_CHARACTER_KEY);
      }
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to store active character id:', err);
    }
  }

  private loadActiveCampaignId(): string | null {
    try {
      const storage = this.getStorage();
      return storage.getItem(ACTIVE_CAMPAIGN_KEY) || null;
    } catch {
      return null;
    }
  }

  public getActiveCampaignId(): string | null {
    return this.activeCampaignId;
  }

  public setActiveCampaignId(campaignId: string | null): void {
    this.activeCampaignId = campaignId;
    try {
      const storage = this.getStorage();
      if (campaignId) {
        storage.setItem(ACTIVE_CAMPAIGN_KEY, campaignId);
      } else {
        storage.removeItem(ACTIVE_CAMPAIGN_KEY);
      }
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to store active campaign id:', err);
    }
  }

  private getCharacterIndex(): string[] {
    try {
      const storage = this.getStorage();
      const raw = storage.getItem(CHARACTER_INDEX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private setCharacterIndex(index: string[]): void {
    try {
      const storage = this.getStorage();
      storage.setItem(CHARACTER_INDEX_KEY, JSON.stringify(index));
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to update character index:', err);
    }
  }

  private getCampaignIndex(): string[] {
    try {
      const storage = this.getStorage();
      const raw = storage.getItem(CAMPAIGN_INDEX_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private setCampaignIndex(index: string[]): void {
    try {
      const storage = this.getStorage();
      storage.setItem(CAMPAIGN_INDEX_KEY, JSON.stringify(index));
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to update campaign index:', err);
    }
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

      const isDmSession = state?.session?.role === 'host' || state?.mode === 'dm';
      if (isDmSession && this.activeCampaignId) {
        this.saveCampaign(this.activeCampaignId, state);
      } else if (this.activeCharacterId) {
        this.saveCharacter(this.activeCharacterId, state);
      }

      this.notify('saved');
    } catch (err) {
      console.error('[LocalStorageAdapter] Failed to save state:', err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  loadState(): any | null {
    try {
      const storage = this.getStorage();

      if (this.activeCampaignId) {
        const campData = this.loadCampaign(this.activeCampaignId);
        if (campData) return campData;
      }

      if (this.activeCharacterId) {
        const charData = this.loadCharacter(this.activeCharacterId);
        if (charData) return charData;
      }

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

      // Ensure characterId is present in index
      const index = this.getCharacterIndex();
      if (!index.includes(characterId)) {
        index.push(characterId);
        this.setCharacterIndex(index);
      }

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

  listCharacters(): CharacterSummary[] {
    const summaries: CharacterSummary[] = [];
    const index = this.getCharacterIndex();

    for (const id of index) {
      const raw = this.loadCharacter(id);
      if (!raw) continue;

      const pc = (raw?.combatants || []).find((c: any) => c.type === 'p') || raw;
      const name = pc?.name || raw?.name || 'Hero';
      const race = pc?.race || 'Human';
      const classSummary = pc?.classSummary || pc?.class_summary || (Array.isArray(pc?.classes) ? pc.classes.map((c: any) => `${c.name || c.classType} ${c.level}`).join(' / ') : '');
      const level = typeof pc?.level === 'number' ? pc.level : 1;
      const hpCurrent = typeof pc?.hp === 'number' ? pc.hp : 10;
      const hpMax = typeof pc?.maxHP === 'number' ? pc.maxHP : (typeof pc?.maxHp === 'number' ? pc.maxHp : 10);

      summaries.push({
        id,
        userId: 'local-guest',
        name,
        race,
        classSummary,
        level,
        hp: { current: hpCurrent, max: hpMax },
        isActive: true,
        createdAt: raw?.createdAt || new Date().toISOString(),
        updatedAt: raw?.updatedAt || new Date().toISOString(),
        isCurrentActive: id === this.activeCharacterId,
      });
    }

    // Fallback: If no characters in index, check default state
    if (summaries.length === 0) {
      const defaultState = this.loadState();
      if (defaultState) {
        const pc = (defaultState?.combatants || []).find((c: any) => c.type === 'p') || defaultState;
        const name = pc?.name || 'Hero';
        const race = pc?.race || 'Human';
        const classSummary = pc?.classSummary || pc?.class_summary || '';
        const level = typeof pc?.level === 'number' ? pc.level : 1;
        const hpCurrent = typeof pc?.hp === 'number' ? pc.hp : 10;
        const hpMax = typeof pc?.maxHP === 'number' ? pc.maxHP : 10;
        const defaultId = pc?.id || 'local-default';

        summaries.push({
          id: defaultId,
          userId: 'local-guest',
          name,
          race,
          classSummary,
          level,
          hp: { current: hpCurrent, max: hpMax },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCurrentActive: true,
        });
      }
    }

    return summaries;
  }

  deleteCharacter(characterId: string): void {
    try {
      const storage = this.getStorage();
      storage.removeItem(`${CHARACTER_PREFIX}${characterId}`);

      const index = this.getCharacterIndex().filter((id) => id !== characterId);
      this.setCharacterIndex(index);

      if (this.activeCharacterId === characterId) {
        this.setActiveCharacterId(index.length > 0 ? index[0] : null);
      }

      this.notify('saved');
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to delete character ${characterId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  saveCampaign(campaignId: string, encounterState: any): void {
    try {
      const storage = this.getStorage();
      storage.setItem(`${CAMPAIGN_PREFIX}${campaignId}`, JSON.stringify(encounterState));

      // Ensure campaignId is present in index
      const index = this.getCampaignIndex();
      if (!index.includes(campaignId)) {
        index.push(campaignId);
        this.setCampaignIndex(index);
      }

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

  listCampaigns(): CampaignSummary[] {
    const summaries: CampaignSummary[] = [];
    const index = this.getCampaignIndex();

    for (const id of index) {
      const raw = this.loadCampaign(id);
      if (!raw) continue;

      const combatants = Array.isArray(raw?.combatants) ? raw.combatants : [];
      const meta = raw?.meta || {};
      const encounterName = meta?.begegnung || raw?.name || 'Unnamed Campaign';
      const location = meta?.ort || 'Dungeon';
      const round = typeof raw?.round === 'number' ? raw.round : 1;
      const turn = typeof raw?.activeIdx === 'number' ? raw.activeIdx : 0;
      const inviteCode = raw?.inviteCode || `LOCAL-${id.slice(-4).toUpperCase()}`;

      summaries.push({
        id,
        dmUserId: 'local-guest',
        name: encounterName,
        description: raw?.description || '',
        inviteCode,
        combatantCount: combatants.length,
        round,
        turn,
        encounterName,
        location,
        memberCount: 1,
        isActive: true,
        createdAt: raw?.createdAt || new Date().toISOString(),
        updatedAt: raw?.updatedAt || new Date().toISOString(),
        isCurrentActive: id === this.activeCampaignId,
      });
    }

    return summaries;
  }

  deleteCampaign(campaignId: string): void {
    try {
      const storage = this.getStorage();
      storage.removeItem(`${CAMPAIGN_PREFIX}${campaignId}`);

      const index = this.getCampaignIndex().filter((id) => id !== campaignId);
      this.setCampaignIndex(index);

      if (this.activeCampaignId === campaignId) {
        this.setActiveCampaignId(index.length > 0 ? index[0] : null);
      }

      this.notify('saved');
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to delete campaign ${campaignId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err)));
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

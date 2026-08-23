/**
 * @module    SupabaseStorageAdapter
 * @summary   Implements IStorageAdapter for cloud persistence with Supabase PostgreSQL.
 *            Features local-first caching, 800ms debounce write-batching, flush support,
 *            multi-character roster queries, and fine-grained sync status event notifications.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabaseClient } from '../supabase/supabaseClient.ts';
import type { IStorageAdapter, SyncStatus, SyncStatusEvent, SyncStatusListener } from './IStorageAdapter.ts';
import type { CharacterSummary } from '../../types/character.ts';
import type { CampaignSummary } from '../../types/campaign.ts';
import { generateUUID } from '../../utils/uuid.ts';

export const CLOUD_CACHE_PREFIX = 'dd_cloud_cache_';
export const DEFAULT_DEBOUNCE_MS = 800;

export class SupabaseStorageAdapter implements IStorageAdapter {
  readonly name = 'supabase';

  private userId: string;
  private activeCharacterId: string | null = null;
  private activeCampaignId: string | null = null;
  private client: SupabaseClient<any, 'public', any>;
  private debounceMs: number;

  private debounceTimer: any = null;
  private pendingStateToSave: any = null;
  private activeSavePromise: Promise<void> | null = null;

  private listeners: Set<SyncStatusListener> = new Set();
  private lastSyncedAt: Date | null = null;
  private idleResetTimer: any = null;

  constructor(
    userId: string,
    options?: {
      client?: SupabaseClient<any, 'public', any>;
      activeCharacterId?: string | null;
      activeCampaignId?: string | null;
      debounceMs?: number;
    }
  ) {
    this.userId = userId;
    this.client = options?.client || defaultSupabaseClient;
    this.activeCharacterId = options?.activeCharacterId || null;
    this.activeCampaignId = options?.activeCampaignId || null;
    this.debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  }

  public setCharacterId(characterId: string | null): void {
    this.activeCharacterId = characterId;
  }

  public getCharacterId(): string | null {
    return this.activeCharacterId;
  }

  public setActiveCharacterId(characterId: string | null): void {
    this.activeCharacterId = characterId;
  }

  public getActiveCharacterId(): string | null {
    return this.activeCharacterId;
  }

  public setCampaignId(campaignId: string | null): void {
    this.activeCampaignId = campaignId;
  }

  public getCampaignId(): string | null {
    return this.activeCampaignId;
  }

  private getCacheKey(): string {
    return `${CLOUD_CACHE_PREFIX}${this.userId}`;
  }

  private saveToLocalCache(data: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.getCacheKey(), JSON.stringify(data));
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(this.getCacheKey(), JSON.stringify(data));
      }
    } catch (err) {
      console.warn('[SupabaseStorageAdapter] Failed to write local cache:', err);
    }
  }

  private loadFromLocalCache(): any | null {
    try {
      let raw: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(this.getCacheKey());
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        raw = (globalThis as any).localStorage.getItem(this.getCacheKey());
      }
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private notify(status: SyncStatus, error: Error | null = null): void {
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
        console.error('[SupabaseStorageAdapter] Listener error:', err);
      }
    });

    if (status === 'saved') {
      if (this.idleResetTimer) clearTimeout(this.idleResetTimer);
      this.idleResetTimer = setTimeout(() => {
        this.notify('idle');
      }, 2000);
    }
  }

  saveState(state: any): void {
    // 1. Local-First: Immediate synchronous backup to local cache
    this.saveToLocalCache(state);
    this.pendingStateToSave = state;
    this.notify('saving');

    // 2. Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 3. Schedule debounced cloud sync
    this.debounceTimer = setTimeout(() => {
      this.flushPendingSaves().catch((err) => {
        console.error('[SupabaseStorageAdapter] Debounced save failed:', err);
      });
    }, this.debounceMs);
  }

  async flushPendingSaves(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (!this.pendingStateToSave) {
      return;
    }

    const stateToSave = this.pendingStateToSave;
    this.pendingStateToSave = null;

    this.activeSavePromise = this.performCloudSave(stateToSave);
    try {
      await this.activeSavePromise;
    } finally {
      this.activeSavePromise = null;
    }
  }

  private async performCloudSave(state: any): Promise<void> {
    try {
      this.notify('saving');

      // Check if saving campaign (DM host) or player character
      const isDmSession = state?.session?.role === 'host' || state?.mode === 'dm';

      if (isDmSession && this.activeCampaignId) {
        const { error } = await this.client
          .from('campaigns')
          .update({
            active_encounter_state: state,
            updated_at: new Date().toISOString(),
          })
          .eq('id', this.activeCampaignId)
          .eq('dm_user_id', this.userId);

        if (error) throw error;
      } else if (isDmSession) {
        const newCampId = generateUUID();
        const encounterName = state?.meta?.begegnung || 'Neue Kampagne';
        const { data, error } = await this.client
          .from('campaigns')
          .upsert({
            id: newCampId,
            dm_user_id: this.userId,
            name: encounterName,
            invite_code: 'CAMP-' + Math.floor(10 + Math.random() * 90),
            active_encounter_state: state,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data?.id) {
          this.activeCampaignId = data.id;
        }
      } else {
        // Player Character Mode: find active PC from combatants
        const pc = (state?.combatants || []).find((c: any) => c.type === 'p') || null;
        const charName = pc?.name || 'Held';
        const charLevel = typeof pc?.level === 'number' ? pc.level : 1;
        const classSummary = pc?.classSummary || pc?.class_summary || (Array.isArray(pc?.classes) ? pc.classes.map((c: any) => `${c.name || c.classType} ${c.level}`).join(' / ') : '');

        if (this.activeCharacterId) {
          const { error } = await this.client
            .from('characters')
            .update({
              name: charName,
              level: charLevel,
              class_summary: classSummary,
              character_data: state,
              updated_at: new Date().toISOString(),
            })
            .eq('id', this.activeCharacterId)
            .eq('user_id', this.userId);

          if (error) throw error;
        } else {
          // Upsert or insert character
          const { data, error } = await this.client
            .from('characters')
            .upsert(
              {
                user_id: this.userId,
                name: charName,
                level: charLevel,
                class_summary: classSummary,
                character_data: state,
                is_active: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            )
            .select('id')
            .single();

          if (error) throw error;
          if (data?.id) {
            this.activeCharacterId = data.id;
          }
        }
      }

      this.notify('saved');
    } catch (err: any) {
      console.warn('[SupabaseStorageAdapter] Cloud save error, fallback to local cache:', err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  async loadState(): Promise<any | null> {
    try {
      // 1. Try to fetch from Supabase
      if (this.activeCharacterId) {
        const { data, error } = await this.client
          .from('characters')
          .select('character_data')
          .eq('id', this.activeCharacterId)
          .eq('user_id', this.userId)
          .single();

        if (!error && data?.character_data) {
          this.saveToLocalCache(data.character_data);
          this.notify('saved');
          return data.character_data;
        }
      }

      // Fetch most recently updated character for this user
      const { data, error } = await this.client
        .from('characters')
        .select('id, character_data')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.character_data) {
        this.activeCharacterId = data.id;
        this.saveToLocalCache(data.character_data);
        this.notify('saved');
        return data.character_data;
      }
    } catch (err) {
      console.warn('[SupabaseStorageAdapter] Cloud load failed, attempting local cache fallback:', err);
    }

    // 2. Fallback to local cache
    const cached = this.loadFromLocalCache();
    if (cached) {
      return cached;
    }

    return null;
  }

  async clearState(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingStateToSave = null;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.getCacheKey());
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(this.getCacheKey());
      }
      this.notify('idle');
    } catch (err) {
      console.error('[SupabaseStorageAdapter] Failed to clear state:', err);
    }
  }

  async saveCharacter(characterId: string, characterData: any): Promise<void> {
    try {
      this.notify('saving');
      const validId = characterId || this.activeCharacterId || generateUUID();
      const pc = (characterData?.combatants || []).find((c: any) => c.type === 'p') || characterData;
      const charName = pc?.name || characterData?.name || 'Held';
      const charLevel = typeof pc?.level === 'number' ? pc.level : (characterData?.level || 1);
      const classSummary = pc?.classSummary || pc?.class_summary || characterData?.class_summary || '';

      const { error } = await this.client
        .from('characters')
        .upsert({
          id: validId,
          user_id: this.userId,
          name: charName,
          level: charLevel,
          class_summary: classSummary,
          character_data: characterData,
          is_active: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      this.activeCharacterId = validId;
      this.notify('saved');
    } catch (err: any) {
      console.error(`[SupabaseStorageAdapter] Failed to save character ${characterId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  async loadCharacter(characterId: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('characters')
        .select('character_data')
        .eq('id', characterId)
        .eq('user_id', this.userId)
        .single();

      if (error) throw error;
      return data?.character_data ?? null;
    } catch (err) {
      console.error(`[SupabaseStorageAdapter] Failed to load character ${characterId}:`, err);
      return null;
    }
  }

  async listCharacters(): Promise<CharacterSummary[]> {
    try {
      const { data, error } = await this.client
        .from('characters')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const rawData = row.character_data;
        const pc = (rawData?.combatants || []).find((c: any) => c.type === 'p') || rawData || {};
        const race = pc?.race || 'Mensch';
        const hpCurrent = typeof pc?.hp === 'number' ? pc.hp : 10;
        const hpMax = typeof pc?.maxHP === 'number' ? pc.maxHP : (typeof pc?.maxHp === 'number' ? pc.maxHp : 10);

        return {
          id: row.id,
          userId: row.user_id,
          name: row.name || pc?.name || 'Held',
          race,
          classSummary: row.class_summary || pc?.classSummary || '',
          level: typeof row.level === 'number' ? row.level : 1,
          hp: { current: hpCurrent, max: hpMax },
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isCurrentActive: row.id === this.activeCharacterId,
        };
      });
    } catch (err) {
      console.error('[SupabaseStorageAdapter] Failed to list characters from cloud:', err);
      return [];
    }
  }

  async deleteCharacter(characterId: string): Promise<void> {
    try {
      this.notify('saving');
      const { error } = await this.client
        .from('characters')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', characterId)
        .eq('user_id', this.userId);

      if (error) throw error;

      if (this.activeCharacterId === characterId) {
        this.activeCharacterId = null;
      }

      this.notify('saved');
    } catch (err: any) {
      console.error(`[SupabaseStorageAdapter] Failed to delete character ${characterId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  async saveCampaign(campaignId: string, encounterState: any): Promise<void> {
    try {
      this.notify('saving');
      const validId = campaignId || this.activeCampaignId || generateUUID();
      const encounterName = encounterState?.meta?.begegnung || 'Kampagne';
      const { error } = await this.client
        .from('campaigns')
        .upsert({
          id: validId,
          dm_user_id: this.userId,
          name: encounterName,
          invite_code: encounterState?.inviteCode || ('CAMP-' + Math.floor(10 + Math.random() * 90)),
          active_encounter_state: encounterState,
          is_active: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      this.activeCampaignId = validId;
      this.notify('saved');
    } catch (err: any) {
      console.error(`[SupabaseStorageAdapter] Failed to save campaign ${campaignId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  async loadCampaign(campaignId: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('campaigns')
        .select('active_encounter_state')
        .eq('id', campaignId)
        .eq('dm_user_id', this.userId)
        .single();

      if (error) throw error;
      return data?.active_encounter_state ?? null;
    } catch (err) {
      console.error(`[SupabaseStorageAdapter] Failed to load campaign ${campaignId}:`, err);
      return null;
    }
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    try {
      const { data, error } = await this.client
        .from('campaigns')
        .select('*')
        .eq('dm_user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const rawEncounter = row.active_encounter_state || {};
        const combatants = Array.isArray(rawEncounter.combatants) ? rawEncounter.combatants : [];
        const meta = rawEncounter.meta || {};

        return {
          id: row.id,
          dmUserId: row.dm_user_id,
          name: row.name || meta.begegnung || 'Kampagne',
          description: row.description || '',
          inviteCode: row.invite_code,
          combatantCount: combatants.length,
          round: typeof rawEncounter.round === 'number' ? rawEncounter.round : 1,
          turn: typeof rawEncounter.activeIdx === 'number' ? rawEncounter.activeIdx : 0,
          encounterName: meta.begegnung || row.name,
          location: meta.ort || 'Dungeon',
          memberCount: 1,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isCurrentActive: row.id === this.activeCampaignId,
        };
      });
    } catch (err) {
      console.error('[SupabaseStorageAdapter] Failed to list campaigns from cloud:', err);
      return [];
    }
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      this.notify('saving');
      const { error } = await this.client
        .from('campaigns')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('dm_user_id', this.userId);

      if (error) throw error;

      if (this.activeCampaignId === campaignId) {
        this.activeCampaignId = null;
      }

      this.notify('saved');
    } catch (err: any) {
      console.error(`[SupabaseStorageAdapter] Failed to delete campaign ${campaignId}:`, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

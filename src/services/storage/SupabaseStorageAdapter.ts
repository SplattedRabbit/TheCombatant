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
    const storedCharId = typeof localStorage !== 'undefined' ? localStorage.getItem(`dnd_active_char_${userId}`) : null;
    const storedCampId = typeof localStorage !== 'undefined' ? localStorage.getItem(`dnd_active_camp_${userId}`) : null;
    this.activeCharacterId = options?.activeCharacterId || storedCharId || null;
    this.activeCampaignId = options?.activeCampaignId || storedCampId || null;
    this.debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  }

  public setCharacterId(characterId: string | null): void {
    this.setActiveCharacterId(characterId);
  }

  public getCharacterId(): string | null {
    return this.activeCharacterId;
  }

  public setActiveCharacterId(characterId: string | null): void {
    this.activeCharacterId = characterId;
    try {
      if (typeof localStorage !== 'undefined') {
        if (characterId) {
          localStorage.setItem(`dnd_active_char_${this.userId}`, characterId);
        } else {
          localStorage.removeItem(`dnd_active_char_${this.userId}`);
        }
      }
    } catch {}
  }

  public getActiveCharacterId(): string | null {
    return this.activeCharacterId;
  }

  public setCampaignId(campaignId: string | null): void {
    this.setActiveCampaignId(campaignId);
  }

  public getCampaignId(): string | null {
    return this.activeCampaignId;
  }

  public setActiveCampaignId(campaignId: string | null): void {
    this.activeCampaignId = campaignId;
    try {
      if (typeof localStorage !== 'undefined') {
        if (campaignId) {
          localStorage.setItem(`dnd_active_camp_${this.userId}`, campaignId);
        } else {
          localStorage.removeItem(`dnd_active_camp_${this.userId}`);
        }
      }
    } catch {}
  }

  public getActiveCampaignId(): string | null {
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

  private notify(status: SyncStatus, error?: Error): void {
    if (status === 'saved') {
      this.lastSyncedAt = new Date();
    }

    const event: SyncStatusEvent = {
      status,
      adapterName: this.name,
      lastSyncedAt: this.lastSyncedAt,
      error: error || null,
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

    const stateToSave = this.pendingStateToSave || this.loadFromLocalCache();
    if (!stateToSave) {
      return;
    }

    this.pendingStateToSave = null;
    this.activeSavePromise = this.performCloudSave(stateToSave);
    try {
      await this.activeSavePromise;
    } catch (err) {
      this.pendingStateToSave = stateToSave; // restore for retry
      throw err;
    } finally {
      this.activeSavePromise = null;
    }
  }

  private async performCloudSave(state: any): Promise<void> {
    try {
      this.notify('saving');
      const isDmSession = state?.session?.role === 'host' || state?.mode === 'dm';
      console.log(`%c[SupabaseStorage] Performing cloud save (${isDmSession ? 'DM Campaign: ' + (this.activeCampaignId || 'new') : 'PC Character: ' + (this.activeCharacterId || 'new')}) for user: ${this.userId}`, 'color: #0284c7;');

      if (isDmSession) {
        const encounterName = state?.meta?.begegnung || 'Campaign';

        if (!this.activeCampaignId) {
          // Check if an existing campaign by this name exists before inserting
          const { data: existingCamp } = await this.client
            .from('campaigns')
            .select('id')
            .eq('dm_user_id', this.userId)
            .eq('name', encounterName)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingCamp?.id) {
            this.setActiveCampaignId(existingCamp.id);
          }
        }

        if (this.activeCampaignId) {
          const { error } = await this.client
            .from('campaigns')
            .update({
              name: encounterName,
              active_encounter_state: state,
              updated_at: new Date().toISOString(),
            })
            .eq('id', this.activeCampaignId)
            .eq('dm_user_id', this.userId);

          if (error) throw error;
          console.log('%c[SupabaseStorage] Updated active campaign successfully:', 'color: #059669;', this.activeCampaignId);
        } else {
          console.log('%c[SupabaseStorage] No active campaign selected, skipping auto-campaign creation', 'color: #6b7280;');
        }
      } else {
        // Player Character Mode: find active PC from combatants
        const pc = (state?.combatants || []).find((c: any) => c.type === 'p') || null;
        const charName = pc?.name || 'Hero';
        const charLevel = typeof pc?.level === 'number' ? pc.level : 1;
        const classSummary = pc?.classSummary || pc?.class_summary || (Array.isArray(pc?.classes) ? pc.classes.map((c: any) => `${c.name || c.classType} ${c.level}`).join(' / ') : '');

        if (!this.activeCharacterId) {
          try {
            // Check if an existing character by this name exists for this user before inserting a duplicate
            const { data: existingChar } = await this.client
              .from('characters')
              .select('id')
              .eq('user_id', this.userId)
              .eq('name', charName)
              .eq('is_active', true)
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (existingChar?.id) {
              this.setActiveCharacterId(existingChar.id);
            }
          } catch {
            // Ignore pre-check query error and proceed with save
          }
        }

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
          console.log('%c[SupabaseStorage] Updated character successfully:', 'color: #059669;', this.activeCharacterId);
        } else {
          // Upsert character with consistent unique ID
          const newCharId = generateUUID();
          const { data, error } = await this.client
            .from('characters')
            .upsert(
              {
                id: newCharId,
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
            this.setActiveCharacterId(data.id);
          }
          console.log('%c[SupabaseStorage] Created/saved character successfully:', 'color: #059669;', this.activeCharacterId);
        }
      }

      this.notify('saved');
    } catch (err: any) {
      console.error('[SupabaseStorage] Cloud save failed | Code:', err?.code, '| Message:', err?.message, '| Details:', err?.details, '| Hint:', err?.hint, err);
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

  async saveCampaign(
    campaignId: string,
    encounterState: any,
    metadata?: { name?: string; description?: string; inviteCode?: string }
  ): Promise<void> {
    try {
      this.notify('saving');
      const validId = campaignId || this.activeCampaignId || generateUUID();
      const encounterName = metadata?.name || encounterState?.meta?.begegnung || 'Campaign';
      const cleanInviteCode = metadata?.inviteCode || encounterState?.inviteCode || `CAMP-${Math.floor(100 + Math.random() * 900)}`;
      const description = metadata?.description ?? (encounterState?.meta?.description || '');

      console.log(`%c[SupabaseStorage] Saving campaign ${validId} ("${encounterName}" | ${cleanInviteCode}) for DM: ${this.userId}`, 'color: #0284c7;');
      const { error } = await this.client
        .from('campaigns')
        .upsert(
          {
            id: validId,
            dm_user_id: this.userId,
            name: encounterName,
            description,
            invite_code: cleanInviteCode,
            active_encounter_state: encounterState,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) throw error;
      this.setActiveCampaignId(validId);
      console.log('%c[SupabaseStorage] Campaign saved successfully:', 'color: #059669;', validId);
      this.notify('saved');
    } catch (err: any) {
      console.error('[SupabaseStorage] Failed to save campaign:', campaignId, '| Error:', err?.message || err, err);
      this.notify('error', err instanceof Error ? err : new Error(String(err?.message || err)));
      throw err;
    }
  }

  async loadCampaign(campaignId: string): Promise<any | null> {
    try {
      console.log(`%c[SupabaseStorage] Loading campaign ${campaignId} for DM: ${this.userId}`, 'color: #0284c7;');
      const { data, error } = await this.client
        .from('campaigns')
        .select('active_encounter_state')
        .eq('id', campaignId)
        .eq('dm_user_id', this.userId)
        .single();

      if (error) throw error;
      console.log('%c[SupabaseStorage] Campaign loaded successfully:', 'color: #059669;', campaignId);
      return data?.active_encounter_state ?? null;
    } catch (err: any) {
      console.error('[SupabaseStorage] Failed to load campaign:', campaignId, '| Error:', err?.message || err, err);
      return null;
    }
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    try {
      console.log(`%c[SupabaseStorage] Listing campaigns for DM: ${this.userId}`, 'color: #0284c7;');
      const { data, error } = await this.client
        .from('campaigns')
        .select('*')
        .eq('dm_user_id', this.userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      console.log(`%c[SupabaseStorage] Loaded ${data?.length || 0} campaigns from cloud`, 'color: #059669;');

      return (data || []).map((row: any) => {
        const rawEncounter = row.active_encounter_state || {};
        const combatants = Array.isArray(rawEncounter.combatants) ? rawEncounter.combatants : [];
        const meta = rawEncounter.meta || {};

        return {
          id: row.id,
          dmUserId: row.dm_user_id,
          name: row.name || meta.begegnung || 'Campaign',
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
    } catch (err: any) {
      console.error('[SupabaseStorage] Failed to list campaigns from cloud | Error:', err?.message || err, err);
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

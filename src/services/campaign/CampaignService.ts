/**
 * @module    CampaignService
 * @summary   Central service for Dungeon Master multi-campaign management and session isolation.
 *            Coordinates campaign listing, creation, duplication, deletion,
 *            invite-code generation, and zero-loss encounter switching.
 */

import type { CampaignSummary, CampaignMember, CampaignCreateInput, CampaignFilterOptions } from '../../types/campaign.ts';
import { storageService } from '../storage/StorageService.ts';
import { supabase as defaultSupabaseClient } from '../supabase/supabaseClient.ts';
import { generateUUID } from '../../utils/uuid.ts';
// @ts-ignore
import { applyLoadedState } from '../../../js/state/StorageManager.js';
// @ts-ignore
import { createInitialState } from '../../../js/models/model-core.js';
// @ts-ignore
import { getState, StateEvents } from '../../../js/state/state-core.js';

export function generateInviteCode(campaignName: string = ''): string {
  const cleanName = campaignName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prefix = cleanName.length >= 3 ? cleanName.slice(0, 5) : 'QUEST';
  const num = Math.floor(10 + Math.random() * 90);
  return `${prefix}-${num}`;
}

export class CampaignService {
  private static instance: CampaignService | null = null;

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  /**
   * Returns list of all available campaigns from the active storage adapter.
   */
  public async listCampaigns(filter?: CampaignFilterOptions): Promise<CampaignSummary[]> {
    const adapter = storageService.getAdapter();
    let campaigns: CampaignSummary[] = [];

    if (typeof adapter.listCampaigns === 'function') {
      const res = adapter.listCampaigns();
      campaigns = res instanceof Promise ? await res : res;
    }

    // Apply filtering & sorting
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim();
      campaigns = campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.inviteCode.toLowerCase().includes(q) ||
          (c.location && c.location.toLowerCase().includes(q))
      );
    }

    if (filter?.sortBy) {
      const dir = filter.sortDirection === 'asc' ? 1 : -1;
      campaigns.sort((a, b) => {
        if (filter.sortBy === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        if (filter.sortBy === 'round') {
          return (a.round - b.round) * dir;
        }
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      });
    }

    return campaigns;
  }

  /**
   * Fetches full campaign encounter state by ID.
   */
  public async getCampaign(campaignId: string): Promise<any | null> {
    const adapter = storageService.getAdapter();
    if (typeof adapter.loadCampaign === 'function') {
      const res = adapter.loadCampaign(campaignId);
      return res instanceof Promise ? await res : res;
    }
    return null;
  }

  /**
   * Creates a new campaign in the active storage adapter.
   */
  public async createCampaign(input: CampaignCreateInput): Promise<CampaignSummary> {
    const adapter = storageService.getAdapter();
    const campaignId = generateUUID();
    const inviteCode = input.inviteCode || generateInviteCode(input.name);

    let encounterState = input.initialState;
    if (!encounterState) {
      const fresh = createInitialState();
      fresh.session = { role: 'host' };
      fresh.meta = {
        begegnung: input.name,
        ort: 'Dungeon',
        xpBudget: '',
        xpVerteilt: '',
        sitzung: '1',
      };
      fresh.combatants = [];
      fresh.round = 1;
      fresh.activeIdx = 0;
      encounterState = fresh;
    }

    if (typeof adapter.saveCampaign === 'function') {
      const res = adapter.saveCampaign(campaignId, encounterState);
      if (res instanceof Promise) await res;
    }

    const summary: CampaignSummary = {
      id: campaignId,
      dmUserId: storageService.getCurrentUserId() || 'local-guest',
      name: input.name,
      description: input.description || '',
      inviteCode,
      combatantCount: Array.isArray(encounterState?.combatants) ? encounterState.combatants.length : 0,
      round: typeof encounterState?.round === 'number' ? encounterState.round : 1,
      turn: typeof encounterState?.activeIdx === 'number' ? encounterState.activeIdx : 0,
      encounterName: encounterState?.meta?.begegnung || input.name,
      location: encounterState?.meta?.ort || 'Dungeon',
      memberCount: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentActive: false,
    };

    return summary;
  }

  /**
   * Duplicates an existing campaign with all monsters, initiative, and encounters cloned.
   */
  public async duplicateCampaign(campaignId: string, newName?: string): Promise<CampaignSummary> {
    const existing = await this.getCampaign(campaignId);
    if (!existing) {
      throw new Error(`Kampagne ${campaignId} nicht gefunden.`);
    }

    const cloned = JSON.parse(JSON.stringify(existing));
    const targetName = newName || `${existing?.meta?.begegnung || 'Kampagne'} (Kopie)`;
    if (cloned.meta) {
      cloned.meta.begegnung = targetName;
    }

    return this.createCampaign({
      name: targetName,
      description: `Kopie von Kampagne ${campaignId}`,
      initialState: cloned,
    });
  }

  /**
   * Deletes a campaign by ID. If active, switches to fallback or creates default.
   */
  public async deleteCampaign(campaignId: string): Promise<void> {
    const adapter = storageService.getAdapter();
    const currentActiveId = typeof adapter.getActiveCampaignId === 'function' ? adapter.getActiveCampaignId() : null;

    if (typeof adapter.deleteCampaign === 'function') {
      const res = adapter.deleteCampaign(campaignId);
      if (res instanceof Promise) await res;
    }

    if (currentActiveId === campaignId) {
      const remaining = await this.listCampaigns();
      if (remaining.length > 0) {
        await this.switchActiveCampaign(remaining[0].id);
      } else {
        const fresh = await this.createCampaign({ name: 'Neue Kampagne' });
        await this.switchActiveCampaign(fresh.id);
      }
    }
  }

  /**
   * Zero-Loss Campaign & Encounter Switching:
   * Flushes current encounter saves -> loads target encounter state -> updates activeCampaignId -> hydriert CombatState.
   */
  public async switchActiveCampaign(campaignId: string): Promise<boolean> {
    try {
      const adapter = storageService.getAdapter();

      // 1. Flush pending saves of the current campaign
      await storageService.flushPendingSaves();

      // 2. Load target campaign encounter state
      const targetState = await this.getCampaign(campaignId);
      if (!targetState) {
        console.warn(`[CampaignService] Could not find encounter state for campaign ${campaignId}`);
        return false;
      }

      // 3. Update adapter pointer
      if (typeof adapter.setActiveCampaignId === 'function') {
        adapter.setActiveCampaignId(campaignId);
      }

      // 4. Hydrate in-memory state
      applyLoadedState(targetState);

      // 5. Emit state change events
      StateEvents.emit('state_changed', getState());
      StateEvents.emit('encounter_changed', getState());

      return true;
    } catch (err) {
      console.error(`[CampaignService] Failed to switch to campaign ${campaignId}:`, err);
      return false;
    }
  }

  /**
   * Allows a player to join a campaign using its unique invite code.
   */
  public async joinCampaignByCode(inviteCode: string, characterId?: string | null): Promise<CampaignMember | null> {
    try {
      const cleanCode = inviteCode.trim().toUpperCase();
      const client = defaultSupabaseClient;

      // 1. Search campaign by invite_code
      const { data: campaign, error } = await client
        .from('campaigns')
        .select('id, name')
        .eq('invite_code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !campaign) {
        console.warn(`[CampaignService] No active campaign found with code ${cleanCode}`);
        return null;
      }

      const currentUserId = storageService.getCurrentUserId() || 'guest-player';

      // 2. Insert or update membership
      const { data: member, error: memberError } = await (client.from('campaign_members') as any)
        .upsert({
          campaign_id: (campaign as any).id,
          user_id: currentUserId,
          character_id: characterId || null,
          role: 'PLAYER',
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (memberError || !member) {
        throw memberError || new Error('Failed to join campaign');
      }

      return {
        id: member.id,
        campaignId: member.campaign_id,
        userId: member.user_id,
        characterId: member.character_id,
        role: member.role as 'PLAYER',
        joinedAt: member.joined_at,
      };
    } catch (err) {
      console.error(`[CampaignService] Error joining campaign with code ${inviteCode}:`, err);
      return null;
    }
  }

  /**
   * Returns current active campaign ID.
   */
  public getActiveCampaignId(): string | null {
    const adapter = storageService.getAdapter();
    if (typeof adapter.getActiveCampaignId === 'function') {
      return adapter.getActiveCampaignId();
    }
    return null;
  }
}

export const campaignService = CampaignService.getInstance();

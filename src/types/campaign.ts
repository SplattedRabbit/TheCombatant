/**
 * @module    campaign
 * @summary   Type definitions and contracts for DM campaign summaries, members,
 *            encounter metadata, and multi-campaign management.
 */

export interface CampaignSummary {
  id: string;
  dmUserId: string;
  name: string;
  description?: string;
  inviteCode: string;
  combatantCount: number;
  round: number;
  turn?: number;
  encounterName?: string;
  location?: string;
  memberCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentActive?: boolean;
}

export interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  characterId?: string | null;
  characterName?: string;
  role: 'DM' | 'PLAYER' | 'SPECTATOR';
  joinedAt: string;
}

export interface CampaignCreateInput {
  name: string;
  description?: string;
  inviteCode?: string;
  initialState?: any;
}

export interface CampaignFilterOptions {
  searchQuery?: string;
  sortBy?: 'updated_at' | 'name' | 'round';
  sortDirection?: 'asc' | 'desc';
}

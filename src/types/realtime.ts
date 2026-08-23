/**
 * @module    realtime
 * @summary   Type definitions for Supabase Realtime WebSocket synchronization,
 *            presence tracking, broadcast events, and table status.
 */

export type RealtimeConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export type RealtimeEventType =
  | 'diff'
  | 'dice_roll'
  | 'turn_change'
  | 'pc_sync'
  | 'full_sync_request'
  | 'full_sync_response';

export interface RealtimeEnvelope<T = any> {
  eventId: string;
  eventType: RealtimeEventType;
  senderId: string;
  senderName: string;
  campaignId: string;
  timestamp: number;
  payload: T;
}

export interface RealtimeDiffPayload {
  diff: Record<string, any>;
  seq: number;
  version?: number;
}

export interface RealtimeDicePayload {
  rollerId: string;
  rollerName: string;
  rollType: 'init' | 'attack' | 'damage' | 'save' | 'skill' | 'custom';
  formula: string;
  total: number;
  diceResults?: number[];
  crit?: boolean;
  fumble?: boolean;
  label?: string;
}

export interface RealtimeTurnPayload {
  round: number;
  activeIdx: number;
  activeCombatantId?: string;
  activeCombatantName?: string;
}

export interface TablePresenceUser {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  role: 'host' | 'player';
  characterId?: string;
  characterName?: string;
  joinedAt: string;
  lastSeenAt: string;
  isOnline?: boolean;
}

export type RealtimePresenceListener = (users: TablePresenceUser[]) => void;
export type RealtimeEventListener<T = any> = (envelope: RealtimeEnvelope<T>) => void;
export type RealtimeStatusListener = (status: RealtimeConnectionStatus, error?: Error | null) => void;

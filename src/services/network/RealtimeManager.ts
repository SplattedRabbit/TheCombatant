/**
 * @module    RealtimeManager
 * @summary   Singleton service managing Supabase Realtime WebSocket channels,
 *            table presence, broadcast event delivery, and low-latency state diffs (<30ms).
 */

import { supabase as defaultClient } from '../supabase/supabaseClient.ts';
import { generateUUID } from '../../utils/uuid.ts';
import type {
  RealtimeConnectionStatus,
  RealtimeEventType,
  RealtimeEnvelope,
  RealtimeDiffPayload,
  RealtimeDicePayload,
  RealtimeTurnPayload,
  TablePresenceUser,
  RealtimePresenceListener,
  RealtimeEventListener,
  RealtimeStatusListener,
} from '../../types/realtime.ts';

export interface RealtimeManagerOptions {
  client?: any;
}

export class RealtimeManager {
  private static instance: RealtimeManager | null = null;

  private client: any;
  private activeChannel: any | null = null;
  private currentCampaignId: string | null = null;
  private currentUserId: string | null = null;
  private currentRole: 'host' | 'player' = 'player';
  private currentUserProfile: Partial<TablePresenceUser> = {};

  private status: RealtimeConnectionStatus = 'disconnected';
  private lastError: Error | null = null;

  private seqNumber = 0;
  private processedEventIds = new Set<string>();

  private presenceListeners = new Set<RealtimePresenceListener>();
  private eventListeners = new Map<RealtimeEventType | '*', Set<RealtimeEventListener>>();
  private statusListeners = new Set<RealtimeStatusListener>();

  public constructor(options?: RealtimeManagerOptions) {
    this.client = options?.client || defaultClient;
  }

  public static getInstance(options?: RealtimeManagerOptions): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager(options);
    } else if (options?.client) {
      RealtimeManager.instance.client = options.client;
    }
    return RealtimeManager.instance;
  }

  /**
   * Returns current active connection status.
   */
  public getStatus(): RealtimeConnectionStatus {
    return this.status;
  }

  /**
   * Returns active campaign ID if connected.
   */
  public getActiveCampaignId(): string | null {
    return this.currentCampaignId;
  }

  /**
   * Returns current campaign ID.
   */
  public getCampaignId(): string | null {
    return this.currentCampaignId;
  }

  /**
   * Alias to broadcast a generic event.
   */
  public async broadcastEvent<T = any>(eventType: RealtimeEventType, payload: T): Promise<boolean> {
    return this.broadcast(eventType, payload);
  }

  /**
   * Returns current assigned role in the active room.
   */
  public getCurrentRole(): 'host' | 'player' {
    return this.currentRole;
  }

  /**
   * Joins a campaign WebSocket room via Supabase Realtime Channels.
   */
  public async joinCampaign(
    campaignId: string,
    role: 'host' | 'player',
    userProfile: {
      userId: string;
      userName: string;
      userAvatarUrl?: string;
      characterId?: string;
      characterName?: string;
    }
  ): Promise<boolean> {
    if (!campaignId) {
      console.warn('[RealtimeManager] Cannot join empty campaignId');
      return false;
    }

    // Leave existing channel if switching rooms, roles, or reconnecting
    if (
      this.activeChannel && 
      this.currentCampaignId === campaignId && 
      this.currentRole === role && 
      this.status === 'connected'
    ) {
      return true; // Already joined with same role and connected
    } else if (this.activeChannel) {
      await this.leaveCampaign();
    }

    this.currentCampaignId = campaignId;
    this.currentUserId = userProfile.userId;
    this.currentRole = role;
    this.currentUserProfile = userProfile;
    this.updateStatus('connecting');

    try {
      if (!this.client || typeof this.client.channel !== 'function') {
        console.warn('[RealtimeManager] No Realtime client available, fallback to offline');
        this.updateStatus('disconnected');
        return false;
      }

      const channelName = `campaign:${campaignId}`;
      const channel = this.client.channel(channelName, {
        config: {
          presence: {
            key: userProfile.userId,
          },
        },
      });

      // 1. Broadcast Listener
      channel.on(
        'broadcast',
        { event: 'combat_event' },
        ({ payload }: { payload: RealtimeEnvelope }) => {
          this.handleIncomingEnvelope(payload);
        }
      );

      // 2. Presence Listeners
      channel.on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync(channel);
      });

      channel.on('presence', { event: 'join' }, () => {
        this.handlePresenceSync(channel);
      });

      channel.on('presence', { event: 'leave' }, () => {
        this.handlePresenceSync(channel);
      });

      // 3. Subscribe & Track
      await new Promise<void>((resolve, reject) => {
        channel.subscribe(async (status: string, err?: any) => {
          if (status === 'SUBSCRIBED') {
            this.activeChannel = channel;
            this.updateStatus('connected');

            // Track presence
            const presencePayload: TablePresenceUser = {
              userId: userProfile.userId,
              userName: userProfile.userName,
              userAvatarUrl: userProfile.userAvatarUrl,
              role,
              characterId: userProfile.characterId,
              characterName: userProfile.characterName,
              joinedAt: new Date().toISOString(),
              lastSeenAt: new Date().toISOString(),
            };

            try {
              if (typeof channel.track === 'function') {
                await channel.track(presencePayload);
              }
            } catch (trackErr) {
              console.warn('[RealtimeManager] Presence track warning:', trackErr);
            }

            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            const error = err instanceof Error ? err : new Error(`Subscription failed: ${status}`);
            this.lastError = error;
            this.updateStatus('error', error);
            reject(error);
          } else if (status === 'CLOSED') {
            this.updateStatus('disconnected');
          }
        });
      });

      return true;
    } catch (err: any) {
      console.error('[RealtimeManager] Failed to join campaign channel:', err);
      this.updateStatus('error', err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  /**
   * Leaves active campaign channel and clears presence.
   */
  public async leaveCampaign(): Promise<void> {
    if (this.activeChannel) {
      try {
        if (typeof this.activeChannel.untrack === 'function') {
          await this.activeChannel.untrack();
        }
        if (typeof this.activeChannel.unsubscribe === 'function') {
          await this.activeChannel.unsubscribe();
        }
      } catch (err) {
        console.warn('[RealtimeManager] Error while leaving channel:', err);
      }
      this.activeChannel = null;
    }

    this.currentCampaignId = null;
    this.updateStatus('disconnected');
    this.notifyPresence([]);
  }

  /**
   * Broadcasts an incremental state diff to all peers at the table.
   */
  public async broadcastDiff(diff: Record<string, any>): Promise<boolean> {
    const payload: RealtimeDiffPayload = {
      diff,
      seq: ++this.seqNumber,
    };
    return this.broadcast('diff', payload);
  }

  /**
   * Broadcasts a live dice roll event.
   */
  public async broadcastDiceRoll(roll: Omit<RealtimeDicePayload, 'rollerId'>): Promise<boolean> {
    const payload: RealtimeDicePayload = {
      ...roll,
      rollerId: this.currentUserId || 'local',
    };
    return this.broadcast('dice_roll', payload);
  }

  /**
   * Broadcasts a turn/round advancement event.
   */
  public async broadcastTurnChange(turn: RealtimeTurnPayload): Promise<boolean> {
    return this.broadcast('turn_change', turn);
  }

  /**
   * Low-level envelope broadcaster.
   */
  public async broadcast<T>(eventType: RealtimeEventType, payload: T): Promise<boolean> {
    if (!this.activeChannel || this.status !== 'connected') {
      return false;
    }

    const envelope: RealtimeEnvelope<T> = {
      eventId: generateUUID(),
      eventType,
      senderId: this.currentUserId || 'local',
      senderName: this.currentUserProfile.userName || 'Abenteurer',
      campaignId: this.currentCampaignId || '',
      timestamp: Date.now(),
      payload,
    };

    // Mark our own event as processed to prevent local echo
    this.processedEventIds.add(envelope.eventId);
    this.pruneEventCache();

    try {
      if (typeof this.activeChannel.send === 'function') {
        await this.activeChannel.send({
          type: 'broadcast',
          event: 'combat_event',
          payload: envelope,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[RealtimeManager] Failed to broadcast event ${eventType}:`, err);
      return false;
    }
  }

  /**
   * Subscribes to table presence changes (connected players).
   */
  public onPresenceChange(listener: RealtimePresenceListener): () => void {
    this.presenceListeners.add(listener);
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  /**
   * Subscribes to specific broadcast events (or '*' for all).
   */
  public onEvent<T = any>(
    eventType: RealtimeEventType | '*',
    listener: RealtimeEventListener<T>
  ): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    const set = this.eventListeners.get(eventType)!;
    set.add(listener as RealtimeEventListener);

    return () => {
      set.delete(listener as RealtimeEventListener);
    };
  }

  /**
   * Subscribes to connection status changes.
   */
  public onStatusChange(listener: RealtimeStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.lastError);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  // --- Internal Handlers ---

  private handleIncomingEnvelope(envelope: RealtimeEnvelope): void {
    if (!envelope || !envelope.eventId) return;

    // Echo prevention: Ignore events sent by ourselves or already processed
    if (envelope.senderId === this.currentUserId || this.processedEventIds.has(envelope.eventId)) {
      return;
    }

    this.processedEventIds.add(envelope.eventId);
    this.pruneEventCache();

    // Dispatch to specific listeners
    const specific = this.eventListeners.get(envelope.eventType);
    if (specific) {
      for (const listener of specific) {
        try {
          listener(envelope);
        } catch (err) {
          console.error(`[RealtimeManager] Error in event listener (${envelope.eventType}):`, err);
        }
      }
    }

    // Dispatch to catch-all '*' listeners
    const wildcard = this.eventListeners.get('*');
    if (wildcard) {
      for (const listener of wildcard) {
        try {
          listener(envelope);
        } catch (err) {
          console.error('[RealtimeManager] Error in wildcard event listener:', err);
        }
      }
    }
  }

  private handlePresenceSync(channel: any): void {
    if (!channel || typeof channel.presenceState !== 'function') return;

    try {
      const state = channel.presenceState();
      const users: TablePresenceUser[] = [];

      for (const key of Object.keys(state)) {
        const presences = state[key];
        if (Array.isArray(presences) && presences.length > 0) {
          const p = presences[0] as TablePresenceUser;
          users.push({
            userId: p.userId || key,
            userName: p.userName || 'Abenteurer',
            userAvatarUrl: p.userAvatarUrl,
            role: p.role || 'player',
            characterId: p.characterId,
            characterName: p.characterName,
            joinedAt: p.joinedAt || new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            isOnline: true,
          });
        }
      }

      this.notifyPresence(users);
    } catch (err) {
      console.warn('[RealtimeManager] Error parsing presence state:', err);
    }
  }

  private notifyPresence(users: TablePresenceUser[]): void {
    for (const listener of this.presenceListeners) {
      try {
        listener(users);
      } catch (err) {
        console.error('[RealtimeManager] Error in presence listener:', err);
      }
    }
  }

  private updateStatus(newStatus: RealtimeConnectionStatus, error: Error | null = null): void {
    this.status = newStatus;
    this.lastError = error;
    for (const listener of this.statusListeners) {
      try {
        listener(newStatus, error);
      } catch (err) {
        console.error('[RealtimeManager] Error in status listener:', err);
      }
    }
  }

  private pruneEventCache(): void {
    if (this.processedEventIds.size > 200) {
      const arr = Array.from(this.processedEventIds);
      this.processedEventIds = new Set(arr.slice(-100));
    }
  }
}

export const realtimeManager = RealtimeManager.getInstance();

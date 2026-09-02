/**
 * @module    RealtimeSyncBridge
 * @summary   Bridge connecting the vanilla CombatState / SyncProtocol with
 *            the Supabase RealtimeManager service for bi-directional live updates.
 */

import { realtimeManager } from './RealtimeManager.ts';
import { getState, StateEvents, getActivePC } from '../../../js/state/state-core.js';
import { onStateSave, saveToStorage } from '../../../js/state/StorageManager.js';
import * as EncounterManager from '../../../js/state/EncounterManager.js';
import { applyIncomingDelta, getEncounterStateDiff, getPCStateDiff, isProcessingNetworkIncoming } from '../../../js/network/SyncProtocol.js';
import { logger } from '../../utils/logger.ts';

let isBridgeInitialized = false;

export function initRealtimeSyncBridge(): void {
  if (isBridgeInitialized) return;
  isBridgeInitialized = true;

  // Automatically broadcast local mutations to connected peers
  onStateSave(() => {
    broadcastStateChanges();
  });

  // 1. Listen for incoming Realtime diffs from remote peers
  realtimeManager.onEvent('diff', (envelope) => {
    if (!envelope || !envelope.payload || !envelope.payload.diff) return;

    try {
      const state = getState();
      const role = state?.session?.role === 'host' ? 'host' : 'client';
      const packet = envelope.payload.diff;

      applyIncomingDelta(packet, role);
      StateEvents.emit('pc_changed', getActivePC());
      StateEvents.emit('state_changed', getState());
    } catch (err) {
      logger.error('[RealtimeSyncBridge] Error applying incoming diff:', err);
    }
  });

  // 2. Listen for incoming turn / round advancements
  realtimeManager.onEvent('turn_change', (envelope) => {
    if (!envelope || !envelope.payload) return;

    try {
      const state = getState();
      if (typeof envelope.payload.round === 'number') {
        state.round = envelope.payload.round;
      }
      if (typeof envelope.payload.activeIdx === 'number') {
        state.turn = envelope.payload.activeIdx;
      }
      StateEvents.emit('state_changed', state);
    } catch (err) {
      logger.error('[RealtimeSyncBridge] Error applying turn change:', err);
    }
  });

  // 3. Listen for direct PC sync payloads (DM side receives full PC sheet)
  realtimeManager.onEvent('pc_sync', (envelope) => {
    if (!envelope || !envelope.payload || !envelope.payload.pc) return;

    try {
      const state = getState();
      const isHost = state?.session?.role === 'host' || state?.mode === 'dm';
      if (isHost) {
        logger.log('%c[RealtimeSyncBridge] Received pc_sync on DM for player:', 'color: #059669;', envelope.payload.pc?.name);
        EncounterManager.mergeIncomingPC(envelope.payload.pc);
        saveToStorage();
        StateEvents.emit('state_changed', getState());
        StateEvents.emit('combatants_changed', getState().combatants);
      }
    } catch (err) {
      logger.error('[RealtimeSyncBridge] Error handling incoming pc_sync:', err);
    }
  });

  // 4. Listen for sync requests from host
  realtimeManager.onEvent('request_pc_sync', (envelope) => {
    const state = getState();
    const isPlayer = state?.session?.role !== 'host' && state?.mode !== 'dm';
    if (isPlayer) {
      const targetUserId = envelope?.payload?.targetUserId;
      const myUserId = (realtimeManager as any).currentUserId;
      if (!targetUserId || targetUserId === myUserId) {
        logger.log('[RealtimeSyncBridge] Host requested PC sync, broadcasting active character...');
        broadcastActivePC();
      }
    }
  });

  // 5. Presence change: bidirectional presence handshake
  realtimeManager.onPresenceChange((users) => {
    const state = getState();
    const isHost = state?.session?.role === 'host' || state?.mode === 'dm';

    if (isHost) {
      // Check if any player at the table is missing from DM combatants
      const missingPlayer = users.find((u) => 
        u.role === 'player' && 
        !state.combatants.some((c: any) => c.id === u.characterId || c.name === u.characterName || c.name === u.userName)
      );
      if (missingPlayer) {
        logger.log('[RealtimeSyncBridge] Detected connected player missing in combatants, requesting PC sheet:', missingPlayer.characterName || missingPlayer.userName);
        realtimeManager.broadcastEvent('request_pc_sync', { targetUserId: missingPlayer.userId });
      }
    } else {
      const hasHost = users.some((u) => u.role === 'host');
      if (hasHost) {
        broadcastActivePC();
      }
    }
  });
}

/**
 * Broadcasts the active PC to the host table (used upon joining or changing character).
 */
export function broadcastActivePC(): void {
  const tryBroadcast = () => {
    try {
      const pc = getActivePC();
      if (pc) {
        realtimeManager.broadcastEvent('pc_sync', { pc });
        logger.log('%c[RealtimeSyncBridge] Broadcasted active PC to host:', 'color: #059669;', pc.name);
      }
    } catch (err) {
      logger.error('[RealtimeSyncBridge] Error broadcasting active PC:', err);
    }
  };

  if (realtimeManager.getStatus() === 'connected') {
    tryBroadcast();
    setTimeout(tryBroadcast, 300);
    setTimeout(tryBroadcast, 1000);
  } else {
    // Wait for connection to establish and then broadcast with retries
    const unsubscribe = realtimeManager.onStatusChange((status) => {
      if (status === 'connected') {
        tryBroadcast();
        setTimeout(tryBroadcast, 300);
        setTimeout(tryBroadcast, 1000);
        unsubscribe();
      }
    });
    // Fallback timeout
    setTimeout(() => {
      if (realtimeManager.getStatus() === 'connected') {
        tryBroadcast();
      }
    }, 600);
  }
}

/**
 * Broadcasts local state differences to all connected peers if currently connected to a Realtime room.
 */
export function broadcastStateChanges(): void {
  if (isProcessingNetworkIncoming || realtimeManager.getStatus() !== 'connected') {
    return;
  }

  try {
    const state = getState();
    const isHost = state?.session?.role === 'host' || state?.mode === 'dm';
    const packet = isHost ? getEncounterStateDiff() : getPCStateDiff();

    if (packet) {
      realtimeManager.broadcastDiff(packet);
    }
  } catch (err) {
    console.error('[RealtimeSyncBridge] Failed to broadcast local state changes:', err);
  }
}

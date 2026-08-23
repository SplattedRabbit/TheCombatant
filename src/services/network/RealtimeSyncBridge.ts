/**
 * @module    RealtimeSyncBridge
 * @summary   Bridge connecting the vanilla CombatState / SyncProtocol with
 *            the Supabase RealtimeManager service for bi-directional live updates.
 */

import { realtimeManager } from './RealtimeManager.ts';
// @ts-ignore
import { getState, StateEvents, getActivePC } from '../../../js/state/state-core.js';
// @ts-ignore
import { onStateSave } from '../../../js/state/StorageManager.js';
// @ts-ignore
import { applyIncomingDelta, getEncounterStateDiff, getPCStateDiff, isProcessingNetworkIncoming } from '../../../js/network/SyncProtocol.js';

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
      console.error('[RealtimeSyncBridge] Error applying incoming diff:', err);
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
      console.error('[RealtimeSyncBridge] Error applying turn change:', err);
    }
  });
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

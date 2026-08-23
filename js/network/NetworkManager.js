/**
 * @module    NetworkManager
 * @summary   Legacy network shim for backwards compatibility.
 *            All live realtime communication is now handled via RealtimeManager (Supabase WebSockets).
 */

import { realtimeManager } from '../../src/services/network/RealtimeManager.ts';

export function cleanupPeer() {
  realtimeManager.leaveCampaign();
}

export function broadcastToClients(packet) {
  realtimeManager.broadcastDiff(packet);
}

export function sendToHost(packet) {
  realtimeManager.broadcastDiff(packet);
}

export function initializeHostPeer(roomCode) {
  console.log('[NetworkManager] Host peer legacy call redirected to RealtimeManager with room:', roomCode);
}

export function initializeClientPeer(roomCode) {
  console.log('[NetworkManager] Client peer legacy call redirected to RealtimeManager with room:', roomCode);
}

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RealtimeManager } from '../src/services/network/RealtimeManager.ts';
import { initRealtimeSyncBridge } from '../src/services/network/RealtimeSyncBridge.ts';
import { getState, StateEvents } from '../js/state/state-core.js';
import { createInitialState, createCombatant } from '../js/models/model-core.js';

// Hub simulating Supabase Realtime Server connecting multiple clients
class RealtimeMockHub {
  constructor() {
    this.rooms = new Map();
  }

  createClient(userId, userName) {
    const hub = this;

    return {
      channel(channelName) {
        if (!hub.rooms.has(channelName)) {
          hub.rooms.set(channelName, new Set());
        }
        const roomPeers = hub.rooms.get(channelName);
        const listeners = new Map();

        const clientChannel = {
          userId,
          userName,
          on(type, filter, callback) {
            const key = `${type}:${filter?.event || '*'}`;
            if (!listeners.has(key)) listeners.set(key, []);
            listeners.get(key).push(callback);
            return clientChannel;
          },
          subscribe(callback) {
            roomPeers.add(clientChannel);
            setTimeout(() => {
              if (typeof callback === 'function') callback('SUBSCRIBED');
            }, 2);
            return clientChannel;
          },
          async track() {},
          async send(packet) {
            // Broadcast packet to all other peers in the room
            for (const peer of roomPeers) {
              const cbs = peer._getListeners('broadcast:combat_event');
              cbs.forEach((cb) => cb({ payload: packet.payload }));
            }
            return 'ok';
          },
          _getListeners(key) {
            return listeners.get(key) || [];
          },
        };

        return clientChannel;
      },
    };
  }
}

describe('Realtime Multi-Client Sync Integration Suite', () => {
  let hub;
  let dmManager;
  let playerManager;

  beforeEach(() => {
    hub = new RealtimeMockHub();
    dmManager = new RealtimeManager({ client: hub.createClient('dm-1', 'Dungeon Master') });
    playerManager = new RealtimeManager({ client: hub.createClient('player-1', 'Valeros Player') });
  });

  test('6.6.2.1 DM-to-Player Live Sync: DM ändert Monster-HP -> Player empfängt Diff', async () => {
    // 1. DM und Spieler treten demselben Kampagnen-Kanal bei
    await dmManager.joinCampaign('camp-room-1', 'host', { userId: 'dm-1', userName: 'DM' });
    await playerManager.joinCampaign('camp-room-1', 'player', { userId: 'player-1', userName: 'Valeros' });

    const receivedPlayerDiffs = [];
    playerManager.onEvent('diff', (envelope) => {
      receivedPlayerDiffs.push(envelope.payload.diff);
    });

    // 2. DM broadcastet Encounter-Diff (z. B. Goblin erleidet 8 Schaden -> HP = 2)
    const diffPacket = {
      type: 'hp_change',
      id: 'mob-goblin-1',
      delta: 8,
      isHeal: false,
    };

    await dmManager.broadcastDiff(diffPacket);

    // 3. Spieler muss das Diff sofort empfangen haben
    assert.equal(receivedPlayerDiffs.length, 1, 'Spieler muss DM-Diff empfangen');
    assert.equal(receivedPlayerDiffs[0].id, 'mob-goblin-1');
    assert.equal(receivedPlayerDiffs[0].delta, 8);
  });

  test('6.6.2.2 Live Turn Advancement: DM schaltet Runde weiter -> Player aktualisiert', async () => {
    await dmManager.joinCampaign('camp-room-2', 'host', { userId: 'dm-1', userName: 'DM' });
    await playerManager.joinCampaign('camp-room-2', 'player', { userId: 'player-1', userName: 'Valeros' });

    let latestTurnData = null;
    playerManager.onEvent('turn_change', (envelope) => {
      latestTurnData = envelope.payload;
    });

    // DM schaltet auf Runde 3, Turn 2 weiter
    await dmManager.broadcastTurnChange({
      round: 3,
      activeIdx: 2,
      activeCombatantName: 'Kleriker',
    });

    assert.ok(latestTurnData, 'Turn-Event muss beim Spieler ankommen');
    assert.equal(latestTurnData.round, 3);
    assert.equal(latestTurnData.activeIdx, 2);
    assert.equal(latestTurnData.activeCombatantName, 'Kleriker');
  });

  test('6.6.2.3 Live Dice Roll Streaming: Spieler würfelt -> DM empfängt Wurf', async () => {
    await dmManager.joinCampaign('camp-room-3', 'host', { userId: 'dm-1', userName: 'DM' });
    await playerManager.joinCampaign('camp-room-3', 'player', { userId: 'player-1', userName: 'Valeros' });

    let receivedRoll = null;
    dmManager.onEvent('dice_roll', (envelope) => {
      receivedRoll = envelope.payload;
    });

    // Spieler würfelt Angriff
    await playerManager.broadcastDiceRoll({
      rollerName: 'Valeros',
      rollType: 'attack',
      formula: '1w20+8',
      total: 24,
      crit: true,
    });

    assert.ok(receivedRoll, 'DM muss den Wurf des Spielers empfangen');
    assert.equal(receivedRoll.rollerName, 'Valeros');
    assert.equal(receivedRoll.total, 24);
    assert.equal(receivedRoll.crit, true);
  });
});

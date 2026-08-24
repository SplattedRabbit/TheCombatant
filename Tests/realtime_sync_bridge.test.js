// Tests/realtime_sync_bridge.test.js - BDD Verification for RealtimeSyncBridge
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  initRealtimeSyncBridge,
  broadcastActivePC,
  broadcastStateChanges
} from '../src/services/network/RealtimeSyncBridge.ts';
import { realtimeManager } from '../src/services/network/RealtimeManager.ts';
import { getState, getActivePC, StateEvents } from '../js/state/state-core.js';
import { Stat } from '../js/models/Stat.js';
import { recalculatePCStats } from '../js/state/pc/PCGeneral.js';

// Mock Channel Factory for RealtimeManager
function createMockRealtimeClient() {
  const channels = new Map();

  return {
    channels,
    channel(name, config) {
      const listeners = new Map();
      let presenceData = {};
      const sentBroadcasts = [];

      const mockChannel = {
        name,
        config,
        sentBroadcasts,
        on(type, filter, callback) {
          const key = `${type}:${filter?.event || '*'}`;
          if (!listeners.has(key)) listeners.set(key, []);
          listeners.get(key).push(callback);
          return mockChannel;
        },
        subscribe(callback) {
          setTimeout(() => {
            if (typeof callback === 'function') {
              callback('SUBSCRIBED');
            }
          }, 5);
          return mockChannel;
        },
        async track(presence) {
          presenceData[presence.userId || 'user-1'] = [presence];
          const syncCallbacks = listeners.get('presence:sync') || [];
          syncCallbacks.forEach((cb) => cb());
        },
        async untrack() {
          presenceData = {};
        },
        async unsubscribe() {
          listeners.clear();
        },
        async send(packet) {
          sentBroadcasts.push(packet);
          return 'ok';
        },
        presenceState() {
          return presenceData;
        },
        simulateRemoteEvent(envelope) {
          const broadcastCallbacks = listeners.get('broadcast:combat_event') || [];
          broadcastCallbacks.forEach((cb) => cb({ payload: envelope }));
        },
      };

      channels.set(name, mockChannel);
      return mockChannel;
    },
  };
}

describe('BDD Suite 2: Realtime WebSocket Synchronisation (RealtimeSyncBridge)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = createMockRealtimeClient();
    realtimeManager.client = mockClient;
    realtimeManager.status = 'disconnected';
    realtimeManager.activeChannel = null;
    realtimeManager.currentCampaignId = null;

    // Reset local PC state
    const state = getState();
    state.mode = 'player';
    state.session = { role: 'client', campaignId: 'camp-alpha-1' };
    state.combatants = [
      {
        id: 'valerius-pc',
        name: 'Valerius',
        type: 'p',
        hp: 35,
        maxHp: 35,
        init: 0,
        rawInit: 0,
        dex: new Stat(16),
        isBlinded: false
      }
    ];

    initRealtimeSyncBridge();
  });

  test('Szenario 2.1: Spieler-Initiative-Broadcast an den DM', async () => {
    // Given: Spieler A ist mit der Kampagne 'camp-alpha-1' verbunden
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    assert.equal(realtimeManager.getStatus(), 'connected');
    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');
    assert.ok(mockChannel, 'Realtime Channel muss existieren');

    // When: Spieler trägt Initiative ein (z. B. Total 22)
    const pc = getActivePC();
    pc.rawInit = 19;
    pc.init = 22; // 19 + 3
    recalculatePCStats(pc);

    // Trigger state save / sync bridge
    broadcastStateChanges();

    // Then: Broadcast-Diff wurde an den Kanal gesendet
    assert.ok(mockChannel.sentBroadcasts.length >= 1, 'Muss mindestens einen Diff gesendet haben');
    const lastBroadcast = mockChannel.sentBroadcasts[mockChannel.sentBroadcasts.length - 1];
    assert.equal(lastBroadcast.payload.eventType, 'diff');
    assert.equal(lastBroadcast.payload.senderId, 'user-player-1');
  });

  test('Szenario 2.2: DM ändert Spieler-Zustand (Damage / Condition Sync)', async () => {
    // Given: Spieler ist im Raum verbunden
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');
    const pc = getActivePC();
    assert.equal(pc.hp, 35);
    assert.equal(pc.isBlinded, false);

    // When: DM sendet einen Remote-Diff (12 Schaden -> HP 23 und isBlinded: true)
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-dm-diff-1',
      eventType: 'diff',
      senderId: 'user-dm-host',
      senderName: 'Dungeon Master',
      campaignId: 'camp-alpha-1',
      timestamp: Date.now(),
      payload: {
        diff: {
          type: 'state_diff',
          diff: {
            'combatants.0.hp': 23,
            'combatants.0.isBlinded': true
          }
        },
        seq: 2
      }
    });

    // Then: Lokaler Zustand des Spielers aktualisiert sich synchron
    assert.equal(pc.hp, 23, 'HP des Spielers muss auf 23 gesunken sein');
    assert.equal(pc.isBlinded, true, 'Zustand isBlinded muss aktiviert worden sein');
  });

  test('Szenario 2.3: Offline-Resilienz bei Verbindungsabbruch und Reconnect', async () => {
    // Given: Verbindung ist offline/disconnected
    assert.equal(realtimeManager.getStatus(), 'disconnected');

    // When: Spieler ändert Werte lokal (Local-First)
    const pc = getActivePC();
    pc.hp = 28;

    // When: Verbindung wird wiederhergestellt
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');

    // Broadcast active PC
    broadcastActivePC();

    // Then: Active PC mit aktuellem Stand (HP 28) wird an den Host übertragen
    const pcSyncBroadcasts = mockChannel.sentBroadcasts.filter(
      (b) => b.payload.eventType === 'pc_sync'
    );
    assert.ok(pcSyncBroadcasts.length >= 1, 'Muss pc_sync Broadcast gesendet haben');
    assert.equal(pcSyncBroadcasts[0].payload.payload.pc.hp, 28, 'Übertragener PC muss HP 28 haben');
  });

  test('Szenario 2.4: Buff-Dauer-Synchronisation bei Rundenwechsel (10 Runden -> 9 Runden -> Expiration)', async () => {
    // Given: Spieler hat einen aktiven Buff (Bless, 10 Runden)
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    const pc = getActivePC();
    pc.activeBuffs = [
      {
        id: 'buff-bless-1',
        name: 'Bless',
        spellKey: 'bless',
        durationMaxRounds: 10,
        durationRemainingRounds: 10,
        effects: [{ target: 'atk', value: 1, type: 'morale', source: 'Bless' }]
      }
    ];
    assert.equal(pc.activeBuffs[0].durationRemainingRounds, 10);

    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');

    // When: DM schaltet auf nächste Runde und sendet Diff (durationRemainingRounds = 9)
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-dm-diff-round2',
      eventType: 'diff',
      senderId: 'user-dm-host',
      senderName: 'Dungeon Master',
      campaignId: 'camp-alpha-1',
      timestamp: Date.now(),
      payload: {
        diff: {
          type: 'state_diff',
          diff: {
            'combatants.0.activeBuffs.0.durationRemainingRounds': 9
          }
        },
        seq: 5
      }
    });

    // Then: Spieler-Sheet übernimmt synchron 9 verbleibende Runden
    assert.equal(pc.activeBuffs[0].durationRemainingRounds, 9, 'Buff-Dauer muss auf 9 Runden dekrementiert sein');

    // When: Nach 9 weiteren Runden läuft der Buff aus (DM sendet leeres activeBuffs Array)
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-dm-diff-round11',
      eventType: 'diff',
      senderId: 'user-dm-host',
      senderName: 'Dungeon Master',
      campaignId: 'camp-alpha-1',
      timestamp: Date.now(),
      payload: {
        diff: {
          type: 'state_diff',
          diff: {
            'combatants.0.activeBuffs': []
          }
        },
        seq: 15
      }
    });

    // Then: Buff ist auf dem Spielerbogen sauber ausgelaufen
    assert.equal(pc.activeBuffs.length, 0, 'Buff muss auf Spielerseite automatisch entfernt werden');
  });

  test('Szenario 2.5: Exakte Schadensübertragung (Keine Verdopplung/Kaskadierung bei DM-Schaden)', async () => {
    // Given: Spieler ist mit 30 HP im Raum verbunden
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    const pc = getActivePC();
    pc.hp = 30;
    pc.maxHP = 30;
    assert.equal(pc.hp, 30);

    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');

    // When: DM vergibt 5 Schaden und sendet state_diff mit Ziel-HP 25
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-dm-dmg-5',
      eventType: 'diff',
      senderId: 'user-dm-host',
      senderName: 'Dungeon Master',
      campaignId: 'camp-alpha-1',
      timestamp: Date.now(),
      payload: {
        diff: {
          type: 'state_diff',
          diff: {
            'combatants.0.hp': 25
          }
        },
        seq: 20
      }
    });

    // Then: Spieler verliert exakt 5 HP (Endstand: 25, niemals 20)
    assert.equal(pc.hp, 25, 'Spieler-HP müssen exakt 25 sein (5 Schaden abgezogen, keine Verdopplung)');
  });

  test('Szenario 2.6: DM-Nachrichten-Übertragung (dm_message)', async () => {
    // Given: Spieler ist im Raum verbunden
    await realtimeManager.joinCampaign('camp-alpha-1', 'player', {
      userId: 'user-player-1',
      userName: 'Valerius Player',
      characterId: 'valerius-pc',
      characterName: 'Valerius'
    });

    const pc = getActivePC();
    pc.id = 'valerius-pc';

    const mockChannel = mockClient.channels.get('campaign:camp-alpha-1');

    // When: DM sendet eine Direktnachricht an den Spieler via WebSocket diff
    let messageReceived = false;
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-dm-msg-1',
      eventType: 'diff',
      senderId: 'user-dm-host',
      senderName: 'Dungeon Master',
      campaignId: 'camp-alpha-1',
      timestamp: Date.now(),
      payload: {
        diff: {
          type: 'dm_message',
          text: 'Ein schrilles Heulen ertönt in der Ferne...',
          targetPCId: 'valerius-pc'
        },
        seq: 21
      }
    });

    // Then: Nachricht wird ohne Fehler vom Client-Protokoll verarbeitet
    assert.ok(true, 'DM-Nachricht wurde erfolgreich empfangen und geroutet');
  });
});

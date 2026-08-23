import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RealtimeManager } from '../src/services/network/RealtimeManager.ts';

// In-Memory Realtime Hub simulating Phoenix / Supabase Realtime Channels across multiple nodes
class VirtualRealtimeServer {
  constructor() {
    this.rooms = new Map(); // channelName -> Set<VirtualChannel>
  }

  createNodeClient(userId, userName, role = 'PLAYER') {
    const server = this;

    return {
      channel(channelName, config) {
        if (!server.rooms.has(channelName)) {
          server.rooms.set(channelName, new Set());
        }
        const roomMembers = server.rooms.get(channelName);
        const listeners = new Map();
        let myPresence = null;

        const virtualChannel = {
          channelName,
          userId,
          userName,
          role,
          config,
          on(type, filter, callback) {
            const key = `${type}:${filter?.event || '*'}`;
            if (!listeners.has(key)) listeners.set(key, []);
            listeners.get(key).push(callback);
            return virtualChannel;
          },
          subscribe(callback) {
            roomMembers.add(virtualChannel);
            setTimeout(() => {
              if (typeof callback === 'function') callback('SUBSCRIBED');
            }, 2);
            return virtualChannel;
          },
          async track(presence) {
            myPresence = presence;
            server.broadcastPresence(channelName);
          },
          async untrack() {
            myPresence = null;
            server.broadcastPresence(channelName);
          },
          async unsubscribe() {
            roomMembers.delete(virtualChannel);
            myPresence = null;
            listeners.clear();
            server.broadcastPresence(channelName);
          },
          async send(packet) {
            // Deliver broadcast packet to ALL members of the room
            for (const member of roomMembers) {
              const cbs = member._getCallbacks('broadcast:combat_event');
              cbs.forEach(cb => cb({ payload: packet.payload }));
            }
            return 'ok';
          },
          presenceState() {
            const state = {};
            for (const member of roomMembers) {
              if (member._getPresence()) {
                const p = member._getPresence();
                state[p.userId] = [p];
              }
            }
            return state;
          },
          _getPresence() { return myPresence; },
          _getCallbacks(key) { return listeners.get(key) || []; }
        };

        return virtualChannel;
      }
    };
  }

  broadcastPresence(channelName) {
    const roomMembers = this.rooms.get(channelName);
    if (!roomMembers) return;
    for (const member of roomMembers) {
      const syncCallbacks = member._getCallbacks('presence:sync');
      syncCallbacks.forEach(cb => cb());
    }
  }
}

describe('Multi-Client Realtime Table Simulation (Phase 7)', () => {
  let server;
  const CAMPAIGN_ID = 'camp-raven-42';

  beforeEach(() => {
    server = new VirtualRealtimeServer();
  });

  test('4-Client Virtual Table: DM + 3 Players connect, track presence, and exchange combat actions', async () => {
    // 1. Instantiate 4 virtual nodes (1 DM + 3 Players)
    const dmClient = server.createNodeClient('dm-julian', 'DM Julian', 'DM');
    const player1Client = server.createNodeClient('p1-valeros', 'Valeros (Fighter)', 'PLAYER');
    const player2Client = server.createNodeClient('p2-seoni', 'Seoni (Sorcerer)', 'PLAYER');
    const player3Client = server.createNodeClient('p3-merisiel', 'Merisiel (Rogue)', 'PLAYER');

    const dmManager = new RealtimeManager({ client: dmClient });
    const p1Manager = new RealtimeManager({ client: player1Client });
    const p2Manager = new RealtimeManager({ client: player2Client });
    const p3Manager = new RealtimeManager({ client: player3Client });

    // Track received events per player
    const dmReceivedDiffs = [];
    const p1ReceivedDiffs = [];
    const p2ReceivedDice = [];
    const p3ReceivedTurns = [];
    let dmPresence = [];

    dmManager.onEvent('diff', (envelope) => dmReceivedDiffs.push(envelope.payload));
    p1Manager.onEvent('diff', (envelope) => p1ReceivedDiffs.push(envelope.payload));
    p2Manager.onEvent('dice_roll', (envelope) => p2ReceivedDice.push(envelope.payload));
    p3Manager.onEvent('turn_change', (envelope) => p3ReceivedTurns.push(envelope.payload));
    dmManager.onPresenceChange((users) => { dmPresence = users; });

    // 2. All 4 participants join the campaign
    await dmManager.joinCampaign(CAMPAIGN_ID, 'host', { userId: 'dm-julian', userName: 'DM Julian', userAvatarUrl: '🧙' });
    await p1Manager.joinCampaign(CAMPAIGN_ID, 'player', { userId: 'p1-valeros', userName: 'Valeros', userAvatarUrl: '⚔️', characterId: 'char-val-1', characterName: 'Valeros' });
    await p2Manager.joinCampaign(CAMPAIGN_ID, 'player', { userId: 'p2-seoni', userName: 'Seoni', userAvatarUrl: '🔥', characterId: 'char-seo-2', characterName: 'Seoni' });
    await p3Manager.joinCampaign(CAMPAIGN_ID, 'player', { userId: 'p3-merisiel', userName: 'Merisiel', userAvatarUrl: '🗡️', characterId: 'char-meri-3', characterName: 'Merisiel' });

    // Wait for async subscriptions
    await new Promise((r) => setTimeout(r, 20));

    // 3. Verify presence tracking shows all 4 members
    assert.equal(dmPresence.length, 4, 'Presence bar must show exactly 4 connected members');
    const userIds = dmPresence.map(p => p.userId);
    assert.ok(userIds.includes('dm-julian'));
    assert.ok(userIds.includes('p1-valeros'));
    assert.ok(userIds.includes('p2-seoni'));
    assert.ok(userIds.includes('p3-merisiel'));

    // 4. DM broadcasts Encounter Start & Initiative Diff
    await dmManager.broadcastDiff({
      path: 'encounter.round',
      value: 1,
      combatants: [
        { id: 'c-val', name: 'Valeros', currentHP: 52, maxHP: 52, init: 19 },
        { id: 'c-gob', name: 'Goblin Boss', currentHP: 28, maxHP: 28, init: 14 },
      ]
    });

    assert.equal(p1ReceivedDiffs.length, 1, 'Player 1 must receive the encounter start diff');
    assert.equal(p1ReceivedDiffs[0].diff.path, 'encounter.round');
    assert.equal(p1ReceivedDiffs[0].diff.value, 1);

    // Echo prevention: DM should NOT receive their own diff via onEvent('diff')
    assert.equal(dmReceivedDiffs.length, 0, 'Sender (DM) must ignore own broadcasted diffs (echo filtering)');

    // 5. Player 3 (Merisiel) performs a Sneak Attack and broadcasts dice roll
    await p3Manager.broadcastDiceRoll({
      rollerName: 'Merisiel',
      rollType: 'Sneak Attack (Rapier)',
      expression: '1d6+3 + 2d6',
      total: 15,
      details: 'Rolled 4 + 3 + (3, 5)'
    });

    assert.equal(p2ReceivedDice.length, 1, 'Player 2 (Seoni) must receive Merisiel\'s dice roll');
    assert.equal(p2ReceivedDice[0].rollerName, 'Merisiel');
    assert.equal(p2ReceivedDice[0].total, 15);

    // 6. DM advances turn
    await dmManager.broadcastTurnChange({
      round: 1,
      turnIndex: 1,
      activeCombatantName: 'Goblin Boss'
    });

    assert.equal(p3ReceivedTurns.length, 1, 'Player 3 must receive the turn change event');
    assert.equal(p3ReceivedTurns[0].activeCombatantName, 'Goblin Boss');

    // 7. Player 2 (Seoni) disconnects / leaves room
    await p2Manager.leaveCampaign();
    await new Promise((r) => setTimeout(r, 20));

    assert.equal(dmPresence.length, 3, 'Presence list should update to 3 members after Seoni leaves');
    assert.ok(!dmPresence.some(p => p.userId === 'p2-seoni'), 'Seoni must no longer be present');

    // Clean up
    await dmManager.leaveCampaign();
    await p1Manager.leaveCampaign();
    await p3Manager.leaveCampaign();
  });
});

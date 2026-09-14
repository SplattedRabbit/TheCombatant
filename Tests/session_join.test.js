import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { campaignService } from '../src/services/campaign/CampaignService.ts';
import { RealtimeManager } from '../src/services/network/RealtimeManager.ts';

// In-Memory Realtime Hub simulating Supabase Realtime Channels
class VirtualRealtimeServer {
  constructor() {
    this.rooms = new Map();
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
            }, 5);
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
            for (const member of roomMembers) {
              const cbs = member._getCallbacks('broadcast:combat_event');
              cbs.forEach((cb) => cb({ payload: packet.payload }));
            }
            return true;
          },
          presenceState() {
            const state = {};
            for (const member of roomMembers) {
              const p = member._getMyPresence();
              if (p) {
                state[p.userId] = [p];
              }
            }
            return state;
          },
          _getCallbacks(key) {
            return listeners.get(key) || [];
          },
          _getMyPresence() {
            return myPresence;
          },
        };

        return virtualChannel;
      },
    };
  }

  broadcastPresence(channelName) {
    const roomMembers = this.rooms.get(channelName) || new Set();
    for (const member of roomMembers) {
      const syncCallbacks = member._getCallbacks('presence:sync');
      syncCallbacks.forEach((cb) => cb());
    }
  }
}

describe('Session Joining & Room Code Alignment Tests', () => {
  test('1. joinCampaignByCode succeeds and returns member with roomCode for local/guest campaigns without cloud error', async () => {
    const inviteCode = 'RAVENLOFT-99';
    const member = await campaignService.joinCampaignByCode(inviteCode, 'char-123');

    assert.ok(member, 'Member must be returned');
    assert.equal(member.campaignId, 'RAVENLOFT-99', 'CampaignId must match normalized invite code');
    assert.equal(member.characterId, 'char-123');
    assert.equal(member.role, 'PLAYER');
    assert.ok(member.userId.startsWith('guest-') || member.userId.length > 0);
  });

  test('2. joinCampaignByCode normalizes lowercase and spaced room codes cleanly', async () => {
    const dirtyCode = '  strahd 42  ';
    const member = await campaignService.joinCampaignByCode(dirtyCode);

    assert.ok(member);
    assert.equal(member.campaignId, 'STRAHD-42', 'Code must be uppercase and space-hyphenated');
  });

  test('3. DM and Player join exact same room channel using inviteCode and see each other', async () => {
    const server = new VirtualRealtimeServer();
    const dmClient = server.createNodeClient('dm-1', 'Dungeon Master', 'HOST');
    const playerClient = server.createNodeClient('player-1', 'Salogel', 'PLAYER');

    const dmManager = new RealtimeManager({ client: dmClient });
    const playerManager = new RealtimeManager({ client: playerClient });

    const roomCode = 'EBERRON-77';

    // DM joins host
    const dmJoined = await dmManager.joinCampaign(roomCode, 'host', {
      userId: 'dm-1',
      userName: 'Dungeon Master',
    });
    assert.ok(dmJoined, 'DM must join room');
    assert.equal(dmManager.getCurrentCampaignId(), 'EBERRON-77');

    // Player joins player
    const playerJoined = await playerManager.joinCampaign(roomCode, 'player', {
      userId: 'player-1',
      userName: 'Salogel',
      characterId: 'char-sal-1',
      characterName: 'Salogel Müller',
    });
    assert.ok(playerJoined, 'Player must join room');
    assert.equal(playerManager.getCurrentCampaignId(), 'EBERRON-77');

    // Verify channel name in virtual server matches normalized roomCode
    assert.ok(server.rooms.has('campaign:EBERRON-77'), 'Channel must exist for exact room code');
    assert.equal(server.rooms.get('campaign:EBERRON-77').size, 2, 'Both DM and Player must be in room');

    // Clean up
    await dmManager.leaveCampaign();
    await playerManager.leaveCampaign();
  });
});

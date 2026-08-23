import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RealtimeManager } from '../src/services/network/RealtimeManager.ts';

// Mock Supabase Realtime Channel
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
          // Simulate delivering broadcast to listeners
          const broadcastCallbacks = listeners.get('broadcast:combat_event') || [];
          broadcastCallbacks.forEach((cb) => cb({ payload: packet.payload }));
          return 'ok';
        },
        presenceState() {
          return presenceData;
        },
        // Helper to simulate remote event
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

describe('RealtimeManager Service Test Suite', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockRealtimeClient();
    service = new RealtimeManager({ client: mockClient });
  });

  test('6.6.1.1 Room Lifecycle: Join Campaign, Presence Tracking & Leave Room', async () => {
    let currentStatus = service.getStatus();
    service.onStatusChange((s) => {
      currentStatus = s;
    });

    const joined = await service.joinCampaign('camp-uuid-1', 'host', {
      userId: 'user-dm-1',
      userName: 'Dungeon Master',
    });

    assert.equal(joined, true, 'Join muss erfolgreich sein');
    assert.equal(service.getStatus(), 'connected', 'Status muss connected sein');
    assert.equal(service.getActiveCampaignId(), 'camp-uuid-1');

    // Leave
    await service.leaveCampaign();
    assert.equal(service.getStatus(), 'disconnected');
    assert.equal(service.getActiveCampaignId(), null);
  });

  test('6.6.1.2 Broadcast Envelope: Erzeugt standardisierte UIDs und Sequenznummern', async () => {
    await service.joinCampaign('camp-uuid-2', 'host', {
      userId: 'user-dm-2',
      userName: 'DM Julian',
    });

    const mockChannel = mockClient.channels.get('campaign:camp-uuid-2');
    assert.ok(mockChannel);

    // Broadcast diff
    const success = await service.broadcastDiff({ 'combatants.0.hp': 20 });
    assert.equal(success, true);
    assert.equal(mockChannel.sentBroadcasts.length, 1);

    const sent = mockChannel.sentBroadcasts[0];
    assert.equal(sent.type, 'broadcast');
    assert.equal(sent.event, 'combat_event');
    assert.ok(sent.payload.eventId, 'Event muss UUID haben');
    assert.equal(sent.payload.eventType, 'diff');
    assert.equal(sent.payload.senderId, 'user-dm-2');
    assert.equal(sent.payload.payload.seq, 1);
  });

  test('6.6.1.3 Echo-Prävention: Eigene Broadcast-Events werden lokal ignoriert', async () => {
    await service.joinCampaign('camp-uuid-3', 'player', {
      userId: 'user-player-1',
      userName: 'Valeros',
    });

    const receivedEvents = [];
    service.onEvent('diff', (envelope) => {
      receivedEvents.push(envelope);
    });

    // 1. Send own event
    await service.broadcastDiff({ 'combatants.0.hp': 15 });
    assert.equal(receivedEvents.length, 0, 'Eigene Events dürfen nicht lokal getriggert werden (Echo-Prävention)');

    // 2. Simulate remote event from another user
    const mockChannel = mockClient.channels.get('campaign:camp-uuid-3');
    mockChannel.simulateRemoteEvent({
      eventId: 'remote-event-1',
      eventType: 'diff',
      senderId: 'user-dm-99', // anderer Absender
      senderName: 'DM',
      campaignId: 'camp-uuid-3',
      timestamp: Date.now(),
      payload: { diff: { 'round': 2 }, seq: 1 },
    });

    assert.equal(receivedEvents.length, 1, 'Remote-Event eines anderen Nutzers muss verarbeitet werden');
    assert.equal(receivedEvents[0].payload.diff.round, 2);
  });
});

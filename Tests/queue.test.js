// Tests/queue.test.js - Test suite for MessageQueue debouncing and merging

import { test } from 'node:test';
import assert from 'node:assert';
import { MessageQueue } from '../js/network/MessageQueue.js';

test('MessageQueue - Sofortiges Senden (online)', () => {
  let sentPacket = null;
  const queue = new MessageQueue((p) => {
    sentPacket = p;
  });

  const packet = { type: 'test', val: 42 };
  queue.enqueue(packet);

  assert.strictEqual(sentPacket, packet);
});

test('MessageQueue - Offline-Pufferung und Flushen', () => {
  let sentPackets = [];
  const queue = new MessageQueue((p) => {
    sentPackets.push(p);
  });

  // Temporär offline simulieren
  globalThis.navigator.onLine = false;

  const packet1 = { type: 'edit', field: 'name' };
  const packet2 = { type: 'edit', field: 'ac' };

  queue.enqueue(packet1);
  queue.enqueue(packet2);

  // Keine Pakete sollten gesendet worden sein
  assert.strictEqual(sentPackets.length, 0);
  assert.strictEqual(queue.queue.length, 2);

  // Wieder online gehen und flushen
  globalThis.navigator.onLine = true;
  queue.flush();

  assert.strictEqual(sentPackets.length, 2);
  assert.strictEqual(sentPackets[0], packet1);
  assert.strictEqual(sentPackets[1], packet2);
  assert.strictEqual(queue.queue.length, 0);
});

test('MessageQueue - Debouncing und Diff-Merging (Bugfix v2.1/v2.2 Verifikation)', async () => {
  let sentPackets = [];
  const queue = new MessageQueue((p) => {
    sentPackets.push(p);
  });

  // Edit 1: Ändere Name
  const packet1 = {
    type: 'pc_diff',
    diff: { name: 'Held A' }
  };
  queue.enqueueDebounced('pc_diff', packet1, 50);

  // Edit 2: Ändere Stärke (5ms später, bricht Edit 1 ab und verschmilzt)
  const packet2 = {
    type: 'pc_diff',
    diff: { 'str.base': 12 }
  };
  
  // Warte kurz
  await new Promise(r => setTimeout(r, 5));
  queue.enqueueDebounced('pc_diff', packet2, 50);

  // Warte bis der Debounce-Timer (50ms) abgelaufen ist
  await new Promise(r => setTimeout(r, 70));

  // Es sollte genau EIN Paket gesendet worden sein
  assert.strictEqual(sentPackets.length, 1);
  
  // Dieses Paket muss die verschmolzenen Diffs aus beiden Änderungen enthalten!
  const mergedPacket = sentPackets[0];
  assert.strictEqual(mergedPacket.type, 'pc_diff');
  assert.strictEqual(mergedPacket.diff.name, 'Held A');
  assert.strictEqual(mergedPacket.diff['str.base'], 12);
});

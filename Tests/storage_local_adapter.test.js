import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageAdapter, LOCAL_STORAGE_KEY, CHARACTER_PREFIX, CAMPAIGN_PREFIX } from '../src/services/storage/LocalStorageAdapter.ts';

describe('LocalStorageAdapter Test Suite', () => {
  let adapter;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    adapter = new LocalStorageAdapter('test_combat_state');
  });

  test('3.8.1.1 Standard Save/Load/Clear-Zyklus mit vollständigem State', () => {
    const mockState = {
      mode: 'pc',
      turn: 2,
      round: 3,
      combatants: [
        { id: 'pc-1', name: 'Valeros', hp: 45, maxHp: 50 },
        { id: 'm-1', name: 'Goblin', hp: 6, maxHp: 6 }
      ],
      session: { active: true, role: 'client', roomCode: 'ABC-123' }
    };

    adapter.saveState(mockState);
    const loaded = adapter.loadState();

    assert.deepEqual(loaded, mockState, 'Geladener State muss exakt mit gespeichertem State übereinstimmen');

    adapter.clearState();
    const emptyLoaded = adapter.loadState();
    assert.equal(emptyLoaded, null, 'Nach clearState() muss loadState() null zurückgeben');
  });

  test('3.8.1.2 Defensive Fehlerbehandlung bei korruptem JSON oder leerem Speicher', () => {
    // 1. Wenn Storage leer ist
    assert.equal(adapter.loadState(), null, 'Leerer Speicher liefert null');

    // 2. Wenn korrupter JSON-String vorliegt
    globalThis.localStorage.setItem('test_combat_state', '{ invalid json :::');
    assert.equal(adapter.loadState(), null, 'Korrupter JSON-String führt zu null ohne Exception');
  });

  test('3.8.1.3 Backward-Compatibility: Laden von v5.0 Default-Storage-Key', () => {
    const defaultAdapter = new LocalStorageAdapter();
    const legacyData = {
      combatants: [{ name: 'AltHeld', type: 'p' }],
      turn: 1,
      round: 1
    };

    globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(legacyData));
    const loaded = defaultAdapter.loadState();

    assert.ok(loaded, 'Muss Daten aus dem Standard-Key laden können');
    assert.equal(loaded.combatants[0].name, 'AltHeld');
  });

  test('3.8.1.4 Entity Hooks: saveCharacter, loadCharacter, saveCampaign, loadCampaign', () => {
    const charData = { name: 'Eldrin', level: 5, class_summary: 'Wizard 5' };
    adapter.saveCharacter('char-1', charData);

    const loadedChar = adapter.loadCharacter('char-1');
    assert.deepEqual(loadedChar, charData, 'Charakter muss über Entity-Hook speicher- und ladbar sein');

    const campData = { name: 'Ravenloft', monsters: [{ name: 'Strahd' }] };
    adapter.saveCampaign('camp-1', campData);

    const loadedCamp = adapter.loadCampaign('camp-1');
    assert.deepEqual(loadedCamp, campData, 'Kampagne muss über Entity-Hook speicher- und ladbar sein');
  });

  test('3.8.1.5 Sync-Status-Events: Listener erhält Statusübergänge', () => {
    const statusEvents = [];
    const unsubscribe = adapter.onSyncStatusChange((event) => {
      statusEvents.push(event);
    });

    adapter.saveState({ test: 123 });

    assert.equal(statusEvents.length, 1);
    assert.equal(statusEvents[0].status, 'saved');
    assert.equal(statusEvents[0].adapterName, 'local');
    assert.ok(statusEvents[0].lastSyncedAt instanceof Date);

    unsubscribe();
    adapter.saveState({ test: 456 });
    assert.equal(statusEvents.length, 1, 'Nach Unsubscribe dürfen keine weiteren Events eintreffen');
  });
});

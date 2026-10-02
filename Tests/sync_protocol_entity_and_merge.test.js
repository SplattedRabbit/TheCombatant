import test from 'node:test';
import assert from 'node:assert';
import { getState } from '../js/state/state-core.js';
import * as EncounterManager from '../js/state/EncounterManager.js';
import {
  getEncounterStateDiff,
  applyIncomingDelta,
  clearCachedEncounterState,
  clearCachedPCState,
  initializeCaches,
} from '../js/network/SyncProtocol.js';
import { createCombatant, createInitialState } from '../js/models/model-core.js';

test.beforeEach(() => {
  const s = getState();
  s.combatants = [];
  s.session = { active: false, role: 'choice', roomCode: '' };
  clearCachedEncounterState();
  clearCachedPCState();
});

test('Phase 2 Guarantee: EncounterManager.mergeIncomingPC preserves volatile DM combat state on reconnect', () => {
  const s = getState();
  s.session = { active: true, role: 'host', roomCode: 'ROOM-1' };

  // 1. DM has a PC in the encounter who has taken 50 damage, is Blinded, has Barkskin buff, and rolled init 18
  const existingPC = createCombatant({
    id: 'pc-valeros-123',
    characterId: 'char-uuid-valeros',
    name: 'Valeros',
    type: 'p',
    maxHP: 60,
    hp: 10, // 50 damage taken!
    init: 18,
    rawInit: 15,
    conditions: [{ n: 'Blinded', d: 3 }],
    activeBuffs: [{ id: 'buff-1', name: 'Barkskin', acBonus: 3 }],
  });
  s.combatants.push(existingPC);

  // 2. Player re-joins table or sends update_pc with their base sheet (100% full health, no conditions, no init)
  const incomingFromPlayer = {
    id: 'pc-valeros-123',
    characterId: 'char-uuid-valeros',
    name: 'Valeros',
    type: 'p',
    maxHP: 60,
    hp: 60, // player sheet says 60 HP!
    init: 0,
    rawInit: 0,
    conditions: [],
    activeBuffs: [],
    feats: ['Power Attack', 'Cleave'], // player updated feats
  };

  const merged = EncounterManager.mergeIncomingPC(incomingFromPlayer);
  assert.strictEqual(merged, true, 'mergeIncomingPC returns true on success');

  const afterMerge = s.combatants.find((c) => c.id === 'pc-valeros-123');
  assert.ok(afterMerge, 'PC must exist in combatants');

  // CRITICAL CHECK: Volatile combat values on DM board MUST be preserved!
  assert.strictEqual(afterMerge.hp, 10, 'DM-assigned current HP must NOT be wiped by reconnecting player');
  assert.strictEqual(afterMerge.init, 18, 'DM-assigned initiative must NOT be wiped by reconnecting player');
  assert.strictEqual(afterMerge.rawInit, 15, 'DM-assigned rawInit must NOT be wiped by reconnecting player');
  assert.strictEqual(afterMerge.conditions.length, 1, 'Active conditions must NOT be wiped');
  assert.strictEqual(afterMerge.conditions[0].n, 'Blinded');
  assert.strictEqual(afterMerge.activeBuffs.length, 1, 'Active buffs must NOT be wiped');
  assert.strictEqual(afterMerge.activeBuffs[0].name, 'Barkskin');

  // Static sheet data updated
  assert.ok(afterMerge.feats.includes('Power Attack'), 'Static character sheet feats should be updated');
});

test('Phase 3 Guarantee: ID-based combatant_hp_by_id diffs apply to the exact combatant regardless of array order', () => {
  const s = getState();
  s.session = { active: true, role: 'client', roomCode: 'ROOM-1' };

  // Client has PC first, then Goblin
  const clientPC = createCombatant({ id: 'pc-1', name: 'Valeros', type: 'p', maxHP: 50, hp: 50 });
  const clientGoblin = createCombatant({ id: 'mob-1', name: 'Goblin Scout', type: 'e', maxHP: 15, hp: 15 });
  s.combatants = [clientPC, clientGoblin];

  // Host had Goblin first, then PC (different array order)
  // Host damaged Goblin from 15 down to 5
  const hostPacket = {
    type: 'state_diff',
    diff: {
      'combatants.0.hp': 5, // On host, index 0 was Goblin. On client, index 0 is Valeros!
      'combatant_hp_by_id.mob-1': 5, // Entity-safe diff explicitly targets mob-1
    },
  };

  applyIncomingDelta(hostPacket, 'client');

  // Assert that Goblin took the damage and Valeros was NOT hit by index collision!
  assert.strictEqual(clientGoblin.hp, 5, 'Goblin must receive the updated HP via ID diff');
  assert.strictEqual(clientPC.hp, 50, 'Valeros must NOT receive the Goblin damage even if at index 0');
});

test('Phase 3 Guarantee: clearCachedEncounterState resets diff baseline to prevent cross-campaign ghost diffs', () => {
  const s = getState();
  s.session = { active: true, role: 'host', roomCode: 'CAMP-A' };

  // Campaign A
  s.combatants = [
    createCombatant({ id: 'vampire-1', name: 'Vampire Lord', type: 'e', maxHP: 100, hp: 100 }),
  ];
  getEncounterStateDiff(); // seeds cache for Campaign A

  // DM switches to Campaign B: clear cached encounter state
  clearCachedEncounterState();

  // Campaign B has completely different combatants
  s.combatants = [
    createCombatant({ id: 'dragon-1', name: 'Red Dragon', type: 'e', maxHP: 200, hp: 200 }),
  ];

  const initialBDiff = getEncounterStateDiff();
  // Since cache was cleared, it seeds fresh and returns null (no delta diffing against Campaign A)
  assert.strictEqual(initialBDiff, null, 'First diff after clearing cache must initialize cleanly without emitting ghost deletions');
});

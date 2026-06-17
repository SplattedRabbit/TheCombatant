import { test } from 'node:test';
import assert from 'node:assert';
import { getState, getActivePC, updateSession } from '../js/state/state-core.js';
import { updatePCField, updatePCNumber, updatePCBatch, togglePCDefensiveFighting, togglePCTotalDefense } from '../js/state/pc/PCGeneral.js';
import { Stat } from '../js/models/model-core.js';

test('PCGeneral Module - field mutations and stats updates', () => {
  const s = getState();
  s.combatants = [];
  updateSession(true, 'client', 'ROOM123');

  const pc = getActivePC();
  pc.name = 'Held';
  pc.race = 'Gnome';

  // Test updatePCField
  updatePCField('race', 'Dwarf');
  assert.strictEqual(pc.race, 'Dwarf', 'updatePCField changes fields correctly');

  // Test updatePCNumber on flat fields
  pc.maxHP = 10;
  updatePCNumber('maxHP', 15);
  assert.strictEqual(pc.maxHP, 15, 'updatePCNumber mutates numbers correctly');

  // Test updatePCNumber on Stat objects
  pc.str = new Stat(10);
  // (10 score -> modifier +0)
  updatePCNumber('str', 14);
  assert.strictEqual(pc.str.base, 14);

  // Test togglePCDefensiveFighting and togglePCTotalDefense mutually exclusive
  togglePCDefensiveFighting(true);
  assert.strictEqual(pc.isDefensiveFighting, true);
  assert.strictEqual(pc.isTotalDefense, false);

  togglePCTotalDefense(true);
  assert.strictEqual(pc.isDefensiveFighting, false);
  assert.strictEqual(pc.isTotalDefense, true);
});

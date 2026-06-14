import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';

test('Bugfix v3.6.0 - Combatant quickBuffs initialization and serialization', () => {
  const testQuickBuffs = [
    { key: 'haste', name: 'Hast', isClass: false },
    { key: 'bulls_strength', name: 'Bärenstärke', isClass: false }
  ];

  // 1. Check initialization in constructor
  const pc = new Combatant({
    id: 'test_pc',
    name: 'Testheld',
    type: 'player',
    quickBuffs: testQuickBuffs
  });

  assert.ok(Array.isArray(pc.quickBuffs), 'quickBuffs should be an array');
  assert.strictEqual(pc.quickBuffs.length, 2, 'quickBuffs should contain exactly 2 items');
  assert.deepStrictEqual(pc.quickBuffs, testQuickBuffs, 'quickBuffs should match initial data');

  // 2. Check default initialization when not provided
  const pcDefault = new Combatant({
    id: 'default_pc',
    name: 'Defaultheld'
  });
  assert.ok(Array.isArray(pcDefault.quickBuffs), 'default quickBuffs should be initialized as an array');
  assert.strictEqual(pcDefault.quickBuffs.length, 0, 'default quickBuffs should be empty');

  // 3. Check serialization in toJSON
  const serialized = pc.toJSON();
  assert.ok(serialized.quickBuffs, 'serialized object should have quickBuffs property');
  assert.deepStrictEqual(serialized.quickBuffs, testQuickBuffs, 'serialized quickBuffs should match instance data');
});

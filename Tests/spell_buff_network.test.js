// Tests/spell_buff_network.test.js - Verify WebRTC Buff & Aura propagation rules
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { CombatState, getState } from '../js/state.js';
import { CombatSpells } from '../js/spells.js';
import { buildContext } from '../js/rules/attack/AttackContext.js';
import { Weapon } from '../js/models/Weapon.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells_de.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

test('WebRTC Buff Propagation - Remote Attribute Buff', () => {
  const state = getState();

  const charA = new Combatant({
    id: 'char_a',
    name: 'Alistair',
    type: 'player',
    str: 10,
    activeBuffs: []
  });

  const charB = new Combatant({
    id: 'char_b',
    name: 'Bari',
    type: 'player',
    str: 10,
    activeBuffs: []
  });

  // Assign combatants to global state
  state.combatants = [charA, charB];

  // 1. Initially both have Str 10
  charA.rebuildStatModifiers();
  charB.rebuildStatModifiers();
  assert.strictEqual(charA.str.getValue(), 10);
  assert.strictEqual(charB.str.getValue(), 10);

  // 2. Caster (charA) casts Bulls Strength targeting only B (charB)
  charA.activeBuffs.push({
    id: 'spell_bulls_strength_test',
    spellKey: 'bulls_strength',
    name: 'Stärke des Stiers',
    effects: [
      { target: 'str', value: 4, type: 'enhancement', source: 'Stärke des Stiers' }
    ],
    sharedWith: [charB.id] // Target only B
  });

  // 3. Rebuild modifiers
  charA.rebuildStatModifiers();
  charB.rebuildStatModifiers();

  // Alistair did not target himself -> Str remains 10
  assert.strictEqual(charA.str.getValue(), 10, 'Caster should not receive the buff if not in sharedWith');
  // Bari is targeted -> Str becomes 14
  assert.strictEqual(charB.str.getValue(), 14, 'Ally should receive the remote buff');

  // Cleanup
  state.combatants = [];
});

test('WebRTC Buff Propagation - Remote Attack Buff & Source Breakdown', () => {
  const state = getState();

  const charA = new Combatant({
    id: 'char_a',
    name: 'Alistair',
    type: 'player',
    bab: 2,
    str: 12, // Str mod: +1
    activeBuffs: []
  });

  const charB = new Combatant({
    id: 'char_b',
    name: 'Bari',
    type: 'player',
    bab: 3,
    str: 10, // Str mod: +0
    activeBuffs: []
  });

  state.combatants = [charA, charB];

  // Caster (charA) casts Bless targeting B (charB)
  charA.activeBuffs.push({
    id: 'spell_bless_test',
    spellKey: 'bless',
    name: 'Segen',
    effects: [
      { target: 'atk', value: 1, type: 'morale', source: 'Segen' }
    ],
    sharedWith: [charB.id]
  });

  charA.rebuildStatModifiers();
  charB.rebuildStatModifiers();

  const weapon = new Weapon({
    name: 'Langschwert',
    type: 'martial',
    category: 'onehand',
    hand: 'main',
    damageFormula: '1d8',
    critThreat: 20,
    critMult: 2
  });

  // Test charB (Bari) attack context.
  // Bari has BAB +3. Str mod +0.
  // Should receive +1 morale bonus from Alistair's Bless -> total attack bonus +4 (buff bonus: +1)
  const ctxB = buildContext(charB, weapon);
  assert.strictEqual(ctxB.buffAtkBonus, 1, `Bari's buff attack bonus should be 1, but was ${ctxB.buffAtkBonus}`);
  
  // Verify breakdown includes "Segen (Alistair)"
  const breakdownSourceExists = ctxB.buffAtkBreakdown.some(entry => entry.label.includes('Segen (Alistair)'));
  assert.ok(breakdownSourceExists, 'Attack breakdown should list "Segen (Alistair)" as source');

  state.combatants = [];
});

test('WebRTC Buff Propagation - Self-healing on removal', () => {
  const state = getState();

  const charA = new Combatant({
    id: 'char_a',
    name: 'Alistair',
    type: 'player',
    str: 10,
    activeBuffs: []
  });

  const charB = new Combatant({
    id: 'char_b',
    name: 'Bari',
    type: 'player',
    str: 10,
    activeBuffs: []
  });

  state.combatants = [charA, charB];

  // Cast Bulls Strength from A on B
  charA.activeBuffs.push({
    id: 'spell_bulls_strength_test',
    spellKey: 'bulls_strength',
    name: 'Stärke des Stiers',
    effects: [
      { target: 'str', value: 4, type: 'enhancement', source: 'Stärke des Stiers' }
    ],
    sharedWith: [charB.id]
  });

  charB.rebuildStatModifiers();
  assert.strictEqual(charB.str.getValue(), 14, 'Bari should have Str 14');

  // Now, A removes the buff
  charA.activeBuffs = [];

  // Bari's sheet rebuilds (triggered by state sync)
  charB.rebuildStatModifiers();

  // Bari's Str should go back to 10
  assert.strictEqual(charB.str.getValue(), 10, 'Bari’s Str should revert back to 10 after buff removal');

  state.combatants = [];
});

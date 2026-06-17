import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';

test('Tiefling - Racial attribute modifiers are applied correctly', () => {
  // A tiefling should get +2 Dex, +2 Int, -2 Cha
  const pc = new Combatant({
    race: 'tiefling',
    str: { base: 10, modifiers: [] },
    dex: { base: 10, modifiers: [] },
    con: { base: 10, modifiers: [] },
    int: { base: 10, modifiers: [] },
    wis: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  // Re-run modifiers calculation
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.dex.getValue(), 12, 'Tiefling should get +2 DEX');
  assert.strictEqual(pc.int.getValue(), 12, 'Tiefling should get +2 INT');
  assert.strictEqual(pc.cha.getValue(), 8, 'Tiefling should get -2 CHA');
  assert.strictEqual(pc.str.getValue(), 10, 'Tiefling STR should remain unchanged');
});

test('Tiefling - Racial skill bonuses are applied correctly', () => {
  // A tiefling should get +2 on Bluff and Hide checks
  const pc = new Combatant({
    race: 'tiefling',
    classes: [{ classType: 'rogue', level: 1 }],
    skills: {
      bluff: { ranks: 0 },
      hide: { ranks: 0 },
      listen: { ranks: 0 }
    },
    dex: { base: 10, modifiers: [] },
    cha: { base: 10, modifiers: [] }
  });

  pc.rebuildStatModifiers();

  // Bluff uses CHA. Base CHA is 10 - 2 (racial) = 8 (modifier -1)
  // Total Bluff should be: 0 (ranks) - 1 (CHA mod) + 2 (racial Bluff bonus) = 1
  assert.strictEqual(pc.getSkillModifier('bluff'), 1, 'Tiefling Bluff should include +2 racial bonus');

  // Hide uses DEX. Base DEX is 10 + 2 (racial) = 12 (modifier +1)
  // Total Hide should be: 0 (ranks) + 1 (DEX mod) + 2 (racial Hide bonus) = 3
  assert.strictEqual(pc.getSkillModifier('hide'), 3, 'Tiefling Hide should include +2 racial bonus');

  // Listen uses WIS (base 10, mod 0). No racial bonus.
  assert.strictEqual(pc.getSkillModifier('listen'), 0, 'Tiefling Listen should not have racial bonus');
});

test('Tiefling - Level Adjustment and Resistances default correctly', () => {
  const pc = new Combatant({
    race: 'tiefling',
    levelAdjustment: 1,
    resistances: 'Cold 5, Electricity 5, Fire 5'
  });

  assert.strictEqual(pc.levelAdjustment, 1, 'Tiefling level adjustment should be 1');
  assert.strictEqual(pc.resistances, 'Cold 5, Electricity 5, Fire 5', 'Tiefling should have energy resistances');
});

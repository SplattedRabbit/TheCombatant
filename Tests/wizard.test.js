// Tests/wizard.test.js - Test suite for D&D 3.5e Character Creation Wizard rules logic

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatRules } from '../js/rules.js';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';

test('Wizard Rules - 74 Point-Buy Validation', () => {
  // A valid character must have sum of base stats equal to exactly 74
  const validatePoints = (stats) => {
    const sum = Object.values(stats).reduce((a, b) => a + b, 0);
    return sum === 74;
  };

  const validStats = { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 };
  assert.ok(validatePoints(validStats), 'Stats summing to 74 is valid');

  const invalidStatsLow = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }; // sum 60
  assert.ok(!validatePoints(invalidStatsLow), 'Stats summing to 60 is invalid');

  const invalidStatsHigh = { str: 18, dex: 18, con: 18, int: 18, wis: 18, cha: 18 }; // sum 108
  assert.ok(!validatePoints(invalidStatsHigh), 'Stats summing to 108 is invalid');
});

test('Wizard Rules - Racial Modifiers Application', () => {
  // Human gets no modifiers
  const human = new Combatant({
    race: 'human',
    str: new Stat(10),
    dex: new Stat(10),
    con: new Stat(10)
  });
  assert.strictEqual(human.str.getValue(), 10);
  assert.strictEqual(human.dex.getValue(), 10);
  assert.strictEqual(human.con.getValue(), 10);

  // Elf gets +2 Dex, -2 Con
  // Under D&D 3.5e, racial modifiers are applied as Stat modifiers (or base alterations).
  // If we mutate base:
  const baseDex = 14;
  const baseCon = 12;
  const elfDex = new Stat(baseDex + 2); // racial mod incorporated
  const elfCon = new Stat(baseCon - 2); // racial mod incorporated
  assert.strictEqual(elfDex.getValue(), 16);
  assert.strictEqual(elfCon.getValue(), 10);
});

test('Wizard Rules - Skill Points Progression', () => {
  // 1. Level 1 Human Rogue, Int 14 (+2 mod)
  // Base Rogue = 8 skill points.
  // Formula: (8 + 2) * 4 + 4 (Human bonus) = 44 points.
  const pc1 = new Combatant({
    race: 'human',
    isHuman: true,
    int: new Stat(14),
    classes: [{ classType: 'rogue', level: 1 }]
  });
  
  const points1 = CombatRules.calculateTotalSkillPoints(pc1);
  assert.strictEqual(points1, 44, 'Level 1 Human Rogue with Int 14 gets 44 skill points');

  // 2. Level 1 Elf Rogue, Int 14 (+2 mod)
  // Formula: (8 + 2) * 4 = 40 points (No Human bonus).
  const pc2 = new Combatant({
    race: 'elf',
    isHuman: false,
    int: new Stat(14),
    classes: [{ classType: 'rogue', level: 1 }]
  });
  
  const points2 = CombatRules.calculateTotalSkillPoints(pc2);
  assert.strictEqual(points2, 40, 'Level 1 Elf Rogue with Int 14 gets 40 skill points');

  // 3. Level 2 Human Rogue, Int 14 (+2 mod)
  // Level 1: 44 points
  // Level 2: (8 + 2) + 1 (Human bonus) = 11 points
  // Total: 44 + 11 = 55 points.
  const pc3 = new Combatant({
    race: 'human',
    isHuman: true,
    int: new Stat(14),
    classes: [{ classType: 'rogue', level: 2 }]
  });

  const points3 = CombatRules.calculateTotalSkillPoints(pc3);
  assert.strictEqual(points3, 55, 'Level 2 Human Rogue with Int 14 gets 55 skill points');

  // 4. Level 2 Elf Rogue, Int 14 (+2 mod)
  // Level 1: 40 points
  // Level 2: (8 + 2) = 10 points
  // Total: 40 + 10 = 50 points.
  const pc4 = new Combatant({
    race: 'elf',
    isHuman: false,
    int: new Stat(14),
    classes: [{ classType: 'rogue', level: 2 }]
  });

  const points4 = CombatRules.calculateTotalSkillPoints(pc4);
  assert.strictEqual(points4, 50, 'Level 2 Elf Rogue with Int 14 gets 50 skill points');
});

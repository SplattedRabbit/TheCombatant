import { test, describe } from 'node:test';
import assert from 'node:assert';
import { recalculatePCStats } from '../js/state/pc/PCGeneral.js';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';
import { ASSASSIN_KNOWN_TABLE, checkSpellKnownLimit, validateSpellLearnEligibility, getMaxSpellLevel, calculateMaxSpellSlots } from '../js/rules.js';

describe("Spell slot initialization", () => {
test('recalculateDerivedStats prevents NaN in spellSlots when used is undefined', () => {
  const pc = new Combatant({
    name: 'Wizard Test',
    classes: [{ classType: 'wizard', level: 3 }]
  });

  // Simulate slot object missing 'used' (e.g. from partial JSON or legacy import)
  pc.spellSlots = {
    1: { max: 3 } // 'used' is undefined
  };

  recalculatePCStats(pc);

  assert.strictEqual(typeof pc.spellSlots[1].used, 'number', 'used must be a number');
  assert.strictEqual(isNaN(pc.spellSlots[1].used), false, 'used must NOT be NaN');
  assert.strictEqual(pc.spellSlots[1].used, 0, 'used should default safely to 0');
});
});

describe("Spells known (spontaneous casters)", () => {
test('Assassin - Spells Known Table and Limits Enforcement', () => {
  // 1. Table structure
  assert.ok(ASSASSIN_KNOWN_TABLE, 'ASSASSIN_KNOWN_TABLE must exist');
  assert.deepStrictEqual(ASSASSIN_KNOWN_TABLE[1], [0, 2, 0, 0, 0]);
  assert.deepStrictEqual(ASSASSIN_KNOWN_TABLE[3], [0, 3, 2, 0, 0]);
  assert.deepStrictEqual(ASSASSIN_KNOWN_TABLE[10], [0, 4, 4, 4, 4]);

  // 2. Level 1 Assassin character
  const assassin1 = new Combatant({
    name: 'Shadow',
    classes: [{ classType: 'assassin', level: 1 }],
    int: new Stat(14),
    learnedSpells: ['disguise_self', 'true_strike'],
  });

  const spellsRegistry = {
    disguise_self: { id: 'disguise_self', name: 'Disguise Self', classLevels: [{ class: 'assassin', level: 1 }] },
    true_strike: { id: 'true_strike', name: 'True Strike', classLevels: [{ class: 'assassin', level: 1 }] },
    obscuring_mist: { id: 'obscuring_mist', name: 'Obscuring Mist', classLevels: [{ class: 'assassin', level: 1 }] },
    alter_self: { id: 'alter_self', name: 'Alter Self', classLevels: [{ class: 'assassin', level: 2 }] },
  };
  const findSpellFn = (k) => spellsRegistry[k] || null;

  // Unlearning/checking already learned spell is allowed
  const unlearnCheck = checkSpellKnownLimit(assassin1, spellsRegistry.disguise_self, findSpellFn);
  assert.strictEqual(unlearnCheck.success, true);

  // Adding a 3rd 1st-level spell when limit is 2 must be rejected
  const overLimitCheck = checkSpellKnownLimit(assassin1, spellsRegistry.obscuring_mist, findSpellFn);
  assert.strictEqual(overLimitCheck.success, false);
  assert.ok(overLimitCheck.error.includes('Limit für bekannte Zauber'));
  assert.ok(overLimitCheck.error.includes('Assassine: 2/2'));

  // Adding a 2nd-level spell when level 1 assassin can only cast level 1
  const lvl2Check = checkSpellKnownLimit(assassin1, spellsRegistry.alter_self, findSpellFn);
  assert.strictEqual(lvl2Check.success, false);

  // validateSpellLearnEligibility also blocks it
  const valRes = validateSpellLearnEligibility(assassin1, spellsRegistry.obscuring_mist, findSpellFn);
  assert.strictEqual(valRes.allowed, false);
  assert.ok(valRes.reason.includes('Assassine: 2/2'));
});
});

describe('Caster class configuration (PHB spells-per-day tables)', () => {
  test('getMaxSpellLevel resolves the highest castable spell level per caster class', () => {
    const expectations = [
      ['wizard', 3, 2], ['wizard', 17, 9], ['cleric', 1, 1],
      ['sorcerer', 1, 1], ['sorcerer', 10, 5],
      ['bard', 1, 0], ['bard', 7, 3],
      ['paladin', 4, 1], ['paladin', 16, 4], ['ranger', 4, 1],
      ['assassin', 4, 2], ['beguiler', 1, 1]
    ];
    for (const [classType, level, expected] of expectations) {
      assert.strictEqual(getMaxSpellLevel(classType, level), expected, classType + ' ' + level);
    }
  });

  test('getMaxSpellLevel returns -1 for non-casters and casters before their first spell level', () => {
    assert.strictEqual(getMaxSpellLevel('fighter', 5), -1);
    assert.strictEqual(getMaxSpellLevel('barbarian', 20), -1);
    assert.strictEqual(getMaxSpellLevel('paladin', 3), -1);
  });

  test('calculateMaxSpellSlots grants bonus slots from each class key ability only', () => {
    const slotsFor = (classType, abilities) =>
      calculateMaxSpellSlots({ classes: [{ classType, level: 1 }], int: 10, wis: 10, cha: 10, ...abilities });

    assert.strictEqual(slotsFor('wizard', { int: 18 })[1], 2, 'Wizard uses INT');
    assert.strictEqual(slotsFor('wizard', { wis: 18 })[1], 1, 'Wizard ignores WIS');
    assert.strictEqual(slotsFor('cleric', { wis: 18 })[1], 2, 'Cleric uses WIS');
    assert.strictEqual(slotsFor('cleric', { int: 18 })[1], 1, 'Cleric ignores INT');
    assert.strictEqual(slotsFor('sorcerer', { cha: 18 })[1], 4, 'Sorcerer uses CHA');
    assert.strictEqual(slotsFor('sorcerer', { int: 18, wis: 18 })[1], 3, 'Sorcerer ignores INT/WIS');
  });

  test('calculateMaxSpellSlots yields no slots for pure non-casters', () => {
    const slots = calculateMaxSpellSlots({ classes: [{ classType: 'fighter', level: 5 }] });
    assert.ok(Object.values(slots).every(v => v === 0));
  });
});

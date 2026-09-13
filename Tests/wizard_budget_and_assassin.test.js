import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';
import {
  ASSASSIN_TABLE,
  ASSASSIN_KNOWN_TABLE,
  getEffectiveCasterLevel,
  getMaxSpellLevel,
  checkSpellKnownLimit,
  validateSpellLearnEligibility,
  computeWizardBudget,
} from '../js/rules.js';

test('Wizard Budget - Generic Per-Level Caps for Level 13 Wizard (INT 18)', () => {
  const wizard13 = new Combatant({
    name: 'Mage 13',
    classes: [{ classType: 'wizard', level: 13 }],
    int: new Stat(18), // Mod +4
  });

  const emptySpells = [];
  const budget = computeWizardBudget(wizard13, emptySpells);

  // Total budget: 3 + 4 (lvl 1) + 12 * 2 (lvls 2-13) = 7 + 24 = 31
  assert.strictEqual(budget.wizCL, 13);
  assert.strictEqual(budget.maxFromLevelUps, 31);
  assert.strictEqual(budget.currentNonCantrip, 0);
  assert.strictEqual(budget.currentCantrips, 0);

  // Per-level caps:
  // L1: 31 (can use entire budget)
  assert.strictEqual(budget.perLevelCaps[1], 31);
  // L2: (13 - 3 + 1) * 2 = 22
  assert.strictEqual(budget.perLevelCaps[2], 22);
  // L3: (13 - 5 + 1) * 2 = 18
  assert.strictEqual(budget.perLevelCaps[3], 18);
  // L4: (13 - 7 + 1) * 2 = 14
  assert.strictEqual(budget.perLevelCaps[4], 14);
  // L5: (13 - 9 + 1) * 2 = 10
  assert.strictEqual(budget.perLevelCaps[5], 10);
  // L6: (13 - 11 + 1) * 2 = 6
  assert.strictEqual(budget.perLevelCaps[6], 6);
  // L7: (13 - 13 + 1) * 2 = 2
  assert.strictEqual(budget.perLevelCaps[7], 2);
  // L8: 0 (unlocks at level 15)
  assert.strictEqual(budget.perLevelCaps[8], 0);
  // L9: 0 (unlocks at level 17)
  assert.strictEqual(budget.perLevelCaps[9], 0);

  // Test canAddSpell
  assert.strictEqual(budget.canAddSpell(0).allowed, true, 'Cantrip always allowed');
  assert.strictEqual(budget.canAddSpell(6).allowed, true, 'First level 6 spell allowed');
  assert.strictEqual(budget.canAddSpell(7).allowed, true, 'First level 7 spell allowed');
  assert.strictEqual(budget.canAddSpell(8).allowed, false, 'Level 8 not yet unlocked');
});

test('Wizard Budget - Hard Blocking and Over-Cap Detection for Level 6 Spells', () => {
  const wizard13 = new Combatant({
    name: 'Mage 13',
    classes: [{ classType: 'wizard', level: 13 }],
    int: new Stat(18),
  });

  // Exactly 6 level-6 spells
  const sixLvl6 = [
    { level: 6 }, { level: 6 }, { level: 6 },
    { level: 6 }, { level: 6 }, { level: 6 },
  ];
  const budgetAtCap = computeWizardBudget(wizard13, sixLvl6);
  assert.strictEqual(budgetAtCap.perLevelUsed[6], 6);
  assert.strictEqual(budgetAtCap.isLevelAtCap(6), true);
  assert.strictEqual(budgetAtCap.isLevelOverCap(6), false);
  assert.strictEqual(budgetAtCap.anyLevelOverCap, false);

  const checkAdd7th = budgetAtCap.canAddSpell(6);
  assert.strictEqual(checkAdd7th.allowed, false);
  assert.ok(checkAdd7th.reason.includes('Limit für Grad 6 erreicht'));

  // Legacy / imported character with 7 level-6 spells (exceeds cap)
  const sevenLvl6 = [...sixLvl6, { level: 6 }];
  const budgetOverCap = computeWizardBudget(wizard13, sevenLvl6);
  assert.strictEqual(budgetOverCap.perLevelUsed[6], 7);
  assert.strictEqual(budgetOverCap.isLevelOverCap(6), true);
  assert.strictEqual(budgetOverCap.anyLevelOverCap, true);
});

test('Wizard Budget - Prestige Class Integration (Wizard 5 / Spellwarp Sniper 5)', () => {
  const hybridPC = new Combatant({
    name: 'Sniper Wizard',
    classes: [
      { classType: 'wizard', level: 5 },
      { classType: 'spellwarp_sniper', level: 5 },
    ],
    int: new Stat(16), // Mod +3
  });

  // Effective Caster Level = 10
  const effWizCL = getEffectiveCasterLevel(hybridPC, 'wizard');
  assert.strictEqual(effWizCL, 10);

  const budget = computeWizardBudget(hybridPC, []);
  assert.strictEqual(budget.wizCL, 10);

  // Total budget: (3 + 3) + 9 * 2 = 6 + 18 = 24
  assert.strictEqual(budget.maxFromLevelUps, 24);

  // Level 5 unlocked at Wizard 9 -> at CL 10: (10 - 9 + 1) * 2 = 4
  assert.strictEqual(budget.perLevelCaps[5], 4);

  // Level 6 unlocks at Wizard 11 -> at CL 10: 0
  assert.strictEqual(budget.perLevelCaps[6], 0);
  assert.strictEqual(budget.canAddSpell(6).allowed, false);
  assert.strictEqual(budget.canAddSpell(5).allowed, true);
});

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

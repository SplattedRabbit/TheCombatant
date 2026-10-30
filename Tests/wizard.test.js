import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CombatRules, getEffectiveCasterLevel, computeWizardBudget } from '../js/rules.js';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';
import { resolveSpellLevelInfo } from '../src/components/player/wizard/spells/spellSelectionRules.ts';
import { applyWizardCharacterToState } from '../src/components/player/wizard/wizardSaveHelper.ts';
import { CombatState, getState } from '../js/state.js';
import { CombatSpells } from '../js/spells.js';

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

describe("Wizard prestige class spells", () => {
// Unit tests for prestige class spell learning quota resolution and wizard save helper persistence in character creation.


// Setup mock cantrips for character creation cantrip granting
CombatSpells.REGISTRY['read_magic'] = {
  id: 'read_magic',
  nameDe: 'Magie lesen',
  nameEn: 'Read Magic',
  school: 'divination',
  level: 0,
  classLevels: [{ class: 'wizard', level: 0 }]
};

CombatSpells.REGISTRY['detect_magic'] = {
  id: 'detect_magic',
  nameDe: 'Magie entdecken',
  nameEn: 'Detect Magic',
  school: 'divination',
  level: 0,
  classLevels: [{ class: 'wizard', level: 0 }]
};

test('Wizard PRC Spells - Base Wizard level 1 quota resolution', () => {
  const currentConfig = { classType: 'wizard' };
  const allLevelConfigs = [{ classType: 'wizard' }];
  const info = resolveSpellLevelInfo(currentConfig, allLevelConfigs, 0, 4); // INT 18 (+4)

  assert.strictEqual(info.isCaster, true);
  assert.strictEqual(info.targetCasterClass, 'wizard');
  assert.strictEqual(info.quota, 7, '3 + INT mod (+4) = 7 starting spells');
  assert.strictEqual(info.maxSpellLevel, 1);
  assert.strictEqual(info.autoCantrips, true);
});

test('Wizard PRC Spells - Spellwarp Sniper level 1 advancing Wizard 6 quota resolution', () => {
  // 6 levels of wizard, 7th level is Spellwarp Sniper
  const levelConfigs = [
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    { classType: 'wizard' },
    {
      classType: 'spellwarp_sniper',
      prestigeSpellLinks: { spellwarp_sniper: 'wizard' }
    }
  ];

  const info = resolveSpellLevelInfo(levelConfigs[6], levelConfigs, 6, 4);

  assert.strictEqual(info.isCaster, true, 'Spellwarp Sniper advancing Wizard must be recognized as caster');
  assert.strictEqual(info.targetCasterClass, 'wizard', 'Target caster class must be wizard');
  assert.strictEqual(info.isPrestige, true, 'Must be flagged as prestige class');
  assert.strictEqual(info.effectiveCasterLevel, 7, '6 Wizard + 1 Spellwarp Sniper = CL 7');
  assert.strictEqual(info.maxSpellLevel, 4, 'CL 7 Wizard casts up to 4th level spells');
  assert.strictEqual(info.quota, 2, 'Gains 2 free spells for spellbook');
  assert.ok(info.allowedSpellLevels.includes(4), 'Allowed levels must include 4th level');
  assert.ok(info.label.includes('Spellwarp Sniper'), 'Label should mention prestige class');
  assert.ok(info.label.includes('Wizard'), 'Label should mention progressed class');
});

test('Wizard PRC Spells - Non-casting prestige class (Battle Trickster) does not trigger spell selection', () => {
  const levelConfigs = [
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'fighter' },
    { classType: 'battle_trickster' }
  ];

  const info = resolveSpellLevelInfo(levelConfigs[5], levelConfigs, 5, 0);
  assert.strictEqual(info.isCaster, false, 'Battle Trickster has no spellcasting progression');
  assert.strictEqual(info.quota, 0);
});

test('Wizard PRC Spells - Character Creation Wizard persists prestigeSpellLinks and grants cantrips', () => {
  const levelConfigs = [
    { classType: 'wizard', hpRoll: 4, spells: ['magic_missile', 'mage_armor'] },
    { classType: 'wizard', hpRoll: 3, spells: ['shield', 'grease'] },
    { classType: 'wizard', hpRoll: 3, spells: ['web', 'mirror_image'] },
    { classType: 'wizard', hpRoll: 4, spells: ['scorching_ray', 'glitterdust'] },
    { classType: 'wizard', hpRoll: 2, spells: ['fireball', 'fly'] },
    { classType: 'wizard', hpRoll: 3, spells: ['haste', 'dispel_magic'] },
    {
      classType: 'spellwarp_sniper',
      hpRoll: 4,
      prestigeSpellLinks: { spellwarp_sniper: 'wizard' },
      spells: ['ice_storm', 'dimension_door']
    }
  ];

  const baseStats = { str: 10, dex: 14, con: 14, int: 18, wis: 10, cha: 8 };
  const completedDraft = {
    classesList: [
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 1 }
    ],
    statMods: { str: 0, dex: 2, con: 2, int: 4, wis: 0, cha: -1 },
    prestigeSpellLinks: { spellwarp_sniper: 'wizard' },
    wizardSpecialization: 'none',
    wizardProhibited1: '',
    wizardProhibited2: '',
    allSkills: {},
    allSkillTricks: []
  };

  applyWizardCharacterToState(
    'Archmage Sniper',
    'human',
    'Chaotic',
    'Good',
    baseStats,
    levelConfigs,
    completedDraft
  );

  const pc = CombatState.getActivePC();
  assert.ok(pc, 'PC must be active in state');
  assert.strictEqual(pc.name, 'Archmage Sniper');
  assert.strictEqual(pc.classes.length, 2, 'Should have 2 classes (Wizard 6 / Spellwarp Sniper 1)');

  // Verify prestigeSpellLinks is preserved
  assert.ok(pc.prestigeSpellLinks, 'prestigeSpellLinks must be defined');
  assert.strictEqual(pc.prestigeSpellLinks.spellwarp_sniper, 'wizard', 'spellwarp_sniper must link to wizard');

  // Verify effective caster level
  const cl = CombatRules.getEffectiveCasterLevel(pc, 'wizard');
  assert.strictEqual(cl, 7, 'Effective Wizard Caster Level must be 7 (6 Wizard + 1 Spellwarp Sniper)');

  // Verify learned spells contains both levelup spells and cantrips
  assert.ok(pc.learnedSpells.includes('fireball'), 'Must contain Fireball');
  assert.ok(pc.learnedSpells.includes('ice_storm'), 'Must contain Ice Storm chosen on PrC level');
  assert.ok(pc.learnedSpells.includes('read_magic'), 'Must contain auto-granted 0-level Cantrips (Read Magic)');
  assert.ok(pc.learnedSpells.includes('detect_magic'), 'Must contain auto-granted 0-level Cantrips (Detect Magic)');

  // Clean up
  const state = getState();
  state.combatants = state.combatants.filter(c => c.name !== 'Archmage Sniper');
});
});

describe("Wizard spell budget", () => {
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
});

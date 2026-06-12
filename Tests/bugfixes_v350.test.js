import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { CombatRules } from '../js/rules.js';
import { CompanionSheet } from '../js/ui/components/CompanionSheet.js';
import { Combatant } from '../js/models/Combatant.js';

test('Bug 1 - Bard Perform dynamic modifier calculation', () => {
  const pc = new Combatant({
    id: 'bard_test',
    name: 'Barde Alistair',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'bard', level: 5 }],
    cha: { base: 16, modifiers: [] }, // CHA mod: +3
    skills: {
      perform: { ranks: 5, misc: 2 } // 5 ranks, 2 misc
    },
    feats: [
      { id: 'skill_focus', option: 'perform' } // +3 Skill Focus
    ]
  });

  // Calculate Perform modifier: 5 (ranks) + 3 (CHA mod) + 2 (misc) + 3 (Skill Focus) = 13
  const totalMod = pc.getSkillModifier('perform');
  assert.strictEqual(totalMod, 13, `Perform modifier should be 13, but was ${totalMod}`);
});

test('Bug 1 - Animal Companion scaling (Wolf at Level 1 and 6)', () => {
  // Level 1 Wolf (no scaling)
  const wolfLvl1 = CompanionSheet.getCompanionBaseStats('wolf', 1);
  assert.ok(wolfLvl1, 'Wolf stats should be defined');
  assert.strictEqual(wolfLvl1.ac, 14, 'Wolf AC at level 1 should be 14');
  assert.strictEqual(wolfLvl1.str, 13, 'Wolf Str at level 1 should be 13');
  assert.strictEqual(wolfLvl1.maxHP, 13, 'Wolf Max HP at level 1 should be 13');
  assert.strictEqual(wolfLvl1.attacks[0].bonus, 3, 'Wolf bite bonus at level 1 should be +3');
  assert.strictEqual(wolfLvl1.attacks[0].damage, '1w6+1', 'Wolf bite damage at level 1 should be 1w6+1');

  // Level 6 Wolf (+4 HD, +4 Natural Armor, +2 Str/Dex)
  // New AC: 14 + 4 = 18
  // New Str: 13 + 2 = 15 (mod +2)
  // New Dex: 15 + 2 = 17
  // New Con: 15 (mod +2)
  // New Max HP: 13 + 4 * (4.5 + 2) = 13 + 26 = 39
  // New BAB: Math.floor(6 * 0.75) = 4 (Old BAB: Math.floor(2 * 0.75) = 1) -> BAB diff = +3
  // Str mod diff: +2 - +1 = +1
  // Total attack bonus diff: +3 (BAB diff) + 1 (Str diff) = +4
  // New bite attack bonus: 3 + 4 = 7
  // New bite damage: 1w6 + Math.floor(2 * 1.5) = 1w6+3
  const wolfLvl6 = CompanionSheet.getCompanionBaseStats('wolf', 6);
  assert.ok(wolfLvl6, 'Wolf stats should be defined at level 6');
  assert.strictEqual(wolfLvl6.ac, 18, `Wolf AC at level 6 should be 18, but was ${wolfLvl6.ac}`);
  assert.strictEqual(wolfLvl6.str, 15, `Wolf Str at level 6 should be 15, but was ${wolfLvl6.str}`);
  assert.strictEqual(wolfLvl6.maxHP, 39, `Wolf Max HP at level 6 should be 39, but was ${wolfLvl6.maxHP}`);
  assert.strictEqual(wolfLvl6.attacks[0].bonus, 7, `Wolf bite bonus at level 6 should be +7, but was +${wolfLvl6.attacks[0].bonus}`);
  assert.strictEqual(wolfLvl6.attacks[0].damage, '1w6+3', `Wolf bite damage at level 6 should be 1w6+3, but was ${wolfLvl6.attacks[0].damage}`);
});

test('Bug 6 - Feat allocation and priority validation', () => {
  const pc = new Combatant({
    id: 'fighter_wizard_human',
    name: 'Gerd',
    type: 'player',
    race: 'human',
    isHuman: true,
    classes: [
      { classType: 'fighter', level: 4 }, // 1 + 2 = 3 fighter bonus slots
      { classType: 'wizard', level: 0 }
    ],
    level: 4 // totalLevel: 4 -> 1 + Math.floor(3/3) = 2 general slots (+1 human = 3 general slots)
  });

  // Total slots: 3 General + 3 Fighter = 6 slots.
  
  // Case A: Valid selection
  // 3 Combat feats (dodge, mobility, power_attack) -> Fighter slots
  // 3 General/Other feats (skill_focus, toughness, alertness) -> General slots
  const validFeats = [
    { id: 'dodge' },
    { id: 'mobility' },
    { id: 'power_attack' },
    { id: 'skill_focus' },
    { id: 'toughness' },
    { id: 'alertness' }
  ];
  const validationA = CombatRules.validateFeatsAssignment(pc, validFeats);
  assert.ok(validationA.success, `Validation should succeed, but failed with: ${validationA.error}`);

  // Case B: Invalid selection (too many general feats)
  // 1 Combat feat (dodge) -> 1 Fighter slot (2 empty Fighter slots)
  // 5 General feats (skill_focus, toughness, alertness, iron_will, run)
  // General limit is 3, but we chose 5. These cannot fit into the empty Fighter slots.
  const invalidFeats = [
    { id: 'dodge' },
    { id: 'skill_focus' },
    { id: 'toughness' },
    { id: 'alertness' },
    { id: 'iron_will' },
    { id: 'run' }
  ];
  const validationB = CombatRules.validateFeatsAssignment(pc, invalidFeats);
  assert.strictEqual(validationB.success, false, 'Validation should fail for too many general feats');
  assert.ok(validationB.error.includes('Talentwahl ungültig') || validationB.error.includes('Limit für allgemeine Talente'), `Error message should explain slot mismatch: "${validationB.error}"`);
});

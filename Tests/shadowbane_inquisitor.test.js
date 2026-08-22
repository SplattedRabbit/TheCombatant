import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatRules } from '../js/rules.js';
import { CombatState } from '../js/state.js';
import { recalculateDailyAbilities } from '../js/state/pc/PCGeneral.js';
import { consumeSmiteEvilCharge } from '../js/state/pc/PCFeatsSpells.js';
import { getPrestigeClassFeatures, getSneakAttackDiceFromPrestigeClasses } from '../js/rules/prestigeClassEngine.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';

test('Shadowbane Inquisitor - Prerequisites Validation (RAW D&D 3.5e)', () => {
  const pc = new Combatant({
    name: 'Kalva the Inquisitor',
    alignment: 'LG',
    classes: [
      { classType: 'paladin', level: 4 },
      { classType: 'rogue', level: 1 }
    ],
    feats: [{ id: 'power_attack' }],
    skills: {
      gather_information: { ranks: 4 },
      knowledge_religion: { ranks: 2 },
      sense_motive: { ranks: 8 }
    }
  });

  // Set BAB initially to +4
  pc.bab.base = 4;

  const valBabFail = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valBabFail.success, false, 'Should fail BAB +5 requirement when BAB is only +4');
  assert.ok(valBabFail.errors.some(e => e.includes('BAB')), 'Error list should mention BAB');

  // Add 1 more level of Paladin to reach BAB +5 (Paladin 5 + Rogue 1 = BAB +5)
  pc.classes = [
    { classType: 'paladin', level: 5 },
    { classType: 'rogue', level: 1 }
  ];
  pc.bab.base = 5;
  pc.rebuildStatModifiers();

  const valSuccess = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valSuccess.success, true, 'Should qualify with Paladin 5 / Rogue 1, LG, Power Attack, and required skills');

  // Test alignment failure: Not Lawful Good (e.g. CG)
  pc.alignment = 'CG';
  const valAlignFail = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valAlignFail.success, false, 'Should fail for non-LG alignment');

  // Restore alignment, test missing feat
  pc.alignment = 'Lawful Good';
  pc.feats = [];
  const valFeatFail = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valFeatFail.success, false, 'Should fail when Power Attack is missing');

  // Restore feat, test missing sneak attack
  pc.feats = [{ id: 'power_attack' }];
  pc.classes = [{ classType: 'paladin', level: 5 }]; // No rogue -> no sneak attack
  const valNoSneak = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valNoSneak.success, false, 'Should fail without sneak attack');

  // Test missing turn undead (Rogue 5 / Fighter 1)
  pc.classes = [
    { classType: 'rogue', level: 5 },
    { classType: 'fighter', level: 1 }
  ];
  const valNoTurn = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valNoTurn.success, false, 'Should fail without Turn Undead and Detect Evil');
});

test('Shadowbane Inquisitor - Feature Engine & Stacking Mechanics', () => {
  const pc = new Combatant({
    name: 'Kalva',
    alignment: 'LG',
    classes: [
      { classType: 'paladin', level: 4 },
      { classType: 'rogue', level: 2 },
      { classType: 'shadowbane_inquisitor', level: 1 }
    ]
  });

  // Level 1: Pierce Shadows
  let features = getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  assert.strictEqual(features.absoluteConviction, true);
  assert.strictEqual(features.pierceShadowsRadius, 25); // 20 + 5*1
  assert.strictEqual(features.pierceShadowsDuration, 10); // 10*1 min
  assert.strictEqual(features.sacredStealthBonus, 0);
  assert.strictEqual(features.smiteUses, 0);
  assert.strictEqual(pc.hasFeat('improved_sunder'), false);

  // Level 3: Improved Sunder bonus feat + Sacred Stealth +4 + Smite 1/day
  pc.classes[2].level = 3;
  features = getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  assert.strictEqual(features.sacredStealthBonus, 4);
  assert.strictEqual(features.smiteUses, 1);
  assert.strictEqual(features.improvedSunder, true);
  assert.strictEqual(pc.hasFeat('improved_sunder'), true, 'Combatant should automatically have Improved Sunder at level >= 3');

  // Level 4: Sneak Attack +1d6 (stacks with Rogue 2's +1d6 -> total 2d6)
  pc.classes[2].level = 4;
  features = getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  assert.strictEqual(features.sneakAttackStack, 1);
  assert.strictEqual(getSneakAttackDiceFromPrestigeClasses(pc), 1);
  assert.strictEqual(pc.getSneakAttackDiceCount(), 2, 'Rogue 1d6 + Inquisitor 1d6 should equal 2d6');

  // Level 7: Sacred Stealth +8 + Sneak Attack +2d6 (total 3d6)
  pc.classes[2].level = 7;
  features = getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  assert.strictEqual(features.sacredStealthBonus, 8);
  assert.strictEqual(features.sneakAttackStack, 2);
  assert.strictEqual(pc.getSneakAttackDiceCount(), 3, 'Rogue 1d6 + Inquisitor 2d6 should equal 3d6');

  // Level 10: Smite 3/day, Sneak Attack +3d6 (total 4d6), Burning Light active
  pc.classes[2].level = 10;
  features = getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  assert.strictEqual(features.smiteUses, 3);
  assert.strictEqual(features.sneakAttackStack, 3);
  assert.strictEqual(features.burningLight, true);
  assert.strictEqual(pc.getSneakAttackDiceCount(), 4, 'Rogue 1d6 + Inquisitor 3d6 should equal 4d6');
});

test('Shadowbane Inquisitor - Smite & Daily Abilities Lifecycle', () => {
  const pc = new Combatant({
    name: 'Kalva',
    alignment: 'LG',
    str: 16,
    cha: 14, // +2 mod
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'shadowbane_inquisitor', level: 6 }
    ],
    weapons: [
      {
        id: 'gs1',
        name: 'Greatsword',
        damageDice: '2w6',
        crit: '19-20 / x2',
        grip: '2h',
        enhancement: 1
      }
    ]
  });

  recalculateDailyAbilities(pc);
  const smiteAbility = pc.dailyAbilities.find(a => a.name === 'Smite (Inquisitor)');
  assert.ok(smiteAbility, 'Daily ability Smite (Inquisitor) should be created');
  assert.strictEqual(smiteAbility.max, 2, 'Should have 2 smite uses at level 6');
  assert.strictEqual(smiteAbility.used, 0);

  // Set up active PC in state
  const state = CombatState.getState();
  state.combatants = [pc];
  state.localPCId = pc.id;

  // Consume a charge
  const res = consumeSmiteEvilCharge();
  assert.strictEqual(res.success, true);
  assert.strictEqual(smiteAbility.used, 1);
  assert.strictEqual(res.remaining, 1);

  // Attack sequence calculation with smite
  const seq = AttackEngine.calculateAttackSequence(pc, pc.weapons[0], false, { smite: true });
  assert.ok(seq.length > 0);
  const primaryAtk = seq[0];

  // Smite should add +2 (CHA) to attack roll and +6 (Inquisitor level) to damage
  const smiteAtkPart = primaryAtk.atkBreakdown.find(b => b.label.includes('Smite') || b.label.includes('Böses niederstrecken'));
  assert.ok(smiteAtkPart, 'Smite attack breakdown should include CHA bonus');
  assert.strictEqual(smiteAtkPart.value, 2);

  const smiteDmgPart = primaryAtk.dmgBreakdown.find(b => b.label.includes('Smite Corrupt') || b.label.includes('Smite'));
  assert.ok(smiteDmgPart, 'Smite damage breakdown should include inquisitor level');
  assert.strictEqual(smiteDmgPart.value, 6);
});

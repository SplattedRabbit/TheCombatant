import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatRules } from '../js/rules.js';
import { CombatState } from '../js/state.js';
import { recalculateDailyAbilities } from '../js/state/pc/PCGeneral.js';
import { consumeSmiteEvilCharge } from '../js/state/pc/PCFeatsSpells.js';
import { getPrestigeClassFeatures, getSneakAttackDiceFromPrestigeClasses } from '../js/rules/prestigeClassEngine.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { ShadowbaneInquisitorRules } from '../js/rules/classes/ShadowbaneInquisitorRules.js';

test('Shadowbane Inquisitor - Prerequisites Validation (RAW D&D 3.5e)', () => {
  const pc = new Combatant({
    name: 'Kalva the Inquisitor',
    alignment: 'LG',
    str: 14,
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
  assert.ok(valSuccess.metDetails.some(d => d.label.includes('Strength (STR): 13+') && d.met), 'MetDetails must include met Strength requirement');

  // Test attribute failure: STR < 13 (implicit requirement from Power Attack)
  pc.str.base = 10;
  const valStrFail = CombatRules.validatePrestigeClassPrereqs(pc, 'shadowbane_inquisitor');
  assert.strictEqual(valStrFail.success, false, 'Should fail when Strength is under 13 for Power Attack');
  assert.ok(valStrFail.errors.some(e => e.includes('Strength') || e.includes('STR')), 'Error list should mention Strength');
  assert.ok(valStrFail.metDetails.some(d => d.label.includes('Strength (STR): 13+') && !d.met), 'MetDetails should flag unmet Strength requirement');
  pc.str.base = 14; // Restore STR

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

test('Shadowbane Inquisitor - Bug #37: Smite Uses at Level 10 (RAW Complete Adventurer Table 2-18)', () => {
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(1), 0);
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(2), 1);
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(5), 1);
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(6), 2);
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(9), 2);
  assert.strictEqual(ShadowbaneInquisitorRules.getSmiteCorruptUses(10), 3, 'Level 10 Shadowbane Inquisitor must have 3 smite corrupt uses');

  const pcLvl10 = new Combatant({
    name: 'Master Inquisitor',
    classes: [
      { classType: 'paladin', level: 5 },
      { classType: 'shadowbane_inquisitor', level: 10 }
    ]
  });
  recalculateDailyAbilities(pcLvl10);
  const inqSmite = pcLvl10.dailyAbilities.find(a => a.name === 'Smite (Inquisitor)' || a.name === 'Smite Corrupt');
  assert.ok(inqSmite, 'Smite (Inquisitor) daily ability must exist');
  assert.strictEqual(inqSmite.max, 3, 'Daily ability Smite max must be 3 at level 10');
});

test('Shadowbane Inquisitor - Bug #40: Smite Consumption, Deadlock Prevention and Single Attack Application', () => {
  const pc = new Combatant({
    name: 'Dual Smiter',
    alignment: 'LG',
    str: 16, // +3
    dex: 14, // +2
    cha: 16, // +3
    bab: { base: 11 }, // Iteratives at +11/+6/+1
    classes: [
      { classType: 'paladin', level: 4 }, // Smite Evil 1/day, +4 dmg
      { classType: 'shadowbane_inquisitor', level: 6 } // Smite Corrupt 2/day, +6 dmg
    ],
    weapons: [
      {
        id: 'w_main',
        name: 'Longsword',
        type: 'longsword',
        grip: '1h',
        hand: 'main',
        damageDice: '1w8',
        crit: '19-20 / x2',
        isEquipped: true
      },
      {
        id: 'w_off',
        name: 'Dagger',
        type: 'dagger',
        grip: 'sec',
        hand: 'off',
        damageDice: '1w4',
        crit: '19-20 / x2',
        isEquipped: true
      }
    ],
    feats: [{ id: 'two_weapon_fighting' }]
  });

  recalculateDailyAbilities(pc);
  const palSmite = pc.dailyAbilities.find(a => a.name === 'Smite Evil' || a.name === 'Böses niederstrecken');
  const inqSmite = pc.dailyAbilities.find(a => a.name === 'Smite (Inquisitor)' || a.name === 'Smite Corrupt');
  assert.ok(palSmite, 'Paladin smite must exist');
  assert.ok(inqSmite, 'Inquisitor smite must exist');
  assert.strictEqual(palSmite.max, 1);
  assert.strictEqual(inqSmite.max, 2);

  // Set as active PC in state
  const state = CombatState.getState();
  state.combatants = [pc];
  state.localPCId = pc.id;

  // 1. Deadlock prevention: Exhaust Paladin smite first
  palSmite.used = palSmite.max; // Paladin smites empty!
  assert.strictEqual(palSmite.used, 1);
  assert.strictEqual(inqSmite.used, 0);

  // Consuming should NOT fail with remaining: 0; it should automatically use Inquisitor smite!
  const res = consumeSmiteEvilCharge();
  assert.strictEqual(res.success, true, 'Should successfully consume Inquisitor smite when Paladin smite is exhausted');
  assert.strictEqual(inqSmite.used, 1, 'Inquisitor smite should now have 1 used');
  assert.strictEqual(res.remaining, 1, '1 Inquisitor smite remaining');

  // Preferred source selection:
  inqSmite.used = 0;
  palSmite.used = 0;
  const resInq = consumeSmiteEvilCharge('inquisitor');
  assert.strictEqual(resInq.success, true);
  assert.strictEqual(inqSmite.used, 1, 'Targeted Inquisitor smite used');
  assert.strictEqual(palSmite.used, 0, 'Paladin smite untouched');

  // 2. Multi-attack check (RAW: Smite applies ONLY to a single attack, not iteratives or offhand)
  const fullSeq = AttackEngine.calculateAttackSequence(pc, pc.weapons[0], true, { smite: true, smiteSource: 'inquisitor' });
  // With BAB 11 and TWF: Primary attacks #1 (+11), #2 (+6), #3 (+1) + offhand attack
  assert.ok(fullSeq.length >= 3, 'Full sequence should have multiple attacks');

  const firstAtk = fullSeq[0];
  const secondAtk = fullSeq[1];
  const offhandAtk = fullSeq.find(a => a.isOffhand);

  // First attack MUST have Smite Corrupt attack (+3 CHA) and damage (+6 Inquisitor level)
  const firstSmiteAtk = firstAtk.atkBreakdown.find(b => b.label.includes('Smite'));
  const firstSmiteDmg = firstAtk.dmgBreakdown.find(b => b.label.includes('Smite'));
  assert.ok(firstSmiteAtk, 'First attack must have smite attack bonus');
  assert.strictEqual(firstSmiteAtk.value, 3, 'CHA mod +3 on first attack');
  assert.ok(firstSmiteDmg, 'First attack must have smite damage bonus');
  assert.strictEqual(firstSmiteDmg.value, 6, 'Inquisitor level +6 damage on first attack');

  // Second attack MUST NOT have Smite bonus
  const secondSmiteAtk = secondAtk.atkBreakdown.find(b => b.label.includes('Smite'));
  const secondSmiteDmg = secondAtk.dmgBreakdown.find(b => b.label.includes('Smite'));
  assert.strictEqual(secondSmiteAtk, undefined, 'Second attack must NOT have smite attack bonus');
  assert.strictEqual(secondSmiteDmg, undefined, 'Second attack must NOT have smite damage bonus');

  // Off-hand attack MUST NOT have Smite bonus
  if (offhandAtk) {
    const ohSmiteAtk = offhandAtk.atkBreakdown.find(b => b.label.includes('Smite'));
    const ohSmiteDmg = offhandAtk.dmgBreakdown.find(b => b.label.includes('Smite'));
    assert.strictEqual(ohSmiteAtk, undefined, 'Off-hand attack must NOT have smite attack bonus');
    assert.strictEqual(ohSmiteDmg, undefined, 'Off-hand attack must NOT have smite damage bonus');
  }
});

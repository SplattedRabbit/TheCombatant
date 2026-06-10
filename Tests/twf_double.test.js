// Tests/twf_double.test.js - Test suite for Two-Weapon Fighting and Double Weapons (3.5e RAW)

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Weapon } from '../js/models/Weapon.js';
import { Armor } from '../js/models/Armor.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';

test('TWF - Ranger Virtual Feats and Armor Suspension', () => {
  // 1. Ranger Level 2 without armor should have Two-Weapon Fighting virtual feat
  const pc = new Combatant({
    name: 'Ranger Hero',
    type: 'p',
    classes: [{ classType: 'ranger', level: 2 }],
    rangerCombatStyle: 'twoweapon',
    feats: []
  });
  
  // Wield main and off-hand weapons to trigger TWF
  const mw = new Weapon({ name: 'Longsword', hand: 'main', isEquipped: true });
  const ow = new Weapon({ name: 'Dagger', hand: 'off', isEquipped: true });
  pc.weapons = [mw, ow];
  pc.bab.base = 2;
  pc.str = 10;
  
  // No armor equipped -> virtual TWF feat active -> -2 / -2 penalty
  // Atk = BAB 2 + STR 0 - 2 = 0
  const seqNoArmor = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqNoArmor[0].atkTotal, 0, 'Should have -2 penalty (virtual TWF active)');
  const ohNoArmor = seqNoArmor.find(atk => atk.isOffhand);
  assert.strictEqual(ohNoArmor.atkTotal, 0, 'Off-hand should have -2 penalty');

  // 2. Ranger Level 2 wearing heavy armor -> virtual feat suspended -> -4 / -8 penalty
  const heavyArmor = new Armor({ name: 'Ritterrüstung', type: 'full_plate', isEquipped: true });
  pc.armors = [heavyArmor];
  
  // Suspend virtual TWF -> Atk = BAB 2 + STR 0 - 4 = -2
  const seqHeavyArmor = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqHeavyArmor[0].atkTotal, -2, 'Should have -4 penalty (virtual TWF suspended in heavy armor)');
  const ohHeavyArmor = seqHeavyArmor.find(atk => atk.isOffhand);
  assert.strictEqual(ohHeavyArmor.atkTotal, -6, 'Off-hand should have -8 penalty (suspended)');

  // 3. Ranger Level 2 wearing medium armor -> virtual feat suspended -> -4 / -8 penalty
  const medArmor = new Armor({ name: 'Schuppenpanzer', type: 'scale_mail', isEquipped: true });
  pc.armors = [medArmor];
  
  const seqMedArmor = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqMedArmor[0].atkTotal, -2, 'Should have -4 penalty (suspended in medium armor)');

  // 4. Ranger Level 2 wearing light armor -> virtual feat active -> -2 / -2 penalty
  const lightArmor = new Armor({ name: 'Lederrüstung', type: 'leather', isEquipped: true });
  pc.armors = [lightArmor];
  
  const seqLightArmor = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqLightArmor[0].atkTotal, 0, 'Should have -2 penalty (active in light armor)');
});

test('TWF - Penalties with New Hand Selection', () => {
  const pc = new Combatant({
    name: 'Gladiator',
    type: 'p',
    feats: []
  });
  pc.bab.base = 6;
  pc.str = 10;
  
  const mw = new Weapon({ name: 'Longsword', hand: 'main', isEquipped: true });
  const ow = new Weapon({ name: 'Dagger', hand: 'off', isEquipped: true });
  pc.weapons = [mw, ow];
  
  // No feats, light offhand -> -4 / -8
  // Main: 6 + 0 - 4 = 2
  // Off: 6 + 0 - 8 = -2
  const seqNoFeat = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqNoFeat[0].atkTotal, 2, 'Main should be +2');
  const ohNoFeat = seqNoFeat.find(atk => atk.isOffhand);
  assert.strictEqual(ohNoFeat.atkTotal, -2, 'Off-hand should be -2');

  // With TWF feat, light offhand -> -2 / -2
  // Main: 6 + 0 - 2 = 4
  // Off: 6 + 0 - 2 = 4
  pc.feats = [{ id: 'two_weapon_fighting' }];
  const seqFeat = AttackEngine.calculateAttackSequence(pc, mw, true);
  assert.strictEqual(seqFeat[0].atkTotal, 4, 'Main should be +4');
  const ohFeat = seqFeat.find(atk => atk.isOffhand);
  assert.strictEqual(ohFeat.atkTotal, 4, 'Off-hand should be +4');
});

test('Double Weapons - Equipping and Damage Scaling', () => {
  const pc = new Combatant({
    name: 'Staff Master',
    type: 'p',
    feats: []
  });
  pc.bab.base = 6;
  pc.str = 14; // +2 STR Mod
  
  // Kampfstab (Quarterstaff) is a double weapon
  const staff = new Weapon({ name: 'Kampfstab', type: 'quarterstaff', isEquipped: true });
  pc.weapons = [staff];
  
  // Scenario A: Wielded as 2-handed weapon (isDoubleWielded = false)
  // Atk = BAB 6 + STR 2 = 8
  // Dmg = 1.5x STR = +3
  staff.isDoubleWielded = false;
  const seq2H = AttackEngine.calculateAttackSequence(pc, staff, false);
  assert.strictEqual(seq2H[0].atkTotal, 8);
  assert.strictEqual(seq2H[0].dmgTotal, 3, 'Should get 1.5x Str bonus on damage');

  // Scenario B: Wielded as double weapon (isDoubleWielded = true)
  // Main end: 1.0x STR damage (+2). Off end: 0.5x STR damage (+1).
  // Penalties (no TWF feat): main gets -4, off gets -8.
  // Main Atk: 6 + 2 - 4 = 4
  // Off Atk: 6 + 2 - 8 = 0
  staff.isDoubleWielded = true;
  const seqDouble = AttackEngine.calculateAttackSequence(pc, staff, true);
  assert.strictEqual(seqDouble[0].atkTotal, 4, 'Main end should have -4 penalty');
  assert.strictEqual(seqDouble[0].dmgTotal, 2, 'Main end should get 1.0x Str damage');
  
  const oh = seqDouble.find(atk => atk.isOffhand);
  assert.ok(oh, 'Should have off-hand end attack');
  assert.strictEqual(oh.atkTotal, 0, 'Off-hand end should have -8 penalty');
  assert.strictEqual(oh.dmgTotal, 1, 'Off-hand end should get 0.5x Str damage');
});

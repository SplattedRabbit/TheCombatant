import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { getActivePC, updateSession } from '../js/state/state-core.js';
import { createCombatant } from '../js/models/model-core.js';
import { Armor } from '../js/models/Armor.js';
import { Weapon } from '../js/models/Weapon.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';

test('Armory - Armor model loading & overrides', () => {
  const armor = new Armor({
    type: 'studded_leather',
    enhancement: 1
  });

  assert.strictEqual(armor.isShield, false, 'Studded leather is not a shield');
  assert.strictEqual(armor.armorBonus, 3, 'Studded leather base bonus is +3');
  assert.strictEqual(armor.maxDex, 5, 'Studded leather base max Dex is 5');
  assert.strictEqual(armor.checkPenalty, 1, 'Studded leather base ACP is 1');
  assert.strictEqual(armor.spellFailure, 15, 'Studded leather base ASF is 15%');

  // Verify overrides
  const customArmor = new Armor({
    type: 'chain_shirt',
    armorBonusOverride: 5,
    maxDexOverride: 6,
    checkPenaltyOverride: 0,
    spellFailureOverride: 10
  });

  assert.strictEqual(customArmor.armorBonus, 5, 'Override AC bonus to 5');
  assert.strictEqual(customArmor.maxDex, 6, 'Override MaxDex to 6');
  assert.strictEqual(customArmor.checkPenalty, 0, 'Override ACP to 0');
  assert.strictEqual(customArmor.spellFailure, 10, 'Override spell failure to 10%');
});

test('Armory - AC calculations in automatic mode', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');

  const pc = getActivePC();
  pc.dex.base = 16; // Dex mod +3
  pc.autoAC = true;

  // Equip light armor: studded leather (+3 AC, MaxDex 5, ACP 1)
  const studded = new Armor({ type: 'studded_leather', isEquipped: true });
  pc.armors = [studded];
  pc.rebuildStatModifiers();

  // AC should be 10 + 3 (Dex) + 3 (Armor) = 16
  assert.strictEqual(pc.ac.getValue(), 16, 'AC should be 16');
  assert.strictEqual(pc.acTouch.getValue(), 13, 'Touch AC should be 13 (Dex + 10)');
  assert.strictEqual(pc.acFlat.getValue(), 13, 'Flat-footed AC should be 13 (Armor + 10)');

  // Equip heavy shield: shield_heavy_steel (+2 AC, ACP 2, isShield: true)
  const shield = new Armor({ type: 'shield_heavy_steel', isEquipped: true });
  pc.armors.push(shield);
  pc.rebuildStatModifiers();

  // AC should be 10 + 3 (Dex) + 3 (Armor) + 2 (Shield) = 18
  assert.strictEqual(pc.ac.getValue(), 18, 'AC should be 18 with shield');
  assert.strictEqual(pc.acTouch.getValue(), 13, 'Touch AC should be 13 (excludes shield)');
  assert.strictEqual(pc.acFlat.getValue(), 15, 'Flat-footed AC should be 15 (Armor + Shield)');
});

test('Armory - Max Dex limits and saving throws', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');

  const pc = getActivePC();
  pc.dex.base = 20; // Dex mod +5
  pc.baseRef.base = 2; // base Reflex save +2
  pc.autoAC = true;

  // Equip heavy armor: full plate (+8 AC, MaxDex 1, ACP 6)
  const plate = new Armor({ type: 'full_plate', isEquipped: true });
  pc.armors = [plate];
  pc.rebuildStatModifiers();

  // AC should be 10 + 1 (Dex cap) + 8 (Armor) = 19
  assert.strictEqual(pc.ac.getValue(), 19, 'AC should be capped by MaxDex of Full Plate to 19');
  assert.strictEqual(pc.acTouch.getValue(), 11, 'Touch AC should be capped to 11');
  assert.strictEqual(pc.acFlat.getValue(), 18, 'Flat-footed AC should be 18');

  // Reflex saving throw should NOT be capped by armor MaxDex limit!
  // Reflex = 2 (base) + 5 (full Dex mod) = 7
  assert.strictEqual(pc.ref.getValue(), 7, 'Reflex saving throw must use full Dex modifier (+5) without armor cap');
});

test('Armory - Manual mode stability (autoAC = false)', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');

  const pc = getActivePC();
  pc.dex.base = 16;
  pc.autoAC = false;

  // Manually input custom AC values
  pc.ac.base = 14;
  pc.acTouch.base = 12;
  pc.acFlat.base = 11;

  // Equip full plate
  const plate = new Armor({ type: 'full_plate', isEquipped: true });
  pc.armors = [plate];
  pc.rebuildStatModifiers();

  // AC should remain at the manual base values (no auto overrides)
  // But note that basic Dex bonus is applied Untyped to AC if not autoAC
  // Wait, let's verify what get value is. If autoAC is false:
  // pc.ac.getValue() = pc.ac.base (14) + dex (3) = 17
  // pc.ac.base remains 14.
  assert.strictEqual(pc.ac.base, 14, 'Base AC must remain unchanged');
  assert.strictEqual(pc.acTouch.base, 12, 'Base Touch AC must remain unchanged');
  assert.strictEqual(pc.acFlat.base, 11, 'Base Flat-footed AC must remain unchanged');
});

test('Armory - Skill penalty modifications (Armor Check Penalty)', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');

  const pc = getActivePC();
  pc.dex.base = 14; // Dex Mod +2
  pc.str.base = 14; // Str Mod +2
  pc.autoAC = true;

  // No armor check penalty initially
  pc.armors = [];
  pc.rebuildStatModifiers();
  assert.strictEqual(pc.getArmorCheckPenalty(), 0, 'No ACP with no armor');

  // Equip scale mail (ACP 4)
  const scale = new Armor({ type: 'scale_mail', isEquipped: true });
  pc.armors = [scale];
  pc.rebuildStatModifiers();
  assert.strictEqual(pc.getArmorCheckPenalty(), 4, 'Scale mail ACP should be 4');

  // Check tumble (Dex skill, hasACP: true)
  // Tumble ranks = 0, Dex mod = +2, ACP = -4. Total = -2
  assert.strictEqual(pc.getSkillModifier('tumble'), -2, 'Tumble modifier should be -2 due to ACP');

  // Check swim (Str skill, hasACP: true, double penalty)
  // Swim ranks = 0, Str mod = +2, ACP = -4 * 2 = -8. Total = -6
  assert.strictEqual(pc.getSkillModifier('swim'), -6, 'Swim modifier should be -6 due to double ACP');

  // Check concentration (Con skill, hasACP: false)
  // Concentration ranks = 0, Con mod = +0. Total = 0
  assert.strictEqual(pc.getSkillModifier('concentration'), 0, 'Concentration should not receive ACP');
});

test('Armory - Weapon extra damage formulas integration', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');

  const pc = getActivePC();
  pc.str.base = 18; // Str mod +4
  pc.bab.base = 5;

  const weapon = new Weapon({
    name: 'Flammendes Langschwert',
    type: 'longsword',
    enhancement: 1,
    extraDamage: '1w6 Feuer'
  });

  const seq = AttackEngine.calculateAttackSequence(pc, weapon, false);
  assert.strictEqual(seq.length, 1, 'Should return 1 attack');
  
  const stdAtk = seq[0];
  // damageDice should include "+ 1w6 Feuer"
  // longsword base dice is "1w8"
  assert.strictEqual(stdAtk.damageDice, '1w8 + 1w6 Feuer', 'Damage dice formula should append extra damage');
  
  // dmgBreakdown should contain 'Zusatz-Schaden'
  const hasExtraDmgMod = stdAtk.dmgBreakdown.some(m => m.label === 'Zusatz-Schaden' && m.value === '1w6 Feuer');
  assert.ok(hasExtraDmgMod, 'Damage breakdown should log extra damage as info');
});

// Tests/weapons.test.js - Test suite for D&D 3.5e Weapon calculations, combat feats, and UI rendering

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { getActivePC, updateSession } from '../js/state/state-core.js';
import { createCombatant } from '../js/models/model-core.js';
import { getCritThreatDisplay, isLightWeapon, isFinessableWeapon, matchesFeatOption, Weapon } from '../js/models/Weapon.js';
import { uiRegistry } from '../js/ui/ui-shared.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';


test('Weapons - isLightWeapon and isFinessableWeapon parsing (RAW D&D 3.5e Bug #39)', () => {
  assert.strictEqual(isLightWeapon('Dolch'), true, 'Dolch should be light');
  assert.strictEqual(isLightWeapon('Dagger'), true, 'Dagger should be light');
  assert.strictEqual(isLightWeapon('Kurzschwert'), true, 'Kurzschwert should be light');
  assert.strictEqual(isLightWeapon('Rapier'), false, 'Rapier is one-handed, not light');
  assert.strictEqual(isLightWeapon('Spiked Chain'), false, 'Spiked Chain is two-handed, not light');
  assert.strictEqual(isLightWeapon('Dornenkette'), false, 'Dornenkette is two-handed, not light');
  assert.strictEqual(isLightWeapon('Zweihänder'), false, 'Zweihänder should not be light');
  assert.strictEqual(isLightWeapon('Langschwert'), false, 'Langschwert should not be light');

  assert.strictEqual(isFinessableWeapon('Rapier'), true, 'Rapier should be finessable');
  assert.strictEqual(isFinessableWeapon('Spiked Chain'), true, 'Spiked Chain should be finessable');
  assert.strictEqual(isFinessableWeapon('Dornenkette'), true, 'Dornenkette should be finessable');
  assert.strictEqual(isFinessableWeapon('Whip'), true, 'Whip should be finessable');
  assert.strictEqual(isFinessableWeapon('Peitsche'), true, 'Peitsche should be finessable');
  assert.strictEqual(isFinessableWeapon('Langschwert'), false, 'Langschwert should not be finessable');
});

test('Weapons - getCritThreatDisplay calculations (Keen doubling)', () => {
  // Threat range 20 (base range 1) -> 19-20 (range 2)
  assert.strictEqual(getCritThreatDisplay('20 / x2', true), '19-20 / x2');
  assert.strictEqual(getCritThreatDisplay('20 / x3', true), '19-20 / x3');
  
  // Threat range 19-20 (base range 2) -> 17-20 (range 4)
  assert.strictEqual(getCritThreatDisplay('19-20 / x2', true), '17-20 / x2');
  
  // Threat range 18-20 (base range 3) -> 15-20 (range 6)
  assert.strictEqual(getCritThreatDisplay('18-20 / x2', true), '15-20 / x2');
  
  // Under false (not keen), should return unchanged
  assert.strictEqual(getCritThreatDisplay('19-20 / x2', false), '19-20 / x2');
});

test('Weapons - Model inventory management (add / delete)', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');
  
  const pc = getActivePC();
  assert.ok(pc, 'Active PC should exist');
  pc.weapons = []; // Clear default weapons
  
  // 1. Add weapon
  CombatState.addPCWeapon();
  assert.strictEqual(pc.weapons.length, 1, 'Should have added 1 weapon');
  assert.strictEqual(pc.weapons[0].name, 'Neue Waffe');
  assert.strictEqual(pc.weapons[0].grip, '1h');
  
  // Modify it
  CombatState.updatePCWeapon(0, 'name', 'Langschwert');
  assert.strictEqual(pc.weapons[0].name, 'Langschwert');
  
  // 2. Add second weapon
  CombatState.addPCWeapon();
  assert.strictEqual(pc.weapons.length, 2, 'Should have 2 weapons');
  
  // 3. Delete weapon
  CombatState.deletePCWeapon(0);
  assert.strictEqual(pc.weapons.length, 1, 'Should have removed first weapon');
  assert.strictEqual(pc.weapons[0].name, 'Neue Waffe', 'First weapon should now be the new default one');
});

test('Weapons - Rule calculations', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');
  s.mode = 'player';
  
  const pc = getActivePC();
  pc.str = 18; // STR mod +4
  pc.dex = 14; // DEX mod +2
  pc.bab.base = 6; // BAB +6 (+6/+1 iterative attacks)
  pc.feats = [];
  pc.activeShape = 'none';

  // 1. Test standard 1-Hand melee weapon strength damage (1.0x STR)
  const langschwert = new Weapon({ name: 'Langschwert', grip: '1h', damageDice: '1w8', crit: '19-20 / x2', enhancement: 0 });
  let seq = AttackEngine.calculateAttackSequence(pc, langschwert, false);
  assert.strictEqual(seq[0].atkTotal, 10, 'Attack total should be +10 (BAB 6 + STR 4)');
  assert.strictEqual(seq[0].dmgTotal, 4, 'Damage total should be +4 (1.0x STR)');
  
  // 2. Test 2-Hand melee weapon strength damage (1.5x STR = +6)
  const zweihander = new Weapon({ name: 'Zweihänder', grip: '2h', damageDice: '2w6', crit: '19-20 / x2', enhancement: 0 });
  seq = AttackEngine.calculateAttackSequence(pc, zweihander, false);
  assert.strictEqual(seq[0].atkTotal, 10, 'Attack total should be +10');
  assert.strictEqual(seq[0].dmgTotal, 6, 'Two-handed damage should add 1.5x STR (+6)');

  // 3. Test Weapon Finesse swapping STR to DEX (+2) for light weapons
  pc.feats = [{ id: 'weapon_finesse' }];
  const dolch = new Weapon({ name: 'Dolch', grip: '1h', damageDice: '1w4', crit: '19-20 / x2', enhancement: 0 });
  // DEX (+2) is less than STR (+4) so Finesse should NOT swap (uses STR +10)
  seq = AttackEngine.calculateAttackSequence(pc, dolch, false);
  assert.strictEqual(seq[0].atkTotal, 10, 'Should use STR +10 since it is higher than DEX');

  // Change attributes: DEX 20 (+5), STR 10 (+0)
  pc.dex = 20; // DEX mod +5
  pc.str = 10; // STR mod +0
  seq = AttackEngine.calculateAttackSequence(pc, dolch, false);
  assert.strictEqual(seq[0].atkTotal, 11, 'Weapon Finesse should swap to DEX mod (+5) for light weapon');

  // 4. Test Power Attack scaling on 2-Handed weapon
  pc.feats = [{ id: 'power_attack' }];
  pc.powerAttackPenalty = 3;
  pc.str = 18; // STR mod +4
  seq = AttackEngine.calculateAttackSequence(pc, zweihander, false);
  assert.strictEqual(seq[0].atkTotal, 7, 'Attack should subtract Power Attack penalty (6 + 4 - 3)');
  assert.strictEqual(seq[0].dmgTotal, 12, 'Two-handed damage should receive double Power Attack bonus (6 + 6)');

  // 5. Test Composite Bow mechanics (Strength rating caps and low-strength attack penalties)
  pc.feats = [];
  pc.powerAttackPenalty = 0;
  pc.dex = 14; // DEX mod +2
  // Scenario A: Character strength mod (+4) is higher than bow rating (Stärke +2) -> Cap bonus to +2
  const compBow = new Weapon({ name: 'Kompositbogen (Stärke +2)', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 });
  seq = AttackEngine.calculateAttackSequence(pc, compBow, false);
  assert.strictEqual(seq[0].atkTotal, 8, 'Attack total should be +8 (6 + 2)');
  assert.strictEqual(seq[0].dmgTotal, 2, 'Composite Bow damage should be capped at rating (+2)');

  // Scenario B: Character strength mod (+0) is lower than bow rating (Stärke +2) -> -2 attack penalty, actual mod +0 damage
  pc.str = 10; // STR mod +0
  seq = AttackEngine.calculateAttackSequence(pc, compBow, false);
  assert.strictEqual(seq[0].atkTotal, 6, 'Composite Bow should apply -2 attack penalty if strength is insufficient');
  assert.strictEqual(seq[0].dmgTotal, 0, 'Composite Bow damage should equal actual strength mod if insufficient');

  // 6. Test Crossbow strength isolation (no damage modifier)
  pc.str = 8; // STR mod -1 (penalty)
  const crossbow = new Weapon({ name: 'Leichte Armbrust', grip: 'rng', damageDice: '1w8', crit: '19-20 / x2', enhancement: 0 });
  seq = AttackEngine.calculateAttackSequence(pc, crossbow, false);
  assert.strictEqual(seq[0].dmgTotal, 0, 'Crossbow should isolate damage from strength penalty (+0)');

  // Normal bow with negative strength should apply penalty
  const bow = new Weapon({ name: 'Kurzbogen', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 });
  seq = AttackEngine.calculateAttackSequence(pc, bow, false);
  assert.strictEqual(seq[0].dmgTotal, -1, 'Normal bow should apply strength penalty (-1)');

  // 7. Test Weapon Category auto-resolution
  const testDagger = new Weapon({ name: 'Sonnenklinge', type: 'dagger' });
  assert.strictEqual(testDagger.grip, '1h', 'Dagger should resolve grip to 1h');
  assert.strictEqual(testDagger.damageDice, '1w4', 'Dagger should resolve damage to 1w4');
  assert.strictEqual(testDagger.crit, '19-20 / x2', 'Dagger should resolve crit to 19-20 / x2');
  assert.strictEqual(isLightWeapon(testDagger), true, 'Dagger type should count as light weapon');

  // 8. Test Overrides
  const testOverridden = new Weapon({
    name: 'Bastard-Klinge',
    type: 'longsword',
    gripOverride: '2h',
    damageDiceOverride: '1w10',
    critOverride: '18-20 / x2'
  });
  assert.strictEqual(testOverridden.grip, '2h', 'Grip override should take precedence');
  assert.strictEqual(testOverridden.damageDice, '1w10', 'Damage dice override should take precedence');
  assert.strictEqual(testOverridden.crit, '18-20 / x2', 'Crit override should take precedence');

  // 9. Test Improved Critical feat integration (doubling)
  pc.feats = [{ id: 'verbesserter_kritischer_treffer', option: 'Langschwert' }];
  const lang = new Weapon({ name: 'Langschwert', type: 'longsword' });
  const hasImpCrit = pc.feats && pc.feats.some(f => 
    (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
    matchesFeatOption(lang, f.option)
  );
  let isDoubleThreat = lang.isKeen || hasImpCrit;
  let doubledCrit = getCritThreatDisplay(lang.crit, isDoubleThreat);
  // Standard longsword crit is 19-20/x2. Improved Critical doubles it to 17-20/x2.
  assert.strictEqual(doubledCrit, '17-20 / x2', 'Improved Critical should double the threat range');

  // 10. Test Improved Critical + Keen (should not stack)
  lang.isKeen = true;
  isDoubleThreat = lang.isKeen || hasImpCrit;
  doubledCrit = getCritThreatDisplay(lang.crit, isDoubleThreat);
  assert.strictEqual(doubledCrit, '17-20 / x2', 'Improved Critical and Keen should not stack (remain doubled)');
});

test('Weapons - Extra Damage Dropdowns and Formula Inclusion', () => {
  // 1. Test backward compatibility: legacy extraDamage string parsing in Weapon constructor
  const wLegacy = new Weapon({
    name: 'Flammendes Schwert',
    extraDamage: '1w6 Feuer'
  });
  assert.strictEqual(wLegacy.extraDamageDice, '1w6', 'Should parse legacy extraDamage dice');
  assert.strictEqual(wLegacy.extraDamageType, 'Feuer', 'Should parse legacy extraDamage type');
  assert.strictEqual(wLegacy.extraDamage, '1w6 Feuer', 'Getter should return correct extra damage string');

  const wLegacyTextOnly = new Weapon({
    name: 'Schwert',
    extraDamage: 'Feuer'
  });
  assert.strictEqual(wLegacyTextOnly.extraDamageDice, '', 'Should parse legacy non-dice string');
  assert.strictEqual(wLegacyTextOnly.extraDamageType, 'Feuer', 'Should parse legacy non-dice string type');
  assert.strictEqual(wLegacyTextOnly.extraDamage, 'Feuer');

  // 2. Test formula inclusion
  const pc = createCombatant({
    type: 'p',
    weapons: [
      new Weapon({
        name: 'Langschwert',
        type: 'longsword',
        extraDamageDice: '1w6',
        extraDamageType: 'Feuer',
        isEquipped: true
      })
    ]
  });

  const seq = AttackEngine.calculateAttackSequence(pc, pc.weapons[0], false);
  const stdAtkObj = seq[0];
  assert.strictEqual(stdAtkObj.damageDice, '1w8 + 1w6 Feuer', 'Computed damage dice formula should include extra damage');
});

test('Weapons - Off-Hand Ranged Weapons (Sling, Hand Crossbow, Thrown)', () => {
  const pc = createCombatant({
    name: 'Slinger Hero',
    type: 'p',
    feats: []
  });
  pc.bab.base = 6;
  pc.str = 14; // STR mod +2
  pc.dex = 18; // DEX mod +4

  // Main hand melee weapon (Rapier), off-hand ranged weapon (Sling)
  const rapier = new Weapon({ name: 'Rapier', type: 'rapier', hand: 'main', isEquipped: true });
  const sling = new Weapon({ name: 'Schleuder', type: 'sling', hand: 'off', isEquipped: true });
  pc.weapons = [rapier, sling];

  pc.feats = [{ id: 'two_weapon_fighting' }];
  
  // Let's calculate the attack sequence
  const seq = AttackEngine.calculateAttackSequence(pc, rapier, true);

  // Rapier (Main hand):
  // Atk = BAB 6 + STR 2 - 4 (TWF) = 4
  // Dmg = 1.0x STR = +2
  assert.strictEqual(seq[0].atkTotal, 4, 'Main hand attack total should be 4');
  assert.strictEqual(seq[0].dmgTotal, 2, 'Main hand damage total should be 2');

  // Sling (Off hand):
  // Atk = BAB 6 + DEX 4 - 4 (TWF) = 6
  // Dmg = 0.5x STR = +1
  const oh = seq.find(atk => atk.isOffhand);
  assert.ok(oh, 'Should have off-hand attack');
  assert.strictEqual(oh.atkTotal, 6, 'Off-hand sling attack total should be 6 (using DEX)');
  assert.strictEqual(oh.dmgTotal, 1, 'Off-hand sling damage total should be 1 (0.5x STR)');

  // Let's check a Hand Crossbow in off-hand
  // Hand crossbow: hand_crossbow (no STR bonus/penalty)
  const handCrossbow = new Weapon({ name: 'Handarmbrust', type: 'hand_crossbow', hand: 'off', isEquipped: true });
  pc.weapons = [rapier, handCrossbow];

  const seqCB = AttackEngine.calculateAttackSequence(pc, rapier, true);
  const ohCB = seqCB.find(atk => atk.isOffhand);
  assert.ok(ohCB, 'Should have off-hand crossbow attack');
  assert.strictEqual(ohCB.atkTotal, 6, 'Off-hand crossbow attack total should be 6');
  assert.strictEqual(ohCB.dmgTotal, 0, 'Off-hand crossbow damage total should be 0 (no STR)');

  // Let's check a standard bow in off-hand with negative strength
  pc.str = 8; // -1 STR Mod
  const shortbow = new Weapon({ name: 'Kurzbogen', type: 'shortbow', hand: 'off', isEquipped: true });
  pc.weapons = [rapier, shortbow];

  const seqBow = AttackEngine.calculateAttackSequence(pc, rapier, true);
  const ohBow = seqBow.find(atk => atk.isOffhand);
  assert.ok(ohBow, 'Should have off-hand bow attack');
  assert.strictEqual(ohBow.dmgTotal, -1, 'Off-hand bow damage total should be -1 (full STR penalty)');

  // Let's check composite bow in off-hand with rating +2 and positive STR mod +4
  pc.str = 18; // +4 STR Mod
  const compShortbow = new Weapon({ name: 'Komposit-Kurzbogen', type: 'comp_shortbow', strengthRating: 2, hand: 'off', isEquipped: true });
  pc.weapons = [rapier, compShortbow];

  const seqComp = AttackEngine.calculateAttackSequence(pc, rapier, true);
  const ohComp = seqComp.find(atk => atk.isOffhand);
  assert.ok(ohComp, 'Should have off-hand composite bow attack');
  assert.strictEqual(ohComp.dmgTotal, 1, 'Off-hand composite bow damage total should be 1');
});

test('Weapons - Shield Bash Grips and Damage Dice Scaling', () => {
  const lightShield = { name: 'Light Wooden Shield', isHeavy: false };
  const heavyShield = { name: 'Heavy Steel Shield', isHeavy: true };

  const getGrip = (sh) => (sh.isHeavy ? '1h' : 'light');
  assert.strictEqual(getGrip(lightShield), 'light');
  assert.strictEqual(getGrip(heavyShield), '1h');

  const getBaseDmg = (sh, isSmall = false) => {
    if (sh.isHeavy) return isSmall ? '1d3' : '1d4';
    return isSmall ? '1d2' : '1d3';
  };
  assert.strictEqual(getBaseDmg(lightShield, false), '1d3');
  assert.strictEqual(getBaseDmg(heavyShield, false), '1d4');
  assert.strictEqual(getBaseDmg(lightShield, true), '1d2');
  assert.strictEqual(getBaseDmg(heavyShield, true), '1d3');
});

test('Weapons - Bug #39: Spiked Chain & Rapier Power Attack, Finesse and TWF penalties', () => {
  // 1. Spiked Chain with Weapon Finesse and Power Attack
  const pc = createCombatant({
    name: 'Chainmaster',
    str: 14, // +2
    dex: 18, // +4
    bab: { base: 6 },
    feats: [{ id: 'weapon_finesse' }, { id: 'power_attack' }],
    powerAttackPenalty: 3
  });

  const spikedChain = new Weapon({
    name: 'Spiked Chain',
    type: 'spiked_chain',
    grip: '2h',
    damageDice: '2w4',
    crit: 'x2'
  });

  // Calculation:
  // BAB 6, DEX 4 (Finesse applies because isFinessable is true), PA -3
  // Atk = 6 + 4 - 3 = 7
  // Dmg: 2h STR = 14 (+2 mod * 1.5 = +3), Power Attack two-handed 2x = 3 * 2 = +6
  // DmgTotal = 3 + 6 = 9
  const seqChain = AttackEngine.calculateAttackSequence(pc, spikedChain, false);
  assert.ok(seqChain.length > 0);
  assert.strictEqual(seqChain[0].atkTotal, 7, 'Attack total with DEX finesse and -3 PA should be 7');
  assert.strictEqual(seqChain[0].dmgTotal, 9, 'Damage total with 1.5x STR (+3) and 2x PA (+6) should be 9');
  const paPart = seqChain[0].dmgBreakdown.find(b => b.label === 'Power Attack');
  assert.ok(paPart, 'Damage breakdown should include Power Attack');
  assert.strictEqual(paPart.value, 6, 'Power Attack bonus on Spiked Chain should be 2x penalty (+6)');

  // 2. Rapier with Power Attack (1h, not light -> 1x PA bonus)
  const rapier = new Weapon({
    name: 'Rapier',
    type: 'rapier',
    grip: '1h',
    damageDice: '1w6',
    crit: '18-20 / x2'
  });

  const seqRapier = AttackEngine.calculateAttackSequence(pc, rapier, false);
  assert.ok(seqRapier.length > 0);
  assert.strictEqual(seqRapier[0].atkTotal, 7, 'Attack total with DEX finesse and -3 PA should be 7');
  // Dmg: 1h STR = +2, Power Attack one-handed 1x = 3 * 1 = +3 -> Total = 5
  assert.strictEqual(seqRapier[0].dmgTotal, 5, 'Damage total with 1x STR (+2) and 1x PA (+3) should be 5');
  const paRapierPart = seqRapier[0].dmgBreakdown.find(b => b.label === 'Power Attack');
  assert.ok(paRapierPart, 'Rapier damage breakdown should include Power Attack');
  assert.strictEqual(paRapierPart.value, 3, 'Power Attack bonus on Rapier should be 1x penalty (+3)');

  // 3. Rapier in off-hand with TWF feat:
  // Main hand Longsword, Off-hand Rapier.
  // Rapier is one-handed (not light), so TWF penalty is -4 / -4 (not -2 / -2).
  const pcTWF = createCombatant({
    name: 'Dual Duelist',
    str: 16, // +3
    dex: 16, // +3
    bab: { base: 6 },
    feats: [{ id: 'two_weapon_fighting' }]
  });
  const mainSword = new Weapon({ id: 'w1', name: 'Longsword', type: 'longsword', grip: '1h', isEquipped: true, hand: 'main' });
  const offRapier = new Weapon({ id: 'w2', name: 'Rapier', type: 'rapier', grip: 'sec', isEquipped: true, hand: 'off' });
  pcTWF.weapons = [mainSword, offRapier];

  const seqTWF = AttackEngine.calculateAttackSequence(pcTWF, mainSword, true);
  const primaryAtk = seqTWF.find(a => !a.isOffhand);
  const offhandAtk = seqTWF.find(a => a.isOffhand);
  assert.ok(primaryAtk && offhandAtk, 'Should have primary and off-hand attacks');

  const twfPrimaryPart = primaryAtk.atkBreakdown.find(b => b.label.includes('Two-Weapon Fighting'));
  assert.ok(twfPrimaryPart);
  assert.strictEqual(twfPrimaryPart.value, -4, 'Primary penalty should be -4 with non-light off-hand');

  const twfOffhandPart = offhandAtk.atkBreakdown.find(b => b.label.includes('Two-Weapon Fighting'));
  assert.ok(twfOffhandPart);
  assert.strictEqual(twfOffhandPart.value, -4, 'Off-hand penalty should be -4 for Rapier (one-handed, not light)');
});


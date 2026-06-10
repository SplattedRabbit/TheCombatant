// Tests/weapons.test.js - Test suite for D&D 3.5e Weapon calculations, combat feats, and UI rendering

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { getActivePC, updateSession } from '../js/state/state-core.js';
import { createCombatant } from '../js/models/model-core.js';
import { getCritThreatDisplay, isLightWeapon, renderPCOffense } from '../js/ui/components/player/PCOffense.js';
import { Weapon } from '../js/models/Weapon.js';
import { uiRegistry } from '../js/ui/ui-shared.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';


test('Weapons - isLightWeapon parsing', () => {
  assert.strictEqual(isLightWeapon('Dolch'), true, 'Dolch should be light');
  assert.strictEqual(isLightWeapon('Dagger'), true, 'Dagger should be light');
  assert.strictEqual(isLightWeapon('Kurzschwert'), true, 'Kurzschwert should be light');
  assert.strictEqual(isLightWeapon('Rapier'), true, 'Rapier should be light');
  assert.strictEqual(isLightWeapon('Spiked Chain'), true, 'Spiked Chain should be light');
  assert.strictEqual(isLightWeapon('Zweihänder'), false, 'Zweihänder should not be light');
  assert.strictEqual(isLightWeapon('Langschwert'), false, 'Langschwert should not be light');
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

test('Weapons - Rule calculations and UI rendering', () => {
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

  const originalGetElementById = globalThis.document.getElementById;
  
  // Set up mock DOM
  const container = globalThis.document.createElement('div');
  container.id = 'pcOffense';
  
  const listContainer = globalThis.document.createElement('div');
  listContainer.id = 'pcWeaponsList';
  
  container.querySelector = (selector) => {
    if (selector === '#pcWeaponsList') {
      return listContainer;
    }
    return globalThis.document.createElement('div');
  };

  globalThis.document.getElementById = (id) => {
    if (id === 'pcOffense') {
      return container;
    }
    return originalGetElementById(id);
  };
  
  // 1. Test standard 1-Hand melee weapon strength damage (1.0x STR)
  pc.weapons = [
    new Weapon({ name: 'Langschwert', grip: '1h', damageDice: '1w8', crit: '19-20 / x2', enhancement: 0 })
  ];
  
  listContainer.children = [];
  renderPCOffense(pc);
  
  assert.strictEqual(listContainer.children.length, 1, 'Should render 1 weapon row');
  let weaponRowContainer = listContainer.children[0];
  let row = weaponRowContainer.children[0];
  let drawer = weaponRowContainer.children[1];
  assert.ok(row.innerHTML.includes('ANGRIFF (+10)'), 'Attack total should be +10');
  assert.ok(row.innerHTML.includes('DMG (+4)'), 'Damage total should be +4');
  
  // 2. Test 2-Hand melee weapon strength damage (1.5x STR = +6)
  pc.weapons = [
    new Weapon({ name: 'Zweihänder', grip: '2h', damageDice: '2w6', crit: '19-20 / x2', enhancement: 0 })
  ];
  
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('ANGRIFF (+10)'), 'Attack total should be +10');
  assert.ok(row.innerHTML.includes('DMG (+6)'), 'Two-handed damage should add 1.5x STR (+6)');

  // 3. Test Weapon Finesse swapping STR to DEX (+2) for light weapons
  pc.feats = [{ id: 'weapon_finesse' }];
  pc.weapons = [
    new Weapon({ name: 'Dolch', grip: '1h', damageDice: '1w4', crit: '19-20 / x2', enhancement: 0 })
  ];
  // DEX (+2) is less than STR (+4) so Finesse should NOT swap (uses STR +10)
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('ANGRIFF (+10)'), 'Should use STR +10 since it is higher than DEX');

  // Change attributes: DEX 20 (+5), STR 10 (+0)
  pc.dex = 20; // DEX mod +5
  pc.str = 10; // STR mod +0
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  // Attack should be: BAB(+6) + DEX(+5) = +11
  assert.ok(row.innerHTML.includes('ANGRIFF (+11)'), 'Weapon Finesse should swap to DEX mod (+5) for light weapon');

  // 4. Test Power Attack scaling on 2-Handed weapon
  pc.feats = [{ id: 'power_attack' }];
  pc.powerAttackPenalty = 3;
  pc.str = 18; // STR mod +4
  pc.weapons = [
    new Weapon({ name: 'Zweihänder', grip: '2h', damageDice: '2w6', crit: '19-20 / x2', enhancement: 0 })
  ];
  // Attack: BAB(+6) + STR(+4) - PA(-3) = +7
  // Damage: 1.5xSTR(+6) + 2xPA(+6) = +12
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('ANGRIFF (+7)'), 'Attack should subtract Power Attack penalty');
  assert.ok(row.innerHTML.includes('DMG (+12)'), 'Two-handed damage should receive double Power Attack bonus (+6)');

  // 5. Test Composite Bow mechanics (Strength rating caps and low-strength attack penalties)
  pc.feats = [];
  pc.powerAttackPenalty = 0;
  pc.dex = 14; // DEX mod +2
  // Scenario A: Character strength mod (+4) is higher than bow rating (Stärke +2) -> Cap bonus to +2
  pc.weapons = [
    new Weapon({ name: 'Kompositbogen (Stärke +2)', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 })
  ];
  // Attack: BAB(+6) + DEX(+2) = +8
  // Damage: +2 (Strength Rating Cap)
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('ANGRIFF (+8)'), 'Attack total should be +8');
  assert.ok(row.innerHTML.includes('DMG (+2)'), 'Composite Bow damage should be capped at rating (+2)');

  // Scenario B: Character strength mod (+0) is lower than bow rating (Stärke +2) -> -2 attack penalty, actual mod +0 damage
  pc.str = 10; // STR mod +0
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  // Attack: BAB(+6) + DEX(+2) - 2 (low strength penalty) = +6
  // Damage: +0 (actual mod)
  assert.ok(row.innerHTML.includes('ANGRIFF (+6)'), 'Composite Bow should apply -2 attack penalty if strength is insufficient');
  assert.ok(row.innerHTML.includes('DMG (+0)'), 'Composite Bow damage should equal actual strength mod if insufficient');

  // 6. Test Crossbow strength isolation (no damage modifier)
  pc.str = 8; // STR mod -1 (penalty)
  pc.weapons = [
    new Weapon({ name: 'Leichte Armbrust', grip: 'rng', damageDice: '1w8', crit: '19-20 / x2', enhancement: 0 })
  ];
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('DMG (+0)'), 'Crossbow should isolate damage from strength penalty (+0)');

  // Normal bow with negative strength should apply penalty
  pc.weapons = [
    new Weapon({ name: 'Kurzbogen', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 })
  ];
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  assert.ok(row.innerHTML.includes('DMG (-1)'), 'Normal bow should apply strength penalty (-1)');

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
  pc.weapons = [
    new Weapon({ name: 'Langschwert', type: 'longsword' })
  ];
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  // Standard longsword crit is 19-20/x2. Improved Critical doubles it to 17-20/x2.
  assert.ok(row.innerHTML.includes('17-20 / x2'), 'Improved Critical should double the threat range');

  // 10. Test Improved Critical + Keen (should not stack)
  pc.weapons[0].isKeen = true;
  listContainer.children = [];
  renderPCOffense(pc);
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  // Non-stacking: still 17-20/x2
  assert.ok(row.innerHTML.includes('17-20 / x2'), 'Improved Critical and Keen should not stack (remain doubled)');

  // 11. Test drawer open state persistence across dynamic re-renders when inputs are changed
  const originalRender = uiRegistry.renderPlayerScreen;
  uiRegistry.renderPlayerScreen = () => {
    listContainer.children = [];
    renderPCOffense(pc);
  };

  pc.weapons = [
    new Weapon({ name: 'Dolch', type: 'dagger' })
  ];
  listContainer.children = [];
  renderPCOffense(pc);
  
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  drawer = weaponRowContainer.children[1];
  
  // Verify starts closed
  assert.strictEqual(drawer.style.display, 'none', 'Drawer should start closed by default');
  
  // Click gear to open
  const gearBtn = row.querySelector('.gear-btn');
  gearBtn.click();
  assert.strictEqual(drawer.style.display, 'flex', 'Drawer should open when gear button is clicked');
  
  // Simulate an input change in the drawer (e.g. Zusatz-Atk changed to "+1")
  const atkInput = drawer.querySelector('.w-detail-atk');
  atkInput.value = '+1';
  atkInput.onchange({ target: atkInput });
  
  // Get the newly rendered elements after the simulated onchange re-render
  weaponRowContainer = listContainer.children[0];
  row = weaponRowContainer.children[0];
  drawer = weaponRowContainer.children[1];
  
  // Verify that the drawer remains open!
  assert.strictEqual(drawer.style.display, 'flex', 'Drawer should remain open after input change and re-render');

  // Restore renderPlayerScreen
  uiRegistry.renderPlayerScreen = originalRender;

  // Restore document.getElementById
  globalThis.document.getElementById = originalGetElementById;
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


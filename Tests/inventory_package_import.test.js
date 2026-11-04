/**
 * @module    inventory_package_import.test
 * @summary   Unit tests for D&D 3.5e Inventory & Loadout Package import, export, presetKey hydration, RAW slot auto-equip, and stat recalculation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CombatState,
  parseInventoryPackage,
  importPCInventoryPackage,
  exportPCInventoryPackage,
  exportStashPackage,
  importStashPackage
} from '../js/state.js';

function setupCleanPlayerCharacter(name = 'Sir Roland') {
  CombatState.clearState();
  CombatState.addCombatant({
    id: 'pc_test_1',
    name,
    type: 'p',
    side: 'p',
    str: 14,
    dex: 12,
    con: 14,
    int: 10,
    wis: 12,
    cha: 10,
    classes: [{ classType: 'fighter', level: 4 }],
    weapons: [],
    armors: [],
    items: []
  });
  CombatState.setRole('player');
  CombatState.setLocalPCId('pc_test_1');
  const pc = CombatState.getActivePC();
  CombatState.recalculatePCStats(pc);
  return pc;
}

test('parseInventoryPackage resolves shorthand presetKey strings and full item objects', () => {
  const pkg = {
    format: 'dnd35e-inventory-package',
    packageName: 'Paladin Starter Kit',
    description: 'Standard issue gear for level 4 martial characters',
    autoEquip: true,
    weapons: ['longsword', { presetKey: 'longbow', magicBonus: 1 }],
    armors: ['chain_shirt', 'heavy_steel_shield'],
    items: ['gauntlets_of_ogre_power', 'cloak_of_resistance_1', 'potion_cure_light_wounds']
  };

  const parsed = parseInventoryPackage(JSON.stringify(pkg));
  assert.equal(parsed.isValid, true);
  assert.equal(parsed.packageName, 'Paladin Starter Kit');
  assert.equal(parsed.weapons.length, 2);
  assert.equal(parsed.armors.length, 2);
  assert.equal(parsed.items.length, 3);
  assert.equal(parsed.totalCount, 7);

  // Check hydration from registries
  assert.equal(parsed.weapons[0].name, 'Longsword');
  assert.equal(parsed.weapons[1].enhancement, 1);
  assert.equal(parsed.armors[0].armorBonus, 4);
  assert.equal(parsed.armors[1].isShield, true);
  assert.equal(parsed.items[0].slot, 'hands');
});

test('importPCInventoryPackage auto-equips Body Armor + Shield + 1H Weapon + Wondrous Items and recalculates stats', () => {
  const pc = setupCleanPlayerCharacter();
  const baseACTotal = pc.ac.getValue();
  const baseFortTotal = pc.za.getValue();
  const baseStrTotal = pc.str.getValue();

  const pkg = {
    format: 'dnd35e-inventory-package',
    packageName: 'Sword & Board Loadout',
    autoEquip: true,
    weapons: [{ presetKey: 'longsword', magicBonus: 1 }],
    armors: ['chain_shirt', 'heavy_steel_shield'],
    items: [
      'gauntlets_of_ogre_power',
      'cloak_of_resistance_2',
      'ring_of_protection_1',
      { name: 'Ring of Feather Falling', slot: 'ring', category: 'ring', effects: [] },
      'potion_cure_light_wounds'
    ]
  };

  const res = importPCInventoryPackage(pkg, { mode: 'replace', autoEquip: true });
  assert.equal(res.success, true);
  assert.equal(res.totalAdded, 8);

  // Body armor (+4) and heavy shield (+2) + Ring of Protection (+1 deflection) = +7 AC over base
  assert.equal(pc.armors.filter(a => a.isEquipped).length, 2, 'Both body armor and shield must be equipped');
  assert.equal(pc.ac.getValue(), baseACTotal + 4 + 2 + 1);

  // Gauntlets of Ogre Power (+2 enhancement to STR)
  assert.equal(pc.str.getValue(), baseStrTotal + 2);

  // Cloak of Resistance +2 increases Fortitude save by +2
  assert.equal(pc.za.getValue(), baseFortTotal + 2);

  // Smart ring distribution: ring1 and ring2 both occupied
  const equippedRings = pc.items.filter(i => i.isEquipped && (i.slot === 'ring1' || i.slot === 'ring2'));
  assert.equal(equippedRings.length, 2);
  assert.notEqual(equippedRings[0].slot, equippedRings[1].slot);

  // Consumable potion must remain unequipped in backpack
  const potion = pc.items.find(i => i.presetKey === 'potion_cure_light_wounds');
  assert.equal(potion.isEquipped, false);
});

test('importPCInventoryPackage enforces D&D 3.5e RAW 2H weapon vs. shield exclusivity', () => {
  const pc = setupCleanPlayerCharacter();

  // First import and equip a heavy shield + chain shirt
  importPCInventoryPackage({
    armors: ['chain_shirt', 'heavy_steel_shield']
  }, { mode: 'replace', autoEquip: true });

  assert.equal(pc.armors.filter(a => a.isEquipped).length, 2);

  // Now merge-import a Two-Handed Greatsword with autoEquip: true
  importPCInventoryPackage({
    weapons: ['greatsword']
  }, { mode: 'merge', autoEquip: true });

  const bodyArmor = pc.armors.find(a => !a.isShield);
  const shield = pc.armors.find(a => a.isShield);
  const greatsword = pc.weapons.find(w => w.presetKey === 'greatsword');

  assert.equal(greatsword.isEquipped, true, 'Greatsword should be equipped');
  assert.equal(bodyArmor.isEquipped, true, 'Body armor remains equipped with 2H weapon');
  assert.equal(shield.isEquipped, false, 'Shield must be unequipped when equipping a 2H weapon');
});

test('exportPCInventoryPackage and DM Stash package roundtrip', () => {
  setupCleanPlayerCharacter('Vaelen');
  importPCInventoryPackage({
    packageName: 'Ranger Kit',
    weapons: ['longbow'],
    armors: ['studded_leather'],
    items: ['cloak_of_resistance_1']
  }, { mode: 'replace', autoEquip: true });

  const exported = exportPCInventoryPackage({ packageName: 'Vaelen Export' });
  assert.equal(exported.format, 'dnd35e-inventory-package');
  assert.equal(exported.weapons.length, 1);
  assert.equal(exported.armors.length, 1);
  assert.equal(exported.items.length, 1);

  // Import into DM Stash and export back
  const stashRes = importStashPackage(exported, 'replace');
  assert.equal(stashRes.success, true);
  assert.equal(stashRes.totalAdded, 3);

  const stashExport = exportStashPackage({ packageName: 'DM Vault Bundle' });
  assert.equal(stashExport.weapons.length, 1);
  assert.equal(stashExport.armors.length, 1);
  assert.equal(stashExport.items.length, 1);
});

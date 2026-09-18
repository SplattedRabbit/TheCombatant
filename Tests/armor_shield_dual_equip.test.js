import test from 'node:test';
import assert from 'node:assert';
import { Armor, isShieldItem } from '../js/models/Armor.js';
import { Weapon } from '../js/models/Weapon.js';
import { CombatState } from '../js/state.js';
import { getActivePC, updateSession } from '../js/state/state-core.js';

test('isShieldItem helper validates class instances and plain objects', () => {
  const breastplate = new Armor({ type: 'breastplate' });
  const shield = new Armor({ type: 'shield_heavy_steel' });

  assert.strictEqual(isShieldItem(breastplate), false, 'Breastplate Armor instance should not be shield');
  assert.strictEqual(isShieldItem(shield), true, 'Heavy shield Armor instance should be shield');

  // Plain object tests (e.g. from JSON or plain state)
  assert.strictEqual(isShieldItem({ type: 'shield_heavy_steel' }), true, 'Plain object heavy shield should be shield');
  assert.strictEqual(isShieldItem({ type: 'full_plate' }), false, 'Plain object full plate should not be shield');
  assert.strictEqual(isShieldItem({ isShield: true }), true, 'Explicit isShield flag true should be shield');
  assert.strictEqual(isShieldItem({ isShield: false }), false, 'Explicit isShield flag false should not be shield');
  assert.strictEqual(isShieldItem(null), false, 'null should safely return false');
  assert.strictEqual(isShieldItem(undefined), false, 'undefined should safely return false');
});

test('Armor and Shield dual-equipping, AC stacking, ACP and 2H interaction', () => {
  const s = CombatState.getState();
  s.combatants = [];
  updateSession(false, 'choice', '');
  s.mode = 'player';

  const pc = getActivePC();
  assert.ok(pc, 'Active PC exists');

  pc.dex.base = 14; // DEX 14 (+2 mod)
  pc.autoAC = true;
  pc.activeShape = 'none';
  pc.acNatural = 0;
  pc.acDeflection = 0;
  pc.acMisc = 0;
  pc.weapons = [];

  // Setup: 1 Breastplate (+5 AC, maxDex 3, ACP -4) and 1 Heavy Steel Shield (+2 AC, ACP -2)
  pc.armors = [
    new Armor({ type: 'breastplate', isEquipped: false }),
    new Armor({ type: 'shield_heavy_steel', isEquipped: false })
  ];

  // Recalculate baseline without equipment
  CombatState.recalculatePCStats(pc);
  assert.strictEqual(pc.ac.getValue(), 12, 'Baseline AC 10 + 2 (Dex)');
  assert.strictEqual(pc.getArmorCheckPenalty(), 0, 'Baseline ACP is 0');

  // 1. Equip Body Armor (Breastplate)
  CombatState.togglePCArmorEquip(0);
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Breastplate is equipped');
  assert.strictEqual(pc.armors[1].isEquipped, false, 'Shield remains unequipped');
  assert.strictEqual(pc.getEquippedArmor()?.type, 'breastplate');
  assert.strictEqual(pc.getEquippedShield(), null);
  // AC: 10 + 2 (Dex) + 5 (Armor) = 17
  assert.strictEqual(pc.ac.getValue(), 17, 'AC with Breastplate is 17');
  assert.strictEqual(pc.getArmorCheckPenalty(), 4, 'ACP is 4 from Breastplate');

  // 2. Equip Shield (Heavy Steel Shield) concurrently
  CombatState.togglePCArmorEquip(1);
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Breastplate remains equipped when shield is equipped');
  assert.strictEqual(pc.armors[1].isEquipped, true, 'Shield is now also equipped');
  assert.strictEqual(pc.getEquippedArmor()?.type, 'breastplate');
  assert.strictEqual(pc.getEquippedShield()?.type, 'shield_heavy_steel');

  // AC: 10 + 2 (Dex) + 5 (Armor) + 2 (Shield) = 19
  assert.strictEqual(pc.ac.getValue(), 19, 'AC with Breastplate + Shield is 19 (RAW stacking armor + shield)');
  assert.strictEqual(pc.getArmorCheckPenalty(), 6, 'ACP stacks: 4 (Breastplate) + 2 (Shield) = 6');

  // 3. Test plain object resilience (simulate serialization or plain JSON in state)
  pc.armors = [
    { type: 'breastplate', isEquipped: true, armorBonus: 5, maxDex: 3, checkPenalty: 4, spellFailure: 25 },
    { type: 'shield_heavy_steel', isEquipped: true, armorBonus: 2, maxDex: null, checkPenalty: 2, spellFailure: 15 }
  ];
  // Toggling shield off and back on using plain objects
  CombatState.togglePCArmorEquip(1); // turn shield off
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Armor remains equipped when shield is unequipped');
  assert.strictEqual(pc.armors[1].isEquipped, false, 'Shield is now unequipped');

  CombatState.togglePCArmorEquip(1); // turn shield back on
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Armor remains equipped when shield is equipped');
  assert.strictEqual(pc.armors[1].isEquipped, true, 'Shield is now equipped again');

  // 4. Test 2-Handed weapon interaction:
  // Equipping a two-handed weapon should unequip the shield, but KEEP the body armor equipped.
  const greatsword = new Weapon({ name: 'Zweihänder', grip: '2h', isEquipped: false });
  pc.weapons = [greatsword];
  CombatState.togglePCWeaponEquip(0);

  assert.strictEqual(pc.weapons[0].isEquipped, true, 'Two-handed weapon is equipped');
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Body armor remains equipped with 2H weapon');
  assert.strictEqual(pc.armors[1].isEquipped, false, 'Shield is unequipped when 2H weapon is equipped');

  // 5. Re-equipping shield should unequip the 2-Handed weapon
  CombatState.togglePCArmorEquip(1);
  assert.strictEqual(pc.armors[1].isEquipped, true, 'Shield is equipped again');
  assert.strictEqual(pc.weapons[0].isEquipped, false, 'Two-handed weapon is unequipped when shield is equipped');
  assert.strictEqual(pc.armors[0].isEquipped, true, 'Body armor remains equipped');
});

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { createCombatant } from '../js/models/model-core.js';
import { Weapon } from '../js/models/Weapon.js';
import { Armor } from '../js/models/Armor.js';
import { Item } from '../js/models/Item.js';

test('DM Stash - Adding and managing weapons in stash', () => {
  const state = CombatState.getState();
  state.meta.dmStash = { weapons: [], armors: [], items: [] };

  // Add weapon
  CombatState.addStashItem('weapons', {
    name: 'Flame Tongue',
    type: 'longsword',
    enhancement: 1,
    extraDamageDice: '1w6',
    extraDamageType: 'Fire'
  });

  assert.strictEqual(state.meta.dmStash.weapons.length, 1);
  const w = state.meta.dmStash.weapons[0];
  assert.strictEqual(w.name, 'Flame Tongue');
  assert.strictEqual(w.enhancement, 1);
  assert.strictEqual(w.extraDamageDice, '1w6');
  assert.strictEqual(w.extraDamageType, 'Fire');
  assert.strictEqual(w.damageDice, '1w8');

  // Update weapon
  CombatState.updateStashItem('weapons', 0, { enhancement: 2, isKeen: true });
  assert.strictEqual(state.meta.dmStash.weapons[0].enhancement, 2);
  assert.strictEqual(state.meta.dmStash.weapons[0].isKeen, true);

  // Delete weapon
  CombatState.deleteStashItem('weapons', 0);
  assert.strictEqual(state.meta.dmStash.weapons.length, 0);
});

test('DM Stash - Adding and managing armors and items in stash', () => {
  const state = CombatState.getState();
  state.meta.dmStash = { weapons: [], armors: [], items: [] };

  // Add armor
  CombatState.addStashItem('armors', {
    name: 'Dragon Scale Armor',
    type: 'breastplate',
    enhancement: 2
  });

  assert.strictEqual(state.meta.dmStash.armors.length, 1);
  const a = state.meta.dmStash.armors[0];
  assert.strictEqual(a.name, 'Dragon Scale Armor');
  assert.strictEqual(a.enhancement, 2);

  // Add wondrous item
  CombatState.addStashItem('items', {
    name: 'Cloak of Resistance +3',
    slot: 'shoulders',
    effects: [{ type: 'save', target: 'all', value: 3, bonusType: 'resistance' }]
  });

  assert.strictEqual(state.meta.dmStash.items.length, 1);
  const item = state.meta.dmStash.items[0];
  assert.strictEqual(item.name, 'Cloak of Resistance +3');
  assert.strictEqual(item.effects[0].value, 3);
});

test('DM Stash - Distributing stash item to a PC removes it from stash and equips/adds to PC', () => {
  const state = CombatState.getState();
  state.meta.dmStash = { weapons: [], armors: [], items: [] };
  state.combatants = [];

  const pc = createCombatant({ id: 'pc-123', name: 'Valeros', type: 'p' });
  pc.weapons = [];
  pc.armors = [];
  pc.items = [];
  state.combatants.push(pc);

  // Put a weapon into the DM stash
  CombatState.addStashItem('weapons', {
    name: 'Sun Blade',
    type: 'bastard_sword',
    enhancement: 2
  });
  assert.strictEqual(state.meta.dmStash.weapons.length, 1);

  // Give to PC
  CombatState.giveStashItemToPC('weapons', 0, 'pc-123');

  // Stash should now be empty
  assert.strictEqual(state.meta.dmStash.weapons.length, 0);

  // PC should now have the weapon
  assert.strictEqual(pc.weapons.length, 1);
  assert.strictEqual(pc.weapons[0].name, 'Sun Blade');
  assert.strictEqual(pc.weapons[0].enhancement, 2);
  assert.strictEqual(pc.weapons[0].isEquipped, false);

  // Put an item into the DM stash and distribute
  CombatState.addStashItem('items', {
    name: 'Amulet of Health +2',
    slot: 'neck',
    effects: [{ type: 'attribute', target: 'con', value: 2, bonusType: 'enhancement' }]
  });
  assert.strictEqual(state.meta.dmStash.items.length, 1);

  CombatState.giveStashItemToPC('items', 0, 'pc-123');
  assert.strictEqual(state.meta.dmStash.items.length, 0);
  assert.strictEqual(pc.items.length, 1);
  assert.strictEqual(pc.items[0].name, 'Amulet of Health +2');
});

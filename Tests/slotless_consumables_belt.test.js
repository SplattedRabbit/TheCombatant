import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { Combatant } from '../js/models/Combatant.js';
import { MAGIC_ITEMS_REGISTRY } from '../js/data/magicItems-data.js';

function isConsumableItem(item) {
  if (!item) return false;
  const slot = item.slot;
  const type = item.type;
  const name = (item.name || '').toLowerCase();
  
  if (type === 'potion' || type === 'scroll' || type === 'wand' || type === 'consumable' || type === 'alchemical') return true;
  if (slot === 'potion' || slot === 'scroll' || slot === 'wand' || slot === 'consumable') return true;
  if (name.includes('potion') || name.includes('trank') || name.includes('scroll') || name.includes('schriftrolle') || name.includes('wand') || name.includes('zauberstab') || name.includes('alchemist') || name.includes('smokestick') || name.includes('tanglefoot') || name.includes('holy water')) return true;
  
  const hasPassiveEffects = Array.isArray(item.effects) && item.effects.some((e) => (parseInt(e.value) || 0) !== 0);
  if (!hasPassiveEffects && (item.healingFormula || item.damageFormula || item.activation?.appliedBuffKey || item.charges?.max === 1)) {
    return true;
  }
  return false;
}

test('Slotless vs Consumables - isConsumableItem detection', () => {
  // Consumables
  assert.strictEqual(isConsumableItem({ name: 'Potion of Invisibility', slot: 'slotless', type: 'potion' }), true);
  assert.strictEqual(isConsumableItem({ name: 'Scroll of Fireball', slot: 'slotless', type: 'scroll' }), true);
  assert.strictEqual(isConsumableItem({ name: 'Wand of Magic Missile', slot: 'slotless', type: 'wand', charges: { current: 20, max: 50 } }), true);
  assert.strictEqual(isConsumableItem({ name: "Alchemist's Fire", slot: 'slotless', type: 'consumable' }), true);
  assert.strictEqual(isConsumableItem({ name: 'Holy Water', slot: 'slotless', type: 'consumable' }), true);

  // Passive Slotless Wondrous Items (Ioun stones, Luckstones, etc.)
  assert.strictEqual(isConsumableItem({
    name: 'Ioun Stone (Dusty Rose Prism)',
    slot: 'slotless',
    effects: [{ type: 'ac', target: 'insight', value: 1 }]
  }), false);

  assert.strictEqual(isConsumableItem({
    name: 'Stone of Good Luck (Luckstone)',
    slot: 'slotless',
    effects: [{ type: 'save', target: 'all', value: 1 }]
  }), false);
});

test('Slotless vs Consumables - Adding consumables from compendium never forces isEquipped', () => {
  const pc = new Combatant({
    id: 'belt_test_pc',
    name: 'Belt Tester',
    type: 'p',
    items: []
  });

  const state = CombatState.getState();
  state.combatants = [pc];
  state.localPCId = pc.id;

  // Add Potion of Invisibility with shouldEquip = true
  CombatState.addPCItemFromCompendium('potion_invisibility', true);
  assert.strictEqual(pc.items.length, 1);
  assert.strictEqual(pc.items[0].name, 'Potion of Invisibility');
  assert.strictEqual(pc.items[0].isEquipped, false, 'Potion should stay in backpack/inventory and not be equipped');

  // Add Ioun stone with shouldEquip = true
  CombatState.addPCItemFromCompendium('ioun_stone_dusty_rose', true);
  assert.strictEqual(pc.items.length, 2);
  assert.strictEqual(pc.items[1].isEquipped, true, 'Passive Ioun Stone should be equipped to slotless slot');
});

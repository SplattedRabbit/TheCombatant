import test from 'node:test';
import assert from 'node:assert';
import { Item, getDefaultBonusType } from '../js/models/Item.js';
import { MAGIC_ITEMS_REGISTRY, ITEM_SLOTS } from '../js/data/magicItems-data.js';
import {
  calculateEquippedItemEffects,
  getItemStackingBreakdown,
  getAvailableEquipmentBuffs
} from '../js/rules/RulesItems.js';
import { CombatState } from '../js/state.js';
import { createCombatant } from '../js/models/model-core.js';

test('Armory 2.0 - Item Model & Bonus Types', () => {
  assert.strictEqual(getDefaultBonusType('attribute', 'str'), 'enhancement');
  assert.strictEqual(getDefaultBonusType('save', 'fort'), 'resistance');
  assert.strictEqual(getDefaultBonusType('ac', 'deflection'), 'deflection');
  assert.strictEqual(getDefaultBonusType('ac', 'natural'), 'natural_enhancement');
  assert.strictEqual(getDefaultBonusType('skill', 'spot'), 'competence');
  assert.strictEqual(getDefaultBonusType('speed', 'speed'), 'enhancement');

  const belt = new Item({
    name: 'Belt of Giant Strength +4',
    slot: 'waist',
    effects: [{ type: 'attribute', target: 'str', value: 4 }]
  });
  assert.strictEqual(belt.effects[0].bonusType, 'enhancement');
  assert.strictEqual(belt.effects[0].value, 4);

  const wand = new Item({
    name: 'Wand of Fireball',
    slot: 'slotless',
    charges: { current: 50, max: 50 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Casts Fireball',
      appliedBuffKey: ''
    }
  });
  assert.deepStrictEqual(wand.charges, { current: 50, max: 50 });
  assert.strictEqual(wand.activation.cost, 1);

  const boots = new Item({
    name: 'Boots of Speed',
    slot: 'feet',
    dailyUses: { current: 10, max: 10 },
    activation: {
      actionType: 'free',
      costType: 'daily',
      cost: 1,
      appliedBuffKey: 'haste'
    }
  });
  assert.deepStrictEqual(boots.dailyUses, { current: 10, max: 10 });
  assert.strictEqual(boots.activation.appliedBuffKey, 'haste');
});

test('Armory 2.0 - Magic Items Registry & Slots', () => {
  assert.ok(ITEM_SLOTS.head);
  assert.ok(ITEM_SLOTS.ring1);
  assert.ok(ITEM_SLOTS.ring2);
  assert.ok(ITEM_SLOTS.waist);
  assert.ok(ITEM_SLOTS.feet);

  assert.ok(MAGIC_ITEMS_REGISTRY.headband_of_intellect_2);
  assert.ok(MAGIC_ITEMS_REGISTRY.belt_of_giant_strength_4);
  assert.ok(MAGIC_ITEMS_REGISTRY.cloak_of_resistance_2);
  assert.ok(MAGIC_ITEMS_REGISTRY.ring_of_protection_1);
  assert.ok(MAGIC_ITEMS_REGISTRY.boots_of_speed);
});

test('Armory 2.0 - Rules: Stacking & Effect Aggregation', () => {
  const pc = {
    items: [
      new Item({
        name: 'Belt of Giant Strength +4',
        slot: 'waist',
        isEquipped: true,
        effects: [{ type: 'attribute', target: 'str', value: 4, bonusType: 'enhancement' }]
      }),
      new Item({
        name: 'Gauntlets of Ogre Power +2',
        slot: 'hands',
        isEquipped: true,
        effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }]
      }),
      new Item({
        name: 'Ring of Protection +2',
        slot: 'ring1',
        isEquipped: true,
        effects: [{ type: 'ac', target: 'deflection', value: 2, bonusType: 'deflection' }]
      }),
      new Item({
        name: 'Amulet of Natural Armor +1',
        slot: 'neck',
        isEquipped: true,
        effects: [{ type: 'ac', target: 'natural', value: 1, bonusType: 'natural_enhancement' }]
      }),
      new Item({
        name: 'Cloak of Resistance +3',
        slot: 'shoulders',
        isEquipped: true,
        effects: [{ type: 'save', target: 'all', value: 3, bonusType: 'resistance' }]
      }),
      new Item({
        name: 'Backpack Belt (Unequipped)',
        slot: 'waist',
        isEquipped: false,
        effects: [{ type: 'attribute', target: 'str', value: 6, bonusType: 'enhancement' }]
      })
    ]
  };

  const effects = calculateEquippedItemEffects(pc);
  // Stacking: Belt +4 and Gauntlets +2 are both enhancement -> highest (4) applies
  assert.strictEqual(effects.attributes.str, 4);
  // Deflection and natural armor are different types -> both apply
  assert.strictEqual(effects.ac.deflection, 2);
  assert.strictEqual(effects.ac.natural, 1);
  // Cloak of resistance
  assert.strictEqual(effects.saves.all, 3);

  // Stacking breakdown check
  const breakdown = getItemStackingBreakdown(pc);
  const gauntletEntry = breakdown.find(b => b.itemName === 'Gauntlets of Ogre Power +2');
  assert.ok(gauntletEntry);
  assert.strictEqual(gauntletEntry.isActive, false);
  assert.strictEqual(gauntletEntry.overriddenBy, 'Belt of Giant Strength +4');

  const beltEntry = breakdown.find(b => b.itemName === 'Belt of Giant Strength +4');
  assert.ok(beltEntry);
  assert.strictEqual(beltEntry.isActive, true);
  assert.strictEqual(beltEntry.overriddenBy, null);
});

test('Armory 2.0 - Equipment Buffs & Activation', () => {
  const pc = {
    items: [
      new Item({
        id: 'boots-1',
        name: 'Boots of Speed',
        slot: 'feet',
        isEquipped: true,
        dailyUses: { current: 8, max: 10 },
        activation: {
          actionType: 'free',
          costType: 'daily',
          cost: 1,
          appliedBuffKey: 'haste',
          effectDescription: 'Click heels for Haste'
        }
      }),
      new Item({
        id: 'ring-inv',
        name: 'Ring of Invisibility',
        slot: 'ring1',
        isEquipped: true,
        activation: {
          actionType: 'standard',
          costType: 'unlimited',
          cost: 0,
          appliedBuffKey: 'invisibility',
          effectDescription: 'Invisibility at will'
        }
      }),
      new Item({
        id: 'boots-unequipped',
        name: 'Boots of Speed in Backpack',
        slot: 'feet',
        isEquipped: false,
        activation: {
          actionType: 'free',
          costType: 'daily',
          cost: 1,
          appliedBuffKey: 'haste'
        }
      })
    ]
  };

  const buffs = getAvailableEquipmentBuffs(pc);
  assert.strictEqual(buffs.length, 2);
  assert.strictEqual(buffs[0].buffKey, 'haste');
  assert.strictEqual(buffs[0].availableUses, 8);
  assert.strictEqual(buffs[1].buffKey, 'invisibility');
});

test('Armory 2.0 - State: Equip, Unequip, Swap & Smart Ring Distribution', () => {
  const s = CombatState.getState();
  s.mode = 'player';
  s.combatants = [];

  const char = createCombatant({
    name: 'Hero',
    str: 10,
    items: [
      new Item({ id: 'r1', name: 'Ring of Protection +1', slot: 'ring1', isEquipped: false }),
      new Item({ id: 'r2', name: 'Ring of Sustenance', slot: 'ring2', isEquipped: false }),
      new Item({ id: 'r3', name: 'Ring of Invisibility', slot: 'ring', isEquipped: false }),
      new Item({ id: 'b1', name: 'Belt of Giant Strength +2', slot: 'waist', isEquipped: false, effects: [{ type: 'attribute', target: 'str', value: 2 }] })
    ]
  });
  s.combatants.push(char);
  s.localPCId = char.id;

  // 1. Equip first ring -> goes to ring1
  CombatState.equipPCItem(0);
  assert.strictEqual(char.items[0].isEquipped, true);
  assert.strictEqual(char.items[0].slot, 'ring1');

  // 2. Equip second ring -> goes to ring2 automatically
  CombatState.equipPCItem(1);
  assert.strictEqual(char.items[1].isEquipped, true);
  assert.strictEqual(char.items[1].slot, 'ring2');

  // 3. Equip Belt from compendium
  CombatState.addPCItemFromCompendium('belt_of_giant_strength_4', true);
  const lastItem = char.items[char.items.length - 1];
  assert.strictEqual(lastItem.name, 'Belt of Giant Strength +4');
  assert.strictEqual(lastItem.isEquipped, true);
  assert.strictEqual(char.str.getValue(), 14); // 10 base + 4 enhancement

  // 4. Swap Belt with +2 Belt
  CombatState.swapPCItem('waist', 3);
  assert.strictEqual(lastItem.isEquipped, false);
  assert.strictEqual(char.items[3].isEquipped, true);
  assert.strictEqual(char.str.getValue(), 12); // 10 base + 2 enhancement

  // 5. Unequip
  CombatState.unequipPCItem(3);
  assert.strictEqual(char.items[3].isEquipped, false);
  assert.strictEqual(char.str.getValue(), 10);
});

test('Armory 2.0 - Rules: Item Sets Engine (MIC Mechanics)', () => {
  const pc = {
    items: [
      new Item({
        id: 'r1',
        name: 'Gloves of the Starry Sky',
        slot: 'hands',
        setId: 'raiment_of_the_four',
        isEquipped: true,
        effects: [{ type: 'skill', target: 'concentration', value: 2, bonusType: 'competence' }]
      }),
      new Item({
        id: 'r2',
        name: 'Boots of the Big Sky',
        slot: 'feet',
        setId: 'raiment_of_the_four',
        isEquipped: true,
        effects: [{ type: 'skill', target: 'jump', value: 2, bonusType: 'competence' }]
      }),
      new Item({
        id: 'r3',
        name: 'Goggles of the Golden Sun',
        slot: 'face',
        setId: 'raiment_of_the_four',
        isEquipped: true,
        effects: [{ type: 'skill', target: 'spot', value: 2, bonusType: 'competence' }]
      })
    ]
  };

  const effects = calculateEquippedItemEffects(pc);
  // 3 pieces of Raiment of the Four:
  // - 2 pieces bonus: +2 resistance on all saves
  // - 3 pieces bonus: +10 speed
  assert.strictEqual(effects.saves.all, 2);
  assert.strictEqual(effects.speed, 10);
  assert.strictEqual(effects.activeSets.length, 1);
  assert.strictEqual(effects.activeSets[0].equippedCount, 3);
  assert.strictEqual(effects.activeSets[0].activeBonuses.length, 2);
});

// Tests/MagicItems.test.js - Test suite for D&D 3.5e Magic Items system
import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Item } from '../js/models/Item.js';
import { Stat } from '../js/models/Stat.js';
import { getActivePC } from '../js/state/state-core.js';
import { addPCItem, deletePCItem, updatePCItem, togglePCItemEquip, addPCItemEffect, deletePCItemEffect, updatePCItemEffect } from '../js/state/PCManager.js';

test('Magic Items - Model initialization & default properties', () => {
  const item = new Item({
    name: 'Gürtel der Riesenstärke',
    slot: 'waist',
    effectType: 'attribute',
    effectTarget: 'str',
    effectValue: 4
  });

  assert.strictEqual(item.name, 'Gürtel der Riesenstärke');
  assert.strictEqual(item.slot, 'waist');
  assert.strictEqual(item.isEquipped, false);
  assert.strictEqual(item.effectType, 'attribute');
  assert.strictEqual(item.effectTarget, 'str');
  assert.strictEqual(item.effectValue, 4);
});

test('Magic Items - Attribute modifications (Enhancement)', () => {
  const pc = new Combatant({
    type: 'p',
    str: new Stat(14),
    items: [
      new Item({
        name: 'Gürtel der Riesenstärke +4',
        slot: 'waist',
        isEquipped: true,
        effectType: 'attribute',
        effectTarget: 'str',
        effectValue: 4
      })
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 18, 'Strength should be 18 (14 base + 4 enhancement)');
});

test('Magic Items - Saving throws modifications (Resistance)', () => {
  const pc = new Combatant({
    type: 'p',
    baseZa: new Stat(2),
    baseRef: new Stat(3),
    baseWil: new Stat(1),
    con: new Stat(10),
    dex: new Stat(10),
    wis: new Stat(10),
    items: [
      new Item({
        name: 'Schutzmantel +2',
        slot: 'shoulders',
        isEquipped: true,
        effectType: 'save',
        effectTarget: 'all',
        effectValue: 2
      }),
      new Item({
        name: 'Eisenschild der Willenskraft +1',
        slot: 'slotless',
        isEquipped: true,
        effectType: 'save',
        effectTarget: 'wil',
        effectValue: 1
      })
    ]
  });

  pc.rebuildStatModifiers();
  // Zähigkeit (Fort) = 2 (base) + 2 (resistance) + 0 (con) = 4
  assert.strictEqual(pc.za.getValue(), 4, 'Fortitude should be 4');
  // Reflex (Ref) = 3 (base) + 2 (resistance) + 0 (dex) = 5
  assert.strictEqual(pc.ref.getValue(), 5, 'Reflex should be 5');
  // Wille (Will) = 1 (base) + 2 (resistance) + 0 (wis) = 3 (resistance bonuses do not stack)
  assert.strictEqual(pc.wil.getValue(), 3, 'Will should be 3');
});

test('Magic Items - AC modifications (Deflection & Natural & Armor)', () => {
  const pc = new Combatant({
    type: 'p',
    autoAC: true,
    acNatural: 0,
    acDeflection: 0,
    dex: new Stat(10),
    items: [
      new Item({
        name: 'Schutzring +2',
        slot: 'ring1',
        isEquipped: true,
        effectType: 'ac',
        effectTarget: 'deflection',
        effectValue: 2
      }),
      new Item({
        name: 'Amulett der natürlichen Rüstung +1',
        slot: 'neck',
        isEquipped: true,
        effectType: 'ac',
        effectTarget: 'natural',
        effectValue: 1
      })
    ]
  });

  pc.rebuildStatModifiers();
  // AC = 10 base + 2 deflection + 1 natural = 13
  assert.strictEqual(pc.ac.getValue(), 13, 'AC should be 13');
  // Touch AC = 10 base + 2 deflection = 12 (natural armor does not apply to touch AC)
  assert.strictEqual(pc.acTouch.getValue(), 12, 'Touch AC should be 12');
  // Flat-Footed AC = 10 base + 2 deflection + 1 natural = 13
  assert.strictEqual(pc.acFlat.getValue(), 13, 'Flat-Footed AC should be 13');
});

test('Magic Items - Speed modifications', () => {
  const pc = new Combatant({
    type: 'p',
    baseBw: 30,
    items: [
      new Item({
        name: 'Stiefel der Schnelligkeit +10',
        slot: 'feet',
        isEquipped: true,
        effectType: 'speed',
        effectValue: 10
      })
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.bw, 40, 'Speed should be 40 ft');
});

test('Magic Items - State Management & Slot Collision Resolution', () => {
  const pc = getActivePC();
  pc.items = []; // Reset items

  // 1. Add item
  addPCItem();
  assert.strictEqual(pc.items.length, 1);
  assert.strictEqual(pc.items[0].isEquipped, false);

  // 2. Configure item
  updatePCItem(0, 'name', 'Schutzring +1');
  updatePCItem(0, 'slot', 'ring1');
  updatePCItem(0, 'effectType', 'ac');
  updatePCItem(0, 'effectTarget', 'deflection');
  updatePCItem(0, 'effectValue', 1);

  assert.strictEqual(pc.items[0].name, 'Schutzring +1');

  // 3. Equip item
  togglePCItemEquip(0);
  assert.strictEqual(pc.items[0].isEquipped, true);

  // 4. Add and equip a second item in the same slot (ring1)
  addPCItem();
  updatePCItem(1, 'name', 'Anderer Ring +2');
  updatePCItem(1, 'slot', 'ring1');
  updatePCItem(1, 'effectType', 'ac');
  updatePCItem(1, 'effectTarget', 'deflection');
  updatePCItem(1, 'effectValue', 2);

  // Equip second ring
  togglePCItemEquip(1);

  // Enforce slot collision resolution
  assert.strictEqual(pc.items[1].isEquipped, true, 'New item should be equipped');
  assert.strictEqual(pc.items[0].isEquipped, false, 'First item in the same slot should be unequipped');

  // 5. Delete item
  deletePCItem(0);
  assert.strictEqual(pc.items.length, 1);
  assert.strictEqual(pc.items[0].name, 'Anderer Ring +2');
});

test('Magic Items - Expanded Slot Rules (Ring Independence, Multiple Slotless, Standard Collisions)', () => {
  const pc = getActivePC();
  pc.items = []; // Reset items

  // 1. Add and equip a ring in ring1
  addPCItem();
  updatePCItem(0, 'name', 'Ring der Ausweichs +1');
  updatePCItem(0, 'slot', 'ring1');
  togglePCItemEquip(0);
  assert.strictEqual(pc.items[0].isEquipped, true);

  // 2. Add and equip a ring in ring2
  addPCItem();
  updatePCItem(1, 'name', 'Ring des Schutzes +2');
  updatePCItem(1, 'slot', 'ring2');
  togglePCItemEquip(1);
  // Both ring1 and ring2 should be equipped since they are separate slots!
  assert.strictEqual(pc.items[0].isEquipped, true, 'Ring 1 should stay equipped');
  assert.strictEqual(pc.items[1].isEquipped, true, 'Ring 2 should be equipped');

  // 3. Add and equip a third ring in ring1 (should unequip the ring in ring1 but NOT ring2)
  addPCItem();
  updatePCItem(2, 'name', 'Ring des Zauberns +3');
  updatePCItem(2, 'slot', 'ring1');
  togglePCItemEquip(2);
  assert.strictEqual(pc.items[2].isEquipped, true, 'Ring 3 should be equipped');
  assert.strictEqual(pc.items[0].isEquipped, false, 'First Ring 1 should be unequipped');
  assert.strictEqual(pc.items[1].isEquipped, true, 'Ring 2 should stay equipped');

  // 4. Add multiple slotless items (they should both remain equipped at the same time)
  addPCItem();
  updatePCItem(3, 'name', 'Iounenstein 1');
  updatePCItem(3, 'slot', 'slotless');
  togglePCItemEquip(3);

  addPCItem();
  updatePCItem(4, 'name', 'Iounenstein 2');
  updatePCItem(4, 'slot', 'slotless');
  togglePCItemEquip(4);

  assert.strictEqual(pc.items[3].isEquipped, true, 'Slotless 1 should be equipped');
  assert.strictEqual(pc.items[4].isEquipped, true, 'Slotless 2 should be equipped');

  // 5. Add and equip standard slot items (e.g. neck)
  addPCItem();
  updatePCItem(5, 'name', 'Amulett 1');
  updatePCItem(5, 'slot', 'neck');
  togglePCItemEquip(5);
  assert.strictEqual(pc.items[5].isEquipped, true, 'Amulet 1 should be equipped');

  addPCItem();
  updatePCItem(6, 'name', 'Amulett 2');
  updatePCItem(6, 'slot', 'neck');
  togglePCItemEquip(6);
  assert.strictEqual(pc.items[6].isEquipped, true, 'Amulet 2 should be equipped');
  assert.strictEqual(pc.items[5].isEquipped, false, 'Amulet 1 should be unequipped due to neck slot collision');
});

test('Magic Items - Multiple active effects application', () => {
  const pc = new Combatant({
    type: 'p',
    str: new Stat(10),
    con: new Stat(10),
    baseRef: new Stat(0),
    items: [
      new Item({
        name: 'Gürtel der physischen Perfektion',
        slot: 'waist',
        isEquipped: true,
        effects: [
          { type: 'attribute', target: 'str', value: 4 },
          { type: 'attribute', target: 'con', value: 2 },
          { type: 'save', target: 'ref', value: 1 }
        ]
      })
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 14, 'Strength should be 14');
  assert.strictEqual(pc.con.getValue(), 12, 'Constitution should be 12');
  assert.strictEqual(pc.ref.getValue(), 1, 'Reflex should be 1');
});

test('Magic Items - State Management for Multiple Effects (CRUD)', () => {
  const pc = getActivePC();
  pc.items = []; // Reset items

  // 1. Add item
  addPCItem();
  assert.strictEqual(pc.items.length, 1);
  assert.strictEqual(pc.items[0].effects.length, 1, 'Default item should have 1 effect');

  // 2. Add a second effect to this item
  addPCItemEffect(0);
  assert.strictEqual(pc.items[0].effects.length, 2, 'Item should now have 2 effects');

  // 3. Update the second effect
  updatePCItemEffect(0, 1, 'type', 'save');
  updatePCItemEffect(0, 1, 'target', 'ref');
  updatePCItemEffect(0, 1, 'value', 3);

  assert.strictEqual(pc.items[0].effects[1].type, 'save');
  assert.strictEqual(pc.items[0].effects[1].target, 'ref');
  assert.strictEqual(pc.items[0].effects[1].value, 3);

  // 4. Delete the first effect
  deletePCItemEffect(0, 0);
  assert.strictEqual(pc.items[0].effects.length, 1, 'Item should now have 1 effect left');
  assert.strictEqual(pc.items[0].effects[0].type, 'save', 'The remaining effect should be the one we updated');
});


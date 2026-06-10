// Tests/MagicItems.test.js - Test suite for D&D 3.5e Magic Items system
import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Item } from '../js/models/Item.js';
import { Stat } from '../js/models/Stat.js';
import { getActivePC } from '../js/state/state-core.js';
import { addPCItem, deletePCItem, updatePCItem, togglePCItemEquip } from '../js/state/PCManager.js';

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

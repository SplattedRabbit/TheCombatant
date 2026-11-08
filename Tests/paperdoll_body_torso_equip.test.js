import test from 'node:test';
import assert from 'node:assert/strict';
import { isConsumableItem } from '../src/components/player/armory/armoryHelpers.ts';
import { parseInventoryPackage, importPCInventoryPackage } from '../js/state/pc/equipment/PCInventoryPackage.js';
import { CombatState } from '../js/state.js';
import { Combatant } from '../js/models/Combatant.js';

test('Armory - Slotted items in torso and body are never treated as consumables', () => {
  // Item with activation but assigned to torso slot
  const torsoItem = {
    name: 'Vest of Resistance +3',
    slot: 'torso',
    activation: { appliedBuffKey: 'resistance' },
    effects: []
  };
  assert.equal(isConsumableItem(torsoItem), false, 'Torso item with activation must not be treated as a consumable');

  // Item assigned to body slot with 0 passive stats
  const bodyItem = {
    name: 'Robe of the Archmagi',
    slot: 'body',
    effects: []
  };
  assert.equal(isConsumableItem(bodyItem), false, 'Body item must not be treated as a consumable');

  // True consumable (potion with slotless / no slot)
  const potion = {
    name: 'Potion of Cure Serious Wounds',
    slot: 'slotless',
    healingFormula: '3d8+5'
  };
  assert.equal(isConsumableItem(potion), true, 'Potion with slotless must be treated as consumable');
});

test('Armory - Import package supports { characters: [...] } and maps German categories/slots', () => {
  const samplePkg = {
    characters: [
      {
        character: "Bruder Kjell Ketzerbrecher",
        race: "Zwerg",
        class: "Paladin / Shadowbane Inquisitor",
        level: 13,
        items: [
          {
            name: "Ketzerbrecher",
            category: "Waffe",
            slot: "Haupthand",
            type: "Warhammer",
            enhancement: "+3 Holy Magebane",
            effect: "Gegen böse Wesen +2d6 heiliger Schaden."
          },
          {
            name: "Full Plate des Seelenfriedens",
            category: "Rüstung",
            slot: "Körper",
            type: "Full Plate (Adamantit-Stil)",
            enhancement: "+3",
            effect: "Schwere Rüstung."
          },
          {
            name: "Animated Heavy Steel Shield",
            category: "Schild",
            slot: "Schild (schwebend)",
            type: "Heavy Steel Shield",
            enhancement: "+2 Animated",
            effect: "Schwebt freihändig."
          },
          {
            name: "Twilight Mithral Shirt",
            category: "Rüstung",
            slot: "Torso",
            type: "Mithral Shirt",
            enhancement: "+3 Twilight",
            effect: "0% Zauberpatzer."
          },
          {
            name: "Belt of Giant Strength +4",
            category: "Wundersamer Gegenstand",
            slot: "Gürtel",
            type: "Attributsverstärkung",
            enhancement: "+4 Stärke",
            effect: "+4 Verbesserungsbonus auf Stärke."
          },
          {
            name: "Potion of Cure Serious Wounds",
            category: "Trank",
            slot: "Gürteltasche",
            type: "Heilung",
            quantity: 2,
            effect: "Heilt 3d8+5."
          }
        ]
      }
    ]
  };

  const parsed = parseInventoryPackage(samplePkg);
  assert.equal(parsed.isValid, true, 'Package with characters structure must be parsed successfully');
  assert.equal(parsed.weapons.length, 1, 'Ketzerbrecher must be categorized as weapon');
  assert.equal(parsed.weapons[0].name, 'Ketzerbrecher');
  assert.equal(parsed.weapons[0].enhancement, 3);

  // Armors: Full Plate + Animated Shield + Twilight Mithral Shirt
  assert.equal(parsed.armors.length, 3, 'Armors and shields must be categorized as armors');
  const fullPlate = parsed.armors.find(a => a.name.includes('Full Plate'));
  assert.ok(fullPlate, 'Full Plate should be in armors');
  assert.equal(fullPlate.isShield, false);
  assert.equal(fullPlate.enhancement, 3);

  const shield = parsed.armors.find(a => a.name.includes('Animated Heavy Steel Shield'));
  assert.ok(shield, 'Animated shield should be in armors');
  assert.equal(shield.isShield, true);
  assert.equal(shield.isAnimated, true);

  // Wondrous items: Belt of Giant Strength + 2 Potions
  assert.equal(parsed.items.length, 3, '1 Belt and 2 Potions');
  const belt = parsed.items.find(i => i.name.includes('Belt of Giant Strength'));
  assert.ok(belt, 'Belt should be in items');
  assert.equal(belt.slot, 'waist', 'Gürtel must map to waist slot');
  assert.equal(belt.effects.some(e => e.target === 'str' && e.value === 4), true, 'Strength +4 effect should be parsed');

  const potions = parsed.items.filter(i => i.name.includes('Potion'));
  assert.equal(potions.length, 2, 'Quantity 2 should yield 2 potion entries');
  assert.equal(potions[0].slot, 'slotless');
  assert.equal(potions[0].isEquipped, false);
});

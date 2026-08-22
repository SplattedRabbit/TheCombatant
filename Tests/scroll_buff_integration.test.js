import test from 'node:test';
import assert from 'node:assert';
import { MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM } from '../js/data/magicItems-data.js';
import { CombatState } from '../js/state.js';
import { createCombatant } from '../js/models/model-core.js';

test('Scrolls & Buffs - Magic Items Registry & Compendium contains standard scrolls', () => {
  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_invisibility, 'scroll_of_invisibility must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_invisibility.activation?.appliedBuffKey, 'invisibility');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_invisibility.slot, 'slotless');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_invisibility.charges?.max, 1);

  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_shield, 'scroll_of_shield must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_shield.activation?.appliedBuffKey, 'shield');

  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_mage_armor, 'scroll_of_mage_armor must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_mage_armor.activation?.appliedBuffKey, 'mage_armor');

  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_haste, 'scroll_of_haste must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_haste.activation?.appliedBuffKey, 'haste');

  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_bulls_strength, 'scroll_of_bulls_strength must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_bulls_strength.activation?.appliedBuffKey, 'bulls_strength');

  assert.ok(MAGIC_ITEMS_REGISTRY.scroll_of_cure_light_wounds, 'scroll_of_cure_light_wounds must exist in registry');
  assert.strictEqual(MAGIC_ITEMS_REGISTRY.scroll_of_cure_light_wounds.healingFormula, '1d8+1');

  // Compendium entries
  const invisEntry = CONSOLIDATED_COMPENDIUM.find(c => c.id === 'scroll_of_invisibility');
  assert.ok(invisEntry, 'scroll_of_invisibility must exist in compendium');

  const shieldEntry = CONSOLIDATED_COMPENDIUM.find(c => c.id === 'scroll_of_shield');
  assert.ok(shieldEntry, 'scroll_of_shield must exist in compendium');

  const curativeGroup = CONSOLIDATED_COMPENDIUM.find(c => c.id === 'scroll_cure_wounds');
  assert.ok(curativeGroup, 'scroll_cure_wounds group must exist in compendium');
});

test('Scrolls & Buffs - Consuming Scroll of Invisibility adds buff to activeBuffs and consumes item', () => {
  const char = createCombatant({
    name: 'Rogue Tester',
    type: 'p',
    activeBuffs: [],
    items: []
  });

  const s = CombatState.getState();
  s.combatants = [char];
  s.localPCId = char.id;

  // Add Scroll of Invisibility from compendium
  CombatState.addPCItemFromCompendium('scroll_of_invisibility', false);
  assert.strictEqual(char.items.length, 1, 'PC should have 1 item');
  assert.strictEqual(char.items[0].name, 'Scroll of Invisibility');
  assert.strictEqual(char.items[0].activation.appliedBuffKey, 'invisibility');

  // Use Scroll of Invisibility (index 0)
  const result = CombatState.usePCItemCharge(0);
  assert.strictEqual(result.success, true);
  assert.ok(result.message.toLowerCase().includes('invisibility'), 'Result message should confirm Invisibility activation');

  // Verify activeBuffs
  assert.ok(Array.isArray(char.activeBuffs), 'activeBuffs must be array');
  assert.strictEqual(char.activeBuffs.length, 1, 'Should have 1 active buff');
  assert.strictEqual(char.activeBuffs[0].spellKey, 'invisibility');
  assert.strictEqual(char.activeBuffs[0].source, 'Scroll of Invisibility');

  // Verify single-use scroll is consumed from items list
  assert.strictEqual(char.items.length, 0, 'Single-use scroll should be removed from items');
});

test('Scrolls & Buffs - Custom Item with appliedBuffKey triggers activeBuff when used', () => {
  const char = createCombatant({
    name: 'Wizard Tester',
    type: 'p',
    activeBuffs: [],
    items: [
      {
        name: 'Custom Wand of Haste',
        slot: 'slotless',
        charges: { current: 10, max: 10 },
        activation: {
          actionType: 'standard',
          costType: 'charges',
          cost: 1,
          appliedBuffKey: 'haste',
          effectDescription: 'Casts Haste for 5 rounds.'
        }
      }
    ]
  });

  const s = CombatState.getState();
  s.combatants = [char];
  s.localPCId = char.id;

  const result = CombatState.usePCItemCharge(0);
  assert.strictEqual(result.success, true);

  assert.strictEqual(char.activeBuffs.length, 1);
  assert.strictEqual(char.activeBuffs[0].spellKey, 'haste');
  assert.strictEqual(char.items[0].charges.current, 9, 'Should have deducted 1 charge');
});

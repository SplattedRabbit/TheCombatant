import test from 'node:test';
import assert from 'node:assert';
import { Armor, matchesShieldFeatOption } from '../js/models/Armor.js';
import { Combatant } from '../js/models/Combatant.js';
import { rebuildCombatantModifiers } from '../js/models/helpers/modifiers/CombatantModifiers.js';
import { CombatFeats } from '../js/data/feats-data.js';

test('Shield Specialization - matchesShieldFeatOption unit tests', () => {
  const buckler = new Armor({ type: 'buckler', isEquipped: true });
  const lightWooden = new Armor({ type: 'shield_light_wooden', isEquipped: true });
  const lightSteel = new Armor({ type: 'shield_light_steel', isEquipped: true });
  const heavyWooden = new Armor({ type: 'shield_heavy_wooden', isEquipped: true });
  const heavySteel = new Armor({ type: 'shield_heavy_steel', isEquipped: true });
  const tower = new Armor({ type: 'shield_tower', isEquipped: true });

  // Buckler
  assert.strictEqual(matchesShieldFeatOption(buckler, 'Buckler'), true);
  assert.strictEqual(matchesShieldFeatOption(buckler, 'Heavy shield'), false);
  assert.strictEqual(matchesShieldFeatOption(buckler, ''), true, 'Empty option matches all shields as fallback');

  // Light Shields
  assert.strictEqual(matchesShieldFeatOption(lightWooden, 'Light shield'), true);
  assert.strictEqual(matchesShieldFeatOption(lightSteel, 'Light shield'), true);
  assert.strictEqual(matchesShieldFeatOption(lightSteel, 'Leichter Schild'), true);
  assert.strictEqual(matchesShieldFeatOption(lightSteel, 'Heavy shield'), false);

  // Heavy Shields
  assert.strictEqual(matchesShieldFeatOption(heavyWooden, 'Heavy shield'), true);
  assert.strictEqual(matchesShieldFeatOption(heavySteel, 'Heavy shield'), true);
  assert.strictEqual(matchesShieldFeatOption(heavySteel, 'Schwerer Schild'), true);
  assert.strictEqual(matchesShieldFeatOption(heavySteel, 'Tower shield'), false);

  // Tower Shield
  assert.strictEqual(matchesShieldFeatOption(tower, 'Tower shield'), true);
  assert.strictEqual(matchesShieldFeatOption(tower, 'Turmschild'), true);
  assert.strictEqual(matchesShieldFeatOption(tower, 'Buckler'), false);
});

test('Shield Specialization - Feat Registry definition', () => {
  const feat = CombatFeats.REGISTRY['shield_specialization'];
  assert.ok(feat, 'shield_specialization must be registered in CombatFeats.REGISTRY');
  assert.strictEqual(feat.hasOption, true, 'hasOption must be true');
  assert.strictEqual(feat.optionType, 'shield', 'optionType must be shield');
  assert.strictEqual(feat.source, 'phb2', 'source must be phb2');
});

test('Shield Specialization - AC recalculation on Combatant', () => {
  const pc = new Combatant({
    type: 'p',
    race: 'human',
    dex: 14, // +2 mod
    autoAC: true,
    armors: [
      { id: 'shield1', type: 'shield_heavy_steel', isEquipped: true }
    ],
    feats: []
  });

  // Base state: 10 + 2 (Dex) + 2 (Heavy Shield) = 14
  rebuildCombatantModifiers(pc);
  assert.strictEqual(pc.ac.getValue(), 14, 'Baseline AC without feat should be 14');
  assert.strictEqual(pc.acFlat.getValue(), 12, 'Baseline Flat-Footed AC should be 12');
  assert.strictEqual(pc.acTouch.getValue(), 12, 'Touch AC should be 12 (no shield bonus)');

  // Add Shield Specialization for Heavy shield -> AC should become 10 + 2 + 3 = 15
  pc.feats = [{ id: 'shield_specialization', option: 'Heavy shield' }];
  rebuildCombatantModifiers(pc);
  assert.strictEqual(pc.ac.getValue(), 15, 'AC with matching Shield Specialization should be 15 (+3 shield)');
  assert.strictEqual(pc.acFlat.getValue(), 13, 'Flat-Footed AC with matching Shield Specialization should be 13');
  assert.strictEqual(pc.acTouch.getValue(), 12, 'Touch AC should remain 12');

  // Mismatch option: Shield Specialization for Buckler while wearing Heavy Shield -> no +1 bonus
  pc.feats = [{ id: 'shield_specialization', option: 'Buckler' }];
  rebuildCombatantModifiers(pc);
  assert.strictEqual(pc.ac.getValue(), 14, 'AC with mismatched Shield Specialization should be 14 (+2 shield)');

  // Switch equipped shield to Buckler (+1 AC) with Buckler specialization -> 10 + 2 + (1 + 1) = 14
  pc.armors = [{ id: 'shield2', type: 'buckler', isEquipped: true }];
  rebuildCombatantModifiers(pc);
  assert.strictEqual(pc.ac.getValue(), 14, 'AC with Buckler + Buckler Specialization should be 14 (10 + 2 dex + 2 shield)');

  // Unequip shield -> 10 + 2 = 12
  pc.armors[0].isEquipped = false;
  rebuildCombatantModifiers(pc);
  assert.strictEqual(pc.ac.getValue(), 12, 'AC without shield equipped should be 12 (10 + 2 dex)');
});

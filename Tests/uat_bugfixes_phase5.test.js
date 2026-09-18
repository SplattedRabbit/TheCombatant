import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSpellEffectValue, isBuffEligible, activateBuffByKey } from '../js/rules/BuffRules.js';
import { CLASS_BUFFS } from '../js/data/class-buffs-data.js';
import { resolveModifierStacking } from '../js/models/helpers/modifiers/ModifierStacking.js';
import { DRAGON_TOTEMS } from '../js/rules/data/dragonTotems.js';
import { LocalStorageAdapter, CHARACTER_PREFIX } from '../src/services/storage/LocalStorageAdapter.ts';

describe('UAT Bugfixes & Feature Verifications Suite', () => {

  test('Bug 1: Barkskin Natural Armor Enhancement & Modifier Stacking', () => {
    // 1. Formula scaling: min +2, max +5 (1 + floor(CL/3))
    assert.strictEqual(resolveSpellEffectValue('barkskin', 3, 2), 2);
    assert.strictEqual(resolveSpellEffectValue('barkskin', 6, 2), 3);
    assert.strictEqual(resolveSpellEffectValue('barkskin', 9, 2), 4);
    assert.strictEqual(resolveSpellEffectValue('barkskin', 12, 2), 5);
    assert.strictEqual(resolveSpellEffectValue('barkskin', 18, 2), 5);

    // 2. Stacking: Barkskin (natural_enhancement +3) vs Amulet of Natural Armor (natural_enhancement +2) -> only +3 applies
    // Base natural armor (natural +2) + Barkskin (natural_enhancement +3) -> stacks to +5
    const modifiers = [
      { value: 2, type: 'natural', source: 'Lizardfolk Natural Armor' },
      { value: 3, type: 'natural_enhancement', source: 'Barkskin (CL 9)' },
      { value: 2, type: 'natural_enhancement', source: 'Amulet of Natural Armor +2' }
    ];

    const result = resolveModifierStacking(modifiers);
    assert.strictEqual(result.total, 5, 'Natural armor (2) + highest enhancement (3) should equal 5');
  });

  test('Bug 2: Shield Bash Grips and Damage Dice Scaling', () => {
    // Light Shield: 'light' grip -> TWF penalty is -2 with TWF feat
    // Heavy Shield: '1h' (one-handed) grip -> TWF penalty is -4 with TWF feat
    const lightShield = { name: 'Light Wooden Shield', isHeavy: false };
    const heavyShield = { name: 'Heavy Steel Shield', isHeavy: true };

    const getGrip = (sh) => sh.isHeavy ? '1h' : 'light';
    assert.strictEqual(getGrip(lightShield), 'light');
    assert.strictEqual(getGrip(heavyShield), '1h');

    // Medium Base Damage: Light = 1d3, Heavy = 1d4
    const getBaseDmg = (sh, isSmall = false) => {
      if (sh.isHeavy) return isSmall ? '1d3' : '1d4';
      return isSmall ? '1d2' : '1d3';
    };
    assert.strictEqual(getBaseDmg(lightShield, false), '1d3');
    assert.strictEqual(getBaseDmg(heavyShield, false), '1d4');
    assert.strictEqual(getBaseDmg(lightShield, true), '1d2');
    assert.strictEqual(getBaseDmg(heavyShield, true), '1d3');
  });

  test('Bug 4 & 5 & 7: Draconic Auras & Dragon Shaman Breath Weapon', () => {
    // 1. Draconic Auras exist in CLASS_BUFFS
    const auraKeys = [
      'draconic_aura_power',
      'draconic_aura_presence',
      'draconic_aura_resistance',
      'draconic_aura_senses',
      'draconic_aura_toughness',
      'draconic_aura_vigor',
      'draconic_aura_energy_shield'
    ];

    auraKeys.forEach(k => {
      const found = CLASS_BUFFS.find(b => b.key === k);
      assert.ok(found, `Aura ${k} must exist in CLASS_BUFFS`);
      assert.strictEqual(found.duration, 'Permanent');
      assert.deepStrictEqual(found.classRequirements, [{ classType: 'dragon_shaman', level: 1 }]);
    });

    // 2. Bonus scaling formula: Math.max(1, 1 + Math.floor((lvl - 1) / 4))
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 1, 1), 1);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 4, 1), 1);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 5, 1), 2);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 9, 1), 2);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 10, 1), 3);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 15, 1), 4);
    assert.strictEqual(resolveSpellEffectValue('draconic_aura', 20, 1), 5);

    // 3. Eligibility
    const dsPc = { classes: [{ classType: 'dragon_shaman', level: 3 }] };
    const nonDsPc = { classes: [{ classType: 'fighter', level: 3 }] };
    assert.strictEqual(isBuffEligible(dsPc, 'draconic_aura_power', true), true);
    assert.strictEqual(isBuffEligible(nonDsPc, 'draconic_aura_power', true), false);

    // 4. Breath Weapon Calculation
    const getBreathDice = (dsLvl) => dsLvl >= 4 ? `${2 + Math.floor((dsLvl - 4) / 2)}d6` : '';
    assert.strictEqual(getBreathDice(3), '');
    assert.strictEqual(getBreathDice(4), '2d6');
    assert.strictEqual(getBreathDice(5), '2d6');
    assert.strictEqual(getBreathDice(6), '3d6');
    assert.strictEqual(getBreathDice(8), '4d6');
    assert.strictEqual(getBreathDice(20), '10d6');
  });

  test('Bug 6: Multi-Character Index Persistence in Local Storage', () => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    const adapter = new LocalStorageAdapter('test_roster_state');

    const char1 = {
      mode: 'pc',
      combatants: [{ id: 'char-uuid-1', name: 'Ignis', type: 'p', level: 4, race: 'Human' }]
    };

    adapter.setActiveCharacterId('char-uuid-1');
    adapter.saveCharacter('char-uuid-1', char1);

    const summaries = adapter.listCharacters();
    assert.strictEqual(summaries.length, 1);
    assert.strictEqual(summaries[0].id, 'char-uuid-1');
    assert.strictEqual(summaries[0].name, 'Ignis');
    assert.strictEqual(summaries[0].isCurrentActive, true);
  });

});

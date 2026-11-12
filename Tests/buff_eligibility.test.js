import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { CombatSpells } from '../js/spells.js';
import { isBuffEligible } from '../js/rules/BuffRules.js';
import { applySpellModifiers } from '../js/models/helpers/modifiers/SpellModifierApplier.js';
import { buildContext } from '../js/rules/attack/AttackContext.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells-phb.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

test('Buff Eligibility - isBuffEligible checking', () => {
  const pc = new Combatant({
    id: 'pc_test_eligible',
    name: 'Eligible Hero',
    type: 'p',
    learnedSpells: ['bulls_strength'],
    classes: [{ classType: 'barbarian', level: 1 }]
  });

  // Spell eligibility
  assert.strictEqual(isBuffEligible(pc, 'bulls_strength', false), true, 'spell buffs should be eligible');
  assert.strictEqual(isBuffEligible(pc, 'haste', false), true, 'all spell buffs should be eligible');

  // Class eligibility
  assert.strictEqual(isBuffEligible(pc, 'rage', true), true, 'Barbarian lvl 1 has access to rage');
  assert.strictEqual(isBuffEligible(pc, 'greater_rage', true), false, 'Barbarian lvl 1 does not have access to greater rage');

  // Update Barbarian level to 11
  pc.classes = [{ classType: 'barbarian', level: 11 }];
  assert.strictEqual(isBuffEligible(pc, 'greater_rage', true), true, 'Barbarian lvl 11 has access to greater rage');
  assert.strictEqual(isBuffEligible(pc, 'mighty_rage', true), false, 'Barbarian lvl 11 does not have access to mighty rage');

  // Update Barbarian level to 20
  pc.classes = [{ classType: 'barbarian', level: 20 }];
  assert.strictEqual(isBuffEligible(pc, 'mighty_rage', true), true, 'Barbarian lvl 20 has access to mighty rage');

  // Bard lvl 15 eligibility check
  pc.classes = [{ classType: 'bard', level: 15 }];
  assert.strictEqual(isBuffEligible(pc, 'inspire_courage_1', true), true, 'Bard lvl 15 has access to inspire courage 1');
  assert.strictEqual(isBuffEligible(pc, 'inspire_courage_2', true), true, 'Bard lvl 15 has access to inspire courage 2');
  assert.strictEqual(isBuffEligible(pc, 'inspire_courage_3', true), true, 'Bard lvl 15 has access to inspire courage 3');
  assert.strictEqual(isBuffEligible(pc, 'inspire_competence', true), true, 'Bard lvl 15 has access to inspire competence');
  assert.strictEqual(isBuffEligible(pc, 'inspire_greatness', true), true, 'Bard lvl 15 has access to inspire greatness');
  assert.strictEqual(isBuffEligible(pc, 'inspire_heroics', true), true, 'Bard lvl 15 has access to inspire heroics');
  assert.strictEqual(isBuffEligible(pc, 'inspire_courage_4', true), false, 'Bard lvl 15 does not have access to inspire courage 4');
});

test('Buff Eligibility - Stat Exclusion based on sharedWith', () => {
  const pc = new Combatant({
    id: 'my_pc_id',
    name: 'Stat Hero',
    type: 'p',
    str: 10,
    activeBuffs: [
      {
        id: 'spell_bulls_strength_test',
        spellKey: 'bulls_strength',
        name: 'Stärke des Stiers',
        effects: [
          { target: 'str', value: 4, type: 'enhancement', source: 'Stärke des Stiers' }
        ],
        // sharedWith is defined, but does not contain my_pc_id
        sharedWith: ['ally_pc_id']
      }
    ]
  });

  pc.rebuildStatModifiers();
  // Since my_pc_id is not in sharedWith, strength should remain 10
  assert.strictEqual(pc.str.getValue(), 10, 'Strength should not be modified if sharedWith does not include pc.id');

  // Include my_pc_id
  pc.activeBuffs[0].sharedWith.push('my_pc_id');
  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 14, 'Strength should be 14 if sharedWith includes pc.id');

  // Clear sharedWith (local only)
  delete pc.activeBuffs[0].sharedWith;
  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 14, 'Strength should be 14 if sharedWith is undefined');
});

test('Buff Eligibility - Attack/Damage context target exclusion', () => {
  const pc = new Combatant({
    id: 'my_pc_id',
    name: 'Attack Hero',
    type: 'p',
    bab: 5,
    activeBuffs: [
      {
        id: 'spell_haste_test',
        spellKey: 'haste',
        name: 'Hast',
        effects: [
          { target: 'atk', value: 1, type: 'dodge', source: 'Hast' }
        ],
        sharedWith: ['ally_pc_id']
      }
    ]
  });

  const weapon = { name: 'Langschwert', category: 'martial', range: 'melee', dmgDie: '1d8', dmgMod: 'str', isEquipped: true };

  let ctx = buildContext(pc, weapon);
  // Haste should not apply to attack roll
  assert.strictEqual(ctx.buffAtkBonus, 0, 'Should not receive Haste bonus if excluded');

  // Add my_pc_id
  pc.activeBuffs[0].sharedWith.push('my_pc_id');
  ctx = buildContext(pc, weapon);
  assert.strictEqual(ctx.buffAtkBonus, 1, 'Should receive Haste bonus if included');
});

test('Buff Eligibility - Spell Buff Eligibility for Cleric/Druid/Fighter without learnedSpells', () => {
  const cleric = new Combatant({
    id: 'cleric_test',
    name: 'Cleric Hero',
    type: 'p',
    classes: [{ classType: 'cleric', level: 5 }]
  });

  // Since Cleric doesn't have learnedSpells, it should still be eligible for any spell buff
  assert.strictEqual(isBuffEligible(cleric, 'bulls_strength', false), true, 'Cleric should be eligible for Bulls Strength');
  assert.strictEqual(isBuffEligible(cleric, 'haste', false), true, 'Cleric should be eligible for Haste');

  const fighter = new Combatant({
    id: 'fighter_test',
    name: 'Fighter Hero',
    type: 'p',
    classes: [{ classType: 'fighter', level: 5 }]
  });

  // Fighter has no spells at all, but can be targeted by ally buffs/potions
  assert.strictEqual(isBuffEligible(fighter, 'bulls_strength', false), true, 'Fighter should be eligible for spell buffs');
});

test('Buff Eligibility - Combatant quickBuffs initialization and serialization', () => {
  const testQuickBuffs = [
    { key: 'haste', name: 'Hast', isClass: false },
    { key: 'bulls_strength', name: 'Bärenstärke', isClass: false }
  ];

  // 1. Check initialization in constructor
  const pc = new Combatant({
    id: 'test_pc',
    name: 'Testheld',
    type: 'player',
    quickBuffs: testQuickBuffs
  });

  assert.ok(Array.isArray(pc.quickBuffs), 'quickBuffs should be an array');
  assert.strictEqual(pc.quickBuffs.length, 2, 'quickBuffs should contain exactly 2 items');
  assert.deepStrictEqual(pc.quickBuffs, testQuickBuffs, 'quickBuffs should match initial data');

  // 2. Check default initialization when not provided
  const pcDefault = new Combatant({
    id: 'default_pc',
    name: 'Defaultheld'
  });
  assert.ok(Array.isArray(pcDefault.quickBuffs), 'default quickBuffs should be initialized as an array');
  assert.strictEqual(pcDefault.quickBuffs.length, 0, 'default quickBuffs should be empty');

  // 3. Check serialization in toJSON
  const serialized = pc.toJSON();
  assert.ok(serialized.quickBuffs, 'serialized object should have quickBuffs property');
  assert.deepStrictEqual(serialized.quickBuffs, testQuickBuffs, 'serialized quickBuffs should match instance data');
});

test('Draconic Auras - PHB II Dragon Shaman Auras discovery & scaling', async () => {
  const { CLASS_BUFFS } = await import('../js/data/class-buffs-data.js');
  const { resolveSpellEffectValue, activateBuffByKey } = await import('../js/rules/BuffRules.js');

  // 1. Verify all 7 PHB II Draconic Auras exist and are flagged as ally auras
  const draconicAuraKeys = [
    'draconic_aura_power',
    'draconic_aura_presence',
    'draconic_aura_resistance',
    'draconic_aura_senses',
    'draconic_aura_toughness',
    'draconic_aura_vigor',
    'draconic_aura_energy_shield'
  ];

  for (const key of draconicAuraKeys) {
    const aura = CLASS_BUFFS.find(b => b.key === key);
    assert.ok(aura, `Aura ${key} should exist in CLASS_BUFFS`);
    assert.strictEqual(aura.isAura, true, `${key} should have isAura: true`);
    assert.strictEqual(aura.isAllyBuff, true, `${key} should have isAllyBuff: true`);
    assert.strictEqual(aura.isDraconicAura, true, `${key} should have isDraconicAura: true`);
    assert.strictEqual(aura.school, 'Aura (Dragon Shaman)', `${key} school should be Aura (Dragon Shaman)`);
  }

  // 2. Verify scaling: Dragon Shaman levels 1-4 (+1), 5-9 (+2), 10-14 (+3), 15-19 (+4), 20 (+5)
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 1), 1, 'Level 1 grants +1');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 4), 1, 'Level 4 grants +1');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 5), 2, 'Level 5 grants +2');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 13), 3, 'Level 13 grants +3 (Viperax)');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 15), 4, 'Level 15 grants +4');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', 20), 5, 'Level 20 grants +5');

  // Verify explicit string bonus (e.g. '+3')
  assert.strictEqual(resolveSpellEffectValue('draconic_aura', '+3'), 3, 'Explicit +3 bonus');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura_resist', '+3'), 15, 'Explicit +3 gives 15 resistance');
  assert.strictEqual(resolveSpellEffectValue('draconic_aura_shield', '+3'), 6, 'Explicit +3 gives 6 energy shield');

  // 3. Verify that non-Dragon-Shaman (e.g. Paladin or Wizard) can activate multiple different Draconic Auras simultaneously
  const paladin = new Combatant({
    id: 'kjell_paladin',
    name: 'Bruder Kjell',
    type: 'p',
    classes: [{ classType: 'paladin', level: 13 }]
  });

  const mockBatch = (fn) => fn(paladin);

  // Activate Draconic Aura: Power (+3)
  activateBuffByKey(paladin, 'draconic_aura_power', true, {
    showCustomPrompt: (title, msg, def, onConfirm) => onConfirm('13'),
    updatePCBatch: mockBatch
  });

  assert.strictEqual(paladin.activeBuffs.length, 1, 'One buff active');
  assert.strictEqual(paladin.activeBuffs[0].spellKey, 'draconic_aura_power');
  assert.strictEqual(paladin.activeBuffs[0].effects[0].value, 3, 'Power grants +3 damage');

  // Activate Draconic Aura: Vigor (+3) - should NOT remove Power!
  activateBuffByKey(paladin, 'draconic_aura_vigor', true, {
    showCustomPrompt: (title, msg, def, onConfirm) => onConfirm('+3'),
    updatePCBatch: mockBatch
  });

  assert.strictEqual(paladin.activeBuffs.length, 2, 'Both different Draconic Auras must remain active simultaneously');
  const activeKeys = paladin.activeBuffs.map(b => b.spellKey);
  assert.ok(activeKeys.includes('draconic_aura_power'), 'Power aura remains active');
  assert.ok(activeKeys.includes('draconic_aura_vigor'), 'Vigor aura is active');
});



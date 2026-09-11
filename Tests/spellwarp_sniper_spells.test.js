// Tests/spellwarp_sniper_spells.test.js
// Unit tests for Spellwarp Sniper RAW spellcasting progression, legacy import hydration, and spell preparation/learning.

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { CombatRules } from '../js/rules.js';
import { Stat } from '../js/models/Stat.js';
import { recalculatePCStats } from '../js/state/pc/PCGeneral.js';
import { importEncounterState, mergeIncomingPC } from '../js/state/EncounterManager.js';
import { getState } from '../js/state.js';
import { validateSpellLearnEligibility, getAllCompendiumSpells } from '../js/rules/RulesSpells.js';
import { SpellSlotCalculator } from '../js/rules/SpellSlotCalculator.js';

test('Spellwarp Sniper - 5/5 Full Caster Level Progression (RAW Complete Scoundrel p. 64)', () => {
  // Wizard 6 / Spellwarp Sniper 5 should yield Effective Caster Level 11 for Wizard
  const pc = new Combatant({
    classes: [
      { classType: 'ninja', level: 2 },
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    int: new Stat(18),
    wizardSpecialization: 'evo',
    wizardProhibited1: 'nec',
    wizardProhibited2: 'tra',
    prestigeSpellLinks: {
      spellwarp_sniper: 'wizard'
    }
  });

  const cl = CombatRules.getEffectiveCasterLevel(pc, 'wizard');
  assert.strictEqual(cl, 11, 'Wizard 6 + Spellwarp Sniper 5 must have effective Caster Level 11');

  const maxSpellLevel = CombatRules.getMaxSpellLevel('wizard', cl);
  assert.strictEqual(maxSpellLevel, 6, 'Caster Level 11 Wizard can cast up to 6th-level spells');

  // Verify spell slots for CL 11 Specialist Wizard with INT 18 (+4 bonus spells: +1 for levels 1, 2, 3, 4)
  const slots = CombatRules.calculateMaxSpellSlots(pc);
  assert.strictEqual(slots[0], 4, 'Level 0 slots: 4');
  assert.strictEqual(slots[1], 6, 'Level 1 slots: 4 base + 1 int + 1 spec = 6');
  assert.strictEqual(slots[2], 6, 'Level 2 slots: 4 base + 1 int + 1 spec = 6');
  assert.strictEqual(slots[3], 6, 'Level 3 slots: 4 base + 1 int + 1 spec = 6');
  assert.strictEqual(slots[4], 5, 'Level 4 slots: 3 base + 1 int + 1 spec = 5');
  assert.strictEqual(slots[5], 3, 'Level 5 slots: 2 base + 0 int + 1 spec = 3');
  assert.strictEqual(slots[6], 2, 'Level 6 slots: 1 base + 0 int + 1 spec = 2');
  assert.strictEqual(slots[7], 0, 'Level 7 slots: 0');
});

test('Spellwarp Sniper - Fallback linking for legacy characters with empty prestigeSpellLinks', () => {
  // Legacy character with prestigeSpellLinks: {}
  const legacyPC = new Combatant({
    classes: [
      { classType: 'ninja', level: 2 },
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    int: new Stat(18),
    wizardSpecialization: 'evo',
    prestigeSpellLinks: {} // Empty object from legacy save
  });

  const cl = CombatRules.getEffectiveCasterLevel(legacyPC, 'wizard');
  assert.strictEqual(cl, 11, 'Should auto-link to wizard and give Caster Level 11 even if prestigeSpellLinks is empty');

  const slots = CombatRules.calculateMaxSpellSlots(legacyPC);
  assert.strictEqual(slots[4], 5, 'Should have 5 slots of level 4');
  assert.strictEqual(slots[5], 3, 'Should have 3 slots of level 5');
  assert.strictEqual(slots[6], 2, 'Should have 2 slots of level 6');
});

test('Legacy Character Import - Auto-recalculates stale spell slots', () => {
  // Simulate Pallash II. imported JSON with stale 0 slots for levels 4-9
  const pallashData = {
    id: 'test-pallash-123',
    name: 'Pallash II.',
    type: 'p',
    classes: [
      { classType: 'ninja', level: 2 },
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    int: { base: 18, modifiers: [] },
    wizardSpecialization: 'evo',
    wizardProhibited1: 'nec',
    wizardProhibited2: 'tra',
    spellSlots: {
      0: { max: 4, used: 0 },
      1: { max: 5, used: 0 },
      2: { max: 5, used: 0 },
      3: { max: 4, used: 0 },
      4: { max: 0, used: 0 }, // Stale
      5: { max: 0, used: 0 }, // Stale
      6: { max: 0, used: 0 }, // Stale
      7: { max: 0, used: 0 },
      8: { max: 0, used: 0 },
      9: { max: 0, used: 0 }
    },
    prestigeSpellLinks: {}
  };

  const combatant = new Combatant(pallashData);
  recalculatePCStats(combatant);

  assert.strictEqual(combatant.spellSlots[4].max, 5, 'Level 4 slots should be recalculated to 5');
  assert.strictEqual(combatant.spellSlots[5].max, 3, 'Level 5 slots should be recalculated to 3');
  assert.strictEqual(combatant.spellSlots[6].max, 2, 'Level 6 slots should be recalculated to 2');
});

test('EncounterManager - mergeIncomingPC refreshes legacy player stats and slots', () => {
  const legacyData = {
    id: 'test-merge-pc',
    name: 'Legacy Mage',
    type: 'p',
    classes: [
      { classType: 'wizard', level: 7 },
      { classType: 'spellwarp_sniper', level: 3 }
    ],
    int: { base: 18, modifiers: [] },
    spellSlots: {
      0: { max: 0, used: 0 },
      1: { max: 0, used: 0 },
      4: { max: 0, used: 0 },
      5: { max: 0, used: 0 }
    }
  };

  mergeIncomingPC(legacyData);
  const state = getState();
  const pc = state.combatants.find(c => c.id === 'test-merge-pc');
  assert.ok(pc, 'PC should be found in state');
  assert.ok(pc.spellSlots[5].max > 0, 'Level 5 slots must be refreshed to > 0 (CL 10)');

  // Clean up
  state.combatants = state.combatants.filter(c => c.id !== 'test-merge-pc');
});

test('Spell Learn Eligibility - Allows current level spells and respects prohibited schools', () => {
  const pc = new Combatant({
    classes: [
      { classType: 'ninja', level: 2 },
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    int: new Stat(18),
    wizardSpecialization: 'evo',
    wizardProhibited1: 'nec',
    wizardProhibited2: 'tra'
  });

  const spellsRegistry = {
    fireball: { id: 'fireball', name: 'Fireball', school: 'evocation', classLevels: [{ class: 'wizard', level: 3 }] },
    ice_storm: { id: 'ice_storm', name: 'Ice Storm', school: 'evocation', classLevels: [{ class: 'wizard', level: 4 }] },
    cone_of_cold: { id: 'cone_of_cold', name: 'Cone of Cold', school: 'evocation', classLevels: [{ class: 'wizard', level: 5 }] },
    chain_lightning: { id: 'chain_lightning', name: 'Chain Lightning', school: 'evocation', classLevels: [{ class: 'wizard', level: 6 }] },
    delayed_blast_fireball: { id: 'delayed_blast_fireball', name: 'Delayed Blast Fireball', school: 'evocation', classLevels: [{ class: 'wizard', level: 7 }] },
    enervation: { id: 'enervation', name: 'Enervation', school: 'necromancy', classLevels: [{ class: 'wizard', level: 4 }] },
    haste: { id: 'haste', name: 'Haste', school: 'transmutation', classLevels: [{ class: 'wizard', level: 3 }] }
  };

  const findSpellFn = (k) => spellsRegistry[k] || null;

  // 1. Level 4, 5, 6 evocation spells should be allowed
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.ice_storm, findSpellFn).allowed, true, 'Ice Storm (4th level) should be learnable');
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.cone_of_cold, findSpellFn).allowed, true, 'Cone of Cold (5th level) should be learnable');
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.chain_lightning, findSpellFn).allowed, true, 'Chain Lightning (6th level) should be learnable');

  // 2. Level 7 spell should be rejected (Caster level 11 max is level 6)
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.delayed_blast_fireball, findSpellFn).allowed, false, '7th level spell should be rejected');

  // 3. Prohibited schools should be rejected
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.enervation, findSpellFn).allowed, false, 'Necromancy should be rejected (prohibited)');
  assert.strictEqual(validateSpellLearnEligibility(pc, spellsRegistry.haste, findSpellFn).allowed, false, 'Transmutation should be rejected (prohibited)');
});

test('Spell Preparation - Correct slot level mapping with Metamagic and Grimoire level filtering', () => {
  const pc = new Combatant({
    classes: [
      { classType: 'wizard', level: 6 },
      { classType: 'spellwarp_sniper', level: 5 }
    ],
    int: new Stat(18)
  });

  // Prepare level 3 spell (Fireball)
  pc.prepareSpell('fireball', []);
  // Prepare metamagic Empowered Fireball (+2 levels -> Level 5 slot)
  pc.prepareSpell('fireball', ['empower_spell']);
  // Prepare Cantrip (Acid Splash)
  pc.prepareSpell('acid_splash', []);

  assert.strictEqual(pc.preparedSpells.length, 3);
  assert.strictEqual(pc.preparedSpells[0].spellKey, 'fireball');
  assert.strictEqual(pc.preparedSpells[1].metamagic[0], 'empower_spell');

  // Verify adjusted spell levels
  const compendium = getAllCompendiumSpells(pc);
  const fireballSpell = compendium.find(s => s.id === 'fireball');
  const acidSplashSpell = compendium.find(s => s.id === 'acid_splash');

  if (fireballSpell) {
    const baseLvl = SpellSlotCalculator.getAdjustedSpellLevel(fireballSpell, [], pc);
    const empoweredLvl = SpellSlotCalculator.getAdjustedSpellLevel(fireballSpell, ['empower_spell'], pc);
    assert.strictEqual(baseLvl, 3, 'Fireball base slot is 3');
    assert.strictEqual(empoweredLvl, 5, 'Empowered Fireball slot is 5');
  }

  if (acidSplashSpell) {
    const cantripLvl = SpellSlotCalculator.getAdjustedSpellLevel(acidSplashSpell, [], pc);
    assert.strictEqual(cantripLvl, 0, 'Acid Splash slot is 0');
  }
});

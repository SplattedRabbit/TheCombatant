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
const spellsPath = path.resolve(__dirname, '../data/spells.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

test('Buff Rules Phase 1 - isBuffEligible checking', () => {
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

test('Buff Rules Phase 1 - Stat Exclusion based on sharedWith', () => {
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

test('Buff Rules Phase 1 - Attack/Damage context target exclusion', () => {
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

test('Buff Rules Phase 1 - Spell Buff Eligibility for Cleric/Druid/Fighter without learnedSpells', () => {
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

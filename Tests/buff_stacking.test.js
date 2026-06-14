// Tests/buff_stacking.test.js - Verify D&D 3.5e RAW Buff & Aura stacking rules
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { Weapon } from '../js/models/Weapon.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { CombatSpells } from '../js/spells.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

test('Buff Stacking - Custom Buff Modifiers on Attributes (Step 1.1)', () => {
  const pc = new Combatant({
    name: 'Test Hero',
    type: 'p',
    str: 10,
    activeBuffs: []
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 10, 'Base strength should be 10');

  // Add a custom enhancement buff (+4 Strength)
  pc.activeBuffs.push({
    id: 'bull_strength_custom',
    name: 'Stärke des Stiers (Custom)',
    effects: [
      { target: 'str', value: 4, type: 'enhancement', source: 'Stärke des Stiers (Custom)' }
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 14, 'Strength should be 14 after first enhancement buff');

  // Add a second enhancement buff (+2 Strength). These should NOT stack.
  pc.activeBuffs.push({
    id: 'weaker_strength_custom',
    name: 'Schwächere Stärke (Custom)',
    effects: [
      { target: 'str', value: 2, type: 'enhancement', source: 'Schwächere Stärke (Custom)' }
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 14, 'Strength should remain 14 (enhancement modifiers do not stack)');

  // Add an untyped bonus (+2 Strength). This SHOULD stack.
  pc.activeBuffs.push({
    id: 'untyped_strength_custom',
    name: 'Untypisierte Kraft (Custom)',
    effects: [
      { target: 'str', value: 2, type: 'untyped', source: 'Untypisierte Kraft (Custom)' }
    ]
  });

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.str.getValue(), 16, 'Strength should be 16 (untyped stacks with enhancement)');
});

test('Buff Stacking - Custom Buff Modifiers on Armor Class (Step 1.1)', () => {
  const pc = new Combatant({
    name: 'Test Dodger',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    autoAC: true,
    activeBuffs: []
  });

  // Add two Shield-type bonuses (e.g. Shield spell +4 and a minor shield +2)
  pc.activeBuffs.push(
    {
      id: 'shield_spell',
      name: 'Schildzauber',
      effects: [{ target: 'acShield', value: 4, type: 'shield', source: 'Schildzauber' }]
    },
    {
      id: 'minor_shield',
      name: 'Kleiner Schild',
      effects: [{ target: 'acShield', value: 2, type: 'shield', source: 'Kleiner Schild' }]
    }
  );

  pc.rebuildStatModifiers();
  // Shield modifiers do not stack. Only the highest (+4) applies.
  assert.strictEqual(pc.ac.getValue(), 14, 'AC should be 14 (only highest shield bonus applies)');
  assert.strictEqual(pc.acFlat.getValue(), 14, 'Flat-footed AC should include shield bonus');
  assert.strictEqual(pc.acTouch.getValue(), 10, 'Touch AC should NOT include shield bonus');

  // Add two Dodge-type bonuses (+1 and +2). Dodge bonuses ALWAYS stack.
  pc.activeBuffs.push(
    {
      id: 'dodge_1',
      name: 'Ausweichen 1',
      effects: [{ target: 'acDodge', value: 1, type: 'dodge', source: 'Ausweichen 1' }]
    },
    {
      id: 'dodge_2',
      name: 'Ausweichen 2',
      effects: [{ target: 'acDodge', value: 2, type: 'dodge', source: 'Ausweichen 2' }]
    }
  );

  pc.rebuildStatModifiers();
  // Total AC = 10 (base) + 4 (shield) + 1 (dodge) + 2 (dodge) = 17
  assert.strictEqual(pc.ac.getValue(), 17, 'AC should be 17 (dodge bonuses stack additively)');
  assert.strictEqual(pc.acTouch.getValue(), 13, 'Touch AC should include both dodge bonuses (+3)');
  assert.strictEqual(pc.acFlat.getValue(), 14, 'Flat-footed AC should NOT include dodge bonuses');
});

test('Buff Stacking - Attack Roll Buffs in AttackEngine (Step 1.2 & 1.3)', () => {
  const pc = new Combatant({
    name: 'Test Fighter',
    type: 'p',
    activeBuffs: []
  });
  pc.bab.base = 5;
  pc.str = 10; // +0 mod

  const sword = new Weapon({ name: 'Langschwert', gripOverride: '1h' });
  pc.weapons = [sword];

  // 1. Without buffs
  const seqNormal = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seqNormal[0].atkTotal, 5, 'Base attack should be 5');

  // 2. Add Bless (morale: +1)
  pc.activeBuffs.push({ spellKey: 'bless' });
  const seqBless = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seqBless[0].atkTotal, 6, 'Attack should be 6 after Bless (+1 morale)');

  // 3. Add Haste (dodge: +1) -> should stack with Morale
  pc.activeBuffs.push({ spellKey: 'haste' });
  const seqHaste = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seqHaste[0].atkTotal, 7, 'Attack should be 7 after Bless and Haste (+1 morale + 1 dodge)');

  // 4. Add custom Morale attack buff (+2 morale). This should override Bless (+1 morale).
  pc.activeBuffs.push({
    id: 'morale_higher',
    name: 'Höherer Moralbonus',
    effects: [
      { target: 'atk', value: 2, type: 'morale', source: 'Höherer Moralbonus' }
    ]
  });

  const seqHigherMorale = AttackEngine.calculateAttackSequence(pc, sword, false);
  // Total atk = 5 (base) + 2 (morale_higher) + 1 (haste) = 8
  assert.strictEqual(seqHigherMorale[0].atkTotal, 8, 'Attack should be 8 (highest morale + dodge)');
});

test('Buff Stacking - Damage Roll Buffs in AttackEngine (Step 1.2 & 1.3)', () => {
  const pc = new Combatant({
    name: 'Test Striker',
    type: 'p',
    activeBuffs: []
  });
  pc.bab.base = 1;
  pc.str = 10; // +0 mod

  const sword = new Weapon({ name: 'Langschwert', gripOverride: '1h' });
  pc.weapons = [sword];

  // 1. Add Prayer (+1 luck on damage)
  // Let's create a custom buff since standard prayer in spells_de.json doesn't have dmg target
  pc.activeBuffs.push({
    id: 'prayer_custom',
    name: 'Gebet (Custom)',
    effects: [
      { target: 'dmg', value: 1, type: 'luck', source: 'Gebet (Custom)' }
    ]
  });

  const seq1 = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seq1[0].dmgTotal, 1, 'Damage should receive +1 luck bonus');

  // 2. Add another luck bonus on damage (+2 luck). They should NOT stack.
  pc.activeBuffs.push({
    id: 'luck_higher',
    name: 'Höherer Glücksbonus',
    effects: [
      { target: 'dmg', value: 2, type: 'luck', source: 'Höherer Glücksbonus' }
    ]
  });

  const seq2 = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seq2[0].dmgTotal, 2, 'Damage should receive +2 (highest luck bonus)');

  // 3. Add an untyped bonus on damage (+3 untyped). This SHOULD stack.
  pc.activeBuffs.push({
    id: 'untyped_dmg',
    name: 'Untypisierter Schadensbonus',
    effects: [
      { target: 'dmg', value: 3, type: 'untyped', source: 'Untypisierter Schadensbonus' }
    ]
  });

  const seq3 = AttackEngine.calculateAttackSequence(pc, sword, false);
  // Total damage bonus = 2 (luck_higher) + 3 (untyped) = 5
  assert.strictEqual(seq3[0].dmgTotal, 5, 'Damage should receive +5 (highest luck + untyped)');
});

test('Buff Stacking - No double-application for buffs with both spellKey and effects (Step 1.1 & 1.2)', () => {
  const pc = new Combatant({
    name: 'Test double-apply',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    autoAC: true,
    str: 10,
    bab: 5,
    activeBuffs: [
      {
        id: 'spell_haste_test',
        spellKey: 'haste',
        name: 'Hast',
        effects: [
          { target: 'atk', value: 1, type: 'dodge', source: 'Hast' },
          { target: 'acDodge', value: 1, type: 'dodge', source: 'Hast' }
        ]
      }
    ]
  });

  pc.rebuildStatModifiers();

  // 1. Check AC Touch (should only have +1 dodge from haste, not +2)
  assert.strictEqual(pc.acTouch.getValue(), 11, 'Touch AC should be 11 (haste only applied once)');

  // 2. Check Attack Engine (should only have +1 dodge from haste, not +2)
  const sword = new Weapon({ name: 'Langschwert', gripOverride: '1h' });
  pc.weapons = [sword];
  const seq = AttackEngine.calculateAttackSequence(pc, sword, false);
  assert.strictEqual(seq[0].atkTotal, 6, 'Attack total should be 6 (haste applied once)');
});

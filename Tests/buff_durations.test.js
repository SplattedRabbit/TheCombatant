// Tests/buff_durations.test.js - Verify Buff Duration & Scaling Calculation Rules
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { CombatSpells } from '../js/spells.js';
import { tickConditionTimers } from '../js/state/EncounterManager.js';
import { getState } from '../js/state.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

// Import/define the resolver locally or test it if exported
// We'll define a quick resolver in PCDefenses.js and can check it there, 
// but we also want to test EncounterManager's round ticking.

test('Buff Durations - Ticking Buffs in EncounterManager', () => {
  const pc = new Combatant({
    id: 'pc_test_duration',
    name: 'Duration Hero',
    type: 'p',
    activeBuffs: [
      {
        id: 'buff_haste_test',
        spellKey: 'haste',
        name: 'Hast',
        durationFormula: '1 round/level',
        casterLevel: 5,
        durationMaxRounds: 5,
        durationRemainingRounds: 3,
        effects: [
          { target: 'atk', value: 1, type: 'dodge', source: 'Hast' }
        ]
      },
      {
        id: 'buff_infinite_test',
        spellKey: 'mage_armor',
        name: 'Magierrüstung',
        durationFormula: '1 hour/level',
        casterLevel: 5,
        durationMaxRounds: 3000,
        durationRemainingRounds: null, // infinite or untracked
        effects: [
          { target: 'acArmor', value: 4, type: 'armor', source: 'Magierrüstung' }
        ]
      },
      {
        id: 'buff_expiring_test',
        spellKey: 'bless',
        name: 'Segen',
        durationFormula: '1 min./level',
        casterLevel: 1,
        durationMaxRounds: 10,
        durationRemainingRounds: 1, // Will expire on next tick
        effects: [
          { target: 'atk', value: 1, type: 'morale', source: 'Segen' }
        ]
      }
    ]
  });

  // Put combatant in state to mock EncounterManager
  const state = getState();
  state.combatants = [pc];

  pc.rebuildStatModifiers();
  assert.strictEqual(pc.activeBuffs.length, 3, 'Should start with 3 buffs');
  assert.strictEqual(pc.activeBuffs.find(b => b.spellKey === 'haste').durationRemainingRounds, 3);

  // Tick 1
  tickConditionTimers();
  assert.strictEqual(pc.activeBuffs.length, 2, 'One buff should have expired (Segen, which had 1 round remaining)');
  assert.strictEqual(pc.activeBuffs.find(b => b.spellKey === 'haste').durationRemainingRounds, 2, 'Haste should have decremented to 2');
  assert.strictEqual(pc.activeBuffs.find(b => b.spellKey === 'mage_armor').durationRemainingRounds, null, 'Mage Armor should remain null (infinite)');

  // Tick 2
  tickConditionTimers();
  assert.strictEqual(pc.activeBuffs.length, 2, 'Still 2 buffs');
  assert.strictEqual(pc.activeBuffs.find(b => b.spellKey === 'haste').durationRemainingRounds, 1, 'Haste should have decremented to 1');

  // Tick 3 (Haste expires)
  tickConditionTimers();
  assert.strictEqual(pc.activeBuffs.length, 1, 'Haste should have expired');
  assert.strictEqual(pc.activeBuffs[0].spellKey, 'mage_armor', 'Only Mage Armor should remain');
});

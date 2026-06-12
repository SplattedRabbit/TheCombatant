import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { CombatSpells } from '../js/spells.js';
import { activateBuffByKey } from '../js/ui/components/player/PCBuffsTab.js';
import { getState, getActivePC } from '../js/state.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells_de.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Setup global prompt/confirm auto-clicker interceptor
const originalCreateElement = globalThis.document.createElement;
let confirmTriggered = false;

globalThis.document.createElement = (tagName) => {
  const el = originalCreateElement.call(globalThis.document, tagName);
  if (tagName === 'div') {
    Object.defineProperty(el, 'id', {
      set(val) {
        this._id = val;
        if (val === 'customPromptOverlay') {
          console.log("DEBUG: customPromptOverlay instantiated");
          // Auto click Speichern for prompts
          setTimeout(() => {
            const okBtn = this.querySelector('.pc-prompt-ok-btn');
            console.log("DEBUG: prompt okBtn found:", !!okBtn);
            if (okBtn && typeof okBtn.onclick === 'function') {
              okBtn.onclick();
            }
          }, 2);
        } else if (val === 'customConfirmOverlay') {
          console.log("DEBUG: customConfirmOverlay instantiated");
          confirmTriggered = true;
          // Auto click Yes for confirms
          setTimeout(() => {
            const yesBtn = this.querySelector('.pc-confirm-yes-btn');
            console.log("DEBUG: confirm yesBtn found:", !!yesBtn);
            if (yesBtn && typeof yesBtn.onclick === 'function') {
              yesBtn.onclick();
            }
          }, 2);
        }
      },
      get() {
        return this._id;
      },
      configurable: true
    });
  }
  return el;
};

test('Spell Buff Phase 2 - Prepared caster slot deduction', async () => {
  const pc = new Combatant({
    id: 'pc_prep_test',
    name: 'Prepared Mage',
    type: 'p',
    classes: [{ classType: 'wizard', level: 5 }],
    preparedSpells: [
      {
        id: 'prep_bulls_strength',
        spellKey: 'bulls_strength',
        metamagic: [],
        isUsed: false
      }
    ],
    spellSlots: {
      2: { max: 3, used: 0 }
    }
  });

  const state = getState();
  state.combatants = [pc];

  confirmTriggered = false;
  // Activate buff
  activateBuffByKey(pc, 'bulls_strength', false);

  await sleep(100);

  // Check that prepared spell was consumed
  assert.strictEqual(pc.preparedSpells[0].isUsed, true, 'Prepared spell should be marked used');
  assert.strictEqual(pc.spellSlots[2].used, 1, 'Spell slot used should be incremented');
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be active');
  assert.strictEqual(pc.activeBuffs[0].spellKey, 'bulls_strength');
});

test('Spell Buff Phase 2 - Spontaneous caster slot deduction', async () => {
  const pc = new Combatant({
    id: 'pc_spon_test',
    name: 'Sorcerer',
    type: 'p',
    classes: [{ classType: 'sorcerer', level: 6 }],
    learnedSpells: ['bulls_strength'],
    spellSlots: {
      2: { max: 4, used: 0 }
    }
  });

  const state = getState();
  state.combatants = [pc];

  confirmTriggered = false;
  // Activate buff
  activateBuffByKey(pc, 'bulls_strength', false);

  await sleep(100);

  // Check that spontaneous slot was consumed
  assert.strictEqual(pc.spellSlots[2].used, 1, 'Spontaneous spell slot should be consumed');
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be active');
});

test('Spell Buff Phase 2 - No slots available confirmation override', async () => {
  const pc = new Combatant({
    id: 'pc_no_slots_test',
    name: 'OOM Mage',
    type: 'p',
    classes: [{ classType: 'wizard', level: 5 }],
    preparedSpells: [], // no prepared spells
    spellSlots: {
      2: { max: 2, used: 2 } // all slots used
    }
  });

  const state = getState();
  state.combatants = [pc];

  confirmTriggered = false;

  // Activate buff (should trigger confirm dialog)
  activateBuffByKey(pc, 'bulls_strength', false);

  await sleep(100);

  assert.strictEqual(confirmTriggered, true, 'Confirm dialog should have been triggered');
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be active anyway due to override confirmation');
  assert.strictEqual(pc.spellSlots[2].used, 2, 'Slots should not be further deducted');
});

// Restore createElement after all tests in this file run
test('Spell Buff Phase 2 - Teardown', () => {
  globalThis.document.createElement = originalCreateElement;
});

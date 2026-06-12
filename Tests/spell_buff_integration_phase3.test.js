import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { CombatSpells } from '../js/spells.js';
import { getState } from '../js/state.js';
import { bindSpellsEvents } from '../js/ui/components/player/PCSpellsTabHandlers.js';
import { showCastSpontaneousSpellDialog } from '../js/ui/dialogs/PrepareSpellDialog.js';

// Setup spell registry from spells_de.json to mimic the runtime app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.resolve(__dirname, '../data/spells_de.json');
const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
Object.assign(CombatSpells.REGISTRY, spellsData);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const originalCreateElement = globalThis.document.createElement;
let castSuccessOverlay = null;
let spontaneousOverlay = null;

// Mock checkboxes and inputs
let mockSelfChk = null;
let mockAllyChk = null;
let mockClInput = null;
let mockExtendChk = null;

globalThis.document.createElement = (tagName) => {
  const el = originalCreateElement.call(globalThis.document, tagName);
  
  // Add closest method to all created mock elements
  el.closest = function(selector) {
    const cleanSelector = selector.trim();
    if (cleanSelector.startsWith('.')) {
      const cls = cleanSelector.slice(1);
      const classes = cls.split(',').map(s => {
        const trimmed = s.trim();
        return trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
      });
      if (classes.some(c => this.className && this.className.includes(c))) {
        return this;
      }
    } else if (cleanSelector.toLowerCase() === this.tagName.toLowerCase()) {
      return this;
    }
    return null;
  };

  if (tagName === 'div') {
    Object.defineProperty(el, 'id', {
      set(val) {
        this._id = val;
        if (val === 'castSpontaneousSpellOverlay') {
          console.log("DEBUG: castSpontaneousSpellOverlay instantiated");
          spontaneousOverlay = this;
          
          mockExtendChk = originalCreateElement.call(globalThis.document, 'input');
          mockExtendChk.className = 'cast-meta-chk';
          mockExtendChk.dataset = { id: 'extend_spell', cost: '1' };
          mockExtendChk.checked = false;
          
          this.querySelectorAll = (selector) => {
            if (selector === '.cast-meta-chk') {
              return [mockExtendChk];
            }
            if (selector === '.cast-meta-chk:checked') {
              return mockExtendChk.checked ? [mockExtendChk] : [];
            }
            return [];
          };
          this.querySelector = (selector) => {
            if (selector === '.cast-meta-chk[data-id="extend_spell"]') {
              return mockExtendChk;
            }
            if (selector === '.cast-confirm-btn') {
              if (!this._confirmBtn) this._confirmBtn = originalCreateElement.call(globalThis.document, 'button');
              this._confirmBtn.className = 'cast-confirm-btn';
              return this._confirmBtn;
            }
            if (selector === '#finalCastLevelText') {
              if (!this._finalText) this._finalText = originalCreateElement.call(globalThis.document, 'span');
              return this._finalText;
            }
            if (selector === '#spontaneousTimeWarning') {
              if (!this._warning) this._warning = originalCreateElement.call(globalThis.document, 'div');
              return this._warning;
            }
            return originalCreateElement.call(globalThis.document, 'div');
          };
        } else if (val === 'castSuccessDialogOverlay') {
          console.log("DEBUG: castSuccessDialogOverlay instantiated");
          castSuccessOverlay = this;

          mockSelfChk = originalCreateElement.call(globalThis.document, 'input');
          mockSelfChk.className = 'cast-target-chk';
          mockSelfChk.value = 'self';
          mockSelfChk.checked = true;

          mockAllyChk = originalCreateElement.call(globalThis.document, 'input');
          mockAllyChk.className = 'cast-target-chk';
          mockAllyChk.value = 'ally';
          mockAllyChk.checked = false;

          mockClInput = originalCreateElement.call(globalThis.document, 'input');
          mockClInput.className = 'cast-cl-input';
          mockClInput.value = '1';

          this.querySelectorAll = (selector) => {
            if (selector === '.cast-target-chk') {
              return [mockSelfChk, mockAllyChk];
            }
            if (selector === '.cast-target-chk:checked') {
              const checked = [];
              if (mockSelfChk.checked) checked.push(mockSelfChk);
              if (mockAllyChk.checked) checked.push(mockAllyChk);
              return checked;
            }
            return [];
          };

          this.querySelector = (selector) => {
            if (selector === '.cast-cl-input') {
              return mockClInput;
            }
            if (selector === '.apply-buff-btn') {
              if (!this._applyBtn) this._applyBtn = originalCreateElement.call(globalThis.document, 'button');
              this._applyBtn.className = 'apply-buff-btn';
              return this._applyBtn;
            }
            if (selector === '.close-dialog-btn') {
              if (!this._closeBtn) this._closeBtn = originalCreateElement.call(globalThis.document, 'button');
              this._closeBtn.className = 'close-dialog-btn';
              return this._closeBtn;
            }
            return originalCreateElement.call(globalThis.document, 'div');
          };
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

test('Spell Buff Phase 3 - Prepared Cast prompts Dialog & Applies Buff locally', async () => {
  const pc = new Combatant({
    id: 'pc_prep_caster',
    name: 'Prepared Wizard',
    type: 'p',
    classes: [{ classType: 'wizard', level: 7 }],
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

  castSuccessOverlay = null;

  // Simulate clicking the cast prepared spell button via bubbling click simulation
  const container = document.createElement('div');
  bindSpellsEvents(pc, container, () => {});

  const btn = document.createElement('button');
  btn.className = 'cast-prepared-btn';
  btn.dataset.id = 'prep_bulls_strength';

  container.onclick({
    target: btn,
    preventDefault() {},
    stopPropagation() {}
  });

  await sleep(100);

  assert.ok(castSuccessOverlay, 'Cast success dialog should be instantiated');
  
  // Set values on mocked inputs
  mockSelfChk.value = pc.id;
  mockSelfChk.checked = true;
  mockAllyChk.value = 'other_id';
  mockAllyChk.checked = false;
  mockClInput.value = '7';

  // Click apply
  const applyBtn = castSuccessOverlay.querySelector('.apply-buff-btn');
  applyBtn.click();

  await sleep(100);

  // Check activeBuffs
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be added to activeBuffs');
  const activeB = pc.activeBuffs[0];
  assert.strictEqual(activeB.spellKey, 'bulls_strength');
  assert.strictEqual(activeB.casterLevel, 7);
  assert.strictEqual(activeB.durationRemainingRounds, 70, 'Bull strength duration is 1 min./lvl = 10 rounds/lvl = 70 rounds');
  assert.deepStrictEqual(activeB.sharedWith, [pc.id], 'Target list should contain pc ID');
});

test('Spell Buff Phase 3 - Spontaneous Cast with Metamagic (Extend Spell) doubles duration', async () => {
  const pc = new Combatant({
    id: 'pc_spon_caster',
    name: 'Sorcerer with Metamagic',
    type: 'p',
    classes: [{ classType: 'sorcerer', level: 8 }],
    feats: [{ id: 'extend_spell' }],
    learnedSpells: ['bulls_strength'],
    spellSlots: {
      3: { max: 3, used: 0 } // Bull strength is level 2, extended it becomes level 3
    }
  });

  const state = getState();
  state.combatants = [pc];

  castSuccessOverlay = null;
  spontaneousOverlay = null;

  // Show spontaneous casting dialog
  showCastSpontaneousSpellDialog(pc, 'bulls_strength', () => {});

  await sleep(50);
  assert.ok(spontaneousOverlay, 'Spontaneous cast dialog should show');

  // Check the Extend Spell checkbox
  mockExtendChk.checked = true;
  if (typeof mockExtendChk.onchange === 'function') {
    mockExtendChk.onchange(); // trigger final level update
  }

  // Click confirm cast spontaneous spell
  const confirmBtn = spontaneousOverlay.querySelector('.cast-confirm-btn');
  confirmBtn.click();

  await sleep(100);

  assert.ok(castSuccessOverlay, 'Cast success dialog should show after spontaneous cast confirmation');

  // Set values on mocked inputs
  mockSelfChk.value = pc.id;
  mockSelfChk.checked = true;
  mockClInput.value = '8';

  // Click apply
  const applyBtn = castSuccessOverlay.querySelector('.apply-buff-btn');
  applyBtn.click();

  await sleep(100);

  // Check slot and buff duration
  assert.strictEqual(pc.spellSlots[3].used, 1, 'Grade 3 spontaneous slot should be used');
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be added to activeBuffs');
  const activeB = pc.activeBuffs[0];
  // Duration: 8 level * 10 rounds/lvl = 80 rounds. Extended should be 160 rounds.
  assert.strictEqual(activeB.durationRemainingRounds, 160, 'Duration should be doubled due to Extend Spell');
});

test('Spell Buff Phase 3 - Targeting Allies only excludes Caster stats', async () => {
  const pc = new Combatant({
    id: 'caster_pc',
    name: 'Caster',
    type: 'p',
    classes: [{ classType: 'wizard', level: 5 }],
    preparedSpells: [
      {
        id: 'prep_bulls_strength_ally',
        spellKey: 'bulls_strength',
        metamagic: [],
        isUsed: false
      }
    ],
    spellSlots: {
      2: { max: 3, used: 0 }
    },
    // base stats
    str: { base: 10, value: 10 }
  });

  const ally = new Combatant({
    id: 'ally_pc',
    name: 'Ally',
    type: 'p',
    classes: [{ classType: 'fighter', level: 5 }]
  });

  const state = getState();
  state.combatants = [pc, ally];

  castSuccessOverlay = null;

  // Simulate cast
  const container = document.createElement('div');
  bindSpellsEvents(pc, container, () => {});
  
  const btn = document.createElement('button');
  btn.className = 'cast-prepared-btn';
  btn.dataset.id = 'prep_bulls_strength_ally';

  container.onclick({
    target: btn,
    preventDefault() {},
    stopPropagation() {}
  });

  await sleep(100);

  assert.ok(castSuccessOverlay, 'Success dialog should open');

  // Deselect self, select ally
  mockSelfChk.value = pc.id;
  mockSelfChk.checked = false;
  
  mockAllyChk.value = ally.id;
  mockAllyChk.checked = true;
  
  mockClInput.value = '5';

  // Click apply
  const applyBtn = castSuccessOverlay.querySelector('.apply-buff-btn');
  applyBtn.click();

  await sleep(100);

  // Caster should have the active buff tracked
  assert.strictEqual(pc.activeBuffs.length, 1, 'Buff should be tracked on caster');
  assert.deepStrictEqual(pc.activeBuffs[0].sharedWith, [ally.id], 'Buff sharedWith should target only ally');

  // Recalculate stats mimicking SpellModifierApplier
  pc.str.value = pc.str.base; // reset
  pc.str.modifiers = [];
  pc.activeBuffs.forEach(buff => {
    if (buff.sharedWith && !buff.sharedWith.includes(pc.id)) {
      return;
    }
    buff.effects.forEach(eff => {
      if (eff.target === 'str') {
        pc.str.modifiers.push({ value: eff.value, type: eff.type, source: eff.source });
      }
    });
  });

  let finalStr = pc.str.base;
  const maxEnhancement = pc.str.modifiers.filter(m => m.type === 'enhancement').reduce((max, m) => Math.max(max, m.value), 0);
  finalStr += maxEnhancement;

  assert.strictEqual(finalStr, 10, 'Caster STR should remain 10 since buff was cast on Ally only');
});

test('Spell Buff Phase 3 - Teardown', () => {
  globalThis.document.createElement = originalCreateElement;
});

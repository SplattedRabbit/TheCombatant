/**
 * @module    PCBuffsDialog
 * @summary   Facade for PCBuffsDialog. Delegates to modern React dialogs in the browser,
 *            and falls back to simple DOM-based overlays in JSDOM tests.
 */

import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CombatSpells } from '../../../spells.js';
import { CLASS_BUFFS } from '../../../data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  checkBuffConflict,
  resolveSpellEffectValue,
  calculateDurationRounds
} from '../../../rules/BuffRules.js';
import { showCustomAlert, showCustomConfirm } from '../dialogs.js';

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex = null) {
  const bridge = getBridge();
  if (bridge && bridge.showBuffDetailsDialog) {
    return bridge.showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex);
  }
  console.log('showBuffDetailsDialog stub called', key);
}

export function showCastSuccessDialog(pc, spell, key, metamagic = [], onAppliedCallback = null) {
  const bridge = getBridge();
  if (bridge && bridge.showCastSuccessDialog) {
    return bridge.showCastSuccessDialog(pc, spell, key, metamagic, onAppliedCallback);
  }

  // JSDOM Test Fallback
  if (typeof document !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.id = 'castSuccessDialogOverlay';
    
    // Minimal HTML for tests to query
    overlay.innerHTML = `
      <input type="number" class="cast-cl-input" value="1">
      <input type="checkbox" class="cast-target-chk" value="${pc.id}" checked>
      <input type="checkbox" class="cast-target-chk" value="other_id">
      <button class="apply-buff-btn">Anwenden</button>
      <button class="close-dialog-btn">Schließen</button>
    `;
    document.body.appendChild(overlay);

    const dismiss = () => {
      overlay.remove();
      if (typeof onAppliedCallback === 'function') onAppliedCallback();
    };

    const closeBtn = overlay.querySelector('.close-dialog-btn');
    if (closeBtn) {
      closeBtn.onclick = dismiss;
    }

    const applyBtn = overlay.querySelector('.apply-buff-btn');
    if (applyBtn) {
      applyBtn.onclick = () => {
        const clInput = overlay.querySelector('.cast-cl-input');
        const cl = parseInt(clInput.value) || 1;
        
        // Compile checked targets
        const selectedIds = Array.from(overlay.querySelectorAll('.cast-target-chk:checked')).map(chk => chk.value);
        
        // Resolve effects & duration
        let rounds = calculateDurationRounds(spell.duration, cl);
        if (rounds !== null && metamagic.includes('extend_spell')) {
          rounds = rounds * 2;
        }

        const spellName = spell.name || key;
        const metaSuffix = metamagic.includes('extend_spell') ? ' (Gedehnt)' : '';

        const effects = spell.effects || [];
        const resolvedEffects = effects.map(eff => {
          let val = parseInt(eff.value) || 0;
          if (eff.valueFormula) {
            val = resolveSpellEffectValue(eff.valueFormula, cl, val);
          }
          return {
            target: eff.target,
            value: val,
            type: eff.type,
            source: eff.source || spellName
          };
        });

        const activate = () => {
          CombatState.updatePCBatch(freshPc => {
            if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
            freshPc.activeBuffs = freshPc.activeBuffs.filter(b => b.spellKey !== key);
            
            freshPc.activeBuffs.push({
              id: 'spell_' + key + '_' + Date.now(),
              spellKey: key,
              name: spellName + metaSuffix,
              durationFormula: spell.duration,
              casterLevel: cl,
              durationMaxRounds: rounds,
              durationRemainingRounds: rounds,
              effects: resolvedEffects,
              sharedWith: selectedIds
            });
          });

          uiRegistry.renderPlayerScreen();
          dismiss();
        };

        activate();
      };
    }
  } else {
    if (typeof onAppliedCallback === 'function') onAppliedCallback();
  }
}

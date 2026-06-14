/**
 * @module    PrepareSpellDialog
 * @summary   Facade/test fallback for PrepareSpellDialog. Delegates to React bridge at runtime,
 *            falls back to JSDOM-compatible DOM in tests.
 */

import { CombatSpells, findSpell } from '../../spells.js';
import { CombatState } from '../../state.js';
import { showCastSuccessDialog } from '../components/player/PCBuffsDialog.js';

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showPrepareSpellDialog(pc, classKey, onComplete) {
  const bridge = getBridge();
  if (bridge && bridge.showPrepareSpellDialog) {
    return bridge.showPrepareSpellDialog(pc, classKey, onComplete);
  }
  if (onComplete) onComplete();
}

export function showCastSpontaneousSpellDialog(pc, spellKey, onSaveCallback) {
  const bridge = getBridge();
  if (bridge && bridge.showCastSpontaneousSpellDialog) {
    return bridge.showCastSpontaneousSpellDialog(pc, spellKey, onSaveCallback);
  }

  // JSDOM Test Fallback
  const spell = findSpell(pc, spellKey);
  if (!spell) return;

  if (typeof document !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.id = 'castSpontaneousSpellOverlay';
    
    // Mock metamagic and buttons
    overlay.innerHTML = `
      <input type="checkbox" class="cast-meta-chk" data-id="extend_spell" data-cost="1">
      <span id="finalCastLevelText">Grad ${spell.level}</span>
      <div id="spontaneousTimeWarning" style="display:none;">Warning</div>
      <button class="cast-confirm-btn">Wirken</button>
      <button class="cast-cancel-btn">Abbrechen</button>
    `;
    document.body.appendChild(overlay);

    const dismiss = () => {
      overlay.remove();
    };

    const confirmBtn = overlay.querySelector('.cast-confirm-btn');
    const cancelBtn = overlay.querySelector('.cast-cancel-btn');
    
    if (cancelBtn) cancelBtn.onclick = dismiss;

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        let cost = 0;
        const selectedMetaIds = [];
        overlay.querySelectorAll('.cast-meta-chk:checked').forEach(chk => {
          cost += parseInt(chk.dataset.cost) || 0;
          selectedMetaIds.push(chk.dataset.id);
        });
        const finalLevel = spell.level + cost;
        
        pc.castSpontaneousSpell(spellKey, finalLevel);
        CombatState.saveToStorage();
        CombatState.syncPCToHost();

        // Show Cast Success Dialog (which will add the buff and trigger onSaveCallback)
        showCastSuccessDialog(pc, spell, spellKey, selectedMetaIds, onSaveCallback);
        dismiss();
      };
    }
  } else {
    pc.castSpontaneousSpell(spellKey, spell.level);
    showCastSuccessDialog(pc, spell, spellKey, [], onSaveCallback);
  }
}

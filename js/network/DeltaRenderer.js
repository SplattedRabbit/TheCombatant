import { uiRegistry } from '../ui/ui-shared.js';
import { getState } from '../state/state-core.js';

/**
 * Focus-Preservation Engine (Focus Guard)
 * Protects user's active keyboard focus and cursor position during DOM updates.
 */
export function applyWithFocusGuard(applyFn) {
  const activeEl = document.activeElement;
  const activeId = activeEl ? activeEl.id : null;
  const activeName = activeEl ? activeEl.name : null;
  
  // Also track selectors as fallback if ID is not available
  let selector = null;
  if (activeEl && !activeId) {
    if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
      const type = activeEl.getAttribute('type');
      const placeholder = activeEl.getAttribute('placeholder');
      selector = `${activeEl.tagName.toLowerCase()}${type ? `[type="${type}"]` : ''}${placeholder ? `[placeholder="${placeholder}"]` : ''}`;
    }
  }

  let selectionStart = null;
  let selectionEnd = null;
  
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    try {
      selectionStart = activeEl.selectionStart;
      selectionEnd = activeEl.selectionEnd;
    } catch (e) {
      // Some inputs like number/email might throw an error on selectionStart
    }
  }

  // Execute the DOM rendering/update
  applyFn();

  // Try to restore focus
  let restoredEl = null;
  if (activeId) {
    restoredEl = document.getElementById(activeId);
  } else if (activeName) {
    restoredEl = document.querySelector(`[name="${activeName}"]`);
  } else if (selector) {
    // If multiple matching elements exist, we might not get the exact one, but it is a good fallback
    restoredEl = document.querySelector(selector);
  }

  if (restoredEl) {
    try {
      restoredEl.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        restoredEl.setSelectionRange(selectionStart, selectionEnd);
      }
    } catch (e) {
      // Ignore focus restoration errors
    }
  }
}

/**
 * DeltaRenderer
 * Selective rendering wrappers to update sections of the UI without full app destruction
 */
export const DeltaRenderer = {
  /**
   * Relative updates for Combatant HP (fast inline DOM update)
   */
  updateCombatantHP(id) {
    applyWithFocusGuard(() => {
      // Find HP input or display element in the DOM
      // Initiative Tracker row HP input field: id format is usually `hp-${id}`
      const hpInput = document.getElementById(`hp-${id}`) || document.querySelector(`[data-combatant-id="${id}"] .hp-display`);
      if (hpInput) {
        const state = getState();
        const combatant = state.combatants.find(c => c.id === id);
        if (combatant) {
          if (hpInput.tagName === 'INPUT') {
            hpInput.value = combatant.hp;
          } else {
            hpInput.textContent = combatant.hp;
          }
        }
      } else {
        // Fallback: Redraw initiative tracker panel if direct element not found
        if (uiRegistry.renderInitBar) {
          uiRegistry.renderInitBar();
        }
      }
    });
  },

  /**
   * Updates name/stats for a specific combatant in UI
   */
  updateCombatantNameAndStats(id, diff) {
    applyWithFocusGuard(() => {
      const state = getState();
      if (state.session && state.session.role === 'host') {
        if (uiRegistry.renderAll) uiRegistry.renderAll();
      } else {
        if (uiRegistry.renderPlayerScreen) uiRegistry.renderPlayerScreen();
      }
    });
  },

  /**
   * Applies generalized Board Diff and triggers minimal panel updates
   */
  applyBoardDiffUI(diff) {
    applyWithFocusGuard(() => {
      const keys = Object.keys(diff);
      
      const hasMetaChanges = keys.some(k => k.startsWith('meta'));
      const hasCombatantChanges = keys.some(k => k.startsWith('combatants'));
      const hasTurnChanges = keys.some(k => k === 'turn' || k === 'round');
      const hasConcentrationChanges = keys.some(k => k.startsWith('concentrations'));

      const state = getState();
      
      // If we are on client view, we just need to redraw our player screen or the tracker bar
      if (state.session && state.session.role === 'client') {
        if (hasCombatantChanges || hasTurnChanges) {
          if (uiRegistry.renderInitBar) uiRegistry.renderInitBar();
          if (uiRegistry.renderPlayerScreen) uiRegistry.renderPlayerScreen();
        }
        if (hasConcentrationChanges) {
          if (uiRegistry.renderConc) uiRegistry.renderConc();
        }
        return;
      }

      // Host view selective rendering
      if (hasTurnChanges || hasCombatantChanges) {
        if (uiRegistry.renderInitBar) uiRegistry.renderInitBar();
      }
      if (hasConcentrationChanges && uiRegistry.renderConc) {
        uiRegistry.renderConc();
      }
      if (hasMetaChanges && uiRegistry.renderAll) {
        uiRegistry.renderAll();
      }
    });
  }
};

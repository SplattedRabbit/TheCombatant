/**
 * @module    dm-screen
 * @summary   Fassade für den Dungeon Master Screen. Re-exportiert alle Rendering- und Steuerungs-Funktionen aus den Submodulen.
 * @exports   updateCombatantHPDisplay, renderRows, renderConc, buildCondRefGrid, openRef, closeRefDirect, renderDMScreen
 * @reads     state
 * @stateOps  keine
 * @depends   DMHeader, DMCombatantsTable, DMToolbox, uiRegistry
 * @notHere   Inhaltliche Rendering-Details → js/ui/components/dm/
 */

import { renderDMHeader } from './dm/DMHeader.js';
import { renderRows, updateCombatantHPDisplay } from './dm/DMCombatantsTable.js';
import { renderConc, buildCondRefGrid, openRef, closeRefDirect, updateDMMessageTargetDropdown } from './dm/DMToolbox.js';
import { uiRegistry } from '../ui-shared.js';

// Re-export functions for legacy and external callers
export {
  updateCombatantHPDisplay,
  renderRows,
  renderConc,
  buildCondRefGrid,
  openRef,
  closeRefDirect,
  updateDMMessageTargetDropdown
};

/**
 * Main render entry point for the Dungeon Master Screen
 * @param {Object} state - The global combat state
 */
export function renderDMScreen(state) {
  renderDMHeader(state);
  uiRegistry.renderInitBar();
  renderRows('p');
  renderRows('e');
  updateDMMessageTargetDropdown(state);
}

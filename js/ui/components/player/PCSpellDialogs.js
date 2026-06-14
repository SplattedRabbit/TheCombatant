/**
 * @module    PCSpellDialogs
 * @summary   Facade/test fallback for PCSpellDialogs. Delegates to React bridge.
 */

import { cleanProhibitedSpells } from '../../../rules/SpellRules.js';

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export { cleanProhibitedSpells };

export function showSpellDetailsDialog(spell, spellKey, pc) {
  const bridge = getBridge();
  if (bridge && bridge.showSpellDetailsDialog) {
    return bridge.showSpellDetailsDialog(spell, spellKey, pc);
  }
  console.log('showSpellDetailsDialog stub called');
}

export function showSpellCreatorWizard(pc) {
  const bridge = getBridge();
  if (bridge && bridge.showSpellCreatorWizard) {
    return bridge.showSpellCreatorWizard(pc);
  }
  console.log('showSpellCreatorWizard stub called');
}

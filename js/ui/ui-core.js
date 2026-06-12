import { CombatState } from '../state.js';
import { uiRegistry } from './ui-shared.js';

// Import sub-component renderers
import { 
  showCustomAlert, 
  showCustomConfirm, 
  showAttackChoiceDialog, 
  showDamageChoiceDialog, 
  showSessionModal, 
  showRollBreakdown 
} from './components/dialogs.js';

import { 
  updateActiveTurnUI, 
  renderInitBar 
} from './components/init-bar.js';

import { 
  updateCombatantHPDisplay, 
  renderRows, 
  renderConc, 
  buildCondRefGrid, 
  openRef, 
  closeRefDirect, 
  renderDMScreen 
} from './components/dm-screen.js';

import { 
  renderPlayerScreen 
} from './components/player-sheet.js';

/**
 * Initializes global event handlers or UI-wide structures
 */
export function initUI() {
  // Empty placeholder to fulfill interface requirements
}

/**
 * Renders the entire screen based on active mode (choice overlay vs. DM vs. Player)
 */
export function renderAll() {
  const state = CombatState.getState();
  const mode = state.mode; // 'choice', 'dm', 'player'
  
  const roleOverlay = document.getElementById('roleOverlay');
  const dmSheet = document.querySelector('.sheet');
  const playerScreen = document.getElementById('playerScreen');
  const footerContainer = document.querySelector('button#btnPrint')?.parentElement;

  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.style.display = (mode === 'player') ? 'inline-block' : 'none';
  }

  if (mode === 'choice') {
    if (roleOverlay) roleOverlay.style.display = 'flex';
    if (dmSheet) dmSheet.style.display = 'none';
    if (playerScreen) playerScreen.style.display = 'none';
    if (footerContainer) footerContainer.style.display = 'none';
  } else if (mode === 'player') {
    if (roleOverlay) roleOverlay.style.display = 'none';
    if (dmSheet) dmSheet.style.display = 'none';
    if (playerScreen) playerScreen.style.display = 'block';
    if (footerContainer) footerContainer.style.display = 'flex';
    renderPlayerScreen();
  } else {
    // dm mode
    if (roleOverlay) roleOverlay.style.display = 'none';
    if (dmSheet) dmSheet.style.display = 'block';
    if (playerScreen) playerScreen.style.display = 'none';
    if (footerContainer) footerContainer.style.display = 'flex';
    
    renderDMScreen(state);
  }
}

// Populate the decoupled UI registry to break ES circular dependency loops
uiRegistry.renderAll = renderAll;
uiRegistry.renderPlayerScreen = renderPlayerScreen;
uiRegistry.renderInitBar = renderInitBar;
uiRegistry.renderConc = renderConc;

// Bundle all UI controls into the unified CombatUI export namespace
export const CombatUI = {
  updateCombatantHPDisplay,
  updateActiveTurnUI,
  renderInitBar,
  renderRows,
  renderConc,
  buildCondRefGrid,
  openRef,
  closeRefDirect,
  renderPlayerScreen,
  renderDMScreen,
  showCustomAlert,
  showCustomConfirm,
  showAttackChoiceDialog,
  showDamageChoiceDialog,
  showSessionModal,
  showRollBreakdown,
  initUI,
  renderAll
};

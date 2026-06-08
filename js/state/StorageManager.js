import { getState, StateEvents, getActivePC } from './state-core.js';
import { createInitialState, createCombatant, createConcentration } from '../models/model-core.js';

const STORAGE_KEY = 'dd_combatsheet_state';

export function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  } catch (e) {
    console.error('Failed to save combat state to localStorage:', e);
  }
}

export function loadFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return false;
    
    const loadedState = JSON.parse(rawData);
    if (!loadedState || !Array.isArray(loadedState.combatants)) return false;
    
    const s = getState();
    s.mode = 'choice'; // Force role selection overlay on startup/refresh as requested
    s.meta = { ...s.meta, ...(loadedState.meta || {}) };
    s.combatants = (loadedState.combatants || []).map(c => createCombatant(c));
    s.turn = typeof loadedState.turn === 'number' ? loadedState.turn : 0;
    s.round = typeof loadedState.round === 'number' ? loadedState.round : 1;
    s.concentrations = (loadedState.concentrations || []).map(c => createConcentration(c));
    
    // session persistence loading
    if (loadedState.session) {
      s.session.active = !!loadedState.session.active;
      s.session.role = loadedState.session.role || 'choice';
      s.session.roomCode = loadedState.session.roomCode || '';
    }

    return true;
  } catch (e) {
    console.error('Failed to parse combat state from localStorage:', e);
    return false;
  }
}

export function clearState() {
  const currentMode = getState().mode;
  const freshState = createInitialState();
  const s = getState();
  
  // Mutate the original reference in place
  Object.keys(freshState).forEach(key => {
    s[key] = freshState[key];
  });
  s.mode = currentMode;
  
  saveToStorage();
  StateEvents.emit('pc_changed', getActivePC());
  StateEvents.emit('state_changed', s);
}

import { getState, StateEvents, getActivePC } from './state-core.js';
import { createInitialState, createCombatant, createConcentration } from '../models/model-core.js';

const STORAGE_KEY = 'dd_combatsheet_state';

// Fallback synchronous local adapter for headless tests and pre-init
const defaultFallbackAdapter = {
  name: 'default-local',
  saveState(state) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to save combat state to localStorage:', e);
    }
  },
  loadState() {
    try {
      let rawData = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        rawData = window.localStorage.getItem(STORAGE_KEY);
      } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        rawData = globalThis.localStorage.getItem(STORAGE_KEY);
      }
      if (!rawData) return null;
      return JSON.parse(rawData);
    } catch (e) {
      console.error('Failed to parse combat state from localStorage:', e);
      return null;
    }
  },
  clearState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to clear state in storage:', e);
    }
  }
};

let activeAdapter = defaultFallbackAdapter;
const stateSaveListeners = new Set();

/**
 * Registers a callback invoked whenever saveToStorage is called.
 * @param {Function} listener
 * @returns {Function} unsubscribe
 */
export function onStateSave(listener) {
  if (typeof listener === 'function') {
    stateSaveListeners.add(listener);
    return () => stateSaveListeners.delete(listener);
  }
  return () => {};
}

/**
 * Registers an active storage adapter (e.g. LocalStorageAdapter, SupabaseStorageAdapter, or StorageService).
 * @param {object} adapter
 */
export function setStorageAdapter(adapter) {
  if (adapter && typeof adapter.saveState === 'function') {
    activeAdapter = adapter;
  }
}

/**
 * Returns the currently active storage adapter.
 * @returns {object}
 */
export function getStorageAdapter() {
  return activeAdapter;
}

/**
 * Hydrates the central in-memory state from a raw parsed state object.
 * Reconstructs combatants, concentrations, and session metadata.
 * @param {object} loadedState
 * @returns {boolean} true if hydration succeeded, false otherwise
 */
export function applyLoadedState(loadedState) {
  if (!loadedState || !Array.isArray(loadedState.combatants)) return false;

  try {
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

    StateEvents.emit('pc_changed', getActivePC());
    StateEvents.emit('state_changed', s);
    return true;
  } catch (e) {
    console.error('Failed to apply loaded state:', e);
    return false;
  }
}

/**
 * Saves current application state using the active storage adapter.
 */
export function saveToStorage() {
  try {
    const state = getState();
    activeAdapter.saveState(state);
    for (const listener of stateSaveListeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in stateSaveListener:', err);
      }
    }
  } catch (e) {
    console.error('Failed to save combat state:', e);
  }
}

/**
 * Loads and hydrates application state from the active storage adapter or optional provided data.
 * @param {object|null} [customState] Optional state object to apply directly
 * @returns {boolean|Promise<boolean>}
 */
export function loadFromStorage(customState = null) {
  if (customState) {
    return applyLoadedState(customState);
  }

  try {
    const res = activeAdapter.loadState();
    if (res instanceof Promise) {
      return res.then(data => {
        if (!data) return false;
        return applyLoadedState(data);
      }).catch(err => {
        console.error('Failed to asynchronously load from storage:', err);
        return false;
      });
    }

    if (!res) return false;
    return applyLoadedState(res);
  } catch (e) {
    console.error('Failed to load combat state from storage:', e);
    return false;
  }
}

/**
 * Resets application state and clears stored data.
 */
export function clearState() {
  const currentMode = getState().mode;
  const freshState = createInitialState();
  const s = getState();

  // Mutate the original reference in place
  Object.keys(freshState).forEach(key => {
    s[key] = freshState[key];
  });
  s.mode = currentMode;

  try {
    activeAdapter.clearState();
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }

  StateEvents.emit('pc_changed', getActivePC());
  StateEvents.emit('state_changed', s);
}

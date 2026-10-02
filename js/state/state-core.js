import { createInitialState, createCombatant } from '../models/model-core.js';

// The Single Source of Truth
let state = null;

// Simple Pub/Sub Event Bus
class CombatEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, cb) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(cb);
  }

  off(event, cb) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== cb);
    }
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

export const StateEvents = new CombatEventBus();

export function getState() {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

export function setRole(role) {
  const s = getState();
  s.mode = role;
  if (!s.session) s.session = {};
  s.session.role = (role === 'dm' || role === 'host') ? 'host' : (role === 'player' ? 'player' : role);
  StateEvents.emit('state_changed', s);
}

export function getRole() {
  return getState().mode;
}

const LOCAL_PC_STORAGE_KEY = 'dd_local_pc_id';

function getStoredLocalPCId() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(LOCAL_PC_STORAGE_KEY);
    } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage.getItem(LOCAL_PC_STORAGE_KEY);
    }
  } catch (_) {}
  return null;
}

function setStoredLocalPCId(id) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (id) {
        window.localStorage.setItem(LOCAL_PC_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(LOCAL_PC_STORAGE_KEY);
      }
    } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      if (id) {
        globalThis.localStorage.setItem(LOCAL_PC_STORAGE_KEY, id);
      } else {
        globalThis.localStorage.removeItem(LOCAL_PC_STORAGE_KEY);
      }
    }
  } catch (_) {}
}

let localPCId = null;

export function setLocalPCId(id) {
  localPCId = id;
  setStoredLocalPCId(id);
}

/**
 * Retrieves the active Player Character (PC) for the local player session.
 * @summary Returns the active PC combatant object, or null in DM/host mode.
 * @sideEffects If no PC exists in player mode, automatically creates a default initial
 *              character ('Adventurer') and broadcasts 'state_changed' to ensure the UI
 *              has a valid state snapshot without throwing unhandled null reference exceptions.
 * @returns {object|null} The active PC combatant or null for DM host.
 */
export function getActivePC() {
  const s = getState();
  
  const allPCs = (s.combatants || []).filter(c => c.type === 'p');
  const isMultiplayerClient = Boolean(s.session?.active && (s.session.role === 'client' || s.session.role === 'player'));

  if (!localPCId) {
    const storedId = getStoredLocalPCId();
    if (storedId && s.combatants.some(c => c.id === storedId)) {
      localPCId = storedId;
    }
  }

  // 1. Try matching by characterId if available in storage
  if (!localPCId && allPCs.length > 0) {
    let activeCharId = null;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) 
        ? window.localStorage 
        : ((typeof globalThis !== 'undefined' && globalThis.localStorage) ? globalThis.localStorage : null);
      if (storage) {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && k.startsWith('dnd_active_char_')) {
            activeCharId = storage.getItem(k);
            break;
          }
        }
      }
    } catch (_) {}

    if (activeCharId) {
      const matchingPC = allPCs.find(c => (c.characterId && c.characterId === activeCharId) || c.id === activeCharId);
      if (matchingPC) {
        localPCId = matchingPC.id;
        setStoredLocalPCId(localPCId);
      }
    }
  }

  // 2. Fallback to first PC if single PC or not in a live multiplayer session
  if (!localPCId && (allPCs.length === 1 || !isMultiplayerClient)) {
    if (allPCs.length > 0) {
      localPCId = allPCs[0].id;
      if (allPCs.length === 1) {
        setStoredLocalPCId(localPCId);
      }
    }
  }

  let pc = null;
  if (localPCId) {
    pc = s.combatants.find(c => c.id === localPCId);
  }
  
  if (!pc && (allPCs.length === 1 || !isMultiplayerClient)) {
    if (allPCs.length > 0) {
      pc = allPCs[0];
      localPCId = pc.id;
      if (allPCs.length === 1) {
        setStoredLocalPCId(localPCId);
      }
    }
  }

  if (!pc) {
    if (s.mode === 'dm' || s.mode === 'host' || (s.session && s.session.role === 'host')) {
      return null;
    }
    // If in multiplayer and local PC is not found among combatants, do NOT hijack another player's PC!
    if (isMultiplayerClient && allPCs.length > 1) {
      return null;
    }
    // Bootstrap safeguard: create default PC ONLY when combatants is completely empty
    pc = createCombatant({ name: 'Adventurer', type: 'p' });
    s.combatants.push(pc);
    localPCId = pc.id;
    setStoredLocalPCId(localPCId);
    StateEvents.emit('state_changed', s);
  }
  return pc;
}

export function updateSession(active, role, roomCode) {
  const s = getState();
  
  if (role === 'host') {
    if (localPCId) {
      const idx = s.combatants.findIndex(c => c.id === localPCId);
      if (idx !== -1) {
        s.combatants.splice(idx, 1);
      }
      localPCId = null;
      setStoredLocalPCId(null);
    }
  }

  s.session = {
    active: !!active,
    role: role || 'choice',
    roomCode: roomCode || '',
    connections: [],
    toJSON() {
      return {
        active: this.active,
        role: this.role,
        roomCode: this.roomCode
      };
    }
  };

  StateEvents.emit('session_changed', { active, role, roomCode });
  StateEvents.emit('state_changed', s);
}

// Legacy registration wrapper compatibility layers
export function registerStateChangedCallback(cb) {
  StateEvents.on('state_changed', cb);
}

export function registerPCChangedCallback(cb) {
  StateEvents.on('pc_changed', cb);
}

export function registerSessionChangedCallback(cb) {
  StateEvents.on('session_changed', (data) => {
    if (cb) cb(data.active, data.role, data.roomCode);
  });
}

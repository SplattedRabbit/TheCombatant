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

let localPCId = null;

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
  
  if (!localPCId) {
    const pc = s.combatants.find(c => c.type === 'p');
    if (pc) {
      localPCId = pc.id;
    }
  }

  let pc = null;
  if (localPCId) {
    pc = s.combatants.find(c => c.id === localPCId);
  }
  
  if (!pc) {
    pc = s.combatants.find(c => c.type === 'p');
    if (pc) {
      localPCId = pc.id;
    }
  }

  if (!pc) {
    if (s.mode === 'dm' || s.mode === 'host' || (s.session && s.session.role === 'host')) {
      return null;
    }
    // Bootstrap safeguard: create default PC to avoid circular import dependency on EncounterManager
    pc = createCombatant({ name: 'Adventurer', type: 'p' });
    s.combatants.push(pc);
    localPCId = pc.id;
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

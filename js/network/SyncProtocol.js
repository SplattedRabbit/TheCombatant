/**
 * @module    SyncProtocol
 * @summary   WebRTC-Delta-Sync zwischen Host (DM) und Clients (Spieler). Verarbeitet eingehende Pakete, berechnet Diffs, schützt lokalen PC vor Host-Überschreibung.
 * @exports   getObjectDiff, applyObjectDiff, applyIncomingDelta, getPCStateDiff, getEncounterStateDiff, initializeCaches, clearCachedPCState
 * @reads     getState(), CombatState.getActivePC()
 * @stateOps  Ruft EncounterManager.mergeIncomingPC, EncounterManager.applyDamage auf
 * @depends   CombatState (state.js), state-core, EncounterManager, model-core, DeltaRenderer, NetworkManager
 * @notHere   Verbindungsaufbau → NetworkManager.js | DOM-Updates → DeltaRenderer.js | PC-Mutationen → PCManager.js
 */
import { CombatState } from '../state.js';
import { getState, StateEvents } from '../state/state-core.js';
import * as EncounterManager from '../state/EncounterManager.js';
import { Stat, createCombatant, createConcentration } from '../models/model-core.js';
import { DeltaRenderer } from './DeltaRenderer.js';
import { uiRegistry } from '../ui/ui-shared.js';
import { showCustomAlert } from '../ui/components/dialogs.js';

export const SYNC_PROTOCOL_VERSION = '2.0.0';

// Global flag to prevent circular network echoes when applying incoming changes
export let isProcessingNetworkIncoming = false;

// Cached copies of the last synced states to compute changes (deltas)
let cachedPCState = null;
let cachedEncounterState = null;

/**
 * deepClone - Helper to clone state objects safely for caching
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Stat) {
    return { base: obj.base };
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const clone = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'function' || key === 'connections' || key === 'session') {
        continue;
      }
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

/**
 * getObjectDiff - Computes path-based diffs between two objects, ignoring HP-related fields
 */
export function getObjectDiff(oldObj, newObj, path = '') {
  const diffs = {};
  const isObject = val => val && typeof val === 'object';

  if (typeof oldObj !== typeof newObj) {
    diffs[path] = newObj;
    return diffs;
  }

  if (!isObject(newObj)) {
    if (oldObj !== newObj) {
      diffs[path] = newObj;
    }
    return diffs;
  }

  if (Array.isArray(newObj)) {
    if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
      diffs[path] = newObj;
    }
    return diffs;
  }

  const oldKeys = Object.keys(oldObj || {});
  const newKeys = Object.keys(newObj || {});

  // Identify removed keys
  for (const key of oldKeys) {
    if (!(key in newObj)) {
      diffs[path ? `${path}.${key}` : key] = null;
    }
  }

  // Identify added or modified keys
  for (const key of newKeys) {
    const subPath = path ? `${path}.${key}` : key;
    const oldVal = oldObj ? oldObj[key] : undefined;
    const newVal = newObj[key];

    // Ignore HP fields in the auto-diff because they are synced via relative events (Option B)
    if (key === 'hp' || key === 'tempHP' || key === 'hp-relative') {
      continue;
    }

    if (isObject(newVal)) {
      if (newVal instanceof Stat || (newVal && newVal.base !== undefined)) {
        const oldNum = oldVal ? (typeof oldVal === 'object' ? oldVal.base : oldVal) : 0;
        const newNum = newVal.base;
        if (oldNum !== newNum) {
          diffs[subPath] = { base: newNum };
        }
      } else {
        const subDiff = getObjectDiff(oldVal, newVal, subPath);
        Object.assign(diffs, subDiff);
      }
    } else {
      if (oldVal !== newVal) {
        diffs[subPath] = newVal;
      }
    }
  }

  return diffs;
}

/**
 * applyObjectDiff - Applies path-based diffs to a target object
 */
export function applyObjectDiff(target, diff) {
  for (const [path, value] of Object.entries(diff)) {
    const parts = path.split('.');
    let curr = target;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in curr) || curr[part] === null) {
        curr[part] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      curr = curr[part];
    }
    
    const lastKey = parts[parts.length - 1];
    let hydratedValue = value;

    // Check if we are replacing the entire combatants array
    if (lastKey === 'combatants' && Array.isArray(value)) {
      hydratedValue = value.map(c => createCombatant(c));
    }
    // Check if we are replacing the entire concentrations array
    else if (lastKey === 'concentrations' && Array.isArray(value)) {
      hydratedValue = value.map(c => createConcentration(c));
    }
    // Check if we are inserting/replacing a combatant in the array
    else if (parts[0] === 'combatants' && parts.length === 2 && value !== null) {
      hydratedValue = createCombatant(value);
    } 
    // Check if we are inserting a concentration in the array
    else if (parts[0] === 'concentrations' && parts.length === 2 && value !== null) {
      hydratedValue = createConcentration(value);
    }
    // Check if we are setting a Stat object directly
    else if (value && typeof value === 'object' && value.base !== undefined) {
      const statFields = [
        'ac', 'acTouch', 'acFlat', 'str', 'dex', 'con', 'int', 'wis', 'cha',
        'baseZa', 'baseRef', 'baseWil', 'bab', 'za', 'ref', 'wil'
      ];
      const isStatField = statFields.includes(lastKey) || 
        (parts[0] === 'combatants' && parts.length === 3 && statFields.includes(lastKey));
        
      if (isStatField) {
        hydratedValue = new Stat(value);
      }
    }
    
    if (value === null) {
      if (Array.isArray(curr)) {
        curr.splice(Number(lastKey), 1);
      } else {
        delete curr[lastKey];
      }
    } else if (curr[lastKey] instanceof Stat && hydratedValue instanceof Stat) {
      curr[lastKey].base = hydratedValue.base;
    } else {
      curr[lastKey] = hydratedValue;
    }
  }
}

/**
 * initializeCaches - Seed cache objects with current state to prevent initial full-diff flood
 */
export function initializeCaches() {
  const state = getState();
  cachedEncounterState = {
    meta: deepClone(state.meta),
    combatants: deepClone(state.combatants),
    turn: state.turn,
    round: state.round,
    concentrations: deepClone(state.concentrations)
  };

  // Only cache PC state for clients — hosts don't have a local PC
  if (state.session && state.session.role === 'client') {
    const pc = CombatState.getActivePC();
    if (pc) {
      cachedPCState = deepClone(pc);
    }
  }
}

export function clearCachedPCState() {
  cachedPCState = null;
}

/**
 * getPCStateDiff - Generates a diff packet for client's PC state
 */
export function getPCStateDiff() {
  const pc = CombatState.getActivePC();
  if (!pc) return null;
  
  if (!cachedPCState || cachedPCState.id !== pc.id || cachedPCState.name !== pc.name || cachedPCState.maxHP !== pc.maxHP) {
    cachedPCState = deepClone(pc);
    return {
      type: 'update_pc',
      pc: pc
    };
  }

  const diff = getObjectDiff(cachedPCState, pc);
  
  // Explicitly sync HP when it changes
  if (cachedPCState.hp !== pc.hp) {
    diff.hp = pc.hp;
  }
  if (cachedPCState.init !== pc.init) {
    diff.init = pc.init;
  }
  if (cachedPCState.rawInit !== pc.rawInit) {
    diff.rawInit = pc.rawInit;
  }

  cachedPCState = deepClone(pc);

  if (Object.keys(diff).length === 0) return null;

  return {
    type: 'pc_diff',
    id: pc.id,
    diff
  };
}

/**
 * getEncounterStateDiff - Generates a diff packet for DM's board state
 */
export function getEncounterStateDiff() {
  const state = getState();
  const currentEncounter = {
    meta: deepClone(state.meta),
    combatants: deepClone(state.combatants),
    turn: state.turn,
    round: state.round,
    concentrations: deepClone(state.concentrations)
  };

  if (!cachedEncounterState) {
    cachedEncounterState = currentEncounter;
    return null; // Initialized
  }

  const diff = getObjectDiff(cachedEncounterState, currentEncounter);
  cachedEncounterState = currentEncounter;

  if (Object.keys(diff).length === 0) return null;

  return {
    type: 'state_diff',
    diff
  };
}

/**
 * applyIncomingDelta - Entry point for processing network packets (Option B)
 */
export function applyIncomingDelta(packet, role, conn = null) {
  isProcessingNetworkIncoming = true;
  
  try {
    const s = getState();

    // 1. Version Handshake
    if (packet.type === 'hello') {
      if (packet.version !== SYNC_PROTOCOL_VERSION) {
        if (role === 'client') {
          showCustomAlert(
            'Versionskonflikt',
            `Der Spielleiter nutzt eine andere Version (v${packet.version}). Bitte lade deine Seite neu (F5), um die kompatible Version zu laden.`,
            'Jetzt neu laden 🔄',
            '⚠️',
            () => { window.location.reload(); }
          );
        } else if (role === 'host') {
          showCustomAlert(
            'Version-Mismatch',
            `Ein Spieler mit einer inkompatiblen Version (v${packet.version}) hat sich verbunden. Bitte weise ihn an, seine Seite neu zu laden.`,
            'Schließen',
            '⚠️'
          );
        }
      }
      return;
    }

    // 2. Relative HP changes (Option B)
    if (packet.type === 'hp_change') {
      const c = s.combatants.find(x => x.id === packet.id);
      if (c) {
        EncounterManager.applyDamage(packet.id, Math.abs(packet.delta), packet.isHeal);
        DeltaRenderer.updateCombatantHP(packet.id);
      }
      return;
    }

    // 3. Client PC Diff applying on Host
    if (packet.type === 'pc_diff' && role === 'host') {
      const c = s.combatants.find(x => x.id === packet.id);
      if (c) {
        applyObjectDiff(c, packet.diff);
        if (typeof c.rebuildStatModifiers === 'function') {
          c.rebuildStatModifiers();
        }
        DeltaRenderer.updateCombatantNameAndStats(packet.id, packet.diff);
        
        StateEvents.emit('state_changed', s);

        // Propagate diff to all other clients so they see the changes in real-time
        import('./NetworkManager.js').then(({ broadcastToClients }) => {
          broadcastToClients(packet);
        });
      } else {
        // Player not found on DM screen (e.g. DM deleted them, or disconnect occurred)
        // Request the client to send their full PC state to restore them on the board
        if (conn && typeof conn.send === 'function') {
          try {
            conn.send({ type: 'full_pc_request', id: packet.id });
          } catch (e) {
            console.error('SyncProtocol: Failed to request full PC recovery:', e);
          }
        }
      }
      return;
    }

    // 3b. Client registers/replaces entire PC on Host
    if (packet.type === 'update_pc' && role === 'host') {
      const success = EncounterManager.mergeIncomingPC(packet.pc);
      if (success) {
        StateEvents.emit('state_changed', s);
        if (uiRegistry.renderInitBar) uiRegistry.renderInitBar();
        if (uiRegistry.renderAll) uiRegistry.renderAll();
        // Propagate registration to all other clients
        import('./NetworkManager.js').then(({ broadcastToClients }) => {
          broadcastToClients(packet);
        });
      }
      return;
    }

    // 3c. Host requests full PC recovery from Client
    if (packet.type === 'full_pc_request' && role === 'client') {
      const activePC = CombatState.getActivePC();
      if (activePC && activePC.id === packet.id) {
        import('./NetworkManager.js').then(({ sendToHost }) => {
          sendToHost({
            type: 'update_pc',
            pc: activePC
          });
        });
      }
      return;
    }

    // 3d. DM Message received on Client
    if (packet.type === 'dm_message' && role === 'client') {
      const activePC = CombatState.getActivePC();
      if (packet.targetPCId === 'all' || (activePC && activePC.id === packet.targetPCId)) {
        import('../ui/dialogs/BaseDialogs.js').then(({ showParchmentMessage }) => {
          showParchmentMessage(packet.text, 'Spielleiter');
        });
      }
      return;
    }

    // 4. Host Board Diff applying on Client
    if (packet.type === 'state_diff' && role === 'client') {
      const activePC = CombatState.getActivePC();
      const backupPC = activePC ? deepClone(activePC) : null;

      applyObjectDiff(s, packet.diff);

      // Safeguard: Ensure the player's own active PC is never deleted by host diffs
      if (backupPC && !s.combatants.some(c => c.id === backupPC.id)) {
        console.warn('SyncProtocol: Host diff attempted to delete local PC. Restoring local PC.');
        s.combatants.push(createCombatant(backupPC));
        
        // Re-register it on the host to self-heal
        import('./NetworkManager.js').then(({ sendToHost }) => {
          sendToHost({
            type: 'update_pc',
            pc: CombatState.getActivePC()
          });
        });
      }

      // Rebuild modifiers on all client combatants to keep total AC / Saves in perfect sync
      s.combatants.forEach(c => {
        if (typeof c.rebuildStatModifiers === 'function') {
          c.rebuildStatModifiers();
        }
      });

      StateEvents.emit('state_changed', s);

      DeltaRenderer.applyBoardDiffUI(packet.diff);
      return;
    }

    // 4b. Sync other player's full PC on Client board
    if (packet.type === 'update_pc' && role === 'client') {
      const activePC = CombatState.getActivePC();
      if (activePC && activePC.id === packet.pc.id) {
        return; // Don't overwrite local PC sheet
      }
      const success = EncounterManager.mergeIncomingPC(packet.pc);
      if (success) {
        s.combatants.forEach(c => {
          if (typeof c.rebuildStatModifiers === 'function') {
            c.rebuildStatModifiers();
          }
        });
        StateEvents.emit('state_changed', s);
        if (uiRegistry.renderInitBar) uiRegistry.renderInitBar();
        if (uiRegistry.renderPlayerScreen) uiRegistry.renderPlayerScreen();
      }
      return;
    }

    // 5. Full state Sync Request (e.g. initial connection or recovery)
    if (packet.type === 'full_sync_request' && role === 'host') {
      import('./NetworkManager.js').then(({ sendEncounterStateToClient }) => {
        // Find connection for client
        const activeConnections = s.session.connections;
        const matchingConn = activeConnections.find(conn => conn.peer === packet.peerId);
        if (matchingConn) {
          sendEncounterStateToClient(matchingConn);
        }
      });
      return;
    }

    // 6. Full sync response from Host (Initial sync)
    if (packet.type === 'full_sync_response' && role === 'client') {
      CombatState.importEncounterState(packet.state, true);
      initializeCaches();
      if (uiRegistry.renderAll) uiRegistry.renderAll();
      if (uiRegistry.renderConc) uiRegistry.renderConc();
      return;
    }

  } catch (error) {
    console.error('Error applying incoming network delta:', error, packet);
  } finally {
    isProcessingNetworkIncoming = false;
  }
}

// Listen to internal HP changes to broadcast them relatively
StateEvents.on('hp_changed', ({ id, delta, isHeal }) => {
  if (isProcessingNetworkIncoming) return;

  const s = getState();
  const packet = { type: 'hp_change', id, delta, isHeal };

  import('./NetworkManager.js').then(({ broadcastToClients, sendToHost }) => {
    if (s.session && s.session.role === 'host') {
      broadcastToClients(packet);
    } else if (s.session && s.session.role === 'client') {
      sendToHost(packet);
    }
  });
});

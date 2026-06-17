/**
 * @module    EncounterManager
 * @summary   Combat state coordinator (turns, rounds, initiative, metadata, state loading, and merge).
 *            Re-exports modular operations from ConditionManager, ConcentrationManager, and EncounterSamples.
 * @exports   updateMeta, addCombatant, removeCombatant, sortCombatants, updateCombatantField, updateCombatantNumber, nextTurn, prevTurn, nextRound, resetCombat, importEncounterState, mergeIncomingPC, triggerSync
 * @reads     s.combatants, s.turn, s.round, s.concentrations
 * @stateOps  Updates meta, combatants, turn, round, concentrations, companion/familiar syncs
 * @depends   state-core, StorageManager, model-core, ConditionManager
 */

import { getState, getActivePC, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { createCombatant, createConcentration, Stat } from '../models/model-core.js';
import { tickConditionTimers } from './ConditionManager.js';

// Re-export modular functions for 100% backward-compatibility
export { addConcentration, removeConcentration, updateConcentrationField } from './ConcentrationManager.js';
export { toggleCondition, setConditionDuration, tickConditionTimers, applyDamage, applyTempHP } from './ConditionManager.js';
export { loadSampleData } from './EncounterSamples.js';

export function triggerSync(mutatedCombatant) {
  saveToStorage();
  
  if (mutatedCombatant) {
    const s = getState();
    if (mutatedCombatant.id.endsWith('-companion')) {
      const ownerId = mutatedCombatant.id.replace('-companion', '');
      const owner = s.combatants.find(x => x.id === ownerId);
      if (owner) {
        owner.companionHP = mutatedCombatant.hp;
        owner.companionMaxHP = mutatedCombatant.maxHP;
        owner.companionName = mutatedCombatant.name;
        StateEvents.emit('pc_changed', owner);
      }
    } else if (mutatedCombatant.id.endsWith('-familiar')) {
      const ownerId = mutatedCombatant.id.replace('-familiar', '');
      const owner = s.combatants.find(x => x.id === ownerId);
      if (owner) {
        owner.familiarHP = mutatedCombatant.hp;
        owner.familiarName = mutatedCombatant.name;
        StateEvents.emit('pc_changed', owner);
      }
    }
  }

  StateEvents.emit('state_changed', getState());
  if (mutatedCombatant && mutatedCombatant.type === 'p') {
    StateEvents.emit('pc_changed', mutatedCombatant);
  }
}

export function updateMeta(key, val) {
  const s = getState();
  if (s.meta[key] !== undefined) {
    s.meta[key] = val;
    triggerSync();
  }
}

export function addCombatant(params) {
  const c = createCombatant(params);
  const s = getState();
  s.combatants.push(c);
  sortCombatants();
  triggerSync(c);
  return c;
}

export function removeCombatant(id) {
  const s = getState();
  s.combatants = s.combatants.filter(c => c.id !== id);
  if (s.turn >= s.combatants.length) {
    s.turn = 0;
  }
  triggerSync();
}

export function sortCombatants() {
  const s = getState();
  const activeId = s.combatants[s.turn] ? s.combatants[s.turn].id : null;
  s.combatants.sort((a, b) => b.init - a.init);
  if (activeId) {
    const newTurn = s.combatants.findIndex(x => x.id === activeId);
    if (newTurn !== -1) {
      s.turn = newTurn;
    }
  }
}

export function updateCombatantField(id, field, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (c && c[field] !== undefined) {
    c[field] = val;
    triggerSync(c);
  }
}

export function updateCombatantNumber(id, field, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c || c[field] === undefined) return;
  
  const num = parseInt(val) || 0;
  if (c[field] instanceof Stat) {
    const modifiers = c[field].getValue() - c[field].base;
    c[field].base = num - modifiers;
  } else {
    const oldVal = c[field];
    if (field === 'bw') {
      c.baseBw = num - ((c.bw || 30) - (c.baseBw || 30));
      c.bw = num;
      if (typeof c.rebuildStatModifiers === 'function') {
        c.rebuildStatModifiers();
      }
    } else {
      c[field] = num;
    }
    if (field === 'hp') {
      c[field] = Math.max(-99, Math.min(c.maxHP, c[field]));
      const delta = c.hp - oldVal;
      if (delta !== 0) {
        StateEvents.emit('hp_changed', { id, delta, isHeal: delta > 0 });
      }
    }
  }
  if (field === 'maxHP') {
    c.hp = Math.min(c.hp, c.maxHP);
  }
  triggerSync(c);
}

export function nextTurn() {
  const s = getState();
  if (!s.combatants.length) return;
  s.turn = (s.turn + 1) % s.combatants.length;
  
  if (s.turn === 0) {
    s.round++;
    tickConditionTimers();
    s.concentrations.forEach(c => {
      if (c.dur > 0) c.dur--;
    });
  }
  triggerSync();
}

export function prevTurn() {
  const s = getState();
  if (!s.combatants.length) return;
  s.turn = (s.turn - 1 + s.combatants.length) % s.combatants.length;
  triggerSync();
}

export function nextRound() {
  const s = getState();
  s.round++;
  s.turn = 0;
  tickConditionTimers();
  s.concentrations.forEach(c => {
    if (c.dur > 0) c.dur--;
  });
  triggerSync();
}

export function resetCombat() {
  const s = getState();
  s.turn = 0;
  s.round = 1;
  triggerSync();
}

export function importEncounterState(loadedState, isNetworkSync = false) {
  const s = getState();
  
  if (s.session && s.session.role === 'client') {
    if (isNetworkSync) {
      let localPC = s.combatants.find(c => c.type === 'p');
      
      s.meta = { ...s.meta, ...(loadedState.meta || {}) };
      s.combatants = (loadedState.combatants || []).map(c => createCombatant(c));
      s.turn = typeof loadedState.turn === 'number' ? loadedState.turn : 0;
      s.round = typeof loadedState.round === 'number' ? loadedState.round : 1;
      s.concentrations = (loadedState.concentrations || []).map(c => createConcentration(c));
      
      if (localPC && !s.combatants.some(c => c.id === localPC.id)) {
        s.combatants.push(localPC);
        StateEvents.emit('pc_changed', localPC);
      }
      triggerSync();
    } else {
      const importedPC = (loadedState.combatants || []).find(c => c.type === 'p');
      if (importedPC) {
        const currentPC = getActivePC();
        if (currentPC) {
          const currentId = currentPC.id;
          
          Object.keys(currentPC).forEach(key => {
            if (key !== 'id') {
              delete currentPC[key];
            }
          });
          
          const newPC = createCombatant(importedPC);
          Object.assign(currentPC, newPC);
          currentPC.id = currentId;
          
          if (typeof currentPC.rebuildStatModifiers === 'function') {
            currentPC.rebuildStatModifiers();
          }
          saveToStorage();
          StateEvents.emit('pc_changed', currentPC, { forceFullSync: true });
          StateEvents.emit('state_changed', s);
        }
      }
    }
  } else {
    s.meta = { ...s.meta, ...(loadedState.meta || {}) };
    s.combatants = (loadedState.combatants || []).map(c => createCombatant(c));
    s.turn = typeof loadedState.turn === 'number' ? loadedState.turn : 0;
    s.round = typeof loadedState.round === 'number' ? loadedState.round : 1;
    s.concentrations = (loadedState.concentrations || []).map(c => createConcentration(c));
    triggerSync();
  }
}

export function mergeIncomingPC(pcData) {
  const s = getState();
  const idx = s.combatants.findIndex(x => x.id === pcData.id);
  if (idx !== -1) {
    s.combatants[idx] = createCombatant(pcData);
  } else {
    s.combatants.push(createCombatant(pcData));
  }

  // Also, update the companion and/or familiar if they exist in state.combatants!
  const companionIdx = s.combatants.findIndex(x => x.id === `${pcData.id}-companion`);
  if (companionIdx !== -1) {
    const comp = s.combatants[companionIdx];
    comp.name = pcData.companionName || comp.name;
    if (pcData.companionMaxHP !== undefined) {
      comp.maxHP = pcData.companionMaxHP;
    }
    if (pcData.companionHP !== undefined) {
      comp.hp = pcData.companionHP;
    }
  }

  const familiarIdx = s.combatants.findIndex(x => x.id === `${pcData.id}-familiar`);
  if (familiarIdx !== -1) {
    const fam = s.combatants[familiarIdx];
    fam.name = pcData.familiarName || fam.name;
    const ownerMaxHP = pcData.maxHP || 10;
    const maxHP = Math.floor(ownerMaxHP / 2);
    fam.maxHP = maxHP;
    if (pcData.familiarHP !== undefined) {
      fam.hp = Math.min(maxHP, pcData.familiarHP);
    }
  }

  sortCombatants();
  saveToStorage();
  return true;
}
